import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'

export const CORE = '@x-era/forge-core'
export const stable = value => typeof value === 'string' && /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(value)
export const json = path => JSON.parse(readFileSync(path, 'utf8'))
export const writeJson = (path, value) => writeFileSync(path, JSON.stringify(value, null, 2) + '\n')
const hash = data => createHash('sha256').update(data).digest('hex')
const patchName = version => `patches/@x-era__forge-core@${version}.patch`
const run = (command, args, cwd, capture = false) => execFileSync(command, args, {
  cwd, encoding: 'utf8', stdio: capture ? ['ignore', 'pipe', 'pipe'] : ['ignore', 2, 2],
  maxBuffer: 32 * 1024 * 1024,
})
const npm = (args, cwd) => process.platform === 'win32'
  ? run(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm', ...args], cwd)
  : run('npm', args, cwd)
function pnpm(args, cwd) {
  const executable = process.env.npm_execpath
  if (executable && /pnpm\.(?:c?js|mjs)$/.test(executable)) run(process.execPath, [executable, ...args], cwd)
  else if (process.platform === 'win32') run(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'pnpm', ...args], cwd)
  else run('pnpm', args, cwd)
}

export function patchPaths(patch) {
  const names = [...patch.matchAll(/^\+\+\+ b\/(.+)$/gm)].map(match => match[1])
  if (patch.trim() && (!names.length || names.some(name => !/^lib\/[a-z0-9.-]+$/i.test(name))
    || /^--- (?!a\/lib\/)/m.test(patch) || /^\+\+\+ (?!b\/lib\/)/m.test(patch)
    || /^(?:new file mode|deleted file mode|rename from|rename to|GIT binary patch)/m.test(patch))) {
    throw new Error('Only modifications to existing lib files are supported in a Core patch')
  }
  return [...new Set(names)]
}

