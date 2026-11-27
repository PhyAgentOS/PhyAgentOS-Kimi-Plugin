import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, symlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { CORE, patchPaths, prepareCompatibility, updateWorkspace } from '../scripts/core-upgrade.mjs'
import { assessUpdate, BUNDLE, metadata, parseArgs, REGISTRY, resolveUpstream, SKILL } from '../scripts/sync-dsh.mjs'
import { applyCompatibility } from '../src/runtime-compatibility.mjs'
import { resolveCore } from '../src/core-resolution.mjs'

const record = (bundle = '0.2.2', skill = '0.2.2', core = '0.2.2') => ({
  registry: REGISTRY, packages: { [BUNDLE]: bundle, [SKILL]: skill, [CORE]: core },
})
const fixtureFetch = versions => async url => {
  const [, name, version] = new URL(url).pathname.split('/')
  const pkg = decodeURIComponent(name)
  const data = versions[pkg]
  assert.ok(data, `Unexpected metadata request: ${pkg}`)
  assert.equal(version, pkg === BUNDLE ? 'latest' : data.version)
  return { ok: true, json: async () => ({ name: pkg, ...data }) }
}

function installedChain(root) {
  const directories = {}
  let parent = root
  for (const [name, version, dependencies] of [
    [BUNDLE, '0.4.0', { [SKILL]: '0.3.1' }],
    [SKILL, '0.3.1', { [CORE]: '0.2.3' }],
    [CORE, '0.2.3', {}],
  ]) {
    const directory = join(parent, 'node_modules', name)
    mkdirSync(join(directory, 'lib'), { recursive: true })
    writeFileSync(join(directory, 'package.json'), JSON.stringify({ name, version, dependencies, main: 'lib/index.js' }))
    writeFileSync(join(directory, 'lib/index.js'), 'throw new Error("package entry must not execute during resolution");\n')
    directories[name] = directory
    parent = directory
  }
  writeFileSync(join(root, 'package.json'), JSON.stringify({ dependencies: { [BUNDLE]: '0.4.0' } }))
  return directories
}

