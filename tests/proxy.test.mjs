import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { createServer } from 'node:http'
import { connect } from 'node:net'
import { once } from 'node:events'
import { cp, mkdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { createRequire } from 'node:module'
import test from 'node:test'
import { resolveCore } from '../src/core-resolution.mjs'
import { temporaryDirectory, writeBundle } from './helpers/bundle.mjs'
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

test('managed MCP proxies registry and artifact requests through ALL_PROXY without bundled dependencies', async t => {
  const root = await temporaryDirectory(t)
  const tar = require(createRequire(resolveCore().entry).resolve('tar'))
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
  // Only the test proxy can resolve these synthetic registry/artifact origins.
  const proxyRequests = []
  const proxy = createServer((req, res) => {
    proxyRequests.push(req.url)
    res.writeHead(502).end()
  })
  proxy.on('connect', (req, socket, head) => {
    proxyRequests.push(req.url)
    const upstream = connect(port, '127.0.0.1', () => {
      socket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
      if (head.length) upstream.write(head)
      socket.pipe(upstream).pipe(socket)
    })
    upstream.on('error', () => socket.destroy())
    socket.on('close', () => upstream.destroy())
  })
  const proxyPort = await listen(t, proxy)
  const managed = join(root, 'managed')
  await mkdir(join(managed, 'mcp'), { recursive: true })
  await cp(new URL('../mcp/', import.meta.url), join(managed, 'mcp'), { recursive: true })
  const env = isolatedEnvironment(join(root, 'user'), join(root, 'kimi'))
  for (const key of ['HTTP_PROXY', 'HTTPS_PROXY', 'ALL_PROXY', 'NO_PROXY', 'http_proxy', 'https_proxy', 'all_proxy', 'no_proxy']) delete env[key]
  // Fix the host configuration for this test; production keeps the user's settings.
  delete env.NODE_OPTIONS
  env.NODE_USE_ENV_PROXY = '0'
  // Prepare real npm dependencies before enabling the synthetic artifact-only proxy.
  // Bootstrap forwarding itself is covered by runtime-bootstrap.test.mjs.
  await promisify(execFile)(process.execPath, [join(managed, 'mcp/forge-mcp.mjs'), '--prepare-only'], { env })
  env.ALL_PROXY = `http://127.0.0.1:${proxyPort}`
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
    assert.ok(proxyRequests.includes('registry.invalid:80'))
    assert.ok(proxyRequests.includes('artifact.invalid:80'))
  } finally { await mcp.close() }
})
