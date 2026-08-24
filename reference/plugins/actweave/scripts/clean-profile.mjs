import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { access, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const DSH_SPEC = '@deepseek-ai/dsh@0.1.0-rc.8'
const PACKAGE_NAME = '@poiema/actweave'
const pluginRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const home = await mkdtemp(join(tmpdir(), 'actweave-dsh-home-'))
const profileDir = join(home, 'profiles', 'web')
const patchPath = join(profileDir, 'cordis.patch.yml')
const npxArgs = ['--yes', '--package', DSH_SPEC, '--', 'dsh']
const DSH_COMMAND = process.env.ACTWEAVE_DSH_COMMAND ?? 'npx'
const DSH_PREFIX_ARGS = process.env.ACTWEAVE_DSH_COMMAND === undefined ? npxArgs : []
const WEB_BOOT_TIMEOUT_MS = 30_000
const COMMAND_TIMEOUT_MS = 180_000

if (!home.startsWith(resolve(tmpdir()) + sep)) {
  throw new Error(`refusing to use non-temporary DSH_HOME: ${home}`)
}

function runCommand(command, args, label, cwd = pluginRoot) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: {
        ...process.env,
        DSH_HOME: home,
        DSH_TELEMETRY_DISABLED: '1',
      },
    })
    let stdout = ''
    let stderr = ''
    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      try { process.kill(-child.pid, 'SIGTERM') } catch (error) {
        if (error?.code !== 'ESRCH') {
          reject(error)
          return
        }
      }
      reject(new Error(`${label} timed out after ${COMMAND_TIMEOUT_MS}ms`))
    }, COMMAND_TIMEOUT_MS)
    child.stdout.on('data', chunk => { stdout += chunk.toString() })
    child.stderr.on('data', chunk => { stderr += chunk.toString() })
    child.once('error', error => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      reject(error)
    })
    child.once('close', status => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (status !== 0) {
        reject(new Error(`${label} failed (${status})\nstdout:\n${stdout}\nstderr:\n${stderr}`))
        return
      }
      process.stdout.write(`ok - ${label}\n`)
      resolve(stdout)
    })
  })
}

async function runDsh(args, label) {
  return await runCommand(DSH_COMMAND, [...DSH_PREFIX_ARGS, ...args], label)
}

function waitForExit(child) {
  if (child.exitCode !== null || child.signalCode !== null) return Promise.resolve()
  return new Promise(resolve => child.once('exit', resolve))
}

async function stopProcessGroup(child) {
  if (child.pid === undefined) return
  try {
    process.kill(-child.pid, 'SIGTERM')
  } catch (error) {
    if (error?.code !== 'ESRCH') throw error
  }

  const stopped = await Promise.race([
    waitForExit(child).then(() => true),
    new Promise(resolve => setTimeout(() => resolve(false), 2_000)),
  ])
  if (stopped) return

  try {
    process.kill(-child.pid, 'SIGKILL')
  } catch (error) {
    if (error?.code !== 'ESRCH') throw error
  }
  await waitForExit(child)
}

async function bootWebSmoke() {
  const webArgs = [...DSH_PREFIX_ARGS, 'web', '--host', '127.0.0.1', '--port', '0']
  if (process.env.ACTWEAVE_DSH_COMMAND === undefined) webArgs.push('--no-open')
  const child = spawn(DSH_COMMAND, webArgs, {
    cwd: pluginRoot,
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      DSH_HOME: home,
      DSH_TELEMETRY_DISABLED: '1',
      CI: '1',
      NO_COLOR: '1',
      NPM_CONFIG_UPDATE_NOTIFIER: 'false',
    },
  })

  let output = ''
  let startupError
  const collect = chunk => {
    // Keep logs private. They may contain configuration details or credentials.
    output += chunk.toString()
  }
  child.stdout.on('data', collect)
  child.stderr.on('data', collect)
  child.once('error', error => { startupError = error })

  try {
    const deadline = Date.now() + WEB_BOOT_TIMEOUT_MS
    let url
    while (url === undefined && Date.now() < deadline) {
      const match = output.match(/dsh web:\s+(http:\/\/127\.0\.0\.1:\d+)/u)
      if (match !== null) {
        url = match[1]
        break
      }
      if (startupError !== undefined) {
        throw new Error(`DSH Web process failed to start: ${startupError.message}`)
      }
      if (child.exitCode !== null || child.signalCode !== null) {
        throw new Error(`DSH Web process exited before announcing a URL (status ${child.exitCode ?? child.signalCode})`)
      }
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    if (url === undefined) {
      throw new Error(`DSH Web did not announce a URL within ${WEB_BOOT_TIMEOUT_MS}ms`)
    }

    const response = await fetch(`${url}/`, {
      signal: AbortSignal.timeout(5_000),
    })
    const html = await response.text()
    assert.equal(response.status, 200)
    assert.match(response.headers.get('content-type') ?? '', /text\/html/u)
    assert.match(html, /window\.__DSH_BOOT__/u)
    // Actweave is Host-only; DSH still serves its own client runtime, but this
    // bundle must not inject a plugin Client entry into the browser boot page.
    assert.doesNotMatch(html, /@poiema\/actweave/u)
    assert.match(html, /@deepseek-ai\/dsh-client-runtime/u)
    process.stdout.write(`ok - DSH Web boot smoke (${url})\n`)
  } finally {
    await stopProcessGroup(child)
  }
}

