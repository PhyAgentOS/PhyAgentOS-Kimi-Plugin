import { createHash } from 'node:crypto'
import { cp, mkdir, readFile, realpath, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { resolveCore } from './core-resolution.mjs'

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')

/** Apply only the checked-in, exact-base Core compatibility patch to a private npm copy. */
export async function applyCompatibility(runtime) {
  // Package resolution canonicalizes symlinks. Use that same coordinate system
  // for relative imports so macOS /var -> /private/var aliases remain relocatable.
  runtime = await realpath(runtime)
  const spec = JSON.parse(await readFile(join(runtime, 'compatibility.json'), 'utf8'))
  const published = resolveCore(join(runtime, 'package.json')).directory
  const core = join(runtime, 'compat-core')
  const pkg = JSON.parse(await readFile(join(published, 'package.json'), 'utf8'))
  if (pkg.version !== spec.version) throw new Error(`Unexpected Core version ${pkg.version}; expected ${spec.version}`)
  const patch = await readFile(join(runtime, 'core.patch'), 'utf8')
  if (sha256(patch) !== spec.patchSha256) throw new Error('Core compatibility patch checksum mismatch')
  // Adapt only a plugin-owned copy; the npm installation stays byte-for-byte intact.
  await cp(published, core, { recursive: true, dereference: true })
  // Preserve resolution of Core's own dependencies even with nested npm installs.
  const require = createRequire(join(published, 'package.json'))
  for (const name of Object.keys(pkg.dependencies ?? {})) {
    const shim = join(core, 'node_modules', name)
    await mkdir(shim, { recursive: true })
    const entry = require.resolve(name)
    let target = relative(shim, entry).split('\\').join('/')
    if (!target.startsWith('.')) target = `./${target}`
    // Node 22 cannot infer all named exports from minified CommonJS (notably
    // tar's c/x/t aliases). Export the actual public properties explicitly.
    const namespace = await import(pathToFileURL(entry).href)
    const defaultKeys = namespace.default != null
      && ['object', 'function'].includes(typeof namespace.default) ? Object.keys(namespace.default) : []
    const names = [...new Set([...Object.keys(namespace), ...defaultKeys])]
      .filter(key => key !== 'default' && /^[a-zA-Z_$][\w$]*$/.test(key))
    const exports = names.map((key, index) => {
      const property = JSON.stringify(key)
      return `const value${index} = Object.hasOwn(dependency, ${property}) ? dependency[${property}] : dependency.default[${property}];\nexport { value${index} as ${key} };`
    })
    if (Object.hasOwn(namespace, 'default')) exports.push('export default dependency.default;')
    await writeFile(join(shim, 'package.json'), JSON.stringify({ name, type: 'module', exports: './index.mjs' }))
    await writeFile(join(shim, 'index.mjs'), `import * as dependency from ${JSON.stringify(target)};\n${exports.join('\n')}\n`)
  }
  const changes = new Map()
  let file
  let hunk
  for (const line of patch.split('\n')) {
    if (line.startsWith('diff --git ')) { file = undefined; hunk = undefined }
    else if (line.startsWith('+++ b/')) {
      file = line.slice(6)
      if (!Object.hasOwn(spec.files, file) || file.includes('..') || !/^lib\/[a-z0-9.-]+$/i.test(file)) throw new Error(`Unapproved Core patch path: ${file}`)
      changes.set(file, [])
    } else if (line.startsWith('@@ ')) {
      const match = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(line)
      if (!file || !match) throw new Error('Invalid compatibility patch hunk')
      hunk = { start: Number(match[1]) - 1, old: [], next: [], oldCount: Number(match[2] ?? 1), newCount: Number(match[4] ?? 1) }
      changes.get(file).push(hunk)
    } else if (hunk && /^[ +\-]/.test(line)) {
      if (line[0] !== '+') hunk.old.push(line.slice(1))
      if (line[0] !== '-') hunk.next.push(line.slice(1))
    } else if (hunk && line && !line.startsWith('\\ No newline')) throw new Error('Unsupported compatibility patch syntax')
  }
  const writes = []
  for (const [name, hashes] of Object.entries(spec.files)) {
    const path = join(core, name)
    const original = await readFile(path, 'utf8')
    if (sha256(original) !== hashes.before) throw new Error(`Published Core file differs from audited baseline: ${name}`)
    const lines = original.split('\n')
    let cursor = 0
    const output = []
    for (const part of changes.get(name) ?? []) {
      if (part.old.length !== part.oldCount || part.next.length !== part.newCount || part.start < cursor
        || lines.slice(part.start, part.start + part.old.length).join('\n') !== part.old.join('\n')) throw new Error(`Core compatibility patch context mismatch: ${name}`)
      output.push(...lines.slice(cursor, part.start), ...part.next)
      cursor = part.start + part.old.length
    }
    output.push(...lines.slice(cursor))
    const result = output.join('\n')
    if (sha256(result) !== hashes.after) throw new Error(`Core compatibility patch output checksum mismatch: ${name}`)
    writes.push([path, result])
  }
  for (const [path, result] of writes) await writeFile(path, result)
}
