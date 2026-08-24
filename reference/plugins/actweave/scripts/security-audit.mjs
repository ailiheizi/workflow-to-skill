import assert from 'node:assert/strict'
import { access, readdir, readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(fileURLToPath(import.meta.url))
const plugin = dirname(root)
const read = relative => readFile(join(plugin, relative), 'utf8')
const packageJson = JSON.parse(await read('package.json'))
const host = await read('src/host/index.ts')
const readme = await read('README.md')
const productReadme = await read('../../../README.md')

assert.equal(packageJson.dsh?.client, undefined)
assert.equal(packageJson.dsh?.bundle?.patch, './cordis.patch.yml')
assert.equal(packageJson.peerDependencies['@deepseek-ai/dsh-agent'], '0.1.0-rc.8')
assert.match(host, /tools\.guard\(/u)
assert.match(host, /allowed-tools/u)
assert.doesNotMatch(host, /metadata\.actweave/u)
assert.doesNotMatch(host, /registerActweaveToolBridge|execFile/u)
assert.doesNotMatch(readme, /Actweave-owned executable|local command runner/iu)
assert.match(readme, /Dify, n8n, or ComfyUI/iu)
assert.match(productReadme, /live-model tests|comparative evals/iu)
assert.match(productReadme, /Dify|n8n|ComfyUI/iu)
assert.match(productReadme, /Chat|Prompt Surface|Skill/iu)
for (const forbidden of ['src/host/tool.ts', 'src/host/weft.ts']) await assert.rejects(access(join(plugin, forbidden)))

try {
  assert.deepEqual(await readdir(join(plugin, 'src/client')), [])
} catch (error) {
  assert.equal(error?.code, 'ENOENT')
}
for (const forbidden of ['src/contract.ts', 'src/host/metadata.ts']) await assert.rejects(access(join(plugin, forbidden)))

process.stdout.write('security audit passed: Host-only bundle, Skill-scoped guard, no Actweave executor, and deferred external integrations\n')
