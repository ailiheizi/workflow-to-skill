# Workflow-to-Skill DSH Reference Adapter

The root [README](../../../README.md) defines the cross-Harness product. This
package is a Host-only DSH reference adapter, examples, and acceptance evidence.

```text
workflow-to-skill
-> reviewable SKILL.md with an exact typed tool
-> ordinary /skill-name message
-> DSH Skill + Agent
-> DSH ToolRuntime invokes the existing tool
-> DSH Session returns progress and results
-> optional independent Page reads that Session
```

The Skill says how. The existing tool does the work. DSH runs and presents it.

## Product Boundary

DSH owns the shell, Client lifecycle, Page slots, Skill loading, Agent,
Session, ToolRuntime, MCP client, permissions, cancellation, jobs, and result
presentation.

This adapter contains only:

- the small DSH rc.8 Host guard that enforces exact
  `metadata.allowed-tools` names for the active turn;
- focused package and composition tests.

The repository's canonical authoring Skills live at
[`workflow-to-skill`](../../../workflow-to-skill/SKILL.md) and
[`workflow-to-skill-with-surface`](../../../workflow-to-skill-with-surface/SKILL.md).
They are not owned by or packaged inside this adapter.

The plugin does not contain a CLI executor, shell runner, command registry,
MCP client, workflow engine, DAG, queue, Page runtime, or engine-specific
adapter. A CLI, MCP, HTTP API, Dify, n8n, or ComfyUI workflow remains owned by
DSH or its external integration and is used only through the typed tool already
available to DSH.

## Create A Workflow

Use `workflow-to-skill` with a concrete capability and a safe test case. It
inspects the available DSH tool surface, records the exact tool name and
argument contract, and writes one reviewable `SKILL.md`.

The Skill must include:

- goal and user inputs;
- exact typed tool calls and ordered steps;
- output checks and success conditions;
- failure, cancellation, and recovery behavior;
- external tool, credential, and result dependencies.

When no usable typed tool exists, the Skill reports the integration gap. It
does not add shell execution or a private adapter.

## Reuse A Workflow

Install the Skill and its named tool in a DSH profile, then use normal Chat:

```text
/skill-name
Describe the input and desired result.
```

DSH loads the Skill, the Agent follows its method, and the declared tool runs
through DSH's native path. Tool results, progress, errors, cancellation, and
final output remain in the normal DSH Session.

## Optional DSH Prompt Surface

Chat is always sufficient. The RSS Page is one Harness-native implementation
of the portable Prompt Surface idea when repeated structured input or a
dedicated result view is useful.

The independent Page pattern is:

```text
Page form
-> SessionFace.prompt('/skill-name ...')
-> the same DSH Session
-> the Page reads the same Session snapshot
```

The Page may validate and format input. It must not call MCP, CLI, HTTP, or a
private Actweave API, grant authority, or create another event protocol. The
example package is at `../actweave-rss-page/` and is not part of this Host
runtime.

## Related Skills

- `rss-digest`: an example Skill that names external Weft MCP tools. The
  external service, MCP configuration, and credentials are not bundled here.

## Current Evidence

The focused verification covers:

- Host-only package shape and rc.8 Skill guard behavior;
- exact allowlists, malformed declarations, multiple Skills, races, and
  lifecycle cleanup;
- clean-profile install, disable, remove, and Web boot behavior;
- DSH's native MCP client calling a real stdio fixture tool;
- a negative MCP startup path with a missing external transport;
- an independent Page sending the ordinary Skill message and reading Session
  history without a direct tool call;
- security checks for the absence of an Actweave execution layer.

Dify, n8n, ComfyUI, and arbitrary external CLIs are integration targets, not
built-in Actweave features. Each needs its own existing typed tool and real
success, failure, cancellation, progress, and result evidence before support
is claimed.

## Verification

From the `reference/` directory:

```sh
npm run check
npm run build
npm test
npm run security:audit
npm run acceptance:clean-profile
npm run acceptance:native-mcp
npm run acceptance:native-mcp-negative
npm run acceptance:page-browser
```

The Host package contains no Client entry. The separate RSS Client example is
built with `npm run build:rss-client` and tested through its own package.

`acceptance:page-browser` is the real browser gate for the optional Page. It
starts an isolated DSH Web profile with both packages, prints a local URL, and
waits for the Page form submission. Open the URL, select `RSS Digest`, submit
the form, then press Enter in the acceptance terminal. The gate then verifies
the ordinary `/rss-digest` message and the same Session's typed-tool result.
