import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('../', import.meta.url)

test('social workbench is a prompt-only DSH conversation view', async () => {
  const manifest = JSON.parse(await readFile(new URL('package.json', root), 'utf8'))
  const patch = await readFile(new URL('cordis.patch.yml', root), 'utf8')
  const source = await readFile(new URL('src/client.js', root), 'utf8')
  const bundle = await readFile(new URL('lib/client.js', root), 'utf8')

  assert.equal(manifest.name, '@poiema/actweave-social-page')
  assert.equal(manifest.dsh?.client?.platform, 'web')
  assert.deepEqual(manifest.dsh?.client?.inject, [
    '@deepseek-ai/dsh-client-runtime',
    '@deepseek-ai/dsh-client-ui-conversation',
  ])
  assert.match(patch, /id: actweave-social-page/u)
  assert.match(source, /ctx\.slots\.inject\('conversation\.view'/u)
  assert.match(source, /session\.prompt\(\[\{ type: 'text'/u)
  assert.match(source, /\/xiaohongshu-zhihu-content-operator/u)
  assert.match(source, /social-ops-workbench/u)
  assert.match(source, /账号池/u)
  assert.match(source, /任务、账号、Skill/u)
  assert.match(source, /任意已安装的 slash Skill/u)
  assert.match(source, /任务/u)
  assert.match(source, /current DSH Session/u)
  assert.match(source, /<user_data_json>/u)
  assert.match(source, /container-type:inline-size/u)
  assert.match(source, /查看运行记录/u)
  assert.match(source, /accountPools/u)
  assert.match(source, /<social_draft_json>/u)
  assert.match(source, /actions\.clearError\(\)/u)
  assert.doesNotMatch(source, /contentStage/u)
  assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|document\.cookie|localStorage|<iframe|jsx\('iframe'/u)
  assert.match(bundle, /window\.__ModuleLoader__\.load/u)
})

test('workbench flows stop before every live side effect', async () => {
  const source = await readFile(new URL('../src/client.js', import.meta.url), 'utf8')
  assert.match(source, /exactly one .* test post for review/u)
  assert.match(source, /Do not perform live login, credential rotation, upload, scheduling, or publication/u)
  assert.match(source, /ask for a new explicit approval/u)
  assert.match(source, /Do not draft, upload, schedule, publish, like, comment, rotate credentials/u)
  assert.match(source, /Do not log in, change credentials, switch external settings, upload, publish/u)
  assert.match(source, /do not write files, alter global settings, publish/u)
  assert.doesNotMatch(source, /block\?\.type === 'thinking'|block\?\.kind === 'reasoning'/u)
  assert.match(source, /https:\/\/www\.xiaohongshu\.com\//u)
  assert.match(source, /https:\/\/www\.zhihu\.com\/signin/u)
  assert.match(source, /open the official login page with the OS default browser/u)
  assert.match(source, /separate, fresh, or headless browser profile/u)
  assert.match(source, /exporting cookies to bridge the two is not permitted/u)
  assert.match(source, /re-run the read-only check before reporting/u)
  assert.match(source, /does not provide the official read credential/u)
})
