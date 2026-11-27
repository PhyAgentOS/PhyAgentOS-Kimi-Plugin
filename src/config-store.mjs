import { copyFile, mkdir, readFile, readdir, rename, stat, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'

import { diffValues, ForgeError, mergeForgeRowConfig, validateConfig, withLock } from './core.mjs'

const CONFIG_FILE = 'config.json'
let backupSeq = 0

function stamp() {
  const now = new Date()
  const pad = n => String(n).padStart(2, '0')
  backupSeq += 1
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}-${String(now.getMilliseconds()).padStart(3, '0')}-${backupSeq}`
}

/**
 * Host-neutral configuration store backed by `<home>/config.json`.
 *
 * Replaces DSH's `cordis.patch.yml` store so Kimi never touches `~/.dsh`, while
 * preserving `@x-era/forge-core`'s schema validation, `0600` atomic writes,
 * field-level diffs and timestamped backups.
 */
export class KimiConfigStore {
  constructor(home, lockFile = join(home, 'runtime', 'forge.lock')) {
    this.home = home
    this.path = join(home, CONFIG_FILE)
    this.lockFile = lockFile
  }

  async read() {
    let raw
    try {
      raw = await readFile(this.path, 'utf8')
    } catch (error) {
      if (error?.code === 'ENOENT') {
        return { path: this.path, exists: false, config: {}, backups: await this.listBackups() }
      }
      throw error
    }
    let parsed
    try {
      parsed = JSON.parse(raw)
    } catch (error) {
      throw new ForgeError('FORGE_CONFIG_INVALID', `${this.path} contains invalid JSON: ${error.message}`)
    }
    const config = validateConfig(parsed)
    return { path: this.path, exists: true, config, backups: await this.listBackups() }
  }

  async write(patch, { merge = true } = {}) {
    if (patch === null || typeof patch !== 'object' || Array.isArray(patch)) {
      throw new ForgeError('FORGE_CONFIG_INVALID', 'config must be an object')
    }
    if ('home' in patch) {
      throw new ForgeError('FORGE_CONFIG_INVALID', 'home is controlled by KIMI_FORGE_HOME / DSH_FORGE_HOME, not config.json')
    }
    return withLock(this.lockFile, async () => {
      const before = await this.read()
      const candidate = merge ? mergeForgeRowConfig(before.config, patch) : patch
      const normalized = validateConfig(candidate)
      await mkdir(this.home, { recursive: true })

      let backup
      if (before.exists) {
        backup = `${this.path}.bak-${stamp()}`
        await copyFile(this.path, backup)
      }
      const temp = `${this.path}.tmp-${process.pid}-${stamp()}`
      await writeFile(temp, `${JSON.stringify(normalized, null, 2)}\n`, { mode: 0o600 })
      await rename(temp, this.path)

      const diff = diffValues(before.config, normalized)
      return {
        path: this.path,
        ...(backup === undefined ? {} : { backup: basename(backup) }),
        changed: diff.length,
        diff,
        config: normalized,
        note: 'Applied immediately to the active Kimi Forge MCP session.',
      }
    })
  }

  async listBackups() {
    let entries = []
    try {
      entries = (await readdir(this.home)).filter(name => name.startsWith(`${CONFIG_FILE}.bak-`))
    } catch {
      return []
    }
    const backups = []
    for (const file of entries) {
      try {
        const info = await stat(join(this.home, file))
        backups.push({ file, at: new Date(info.mtimeMs).toISOString(), size: info.size })
      } catch {
        // raced with deletion
      }
    }
    return backups.sort((a, b) => b.at.localeCompare(a.at))
  }

  async restore(file) {
    if (typeof file !== 'string' || !/^config\.json\.bak-[0-9-]+$/.test(file)) {
      throw new ForgeError('FORGE_CONFIG_INVALID', `invalid backup filename "${file}"`)
    }
    return withLock(this.lockFile, async () => {
      const source = join(this.home, file)
      let raw
      try {
        raw = await readFile(source, 'utf8')
      } catch (error) {
        if (error?.code === 'ENOENT') {
          throw new ForgeError('FORGE_CONFIG_INVALID', `backup "${file}" does not exist`)
        }
        throw error
      }
      const normalized = validateConfig(JSON.parse(raw))

      let previous
      try {
        await stat(this.path)
        const prevPath = `${this.path}.bak-${stamp()}`
        await copyFile(this.path, prevPath)
        previous = basename(prevPath)
      } catch {
        previous = undefined
      }

      const temp = `${this.path}.tmp-${process.pid}-${stamp()}`
      await writeFile(temp, `${JSON.stringify(normalized, null, 2)}\n`, { mode: 0o600 })
      await rename(temp, this.path)
      return {
        path: this.path,
        restored: file,
        ...(previous === undefined ? {} : { previous }),
        config: normalized,
      }
    })
  }
}
