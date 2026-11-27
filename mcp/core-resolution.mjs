import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

const stable = value => typeof value === 'string' && /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value)

/** Resolve the declared DSH chain without executing any DSH host code. */
export function resolveCore(anchor = import.meta.url) {
  let require = createRequire(anchor)
  const packages = {}
  let parent
  let coreDirectory
  for (const name of ['@x-era/dsh-forge', '@x-era/dsh-forge-skill', '@x-era/forge-core']) {
    const manifest = require.resolve(`${name}/package.json`)
    const pkg = JSON.parse(readFileSync(manifest, 'utf8'))
    if (pkg.name !== name || !stable(pkg.version)) throw new Error(`Invalid installed Forge package: ${name}`)
    if (parent && parent.dependencies?.[name] !== pkg.version) throw new Error(`DSH dependency chain mismatch: ${name}`)
    packages[name] = pkg.version
    parent = pkg
    require = createRequire(manifest)
    coreDirectory = dirname(manifest)
  }
  return { packages, directory: coreDirectory, entry: join(coreDirectory, 'lib/index.js') }
}
