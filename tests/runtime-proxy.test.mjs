import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import { createServer as tcpServer, connect } from 'node:net'
import { once } from 'node:events'
import test from 'node:test'
import { createProxyDispatcher, configureProxy } from '../src/runtime-proxy.mjs'

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
async function proxy(t, target, socks = false) {
  const destinations = []
  function tunnel(socket, head) {
    const upstream = connect(target, '127.0.0.1', () => {
      socket.write(socks ? Buffer.from([5,0,0,1,127,0,0,1,0,0]) : 'HTTP/1.1 200 Connection Established\r\n\r\n')
      if (head.length) upstream.write(head)
      socket.pipe(upstream).pipe(socket)
    })
    upstream.on('error', () => socket.destroy())
    socket.on('close', () => upstream.destroy())
  }
  const server = socks ? tcpServer(socket => {
    let buffer = Buffer.alloc(0), greeted = false
    const receive = chunk => {
      buffer = Buffer.concat([buffer, chunk])
      if (!greeted) {
        if (buffer.length < 2 || buffer.length < 2 + buffer[1]) return
        buffer = buffer.subarray(2 + buffer[1]); greeted = true
        socket.write(Buffer.from([5,0]))
      }
      if (buffer.length < 5) return
      const length = buffer[3] === 3 ? 7 + buffer[4] : buffer[3] === 1 ? 10 : 22
      if (buffer.length < length) return
      destinations.push(buffer[3] === 3 ? buffer.subarray(5,5+buffer[4]).toString() : 'ip')
      socket.removeListener('data', receive)
      tunnel(socket, buffer.subarray(length))
    }
    socket.on('data', receive)
  }) : createServer()
  if (!socks) server.on('connect', (req, socket, head) => { destinations.push(req.url); tunnel(socket, head) })
  return { port: await listen(t, server), destinations }
}
function dispatcher(t, env) {
  const agent = createProxyDispatcher(env)
  t.after(() => agent?.destroy())
  return agent
}
test('no explicit proxy preserves host routing; invalid protocols fail without exposing credentials', () => {
  assert.equal(configureProxy({}), null)
  assert.throws(() => createProxyDispatcher({ALL_PROXY:'ftp://user:secret@localhost'}), /Unsupported proxy protocol/)
})
for (const scheme of ['http', 'socks5', 'socks5h']) {
  test(`${scheme} ALL_PROXY tunnels remote origins and keeps loopback and redirects direct`, async t => {
    const local = await listen(t, createServer((req,res) => res.end('gateway')))
    const remote = await listen(t, createServer((req,res) => {
      if (req.url === '/redirect') res.writeHead(302,{location:`http://127.0.0.1:${local}/tools`}).end()
      else res.end('artifact')
    }))
    const p = await proxy(t, remote, scheme !== 'http')
    const agent = dispatcher(t, {ALL_PROXY:`${scheme}://127.0.0.1:${p.port}`})
    assert.equal(await (await fetch('http://artifact.invalid/file',{dispatcher:agent})).text(),'artifact')
    assert.equal(await (await fetch('http://artifact.invalid/redirect',{dispatcher:agent})).text(),'gateway')
    assert.equal(await (await fetch(`http://127.0.0.1:${local}/tools`,{dispatcher:agent})).text(),'gateway')
    assert.ok(p.destinations.length > 0)
    assert.ok(p.destinations.every(value => value.startsWith('artifact.invalid')))
  })
}
test('HTTPS uses HTTPS_PROXY over ALL_PROXY; lowercase HTTP override and failed proxy do not fall back direct', async t => {
  const destinations = []
  const server = createServer()
  server.on('connect',(req,socket) => { destinations.push(req.url); socket.end('HTTP/1.1 502 Rejected\r\nContent-Length: 0\r\n\r\n') })
  const port = await listen(t,server)
  const agent = dispatcher(t,{HTTPS_PROXY:`http://127.0.0.1:${port}`,ALL_PROXY:'http://127.0.0.1:1'})
  await assert.rejects(fetch('https://artifact.invalid/file',{dispatcher:agent}))
  assert.deepEqual(destinations,['artifact.invalid:443'])
  const lower = dispatcher(t,{HTTP_PROXY:'http://127.0.0.1:1',http_proxy:`http://127.0.0.1:${port}`})
  await assert.rejects(fetch('http://artifact.invalid/file',{dispatcher:lower}))
  assert.equal(destinations.at(-1),'artifact.invalid:80')
})
test('NO_PROXY domain rules bypass the proxy', async t => {
  const agent = dispatcher(t,{HTTP_PROXY:'http://127.0.0.1:1',no_proxy:'*.invalid,10.0.0.0/8'})
  await assert.rejects(fetch('http://missing.invalid',{dispatcher:agent}), error => error.cause?.code === 'ENOTFOUND')
})
