# Social Media Operator Evidence

This case tests whether one readable Skill can guide an Agent through existing
social-platform tools without adding a Workflow-to-Skill runtime. The observed
scope is Xiaohongshu research, official Zhihu research capability discovery,
and Xiaohongshu/Zhihu publishing preparation.

Status: **partial end to end**. Read-only Xiaohongshu access and the isolated
local publishing dry-runs succeeded. The current environment still stops at
the publishing credential/upload gate, and no live post was attempted or
created.

The original 2026-08-29 Xiaohongshu browser session resolved to a non-guest
account, but that proved read access only. A continuation check on 2026-09-03
found that the same `redbook` session had expired and the official browser page
showed the login prompt. The installed `redbook` 0.8.1 documentation marks
its private-API `post` command as limited and frequently captcha-triggering, so
this evidence does not equate `whoami` success with a low-risk publication
path. A first live test should prefer a bound `yxer` account or the official
creator page and submit exactly once after reviewing the final content.

## Continuation Check

On 2026-09-03 (Asia/Shanghai), the active model credential from local CC Switch
was used only in an isolated DSH probe; the probe returned `PROBE_OK`. The
small-redbook readiness check then stopped safely because:

- `redbook whoami --json` returned `Session expired`;
- Chrome's official Xiaohongshu page displayed the login prompt;
- `yxer doctor` returned missing API configuration, so no remote account or
  upload check was possible;
- the matching local XHS Schema still validated a labelled fixture, and
  `yxer publish --dry-run` returned `dryRun: true`, `schemaChecked: true`, and
  `remoteChecks: false`.

No login, upload, publication, like, comment, or account mutation was performed
in this continuation check. The next live-test prerequisite is for the user to
log in to Xiaohongshu in the permitted browser session and configure the
publishing adapter through its official credential path; credentials must not
be sent in chat or committed to this repository.

## Observed Run

Observed on 2026-08-29 (Asia/Shanghai) on macOS arm64 with:

- `@lucasygu/redbook` 0.8.1;
- `yxer` 3.2.12 from the official `yixiaoer888/yixiaoer-skill` release;
- the matching official v3.2.12 `schemas/` directory;
- an existing Xiaohongshu browser login.

The downloaded `yxer` archive matched the release SHA-256 checksum. Its bare
binary archive did not include platform Schemas, so the same-version official
repository supplied those static resources for this isolated test.

| Stage | Observed result | What it proves | What it does not prove |
| --- | --- | --- | --- |
| `redbook whoami --json` (2026-08-29) | Existing login recognized; 2026-09-03 continuation returned `Session expired` | The machine previously bound a real Xiaohongshu read session | Current session validity, long-term stability, or production support |
| `redbook search "AI 工作流" --sort latest --json` | Populated result page with `has_more: true` | Real public Xiaohongshu search and engagement fields were returned | Completeness, ranking quality, or official API support |
| `redbook read <result URL> --json` | One selected note's body, tags, images, and metrics returned | Search results can be followed into detail reads | Permission to reuse the creator's content |
| `redbook topics "AI工作流" --json` | Official topic candidates and public counters returned | Real topic discovery works in the current login session | Future counter stability or permission to attach a topic |
| `yxer doctor` | Stopped with `Missing apiKey configuration` | Remote publishing prerequisites are detected | Account binding, upload, or remote publication |
| `yxer schema list` | 64 platform/type Schemas found | Matching local platform contracts were discoverable | That every platform contract works remotely |
| Official Zhihu docs | `developer.zhihu.com` exposes Zhihu search, user-content, Skill, API, and MCP documentation | A supported read/search integration path exists | This run did not call it because no Access Secret was configured |
| `command -v zhihu-cli` / `command -v zhihu` | Neither command was present in the current shell | The official Zhihu CLI was not locally installed in this Harness | Installation, credential verification, and a live query |
| Generated-template validation | Invalid image format and too-short Zhihu title were rejected | Bad payloads fail with field-level feedback | Remote platform acceptance |
| Filled local `validate` | Xiaohongshu image-text and Zhihu article both returned `valid: true` | Local structure and request normalization work | Real account IDs or uploaded-resource existence |
| `publish --dry-run` | Both returned `ok: true`, `dryRun: true`, `schemaChecked: true`, `remoteChecks: false` | The final request can be assembled without publishing | Authentication, upload, account ownership, task completion, or a visible post |

