import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { existsSync } from 'node:fs'
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const DSH_SPEC = '@deepseek-ai/dsh@0.1.0-rc.8'
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const FIXTURE = resolve(ROOT, 'scripts/fixtures/actweave-mcp-fixture.mjs')
const API_KEY = 'scripted-mcp-key'
const NEGATIVE_MODE = process.env.ACTWEAVE_NATIVE_MCP_NEGATIVE === '1'
const PAGE_BROWSER_MODE = process.env.ACTWEAVE_PAGE_BROWSER === '1'
const MISSING_MCP_COMMAND = '/definitely/missing/actweave-mcp-transport'
const BOOT_TIMEOUT_MS = 30_000
const COMMAND_TIMEOUT_MS = 120_000
const TURN_TIMEOUT_MS = 60_000
const root = await mkdtemp(join(tmpdir(), 'actweave-native-mcp-'))
const home = join(root, 'dsh-home')
const workspace = join(root, 'workspace')
const profileDir = join(home, 'profiles', 'web')
const patchPath = join(profileDir, 'cordis.patch.yml')
const npxArgs = ['--yes', '--package', DSH_SPEC, '--', 'dsh']
const DSH_COMMAND = process.env.ACTWEAVE_DSH_COMMAND ?? 'npx'
const DSH_PREFIX_ARGS = process.env.ACTWEAVE_DSH_COMMAND === undefined ? npxArgs : []
const DSH_WEB_ARGS = ['web', '--host', '127.0.0.1', '--port', '0', ...(process.env.ACTWEAVE_DSH_COMMAND === undefined ? ['--no-open'] : [])]
const skillName = PAGE_BROWSER_MODE ? 'rss-digest' : 'mcp-transform'

if (!root.startsWith(resolve(tmpdir()) + sep)) throw new Error(`unsafe temporary root: ${root}`)

const envFor = (extra = {}) => ({
  ...process.env,
  DSH_HOME: home,
  DSH_TELEMETRY_DISABLED: '1',
  CI: '1',
  NO_COLOR: '1',
  NPM_CONFIG_UPDATE_NOTIFIER: 'false',
  ...extra,
})

function waitExit(child) {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve()
  return new Promise(resolveExit => child.once('exit', resolveExit))
}

async function stopGroup(child) {
  if (child?.pid === undefined) return
  try { process.kill(-child.pid, 'SIGTERM') } catch (error) { if (error?.code !== 'ESRCH') throw error }
  if (await Promise.race([waitExit(child).then(() => true), new Promise(resolveWait => setTimeout(() => resolveWait(false), 2_000))])) return
  try { process.kill(-child.pid, 'SIGKILL') } catch (error) { if (error?.code !== 'ESRCH') throw error }
  await waitExit(child)
}

function run(command, args, label, cwd = ROOT) {
  return new Promise((resolveRun, rejectRun) => {
    const child = spawn(command, args, { cwd, detached: true, stdio: ['ignore', 'pipe', 'pipe'], env: envFor() })
    let stdout = ''
    let stderr = ''
    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      void stopGroup(child).finally(() => rejectRun(new Error(`${label} timed out`)))
    }, COMMAND_TIMEOUT_MS)
    child.stdout.on('data', chunk => { stdout += chunk.toString() })
    child.stderr.on('data', chunk => { stderr += chunk.toString() })
    child.once('error', error => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      rejectRun(error)
    })
    child.once('close', status => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (status !== 0) {
        rejectRun(new Error(`${label} failed (${status})\nstdout:\n${stdout.slice(-8000)}\nstderr:\n${stderr.slice(-8000)}`))
        return
      }
      process.stdout.write(`ok - ${label}\n`)
      resolveRun(stdout)
    })
  })
}

function chunk(id, delta, finishReason) {
  return {
    id,
    object: 'chat.completion.chunk',
    created: Math.floor(Date.now() / 1000),
    model: 'scripted-mcp-model',
    choices: [{ index: 0, delta, finish_reason: finishReason ?? null }],
  }
}

