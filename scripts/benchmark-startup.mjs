#!/usr/bin/env node
// Measures offline initialize latency in a fresh temporary user home per process.
import { execFile, spawn } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { createInterface } from 'node:readline'
import { fileURLToPath } from 'node:url'

const runs = Number(process.argv[2] ?? 10)
if (!Number.isInteger(runs) || runs < 1 || runs > 100) throw new Error('Usage: benchmark-startup.mjs [runs: 1..100]')
const cwd = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const root = await mkdtemp(join(tmpdir(), 'kimi-forge-startup-'))
const durations = []
const preparationMs = []
const execFileAsync = promisify(execFile)
try {
  for (let i = 0; i < runs; i++) {
    const home = join(root, String(i))
    const env = { ...process.env, HOME: home, KIMI_CODE_HOME: join(home, '.kimi-code') }
    for (const key of Object.keys(env)) {
      if (key.startsWith('KIMI_FORGE_') || key.startsWith('DSH_FORGE_')) delete env[key]
    }
    const preparing = performance.now()
    await execFileAsync(process.execPath, ['./mcp/forge-mcp.mjs', '--prepare-only'], { cwd, env, timeout: 300000 })
    preparationMs.push(Number((performance.now() - preparing).toFixed(2)))
    const started = performance.now()
    const child = spawn(process.execPath, ['./mcp/forge-mcp.mjs'], { cwd, env, stdio: ['pipe', 'pipe', 'pipe'] })
    await new Promise((resolve, reject) => {
      let measured
      let errorText = ''
      let failure
      const timer = setTimeout(() => { failure = new Error('MCP initialize timed out'); child.kill('SIGKILL') }, 10000)
      child.on('error', error => { clearTimeout(timer); reject(error) })
      child.stderr.on('data', chunk => { errorText += chunk })
      createInterface({ input: child.stdout }).on('line', line => {
        try {
          const reply = JSON.parse(line)
          if (reply.id === 1 && reply.result?.serverInfo && measured === undefined) {
            measured = performance.now() - started
            child.stdin.end()
          }
        } catch (error) { failure = error; child.kill('SIGKILL') }
      })
      child.once('close', code => {
        clearTimeout(timer)
        if (failure || code !== 0 || measured === undefined) reject(failure ?? new Error(`MCP exited ${code}: ${errorText}`))
        else { durations.push(measured); resolve() }
      })
      child.stdin.on('error', error => { failure = error; child.kill('SIGKILL') })
      child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {} } })}\n`)
    })
  }
  const sorted = [...durations].sort((a, b) => a - b)
  const percentile = p => Number(sorted[Math.ceil(sorted.length * p) - 1].toFixed(2))
  console.log(JSON.stringify({
    node: process.version, platform: process.platform, arch: process.arch, runs,
    metric: 'process spawn to initialize after npm dependency preparation; no Registry request; warm OS cache possible',
    preparationMs,
    p50Ms: percentile(0.5), p95Ms: percentile(0.95),
    targetMs: 50, targetMet: percentile(0.95) <= 50,
    samplesMs: durations.map(value => Number(value.toFixed(2))),
  }, null, 2))
} finally {
  await rm(root, { recursive: true, force: true })
}
