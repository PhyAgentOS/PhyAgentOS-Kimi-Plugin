#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const core = '@x-era/forge-core'
const [version, rebasedPatch, ...extra] = process.argv.slice(2)
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
const head = git('rev-parse', 'HEAD')
const trackedStatus = () => git('status', '--porcelain', '--untracked-files=no')
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'))
const current = pkg.dependencies[core]
if (!/^\d+\.\d+\.\d+$/.test(version ?? '') || extra.length || version === current) {
  throw new Error(`Usage: pnpm upgrade:core <new stable version> [rebased.patch] (current: ${current})`)
}
if (trackedStatus()) throw new Error('Commit tracked changes first so the upgrade starts from a reproducible Git snapshot')

const oldPatch = `patches/@x-era__forge-core@${current}.patch`
const newPatch = `patches/@x-era__forge-core@${version}.patch`
if (existsSync(join(root, newPatch))) throw new Error(`Patch already exists: ${newPatch}`)
const workspacePath = 'pnpm-workspace.yaml'
const workspace = readFileSync(join(root, workspacePath), 'utf8')
const oldEntry = `  '${core}@${current}': ${oldPatch}`
if (!workspace.split('\n').includes(oldEntry)) throw new Error(`Expected patch mapping: ${oldEntry}`)

const temp = mkdtempSync(join(tmpdir(), 'kimi-core-upgrade-'))
try {
  const candidate = join(temp, 'checkout')
  const archive = join(temp, 'checkout.tar')
  mkdirSync(candidate)
  git('archive', '--format=tar', '-o', archive, head)
  execFileSync('tar', ['-xf', archive, '-C', candidate])

  pkg.dependencies[core] = version
  writeFileSync(join(candidate, 'package.json'), JSON.stringify(pkg, null, 2) + '\n')
  const updatedWorkspace = workspace.replace(oldEntry, `  '${core}@${version}': ${newPatch}`)
    .replace(`  - '${core}@${current}'\n`, '')
    .replace(/^minimumReleaseAgeExclude:\n(?=\S|$)/m, '')
  writeFileSync(join(candidate, workspacePath), updatedWorkspace)
  renameSync(join(candidate, oldPatch), join(candidate, newPatch))
  if (rebasedPatch) copyFileSync(resolve(rebasedPatch), join(candidate, newPatch))

  const pnpm = process.env.npm_execpath || 'pnpm'
  const command = /\.[cm]?js$/i.test(pnpm) ? [process.execPath, pnpm] : [pnpm]
  for (const args of [['install', '--no-frozen-lockfile'], ['test'], ['run', 'build:check']]) {
    execFileSync(command[0], [...command.slice(1), ...args], { cwd: candidate, stdio: 'inherit' })
  }

  if (git('rev-parse', 'HEAD') !== head || trackedStatus() || existsSync(join(root, newPatch))) {
    throw new Error('The checkout changed during validation; rerun the upgrade from the intended branch')
  }
  for (const file of ['package.json', workspacePath, 'pnpm-lock.yaml', newPatch, 'mcp/forge-mcp.mjs']) {
    copyFileSync(join(candidate, file), join(root, file))
  }
  rmSync(join(root, oldPatch))
  console.log(`Prepared ${core}@${version}. Review the diff and run pnpm install --frozen-lockfile in this checkout.`)
} catch (error) {
  console.error('Core upgrade failed. If the existing patch conflicts, rerun with a reviewed, rebased patch.')
  throw error
} finally {
  rmSync(temp, { recursive: true, force: true })
}
