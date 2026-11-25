#!/usr/bin/env node
/**
 * MCP stdio server for PhyAgentOS-Kimi-Plugin.
 *
 * Wraps `@x-era/forge-core` with an isolated Kimi data root (`~/.kimi-code/forge`),
 * a host-neutral `<home>/config.json` store, same-session runtime refresh after
 * `forge_environment_setup`, and full 41-tool parity over newline-delimited JSON-RPC.
 */
import { createInterface } from 'node:readline'
import { join } from 'node:path'

import {
  DEFAULT_REGISTRY_URL,
  ForgeOperations,
  ForgeRegistryClient,
} from '@x-era/forge-core'

import { configureProxy } from './proxy.mjs'
import { KimiConfigStore } from './config-store.mjs'
import { expandUserPath, resolveKimiForgeHome, resolveKimiSkillsDir } from './paths.mjs'

const SERVER_NAME = 'phyagentos-kimi-mcp'
const SERVER_VERSION = '0.2.0'
const DEFAULT_PROTOCOL_VERSION = '2024-11-05'
const SUPPORTED_PROTOCOLS = new Set(['2024-11-05', '2025-03-26', '2025-06-18', '2025-11-25'])

// Guard stdout strictly for JSON-RPC frames.
const writeStderr = (...args) => process.stderr.write(`${args.map(String).join(' ')}\n`)
console.log = writeStderr
console.info = writeStderr
console.warn = writeStderr

// Configure before Core performs Registry, source or artifact requests.
configureProxy()

const home = resolveKimiForgeHome(process.env)
const configStore = new KimiConfigStore(home)

async function createOperations(previousJobs = undefined) {
  let cfg = {}
  try {
    const snap = await configStore.read()
    cfg = snap.config
  } catch (error) {
    writeStderr(`[${SERVER_NAME}] warning: failed to load config.json: ${error.message}`)
  }

  const roots = cfg.skills?.roots?.length
    ? cfg.skills.roots.map(root => expandUserPath(root, home))
    : undefined
  const modelsExplicit = cfg.models?.root || process.env.KIMI_FORGE_MODELS || process.env.DSH_FORGE_MODELS
  const modelsRoot = modelsExplicit ? expandUserPath(modelsExplicit, home) : undefined

  const registryUrl = cfg.registry?.url
    || process.env.KIMI_FORGE_REGISTRY_URL
    || process.env.DSH_FORGE_REGISTRY_URL
    || DEFAULT_REGISTRY_URL
  const registry = new ForgeRegistryClient({
    baseUrl: registryUrl,
    timeoutMs: cfg.registry?.timeoutMs,
    ...(cfg.registry?.token ? { token: cfg.registry.token } : {}),
    ...(cfg.registry?.tokenEnv ? { tokenEnv: cfg.registry.tokenEnv } : {}),
  })

  const doraRaw = cfg.runtime?.dora || process.env.KIMI_FORGE_DORA || process.env.DSH_FORGE_DORA
  const dora1Raw = cfg.runtime?.dora1 || process.env.KIMI_FORGE_DORA1 || process.env.DSH_FORGE_DORA1
  const resolveBin = raw => (raw && (raw.includes('/') || raw.startsWith('~')) ? expandUserPath(raw, home) : raw || undefined)

  const next = new ForgeOperations({
    home,
    roots,
    modelsRoot,
    profilesRoot: join(home, 'profiles'),
    registry,
    dora: resolveBin(doraRaw),
    dora1: resolveBin(dora1Raw),
    startTimeoutMs: cfg.runtime?.startTimeoutMs,
    callTimeoutMs: cfg.gateway?.callTimeoutMs,
  })
  if (previousJobs !== undefined) {
    next.jobs = previousJobs
  }
  // Initialize through Core's memoized entry point so the first tool cannot
  // reload disk state into an already initialized runtime manager.
  await next.ready()
  return next
}

let operations = await createOperations()

async function reloadOperations() {
  operations = await createOperations(operations.jobs)
}

const tool = (name, description, properties = {}, required = []) => ({
  name,
  description,
  inputSchema: { type: 'object', properties, required, additionalProperties: false },
})
const str = description => ({ type: 'string', description })
const bool = description => ({ type: 'boolean', description })
const num = description => ({ type: 'number', description })

