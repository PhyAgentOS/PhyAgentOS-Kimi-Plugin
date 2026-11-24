import assert from 'node:assert/strict'
import { homedir } from 'node:os'
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
  const env = { KIMI_CODE_HOME: '/tmp/custom-kimi' }
  assert.equal(resolveKimiCodeHome(env), '/tmp/custom-kimi')
  assert.equal(resolveKimiForgeHome(env), '/tmp/custom-kimi/forge')
  assert.equal(resolveKimiSkillsDir(env), '/tmp/custom-kimi/skills')
})

test('honors KIMI_FORGE_HOME over DSH_FORGE_HOME and KIMI_CODE_HOME', () => {
  const env = {
    KIMI_CODE_HOME: '/tmp/custom-kimi',
    DSH_FORGE_HOME: '/tmp/dsh-override',
    KIMI_FORGE_HOME: '~/my-kimi-forge',
  }
  assert.equal(resolveKimiForgeHome(env), join(homedir(), 'my-kimi-forge'))
  assert.equal(resolveKimiForgeHome({ DSH_FORGE_HOME: '/tmp/dsh-override' }), '/tmp/dsh-override')
})

test('expands leading tilde and relative paths cleanly', () => {
  assert.equal(expandUserPath('~/models/weights'), join(homedir(), 'models', 'weights'))
  assert.equal(expandUserPath('shared/models', '/var/forge'), '/var/forge/shared/models')
})
