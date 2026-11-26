import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export async function temporaryDirectory(t, prefix = 'kimi-forge-test-') {
  const dir = await mkdtemp(join(tmpdir(), prefix))
  t.after(() => rm(dir, { recursive: true, force: true }))
  return dir
}

export async function writeBundle(dir, {
  name = 'audit-demo',
  gatewayUrl = 'http://127.0.0.1:19299',
  forgeVersion = '2',
  environment = {},
  startupTimeoutS,
} = {}) {
  await mkdir(join(dir, 'profiles', 'default'), { recursive: true })
  await writeFile(join(dir, 'SKILL.md'), '# Synthetic test skill\n')
  await writeFile(join(dir, 'profiles', 'default', 'dataflow.yaml'), 'nodes:\n  - id: test-node\n    path: /bin/true\n')
  await writeFile(join(dir, 'skill.yaml'), [
    'manifest_version: 2',
    `forge_version: ${JSON.stringify(forgeVersion)}`,
    `name: ${name}`,
    'version: 0.1.0',
    'description: Synthetic test bundle; no robot or simulator is connected.',
    'skill_document: SKILL.md',
    `gateway_url: ${JSON.stringify(gatewayUrl)}`,
    'profiles:',
    '  default:',
    '    dataflow: profiles/default/dataflow.yaml',
    ...(startupTimeoutS === undefined ? [] : [`    startup_timeout_s: ${startupTimeoutS}`]),
    `    environment: ${JSON.stringify(environment)}`,
    '',
  ].join('\n'))
  return dir
}
