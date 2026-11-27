#!/usr/bin/env node
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CORE, json, stable, upgradeCore } from './core-upgrade.mjs'
import { resolveCore } from '../src/core-resolution.mjs'

export const REGISTRY = 'https://registry.npmjs.org'
export const BUNDLE = '@x-era/dsh-forge'
export const SKILL = '@x-era/dsh-forge-skill'

export function parseArgs(args) {
  const options = { check: false }
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--') continue
    if (args[i] === '--check') options.check = true
    else if (args[i] === '--version' && stable(args[i + 1])) options.version = args[++i]
    else if (args[i] === '--patch' && args[i + 1] && !args[i + 1].startsWith('--')) options.patchFile = resolve(args[++i])
    else throw new Error('Usage: pnpm run sync:dsh [--check] [--version X.Y.Z] [--patch reviewed.patch]')
  }
  return options
}

export async function metadata(name, version, fetcher = fetch) {
  const response = await fetcher(`${REGISTRY}/${encodeURIComponent(name)}/${version}`, {
    signal: AbortSignal.timeout(30_000), headers: { accept: 'application/json' },
  })
  if (!response.ok) throw new Error(`npm metadata request failed: ${name}@${version} (HTTP ${response.status})`)
  const pkg = await response.json()
  if (pkg.name !== name || !stable(pkg.version) || (version !== 'latest' && pkg.version !== version)) {
    throw new Error(`Unexpected npm metadata for ${name}@${version}`)
  }
  return pkg
}

export async function resolveUpstream(version = 'latest', fetcher = fetch) {
  const bundle = await metadata(BUNDLE, version, fetcher)
  const skillVersion = bundle.dependencies?.[SKILL]
  if (!stable(skillVersion)) throw new Error(`${BUNDLE} must pin ${SKILL} to an exact stable version`)
  const skill = await metadata(SKILL, skillVersion, fetcher)
  const coreVersion = skill.dependencies?.[CORE]
  if (!stable(coreVersion)) throw new Error(`${SKILL} must pin ${CORE} to an exact stable version`)
  const core = await metadata(CORE, coreVersion, fetcher)
  return { registry: REGISTRY, packages: {
    [BUNDLE]: bundle.version, [SKILL]: skill.version, [CORE]: core.version,
  } }
}

export function assessUpdate(tracked, target, localCore) {
  if (tracked.registry !== REGISTRY || !tracked.packages || Object.keys(tracked.packages).length !== 3) {
    throw new Error('Invalid dsh-upstream.json tracking record')
  }
  for (const name of [BUNDLE, SKILL, CORE]) {
    const previous = tracked.packages[name]
    if (!stable(previous)) throw new Error(`Invalid tracked version: ${name}`)
    const next = target.packages[name]
    if (!stable(next)) throw new Error(`Invalid target version: ${name}`)
    const a = previous.split('.').map(BigInt)
    const b = next.split('.').map(BigInt)
    const first = a.findIndex((part, i) => part !== b[i])
    if (first !== -1 && a[first] > b[first]) throw new Error(`Refusing upstream downgrade: ${name} ${previous} -> ${next}`)
  }
  if (!stable(localCore)) throw new Error('Invalid local Core version')
  const local = localCore.split('.').map(BigInt)
  const next = target.packages[CORE].split('.').map(BigInt)
  const first = local.findIndex((part, i) => part !== next[i])
  if (first !== -1 && local[first] > next[first]) {
    throw new Error(`Refusing Core downgrade from local ${localCore} to DSH Core ${target.packages[CORE]}`)
  }
  return {
    updateAvailable: localCore !== target.packages[CORE] || [BUNDLE, SKILL, CORE].some(name => tracked.packages[name] !== target.packages[name]),
    coreChanged: localCore !== target.packages[CORE],
  }
}

export async function main(args = process.argv.slice(2)) {
  const options = parseArgs(args)
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const tracked = json(resolve(root, 'dsh-upstream.json'))
  const installed = resolveCore(resolve(root, 'package.json'))
  const development = json(resolve(root, 'package.json'))
  const runtime = json(resolve(root, 'mcp/package.json'))
  if (development.dependencies[CORE] || runtime.dependencies[CORE]
    || development.dependencies[BUNDLE] !== installed.packages[BUNDLE]
    || runtime.dependencies[BUNDLE] !== installed.packages[BUNDLE]
    || json(resolve(root, 'mcp/compatibility.json')).version !== installed.packages[CORE]
    || Object.entries(installed.packages).some(([name, version]) => tracked.packages[name] !== version)) {
    throw new Error('Local manifests, compatibility and tracking must match the installed DSH dependency chain; run pnpm install --frozen-lockfile and review local changes')
  }
  const target = await resolveUpstream(options.version)
  const status = assessUpdate(tracked, target, installed.packages[CORE])
  let applied = false
  let result
  if (!options.check && (status.updateAvailable || options.patchFile)) {
    result = upgradeCore(root, target.packages[CORE], { upstream: target, patchFile: options.patchFile })
    applied = true
  }
  const output = { ...status, applied, previous: tracked, target, ...(result ? { validation: result } : {}) }
  process.stdout.write(JSON.stringify(output, null, 2) + '\n')
  return output
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(`DSH sync failed; no upgrade was promoted: ${error.message}`)
    process.exitCode = 1
  })
}
