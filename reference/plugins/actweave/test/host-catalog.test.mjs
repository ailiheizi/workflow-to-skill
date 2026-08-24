import assert from 'node:assert/strict';
import test from 'node:test';
import { registerActweaveAgentToolScope } from '../src/host/index.ts';

const sessionId = 'session-1';

function summary(name, userInvocable = true) {
  return {
    name,
    description: `${name} description`,
    invocation: { modelInvocable: true, userInvocable },
    source: 'runtime',
    provider: 'test',
  };
}

function deferred() {
  let resolve;
  const promise = new Promise(done => { resolve = done; });
  return { promise, resolve };
}

function toolScopeHarness({ metadata = { 'allowed-tools': 'mcp__fixture__transform' }, registry: suppliedRegistry } = {}) {
  const listeners = new Map();
  const listenerOptions = new Map();
  const disposed = [];
  const restrictions = [];
  const guards = [];
  const session = {
    id: sessionId,
    header: { id: sessionId, cwd: '/workspace/project', agentPreset: 'standard' },
    events: [],
  };
  const registry = suppliedRegistry ?? {
    async get(name) {
      return { ...summary(name), content: 'instructions', metadata };
    },
  };
  const agent = {
    id: sessionId,
    session,
    ctx: {
      tools: {
        restrict(filter) {
          restrictions.push(filter);
          return () => disposed.push('restriction');
        },
        guard(guard) {
          guards.push(guard);
          return () => disposed.push('guard');
        },
      },
    },
  };
  const ctx = {
    sessions: { get: id => id === sessionId ? session : undefined },
    agents: { get: id => id === sessionId ? agent : undefined },
    get(name) {
      if (name === 'skills') return registry;
      return undefined;
    },
    on(name, listener, options) {
      listeners.set(name, listener);
      listenerOptions.set(name, options);
      return () => disposed.push(`listener:${name}`);
    },
  };
  const dispose = registerActweaveAgentToolScope(ctx);
  return { agent, ctx, listeners, listenerOptions, restrictions, guards, disposed, dispose, session };
}

function enter(name = 'resize', messages = undefined) {
  return {
    kind: 'enter',
    messages: messages ?? [{ source: { kind: 'skill-invocation', form: 'instructions', name } }],
  };
}

async function preStep(harness, decision = enter()) {
  return harness.listeners.get('agent/pre-step')({
    agent: harness.agent,
    messages: [],
    turn: 1,
    step: 1,
    signal: new AbortController().signal,
  }, async () => decision);
}

test('exact DSH and MCP names are allowed while undeclared tools are denied', async () => {
  const harness = toolScopeHarness({
    metadata: { 'allowed-tools': 'mcp__fixture__transform mcp__fixture__echo' },
  });
  await preStep(harness);

  assert.deepEqual(harness.restrictions, [{ allow: ['mcp__fixture__transform', 'mcp__fixture__echo'] }]);
  assert.equal(harness.guards.length, 1);
  const guard = harness.guards[0];
  assert.equal(guard({ name: 'mcp__fixture__transform' }), undefined);
  assert.equal(guard({ name: 'mcp__fixture__echo' }), undefined);
  assert.equal(guard({ name: 'skill' }), undefined);
  assert.match(guard({ name: 'extra_tool' }), /only its declared tools/);
});

test('an undeclared allowed-tools field leaves an ordinary Skill untouched', async () => {
  const harness = toolScopeHarness({ metadata: {} });
  await preStep(harness);

  assert.deepEqual(harness.restrictions, []);
  assert.deepEqual(harness.guards, []);
  assert.deepEqual(harness.disposed, []);
});

test('explicit empty or malformed declarations deny every tool except the read-only Skill tool', async () => {
  for (const metadata of [
    { 'allowed-tools': '' },
    { 'allowed-tools': [] },
    { 'allowed-tools': ['mcp__fixture__transform', 'bad name'] },
    { 'allowed-tools': 42 },
  ]) {
    const harness = toolScopeHarness({ metadata });
    await preStep(harness);

    assert.deepEqual(harness.restrictions, []);
    assert.equal(harness.guards.length, 1);
    const guard = harness.guards[0];
    assert.equal(guard({ name: 'skill' }), undefined);
    assert.match(guard({ name: 'mcp__fixture__transform' }), /validation failed/);
  }
});

test('an undeclared extra tool remains denied by the declared Skill scope', async () => {
  const harness = toolScopeHarness({ metadata: { 'allowed-tools': 'mcp__fixture__transform' } });
  await preStep(harness);

  const guard = harness.guards[0];
  assert.equal(guard({ name: 'mcp__fixture__transform' }), undefined);
  assert.match(guard({ name: 'mcp__fixture__echo' }), /only its declared tools/);
});

