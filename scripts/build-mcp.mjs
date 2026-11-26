#!/usr/bin/env node
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { build } from 'esbuild'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const entry = resolve(root, 'src/forge-mcp.mjs')
const outfile = resolve(root, 'mcp/forge-mcp.mjs')
const checkOnly = process.argv.includes('--check')

const result = await build({
  entryPoints: [entry],
  bundle: true,
  platform: 'node',
  target: 'node22',
  format: 'esm',
  write: false,
  legalComments: 'none',
  banner: {
    js: [
      "import { createRequire as __kimiCreateRequire } from 'node:module';",
      'const require = __kimiCreateRequire(import.meta.url);',
    ].join(' '),
  },
})

const raw = result.outputFiles[0].text
const normalized = raw.startsWith('#!')
  ? raw
  : `#!/usr/bin/env node\n${raw}`
// If esbuild placed banner before existing shebang, hoist shebang to line 1.
const lines = normalized.split('\n')
const shebangIdx = lines.findIndex(line => line.startsWith('#!'))
let output = normalized
if (shebangIdx > 0) {
  const [shebang] = lines.splice(shebangIdx, 1)
  output = [shebang, ...lines].join('\n')
}

if (checkOnly) {
  const existing = await readFile(outfile, 'utf8').catch(() => '')
  if (existing !== output) {
    process.stderr.write('mcp/forge-mcp.mjs is out of date; run `pnpm run build`.\n')
    const committedLines = existing.split('\n')
    const generatedLines = output.split('\n')
    const difference = generatedLines.findIndex((line, index) => line !== committedLines[index])
    if (difference >= 0) {
      const committed = committedLines[difference]?.slice(0, 240)
      const generated = generatedLines[difference].slice(0, 240)
      process.stderr.write(`Line ${difference + 1}: committed ${JSON.stringify(committed)}, generated ${JSON.stringify(generated)}\n`)
    }
    process.exit(1)
  }
  process.stdout.write('mcp/forge-mcp.mjs is up to date.\n')
} else {
  await mkdir(dirname(outfile), { recursive: true })
  await writeFile(outfile, output, 'utf8')
  await chmod(outfile, 0o755)
  process.stdout.write(`Built ${outfile} (${Buffer.byteLength(output)} bytes).\n`)
}