function sendChunk(response, value) {
  response.write(`data: ${JSON.stringify(value)}\n\n`)
}

async function startProvider() {
  const requests = []
  const server = (await import('node:http')).createServer((request, response) => {
    const buffers = []
    request.on('data', data => buffers.push(Buffer.from(data)))
    request.on('end', () => {
      try {
        assert.equal(request.method, 'POST')
        assert.equal(request.url, '/v1/chat/completions')
        const body = JSON.parse(Buffer.concat(buffers).toString('utf8'))
        const messages = Array.isArray(body.messages) ? body.messages : []
        const tools = Array.isArray(body.tools) ? body.tools : []
        const lastUserIndex = messages.findLastIndex(message => message?.role === 'user')
        const turnMessages = lastUserIndex < 0 ? messages : messages.slice(lastUserIndex + 1)
        const assistantCalls = turnMessages.flatMap(message =>
          message?.role === 'assistant' && Array.isArray(message.tool_calls) ? message.tool_calls : [])
        const toolResults = turnMessages.filter(message => message?.role === 'tool')
        const hasMcpSchema = tools.some(tool =>
          tool?.function?.name === 'mcp__fixture__transform' || tool?.name === 'mcp__fixture__transform')
        const hasBashSchema = tools.some(tool => tool?.function?.name === 'bash' || tool?.name === 'bash')
        const hasMcpCall = assistantCalls.some(call => call?.function?.name === 'mcp__fixture__transform')
        const hasBashCall = assistantCalls.some(call => call?.function?.name === 'bash')
        const mcpResult = toolResults.find(message =>
          assistantCalls.some(call => call?.id === message?.tool_call_id && call?.function?.name === 'mcp__fixture__transform'))
        const bashResult = toolResults.find(message =>
          assistantCalls.some(call => call?.id === message?.tool_call_id && call?.function?.name === 'bash'))
        requests.push({
          authorization: request.headers.authorization ?? null,
          hasMcpSchema,
          hasBashSchema,
          hasMcpCall,
          hasBashCall,
          hasMcpResult: mcpResult !== undefined,
          mcpResultText: typeof mcpResult?.content === 'string' ? mcpResult.content : JSON.stringify(mcpResult ?? null),
          hasBashResult: bashResult !== undefined,
        })
        const id = `actweave-mcp-${requests.length}`
        response.writeHead(200, { 'content-type': 'text/event-stream', connection: 'keep-alive', 'cache-control': 'no-store' })
        if (!hasBashCall) {
          sendChunk(response, chunk(id, {
            role: 'assistant',
            tool_calls: [{ index: 0, id: 'call_mcp_bash_probe', type: 'function', function: {
              name: 'bash',
              arguments: JSON.stringify({ command: 'printf bypass > mcp-guard-bypass.txt', description: 'guard probe' }),
            } }],
          }))
          sendChunk(response, chunk(id, {}, 'tool_calls'))
        } else if (!hasMcpCall) {
          assert.ok(hasMcpSchema, 'the MCP tool must be present in the provider schema')
          sendChunk(response, chunk(id, {
            role: 'assistant',
            tool_calls: [{ index: 0, id: 'call_mcp_transform', type: 'function', function: {
              name: 'mcp__fixture__transform',
              arguments: JSON.stringify({ text: 'hello' }),
            } }],
          }))
          sendChunk(response, chunk(id, {}, 'tool_calls'))
        } else {
          assert.ok(mcpResult !== undefined, 'the provider must receive the MCP result before final text')
          sendChunk(response, chunk(id, { role: 'assistant', content: 'MCP returned fixture:hello.' }, 'stop'))
        }
        response.end('data: [DONE]\n\n')
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        if (response.headersSent) {
          response.end()
          process.stderr.write(`scripted MCP provider failed after streaming began: ${message}\n`)
        } else {
          response.writeHead(400, { 'content-type': 'application/json' })
          response.end(JSON.stringify({ error: { message } }))
        }
      }
    })
  })
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const address = server.address()
  assert.ok(address && typeof address === 'object')
  return {
    baseURL: `http://127.0.0.1:${address.port}/v1`,
    requests,
    async close() {
      server.closeAllConnections?.()
      await new Promise(resolveClose => server.close(() => resolveClose()))
    },
  }
}

