# Reference Evidence

This directory contains the DSH adapter, RSS Prompt Surface example, acceptance
fixtures, implementation notes, npm workspace, and legal notices that support
the three root product artifacts.

It is not a fourth Workflow-to-Skill product component. The packages are
private reference fixtures and are not public npm release units.

The first observed full authoring-and-reuse loop is recorded in
[`evidence/dsh-model-signal-radar`](evidence/dsh-model-signal-radar/README.md).
It includes the generated Skill, exact requests, terminal outputs, run facts,
and screenshots rendered from the persisted DSH session.

A cross-domain social-platform trial is recorded in
[`evidence/social-media-operator`](evidence/social-media-operator/README.md).
It verifies real Xiaohongshu search and detail reading plus local Xiaohongshu
and Zhihu payload validation and dry-runs. It also records the remaining remote
account, upload, live-publish, and read-back gaps without treating dry-run as a
published result.

The optional [`actweave-social-page`](plugins/actweave-social-page/README.md)
DSH Client example provides a Skill-driven social operations workbench. It
opens real platform login pages, proposes account rotation without switching
credentials, applies a session-level persona, and prepares one reviewed
test-post request. It collects no secrets and stops before live upload or
publication.

![Task view of the reference social operations workbench](media/social-workbench-task.png)

Observed in a real DSH Web session with the plugin loaded. The rail, platform
card, account pool, role select, live preview, and generic Skill dispatcher are
the shipped interface; the draft and the account nicknames are sample input
typed in the page, not Agent output, and no live account read or publication is
shown. The other two captures are in the
[plugin README](plugins/actweave-social-page/README.md#what-it-looks-like).

A side-effect-free content workflow is recorded in
[`evidence/project-launch-content-pack`](evidence/project-launch-content-pack/README.md).
A fresh DSH session discovered the Skill from its native project root, read
only three approved files, and returned bounded Xiaohongshu and Zhihu drafts.
A second fresh session verified the missing-source stop behavior without
creating promotional content or operating either platform.

Run deterministic checks here:

```sh
npm install
npm test
npm run security:audit
```

The configured DSH gates are:

```sh
npm run acceptance:clean-profile
npm run acceptance:native-mcp
npm run acceptance:native-mcp-negative
npm run acceptance:page-browser
```

Set `ACTWEAVE_DSH_COMMAND` to an existing DSH executable to avoid the default
`npx @deepseek-ai/dsh@0.1.0-rc.8` download in the first three automated
paths. The browser gate remains interactive.

See [the adapter README](plugins/actweave/README.md) for the exact claims. The
broader historical design notes are not part of the product repository.
