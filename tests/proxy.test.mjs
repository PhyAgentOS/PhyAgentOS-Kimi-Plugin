import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import { createServer as createTcpServer, connect } from 'node:net'
import { once } from 'node:events'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import test from 'node:test'
import { createProxyDispatcher, isLoopback } from '../src/proxy.mjs'
import { temporaryDirectory } from './helpers/bundle.mjs'
import { isolatedEnvironment, startMcp } from './helpers/mcp.mjs'

const require = createRequire(import.meta.url)

async function listen(t, server) {
  const sockets = new Set()
  server.on('connection', socket => {
    sockets.add(socket)
    socket.on('error', () => {})
    socket.on('close', () => sockets.delete(socket))
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(async () => {
    for (const socket of sockets) socket.destroy()
    await new Promise(resolve => server.close(resolve))
  })
  return server.address().port
}

async function httpProxy(t, targetPort) {
  const destinations = []
  const server = createServer()
  server.on('connect', (req, socket, head) => {
    destinations.push(req.url)
    const upstream = connect(targetPort, '127.0.0.1', () => {
      socket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
      if (head.length) upstream.write(head)
      socket.pipe(upstream).pipe(socket)
    })
    upstream.on('error', () => socket.destroy())
    socket.on('close', () => upstream.destroy())
  })
  return { port: await listen(t, server), destinations }
}

async function socksProxy(t, targetPort) {
  const destinations = []
  const server = createTcpServer(socket => {
    let buffer = Buffer.alloc(0)
    let stage = 'greeting'
    const receive = chunk => {
      buffer = Buffer.concat([buffer, chunk])
      if (stage === 'greeting') {
        if (buffer.length < 2 || buffer.length < 2 + buffer[1]) return
        buffer = buffer.subarray(2 + buffer[1])
        socket.write(Buffer.from([5, 0]))
        stage = 'connect'
      }
      if (stage === 'connect') {
        if (buffer.length < 5) return
        const length = buffer[3] === 3 ? 5 + buffer[4] + 2 : buffer[3] === 1 ? 10 : 22
        if (buffer.length < length) return
        destinations.push(buffer[3] === 3 ? buffer.subarray(5, 5 + buffer[4]).toString() : 'ip')
        socket.removeListener('data', receive)
        const pending = buffer.subarray(length)
        const upstream = connect(targetPort, '127.0.0.1', () => {
          socket.write(Buffer.from([5, 0, 0, 1, 127, 0, 0, 1, 0, 0]))
          if (pending.length) upstream.write(pending)
          socket.pipe(upstream).pipe(socket)
        })
        upstream.on('error', () => socket.destroy())
        socket.on('close', () => upstream.destroy())
      }
    }
    socket.on('data', receive)
  })
  return { port: await listen(t, server), destinations }
}

const bytes = Buffer.from('proxy-test-artifact')
function dispatcher(t, env) {
  const agent = createProxyDispatcher(env)
  if (agent) t.after(() => agent.destroy())
  return agent
}

test('proxy configuration is optional and loopback addresses stay local', () => {
  assert.equal(createProxyDispatcher({}), null)
  for (const host of ['localhost', 'robot.localhost', '127.0.0.1', '127.2.3.4', '[::1]', '[::ffff:7f00:1]']) {
    assert.equal(isLoopback(host), true, host)
  }
  assert.equal(isLoopback('localhost.example.com'), false)
})

for (const key of ['HTTP_PROXY', 'http_proxy', 'ALL_PROXY']) {
  test(`${key} routes fetch through an HTTP proxy and keeps loopback direct`, async t => {
    const targetPort = await listen(t, createServer((req, res) => res.end(bytes)))
    const proxy = await httpProxy(t, targetPort)
    const agent = dispatcher(t, { [key]: `http://127.0.0.1:${proxy.port}` })
    assert.equal(await (await fetch('http://artifact.invalid/file', { dispatcher: agent })).text(), bytes.toString())
    assert.deepEqual(proxy.destinations, ['artifact.invalid:80'])
    assert.equal(await (await fetch(`http://127.0.0.1:${targetPort}/tools`, { dispatcher: agent })).text(), bytes.toString())
    assert.equal(proxy.destinations.length, 1)
  })
}

for (const scheme of ['socks5', 'socks5h']) {
  test(`ALL_PROXY supports ${scheme} with proxy-side DNS`, async t => {
    const targetPort = await listen(t, createServer((req, res) => res.end(bytes)))
    const proxy = await socksProxy(t, targetPort)
    const agent = dispatcher(t, { ALL_PROXY: `${scheme}://127.0.0.1:${proxy.port}` })
    assert.equal(await (await fetch('http://artifact.invalid/file', { dispatcher: agent })).text(), bytes.toString())
    assert.deepEqual(proxy.destinations, ['artifact.invalid'])
  })
}

test('HTTPS_PROXY overrides ALL_PROXY for HTTPS requests', async t => {
  const destinations = []
  const server = createServer()
  server.on('connect', (req, socket) => {
    destinations.push(req.url)
    socket.end('HTTP/1.1 502 Test Proxy Rejection\r\nContent-Length: 0\r\n\r\n')
  })
  const port = await listen(t, server)
  const agent = dispatcher(t, { ALL_PROXY: 'http://127.0.0.1:1', HTTPS_PROXY: `http://127.0.0.1:${port}` })
  await assert.rejects(fetch('https://artifact.invalid/file', { dispatcher: agent }))
  assert.deepEqual(destinations, ['artifact.invalid:443'])
})

test('redirects to loopback bypass the proxy and broken proxies fail closed', async t => {
  const localPort = await listen(t, createServer((req, res) => res.end('local gateway')))
  const remotePort = await listen(t, createServer((req, res) => {
    res.writeHead(302, { location: `http://127.0.0.1:${localPort}/tools` }).end()
  }))
  const proxy = await httpProxy(t, remotePort)
  const agent = dispatcher(t, { HTTP_PROXY: `http://127.0.0.1:${proxy.port}` })
  assert.equal(await (await fetch('http://artifact.invalid/redirect', { dispatcher: agent })).text(), 'local gateway')
  assert.deepEqual(proxy.destinations, ['artifact.invalid:80'])
  const broken = dispatcher(t, { HTTP_PROXY: 'http://127.0.0.1:1' })
  await assert.rejects(fetch('http://artifact.invalid/file', { dispatcher: broken }), error =>
    error.cause?.code === 'ECONNREFUSED')
})

test('NO_PROXY and lowercase precedence bypass a broken proxy', async t => {
  const port = await listen(t, createServer((req, res) => res.end(bytes)))
  const agent = dispatcher(t, { HTTP_PROXY: 'http://127.0.0.1:1', NO_PROXY: 'wrong.invalid', no_proxy: '*' })
  assert.equal(await (await fetch(`http://127.0.0.1:${port}`, { dispatcher: agent })).text(), bytes.toString())
  // Use a non-loopback origin to exercise NO_PROXY rather than the local bypass.
  const mock = dispatcher(t, { HTTP_PROXY: 'http://127.0.0.1:1', no_proxy: '*' })
  await assert.rejects(fetch('http://does-not-exist.invalid', { dispatcher: mock }), error =>
    error.cause?.code === 'ENOTFOUND')
})

test('bundled MCP proxies registry and artifact download without node_modules', async t => {
  const root = await temporaryDirectory(t)
  const { cp, mkdir } = await import('node:fs/promises')
  const tar = require(createRequire(import.meta.resolve('@x-era/forge-core')).resolve('tar'))
  const { writeBundle } = await import('./helpers/bundle.mjs')
  const bundle = await writeBundle(join(root, 'bundle'))
  const archive = join(root, 'bundle.tar.gz')
  await tar.create({ gzip: true, cwd: bundle, file: archive }, ['skill.yaml', 'SKILL.md', 'profiles'])
  const archiveBytes = await readFile(archive)
  const requests = []
  const port = await listen(t, createServer((req, res) => {
    requests.push(req.url)
    if (req.url === '/v1/skills/audit-demo') {
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ name: 'audit-demo', version: '0.1.0', download_url: 'http://artifact.invalid/bundle',
        sha256: createHash('sha256').update(archiveBytes).digest('hex'), size: archiveBytes.length }))
    } else if (req.url === '/bundle') res.end(archiveBytes)
    else res.writeHead(404).end()
  }))
  const proxy = await httpProxy(t, port)
  const managed = join(root, 'managed')
  await mkdir(join(managed, 'mcp'), { recursive: true })
  await cp(new URL('../mcp/forge-mcp.mjs', import.meta.url), join(managed, 'mcp', 'forge-mcp.mjs'))
  const env = isolatedEnvironment(join(root, 'user'), join(root, 'kimi'))
  for (const key of ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'NO_PROXY', 'http_proxy', 'https_proxy', 'all_proxy', 'no_proxy']) delete env[key]
  env.ALL_PROXY = `http://127.0.0.1:${proxy.port}`
  env.KIMI_FORGE_REGISTRY_URL = 'http://registry.invalid'
  const mcp = startMcp(managed, env)
  try {
    const install = await mcp.callTool('forge_skill_install', { name: 'audit-demo', nodes: false })
    assert.equal(install.isError, false)
    let status
    const deadline = Date.now() + 5000
    do {
      status = (await mcp.callTool('forge_install_status', { job_id: install.payload.id })).payload
      if (['succeeded', 'failed', 'cancelled'].includes(status.state)) break
      await new Promise(resolve => setTimeout(resolve, 10))
    } while (Date.now() < deadline)
    assert.equal(status.state, 'succeeded', JSON.stringify(status))
    assert.deepEqual(requests, ['/v1/skills/audit-demo', '/bundle'])
    assert.ok(proxy.destinations.includes('registry.invalid:80'))
    assert.ok(proxy.destinations.includes('artifact.invalid:80'))
  } finally { await mcp.close() }
})