const TOOLS = [
  tool('forge_skill_list', 'List installed Forge skills and their runtime state under the isolated Kimi Forge home.', {}, []),
  tool('forge_skill_search', 'Search the PhyAgentOS Forge resource registry.', { query: str('Optional search text') }, []),
  tool('forge_skill_inspect', 'Inspect one installed skill (profiles, artifacts, models, checks).', { name: str('Skill name') }, ['name']),
  tool('forge_skill_read', 'Read the SKILL.md workflow instructions of one installed skill.', { name: str('Skill name') }, ['name']),
  tool('forge_skill_install', 'Install or update a skill from the registry as a background job.', {
    name: str('Registry skill name'),
    nodes: bool('Also install locked node artifacts (default true)'),
    version: str('Optional published version to pin'),
  }, ['name']),
  tool('forge_skill_install_local', 'Install or update a skill from a local .tar.gz bundle archive built by forge_skill_package.', {
    path: str('Path to local bundle .tar.gz'),
  }, ['path']),
  tool('forge_skill_package', 'Package one installed skill bundle into a deterministic .tar.gz archive with sha256 sidecar.', {
    name: str('Installed skill name to package'),
    output_dir: str('Optional destination directory (defaults to <home>/runtime/dist)'),
    force: bool('Overwrite an existing archive of the same name/version'),
    include_venv: bool('Include Python venv trees (default false)'),
  }, ['name']),
  tool('forge_skill_versions', 'List published versions of a skill in the registry.', { name: str('Registry skill name') }, ['name']),
  tool('forge_install_status', 'Read one background install job or recent jobs.', { job_id: str('Job id') }, []),
  tool('forge_install_cancel', 'Cancel a running background install job.', { job_id: str('Job id') }, ['job_id']),
  tool('forge_skill_update', 'Compare installed and registry versions; set apply=true to start the update job.', {
    name: str('Skill name'),
    apply: bool('Start the update job'),
    version: str('Target version'),
  }, ['name']),
  tool('forge_skill_remove', 'Remove an installed skill (must stop its runtime first).', { name: str('Skill name') }, ['name']),
  tool('forge_profile_files', 'List editable profile configuration files of an installed skill.', {
    name: str('Skill name'),
    profile: str('Optional profile id'),
  }, ['name']),
  tool('forge_profile_read', 'Read one profile file inside an installed skill.', {
    name: str('Skill name'),
    profile: str('Profile id'),
    file: str('File path inside the profile'),
  }, ['name', 'profile', 'file']),
  tool('forge_profile_write', 'Validate, back up and overwrite one profile file (returns field diff and restartRequired).', {
    name: str('Skill name'),
    profile: str('Profile id'),
    file: str('File path inside the profile'),
    content: str('Complete updated file content'),
  }, ['name', 'profile', 'file', 'content']),
  tool('forge_repo_search', 'Search the Forge node source repository catalog.', {
    query: str('Free-text query'),
    category: str('framework | adapter | operator | benchmark'),
  }, []),
  tool('forge_repo_info', 'Read one node repository entry by repository id or node id.', { id_or_node: str('Repository id or node id') }, ['id_or_node']),
  tool('forge_node_source', 'Read a source file from the registry-pinned commit of a node artifact.', {
    artifact_id: str('Artifact id'),
    file: str('Path inside the repository (default README.md)'),
    refresh: bool('Bypass local source cache'),
  }, ['artifact_id']),
  tool('forge_skill_docs', 'List or read authoring documentation shipped inside an installed skill.', {
    name: str('Skill name'),
    file: str('Optional document path'),
  }, ['name']),
  tool('forge_skill_validate', 'Validate a local skill bundle directory before installing or packaging.', { path: str('Bundle directory path') }, ['path']),
  tool('forge_node_info', 'Look up a locked node artifact and its source provenance in the registry.', { artifact_id: str('Artifact id') }, ['artifact_id']),
  tool('forge_skill_doctor', 'Run preflight and integrity diagnostics for one installed skill.', {
    name: str('Skill name'),
    profile: str('Optional profile id'),
  }, ['name']),
  tool('forge_doctor_report', 'Write a JSON diagnostics report under <home>/runtime/reports.', { name: str('Optional skill name') }, []),
  tool('forge_environment_check', 'Check local base prerequisites for Forge: platform, Node, Python, dora/dora1, isolated home, disk, registry and gateway ports.', {
    offline: bool('Skip network registry probe'),
  }, []),
  tool('forge_environment_setup', 'Bootstrap Forge runtime dependencies (isolated directories, pinned Forge 1 dora 0.4.1 & Forge 2 dora1 1.0.1 under <home>/support/bin/) and reload the active MCP session.', {
    dry_run: bool('Preview plan without modifying disk'),
    dora_version: str('Forge 1 dora-rs-cli version (default 0.4.1)'),
    dora1_version: str('Forge 2 dora-rs-cli version (default 1.0.1)'),
    dora_binary_path: str('Optional local Forge 1 dora executable'),
    dora1_binary_path: str('Optional local Forge 2 dora1 executable'),
    python: str('Optional Python interpreter or version'),
    index_url: str('Optional PyPI mirror URL (e.g. https://pypi.tuna.tsinghua.edu.cn/simple)'),
    force: bool('Reinstall even if matching versions already exist'),
    write_config: bool('Persist installed dora/dora1 paths into <home>/config.json'),
    offline: bool('Skip registry probe during post-setup verification'),
  }, []),
  tool('forge_config_read', 'Read the isolated Kimi Forge config (<home>/config.json), active home path and available backups.', {}, []),
  tool('forge_config_write', 'Validate, back up and update <home>/config.json (merges by default) and reload active Forge settings.', {
    config: { type: 'object', description: 'Forge config object (models, skills, registry, runtime, gateway)', additionalProperties: true },
    merge: bool('Merge onto existing config (default true)'),
  }, ['config']),
  tool('forge_config_restore', 'Restore a previous config.json.bak-* backup and reload active Forge settings.', {
    backup: str('Backup filename (e.g. config.json.bak-...)'),
  }, ['backup']),
  tool('forge_runtime_start', 'Start a skill runtime for one profile and wait until its Gateway is healthy. Requires explicit user instruction.', {
    name: str('Skill name'),
    profile: str('Profile id'),
    mode: { type: 'string', enum: ['start', 'run'], description: 'start (Dora coordinator) or run (isolated process, required for Forge 2)' },
  }, ['name', 'profile']),
  tool('forge_runtime_status', 'Read runtime status for one installed skill.', { name: str('Skill name') }, ['name']),
  tool('forge_runtime_stop', 'Stop a running skill runtime. Requires explicit user instruction.', {
    name: str('Skill name'),
    force: bool('Force stop'),
  }, ['name']),
  tool('forge_runtime_logs', 'Read the tail of a skill runtime log.', {
    name: str('Skill name'),
    lines: num('Number of lines (default 120)'),
  }, ['name']),
  tool('forge_tool_context', 'Read a Gateway ToolSpec context (schema, readiness, frames, units) without invoking it.', {
    name: str('Skill name'),
    tool_id: str('Tool id'),
  }, ['name', 'tool_id']),
  tool('forge_tool_call', 'Invoke a Query, Action or Session tool on a running skill Gateway.', {
    name: str('Skill name'),
    tool_id: str('Tool id'),
    arguments: { type: 'object', description: 'Tool arguments', additionalProperties: true },
  }, ['name', 'tool_id']),
  tool('forge_invocation_read', 'Read status and result of an asynchronous Gateway invocation.', {
    name: str('Skill name'),
    invocation_id: str('Invocation id'),
  }, ['name', 'invocation_id']),
  tool('forge_cache_summary', 'Summarize disk usage of cached node artifacts.', {}, []),
  tool('forge_cache_gc', 'Garbage-collect unreferenced node artifacts.', { dry_run: bool('Measure only without deleting') }, []),
  tool('forge_model_search', 'Search or list local model weights under <home>/models (or configured models.root).', {
    query: str('Optional free-text query'),
    id: str('Optional exact model id'),
    tag: str('Optional tag filter'),
    skill: str('Optional referencing skill name'),
  }, []),
  tool('forge_model_info', 'Inspect one local model entry by id and optional revision.', {
    id: str('Model id'),
    revision: str('Optional revision'),
  }, ['id']),
  tool('forge_model_verify', 'Verify a local model weight SHA256 against its receipt.json.', {
    id: str('Model id'),
    revision: str('Optional revision'),
  }, ['id']),
  tool('forge_skill_export', 'Export an installed Forge bundle as a portable SKILL.md directory (optionally straight into Kimi user skills for live /skill: reload).', {
    name: str('Skill name'),
    out: str('Destination directory (defaults to <home>/portable unless kimi_skills=true)'),
    kimi_skills: bool('Export directly to $KIMI_CODE_HOME/skills (~/.kimi-code/skills) so Kimi auto-discovers it'),
  }, ['name']),
]

