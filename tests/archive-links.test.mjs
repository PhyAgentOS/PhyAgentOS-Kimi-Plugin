import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createServer } from 'node:http'
import { mkdir, readFile, readdir, readlink, stat, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import test from 'node:test'
import { gzipSync } from 'node:zlib'
import { NodeStore } from '@x-era/forge-core'
import { isolatedEnvironment, startMcp } from './helpers/mcp.mjs'
import { temporaryDirectory } from './helpers/bundle.mjs'

const core = dirname(fileURLToPath(import.meta.resolve('@x-era/forge-core')))
const { extractArchive } = await import(pathToFileURL(join(core, 'archive.js')))
const tar = createRequire(import.meta.resolve('@x-era/forge-core'))('tar')
const platformArch = process.arch === 'x64' ? 'x86_64' : process.arch === 'arm64' ? 'aarch64' : process.arch
const posixOnly = { skip: process.platform === 'win32' && 'Symlink creation requires Windows host privileges' }

// Write explicit headers to exercise malicious ordering, duplicate entries and
// links that cannot safely be represented by a fixture directory on disk.
async function archive(t, entries) {
  const root = await temporaryDirectory(t)
  const blocks = []
  for (const entry of entries) {
    const body = Buffer.from(entry.body ?? '')
    const header = new tar.Header({ path: entry.path, type: entry.type ?? 'File',
      linkpath: entry.target ?? '', size: body.length, mode: entry.mode ?? 0o644 })
    header.encode()
    blocks.push(header.block, body)
    if (body.length % 512) blocks.push(Buffer.alloc(512 - body.length % 512))
  }
  blocks.push(Buffer.alloc(1024))
  const file = join(root, 'node.tar.gz')
  await writeFile(file, gzipSync(Buffer.concat(blocks)))
  const output = join(root, 'output')
  await mkdir(output)
  return { root, file, output }
}
const library = { path: 'vlm_policy/_internal/libexample.so.1', body: 'library' }
const link = (path, target) => ({ path, target, type: 'SymbolicLink' })
const unsafe = error => error.code === 'FORGE_ARCHIVE_UNSAFE'

test('node archives preserve internal library links, forward chains and directory links', posixOnly, async t => {
  const fixture = await archive(t, [
    link('vlm_policy/lib-current.so', '_internal/libexample.so'),
    link('vlm_policy/_internal/libexample.so', 'libexample.so.1'),
    link('vlm_policy/libdir', '_internal'),
    link('aliases/library', '../vlm_policy/_internal/libexample.so.1'), library,
  ])
  await extractArchive(fixture.file, fixture.output, { allowInternalLinks: true })
  assert.equal(await readlink(join(fixture.output, 'vlm_policy/_internal/libexample.so')), 'libexample.so.1')
  for (const path of ['vlm_policy/lib-current.so', 'vlm_policy/libdir/libexample.so', 'aliases/library'])
    assert.equal(await readFile(join(fixture.output, path), 'utf8'), 'library')
})

test('skill bundle extraction continues to reject even safe internal symlinks', async t => {
  const fixture = await archive(t, [library, link('lib.so', library.path)])
  await assert.rejects(extractArchive(fixture.file, fixture.output), unsafe)
  assert.deepEqual(await readdir(fixture.output), [])
})

const invalid = [
  ['relative escape', [link('lib.so', '../outside')]],
  ['absolute target', [link('lib.so', '/tmp/outside')]],
  ['Windows drive target', [link('lib.so', 'C:/outside')]],
  ['Windows relative drive target', [link('lib.so', 'C:outside')]],
  ['backslash target', [link('lib.so', '..\\outside')]],
  ['hard link', [library, { path: 'hard', target: library.path, type: 'Link' }]],
  ['absolute entry', [{ path: '/tmp/outside', body: 'bad' }]],
  ['traversal entry', [{ path: '../outside', body: 'bad' }]],
  ['duplicate link', [library, link('alias', library.path), { path: 'alias', body: 'overwrite' }]],
  ['file parent', [{ path: 'parent', body: 'file' }, { path: 'parent/child', body: 'bad' }]],
  ['write through directory link', [link('alias', 'real'), { path: 'real', type: 'Directory' }, { path: 'alias/child', body: 'bad' }]],
  ['link after child entry', [{ path: 'alias/child', body: 'bad' }, link('alias', 'real'), { path: 'real', type: 'Directory' }]],
]
for (const [name, entries] of invalid) {
  test(`node archive rejects ${name} before writing files`, async t => {
    const fixture = await archive(t, entries)
    await assert.rejects(extractArchive(fixture.file, fixture.output, { allowInternalLinks: true }), unsafe)
    assert.deepEqual(await readdir(fixture.output), [])
  })
}
for (const [name, entries] of [
  ['dangling link', [link('alias', 'missing')]],
  ['self cycle', [link('alias', 'alias')]],
  ['link cycle', [link('a', 'b'), link('b', 'a')]],
  ['directory self cycle', [link('self', '.')]],
  ['directory ancestor cycle', [{ path: 'child', type: 'Directory' }, link('child/up', '..')]],
  ['directory cross cycle', [{ path: 'a', type: 'Directory' }, { path: 'b', type: 'Directory' }, link('a/other', '../b'), link('b/other', '../a')]],
  ['escape through directory link and parent', [{ path: 'dir', type: 'Directory' }, link('alias', 'dir'), link('bad', 'alias/../../outside')]],
]) {
  test(`node archive rejects ${name}`, posixOnly, async t => {
    const fixture = await archive(t, entries)
    await assert.rejects(extractArchive(fixture.file, fixture.output, { allowInternalLinks: true }), unsafe)
    // Any links created during final resolution must be removed on failure.
    async function assertNoLinks(directory) {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        assert.equal(entry.isSymbolicLink(), false)
        if (entry.isDirectory()) await assertNoLinks(join(directory, entry.name))
      }
    }
    await assertNoLinks(fixture.output)
  })
}

