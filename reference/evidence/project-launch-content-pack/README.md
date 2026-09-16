# Project Launch Content Pack: DSH Evidence

This directory records a side-effect-free Workflow-to-Skill reuse case. A
fresh DeepSeek Harness headless session loaded `project-launch-content-pack`
from its native project Skill root, read three approved repository files, and
returned separate Xiaohongshu and Zhihu drafts with claim boundaries and a
manual publication checklist.

The candidate Skill is [`SKILL.md`](SKILL.md). The exact successful invocation
and result are in [`reuse-request.md`](reuse-request.md) and
[`success-output.md`](success-output.md). The representative missing-source
case is in [`failure-request.md`](failure-request.md) and
[`failure-output.md`](failure-output.md). Machine-readable run facts are in
[`run-summary.json`](run-summary.json).

## Observed Loop

```text
install candidate at .dsh/skills/project-launch-content-pack/SKILL.md
-> start a fresh DSH headless session
-> explicitly invoke /project-launch-content-pack
-> read only the three named source files
-> return a bounded, source-grounded content package
-> start another fresh session with a missing source
-> stop with failed: source unavailable and no promotional draft
```

The final successful run used DSH `0.1.1-rc.2` and an OpenAI
Responses-compatible model route configured from the user's local CC Switch.
The credential was passed only through the process environment. This evidence
does not contain the credential or the private endpoint.

## Observed Results

| Check | Observation |
| --- | --- |
| Skill discovery | The persisted request history contains the candidate's `Default Output Bounds` guidance. |
| Source access | Three direct `read` calls for the three approved files; no web or shell calls. |
| Success terminal state | Process exit `0`; persisted `turn/end` reason `completed`; zero model retries. |
| Success duration | 110,749 ms from persisted session timestamps. |
| Output behavior | Five title options per platform, seven Xiaohongshu cards, distinct platform drafts, source-reported claims separated from facts verified in the run. |
| Failure behavior | Missing source returned `failed: source unavailable`, omitted promotional drafts, and completed with zero model retries. |
| Side effects | No login, upload, publication, image generation, web request, shell command, or new media file. |

An earlier trial copied the candidate to the workspace root. It is not counted
as Skill evidence: DSH discovers project Skills under `.dsh/skills` or
`.agents/skills`, so that root-level copy left the slash text as an ordinary
prompt. Persisted tool history exposed the mistake, and the final two runs used
the native discovery path.

## Limits

- Draft generation was verified; publication and audience response were not.
- The content still requires human editorial review before manual posting.
- This case proves the observed DSH binding, not equivalent behavior in every
  Harness or model provider.
- The CC Switch route is an external test dependency, not part of this project
  or the portable Skill.

