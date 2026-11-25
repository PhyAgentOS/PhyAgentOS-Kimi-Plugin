#!/usr/bin/env node
// Test-only Dora/Gateway substitute. Never launches a dataflow or hardware node.
import { createServer } from 'node:http'

if (process.argv.includes('--version')) {
  process.stdout.write(`dora-cli ${process.argv[1].includes('dora1') ? '1.0.1' : '0.4.1'}\n`)
} else if (process.argv[2] === 'run') {
  const url = new URL(process.env.FORGE_TEST_GATEWAY_URL)
  if (url.hostname !== '127.0.0.1') throw new Error('Test gateway must bind loopback')
  let actions = 0
  const server = createServer(async (req, res) => {
    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks)) : {}
    res.setHeader('content-type', 'application/json')
    let payload
    if (req.url === '/tools') {
      payload = [
        { tool_id: 'sim.ping', semantics: 'query', endpoint_id: 'sim', operation: 'ping' },
        { tool_id: 'sim.action', semantics: 'action' },
      ]
    } else if (req.url.endsWith('/context')) {
      payload = { readiness: true, schema: { type: 'object' } }
    } else if (req.url === '/tools/sim/ping:invoke') {
      payload = { response: { result: { outputs: { pong: true, actions, arguments: body.arguments } } } }
    } else if (req.url === '/tools/sim.action:invoke') {
      actions++
      res.statusCode = 202
      payload = { invocation_id: `test-${actions}`, phase: body.arguments?.unknown ? 'unknown' : 'pending' }
    } else if (/^\/invocations\/test-\d+\/result$/.test(req.url)) {
      payload = { reached_goal: true }
    } else if (/^\/invocations\/test-\d+$/.test(req.url)) {
      payload = { phase: 'completed' }
    } else {
      res.statusCode = 404
      payload = { message: 'Synthetic test failure' }
    }
    res.end(JSON.stringify(payload))
  })
  server.listen(Number(url.port), '127.0.0.1')
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)))
} else {
  process.stderr.write('Unsupported test command\n')
  process.exitCode = 1
}
