import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { chmod, cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { createInterface } from 'node:readline'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function startMcp(cwd, env) {
  const child = spawn(process.execPath, ['./mcp/forge-mcp.mjs'], {
    cwd,
    env,
    stdio: ['pipe', 'pipe', 'pipe'],
  })
  const pending = new Map()
  let nextId = 1
  const stderrLines = []

  createInterface({ input: child.stderr }).on('line', line => stderrLines.push(line))
  createInterface({ input: child.stdout }).on('line', line => {
    const msg = JSON.parse(line)
    const waiter = pending.get(msg.id)
    if (waiter) {
      pending.delete(msg.id)
      waiter(msg)
    }
  })

  return {
    stderrLines,
    notify(method, params = {}) {
      child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method, params })}\n`)
    },
    request(method, params = {}) {
      const id = nextId++
      return new Promise((resolveReply, rejectReply) => {
        const timer = setTimeout(() => {
          pending.delete(id)
          rejectReply(new Error(`MCP timeout waiting for ${method} (stderr: ${stderrLines.join(' | ')})`))
        }, 15000)
        pending.set(id, msg => {
          clearTimeout(timer)
          resolveReply(msg)
        })
        child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`)
      })
    },
    async callTool(name, args = {}) {
      const reply = await this.request('tools/call', { name, arguments: args })
      assert.equal(reply.error, undefined)
      return {
        isError: reply.result.isError,
        payload: JSON.parse(reply.result.content[0].text),
      }
    },
    async close() {
      child.stdin.end()
      await new Promise(r => child.once('exit', r))
    },
  }
}

