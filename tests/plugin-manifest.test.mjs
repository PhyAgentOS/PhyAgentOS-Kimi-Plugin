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

test('development and runtime pin DSH with consistent transitive Core tracking and compatibility', async () => {
  const json = async name => JSON.parse(await readFile(resolve(root, name), 'utf8'))
  const [development, runtime, lock, compatibility, upstream] = await Promise.all([
    json('package.json'), json('mcp/package.json'), json('mcp/package-lock.json'), json('mcp/compatibility.json'),
    json('dsh-upstream.json'),
  ])
  const bundle = '@x-era/dsh-forge'
  const skill = '@x-era/dsh-forge-skill'
  const core = '@x-era/forge-core'
  for (const manifest of [development, runtime, lock.packages['']]) {
    for (const field of ['dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies']) {
      assert.equal(Object.hasOwn(manifest[field] ?? {}, core), false, `${field} must not directly declare Core`)
    }
    assert.equal(manifest.dependencies[bundle], upstream.packages[bundle])
  }
  let parentPath = ''
  for (const name of [bundle, skill, core]) {
    const version = upstream.packages[name]
    assert.match(version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/)
    assert.equal(lock.packages[parentPath].dependencies[name], version)
    let installedPath = `${parentPath ? `${parentPath}/` : ''}node_modules/${name}`
    while (!lock.packages[installedPath] && parentPath) {
      parentPath = parentPath.replace(/(?:^|\/)node_modules\/(?:@[^/]+\/)?[^/]+$/, '')
      installedPath = `${parentPath ? `${parentPath}/` : ''}node_modules/${name}`
    }
    assert.equal(lock.packages[installedPath]?.version, version, `${name} must match tracked upstream`)
    parentPath = installedPath
  }
  const version = upstream.packages[core]
  assert.equal(compatibility.version, version)
  assert.equal(await readFile(resolve(root, 'mcp/core.patch'), 'utf8'),
    await readFile(resolve(root, `patches/@x-era__forge-core@${version}.patch`), 'utf8'))
})

test('Kimi allows a 900-second Forge startup budget plus launch overhead', async () => {
  const manifest = JSON.parse(await readFile(resolve(root, 'kimi.plugin.json'), 'utf8'))
  assert.ok(manifest.mcpServers.forge.toolTimeoutMs >= (900 + 60) * 1000)
})