test('node installation validates symlinks before publishing and preserves executable access', posixOnly, async t => {
  const fixture = await archive(t, [{ path: 'vlm_policy/run', body: '#!/bin/sh\nexit 0\n', mode: 0o755 },
    library, link('vlm_policy/_internal/libexample.so', 'libexample.so.1'),
    link('.artifact.json', library.path)])
  const bytes = await readFile(fixture.file)
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  const store = new NodeStore(join(fixture.root, 'nodes'), { node: async () => ({
    url: `data:application/gzip;base64,${bytes.toString('base64')}`, sha256, size: bytes.length,
  }) }, join(fixture.root, 'cache'))
  const lock = { artifactId: 'test-node', nodeId: 'vlm_policy', platform: process.platform,
    arch: platformArch,
    entrypoint: 'vlm_policy/run', sha256 }
  await store.ensureManifest({ artifacts: { test: lock } })
  assert.equal((await store.inspect(lock)).state, 'ready')
  assert.equal(await readFile(join(fixture.root, 'nodes/test-node/vlm_policy/_internal/libexample.so'), 'utf8'), 'library')
  assert.ok((await stat(join(fixture.root, 'nodes/test-node/vlm_policy/run'))).mode & 0o111)
  assert.deepEqual(await readdir(join(fixture.root, 'nodes')), ['test-node'])
})

test('failed node link validation removes staging without replacing an existing node', posixOnly, async t => {
  const fixture = await archive(t, [link('bad', 'missing')])
  const bytes = await readFile(fixture.file)
  const root = join(fixture.root, 'nodes')
  await mkdir(join(root, 'test-node'), { recursive: true })
  await writeFile(join(root, 'test-node/sentinel'), 'previous node')
  const store = new NodeStore(root, { node: async () => ({
    url: `data:application/gzip;base64,${bytes.toString('base64')}`,
    sha256: createHash('sha256').update(bytes).digest('hex'), size: bytes.length,
  }) }, join(fixture.root, 'cache'))
  await assert.rejects(store.ensureManifest({ artifacts: { test: {
    artifactId: 'test-node', nodeId: 'test', platform: process.platform,
    arch: platformArch, entrypoint: 'run',
  } } }), unsafe)
  assert.deepEqual(await readdir(root), ['test-node'])
  assert.equal(await readFile(join(root, 'test-node/sentinel'), 'utf8'), 'previous node')
})