test('managed plugin copy runs without node_modules, isolates ~/.kimi-code/forge and reloads dora in-session', async () => {
  const sandbox = await mkdtemp(join(tmpdir(), 'kimi-plugin-e2e-'))
  try {
    const fakeUserHome = join(sandbox, 'user-home')
    const fakeDshCanary = join(fakeUserHome, '.dsh')
    const fakeKimiHome = join(fakeUserHome, '.kimi-code')
    const managedDir = join(fakeKimiHome, 'plugins', 'managed', 'phyagentos')

    await mkdir(fakeDshCanary, { recursive: true })
    await mkdir(managedDir, { recursive: true })

    // Copy plugin payload WITHOUT node_modules, exactly like Kimi's plugin installer.
    for (const item of ['kimi.plugin.json', 'SYSTEM.md', 'mcp', 'skills', 'commands', 'locales']) {
      await cp(join(repoRoot, item), join(managedDir, item), { recursive: true })
    }

    const mcp = startMcp(managedDir, {
      ...process.env,
      HOME: fakeUserHome,
      KIMI_CODE_HOME: fakeKimiHome,
      DSH_HOME: '',
      DSH_FORGE_HOME: '',
      KIMI_FORGE_HOME: '',
    })

    try {
      // 1. Protocol negotiation & notifications
      const init = await mcp.request('initialize', { protocolVersion: '2025-06-18', capabilities: {} })
      assert.equal(init.result.protocolVersion, '2025-06-18')
      assert.equal(init.result.serverInfo.name, 'phyagentos-kimi-mcp')
      mcp.notify('notifications/initialized')
      const ping = await mcp.request('ping')
      assert.deepEqual(ping.result, {})

      // 2. Full 41-tool surface
      const listReply = await mcp.request('tools/list')
      const names = listReply.result.tools.map(t => t.name)
      assert.equal(names.length, 41)
      assert.ok(names.includes('forge_skill_package'))
      assert.ok(names.includes('forge_skill_install_local'))

      // 3. Offline environment check points strictly to ~/.kimi-code/forge
      const envBefore = await mcp.callTool('forge_environment_check', { offline: true })
      assert.equal(envBefore.isError, false)
      assert.equal(envBefore.payload.home, join(fakeKimiHome, 'forge'))

      // 4. Same-session Dora bootstrap + live reload without restarting MCP
      const fakeBinDir = join(sandbox, 'fake-bins')
      await mkdir(fakeBinDir, { recursive: true })
      const fakeDora = join(fakeBinDir, 'dora-mock')
      const fakeDora1 = join(fakeBinDir, 'dora1-mock')
      await writeFile(fakeDora, '#!/bin/sh\necho "dora-cli 0.4.1"\n', 'utf8')
      await writeFile(fakeDora1, '#!/bin/sh\necho "dora-cli 1.0.1"\n', 'utf8')
      await chmod(fakeDora, 0o755)
      await chmod(fakeDora1, 0o755)

      const setupRes = await mcp.callTool('forge_environment_setup', {
        dora_binary_path: fakeDora,
        dora1_binary_path: fakeDora1,
        write_config: true,
        offline: true,
      })
      assert.equal(setupRes.isError, false)
      assert.equal(setupRes.payload.ok, true)
      assert.ok(setupRes.payload.configUpdated.path.endsWith('/forge/config.json'))

      const envAfter = await mcp.callTool('forge_environment_check', { offline: true })
      const doraCheck = envAfter.payload.checks.find(c => c.id === 'dora')
      const dora1Check = envAfter.payload.checks.find(c => c.id === 'dora1')
      assert.equal(doraCheck.status, 'pass')
      assert.equal(dora1Check.status, 'pass')

      // 5. Local skill validate -> install -> package -> export to Kimi user skills (~/.kimi-code/skills)
      const bundleSrc = join(fakeUserHome, 'demo-bundle', 'demo-sim')
      await mkdir(join(bundleSrc, 'profiles', 'default'), { recursive: true })
      await writeFile(join(bundleSrc, 'SKILL.md'), '# Demo Sim\n\nRun demo simulation.\n', 'utf8')
      await writeFile(join(bundleSrc, 'profiles', 'default', 'dataflow.yaml'), 'nodes: []\n', 'utf8')
      await writeFile(
        join(bundleSrc, 'skill.yaml'),
        [
          'manifest_version: 2',
          'name: demo-sim',
          'version: 0.1.0',
          'description: Minimal simulation bundle for Kimi MCP integration testing.',
          'skill_document: SKILL.md',
          'gateway_url: http://127.0.0.1:19299',
          'required_tools: [sim.ping]',
          'profiles:',
          '  default:',
          '    dataflow: profiles/default/dataflow.yaml',
          '',
        ].join('\n'),
        'utf8',
      )

      // Validate using ~/ tilde path to prove tilde expansion in MCP args
      const valid = await mcp.callTool('forge_skill_validate', { path: '~/demo-bundle/demo-sim' })
      assert.equal(valid.isError, false)
      assert.equal(valid.payload.ok, true)

      // Copy into isolated skills dir, package into tar.gz, remove, then reinstall via forge_skill_install_local
      await cp(bundleSrc, join(fakeKimiHome, 'forge', 'skills', 'demo-sim'), { recursive: true })
      const pkg = await mcp.callTool('forge_skill_package', { name: 'demo-sim' })
      assert.equal(pkg.isError, false)
      assert.ok(pkg.payload.archivePath.endsWith('.tar.gz'))

      await mcp.callTool('forge_skill_remove', { name: 'demo-sim' })
      const localInstall = await mcp.callTool('forge_skill_install_local', { path: pkg.payload.archivePath })
      assert.equal(localInstall.isError, false)
      assert.equal(localInstall.payload.name, 'demo-sim')

      const exported = await mcp.callTool('forge_skill_export', { name: 'demo-sim', kimi_skills: true })
      assert.equal(exported.isError, false)
      assert.equal(exported.payload.path, join(fakeKimiHome, 'skills', 'demo-sim'))
      const exportedMd = await readFile(join(exported.payload.path, 'SKILL.md'), 'utf8')
      assert.match(exportedMd, /name: demo-sim/)

      // 6. Canary check: ~/.dsh was NEVER touched
      assert.deepEqual(await readdir(fakeDshCanary), [])
    } finally {
      await mcp.close()
    }
  } finally {
    await rm(sandbox, { recursive: true, force: true })
  }
})
