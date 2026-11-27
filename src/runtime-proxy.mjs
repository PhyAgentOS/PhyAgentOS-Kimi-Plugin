import { BlockList, isIP } from 'node:net'
import { Agent, Dispatcher, EnvHttpProxyAgent, getGlobalDispatcher, setGlobalDispatcher } from 'undici'
import { resolveProxySettings } from './proxy-config.mjs'

export function isLoopback(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '')
  return host === 'localhost' || host.endsWith('.localhost') || host === '::1'
    || (isIP(host) === 4 && host.startsWith('127.'))
    || /^::ffff:7f[0-9a-f]{2}:/i.test(host)
    || /^::ffff:127\./i.test(host)
}

/** Supply the proxy initialization that DSH performs in its host, for this MCP process. */
export function createProxyDispatcher(env = process.env, warn) {
  const { httpProxy, httpsProxy, noProxy, configured } = resolveProxySettings(env, warn)
  if (!configured) return null
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
      const protocol = new URL(options.origin).protocol
      const bypass = isLoopback(hostname) || !(protocol === 'https:' ? httpsProxy : httpProxy)
        || (family && subnets.check(hostname, family === 4 ? 'ipv4' : 'ipv6'))
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
