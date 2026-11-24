import assert from 'node:assert/strict'
import { chmod, cp, mkdir, readFile, readdir } from 'node:fs/promises'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import { createHash } from 'node:crypto'
import { temporaryDirectory, writeBundle } from './helpers/bundle.mjs'
import { isolatedEnvironment, startMcp } from './helpers/mcp.mjs'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const tar = createRequire(import.meta.resolve('@x-era/forge-core'))('tar')

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  return `http://127.0.0.1:${server.address().port}`
}

async function managedMcp(t) {
  const root = await temporaryDirectory(t)
  const userHome = join(root, 'user')
  const kimiHome = join(userHome, '.kimi-code')
  const managed = join(kimiHome, 'plugins', 'managed', 'phyagentos')
  await mkdir(managed, { recursive: true })
  await mkdir(join(userHome, '.dsh'))
  for (const item of ['mcp', 'kimi.plugin.json', 'SYSTEM.md', 'skills', 'commands', 'locales']) {
    await cp(join(repoRoot, item), join(managed, item), { recursive: true })
  }
  const mcp = startMcp(managed, isolatedEnvironment(userHome, kimiHome))
  return { root, userHome, kimiHome, home: join(kimiHome, 'forge'), mcp }
}

test('same-session setup without config persistence can start a synthetic runtime and reconcile actions', {
  skip: process.platform === 'win32' && 'Executable test fixture uses a POSIX shebang',
  timeout: 20000,
}, async t => {
  const { root, userHome, home, mcp } = await managedMcp(t)
  let started = false
  try {
    // Reserve an ephemeral port, then let only the test-owned process bind it.
    const probe = createServer()
    const gatewayUrl = await listen(probe)
    await new Promise(resolve => probe.close(resolve))
    const models = join(root, 'shared-models')
    await mkdir(models)
    await chmod(models, 0o555)
    const config = await mcp.callTool('forge_config_write', { config: {
      models: { root: models }, runtime: { startTimeoutMs: 4000 }, gateway: { callTimeoutMs: 1000 },
    } })
    assert.equal(config.isError, false)
    await writeBundle(join(home, 'skills', 'audit-demo'), { gatewayUrl, environment: { FORGE_TEST_GATEWAY_URL: gatewayUrl } })
    const bins = join(root, 'bins')
    await mkdir(bins)
    for (const name of ['dora', 'dora1']) {
      await cp(join(repoRoot, 'tests', 'fixtures', 'dora.mjs'), join(bins, name))
      await chmod(join(bins, name), 0o755)
    }
    const setup = await mcp.callTool('forge_environment_setup', {
      dora_binary_path: join(bins, 'dora'), dora1_binary_path: join(bins, 'dora1'),
      write_config: false, offline: true,
    })
    assert.equal(setup.isError, false)
    assert.equal(setup.payload.ok, true)
    const currentConfig = await mcp.callTool('forge_config_read')
    assert.equal(currentConfig.payload.config.runtime.dora1, undefined)
    const start = await mcp.callTool('forge_runtime_start', { name: 'audit-demo', profile: 'default', mode: 'run' })
    started = !start.isError
    assert.equal(start.isError, false, JSON.stringify(start.payload))
    assert.equal(start.payload.status, 'healthy')
    assert.equal(start.payload.dora, join(home, 'support', 'bin', 'dora1'))
    const context = await mcp.callTool('forge_tool_context', { name: 'audit-demo', tool_id: 'sim.ping' })
    assert.equal(context.payload.readiness, true)
    const query = await mcp.callTool('forge_tool_call', { name: 'audit-demo', tool_id: 'sim.ping', arguments: { value: 7 } })
    assert.deepEqual(query.payload.outputs.arguments, { value: 7 })
    for (const unknown of [false, true]) {
      const action = await mcp.callTool('forge_tool_call', {
        name: 'audit-demo', tool_id: 'sim.action', arguments: { unknown },
      })
      assert.equal(action.payload.httpStatus, 202)
      assert.equal(action.payload.data.phase, unknown ? 'unknown' : 'pending')
      const terminal = await mcp.callTool('forge_invocation_read', { name: 'audit-demo', invocation_id: action.payload.invocationId })
      assert.equal(terminal.payload.status.phase, 'completed')
      assert.equal(terminal.payload.result.reached_goal, true)
    }
    // Reconciliation must not send an Action twice.
    const counts = await mcp.callTool('forge_tool_call', { name: 'audit-demo', tool_id: 'sim.ping' })
    assert.equal(counts.payload.outputs.actions, 2)
    const failure = await mcp.callTool('forge_tool_call', { name: 'audit-demo', tool_id: 'sim.missing' })
    assert.equal(failure.isError, true)
    assert.equal(failure.payload.code, 'FORGE_GATEWAY_UNREACHABLE')
    assert.deepEqual(await readdir(models), [])
    assert.deepEqual(await readdir(join(userHome, '.dsh')), [])
  } finally {
    // This test owns this synthetic process; never stop any user's runtime.
    if (started) {
      const stop = await mcp.callTool('forge_runtime_stop', { name: 'audit-demo' })
      assert.equal(stop.isError, false)
    }
    await mcp.close()
  }
})

