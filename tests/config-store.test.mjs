import assert from 'node:assert/strict'
import { mkdtemp, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { KimiConfigStore } from '../src/config-store.mjs'

test('config store writes 0600 JSON, merges updates, creates backups and restores', async () => {
  const home = await mkdtemp(join(tmpdir(), 'kimi-forge-cfg-'))
  try {
    const store = new KimiConfigStore(home)

    const initial = await store.read()
    assert.equal(initial.exists, false)
    assert.deepEqual(initial.config, {})

    const w1 = await store.write({
      models: { root: '/data/shared-models' },
      gateway: { callTimeoutMs: 25000 },
    })
    assert.equal(w1.backup, undefined)
    assert.equal(w1.config.models.root, '/data/shared-models')

    const fileStat = await stat(join(home, 'config.json'))
    if (process.platform !== 'win32') assert.equal(fileStat.mode & 0o777, 0o600)

    const w2 = await store.write({ runtime: { dora: '/opt/bin/dora' } })
    assert.ok(w2.backup?.startsWith('config.json.bak-'))
    assert.equal(w2.config.models.root, '/data/shared-models')
    assert.equal(w2.config.runtime.dora, '/opt/bin/dora')

    const restored = await store.restore(w2.backup)
    assert.equal(restored.restored, w2.backup)
    assert.equal(restored.config.runtime, undefined)
    assert.equal(restored.config.models.root, '/data/shared-models')
  } finally {
    await rm(home, { recursive: true, force: true })
  }
})

test('config store rejects unknown keys, home redirection, path traversal and corrupted JSON', async () => {
  const home = await mkdtemp(join(tmpdir(), 'kimi-forge-cfg-err-'))
  try {
    const store = new KimiConfigStore(home)

    await assert.rejects(
      () => store.write({ unknownKey: true }),
      err => err.code === 'FORGE_CONFIG_INVALID',
    )
    await assert.rejects(
      () => store.write({ home: '/somewhere/else' }),
      err => err.code === 'FORGE_CONFIG_INVALID',
    )
    await assert.rejects(
      () => store.restore('../outside.bak-1'),
      err => err.code === 'FORGE_CONFIG_INVALID',
    )

    // Corrupting config.json on disk must block merge writes instead of losing user edits.
    await writeFile(join(home, 'config.json'), '{broken-json', 'utf8')
    await assert.rejects(
      () => store.write({ gateway: { callTimeoutMs: 10000 } }),
      err => err.code === 'FORGE_CONFIG_INVALID',
    )
  } finally {
    await rm(home, { recursive: true, force: true })
  }
})
