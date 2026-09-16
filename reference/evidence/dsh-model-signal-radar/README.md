# DSH Model Signal Radar: Observed End-To-End Case

This case records one real authoring-and-reuse loop in DSH. It is evidence for
one target Harness, not a claim that the Skill executes unchanged everywhere.

## Observed Chain

```text
/workflow-to-skill in DSH
-> candidate SKILL.md written and structurally validated
-> recovery session confirms the candidate and DSH discovery
-> fresh DSH session invokes /dsh-model-signal-radar
-> DSH uses web_search and bash/curl
-> official DeepMind URL returns HTTP 200
-> result reports verified and unverified boundaries
```

The generated Skill is [`SKILL.md`](SKILL.md), SHA-256
`0c64b28aa29849f6926ccdad1cde4d7dc269fc47331a7709d2c713a3578bb4a2`.
The checked-in file is byte-for-byte identical to the candidate discovered by
DSH in the temporary case workspace.

## Runs

| Phase | DSH session | Terminal evidence | Observed tool calls |
| --- | --- | --- | --- |
| Initial authoring | `3818f72f-d33d-488a-acdd-5756d4c431e4` | Local five-minute caller timeout; no `turn/end` | 35 `bash`, 3 `web_search`, 2 `read`, 2 `todo_write`, 1 `write` |
| Authoring recovery | `37757fd2-8b08-44c6-a0f9-d218ab208f72` | `turn/end`: `completed` | 1 `read`, 1 `glob`, 1 `bash`; no network request |
| Fresh reuse | `ff145d85-b7a5-46b7-98bb-9d8100a9dbdc` | `turn/end`: `completed` | 4 `web_search`, 9 `bash` |

The initial authoring run explicitly invoked `/workflow-to-skill`, wrote the
candidate once, and completed internal structural validation before the local
caller timed out. A second explicit `/workflow-to-skill` recovery session read
the existing candidate, confirmed its exact bindings, boundaries, structure,
credential hygiene, and DSH discovery, then completed without editing it. This
is a recovered authoring success, not a falsely labeled one-shot terminal run.

The reuse run started in a fresh session whose Skill catalog contained both
authoring and generated Skills. Invocation event sequence `10` loaded
`dsh-model-signal-radar`. The official DeepMind page returned HTTP 200 with
148,908 bytes and an observed publication time of
`2026-08-12T15:00:00+00:00`. The final result did not upgrade the page's Pixel
11 availability statement, vendor benchmark, API access, or weight access into
independently verified facts.

## Artifacts

- [`authoring-request.md`](authoring-request.md): original authoring request.
- [`authoring-recovery-request.md`](authoring-recovery-request.md): bounded
  recovery and validation request.
- [`authoring-recovery-output.md`](authoring-recovery-output.md): final report
  from the completed recovery session.
- [`reuse-request.md`](reuse-request.md): fresh-session invocation.
- [`success-output.md`](success-output.md): final text from the completed reuse
  session; reasoning chunks are excluded.
- [`run-summary.json`](run-summary.json): machine-readable observed run facts.
- [`../../media/dsh-invocation.jpg`](../../media/dsh-invocation.jpg) and
  [`../../media/dsh-result.jpg`](../../media/dsh-result.jpg): screenshots of
  the persisted reuse session rendered by DSH Web.

## Environment And Limits

- Observed at `2026-08-25T17:55:50Z` through `2026-08-25T18:11:29Z`.
- Global DSH CLI: `0.1.0-rc.7`.
- Model: `DeepSeek-V4-Flash` through an existing named credential binding.
- The credential was supplied only to DSH's child-process environment. It is
  not stored in this directory or included in any evidence artifact.
- DSH's npm latest was `0.1.1-rc.2` when checked, but latest-version execution
  was not verified because that separate install attempt stalled and was
  stopped. This case therefore claims only `0.1.0-rc.7`.
- The source page and model-release claims can change after observation. The
  files record what this run observed, not a permanent statement about Google
  products.

DSH and DeepSeek names identify the observed Harness and model. They do not
imply sponsorship, endorsement, or affiliation.
