import assert from 'node:assert/strict'
import { execFile } from 'node:child_process'
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
