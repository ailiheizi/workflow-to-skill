import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

test('RSS view is a normal DSH client plugin, not an Actweave Page runtime', async () => {
  const manifest = JSON.parse(await readFile(new URL('package.json', root), 'utf8'))
  const patch = await readFile(new URL('cordis.patch.yml', root), 'utf8')
  const source = await readFile(new URL('src/client.js', root), 'utf8')
  const bundle = await readFile(new URL('lib/client.js', root), 'utf8')

  assert.equal(manifest.name, '@poiema/actweave-rss-page')
  assert.equal(manifest.dsh?.bundle?.patch, './cordis.patch.yml')
  assert.equal(manifest.dsh?.client?.platform, 'web')
  assert.deepEqual(manifest.dsh?.client?.inject, [
    '@deepseek-ai/dsh-client-runtime',
    '@deepseek-ai/dsh-client-ui-conversation',
  ])
  assert.match(patch, /id: actweave-rss-page/u)
  assert.match(patch, /name: '@poiema\/actweave-rss-page'/u)
  assert.match(source, /conversation\.view/u)
  assert.match(source, /session\.prompt/u)
  assert.match(source, /awaitingNodeCount/u)
  assert.doesNotMatch(source, /metadata\.allowed-tools/u)
  assert.doesNotMatch(source, /run_published_intelligence|fetch\(/u)
  assert.match(bundle, /window\.__ModuleLoader__\.load/u)
  assert.match(bundle, /"@poiema\/actweave-rss-page"/u)
  assert.match(bundle, /inject/u)
})

test('embedded view keeps the same user-facing Skill prompt contract', async () => {
  const source = await readFile(new URL('../src/client.js', import.meta.url), 'utf8')
  assert.match(source, /const SKILL_COMMAND = ['"]\/rss-digest/u)
  assert.match(source, /Inputs \(JSON\)/u)
  assert.match(source, /ordinary \/rss-digest prompt/u)
  assert.match(source, /JSON\.stringify\(values/u)
})