test('nested installed DSH chain resolves its Core without executing hosts or selecting unrelated hoisted Core', t => {
  const root = mkdtempSync(join(tmpdir(), 'kimi-core-resolution-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const directories = installedChain(root)
  const hoisted = join(root, 'node_modules', CORE)
  mkdirSync(hoisted, { recursive: true })
  writeFileSync(join(hoisted, 'package.json'), JSON.stringify({ name: CORE, version: '9.9.9' }))
  assert.deepEqual(resolveCore(join(root, 'package.json')), {
    packages: record('0.4.0', '0.3.1', '0.2.3').packages,
    directory: realpathSync(directories[CORE]),
    entry: join(realpathSync(directories[CORE]), 'lib/index.js'),
  })
})

test('installed DSH resolver rejects mismatches, ranged dependencies and invalid package identities or versions', t => {
  const root = mkdtempSync(join(tmpdir(), 'kimi-core-chain-invalid-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const directories = installedChain(root)
  const anchor = join(root, 'package.json')
  for (const [name, mutation, error] of [
    [BUNDLE, { dependencies: { [SKILL]: '0.3.2' } }, /dependency chain mismatch/],
    [BUNDLE, { dependencies: { [SKILL]: '^0.3.1' } }, /dependency chain mismatch/],
    [SKILL, { dependencies: { [CORE]: '0.2.4' } }, /dependency chain mismatch/],
    [SKILL, { dependencies: { [CORE]: '~0.2.3' } }, /dependency chain mismatch/],
    [CORE, { name: '@unrelated/core' }, /Invalid installed Forge package/],
    [CORE, { version: '0.2.3-rc.1' }, /Invalid installed Forge package/],
    [BUNDLE, { version: '01.4.0' }, /Invalid installed Forge package/],
  ]) {
    const path = join(directories[name], 'package.json')
    const original = readFileSync(path, 'utf8')
    writeFileSync(path, JSON.stringify({ ...JSON.parse(original), ...mutation }))
    assert.throws(() => resolveCore(anchor), error, JSON.stringify(mutation))
    writeFileSync(path, original)
  }
})

test('resolve actual dependency chain instead of assuming matching package versions', async () => {
  const result = await resolveUpstream('latest', fixtureFetch({
    [BUNDLE]: { version: '0.4.0', dependencies: { [SKILL]: '0.3.1' } },
    [SKILL]: { version: '0.3.1', dependencies: { [CORE]: '0.2.3' } },
    [CORE]: { version: '0.2.3' },
  }))
  assert.deepEqual(result, record('0.4.0', '0.3.1', '0.2.3'))
})

test('reject nonexact upstream dependencies and inconsistent registry metadata', async () => {
  for (const dependency of ['^0.2.3', 'latest', 'file:../skill', '0.3.0-rc.1']) {
    await assert.rejects(resolveUpstream('latest', fixtureFetch({
      [BUNDLE]: { version: '0.3.0', dependencies: { [SKILL]: dependency } },
    })), /exact stable/)
  }
  await assert.rejects(metadata(CORE, '0.2.3', async () => ({ ok: false, status: 404 })), /HTTP 404/)
  await assert.rejects(metadata(CORE, '0.2.3', async () => ({ ok: true, json: async () => ({ name: CORE, version: '0.2.4' }) })), /Unexpected/)
})

test('same release is a no-op; DSH-only release changes tracking without changing Core', () => {
  assert.deepEqual(assessUpdate(record(), record(), '0.2.2'), { updateAvailable: false, coreChanged: false })
  assert.deepEqual(assessUpdate(record(), record('0.2.3'), '0.2.2'), { updateAvailable: true, coreChanged: false })
  assert.deepEqual(assessUpdate(record(), record('0.3.0', '0.3.0', '0.2.3'), '0.2.2'), { updateAvailable: true, coreChanged: true })
  assert.throws(() => assessUpdate(record(), record('0.2.1'), '0.2.2'), /downgrade/)
  assert.deepEqual(assessUpdate(record(), record(), '0.2.1'), { updateAvailable: true, coreChanged: true })
  assert.throws(() => assessUpdate(record(), record(), '0.2.3'), /downgrade/)
})

test('CLI accepts pinned DSH version and check but rejects malformed input', () => {
  assert.deepEqual(parseArgs(['--', '--check', '--version', '0.3.0']), { check: true, version: '0.3.0' })
  for (const args of [['--version'], ['--version', 'latest'], ['--version', '0.3.0-rc.1'], ['--unknown']]) {
    assert.throws(() => parseArgs(args), /Usage/)
  }
})

test('rebased patch and regenerated hashes work with the real runtime patcher', async t => {
  const root = mkdtempSync(join(tmpdir(), 'kimi-sync-test-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const original = 'export const value = 1;\n'
  const patch = 'diff --git a/lib/index.js b/lib/index.js\n--- a/lib/index.js\n+++ b/lib/index.js\n@@ -1 +1 @@\n-export const value = 1;\n+export const value = 2;\n'
  mkdirSync(join(root, 'a/lib'), { recursive: true })
  writeFileSync(join(root, 'a/lib/index.js'), original)
  writeFileSync(join(root, 'a/package.json'), JSON.stringify({ name: CORE, version: '0.2.3' }))
  const prepared = prepareCompatibility(join(root, 'a'), join(root, 'b'), patch, '0.2.3', root)
  assert.deepEqual(patchPaths(prepared.patch), ['lib/index.js'])
  const runtime = join(root, 'runtime')
  const directories = installedChain(runtime)
  const originalCore = join(directories[CORE], 'lib/index.js')
  writeFileSync(originalCore, original)
  writeFileSync(join(runtime, 'core.patch'), prepared.patch)
  writeFileSync(join(runtime, 'compatibility.json'), JSON.stringify(prepared.compatibility))
  await applyCompatibility(runtime)
  assert.equal(readFileSync(join(runtime, 'compat-core/lib/index.js'), 'utf8'), 'export const value = 2;\n')
  assert.equal(readFileSync(originalCore, 'utf8'), original)
})

for (const aliased of [false, true]) test(`compatibility dependency bridge preserves CommonJS exports after relocation (${aliased ? 'directory alias' : 'direct path'})`, async t => {
  const work = mkdtempSync(join(tmpdir(), 'kimi-compat-cjs-'))
  t.after(() => rmSync(work, { recursive: true, force: true }))
  const actual = join(realpathSync(work), 'actual')
  mkdirSync(actual)
  const alias = join(work, 'alias')
  if (aliased) symlinkSync(actual, alias, process.platform === 'win32' ? 'junction' : 'dir')
  const root = join(aliased ? alias : actual, 'runtime.staging')
  mkdirSync(root)
  const directories = installedChain(root)
  const core = directories[CORE]
  writeFileSync(join(core, 'package.json'), JSON.stringify({ name: CORE, version: '0.2.3', type: 'module', dependencies: { 'archive-fixture': '1.0.0' } }))
  const dependency = join(core, 'node_modules/archive-fixture')
  mkdirSync(dependency, { recursive: true })
  writeFileSync(join(dependency, 'package.json'), JSON.stringify({ name: 'archive-fixture', version: '1.0.0', main: 'index.cjs' }))
  writeFileSync(join(dependency, 'index.cjs'), 'module.exports = Object.fromEntries([["c", () => "created"]]);\n')
  const original = 'import archive, { c } from "archive-fixture";\nexport const result = [c(), archive.c()];\n'
  writeFileSync(join(core, 'lib/index.js'), original)
  writeFileSync(join(root, 'core.patch'), '')
  writeFileSync(join(root, 'compatibility.json'), JSON.stringify({ version: '0.2.3', patchSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', files: {} }))
  await applyCompatibility(root)
  const ready = join(actual, 'runtime.ready')
  const bridge = readFileSync(join(root, 'compat-core/node_modules/archive-fixture/index.mjs'), 'utf8')
  assert.doesNotMatch(bridge, /runtime\.staging/)
  renameSync(root, ready)
  const { result } = JSON.parse(execFileSync(process.execPath, [
    '--input-type=module', '-e',
    `const module = await import(${JSON.stringify(pathToFileURL(join(ready, 'compat-core/lib/index.js')).href)}); console.log(JSON.stringify(module));`,
  ], { encoding: 'utf8' }))
  assert.deepEqual(result, ['created', 'created'])
  assert.equal(readFileSync(join(ready, 'node_modules', BUNDLE, 'node_modules', SKILL, 'node_modules', CORE, 'lib/index.js'), 'utf8'), original)
})

test('compatibility generation ignores inherited Git CRLF conversion', () => {
  execFileSync(process.execPath, [
    '--test', '--test-name-pattern=^rebased patch and regenerated hashes',
    fileURLToPath(new URL('./dsh-sync.test.mjs', import.meta.url)),
  ], {
    env: {
      ...process.env,
      GIT_CONFIG_COUNT: '2',
      GIT_CONFIG_KEY_0: 'core.autocrlf', GIT_CONFIG_VALUE_0: 'true',
      GIT_CONFIG_KEY_1: 'core.eol', GIT_CONFIG_VALUE_1: 'crlf',
    },
    stdio: 'pipe',
  })
})

test('patch conflicts fail without modifying pristine input; unsafe paths fail closed', t => {
  const root = mkdtempSync(join(tmpdir(), 'kimi-sync-conflict-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  mkdirSync(join(root, 'a/lib'), { recursive: true })
  writeFileSync(join(root, 'a/lib/index.js'), 'upstream changed\n')
  const patch = 'diff --git a/lib/index.js b/lib/index.js\n--- a/lib/index.js\n+++ b/lib/index.js\n@@ -1 +1 @@\n-old\n+new\n'
  assert.throws(() => prepareCompatibility(join(root, 'a'), join(root, 'b'), patch, '0.2.3', root))
  assert.equal(readFileSync(join(root, 'a/lib/index.js'), 'utf8'), 'upstream changed\n')
  assert.throws(() => patchPaths(patch.replaceAll('lib/index.js', '../index.js')), /Only modifications/)
  assert.throws(() => patchPaths(patch.replace('--- a/lib/index.js', '--- /dev/null')), /Only modifications/)
})

test('workspace updates remove release-age bypass and switch patch mapping', () => {
  const source = "virtualStoreDirMaxLength: 60\nminimumReleaseAgeExclude:\n  - '@x-era/forge-core@0.2.2'\npatchedDependencies:\n  '@x-era/forge-core@0.2.2': patches/@x-era__forge-core@0.2.2.patch\n"
  const result = updateWorkspace(source, '0.2.2', '0.2.3', true)
  assert.doesNotMatch(result, /minimumReleaseAgeExclude|0\.2\.2/)
  assert.match(result, /'@x-era\/forge-core@0.2.3': patches\/@x-era__forge-core@0.2.3.patch/)
})

test('invalid CLI inputs fail without requiring network or package manager', () => {
  assert.throws(() => execFileSync(process.execPath, ['scripts/sync-dsh.mjs', '--version', 'invalid'], { stdio: 'pipe' }), /Command failed/)
})
