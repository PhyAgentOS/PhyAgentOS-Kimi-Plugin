#!/usr/bin/env node
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { CORE, json, stable, upgradeCore } from './core-upgrade.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const [version, patchFile, ...extra] = process.argv.slice(2)
try {
  if (!stable(version) || extra.length) throw new Error('Usage: pnpm upgrade:core <stable version> [reviewed.patch]')
  const upstream = json(resolve(root, 'dsh-upstream.json'))
  if (upstream.packages[CORE] !== version) {
    throw new Error('Use pnpm run sync:dsh [--version <DSH bundle version>] to upgrade the tracked DSH dependency chain')
  }
  const result = upgradeCore(root, version, { patchFile })
  console.log(JSON.stringify(result, null, 2))
} catch (error) {
  console.error(`Core upgrade failed: ${error.message}`)
  process.exitCode = 1
}
