import assert from 'node:assert/strict'
import { homedir, tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import {
  expandUserPath,
  resolveKimiCodeHome,
  resolveKimiForgeHome,
  resolveKimiSkillsDir,
} from '../src/paths.mjs'

test('defaults isolated Forge home to ~/.kimi-code/forge instead of ~/.dsh/forge', () => {
  const home = resolveKimiForgeHome({})
  assert.equal(home, join(homedir(), '.kimi-code', 'forge'))
  assert.ok(!home.includes('.dsh'))
})

test('tracks KIMI_CODE_HOME when isolated Kimi home is set', () => {
  const base = join(tmpdir(), 'custom-kimi')
  const env = { KIMI_CODE_HOME: base }
  assert.equal(resolveKimiCodeHome(env), base)
  assert.equal(resolveKimiForgeHome(env), join(base, 'forge'))
  assert.equal(resolveKimiSkillsDir(env), join(base, 'skills'))
})

test('honors KIMI_FORGE_HOME over DSH_FORGE_HOME and KIMI_CODE_HOME', () => {
  const env = {
    KIMI_CODE_HOME: join(tmpdir(), 'custom-kimi'),
    DSH_FORGE_HOME: join(tmpdir(), 'dsh-override'),
    KIMI_FORGE_HOME: '~/my-kimi-forge',
  }
  assert.equal(resolveKimiForgeHome(env), join(homedir(), 'my-kimi-forge'))
  assert.equal(resolveKimiForgeHome({ DSH_FORGE_HOME: env.DSH_FORGE_HOME }), env.DSH_FORGE_HOME)
})

test('expands leading tilde and relative paths cleanly', () => {
  assert.equal(expandUserPath('~/models/weights'), join(homedir(), 'models', 'weights'))
  const base = join(tmpdir(), 'forge')
  assert.equal(expandUserPath('shared/models', base), join(base, 'shared', 'models'))
})
