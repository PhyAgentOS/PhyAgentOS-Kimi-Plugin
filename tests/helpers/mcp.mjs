import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createInterface } from 'node:readline'

export function startMcp(cwd, env) {
  const child = spawn(process.execPath, ['./mcp/forge-mcp.mjs'], { cwd, env, stdio: ['pipe', 'pipe', 'pipe'] })
  const pending = new Map()
  const stderrLines = []
  let nextId = 1
  let ended = false
  const failPending = error => {
    for (const waiter of pending.values()) waiter.reject(error)
    pending.clear()
  }
  const closed = new Promise(resolve => child.once('close', (code, signal) => {
    ended = true
    failPending(new Error(`MCP closed (${code ?? signal}): ${stderrLines.join(' | ')}`))
    resolve()
  }))
  child.on('error', failPending)
  child.stdin.on('error', failPending)
  createInterface({ input: child.stderr }).on('line', line => stderrLines.push(line))
  createInterface({ input: child.stdout }).on('line', line => {
    try {
      const msg = JSON.parse(line)
      pending.get(msg.id)?.resolve(msg)
    } catch (error) {
      failPending(new Error(`Invalid MCP stdout: ${error.message}`))
    }
  })
  return {
    stderrLines,
    notify(method, params = {}) {
      child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', method, params })}\n`)
    },
    request(method, params = {}) {
      if (ended) return Promise.reject(new Error('MCP has already closed'))
      const id = nextId++
      return new Promise((resolve, reject) => {
        const timer = setTimeout(() => pending.get(id)?.reject(new Error(`MCP timeout: ${method}; ${stderrLines.join(' | ')}`)), 15000)
        const finish = fn => value => {
          clearTimeout(timer)
          pending.delete(id)
          fn(value)
        }
        pending.set(id, { resolve: finish(resolve), reject: finish(reject) })
        child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`)
      })
    },
    async callTool(name, args = {}) {
      const reply = await this.request('tools/call', { name, arguments: args })
      assert.equal(reply.error, undefined)
      return { isError: reply.result.isError, payload: JSON.parse(reply.result.content[0].text) }
    },
    async close() {
      if (ended) return
      const timer = setTimeout(() => child.kill('SIGKILL'), 2000)
      child.stdin.end()
      await closed
      clearTimeout(timer)
    },
  }
}

export function isolatedEnvironment(userHome, kimiHome) {
  const env = { ...process.env, HOME: userHome, KIMI_CODE_HOME: kimiHome }
  // Unset overrides rather than setting empty strings (the upstream getters use ??).
  for (const key of Object.keys(env)) {
    if (key.startsWith('KIMI_FORGE_') || key.startsWith('DSH_FORGE_') || key === 'DSH_HOME'
      || /^(https?|all|no)_proxy$/i.test(key) || key === 'NODE_USE_ENV_PROXY') delete env[key]
  }
  return env
}
