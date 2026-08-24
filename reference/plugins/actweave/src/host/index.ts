/** Host bridge from DSH's active Skill to existing typed tools. */
import type { Context } from '@deepseek-ai/cordis'
import type { Agent, PreStepDecision } from '@deepseek-ai/dsh-agent'
import type { AgentPresets } from '@deepseek-ai/dsh-agent-presets'
import type { ScopeKey } from '@deepseek-ai/dsh-scope'
import type {} from '@deepseek-ai/dsh-tools'
import { isUserInvocable, type SkillDefinition, type SkillRegistry } from '@deepseek-ai/dsh-skill'

const DSH_SKILL_TOOL_NAME = 'skill'

interface ActweaveTurnToolScope {
  readonly turn: number
  readonly skillName: string
  readonly allowedTools: ReadonlySet<string>
  readonly disposeRestriction: () => void
  readonly disposeGuard: () => void
}

interface ActiveSkillSet {
  readonly turn: number
  readonly names: readonly string[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Register the turn-scoped capability guard for the active Skill. */
export function apply(ctx: Context): void {
  ctx.effect(
    () => registerActweaveAgentToolScope(ctx),
    'actweave: release agent tool scopes on plugin disposal',
  )
}

/**
 * Install the narrow Actweave capability boundary at DSH's native step hook.
 * The Skill remains the source of workflow guidance; this hook only applies
 * the declared standard tool capability for that turn.
 */
export function registerActweaveAgentToolScope(ctx: Context): () => void {
  const scopes = new Map<string, ActweaveTurnToolScope>()
  const generations = new Map<string, number>()
  const activeSkills = new Map<string, ActiveSkillSet>()
  const disposeAgentScope = (agentId: string) => {
    const scope = scopes.get(agentId)
    if (scope === undefined) return
    scopes.delete(agentId)
    scope.disposeGuard()
    scope.disposeRestriction()
  }
  const invalidate = (agentId: string) => {
    generations.set(agentId, (generations.get(agentId) ?? 0) + 1)
    disposeAgentScope(agentId)
    activeSkills.delete(agentId)
  }
  const disposeAll = () => {
    for (const agentId of new Set([...scopes.keys(), ...generations.keys(), ...activeSkills.keys()])) {
      invalidate(agentId)
    }
  }

  const disposePreStep = ctx.on('agent/pre-step', async ({ agent, turn, signal }, next) => {
    const agentId = String(agent.id)
    const generation = (generations.get(agentId) ?? 0) + 1
    generations.set(agentId, generation)
    // Re-evaluate on every proposed step. A Skill can be edited, a scoped MCP
    // tool can reconnect, or a steer can replace the active invocation while a
    // turn is still open. Keeping the previous guard during resolution would
    // make an old capability usable through that race window.
    disposeAgentScope(agentId)
    const decision = await next()
    await updateActweaveAgentToolScope(
      ctx,
      agent,
      turn,
      decision,
      scopes,
      activeSkills,
      generations,
      generation,
      signal,
    )
    return decision
  }, { prepend: true })
  const disposeSessionEvent = ctx.on('session/event', (session, event) => {
    if (event.type === 'turn/end') invalidate(String(session.id))
  })
  const disposeAgent = ctx.on('agent/disposed', ({ agent }) => {
    invalidate(String(agent.id))
  })
  return () => {
    disposePreStep()
    disposeSessionEvent()
    disposeAgent()
    disposeAll()
  }
}

async function updateActweaveAgentToolScope(
  ctx: Context,
  agent: Agent,
  turn: number,
  decision: PreStepDecision,
  scopes: Map<string, ActweaveTurnToolScope>,
  activeSkills: Map<string, ActiveSkillSet>,
  generations: Map<string, number>,
  generation: number,
  signal: AbortSignal,
): Promise<void> {
  const agentId = String(agent.id)
  if (decision.kind !== 'enter') return

  const observedNames = decision.messages
    .map(message => skillNameFromSource((message as unknown as Record<string, unknown>).source))
    .filter((name): name is string => name !== undefined)
  const previous = activeSkills.get(agentId)
  const sessionNames = openTurnSkillNames(agent.session.events ?? []) ?? []
  const skillNames = uniqueStrings([
    ...(previous?.turn === turn ? previous.names : []),
    ...sessionNames,
    ...observedNames,
  ])
  if (skillNames.length === 0) {
    activeSkills.delete(agentId)
    return
  }
  activeSkills.set(agentId, { turn, names: skillNames })

  // More than one explicit Skill source makes capability ownership ambiguous.
  // Do not union declarations from unrelated Skills.
  if (skillNames.length !== 1) {
    installAgentToolGuard(agent, turn, '', new Set(), scopes, generations, generation)
    return
  }

  const capability = await actweaveSkillCapability(ctx, agent, skillNames[0]!, signal)
  // Skill lookup is asynchronous. A later pre-step, turn end, or disposal may
  // have superseded this result while the registry was loading.
  if (generations.get(agentId) !== generation || signal.aborted) return
  if (capability.kind === 'ordinary') return
  installAgentToolGuard(
    agent,
    turn,
    capability.kind === 'scoped' ? skillNames[0]! : '',
    capability.allowedTools,
    scopes,
    generations,
    generation,
  )
}

type ActweaveSkillCapability =
  | { readonly kind: 'ordinary'; readonly allowedTools: ReadonlySet<string> }
  | { readonly kind: 'scoped'; readonly allowedTools: ReadonlySet<string> }
  | { readonly kind: 'deny'; readonly allowedTools: ReadonlySet<string> }

async function actweaveSkillCapability(
  ctx: Context,
  agent: Agent,
  skillName: string,
  signal: AbortSignal,
): Promise<ActweaveSkillCapability> {
  let metadata: { readonly definition: SkillDefinition } | undefined
  try {
    metadata = await actweaveSkillMetadata(ctx, agent, skillName, signal)
  } catch (error) {
    if (signal.aborted) throw error
    return { kind: 'deny', allowedTools: new Set() }
  }
  if (metadata === undefined) return { kind: 'deny', allowedTools: new Set() }
  const declaration = parseAllowedToolsDeclaration(metadata.definition)
  if (declaration.kind === 'absent') return { kind: 'ordinary', allowedTools: new Set() }
  if (declaration.kind === 'invalid') return { kind: 'deny', allowedTools: new Set() }
  return { kind: 'scoped', allowedTools: new Set(declaration.names) }
}

async function actweaveSkillMetadata(
  ctx: Context,
  agent: Agent,
  skillName: string,
  signal: AbortSignal,
): Promise<{ definition: SkillDefinition } | undefined> {
  const cwd = agent.session.header.cwd
  if (cwd === undefined) return undefined
  const presets = ctx.get('agentPresets') as AgentPresets | undefined
  const scoped = presets?.serviceFor(agent, 'skills') as SkillRegistry | undefined
  const agentContext = agent.ctx as unknown as { get?: (name: string) => unknown }
  const registry = scoped
    ?? agentContext.get?.('skills') as SkillRegistry | undefined
    ?? ctx.get('skills') as SkillRegistry | undefined
  if (registry === undefined) return undefined
  signal.throwIfAborted()
  const definition = await registry.get(skillName, { cwd, scope: agent as unknown as ScopeKey, signal })
  signal.throwIfAborted()
  if (definition === undefined || definition.name !== skillName || !isUserInvocable(definition)) return undefined
  return { definition }
}

function installAgentToolGuard(
  agent: Agent,
  turn: number,
  skillName: string,
  allowedTools: ReadonlySet<string>,
  scopes: Map<string, ActweaveTurnToolScope>,
  generations: Map<string, number>,
  generation: number,
): void {
  const agentId = String(agent.id)
  const tools = agent.ctx.tools
  let disposeRestriction: () => void = () => undefined
  if (allowedTools.size > 0) {
    try {
      // `restrict()` only filters inherited global tools; scoped tools (which
      // includes most preset and MCP registrations) remain visible. It is a
      // useful presentation hint where supported, while the guard below is
      // the generic execution boundary.
      disposeRestriction = tools.restrict({ allow: [...allowedTools] })
    } catch {
      // Unknown or scope-local names are expected for MCP/preset tools. The
      // execution guard remains authoritative when visibility composition
      // cannot accept the complete declaration.
    }
  }
  const disposeGuard = tools.guard(execution => {
    if (execution.name === DSH_SKILL_TOOL_NAME) {
      return undefined
    }
    if (allowedTools.has(execution.name)) return undefined
    if (skillName === '') return 'Actweave Skill capability validation failed; all tool execution is denied'
    return `Skill "${skillName}" turn may execute only its declared tools`
  })
  // A newer generation may have superseded this scope between the async
  // lookup and registration. Dispose immediately instead of publishing a
  // stale guard.
  if (generations.get(agentId) !== generation) {
    disposeGuard()
    disposeRestriction()
    return
  }
  scopes.set(agentId, { turn, skillName, allowedTools, disposeRestriction, disposeGuard })
}

/** Return explicit Skill names in the latest still-open turn, or undefined. */
function openTurnSkillNames(
  events: readonly { readonly type: string; readonly data?: unknown }[],
): readonly string[] | undefined {
  let turnStart = -1
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index]
    if (event?.type === 'turn/end') return undefined
    if (event?.type === 'turn/start') {
      turnStart = index
      break
    }
  }
  if (turnStart < 0) return undefined
  const names: string[] = []
  for (const event of events.slice(turnStart + 1)) {
    if (event.type !== 'user/message' || !isRecord(event.data)) continue
    const name = skillNameFromSource(event.data.source)
    if (name !== undefined && !names.includes(name)) names.push(name)
  }
  return names
}

