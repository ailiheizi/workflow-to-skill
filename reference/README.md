# Reference Evidence

This directory contains the DSH adapter, RSS Prompt Surface example, acceptance
fixtures, implementation notes, npm workspace, and legal notices that support
the three root product artifacts.

It is not a fourth Workflow-to-Skill product component. The packages are
private reference fixtures and are not public npm release units.

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