test('an active install remains cancellable while a config refresh waits, and its job survives restore', { timeout: 20000 }, async t => {
  const { root, home, mcp } = await managedMcp(t)
  const bundle = await writeBundle(join(root, 'bundle'))
  const archive = join(root, 'bundle.tar.gz')
  await tar.create({ gzip: true, cwd: bundle, file: archive }, ['skill.yaml', 'SKILL.md', 'profiles'])
  const bytes = await readFile(archive)
  let url
  let sawDownload
  const downloading = new Promise(resolve => { sawDownload = resolve })
  const server = createServer((req, res) => {
    if (req.url === '/v1/skills/audit-demo') {
      res.setHeader('content-type', 'application/json')
      res.end(JSON.stringify({ name: 'audit-demo', version: '0.1.0', download_url: `${url}/bundle`,
        sha256: createHash('sha256').update(bytes).digest('hex'), size: bytes.length }))
    } else if (req.url === '/bundle') {
      res.writeHead(200, { 'content-length': bytes.length })
      res.write(bytes.subarray(0, 1))
      sawDownload()
      // Deliberately leave this response pending until cancellation closes it.
    } else {
      res.writeHead(404).end()
    }
  })
  url = await listen(server)
  try {
    assert.equal((await mcp.callTool('forge_config_write', { config: { registry: { url } } })).isError, false)
    const install = await mcp.callTool('forge_skill_install', { name: 'audit-demo', nodes: false })
    assert.equal(install.isError, false)
    const jobId = install.payload.id
    await downloading
    const refreshing = mcp.callTool('forge_config_write', { config: { gateway: { callTimeoutMs: 2500 } } })
    const cancel = await mcp.callTool('forge_install_cancel', { job_id: jobId })
    assert.equal(cancel.payload.cancelled, true)
    const refreshed = await refreshing
    assert.equal(refreshed.isError, false)
    const status = await mcp.callTool('forge_install_status', { job_id: jobId })
    assert.equal(status.payload.state, 'cancelled')
    const restored = await mcp.callTool('forge_config_restore', { backup: refreshed.payload.backup })
    assert.equal(restored.isError, false)
    const afterRestore = await mcp.callTool('forge_install_status', { job_id: jobId })
    assert.equal(afterRestore.payload.id, jobId)
    assert.equal(afterRestore.payload.state, 'cancelled')
    assert.equal((await mcp.callTool('forge_config_read')).payload.config.gateway, undefined)
    await assert.rejects(readFile(join(home, 'skills', 'audit-demo', 'skill.yaml')), { code: 'ENOENT' })
  } finally {
    server.closeAllConnections()
    await new Promise(resolve => server.close(resolve))
    await mcp.close()
  }
})
