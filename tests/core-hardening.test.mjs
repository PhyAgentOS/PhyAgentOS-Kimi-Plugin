import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { chmod, cp, mkdir, readFile, readdir, stat, symlink, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import test from 'node:test'
import { bootstrapEnvironment, downloadFile, ForgeCatalog, installSkill, SkillRuntimeManager } from '@x-era/forge-core'
import { temporaryDirectory, writeBundle } from './helpers/bundle.mjs'

const requireCore = createRequire(import.meta.resolve('@x-era/forge-core'))
const tar = requireCore('tar')
const fakeExec = async () => ({ stdout: 'uv 0.9.0\n', stderr: '' })

async function cachedBundle(t) {
  const root = await temporaryDirectory(t)
  const bundle = await writeBundle(join(root, 'bundle'))
  const archive = join(root, 'bundle.tar.gz')
  await tar.create({ gzip: true, cwd: bundle, file: archive }, ['skill.yaml', 'SKILL.md', 'profiles'])
  const bytes = await readFile(archive)
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  const cacheRoot = join(root, 'cache')
  await mkdir(cacheRoot)
  return {
    root, archive, bytes, cacheRoot, sha256,
    artifact: { url: 'https://unused.invalid/test.tar.gz', size: bytes.length, sha256 },
  }
}

test('cached registry archives must match the declared SHA256 before extraction', async t => {
  const fixture = await cachedBundle(t)
  const wrongDigest = '0'.repeat(64)
  await cp(fixture.archive, join(fixture.cacheRoot, `${wrongDigest}.tar.gz`))
  await assert.rejects(() => installSkill('audit-demo', {
    registry: { skill: async () => ({ ...fixture.artifact, sha256: wrongDigest }) },
    cacheRoot: fixture.cacheRoot,
    skillsRoot: join(fixture.root, 'skills'),
  }), error => error.code === 'FORGE_NODE_INTEGRITY')
  await assert.rejects(stat(join(fixture.root, 'skills', 'audit-demo')), { code: 'ENOENT' })
})

test('a verified cached registry archive is reused without a network download', async t => {
  const fixture = await cachedBundle(t)
  await cp(fixture.archive, join(fixture.cacheRoot, `${fixture.sha256}.tar.gz`))
  const result = await installSkill('audit-demo', {
    registry: { skill: async () => fixture.artifact },
    cacheRoot: fixture.cacheRoot,
    skillsRoot: join(fixture.root, 'skills'),
  })
  assert.equal(result.downloaded, false)
  assert.equal(result.name, 'audit-demo')
})

test('registry archives with a mismatched cached size fail without retrying', async t => {
  const fixture = await cachedBundle(t)
  await cp(fixture.archive, join(fixture.cacheRoot, `${fixture.sha256}.tar.gz`))
  await assert.rejects(() => installSkill('audit-demo', {
    registry: { skill: async () => ({ ...fixture.artifact, size: fixture.bytes.length + 1 }) },
    cacheRoot: fixture.cacheRoot,
    skillsRoot: join(fixture.root, 'skills'),
  }), error => error.code === 'FORGE_NODE_INTEGRITY')
})

test('remote artifacts require valid pinned digests and byte lengths', async t => {
  const root = await temporaryDirectory(t)
  for (const invalid of [{}, { sha256: 'invalid', size: 1 }, { sha256: '0'.repeat(64) },
    { sha256: '0'.repeat(64), size: -1 }, { sha256: '0'.repeat(64), size: 1.5 }]) {
    await assert.rejects(() => downloadFile({
      url: 'https://unused.invalid/test.tar.gz', dest: join(root, 'download'), ...invalid,
    }), error => error.code === 'FORGE_NODE_INTEGRITY')
    await assert.rejects(() => installSkill('audit-demo', {
      registry: { skill: async () => ({ url: 'https://unused.invalid/test.tar.gz', ...invalid }) },
      cacheRoot: join(root, 'cache'), skillsRoot: join(root, 'skills'),
    }), error => error.code === 'FORGE_NODE_INTEGRITY')
  }
})

test('fresh downloads verify both digest and size', async t => {
  const root = await temporaryDirectory(t)
  const bytes = Buffer.from('synthetic artifact')
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  const url = `data:application/octet-stream;base64,${bytes.toString('base64')}`
  const result = await downloadFile({ url, dest: join(root, 'valid'), size: bytes.length, sha256 })
  assert.equal(result.sha256, sha256)
  await assert.rejects(() => downloadFile({ url, dest: join(root, 'bad-hash'), size: bytes.length, sha256: '0'.repeat(64) }),
    error => error.code === 'FORGE_NODE_INTEGRITY')
  await assert.rejects(() => downloadFile({ url, dest: join(root, 'bad-size'), size: bytes.length + 1, sha256 }),
    error => error.code === 'FORGE_NODE_INTEGRITY')
})

test('bootstrap never creates files in a shared model root, including a read-only root', async t => {
  const root = await temporaryDirectory(t)
  const modelsRoot = join(root, 'shared-models')
  await mkdir(modelsRoot)
  await writeFile(join(modelsRoot, 'sentinel'), 'unchanged')
  const before = await readdir(modelsRoot)
  const bootstrap = home => bootstrapEnvironment({
    home, modelsRoot, components: ['directories'], verify: false, exec: fakeExec,
  })
  assert.equal((await bootstrap(join(root, 'home-writable'))).ok, true)
  assert.deepEqual(await readdir(modelsRoot), before)
  if (process.platform !== 'win32') {
    await chmod(modelsRoot, 0o555)
    try {
      assert.equal((await bootstrap(join(root, 'home-readonly'))).ok, true)
      assert.deepEqual(await readdir(modelsRoot), before)
    } finally {
      await chmod(modelsRoot, 0o755)
    }
  }
  assert.equal(await readFile(join(modelsRoot, 'sentinel'), 'utf8'), 'unchanged')
})

test('bootstrap creates the default private model directory but not a missing shared root', async t => {
  const root = await temporaryDirectory(t)
  const home = join(root, 'home')
  assert.equal((await bootstrapEnvironment({ home, components: ['directories'], verify: false, exec: fakeExec })).ok, true)
  assert.equal((await stat(join(home, 'models', 'cache'))).isDirectory(), true)
  const shared = join(root, 'absent-shared-models')
  assert.equal((await bootstrapEnvironment({ home, modelsRoot: shared, components: ['directories'], verify: false, exec: fakeExec })).ok, true)
  await assert.rejects(stat(shared), { code: 'ENOENT' })
})

test('a symlinked default model directory is also treated as shared read-only storage', {
  skip: process.platform === 'win32' && 'Creating symlinks requires host privileges on Windows',
}, async t => {
  const root = await temporaryDirectory(t)
  const home = join(root, 'home')
  const shared = join(root, 'shared')
  await mkdir(home)
  await mkdir(shared)
  await symlink(shared, join(home, 'models'))
  const result = await bootstrapEnvironment({ home, components: ['directories'], verify: false, exec: fakeExec })
  assert.equal(result.ok, true)
  assert.deepEqual(await readdir(shared), [])
})

test('runtime payload links are rejected before secret injection or external permission changes', {
  skip: process.platform === 'win32' && 'Creating symlinks requires host privileges on Windows',
}, async t => {
  const home = await temporaryDirectory(t)
  const skill = await writeBundle(join(home, 'skills', 'audit-demo'))
  const external = join(home, 'external.yaml')
  await writeFile(external, 'untouched: true\n', { mode: 0o644 })
  await symlink(external, join(skill, 'linked.yaml'))
  const catalog = new ForgeCatalog(join(home, 'skills'))
  const entry = await catalog.load('audit-demo')
  const manager = new SkillRuntimeManager({ home, catalog })
  await assert.rejects(() => manager.materialize(entry, entry.manifest.profiles.default, {}, 'test-flow'),
    error => error.code === 'FORGE_ARCHIVE_UNSAFE')
  assert.equal(await readFile(external, 'utf8'), 'untouched: true\n')
  assert.equal((await stat(external)).mode & 0o777, 0o644)
})

test('runtime materialization protects secrets and preserves executable owner permissions', {
  skip: process.platform === 'win32' && 'POSIX modes require a POSIX filesystem; Windows ACLs need host acceptance',
}, async t => {
  const home = await temporaryDirectory(t)
  const skill = await writeBundle(join(home, 'skills', 'audit-demo'), { environment: { AUDIT_SECRET: 'synthetic-secret' } })
  const flow = join(skill, 'profiles', 'default', 'dataflow.yaml')
  await chmod(flow, 0o666)
  await writeFile(join(skill, 'launch.sh'), '#!/bin/sh\nexit 0\n', { mode: 0o755 })
  const catalog = new ForgeCatalog(join(home, 'skills'))
  const entry = await catalog.load('audit-demo')
  const manager = new SkillRuntimeManager({ home, catalog })
  const dir = await manager.materialize(entry, entry.manifest.profiles.default, {}, 'test-flow')
  assert.equal((await stat(dir)).mode & 0o777, 0o700)
  assert.equal((await stat(join(dir, 'runtime-lock.json'))).mode & 0o777, 0o600)
  const runtimeFlow = join(dir, 'launch', 'profiles', 'default', 'dataflow.yaml')
  assert.equal((await stat(runtimeFlow)).mode & 0o777, 0o600)
  assert.match(await readFile(runtimeFlow, 'utf8'), /synthetic-secret/)
  assert.equal((await stat(join(dir, 'launch', 'launch.sh'))).mode & 0o777, 0o700)
  assert.equal((await stat(flow)).mode & 0o777, 0o666)
})