test('a later pre-step in the same turn re-resolves and preserves the Skill scope', async () => {
  let reads = 0;
  const harness = toolScopeHarness({
    registry: {
      async get(name) {
        reads += 1;
        return {
          ...summary(name),
          content: 'instructions',
          metadata: { 'allowed-tools': reads === 1 ? 'mcp__fixture__transform' : 'mcp__fixture__echo' },
        };
      },
    },
  });

  await preStep(harness, enter('resize'));
  await preStep(harness, enter('resize', []));

  assert.equal(reads, 2);
  assert.deepEqual(harness.disposed, ['guard', 'restriction']);
  assert.equal(harness.guards.length, 2);
  assert.match(harness.guards[1]({ name: 'mcp__fixture__transform' }), /only its declared tools/);
  assert.equal(harness.guards[1]({ name: 'mcp__fixture__echo' }), undefined);
});

test('changed Skill metadata revokes an old capability before installing the new one', async () => {
  let metadata = { 'allowed-tools': 'mcp__fixture__transform' };
  const harness = toolScopeHarness({
    registry: {
      async get(name) {
        return { ...summary(name), content: 'instructions', metadata };
      },
    },
  });

  await preStep(harness);
  const oldGuard = harness.guards[0];
  assert.equal(oldGuard({ name: 'mcp__fixture__transform' }), undefined);
  metadata = { 'allowed-tools': 'mcp__fixture__echo' };
  await preStep(harness);

  assert.equal(harness.guards[1]({ name: 'mcp__fixture__echo' }), undefined);
  assert.match(harness.guards[1]({ name: 'mcp__fixture__transform' }), /only its declared tools/);
  assert.deepEqual(harness.disposed, ['guard', 'restriction']);
});

test('multiple Skills in one step deny all domain tools', async () => {
  const harness = toolScopeHarness({
    registry: {
      async get() {
        throw new Error('ambiguous Skills must not be resolved');
      },
    },
  });
  await preStep(harness, enter('resize', [
    { source: { kind: 'skill-invocation', form: 'instructions', name: 'resize' } },
    { source: { kind: 'skill-invocation', form: 'instructions', name: 'review' } },
  ]));

  assert.deepEqual(harness.restrictions, []);
  assert.equal(harness.guards.length, 1);
  assert.equal(harness.guards[0]({ name: 'skill' }), undefined);
  assert.match(harness.guards[0]({ name: 'mcp__fixture__transform' }), /validation failed/);
});

test('an asynchronous stale lookup cannot install a guard after a later pre-step wins', async () => {
  const first = deferred();
  const second = deferred();
  let reads = 0;
  const harness = toolScopeHarness({
    registry: {
      async get(name) {
        reads += 1;
        return (reads === 1 ? first.promise : second.promise).then(metadata => ({
          ...summary(name),
          content: 'instructions',
          metadata,
        }));
      },
    },
  });

  const firstStep = preStep(harness);
  await Promise.resolve();
  const secondStep = preStep(harness);
  second.resolve({ 'allowed-tools': 'mcp__fixture__echo' });
  await secondStep;
  first.resolve({ 'allowed-tools': 'mcp__fixture__transform' });
  await firstStep;

  assert.equal(reads, 2);
  assert.equal(harness.guards.length, 1);
  assert.equal(harness.guards[0]({ name: 'mcp__fixture__echo' }), undefined);
  assert.match(harness.guards[0]({ name: 'mcp__fixture__transform' }), /only its declared tools/);
});

test('a turn ending during asynchronous Skill lookup cannot install a stale guard', async () => {
  const lookup = deferred();
  const harness = toolScopeHarness({
    registry: {
      async get(name) {
        return lookup.promise.then(metadata => ({ ...summary(name), content: 'instructions', metadata }));
      },
    },
  });

  const step = preStep(harness);
  await Promise.resolve();
  harness.listeners.get('session/event')(harness.session, { type: 'turn/end' });
  lookup.resolve({ 'allowed-tools': 'mcp__fixture__transform' });
  await step;

  assert.deepEqual(harness.guards, []);
  assert.deepEqual(harness.restrictions, []);
});

test('turn, agent, and plugin lifecycle disposal releases every installed scope', async () => {
  const harness = toolScopeHarness();
  await preStep(harness);
  harness.listeners.get('session/event')(harness.session, { type: 'turn/end' });
  assert.deepEqual(harness.disposed, ['guard', 'restriction']);

  await preStep(harness);
  harness.listeners.get('agent/disposed')({ agent: harness.agent });
  assert.deepEqual(harness.disposed, ['guard', 'restriction', 'guard', 'restriction']);

  await preStep(harness);
  harness.dispose();
  assert.deepEqual(harness.disposed, [
    'guard', 'restriction', 'guard', 'restriction',
    'listener:agent/pre-step', 'listener:session/event', 'listener:agent/disposed',
    'guard', 'restriction',
  ]);
});
