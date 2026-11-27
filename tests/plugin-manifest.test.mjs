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

test('Kimi allows a 900-second Forge startup budget plus launch overhead', async () => {
  const manifest = JSON.parse(await readFile(resolve(root, 'kimi.plugin.json'), 'utf8'))
  assert.ok(manifest.mcpServers.forge.toolTimeoutMs >= (900 + 60) * 1000)
})