async function startWeb({ expectFailure = false } = {}) {
  const child = spawn(DSH_COMMAND, [...DSH_PREFIX_ARGS, ...DSH_WEB_ARGS], {
    cwd: workspace,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: envFor({ ACTWEAVE_NATIVE_TEST_KEY: API_KEY }),
  })
  let output = ''
  let startupError
  const collect = data => { output += data.toString() }
  child.stdout.on('data', collect)
  child.stderr.on('data', collect)
  child.once('error', error => { startupError = error })
  const deadline = Date.now() + BOOT_TIMEOUT_MS
  while (Date.now() < deadline) {
    const match = output.match(/dsh web:\s+(http:\/\/127\.0\.0\.1:\d+)/u)
    if (match) {
      if (expectFailure) {
        await stopGroup(child)
        throw new Error(`MCP startup unexpectedly succeeded: ${output.slice(-8000)}`)
      }
      return { child, url: match[1], output: () => output }
    }
    if (startupError) throw startupError
    if (child.exitCode !== null || child.signalCode !== null) {
      if (expectFailure) return { child: undefined, url: undefined, output: () => output, startupFailed: true }
      throw new Error(`DSH Web exited before URL: ${output.slice(-8000)}`)
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 100))
  }
  await stopGroup(child)
  throw new Error(`DSH Web boot timeout: ${output.slice(-8000)}`)
}

