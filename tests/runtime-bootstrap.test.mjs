import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cp, mkdir, readFile, readdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'
import { promisify } from 'node:util'
import { prepareRuntime } from '../src/runtime-bootstrap.mjs'
import { applyCompatibility } from '../src/runtime-compatibility.mjs'
import { temporaryDirectory } from './helpers/bundle.mjs'

const execFileAsync = promisify(execFile)
const digest = bytes => createHash('sha256').update(bytes).digest('hex')

async function fixture(t) {
  const root = await temporaryDirectory(t)
  const directory = join(root, 'payload')
  await cp(new URL('../mcp/', import.meta.url), directory, { recursive: true })
  // One real, locked npm installation; reuse pristine files for fault/concurrency tests.
  const baseline = join(root, 'baseline')
  await mkdir(baseline)
  for (const name of ['package.json', 'package-lock.json']) await cp(join(directory, name), join(baseline, name))
  await execFileAsync(process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['ci', '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund'],
    { cwd: baseline, shell: process.platform === 'win32' })
  let calls = 0
  const install = async staging => {
    calls++
    await cp(join(baseline, 'node_modules'), join(staging, 'node_modules'), { recursive: true })
  }
  return { root, directory, baseline, install, calls: () => calls }
}

test('bootstrap installs once, serializes concurrent starts, preserves npm bytes and repairs an altered cache', async t => {
  const f = await fixture(t)
  const env = { KIMI_FORGE_HOME: join(f.root, 'home') }
  const [first, second] = await Promise.all([
    prepareRuntime({ directory: f.directory, env, install: f.install }),
    prepareRuntime({ directory: f.directory, env, install: f.install }),
  ])
  assert.equal(first, second)
  assert.equal(f.calls(), 1)
  const spec = JSON.parse(await readFile(join(f.directory, 'compatibility.json'), 'utf8'))
  for (const [name, hashes] of Object.entries(spec.files)) {
    assert.equal(digest(await readFile(join(first, 'node_modules/@x-era/forge-core', name))), hashes.before)
    assert.equal(digest(await readFile(join(first, 'compat-core', name))), hashes.after)
  }
  const noNetwork = async () => { throw new Error('warm start must not install') }
  assert.equal(await prepareRuntime({ directory: f.directory, env, install: noNetwork }), first)
  await writeFile(join(first, 'compat-core/lib/index.js'), '// altered\n')
  assert.equal(await prepareRuntime({ directory: f.directory, env, install: f.install }), first)
  assert.equal(f.calls(), 2)
  assert.ok((await readdir(join(f.root, 'home/plugin-runtime'))).some(name => name.includes('.invalid-')))
})

test('failed first installation leaves no ready cache and can be retried', async t => {
  const f = await fixture(t)
  const env = { KIMI_FORGE_HOME: join(f.root, 'home') }
  await assert.rejects(prepareRuntime({ directory: f.directory, env,
    install: async () => { throw new Error('simulated offline install') } }), /simulated offline/)
  assert.deepEqual(await readdir(join(f.root, 'home/plugin-runtime')), [])
  const target = await prepareRuntime({ directory: f.directory, env, install: f.install })
  assert.ok(await readFile(join(target, '.ready'), 'utf8'))
})

test('compatibility refuses modified published files and never changes the installed npm package', async t => {
  const f = await fixture(t)
  const staging = join(f.root, 'staging')
  await mkdir(staging)
  await f.install(staging)
  for (const name of ['compatibility.json', 'core.patch']) await cp(join(f.directory, name), join(staging, name))
  const name = join(staging, 'node_modules/@x-era/forge-core/lib/archive.js')
  await writeFile(name, '// unexpected published content\n')
  await assert.rejects(applyCompatibility(staging), /audited baseline/)
  assert.equal(await readFile(name, 'utf8'), '// unexpected published content\n')
})
