#!/usr/bin/env node
/**
 * Validate PhyAgentOS-Kimi-Plugin against Kimi's plugin manifest, skill, command,
 * path-containment, byte-budget, and bilingual README conventions.
 */
import { lstat, readdir, readFile, realpath } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = await realpath(resolve(dirname(fileURLToPath(import.meta.url)), '..'))
const MAX_SYSTEM_PROMPT_BYTES = 32 * 1024
const PLUGIN_ID_RE = /^[A-Za-z0-9_-]+(\.[A-Za-z0-9_-]+)*(@[A-Za-z0-9_-]+)?$/
const SKILL_NAME_RE = /^[a-z0-9_-]{1,25}$/
const UNSUPPORTED_KEYS = ['tools', 'apps', 'inject', 'configFile']

const errors = []
const fail = msg => errors.push(msg)

async function assertContained(relPath, label) {
  if (typeof relPath !== 'string' || !relPath.startsWith('./')) {
    fail(`${label} must start with "./" (got ${JSON.stringify(relPath)})`)
    return null
  }
  const candidate = resolve(root, relPath)
  let resolved
  try {
    resolved = await realpath(candidate)
  } catch {
    fail(`${label} target does not exist: ${relPath}`)
    return null
  }
  const rel = relative(root, resolved)
  if (rel.startsWith('..') || rel.includes('/..')) {
    fail(`${label} escapes plugin root: ${relPath} -> ${resolved}`)
    return null
  }
  return resolved
}

async function checkNoEscapingSymlinks(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === '.git') continue
    const full = join(dir, entry.name)
    const info = await lstat(full)
    if (info.isSymbolicLink()) {
      const target = await realpath(full).catch(() => null)
      if (!target || relative(root, target).startsWith('..')) {
        fail(`symlink escapes plugin root: ${relative(root, full)}`)
      }
    } else if (info.isDirectory()) {
      await checkNoEscapingSymlinks(full)
    }
  }
}

function parseFrontmatter(markdown) {
  if (!markdown.startsWith('---\n')) return null
  const end = markdown.indexOf('\n---\n', 4)
  if (end === -1) return null
  const raw = markdown.slice(4, end)
  const fields = {}
  for (const line of raw.split('\n')) {
    const idx = line.indexOf(':')
    if (idx > 0) {
      const key = line.slice(0, idx).trim()
      const val = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '')
      fields[key] = val
    }
  }
  return { fields, body: markdown.slice(end + 5) }
}

await checkNoEscapingSymlinks(root)

const manifestRaw = await readFile(join(root, 'kimi.plugin.json'), 'utf8')
const manifest = JSON.parse(manifestRaw)
const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
if (manifest.version !== pkg.version) fail('kimi.plugin.json and package.json versions must match')

if (!PLUGIN_ID_RE.test(manifest.name ?? '')) {
  fail(`kimi.plugin.json name "${manifest.name}" does not match Kimi plugin id pattern`)
}
for (const key of UNSUPPORTED_KEYS) {
  if (key in manifest) fail(`kimi.plugin.json contains unsupported runtime field "${key}"`)
}

// System prompt budget check
let promptBytes = 0
if (typeof manifest.systemPrompt === 'string') {
  const inlineBytes = Buffer.byteLength(manifest.systemPrompt, 'utf8')
  if (inlineBytes > MAX_SYSTEM_PROMPT_BYTES) fail(`systemPrompt exceeds 32 KB (${inlineBytes} bytes)`)
  promptBytes += inlineBytes
}
if (manifest.systemPromptPath !== undefined) {
  const sysPath = await assertContained(manifest.systemPromptPath, 'systemPromptPath')
  if (sysPath) {
    const fileBytes = Buffer.byteLength(await readFile(sysPath, 'utf8'), 'utf8')
    if (fileBytes > MAX_SYSTEM_PROMPT_BYTES) fail(`systemPromptPath exceeds 32 KB (${fileBytes} bytes)`)
    promptBytes += fileBytes
  }
}
if (promptBytes > 64 * 1024) fail(`combined system prompt exceeds 64 KB (${promptBytes} bytes)`)