async function dispatch(name, args) {
  switch (name) {
    case 'forge_skill_list': return { home, ...await operations.list() }
    case 'forge_skill_search': return { registry: operations.registry.baseUrl, skills: await operations.search(args.query ?? '') }
    case 'forge_skill_inspect': return operations.inspect(args.name)
    case 'forge_skill_read': return operations.read(args.name)
    case 'forge_skill_install': return operations.install(args.name, args.nodes !== false, args.version)
    case 'forge_skill_install_local': return operations.installLocal(expandUserPath(args.path))
    case 'forge_skill_package': return operations.packageSkill(args.name, {
      ...(args.output_dir === undefined ? {} : { outputDir: expandUserPath(args.output_dir) }),
      ...(args.force === undefined ? {} : { force: args.force }),
      ...(args.include_venv === undefined ? {} : { includeVenv: args.include_venv }),
    })
    case 'forge_skill_versions': return operations.listSkillVersions(args.name)
    case 'forge_install_status': return args.job_id === undefined ? operations.jobList(10) : operations.jobStatus(args.job_id)
    case 'forge_install_cancel': return { cancelled: operations.cancelJob(args.job_id) }
    case 'forge_skill_update': return operations.update(args.name, args.apply === true, args.version)
    case 'forge_skill_remove': return operations.remove(args.name)
    case 'forge_profile_files': return { profiles: (await operations.profileTree()).find(skill => skill.name === args.name)?.profiles ?? [] }
    case 'forge_profile_read': return operations.profileRead(args.name, args.profile, args.file)
    case 'forge_profile_write': return operations.profileWrite(args.name, args.profile, args.file, args.content)
    case 'forge_repo_search': return { repositories: operations.listRepositories(args.query, args.category) }
    case 'forge_repo_info': return operations.repository(args.id_or_node) ?? { error: `no catalog entry for ${args.id_or_node}` }
    case 'forge_node_source': return operations.nodeSource(args.artifact_id, args.file ?? 'README.md', args.refresh === true)
    case 'forge_skill_docs': return args.file === undefined ? operations.skillDocs(args.name) : operations.readSkillDoc(args.name, args.file)
    case 'forge_skill_validate': return operations.validateLocalBundle(expandUserPath(args.path))
    case 'forge_node_info': return operations.nodeInfo(args.artifact_id)
    case 'forge_skill_doctor': return operations.doctor(args.name, args.profile)
    case 'forge_doctor_report': return operations.doctorReport(args.name)
    case 'forge_environment_check': return operations.environmentCheck({ offline: args.offline === true })
    case 'forge_environment_setup': {
      const result = await operations.environmentSetup({
        dryRun: args.dry_run === true,
        doraVersion: args.dora_version,
        dora1Version: args.dora1_version,
        doraBinaryPath: args.dora_binary_path ? expandUserPath(args.dora_binary_path) : undefined,
        dora1BinaryPath: args.dora1_binary_path ? expandUserPath(args.dora1_binary_path) : undefined,
        python: args.python,
        indexUrl: args.index_url,
        force: args.force === true,
        writeProfileConfig: false, // never write to DSH cordis.patch.yml
        offline: args.offline === true,
      })
      let configWriteResult
      if (args.dry_run !== true) {
        if (args.write_config === true) {
          configWriteResult = await configStore.write({
            runtime: { dora: result.dora.path, dora1: result.dora1.path },
          }, { merge: true })
        }
        await reloadOperations()
      }
      return configWriteResult === undefined ? result : { ...result, configUpdated: configWriteResult }
    }
    case 'forge_config_read': return { home, ...await configStore.read() }
    case 'forge_config_write': {
      const written = await configStore.write(args.config, { merge: args.merge !== false })
      await reloadOperations()
      return written
    }
    case 'forge_config_restore': {
      const restored = await configStore.restore(args.backup)
      await reloadOperations()
      return restored
    }
    case 'forge_runtime_start': return operations.runtimeStart(args.name, args.profile, args.mode === 'run' ? 'run' : 'start')
    case 'forge_runtime_status': return operations.runtimeStatus(args.name)
    case 'forge_runtime_stop': return operations.runtimeStop(args.name, args.force === true)
    case 'forge_runtime_logs': return { log: await operations.runtimeLogs(args.name, args.lines ?? 120) }
    case 'forge_tool_context': return operations.toolContext(args.name, args.tool_id)
    case 'forge_tool_call': return operations.toolCall(args.name, args.tool_id, args.arguments ?? {})
    case 'forge_invocation_read': return operations.invocationRead(args.name, args.invocation_id)
    case 'forge_cache_summary': return operations.cacheSummary()
    case 'forge_cache_gc': return operations.cacheGc(args.dry_run === true)
    case 'forge_model_search': return operations.modelSearch({ query: args.query, id: args.id, tag: args.tag, skill: args.skill })
    case 'forge_model_info': return operations.modelInfo(args.id, args.revision)
    case 'forge_model_verify': return operations.modelVerify(args.id, args.revision)
    case 'forge_skill_export': {
      const targetOut = args.out
        ? expandUserPath(args.out)
        : (args.kimi_skills === true ? resolveKimiSkillsDir(process.env) : join(home, 'portable'))
      return operations.exportPortable(args.name, targetOut)
    }
    default:
      throw Object.assign(new Error(`unknown tool ${name}`), { code: 'FORGE_USAGE' })
  }
}

