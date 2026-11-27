import assert from 'node:assert/strict'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'
import { loadProxyEnvironment, npmProxyEnvironment, resolveProxySettings } from '../src/proxy-config.mjs'
import { temporaryDirectory } from './helpers/bundle.mjs'

test('user .env supplies only proxy keys; inherited values win across casing and empty values are unset', async t => {
  const root = await temporaryDirectory(t)
  const home = join(root, 'kimi')
  await mkdir(home)
  await writeFile(join(home, '.env'), 'http_proxy=http://file.invalid:1234\nHTTPS_PROXY=http://file.invalid:2345\nALL_PROXY=http://file.invalid:3456\nNO_PROXY=localhost,.internal\nKIMI_FORGE_HOME=/must-not-load\nTOKEN=secret\n')
  const env = { KIMI_CODE_HOME: home, HTTP_PROXY: ' http://process.invalid:4567 ', https_proxy: ' ', HTTPS_PROXY: 'http://process.invalid:5678' }
  const result = await loadProxyEnvironment(env)
  assert.equal(result.http_proxy, 'http://process.invalid:4567')
  assert.equal(result.https_proxy, 'http://process.invalid:5678')
  assert.equal(result.ALL_PROXY, 'http://file.invalid:3456')
  assert.equal(result.no_proxy, 'localhost,.internal')
  assert.equal(result.KIMI_FORGE_HOME, undefined)
  assert.equal(result.TOKEN, undefined)
  assert.equal(env.http_proxy, undefined)
  const empty = await loadProxyEnvironment({ KIMI_CODE_HOME: home, HTTP_PROXY: '', http_proxy: ' ' })
  assert.equal(empty.HTTP_PROXY, 'http://file.invalid:1234')
})

test('missing user .env is optional and project .env is not loaded', async t => {
  const root = await temporaryDirectory(t)
  await writeFile(join(root, '.env'), 'ALL_PROXY=http://project.invalid:1\n')
  const env = { KIMI_CODE_HOME: join(root, 'absent') }
  assert.deepEqual(await loadProxyEnvironment(env), env)
})

test('selection uses nonempty lowercase, then uppercase, then protocol fallback', () => {
  const selected = resolveProxySettings({ http_proxy: ' ', HTTP_PROXY: 'http://http.invalid:1', ALL_PROXY: 'http://all.invalid:2', https_proxy: 'http://lower.invalid:3', HTTPS_PROXY: 'http://upper.invalid:4' })
  assert.equal(selected.httpProxy, 'http://http.invalid:1')
  assert.equal(selected.httpsProxy, 'http://lower.invalid:3')
  assert.equal(resolveProxySettings({ HTTP_PROXY: 'http://http.invalid:1' }).httpsProxy, 'http://http.invalid:1')
  assert.equal(resolveProxySettings({ ALL_PROXY: 'socks5h://localhost:1080' }).httpsProxy, 'socks5://localhost:1080')
})

test('invalid explicit HTTPS setting warns and does not fall back to ALL_PROXY or HTTP', () => {
  const warnings = []
  const selected = resolveProxySettings({ HTTPS_PROXY: 'ftp://user:password@host', ALL_PROXY: 'http://all.invalid:2' }, message => warnings.push(message))
  assert.equal(selected.httpProxy, 'http://all.invalid:2')
  assert.equal(selected.httpsProxy, '')
  assert.equal(warnings.length, 1)
  assert.ok(!warnings[0].includes('password'))
})

test('npm receives HTTP(S) fallback settings, preserves explicit npm configuration and warns for SOCKS', () => {
  const result = npmProxyEnvironment({ ALL_PROXY: 'http://localhost:1234', NO_PROXY: '.internal' })
  assert.equal(result.npm_config_proxy, 'http://localhost:1234')
  assert.equal(result.npm_config_https_proxy, 'http://localhost:1234')
  assert.equal(result.npm_config_noproxy, '.internal')
  const explicit = npmProxyEnvironment({ HTTPS_PROXY: 'http://localhost:1234', npm_config_https_proxy: 'http://npm.invalid:2' })
  assert.equal(explicit.npm_config_https_proxy, 'http://npm.invalid:2')
  const warnings = []
  const socks = npmProxyEnvironment({ ALL_PROXY: 'socks5://localhost:1080' }, message => warnings.push(message))
  assert.equal(socks.npm_config_https_proxy, '')
  assert.ok(warnings.length > 0)
})
