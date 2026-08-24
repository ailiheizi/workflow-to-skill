# RSS Digest DSH Client Example

This is a separate, installable DSH Client plugin for the standard
`rss-digest` Skill. It is intentionally outside the Actweave Host package, so
installing or removing the page never changes the Host-only product boundary.

The package includes a built lazy-CJS browser bundle because rc.8 requires the
`exports["./client"]` entry to be ready for DSH's `client-modules` loader. Run
`npm run build` after editing `src/client.js` before packing a new version.

The page registers one additive `conversation.view` tab. Its controls only
construct the ordinary message below and call the public rc.8
`SessionFace.prompt()` method:

```text
/rss-digest
Create a traceable digest for the supplied RSS and Atom URLs.
Inputs (JSON):
{
  "sources": ["https://example.com/feed.xml"],
  "focus": "latest models",
  "maxHighlights": 8,
  "includeActions": false
}
```

The button never invokes MCP, Weft, a CLI, or a private Actweave API. DSH
discovers the Skill, Actweave applies the Host-side `allowed-tools` guard, and
the existing DSH MCP client calls Weft. The same Session history and feedback
are visible in Chat and in this Client surface.

This example uses the current DSH rc.8 contracts:

- `SessionFace.prompt(content, 'queue')` for ordinary message delivery;
- `conversation.view` as an additive session-scoped tab;
- `ctx.slots.inject()` and `ctx.slots.register()` for lifecycle-safe hot swap;
- `dsh.client` package metadata for the web Client entry.

The example does not replace `conversation`, `root`, or any DSH shell slot.