test('bundled MCP installs a registry node with validated internal library links', posixOnly, async t => {
  const node = await archive(t, [{ path: 'vlm_policy/run', body: '#!/bin/sh\nexit 0\n', mode: 0o755 },
    library, link('vlm_policy/_internal/libexample.so', 'libexample.so.1')])
  const nodeBytes = await readFile(node.file)
  const nodeDigest = createHash('sha256').update(nodeBytes).digest('hex')
  const manifest = [
    'manifest_version: 2', 'name: link-demo', 'version: 0.1.0',
    'description: Synthetic linked node fixture.', 'skill_document: SKILL.md',
    'gateway_url: http://127.0.0.1:19299',
    'profiles:', '  default:', '    dataflow: profiles/default/dataflow.yaml',
    'artifacts:', '  nodes:', '    vlm_policy:', '      artifact_id: link-node',
    '      version: 0.1.0', `      platform: ${process.platform}`, `      arch: ${platformArch}`,
    '      artifact_type: directory_tar_gz', '      entrypoint: vlm_policy/run', `      sha256: ${nodeDigest}`,
  ].join('\n')
  const bundle = await archive(t, [{ path: 'skill.yaml', body: manifest },
    { path: 'SKILL.md', body: '# Test skill' },
    { path: 'profiles/default/dataflow.yaml', body: 'nodes: []\n' }])
  const bundleBytes = await readFile(bundle.file)
  let url
  const server = createServer((req, res) => {
    const metadata = (bytes, path) => JSON.stringify({ download_url: `${url}/${path}`,
      sha256: createHash('sha256').update(bytes).digest('hex'), size: bytes.length, version: '0.1.0' })
    if (req.url === '/v1/skills/link-demo') res.end(metadata(bundleBytes, 'bundle'))
    else if (req.url === '/v1/forge-nodes/link-node') res.end(metadata(nodeBytes, 'node'))
    else if (req.url === '/bundle') res.end(bundleBytes)
    else if (req.url === '/node') res.end(nodeBytes)
    else res.writeHead(404).end()
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  url = `http://127.0.0.1:${server.address().port}`
  const home = join(node.root, 'user')
  const kimiHome = join(home, '.kimi-code')
  const repo = dirname(dirname(fileURLToPath(import.meta.url)))
  const mcp = startMcp(repo, isolatedEnvironment(home, kimiHome))
  try {
    assert.equal((await mcp.callTool('forge_config_write', { config: { registry: { url } } })).isError, false)
    const install = await mcp.callTool('forge_skill_install', { name: 'link-demo' })
    assert.equal(install.isError, false)
    let job
    const deadline = Date.now() + 10000
    do {
      job = (await mcp.callTool('forge_install_status', { job_id: install.payload.id })).payload
      if (['succeeded', 'failed', 'cancelled'].includes(job.state)) break
      await new Promise(resolve => setTimeout(resolve, 20))
    } while (Date.now() < deadline)
    assert.equal(job.state, 'succeeded', JSON.stringify(job))
    const status = await mcp.callTool('forge_node_info', { artifact_id: 'link-node' })
    assert.equal(status.isError, false)
    // Locate the installed link without coupling the test to Core's node-root layout.
    async function find(directory) {
      for (const entry of await readdir(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name)
        if (entry.isSymbolicLink() && entry.name === 'libexample.so') return path
        if (entry.isDirectory()) { const match = await find(path); if (match) return match }
      }
    }
    const installed = await find(join(kimiHome, 'forge'))
    assert.ok(installed)
    assert.equal(await readlink(installed), 'libexample.so.1')
    assert.equal(await readFile(installed, 'utf8'), 'library')
  } finally {
    await mcp.close()
    server.closeAllConnections()
    await new Promise(resolve => server.close(resolve))
  }
})
