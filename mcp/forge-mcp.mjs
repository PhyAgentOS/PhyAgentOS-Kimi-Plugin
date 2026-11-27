#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { createHash } from 'node:crypto'
import { constants } from 'node:fs'
import { access, chmod, lstat, mkdir, mkdtemp, readFile, readdir, realpath, rename, rm, stat, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { setTimeout as delay } from 'node:timers/promises'
import { loadProxyEnvironment, npmProxyEnvironment } from './proxy-config.mjs'

const payload = dirname(fileURLToPath(import.meta.url))
const log = message => process.stderr.write(`[phyagentos-bootstrap] ${message}\n`)
const expand = value => value === '~' ? homedir() : value.startsWith('~/') || value.startsWith('~\\') ? join(homedir(), value.slice(2)) : value

export function runtimeRoot(env = process.env) {
  const home = env.KIMI_FORGE_HOME?.trim() || env.DSH_FORGE_HOME?.trim()
  const kimi = env.KIMI_CODE_HOME?.trim()
  return join(home ? resolve(expand(home)) : join(kimi ? resolve(expand(kimi)) : join(homedir(), '.kimi-code'), 'forge'), 'plugin-runtime')
}

async function validRuntime(target, key) {
  try {
    if ((await readFile(join(target, '.ready'), 'utf8')) !== key) return false
    const files = JSON.parse(await readFile(join(target, '.files.json'), 'utf8'))
    if (!files['adapter.mjs'] || !files['runtime-proxy.mjs'] || !files['compat-core/lib/index.js']) return false
    for (const [name, digest] of Object.entries(files)) {
      if (!/^(adapter\.mjs|runtime-proxy\.mjs|proxy-config\.mjs|(?:compat-core|node_modules)\/[a-zA-Z0-9@_./-]+)$/.test(name) || name.split('/').includes('..')) return false
      const bytes = await readFile(join(target, name))
      if (hash(bytes) !== digest) return false
    }
    await access(join(target, 'node_modules/@x-era/forge-core/lib/index.js'), constants.R_OK)
    return true
  } catch { return false }
}

const hash = bytes => createHash('sha256').update(bytes).digest('hex')

async function runNpm(directory, env) {
  // No shell interpolation; Windows npm.cmd needs a command processor.
  const command = process.platform === 'win32' ? (env.ComSpec || 'cmd.exe') : 'npm'
  const args = ['ci', '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund', '--fetch-retries=1', '--fetch-timeout=60000']
  const child = spawn(command, process.platform === 'win32' ? ['/d', '/s', '/c', 'npm.cmd', ...args] : args,
    { cwd: directory, env, stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
  child.stdout.on('data', bytes => process.stderr.write(bytes))
  child.stderr.on('data', bytes => process.stderr.write(bytes))
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => { child.kill(); reject(new Error('npm dependency installation timed out (180 seconds)')) }, 180000)
    child.once('error', error => { clearTimeout(timer); reject(new Error(`Cannot start npm: ${error.message}. Install Node.js >=22 with npm.`)) })
    child.once('exit', code => { clearTimeout(timer); code === 0 ? resolve() : reject(new Error(`npm ci failed (exit ${code}); check network, registry and npm proxy configuration, then retry.`)) })
  })
}

