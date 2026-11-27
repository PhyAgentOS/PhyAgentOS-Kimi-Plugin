import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { CORE, patchPaths, prepareCompatibility, updateWorkspace } from '../scripts/core-upgrade.mjs'
import { assessUpdate, BUNDLE, metadata, parseArgs, REGISTRY, resolveUpstream, SKILL } from '../scripts/sync-dsh.mjs'
import { applyCompatibility } from '../src/runtime-compatibility.mjs'

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
  assert.throws(() => assessUpdate(record(), record(), '0.2.1'), /differs/)
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
  writeFileSync(join(root, 'a/package.json'), JSON.stringify({ version: '0.2.3' }))
  const prepared = prepareCompatibility(join(root, 'a'), join(root, 'b'), patch, '0.2.3', root)
  assert.deepEqual(patchPaths(prepared.patch), ['lib/index.js'])
  const runtime = join(root, 'runtime')
  mkdirSync(join(runtime, 'node_modules/@x-era/forge-core/lib'), { recursive: true })
  writeFileSync(join(runtime, 'node_modules/@x-era/forge-core/lib/index.js'), original)
  writeFileSync(join(runtime, 'node_modules/@x-era/forge-core/package.json'), JSON.stringify({ version: '0.2.3' }))
  writeFileSync(join(runtime, 'core.patch'), prepared.patch)
  writeFileSync(join(runtime, 'compatibility.json'), JSON.stringify(prepared.compatibility))
  await applyCompatibility(runtime)
  assert.equal(readFileSync(join(runtime, 'compat-core/lib/index.js'), 'utf8'), 'export const value = 2;\n')
  assert.equal(readFileSync(join(runtime, 'node_modules/@x-era/forge-core/lib/index.js'), 'utf8'), original)
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
