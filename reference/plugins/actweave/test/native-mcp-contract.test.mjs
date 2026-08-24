import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = JSON.parse(await readFile(resolve(pluginRoot, 'package.json'), 'utf8'))
const source = await readFile(resolve(pluginRoot, 'scripts/native-mcp.mjs'), 'utf8')

test('native MCP acceptance covers fail-closed stdio startup failure', () => {
  assert.equal(
    packageJson.scripts['acceptance:native-mcp'],
    'node --import tsx scripts/native-mcp.mjs',
  )
  assert.equal(
    packageJson.scripts['acceptance:native-mcp-negative'],
    'ACTWEAVE_NATIVE_MCP_NEGATIVE=1 node --import tsx scripts/native-mcp.mjs',
  )
  assert.equal(
    packageJson.scripts['acceptance:page-browser'],
    'ACTWEAVE_PAGE_BROWSER=1 node --import tsx scripts/native-mcp.mjs',
  )
  assert.match(source, /ACTWEAVE_NATIVE_MCP_NEGATIVE/u)
  assert.match(source, /definitely\/missing\/actweave-mcp-transport/u)
  assert.match(source, /failOnStartupError: true/u)
  assert.match(source, /startWeb\(\{ expectFailure: true \}\)/u)
  assert.match(source, /MCP startup unexpectedly succeeded/u)
  assert.match(source, /missing MCP stdio transport failed closed during DSH startup/u)
})

test('native MCP acceptance keeps the real DSH MCP client path', () => {
  assert.match(source, /@deepseek-ai\/dsh-mcp-client/u)
  assert.match(source, /transport: stdio/u)
  assert.match(source, /mcp__fixture__transform/u)
  assert.match(source, /session\.prompt/u)
  assert.match(source, /session\.history/u)
  assert.match(source, /assert\.equal\(mcpResult\?\.data\?\.message\?\.content\?\.\[0\]\?\.isError, false\)/u)
})

test('browser acceptance isolates evidence to the post-submit turn', () => {
  assert.match(source, /const current = last\.filter\(entry => \(entry\.event\?\.seq \?\? -1\) > afterSeq\)/u)
  assert.match(source, /return current\.map\(entry => entry\.event\)/u)
  assert.match(source, /const events = await waitTurn\(web\.url, created\.sessionId, afterSeq\)/u)
})
