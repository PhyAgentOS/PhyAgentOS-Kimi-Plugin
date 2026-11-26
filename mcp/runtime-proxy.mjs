import { BlockList, isIP } from 'node:net'
import { Agent, Dispatcher, EnvHttpProxyAgent, getGlobalDispatcher, setGlobalDispatcher } from 'undici'

export function isLoopback(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '')
  return host === 'localhost' || host.endsWith('.localhost') || host === '::1'
    || (isIP(host) === 4 && host.startsWith('127.'))
    || /^::ffff:7f[0-9a-f]{2}:/i.test(host)
    || /^::ffff:127\./i.test(host)
}

/** Supply the proxy initialization that DSH performs in its host, for this MCP process. */
export function createProxyDispatcher(env = process.env) {
  const value = name => env[name.toLowerCase()] ?? env[name] ?? ''
  const all = value('ALL_PROXY')
  const http = value('HTTP_PROXY') || all
  const https = value('HTTPS_PROXY') || all || value('HTTP_PROXY')
  if (!http && !https) return null
  const normalize = proxy => {
    if (!proxy) return ''
    const normalized = proxy.replace(/^socks5h:/i, 'socks5:')
    let url
    try { url = new URL(normalized) } catch { throw new Error('Invalid proxy URL; check HTTP_PROXY, HTTPS_PROXY and ALL_PROXY') }
    if (!['http:', 'https:', 'socks:', 'socks5:'].includes(url.protocol)) throw new Error('Unsupported proxy protocol; use HTTP, HTTPS or SOCKS5')
    return normalized
  }
  // Validate before allocating dispatchers. Never log credentials or proxy URLs.
  const httpProxy = normalize(http)
  const httpsProxy = normalize(https)
  const noProxy = value('NO_PROXY')
  const subnets = new BlockList()
  for (const entry of noProxy.split(/[,\s]+/)) {
    if (!entry.includes('/')) continue
    const [address, prefix, extra] = entry.split('/')
    const family = isIP(address)
    const bits = Number(prefix)
    if (!extra && family && /^\d+$/.test(prefix) && bits >= 0 && bits <= (family === 4 ? 32 : 128)) {
      subnets.addSubnet(address, bits, family === 4 ? 'ipv4' : 'ipv6')
    }
  }
  const external = new EnvHttpProxyAgent({ httpProxy, httpsProxy, noProxy })
  const direct = new Agent()
  return new class extends Dispatcher {
    dispatch(options, handler) {
      const hostname = new URL(options.origin).hostname.replace(/^\[|\]$/g, '')
      const family = isIP(hostname)
      const bypass = isLoopback(hostname) || (family && subnets.check(hostname, family === 4 ? 'ipv4' : 'ipv6'))
      return (bypass ? direct : external).dispatch(options, handler)
    }
    async close() { await Promise.all([direct.close(), external.close()]) }
    async destroy(error) { await Promise.all([direct.destroy(error), external.destroy(error)]) }
  }()
}

export function configureProxy(env = process.env) {
  const dispatcher = createProxyDispatcher(env)
  if (!dispatcher) return null // Preserve any dispatcher supplied by the host.
  const previous = getGlobalDispatcher()
  setGlobalDispatcher(dispatcher)
  return { dispatcher, async dispose() {
    if (getGlobalDispatcher() === dispatcher) setGlobalDispatcher(previous)
    await dispatcher.destroy()
  } }
}
