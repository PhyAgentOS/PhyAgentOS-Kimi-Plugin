import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'
import { parseEnv } from 'node:util'

const names = ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'NO_PROXY']
const warnDefault = message => process.stderr.write(`[phyagentos-proxy] ${message}\n`)
export const proxyValue = (env, name) => env[name.toLowerCase()]?.trim() || env[name]?.trim() || ''

/** Read only user-level proxy settings, never a project's .env or DSH files. */
export async function loadProxyEnvironment(env = process.env, warn = warnDefault) {
  const home = env.KIMI_CODE_HOME?.trim()
  const expanded = home === '~' ? homedir() : home?.startsWith('~/') || home?.startsWith('~\\') ? join(homedir(), home.slice(2)) : home
  const path = join(expanded ? resolve(expanded) : join(homedir(), '.kimi-code'), '.env')
  let settings = {}
  try {
    settings = parseEnv(await readFile(path, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') warn('Cannot read user proxy .env; using inherited environment only.')
  }
  const result = { ...env }
  for (const name of names) {
    // Process settings win across both spellings; lowercase wins within a source.
    const value = proxyValue(env, name) || proxyValue(settings, name)
    if (value) {
      result[name] = value
      result[name.toLowerCase()] = value
    }
  }
  return result
}

/** Select first, then validate: an invalid explicit value must not use a fallback. */
export function resolveProxySettings(env = process.env, warn = warnDefault) {
  const all = proxyValue(env, 'ALL_PROXY')
  const http = proxyValue(env, 'HTTP_PROXY') || all
  const https = proxyValue(env, 'HTTPS_PROXY') || all || proxyValue(env, 'HTTP_PROXY')
  const normalize = (value, protocol) => {
    if (!value) return ''
    try {
      const normalized = value.replace(/^socks5h:/i, 'socks5:')
      const url = new URL(normalized)
      if (!['http:', 'https:', 'socks:', 'socks5:'].includes(url.protocol) || !url.hostname) throw new Error('invalid proxy')
      return normalized
    } catch {
      // Do not expose addresses or credentials in diagnostics.
      warn(`Invalid or unsupported ${protocol} proxy; corresponding requests will connect directly.`)
      return ''
    }
  }
  return { httpProxy: normalize(http, 'HTTP'), httpsProxy: normalize(https, 'HTTPS'), noProxy: proxyValue(env, 'NO_PROXY'), configured: Boolean(http || https) }
}

/** npm has its own transport; bridge HTTP(S) settings before the first install. */
export function npmProxyEnvironment(env = process.env, warn = warnDefault) {
  const settings = resolveProxySettings(env, warn)
  if (!settings.configured && !settings.noProxy) return env
  const result = { ...env }
  // npm may consult generic variables after an empty npm option; sanitize them too.
  for (const [name, value] of [['HTTP_PROXY', settings.httpProxy], ['HTTPS_PROXY', settings.httpsProxy]]) {
    result[name] = result[name.toLowerCase()] = /^https?:/i.test(value) ? value : ''
  }
  result.ALL_PROXY = result.all_proxy = ''
  for (const [name, value] of [['proxy', settings.httpProxy], ['https_proxy', settings.httpsProxy]]) {
    // Explicit npm options remain authoritative. Do not pass SOCKS URLs to npm.
    if (env[`npm_config_${name}`] !== undefined || env[`NPM_CONFIG_${name.toUpperCase()}`] !== undefined) continue
    const supported = /^https?:/i.test(value)
    result[`npm_config_${name}`] = supported ? value : ''
    if (value && !supported) warn('npm bootstrap requires an HTTP(S) proxy; configure an HTTP/Mixed port or npm proxy settings.')
  }
  if (settings.noProxy && env.npm_config_noproxy === undefined && env.NPM_CONFIG_NOPROXY === undefined) result.npm_config_noproxy = settings.noProxy
  return result
}
