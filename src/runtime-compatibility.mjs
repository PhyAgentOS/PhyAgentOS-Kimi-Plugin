import { createHash } from 'node:crypto'
import { cp, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const sha256 = bytes => createHash('sha256').update(bytes).digest('hex')

/** Apply only the checked-in, exact-base Core compatibility patch to a private npm copy. */
export async function applyCompatibility(runtime) {
  const spec = JSON.parse(await readFile(join(runtime, 'compatibility.json'), 'utf8'))
  const published = join(runtime, 'node_modules/@x-era/forge-core')
  const core = join(runtime, 'compat-core')
  const pkg = JSON.parse(await readFile(join(published, 'package.json'), 'utf8'))
  if (pkg.version !== spec.version) throw new Error(`Unexpected Core version ${pkg.version}; expected ${spec.version}`)
  const patch = await readFile(join(runtime, 'core.patch'), 'utf8')
  if (sha256(patch) !== spec.patchSha256) throw new Error('Core compatibility patch checksum mismatch')
  // Adapt only a plugin-owned copy; the npm installation stays byte-for-byte intact.
  await cp(published, core, { recursive: true, dereference: true })
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