// git apply permits shifted line numbers, but never silently drops a conflicting fix.
export function prepareCompatibility(pristine, patched, patch, version, work) {
  const paths = patchPaths(patch)
  cpSync(pristine, patched, { recursive: true })
  const input = join(work, 'reviewed.patch')
  writeFileSync(input, patch)
  if (patch.trim()) {
    run('git', ['-c', 'core.autocrlf=false', '-c', 'core.eol=lf', 'apply', '--check', input], patched)
    run('git', ['-c', 'core.autocrlf=false', '-c', 'core.eol=lf', 'apply', input], patched)
  }
  let normalized = ''
  if (patch.trim()) {
    try {
      // Preserve npm file bytes regardless of the host's Git newline defaults.
      normalized = run('git', ['-c', 'core.autocrlf=false', '-c', 'core.eol=lf', 'diff', '--no-index', '--no-ext-diff', '--no-color', '--src-prefix=a/', '--dst-prefix=b/', '--', 'a', 'b'], work, true)
    } catch (error) {
      if (error.status !== 1 || !error.stdout) throw error
      normalized = error.stdout
    }
    normalized = normalized.replace(/^(diff --git )a\/a\/(.+) b\/b\/(.+)$/gm, '$1a/$2 b/$3')
      .replace(/^--- a\/a\//gm, '--- a/').replace(/^\+\+\+ b\/b\//gm, '+++ b/')
  }
  const files = Object.fromEntries(paths.map(name => [name, {
    before: hash(readFileSync(join(pristine, name))), after: hash(readFileSync(join(patched, name))),
  }]))
  return { patch: normalized, compatibility: { version, patchSha256: hash(normalized), files } }
}

export function updateWorkspace(text, oldVersion, version, hasPatch) {
  const oldEntry = `  '${CORE}@${oldVersion}': ${patchName(oldVersion)}`
  if (!text.split(/\r?\n/).includes(oldEntry)) throw new Error(`Expected patch mapping: ${oldEntry}`)
  return text.replace(oldEntry, hasPatch ? `  '${CORE}@${version}': ${patchName(version)}` : '')
    .replace(`  - '${CORE}@${oldVersion}'\n`, '')
    .replace(/^minimumReleaseAgeExclude:\n(?=\S|$)/m, '')
}

/** Validate a complete candidate before copying a bounded set of files back. */
export function upgradeCore(root, version, { patchFile, upstream } = {}) {
  if (!stable(version)) throw new Error('Core version must be an exact stable version')
  const current = json(join(root, 'package.json')).dependencies[CORE]
  const coreChanged = current !== version || Boolean(patchFile)
  const oldPatch = patchName(current)
  const nextPatch = patchName(version)
  if (current !== version && existsSync(join(root, nextPatch))) throw new Error(`Patch already exists: ${nextPatch}`)
  const temporary = mkdtempSync(join(tmpdir(), 'kimi-core-upgrade-'))
  try {
    const candidate = join(temporary, 'checkout')
    cpSync(root, candidate, { recursive: true, filter: source => {
      const name = source.split(/[\\/]/).at(-1)
      return !['.git', 'node_modules'].includes(name)
    } })
    const files = ['dsh-upstream.json']
    if (coreChanged) files.push('package.json', 'pnpm-workspace.yaml', 'pnpm-lock.yaml',
      'mcp/package.json', 'mcp/package-lock.json', 'mcp/compatibility.json', nextPatch,
      'mcp/adapter.mjs', 'mcp/forge-mcp.mjs', 'mcp/runtime-compatibility.mjs',
      'mcp/runtime-proxy.mjs', 'mcp/proxy-config.mjs', 'mcp/core.patch')
    const touched = [...new Set([...files, ...(coreChanged ? [oldPatch] : [])])]
    const snapshot = path => existsSync(path) ? hash(readFileSync(path)) : null
    const before = new Map(touched.map(file => [file, snapshot(join(root, file))]))
    if (coreChanged) {
      const development = json(join(candidate, 'package.json'))
      const runtimePath = join(candidate, 'mcp/package.json')
      const runtime = json(runtimePath)
      development.dependencies[CORE] = version
      runtime.dependencies[CORE] = version
      writeJson(join(candidate, 'package.json'), development)
      writeJson(runtimePath, runtime)
      npm(['install', '--package-lock-only', '--ignore-scripts', '--no-audit', '--no-fund', '--registry=https://registry.npmjs.org'], join(candidate, 'mcp'))
      const baseline = join(temporary, 'baseline')
      mkdirSync(baseline)
      for (const name of ['package.json', 'package-lock.json']) cpSync(join(candidate, 'mcp', name), join(baseline, name))
      npm(['ci', '--omit=dev', '--ignore-scripts', '--no-audit', '--no-fund', '--registry=https://registry.npmjs.org'], baseline)
      const pristine = join(temporary, 'a')
      cpSync(join(baseline, 'node_modules', CORE), pristine, { recursive: true })
      if (json(join(pristine, 'package.json')).version !== version) throw new Error('Installed Core does not match requested version')
      const patch = readFileSync(patchFile ? resolve(patchFile) : join(root, oldPatch), 'utf8')
      const prepared = prepareCompatibility(pristine, join(temporary, 'b'), patch, version, temporary)
      writeFileSync(join(candidate, nextPatch), prepared.patch)
      writeJson(join(candidate, 'mcp/compatibility.json'), prepared.compatibility)
      const workspacePath = join(candidate, 'pnpm-workspace.yaml')
      writeFileSync(workspacePath, updateWorkspace(readFileSync(workspacePath, 'utf8'), current, version, Boolean(prepared.patch.trim())))
      if (oldPatch !== nextPatch) rmSync(join(candidate, oldPatch))
    }
    if (upstream) writeJson(join(candidate, 'dsh-upstream.json'), upstream)
    else files.splice(files.indexOf('dsh-upstream.json'), 1)
    pnpm(['install', '--no-frozen-lockfile'], candidate)
    pnpm(['test'], candidate)
    pnpm(['run', 'build:check'], candidate)
    for (const file of touched) {
      if (snapshot(join(root, file)) !== before.get(file)) throw new Error(`Checkout changed during validation: ${file}`)
    }
    for (const file of files) cpSync(join(candidate, file), join(root, file))
    if (coreChanged && oldPatch !== nextPatch) rmSync(join(root, oldPatch))
    return { coreChanged, validated: true, coreVersion: version, files }
  } finally {
    rmSync(temporary, { recursive: true, force: true })
  }
}
