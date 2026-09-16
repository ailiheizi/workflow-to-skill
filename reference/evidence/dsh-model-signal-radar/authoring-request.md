# Authoring Request

```text
/workflow-to-skill

Create a reusable `dsh-model-signal-radar` Skill for this exact target:

- Harness: the currently running DSH 0.1.0-rc.7 headless profile.
- Goal: find a recent AI model or developer-platform change from official
  sources, distinguish announcement from actual availability, and return one
  concise evidence-backed signal.
- Runtime inputs: focus, time window, maximum signals, and source policy.
- Defaults: previous 14 days, maximum 3 signals, official-only sources, strict
  evidence.
- Scope: read-only. Never subscribe, publish, modify accounts, or perform a
  recommended follow-up action.
- Existing capabilities: use only tool bindings actually visible in this DSH
  run. A web-search tool or the existing `curl` CLI through DSH's shell tool is
  acceptable only if it really exists. Record exact DSH bindings in the Skill.
  Do not create a crawler, parser, CLI, MCP server, or runtime.
- Recommended method: collect a bounded candidate set from official sources,
  verify the original source, normalize announced versus product/API/weights
  availability, deduplicate, rank by relevance, and separate facts from
  inference.
- Recovery: retry a transient source failure at most once; report partial
  source coverage; if every source fails, report failure rather than "no
  changes"; never relax the evidence bar merely to fill the requested count.
- Success: every included signal has an observed official URL, date,
  availability state, verified/unverified boundary, and a truthful source
  health summary.
- Runtime posture: adaptive completion for harmless choices; stop for missing
  tools, unavailable credentials, material ambiguity, or unverifiable success.
- Output: readable Markdown in the user's language.

All material authoring choices above are confirmed. You are authorized to:

1. inspect the current DSH tool bindings;
2. make bounded read-only HTTP requests to official public sources for one
   representative test;
3. write only `.agents/skills/dsh-model-signal-radar/SKILL.md` in this
   workspace;
4. validate that candidate and report the exact discovery and test evidence.

Do not write any other project file. If an exact required capability is not
available, stop and report the integration gap instead of inventing it.
```