function uniqueStrings(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)])
}

function skillNameFromSource(source: unknown): string | undefined {
  if (!isRecord(source)) return undefined
  return source.kind === 'skill-invocation'
    && source.form === 'instructions'
    && typeof source.name === 'string'
    ? source.name
    : undefined
}

type AllowedToolsDeclaration =
  | { readonly kind: 'absent' }
  | { readonly kind: 'invalid' }
  | { readonly kind: 'valid'; readonly names: readonly string[] }

function parseAllowedToolsDeclaration(definition: Pick<SkillDefinition, 'metadata'>): AllowedToolsDeclaration {
  const metadata = definition.metadata
  if (!isRecord(metadata) || !Object.prototype.hasOwnProperty.call(metadata, 'allowed-tools')) {
    return { kind: 'absent' }
  }
  const raw = metadata['allowed-tools']
  const names = typeof raw === 'string'
    ? raw.trim().split(/\s+/u).filter(Boolean)
    : Array.isArray(raw) && raw.every((value) => typeof value === 'string' && value.trim() !== '' && !/\s/u.test(value))
      ? raw.map(value => value.trim())
      : null
  if (names === null || names.length === 0) return { kind: 'invalid' }
  return { kind: 'valid', names: Object.freeze([...new Set(names)]) }
}
