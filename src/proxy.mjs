import { isIP } from 'node:net'
import { Agent, Dispatcher, EnvHttpProxyAgent, setGlobalDispatcher } from 'undici'

// Proxy policy belongs to this MCP process, not to the shared Core package.
// Always keep loopback robot Gateways direct, including after redirects.
export function isLoopback(hostname) {
  const host = hostname.toLowerCase().replace(/^\[|\]$/g, '').replace(/\.$/, '')
  return host === 'localhost' || host.endsWith('.localhost') || host === '::1'
    || (isIP(host) === 4 && host.startsWith('127.'))
    || /^::ffff:7f[0-9a-f]{2}:/i.test(host)
}

export function createProxyDispatcher(env = process.env) {
  const value = name => env[name.toLowerCase()] ?? env[name] ?? ''
  const all = value('ALL_PROXY')
  const http = value('HTTP_PROXY') || all
  const https = value('HTTPS_PROXY') || value('HTTP_PROXY') || all
  if (!http && !https) return null
  const normalize = proxy => proxy.replace(/^socks5h:/i, 'socks5:')
  const external = new EnvHttpProxyAgent({
    httpProxy: normalize(http), httpsProxy: normalize(https), noProxy: value('NO_PROXY'),
  })
  const direct = new Agent()
  return new class extends Dispatcher {
    dispatch(options, handler) {
      const agent = isLoopback(new URL(options.origin).hostname) ? direct : external
      return agent.dispatch(options, handler)
    }
    async close() { await Promise.all([direct.close(), external.close()]) }
    async destroy(error) { await Promise.all([direct.destroy(error), external.destroy(error)]) }
  }()
}

export function configureProxy(env = process.env) {
  const dispatcher = createProxyDispatcher(env)
  if (dispatcher) setGlobalDispatcher(dispatcher)
  return dispatcher
}
