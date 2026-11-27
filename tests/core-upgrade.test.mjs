import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import { upgradeCore } from '../scripts/core-upgrade.mjs'
import { parseUpgradeArgs } from '../scripts/upgrade-core.mjs'

test('manual upgrade accepts an independent Core version and reviewed patch', () => {
  assert.deepEqual(parseUpgradeArgs(['0.3.0'], '0.2.2'), { version: '0.3.0', patchFile: undefined })
  assert.deepEqual(parseUpgradeArgs(['--', '0.2.2', 'reviewed.patch'], '0.2.2'), { version: '0.2.2', patchFile: 'reviewed.patch' })
  for (const args of [[], ['latest'], ['0.3.0-rc.1'], ['0.2.2'], ['0.3.0', 'a', 'b']]) {
    assert.throws(() => parseUpgradeArgs(args, '0.2.2'), /Usage/)
  }
  assert.throws(() => parseUpgradeArgs(['0.2.1'], '0.2.2'), /downgrade/)
  assert.doesNotThrow(() => parseUpgradeArgs(['1.0.0'], '0.9.9'))
})

test('manual upgrade rejects tracked changes before installation or writeback', t => {
  const root = mkdtempSync(join(tmpdir(), 'kimi-upgrade-clean-'))
  t.after(() => rmSync(root, { recursive: true, force: true }))
  const git = args => execFileSync('git', args, { cwd: root, stdio: 'pipe' })
  git(['init'])
  writeFileSync(join(root, 'tracked.txt'), 'baseline\n')
  git(['add', 'tracked.txt'])
  git(['-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'fixture'])
  writeFileSync(join(root, 'tracked.txt'), 'local edit\n')
  assert.throws(() => upgradeCore(root, '0.3.0', { requireClean: true }), /Commit tracked changes/)
})
