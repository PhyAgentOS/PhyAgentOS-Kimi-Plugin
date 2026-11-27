import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { upgradeCore } from '../scripts/core-upgrade.mjs'
import { parseUpgradeArgs } from '../scripts/upgrade-core.mjs'

test('retired independent Core upgrade CLI directs every invocation to DSH synchronization', () => {
  for (const args of [[], ['0.3.0'], ['--', '0.2.2', 'reviewed.patch'], ['latest'], ['--help']]) {
    assert.throws(() => parseUpgradeArgs(args, '0.2.2'), {
      message: /Independent Core upgrades are no longer supported; use pnpm run sync:dsh/,
    })
  }
  assert.throws(() => execFileSync(process.execPath,
    [fileURLToPath(new URL('../scripts/upgrade-core.mjs', import.meta.url)), '0.3.0'], { stdio: 'pipe' }), error => {
    assert.equal(error.status, 1)
    assert.match(error.stderr.toString(), /Independent Core upgrades are no longer supported; use pnpm run sync:dsh/)
    return true
  })
})

test('DSH upgrade rejects tracked changes before installation or writeback and requires upstream tracking', t => {
  const root = mkdtempSync(join(tmpdir(), 'kimi-upgrade-clean-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const git = args => execFileSync('git', args, { cwd: root, stdio: 'pipe' })
  git(['init'])
  writeFileSync(join(root, 'tracked.txt'), 'baseline\n')
  git(['add', 'tracked.txt'])
  git(['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'fixture'])
  writeFileSync(join(root, 'tracked.txt'), 'local edit\n')
  assert.throws(() => upgradeCore(root, '0.3.0', { requireClean: true }), /Commit tracked changes/)
  git(['restore', 'tracked.txt'])
  assert.throws(() => upgradeCore(root, '0.3.0', { requireClean: true }), /upstream|DSH/i)
  assert.equal(git(['status', '--porcelain']).toString(), '')
})
