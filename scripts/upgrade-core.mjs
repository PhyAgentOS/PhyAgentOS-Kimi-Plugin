#!/usr/bin/env node
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CORE, json, stable, upgradeCore } from './core-upgrade.mjs'

export function parseUpgradeArgs(args, current) {
  const values = args[0] === '--' ? args.slice(1) : args
  const [version, patchFile, ...extra] = values
  if (!stable(version) || extra.length || (version === current && !patchFile)) {
    throw new Error(`Usage: pnpm upgrade:core <new stable version> [reviewed.patch] (current: ${current})`)
  }
  if (version.split('.').map(BigInt).some((part, i, parts) =>
    parts.slice(0, i).every((v, j) => v === BigInt(current.split('.')[j])) && part < BigInt(current.split('.')[i]))) {
    throw new Error('Core downgrades are not supported')
  }
  return { version, patchFile }
}

export function main(args = process.argv.slice(2)) {
  const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const { version, patchFile } = parseUpgradeArgs(args, json(resolve(root, 'package.json')).dependencies[CORE])
  const result = upgradeCore(root, version, { patchFile, requireClean: true })
  console.log(JSON.stringify(result, null, 2))
  console.error('Review the diff, then run pnpm install --frozen-lockfile in this checkout. DSH tracking and plugin versions are unchanged.')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main() } catch (error) {
    console.error(`Core upgrade failed: ${error.message}`)
    process.exitCode = 1
  }
}
