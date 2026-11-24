#!/usr/bin/env node
import { spawn } from 'node:child_process'
import { readdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const files = (await readdir(join(root, 'tests')))
  .filter(name => name.endsWith('.test.mjs')).sort().map(name => join('tests', name))
if (!files.length) throw new Error('No test files found')
const child = spawn(process.execPath, ['--test', ...files], { cwd: root, stdio: 'inherit' })
child.once('error', error => { console.error(error); process.exitCode = 1 })
child.once('exit', code => { process.exitCode = code ?? 1 })
