import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

test('plugin manifest, skills, commands, locales and README links pass validation', async () => {
  const { stdout } = await execFileAsync(process.execPath, [resolve(root, 'scripts/validate-plugin.mjs')], { cwd: root })
  assert.match(stdout, /Validated plugin "phyagentos"/)
})

test('bundled mcp/forge-mcp.mjs matches source deterministically', async () => {
  const { stdout } = await execFileAsync(process.execPath, [resolve(root, 'scripts/build-mcp.mjs'), '--check'], { cwd: root })
  assert.match(stdout, /up to date/)
})

test('development and published runtime pin the same Core and compatibility version', async () => {
  const json = async name => JSON.parse(await readFile(resolve(root, name), 'utf8'))
  const [development, runtime, lock, compatibility] = await Promise.all([
    json('package.json'), json('mcp/package.json'), json('mcp/package-lock.json'), json('mcp/compatibility.json'),
  ])
  const version = development.dependencies['@x-era/forge-core']
  assert.match(version, /^\d+\.\d+\.\d+$/)
  const upstream = await json('dsh-upstream.json')
  assert.match(upstream.packages['@x-era/forge-core'], /^\d+\.\d+\.\d+$/)
  assert.equal(runtime.dependencies['@x-era/forge-core'], version)
  assert.equal(lock.packages[''].dependencies['@x-era/forge-core'], version)
  assert.equal(lock.packages['node_modules/@x-era/forge-core'].version, version)
  assert.equal(compatibility.version, version)
  assert.equal(await readFile(resolve(root, 'mcp/core.patch'), 'utf8'),
    await readFile(resolve(root, `patches/@x-era__forge-core@${version}.patch`), 'utf8'))
})

test('Kimi allows a 900-second Forge startup budget plus launch overhead', async () => {
  const manifest = JSON.parse(await readFile(resolve(root, 'kimi.plugin.json'), 'utf8'))
  assert.ok(manifest.mcpServers.forge.toolTimeoutMs >= (900 + 60) * 1000)
})
