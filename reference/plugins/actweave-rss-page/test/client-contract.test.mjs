import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../../actweave-rss-page/', import.meta.url)

test('RSS Client example is an independent dsh.client slot contribution', async () => {
  const manifest = JSON.parse(await readFile(new URL('package.json', root), 'utf8'))
  const source = await readFile(new URL('src/client.js', root), 'utf8')
  const bundledClient = await readFile(new URL('lib/client.js', root), 'utf8')
  assert.deepEqual(manifest.dsh.client.inject, [
    '@deepseek-ai/dsh-client-runtime',
    '@deepseek-ai/dsh-client-ui-conversation',
  ])
  assert.equal(manifest.dsh.client.platform, 'web')
  assert.match(source, /ctx\.slots\.inject\('conversation\.view'/u)
  assert.match(source, /ctx\.slots\.register/u)
  assert.match(source, /ctx\.sessions\.binding\(sessionId\)\?\.session/u)
  assert.match(source, /session\.prompt\(\[\{ type: 'text'/u)
  assert.match(source, /\/rss-digest/u)
  assert.doesNotMatch(source, /mcp|weft|metadata\.actweave/u)
  assert.doesNotMatch(source, /from ['"].*actweave(?:['"/])/u)
  assert.match(bundledClient, /window\.__ModuleLoader__\.load/u)
})