async function importInstalledHost() {
  // DSH can publish the profile manifest just before npm materializes the
  // package target. Wait for this exact file within a bounded window so a
  // transient install race does not make the clean-profile gate flaky.
  const entry = join(profileDir, 'node_modules', '@poiema', 'actweave', 'lib', 'index.js')
  const deadline = Date.now() + 10_000
  while (Date.now() < deadline) {
    try {
      await access(entry)
      break
    } catch {
      await new Promise(resolve => setTimeout(resolve, 100))
    }
  }
  const probe = [
    `const module = await import(${JSON.stringify(PACKAGE_NAME)})`,
    `if (typeof module.apply !== 'function') throw new Error('Actweave Host apply export is absent')`,
  ].join('; ')
  await runCommand('node', ['--input-type=module', '--eval', probe], 'import installed Host entry', profileDir)
}

async function profileManifest() {
  return JSON.parse(await readFile(join(profileDir, 'package.json'), 'utf8'))
}

try {
  const packResult = JSON.parse(await runCommand(
    'npm',
    ['pack', '--json', '--pack-destination', home],
    'pack installable bundle',
  ))
  assert.equal(packResult.length, 1)
  const tarball = join(home, packResult[0].filename)

  await runDsh(['--version'], `DSH ${DSH_SPEC}`)
  await runDsh(['plugin', '--profile', 'web', 'add', '-w', tarball], 'install packed bundle')

  const installed = await profileManifest()
  assert.equal(typeof installed.dependencies?.[PACKAGE_NAME], 'string')
  assert.equal(installed.dsh?.profile?.bundles?.filter(name => name === PACKAGE_NAME).length, 1)
  await importInstalledHost()

  const enabled = await runDsh(['--profile', 'web', '--dump-config'], 'dump enabled composition')
  assert.match(enabled, /id:\s+actweave(?:\s|$)/u)
  assert.match(enabled, /name:\s+['"]?@poiema\/actweave['"]?(?:\s|$)/u)
  await bootWebSmoke()

  await writeFile(patchPath, '- id: actweave\n  disabled: true\n')
  const disabled = await runDsh(['--profile', 'web', '--dump-config'], 'dump disabled composition')
  assert.match(disabled, /id:\s+actweave[\s\S]*?disabled:\s+true/u)

  await writeFile(patchPath, '[]\n')
  await runDsh(['plugin', '--profile', 'web', 'remove', '-w', PACKAGE_NAME], 'remove packed bundle')

  const removed = await profileManifest()
  assert.equal(removed.dependencies?.[PACKAGE_NAME], undefined)
  assert.equal(removed.dsh?.profile?.bundles?.includes(PACKAGE_NAME), false)
  const clean = await runDsh(['--profile', 'web', '--dump-config'], 'dump composition after removal')
  assert.doesNotMatch(clean, /@poiema\/actweave/u)

  process.stdout.write(`clean-profile acceptance passed in isolated DSH_HOME ${home}\n`)
} finally {
  if (process.env.ACTWEAVE_KEEP_TEST_HOME === '1') {
    process.stdout.write(`kept isolated DSH_HOME ${home}\n`)
  } else {
    await rm(home, { recursive: true, force: true })
  }
}
