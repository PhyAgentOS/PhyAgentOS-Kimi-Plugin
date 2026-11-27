#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkOnly = process.argv.includes('--check')
const result = await build({
  entryPoints: [resolve(root, 'src/forge-mcp.mjs')],
  bundle: true,
  external: ['@x-era/forge-core'],
  platform: 'node', target: 'node22', format: 'esm', write: false,
  legalComments: 'none',
})
const adapter = result.outputFiles[0].text
const outputs = new Map([
  ['adapter.mjs', adapter.startsWith('#!') ? adapter : `#!/usr/bin/env node\n${adapter}`],
  ['forge-mcp.mjs', await readFile(resolve(root, 'src/runtime-bootstrap.mjs'), 'utf8')],
  ['runtime-compatibility.mjs', await readFile(resolve(root, 'src/runtime-compatibility.mjs'), 'utf8')],
  ['runtime-proxy.mjs', await readFile(resolve(root, 'src/runtime-proxy.mjs'), 'utf8')],
  ['core.patch', await readFile(resolve(root, 'patches/@x-era__forge-core@0.2.0.patch'), 'utf8')],
])
// A rebuilt adapter must never ship with stale compatibility metadata: the
// runtime otherwise rejects the patch or can keep using an older payload.
const compatibility = JSON.parse(await readFile(resolve(root, 'mcp/compatibility.json'), 'utf8'))
const patchSha256 = createHash('sha256').update(outputs.get('core.patch')).digest('hex')
if (compatibility.patchSha256 !== patchSha256) {
  throw new Error('Core compatibility metadata is stale; audit the patch and update mcp/compatibility.json before building.')
}
await mkdir(resolve(root, 'mcp'), { recursive: true })
for (const [name, output] of outputs) {
  const target = resolve(root, 'mcp', name)
  if (checkOnly) {
    if (await readFile(target, 'utf8').catch(() => '') !== output) {
      process.stderr.write(`mcp/${name} is out of date; run \`pnpm run build\`.\n`)
      process.exitCode = 1
    }
  } else {
    await writeFile(target, output, 'utf8')
    if (name.endsWith('.mjs')) await chmod(target, 0o755)
  }
}
if (!process.exitCode) process.stdout.write(checkOnly ? 'MCP runtime payload is up to date.\n' : `Built external-Core MCP adapter (${Buffer.byteLength(adapter)} bytes) and bootstrap.\n`)