// Keep stateful requests ordered: a refresh must not replace Operations while
// an earlier start/stop/remove is still using it. Background installs continue
// outside this queue; polling and cancellation must bypass a refresh waiting
// for their filesystem lock.
let toolQueue = Promise.resolve()
const jobControlTools = new Set(['forge_install_status', 'forge_install_cancel'])
function dispatchOrdered(name, args) {
  if (jobControlTools.has(name)) return dispatch(name, args)
  const result = toolQueue.then(() => dispatch(name, args))
  toolQueue = result.then(() => undefined, () => undefined)
  return result
}

const send = message => process.stdout.write(`${JSON.stringify(message)}\n`)

async function handle(method, params) {
  switch (method) {
    case 'initialize': {
      const requested = typeof params.protocolVersion === 'string' ? params.protocolVersion : ''
      const protocolVersion = SUPPORTED_PROTOCOLS.has(requested) ? requested : DEFAULT_PROTOCOL_VERSION
      return {
        protocolVersion,
        capabilities: { tools: {} },
        serverInfo: { name: SERVER_NAME, version: SERVER_VERSION },
      }
    }
    case 'ping':
      return {}
    case 'tools/list':
      return { tools: TOOLS }
    case 'tools/call': {
      const name = params.name
      try {
        const value = await dispatchOrdered(name, params.arguments ?? {})
        return { content: [{ type: 'text', text: JSON.stringify(value, null, 2) }], isError: false }
      } catch (error) {
        return {
          content: [{ type: 'text', text: JSON.stringify({ ok: false, code: error.code ?? 'FORGE_ERROR', message: error.message }) }],
          isError: true,
        }
      }
    }
    default:
      throw Object.assign(new Error(`unknown method ${method}`), { code: 'FORGE_USAGE' })
  }
}

const input = createInterface({ input: process.stdin, crlfDelay: Infinity })
input.on('line', line => {
  if (line.trim().length === 0) return
  let request
  try {
    request = JSON.parse(line)
  } catch {
    send({ jsonrpc: '2.0', id: null, error: { code: -32700, message: 'parse error' } })
    return
  }
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    send({ jsonrpc: '2.0', id: null, error: { code: -32600, message: 'invalid request' } })
    return
  }
  const { id, method, params } = request
  if (id === undefined) return // JSON-RPC notification
  void handle(method, params ?? {}).then(result => {
    send({ jsonrpc: '2.0', id, result })
  }).catch(error => {
    send({
      jsonrpc: '2.0',
      id,
      error: {
        code: error.code === 'FORGE_USAGE' ? -32601 : -32603,
        message: error instanceof Error ? error.message : String(error),
      },
    })
  })
})