async function rpc(url, method, payload) {
  const rpcId = `${method}-${Date.now()}-${Math.random()}`
  const response = await fetch(`${url}/api/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ type: 'client-request', rpcId, method, payload }),
    signal: AbortSignal.timeout(15_000),
  })
  const text = await response.text()
  assert.equal(response.status, 200, `${method}: ${text}`)
  const envelope = JSON.parse(text)
  assert.equal(envelope.type, 'server-response')
  assert.equal(envelope.rpcId, rpcId)
  if (envelope.result?.ok !== true) throw new Error(`${method}: ${JSON.stringify(envelope.result?.error)}`)
  return envelope.result.value
}

async function waitTurn(url, sessionId, afterSeq = -1) {
  const deadline = Date.now() + TURN_TIMEOUT_MS
  let last = []
  while (Date.now() < deadline) {
    const history = await rpc(url, 'session.history', { sessionId })
    last = history.events ?? []
    const current = last.filter(entry => (entry.event?.seq ?? -1) > afterSeq)
    const end = current.findLast(entry => entry.event?.type === 'turn/end')
    if (end) {
      assert.equal(end.event.data?.reason?.kind, 'completed', JSON.stringify(end.event.data))
      return current.map(entry => entry.event)
    }
    await new Promise(resolveWait => setTimeout(resolveWait, 200))
  }
  throw new Error(`turn timeout: ${JSON.stringify(last.slice(-20))}`)
}

async function waitForBrowserSubmit() {
  process.stdout.write('Submit the RSS Digest form in DSH, then press Enter here to continue.\n')
  process.stdin.resume()
  await once(process.stdin, 'data')
  process.stdin.pause()
}

// This is the same ordinary prompt any DSH entrypoint can submit.
// There is deliberately no Actweave client import or private invocation API.
async function submitFromIndependentPage(url, sessionId) {
  return rpc(url, 'session.prompt', {
    sessionId,
    mode: 'queue',
    content: [{ type: 'text', text: `/${skillName}\nTransform hello through the configured MCP tool.` }],
  })
}

let provider
let web
try {
  await mkdir(workspace, { recursive: true })
  await mkdir(join(home, 'profiles', 'web'), { recursive: true })
  await writeFile(join(home, 'settings.yaml'), 'ui-onboarding:\n  welcomeNoticeVersion: 2026-08-13.1\n')
  await mkdir(join(workspace, '.dsh', 'skills', skillName), { recursive: true })
  await writeFile(join(workspace, '.dsh', 'skills', skillName, 'SKILL.md'), [
    '---',
    `name: ${skillName}`,
    'description: Transform text with the configured fixture MCP tool.',
    'metadata:',
    '  version: 1.0.0',
    '  allowed-tools: mcp__fixture__transform',
    '---',
    '',
    'Use the exact `mcp__fixture__transform` tool with the user text. Report its',
    'real result and do not use bash or invent a result.',
    '',
  ].join('\n'))
  provider = await startProvider()
  await run('npm', ['run', 'build'], 'build Actweave bundle')
  const pack = JSON.parse(await run('npm', ['pack', '--json', '--pack-destination', root], 'pack Actweave bundle'))
  assert.equal(pack.length, 1)
  await run(DSH_COMMAND, [...DSH_PREFIX_ARGS, 'plugin', '--profile', 'web', 'add', '-w', join(root, pack[0].filename)], 'install Actweave bundle')
  if (PAGE_BROWSER_MODE) {
    const pageRoot = resolve(ROOT, '../actweave-rss-page')
    await run('npm', ['run', 'build'], 'build RSS Client bundle', pageRoot)
    const pagePack = JSON.parse(await run('npm', ['pack', '--json', '--pack-destination', root], 'pack RSS Client bundle', pageRoot))
    assert.equal(pagePack.length, 1)
    await run(DSH_COMMAND, [...DSH_PREFIX_ARGS, 'plugin', '--profile', 'web', 'add', '-w', join(root, pagePack[0].filename)], 'install RSS Client bundle')
  }
  const fixtureCommand = process.execPath
  const yaml = [
    '- insert:',
    '    - id: mcp-fixture',
    "      name: '@deepseek-ai/dsh-mcp-client'",
    '      config:',
    '        serverName: fixture',
    '        transport: stdio',
    `        command: ${JSON.stringify(NEGATIVE_MODE ? MISSING_MCP_COMMAND : fixtureCommand)}`,
    '        args:',
    `          - ${JSON.stringify(FIXTURE)}`,
    '        failOnStartupError: true',
    '- id: llm-pi-ai',
    '  config:',
    '    providers:',
    '      actweave-local:',
    '        api: openai-completions',
    `        baseURL: ${JSON.stringify(provider.baseURL)}`,
    '        apiKeyEnv: ACTWEAVE_NATIVE_TEST_KEY',
    '        models:',
    '          - id: scripted-mcp-model',
    '            name: Scripted MCP model',
    '            contextWindow: 128000',
    '            maxTokens: 4096',
    '- id: agent-default-model',
    '  config:',
    '    provider: actweave-local',
    '    model: scripted-mcp-model',
    '',
  ].join('\n')
  await writeFile(patchPath, yaml)
  if (NEGATIVE_MODE) {
    const failed = await startWeb({ expectFailure: true })
    assert.equal(failed.startupFailed, true)
    assert.match(failed.output(), /mcp|transport|startup|spawn|enoent|not found/iu)
    process.stdout.write('PASS native-mcp-negative: missing MCP stdio transport failed closed during DSH startup\n')
  } else {
  web = await startWeb()
  const createdWorkspace = await rpc(web.url, 'workspace.create', { path: workspace })
  const created = await rpc(web.url, 'session.create', { workspaceId: createdWorkspace.workspace.workspaceId })
  if (PAGE_BROWSER_MODE) {
    const bootstrap = await submitFromIndependentPage(web.url, created.sessionId)
    assert.equal(bootstrap.accepted, true)
    await waitTurn(web.url, created.sessionId)
    const bootstrapHistory = await rpc(web.url, 'session.history', { sessionId: created.sessionId })
    const afterSeq = Math.max(...(bootstrapHistory.events ?? []).map(entry => entry.event?.seq ?? -1))
    process.stdout.write(`PAGE_BROWSER_URL=${web.url}\nPAGE_BROWSER_SESSION=${created.sessionId}\n`)
    await waitForBrowserSubmit()
    const events = await waitTurn(web.url, created.sessionId, afterSeq)
    assert.ok(events.some(event => event.type === 'user/message' && JSON.stringify(event.data).includes('/rss-digest')))
    assert.ok(events.some(event => event.type === 'user/message' && event.data?.source?.kind === 'skill-invocation' && event.data.source.name === 'rss-digest'))
    const calls = events.filter(event => event.type === 'tool/call')
    assert.ok(calls.some(event => event.data?.name === 'bash'))
    assert.ok(calls.some(event => event.data?.name === 'mcp__fixture__transform'))
    const results = events.filter(event => event.type === 'tool/result')
    const bashResult = results.find(event => event.data?.message?.content?.some(block => block?.toolCallId === calls.find(call => call.data?.name === 'bash')?.data?.callId))
    assert.equal(bashResult?.data?.message?.content?.[0]?.isError, true)
    const mcpCall = calls.find(event => event.data?.name === 'mcp__fixture__transform')
    const mcpResult = results.find(event => event.data?.message?.content?.some(block => block?.toolCallId === mcpCall?.data?.callId))
    assert.equal(mcpResult?.data?.message?.content?.[0]?.isError, false)
    assert.match(JSON.stringify(mcpResult), /fixture:hello/u)
    assert.ok(events.some(event => event.type === 'assistant/message' && JSON.stringify(event.data).includes('MCP returned fixture:hello')))
    assert.ok(provider.requests.some(request => request.authorization === `Bearer ${API_KEY}`))
    process.stdout.write('PASS page-browser: real DSH Client Page -> ordinary /rss-digest prompt -> native MCP result -> shared Session history\n')
  } else {
    const accepted = await submitFromIndependentPage(web.url, created.sessionId)
  assert.equal(accepted.accepted, true)
  const entries = await waitTurn(web.url, created.sessionId)
  const events = entries
  assert.ok(events.some(event => event.type === 'user/message' && JSON.stringify(event.data).includes('/mcp-transform')))
  assert.ok(events.some(event => event.type === 'user/message' && event.data?.source?.kind === 'skill-invocation' && event.data.source.name === 'mcp-transform'))
  const calls = events.filter(event => event.type === 'tool/call')
  assert.ok(calls.some(event => event.data?.name === 'bash'))
  assert.ok(calls.some(event => event.data?.name === 'mcp__fixture__transform'))
  const results = events.filter(event => event.type === 'tool/result')
  const bashResult = results.find(event => event.data?.message?.content?.some(block => block?.toolCallId === calls.find(call => call.data?.name === 'bash')?.data?.callId))
  assert.equal(bashResult?.data?.message?.content?.[0]?.isError, true)
  const mcpCall = calls.find(event => event.data?.name === 'mcp__fixture__transform')
  const mcpResult = results.find(event => event.data?.message?.content?.some(block => block?.toolCallId === mcpCall?.data?.callId))
  assert.equal(mcpResult?.data?.message?.content?.[0]?.isError, false)
  assert.match(JSON.stringify(mcpResult), /fixture:hello/u)
  assert.ok(events.some(event => event.type === 'assistant/message' && JSON.stringify(event.data).includes('MCP returned fixture:hello')))
  assert.ok(provider.requests.some(request => request.authorization === `Bearer ${API_KEY}`))
  assert.ok(provider.requests.some(request => request.hasMcpSchema))
  assert.ok(provider.requests.some(request => request.hasMcpResult))
  assert.ok(provider.requests.some(request => request.hasBashSchema), 'rc.8 schema limitation is observable but execution is guarded')
  assert.equal(existsSync(join(workspace, 'mcp-guard-bypass.txt')), false)
  process.stdout.write('PASS native-mcp: independent Skill prompt -> DSH Skill -> native MCP client -> mcp__fixture__transform result -> guarded bash -> shared Session history\n')
  }
  }
} finally {
  await stopGroup(web?.child)
  await provider?.close()
  if (process.env.ACTWEAVE_KEEP_NATIVE_MCP_ROOT === '1') process.stdout.write(`kept native MCP root ${root}\n`)
  else await rm(root, { recursive: true, force: true })
}
