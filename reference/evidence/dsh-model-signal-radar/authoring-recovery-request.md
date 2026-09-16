# Authoring Recovery Request

```text
/workflow-to-skill

Recover the existing `dsh-model-signal-radar` candidate after the previous
headless authoring process timed out before returning its final report.

The original material decisions remain confirmed. Inspect the existing file at
`.agents/skills/dsh-model-signal-radar/SKILL.md`; do not restart authoring and
do not repeat the public-source test. Confirm that the candidate:

- is one valid, readable Skill with discriminating frontmatter;
- names only exact tool bindings visible in this DSH headless run;
- preserves the read-only scope, bounded recovery, stop conditions, and real
  success evidence from the original request;
- contains no credential literal or invented runtime;
- is discoverable as `dsh-model-signal-radar` from this workspace.

Fix the candidate only if one of those checks fails. Write no other project
file. Finish with a concise authoring report that separates observed evidence
from untested claims. Use no more than six tool calls and make no network
request during this recovery.
```