// Skills check
const skillsDir = await assertContained(manifest.skills, 'skills')
const discoveredSkills = new Set()
if (skillsDir) {
  for (const entry of await readdir(skillsDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const skillMdPath = join(skillsDir, entry.name, 'SKILL.md')
    const content = await readFile(skillMdPath, 'utf8').catch(() => null)
    if (!content) {
      fail(`skill directory "${entry.name}" is missing SKILL.md`)
      continue
    }
    const fm = parseFrontmatter(content)
    if (!fm || !fm.fields.name || !fm.fields.description) {
      fail(`skills/${entry.name}/SKILL.md must declare non-empty name and description in frontmatter`)
      continue
    }
    if (fm.fields.name !== entry.name) {
      fail(`skills/${entry.name}/SKILL.md frontmatter name "${fm.fields.name}" does not match folder name`)
    }
    if (!SKILL_NAME_RE.test(fm.fields.name)) {
      fail(`skill name "${fm.fields.name}" violates Kimi naming rules ([a-z0-9_-]{1,25})`)
    }
    discoveredSkills.add(entry.name)
  }
}

// Commands check
const commandsDir = await assertContained(manifest.commands, 'commands')
if (commandsDir) {
  const cmdFiles = (await readdir(commandsDir)).filter(f => f.endsWith('.md'))
  if (cmdFiles.length === 0) fail('commands directory contains no .md command files')
  for (const file of cmdFiles) {
    const text = await readFile(join(commandsDir, file), 'utf8')
    if (text.trim().length === 0) fail(`commands/${file} is empty`)
  }
}

// MCP servers check
const servers = manifest.mcpServers ?? {}
if (Object.keys(servers).length === 0) fail('mcpServers must declare at least one server')
for (const [serverKey, cfg] of Object.entries(servers)) {
  if (cfg.command) {
    if (cfg.command.startsWith('./')) await assertContained(cfg.command, `mcpServers.${serverKey}.command`)
    for (const arg of cfg.args ?? []) {
      if (typeof arg === 'string' && arg.startsWith('./')) {
        await assertContained(arg, `mcpServers.${serverKey}.args`)
      }
    }
    if (cfg.cwd !== undefined) await assertContained(cfg.cwd, `mcpServers.${serverKey}.cwd`)
  } else if (!cfg.url) {
    fail(`mcpServers.${serverKey} must declare either command or url`)
  }
}

// Locales & overrides check
if (manifest.interface?.locales) {
  const localesDir = await assertContained(manifest.interface.locales, 'interface.locales')
  if (localesDir) {
    for (const file of (await readdir(localesDir)).filter(f => f.endsWith('.json'))) {
      const locale = JSON.parse(await readFile(join(localesDir, file), 'utf8'))
      for (const mcpKey of Object.keys(locale.mcpOverrides ?? {})) {
        if (!(mcpKey in servers)) fail(`locales/${file} mcpOverrides references unknown server "${mcpKey}"`)
      }
      for (const skillKey of Object.keys(locale.skillOverrides ?? {})) {
        if (!discoveredSkills.has(skillKey)) fail(`locales/${file} skillOverrides references unknown skill "${skillKey}"`)
      }
    }
  }
}

// Bilingual README reciprocal link check
const readmeEn = await readFile(join(root, 'README.md'), 'utf8').catch(() => null)
const readmeZh = await readFile(join(root, 'README_zh.md'), 'utf8').catch(() => null)
if (!readmeEn) fail('missing README.md')
if (!readmeZh) fail('missing README_zh.md')
if (readmeEn && !readmeEn.split('\n').slice(0, 5).join('\n').includes('README_zh.md')) {
  fail('README.md must link to README_zh.md at the top')
}
if (readmeZh && !readmeZh.split('\n').slice(0, 5).join('\n').includes('README.md')) {
  fail('README_zh.md must link to README.md at the top')
}

if (errors.length > 0) {
  for (const err of errors) process.stderr.write(`ERROR: ${err}\n`)
  process.exit(1)
}
process.stdout.write(`Validated plugin "${manifest.name}" v${manifest.version} (${discoveredSkills.size} skills, ${Object.keys(servers).length} MCP server).\n`)
