---
name: rss-digest
description: Collect RSS or Atom sources and produce a traceable intelligence digest through the configured Weft workflow.
metadata:
  version: 1.0.0
  allowed-tools: mcp__weft__run_published_intelligence-workflow_2f1ab77951dc mcp__weft__get_work_snapshot
---

Use the configured Weft `Daily intelligence workflow` Publication for this
request. The user may provide one or more HTTP(S) RSS or Atom URLs, a focus
topic, and a maximum highlight count. Pass those values in the Publication's
`input` object, preserving the source URLs exactly. Do not fetch feeds with a
different tool, invent feed entries, or recreate the workflow locally.

After starting the Publication, use `mcp__weft__get_work_snapshot` with the
returned `runId` until the Run reaches `succeeded` or `failed`, the user or
Harness cancels, 30 snapshot calls have been made, or five minutes have
elapsed. Keep polling with the returned `eventCursor` when available, and do
not poll more often than the tool's suggested interval or every two seconds.
Before each additional call, honor any observed cancellation. On a bound,
report the Run as still running or unverified with its `runId`; do not submit a
replacement Run. Report the actual Run status, generated Artifact names, and
source diagnostics. A successful answer must preserve each item's source feed,
publication time when present, and original article URL; link to the Artifacts
rather than copying an unverified digest into the response.

If one feed fails, continue when the Weft Run succeeds and clearly identify the
failed URL and diagnostic. If the Run fails or the snapshot cannot be read,
stop and report the real failure and `runId`; do not retry blindly or claim a
digest was produced. A new run may be requested only after the user confirms
the changed input or recovery action.

If the initial submission outcome is uncertain, do not submit again. Reconcile
only with a returned `runId`, operation identifier, or external receipt. When
none is available, report the outcome as unknown and stop.
