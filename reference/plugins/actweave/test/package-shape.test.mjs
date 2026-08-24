import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import test from 'node:test'
import { load } from 'js-yaml'

const pluginRoot = new URL('../', import.meta.url)
const DSH_VERSION = '0.1.0-rc.8'

test('is one truthful, minimal Host-only DSH bundle', async () => {
  const manifest = JSON.parse(
    await readFile(new URL('package.json', pluginRoot), 'utf8'),
  )
  const patch = load(await readFile(new URL('cordis.patch.yml', pluginRoot), 'utf8'))

  assert.equal(manifest.name, '@poiema/actweave')
  assert.equal(manifest.private, true)
  assert.equal(manifest.dsh?.bundle?.patch, './cordis.patch.yml')
  assert.equal(manifest.dsh?.client, undefined)
  assert.deepEqual(patch, [{
    insert: [{ id: 'actweave', name: '@poiema/actweave' }],
  }])

  for (const dependencies of [manifest.peerDependencies, manifest.devDependencies]) {
    for (const [name, version] of Object.entries(dependencies)) {
      if (name.startsWith('@deepseek-ai/dsh-')) assert.equal(version, DSH_VERSION, name)
    }
  }
})

test('emits only the Host entry', async () => {
  const host = await readFile(new URL('lib/index.js', pluginRoot), 'utf8')
  assert.match(host, /function apply\(/u)
  assert.doesNotMatch(host, /\bexport\s*\{[^}]*\bdefault\b/u)
  assert.equal((await readdir(new URL('lib/', pluginRoot))).some(entry => entry.startsWith('client.')), false)
})

test('does not grow a parallel product platform', async () => {
  const entries = new Set(await readdir(pluginRoot))
  const forbidden = [
    'apps',
    'database',
    'desktop',
    'marketplace',
    'runtime',
    'server',
    'shell',
  ]

  for (const entry of forbidden) {
    assert.equal(entries.has(entry), false, `unexpected product domain: ${entry}`)
  }
})

test('the workspace lock does not retain Actweave Client dependencies', async () => {
  const lock = JSON.parse(await readFile(new URL('../../../package-lock.json', import.meta.url), 'utf8'))
  const workspace = lock.packages?.['plugins/actweave']
  assert.ok(workspace)
  for (const dependencies of [workspace.dependencies, workspace.devDependencies, workspace.peerDependencies]) {
    for (const name of Object.keys(dependencies ?? {})) {
      assert.equal(name.startsWith('@deepseek-ai/dsh-client-'), false, name)
    }
  }
  assert.equal(
    Object.keys(lock.packages).some(name => name.startsWith('plugins/actweave/node_modules/@deepseek-ai/dsh-client-')),
    false,
  )
})
