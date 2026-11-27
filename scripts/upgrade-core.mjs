#!/usr/bin/env node
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export function parseUpgradeArgs() {
  throw new Error('Independent Core upgrades are no longer supported; use pnpm run sync:dsh -- --version X.Y.Z [--patch reviewed.patch] to select a DSH bundle and follow its Core dependency.')
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { parseUpgradeArgs() } catch (error) {
    console.error(error.message)
    process.exitCode = 1
  }
}
