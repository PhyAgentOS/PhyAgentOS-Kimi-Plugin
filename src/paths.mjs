import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

import { expandHome } from './core.mjs'

/** Resolve Kimi's user data root (`$KIMI_CODE_HOME` or `~/.kimi-code`). */
export function resolveKimiCodeHome(env = process.env) {
  const raw = env.KIMI_CODE_HOME?.trim()
  return raw ? resolve(expandHome(raw)) : join(homedir(), '.kimi-code')
}

/**
 * Resolve the isolated Forge data root for Kimi.
 *
 * Priority: explicit → `$KIMI_FORGE_HOME` → `$DSH_FORGE_HOME` → `$KIMI_CODE_HOME/forge` (`~/.kimi-code/forge`).
 * Never defaults to `~/.dsh/forge` so Kimi and DSH do not contend on `runtime/state.json`.
 */
export function resolveKimiForgeHome(env = process.env, explicit = undefined) {
  for (const candidate of [explicit, env.KIMI_FORGE_HOME, env.DSH_FORGE_HOME]) {
    const trimmed = candidate?.trim()
    if (trimmed) return resolve(expandHome(trimmed))
  }
  return join(resolveKimiCodeHome(env), 'forge')
}

/** Resolve Kimi's live-reloaded user skills directory (`$KIMI_CODE_HOME/skills`). */
export function resolveKimiSkillsDir(env = process.env) {
  return join(resolveKimiCodeHome(env), 'skills')
}

/** Expand leading `~` and resolve against `baseDir` (or `process.cwd()`). */
export function expandUserPath(value, baseDir = undefined) {
  const expanded = expandHome(value)
  return baseDir ? resolve(baseDir, expanded) : resolve(expanded)
}