The optional DSH Client reference at
[`../../plugins/actweave-social-page`](../../plugins/actweave-social-page/README.md)
turns account checks and a one-post preview into ordinary Skill messages. It
links to the real official login pages instead of embedding them, collects no
credentials, and stops before every upload or publication.

The selected detail-read snapshot was the public note “练完这15个项目，你的
workbuddy就很牛了！”. At observation time the returned counters were 1,221
likes, 1,809 collections, 88 comments, and 277 shares. These counters are
time-dependent evidence of a real response, not fixed benchmark claims.

No cookies, API keys, private account identifiers, search tokens, or raw tool
outputs are stored in this repository.

## Zhihu Read Path Confirmed In Official Documentation

On 2026-08-31, the official [Zhihu Data Open Platform](https://developer.zhihu.com/)
and its [documentation center](https://developer.zhihu.com/docs?key=authorization)
were read directly. The documented read paths are:

- [Zhihu Search API](https://developer.zhihu.com/api/v1/content/zhihu_search),
  which returns questions, answers, or articles with title, type, ID, summary,
  original URL, author, comment count, vote count, update time, authority level,
  and ranking score.
- The official [Zhihu Search Skill](https://developer.zhihu.com/download/zhihu_search_skills.zip).
- The official [Zhihu Search MCP](https://developer.zhihu.com/api/mcp/zhihu_search/v1/sse),
  whose documented tool is `zhihu_search`.
- [User Content API](https://developer.zhihu.com/api/v1/user/contents), which
  returns a user's public creations and engagement fields. The docs distinguish
  the caller's own data from another user's OAuth-authorized data; the official
  CLI is documented as an own-account path.

The official [Zhihu CLI documentation](https://developer.zhihu.com/docs?key=zhihu_cli)
describes search, full-web search, hot list, own creations, follows, favorites,
and knowledge-base operations. The current documentation's CLI capability list
does not list a public publishing operation. Therefore this evidence uses the
official Zhihu route for reading and the existing `yxer` route for publishing;
it does not treat either tool as a substitute for the other.

## Ready For Account Testing

The next test needs one authorized test account/session on each platform, an
official Zhihu read binding with an Access Secret stored outside the repository,
an active `yxer` account binding for each publishing target, and a small
non-sensitive image plus a Zhihu cover resource. The first pass should remain
side-effect free: binding check, account lookup, Schema/template generation,
`validate`, and `publish --dry-run`. Only after the final copy, media, target
accounts, and expected read-back are reviewed should one real publication be
submitted. Success means a remote receipt and a visible post/read-back, not a
successful local dry-run.

## Commands Exercised

```text
redbook whoami --json
redbook search "AI 工作流" --sort latest --json
redbook read "<selected search result URL>" --json
redbook topics "AI工作流" --json

yxer doctor
yxer schema list
yxer schema fields xhs imageText
yxer schema fields zhihu article
yxer publish init xhs imageText --output <payload.json>
yxer publish init zhihu article --output <payload.json>
yxer validate xhs imageText <payload.json>
yxer validate zhihu article <payload.json>
yxer publish imageText xhs <payload.json> --dry-run
yxer publish article zhihu <payload.json> --dry-run
```

## Boundary Revealed By The Test

The strongest finding is the distinction between structural and business
success, plus the separation between read and publish bindings. `yxer
publish --dry-run` accepted deliberately labelled placeholder account and
resource values because remote checks were disabled. A workflow Skill therefore
must inspect `remoteChecks` and must not describe dry-run as account verification
or publication. Zhihu's official read path is documented, but it remains
unexecuted in this Harness because the official CLI was absent and no Access
Secret was configured.

To complete a live proof, the target Harness still needs an official Zhihu
Skill/CLI/API/MCP binding with an Access Secret for read operations, plus a
configured `yxer` API key, real bound Xiaohongshu or Zhihu account, uploaded
media receipts, approved final content, a remote publish receipt, and a visible
post read-back. The official Zhihu read capability is now confirmed as an
available integration path, but its execution and all live publishing remain
unverified in this Harness.

[`SKILL.md`](SKILL.md) captures the reusable method and these stop conditions.
The external CLIs remain the executors; this repository adds no social-media
runtime, account store, scheduler, or workflow engine.
