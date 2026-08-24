import assert from 'node:assert/strict'
import fs from 'node:fs'
import test from 'node:test'
import { load } from 'js-yaml'

function parseSkill(path, name) {
  const raw = fs.readFileSync(path, 'utf8')
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/u)
  assert.ok(match, `${name} Skill must carry standard frontmatter`)
  return { frontmatter: load(match[1]), body: match[2] }
}

function readCoreSkill(name) {
  return parseSkill(new URL(`../../../../${name}/SKILL.md`, import.meta.url), name)
}

function readExampleSkill(name) {
  return parseSkill(new URL(`../examples/skills/${name}/SKILL.md`, import.meta.url), name)
}

test('core authoring Skills use portable standard metadata', () => {
  for (const name of ['workflow-to-skill', 'workflow-to-skill-with-surface']) {
    const { frontmatter, body } = readCoreSkill(name)
    assert.equal(frontmatter.name, name)
    assert.equal(frontmatter.metadata?.version, '1.0.0')
    assert.equal(frontmatter.metadata?.['allowed-tools'], undefined)
    assert.equal(frontmatter.metadata?.actweave, undefined)
    assert.ok(body.trim().length > 0)
  }
})

test('RSS example binds named external MCP tools', () => {
  const { frontmatter, body } = readExampleSkill('rss-digest')
  assert.equal(frontmatter.metadata['allowed-tools'], 'mcp__weft__run_published_intelligence-workflow_2f1ab77951dc mcp__weft__get_work_snapshot')
  assert.match(body, /RSS or Atom/u)
  assert.match(body, /source feed/u)
  assert.match(body, /Run reaches `succeeded` or `failed`/u)
  assert.match(body, /30 snapshot calls/u)
  assert.match(body, /five minutes/u)
  assert.match(body, /honor any observed cancellation/u)
  assert.match(body, /initial submission outcome is uncertain/u)
  assert.match(body, /do not submit again/u)
})

test('workflow authoring Skill creates a reviewed method without a private runtime', () => {
  const { frontmatter, body } = readCoreSkill('workflow-to-skill')
  assert.equal(frontmatter.metadata['allowed-tools'], undefined)
  assert.match(frontmatter.description, /without a dedicated interface/u)
  assert.match(frontmatter.description, /produced as workflow output does not count/u)
  assert.match(frontmatter.description, /command UI/u)
  assert.match(frontmatter.description, /use workflow-to-skill-with-surface only/u)
  assert.match(body, /Dify, n8n,/u)
  assert.match(body, /Proposal And Review/u)
  assert.match(body, /Adaptive completion/u)
  assert.match(body, /Unattended/u)
  assert.match(body, /Agent judgment/u)
  assert.match(body, /Do not create\s+a Workflow-to-Skill permission format/u)
  assert.match(body, /installation and discovery evidence/iu)
  assert.match(body, /stale or conflicting/u)
  assert.match(body, /User approval describes intent; it does not grant/u)
  assert.match(body, /Duplicate or replayed approval/u)
  assert.match(body, /single-use\s+approval, idempotency key, or status-based deduplication/u)
  assert.match(body, /literal API keys, tokens, passwords/u)
  assert.match(body, /otherwise report `unknown` or `partial`/u)
})

test('Surface authoring is explicitly routed and preserves the full workflow contract', () => {
  const { frontmatter, body } = readCoreSkill('workflow-to-skill-with-surface')
  assert.equal(frontmatter.metadata['allowed-tools'], undefined)
  assert.match(frontmatter.description, /Use only when the user explicitly requests/u)
  assert.match(frontmatter.description, /use workflow-to-skill when the workflow merely produces/u)
  assert.match(body, /Prompt Surface/u)
  assert.match(body, /ordinary Skill message/u)
  assert.match(body, /must not:[\s\S]*call CLI, MCP, HTTP/u)
  assert.match(body, /same normalized input semantics/u)
  assert.match(body, /lacks a usable message entrypoint or result API/u)
  assert.match(body, /one review of the shared material decisions/u)
  assert.match(body, /stale or conflicting copy/u)
  assert.match(body, /duplicate-submission behavior/u)
  assert.match(body, /otherwise report `unknown` or `partial`/u)
  assert.match(body, /tool call accepted[\s\S]*request submitted[\s\S]*result verified/u)
  assert.match(body, /User approval does not itself grant\s+a tool or credential/u)
  assert.doesNotMatch(body, /SessionFace\.prompt/u)
})

test('Surface instructions protect secrets, untrusted fields, and review continuation', () => {
  const { body } = readCoreSkill('workflow-to-skill-with-surface')
  assert.match(body, /literal API keys, tokens, passwords/u)
  assert.match(body, /Never persist or echo/u)
  assert.match(body, /never interpolate raw field content/u)
  assert.match(body, /proposal causes no execution/u)
  assert.match(body, /approval continues the reviewed context/u)
  assert.match(body, /duplicate or replayed approval/u)
  assert.match(body, /side effect at most once/u)
})

test('standard Skill invocation remains an ordinary slash message', () => {
  const { frontmatter } = readExampleSkill('rss-digest')
  const message = '/rss-digest\nCreate a digest.\nInputs (JSON):\n{"sources":["https://example.test/feed.xml"]}'
  assert.match(message, new RegExp(`^/${frontmatter.name}(?:\\s|$)`))
  assert.equal(message.includes('Action:'), false)
})