/** Prepare an immutable, versioned runtime; never install into the plugin checkout. */
export async function prepareRuntime({ directory = payload, env = process.env, install = runNpm } = {}) {
  env = await loadProxyEnvironment(env)
  const names = ['package.json', 'package-lock.json', 'adapter.mjs', 'compatibility.json', 'core.patch', 'runtime-compatibility.mjs', 'forge-mcp.mjs', 'runtime-proxy.mjs', 'proxy-config.mjs']
  const contents = await Promise.all(names.map(name => readFile(join(directory, name))))
  const key = hash(Buffer.concat([Buffer.from(`node${process.versions.node.split('.')[0]}:${process.platform}:${process.arch}\n`), ...contents]))
  const root = runtimeRoot(env)
  const target = join(root, key)
  if (await validRuntime(target, key)) return target
  await mkdir(root, { recursive: true, mode: 0o700 })
  const lock = `${target}.lock`
  const deadline = Date.now() + 240000
  let acquired = false
  while (!acquired) {
    try {
      await mkdir(lock, { mode: 0o700 })
      acquired = true
      await writeFile(join(lock, 'owner.json'), JSON.stringify({ pid: process.pid, time: Date.now() }))
    } catch (error) {
      if (error.code !== 'EEXIST') throw error
      if (await validRuntime(target, key)) return target
      // Never reclaim a live installer's lock based on age alone.
      const info = await stat(lock).catch(() => null)
      if (info && Date.now() - info.mtimeMs > 300000) {
        const owner = JSON.parse(await readFile(join(lock, 'owner.json'), 'utf8').catch(() => '{}'))
        let alive = true
        try { process.kill(owner.pid, 0) } catch (error) { alive = error.code !== 'ESRCH' }
        if (!alive) {
          throw new Error(`Abandoned installer lock: ${lock}. Confirm the installer has stopped before removing this lock.`)
        }
      }
      if (Date.now() > deadline) throw new Error(`Timed out waiting for runtime installation: ${lock}. Retry after the other installer finishes.`)
      await delay(100)
    }
  }
  let staging
  try {
    if (await validRuntime(target, key)) return target
    log('Installing locked npm dependencies on first use; subsequent starts reuse the local runtime.')
    staging = await mkdtemp(`${target}.staging-`)
    for (let i = 0; i < names.length; i++) await writeFile(join(staging, names[i]), contents[i])
    await install(staging, npmProxyEnvironment(env))
    const { applyCompatibility } = await import('./runtime-compatibility.mjs')
    await applyCompatibility(staging)
    // Redirect only the adapter's Core imports to the plugin-owned compatibility copy.
    const adapter = contents[2].toString().replace(/from (["'])@x-era\/forge-core\1/g, 'from "./compat-core/lib/index.js"')
    await writeFile(join(staging, 'adapter.mjs'), adapter)
    const tracked = { 'adapter.mjs': hash(adapter), 'runtime-proxy.mjs': hash(contents[7]), 'proxy-config.mjs': hash(contents[8]) }
    // Include every runtime dependency file, not only the seven patched files.
    async function trackTree(relative) {
      for (const entry of await readdir(join(staging, relative), { withFileTypes: true })) {
        // npm's command shims are not used by this MCP adapter.
        if (relative === 'node_modules' && entry.name === '.bin') continue
        const name = `${relative}/${entry.name}`
        if (entry.isDirectory()) await trackTree(name)
        else if (entry.isFile()) tracked[name] = hash(await readFile(join(staging, name)))
        else throw new Error(`Unexpected link or special file in npm runtime: ${name}`)
      }
    }
    await trackTree('compat-core')
    await trackTree('node_modules')
    await writeFile(join(staging, '.files.json'), JSON.stringify(tracked))
    await writeFile(join(staging, '.ready'), key)
    await chmod(staging, 0o700)
    // Preserve a corrupt cache for diagnosis instead of deleting pre-existing data.
    if (await lstat(target).catch(error => { if (error.code !== 'ENOENT') throw error; return null })) {
      await rename(target, `${target}.invalid-${Date.now()}`)
    }
    await rename(staging, target)
    return target
  } finally {
    if (staging) await rm(staging, { recursive: true, force: true })
    await rm(lock, { recursive: true, force: true })
  }
}

export async function main() {
  if (Number(process.versions.node.split('.')[0]) < 22) throw new Error('Node.js >=22 is required')
  const env = await loadProxyEnvironment()
  const target = await prepareRuntime({ env })
  if (process.argv.includes('--prepare-only')) {
    log(`Runtime ready: ${target}`)
    return
  }
  // MCP is a separate process: DSH's host dispatcher cannot be inherited here.
  const { configureProxy } = await import(pathToFileURL(join(target, 'runtime-proxy.mjs')).href)
  const proxy = configureProxy(env)
  log(proxy ? 'Proxy routing enabled from environment; loopback Gateways stay direct.' : 'No proxy configured; preserving host fetch routing.')
  await import(pathToFileURL(join(target, 'adapter.mjs')).href)
}

// Canonicalize both sides: macOS has /var symlinks and Windows can vary path casing.
const entryPaths = process.argv[1] && await Promise.all([
  realpath(resolve(process.argv[1])),
  realpath(fileURLToPath(import.meta.url)),
]).catch(() => null)
if (entryPaths && entryPaths[0] === entryPaths[1]) {
  main().catch(error => { log(error.stack || error.message); process.exitCode = 1 })
}
