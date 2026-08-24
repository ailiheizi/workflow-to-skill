# Workflow-to-Skill Installation Guide For AI Agents

Follow this guide when a user asks you to install Workflow-to-Skill. Complete
the installation, verify discovery in the user's actual Harness, and teach the
user how to create the first workflow. Do not stop after downloading files.

Source repository:

```text
https://github.com/ailiheizi/workflow-to-skill
```

## What To Install

Install exactly these two Agent Skills:

```text
workflow-to-skill/
workflow-to-skill-with-surface/
```

Do not install `reference/` or `AGENTS.md`. Do not create a Workflow-to-Skill
runtime, CLI, MCP client, DAG engine, registry, or installer.

## Installation

1. Identify the current Harness and its native Agent Skill locations.
2. Use the user's requested scope. If none was requested, prefer the Harness's
   personal or user scope so the two authoring Skills can be reused across
   projects. Use repository scope when the user asks for project-local use.
3. If the source repository is not already available locally, clone it into a
   newly created temporary directory:

   ```sh
   wts_temp_dir="$(mktemp -d)"
   git clone --depth 1 \
     https://github.com/ailiheizi/workflow-to-skill.git \
     "$wts_temp_dir/workflow-to-skill"
   ```

4. Resolve the source and destination directories to exact absolute paths.
5. Copy both complete Skill directories into the Harness's native Skill
   location. Do not copy the whole repository.
6. If a same-name destination already exists, compare it with the source. If
   it is identical, leave it unchanged. If it differs, show the material
   difference and obtain the user's approval before replacing or merging it.
7. Do not install optional tools, MCP servers, credentials, or workflow systems
   merely because README examples mention them.

For Codex, the current official repository and user locations are respectively
`.agents/skills` and the user's `.agents/skills` directory. Codex detects Skill
changes automatically; restart only if the installed Skills do not appear.
See the official [Build skills documentation](https://developers.openai.com/codex/build-skills).
For any other Harness, use its documented native equivalent rather than a
Codex path.

## Verify The Installation

Do not treat files on disk as sufficient evidence.

1. Confirm that both installed directories contain readable `SKILL.md` files.
2. Confirm their frontmatter names are exactly:

   ```text
   workflow-to-skill
   workflow-to-skill-with-surface
   ```

3. Use the Harness's Skill picker, Skill list, discovery output, or equivalent
   native surface to confirm that both names are actually discovered.
4. Explicitly invoke each Skill with a harmless explanation-only request. In
   Codex, use `$workflow-to-skill` and
   `$workflow-to-skill-with-surface`. Do not create files during this check.
5. If discovery fails, report the exact installed path and the Harness behavior
   observed. Fix the native binding or reload problem; do not claim success.

## Teach The User Which Skill To Use

```text
An ordinary Chat or Harness request is enough
-> workflow-to-skill

The user wants repeated structured controls or a dedicated result view
-> workflow-to-skill-with-surface

A webpage, report, image, spreadsheet, or video is only the workflow output
-> workflow-to-skill
```

The Surface variant still creates an ordinary reusable Skill. Its optional
interface maps controls to the same ordinary Skill message and presents the
same Harness result; it does not execute tools directly.

## Help Create The First Workflow

Ask the user for one real repeated task. Then use exactly one of the two
authoring Skills to:

1. inspect the target Harness's real CLI, MCP, API, or external workflow
   capabilities;
2. propose the goal, inputs, method, material decisions, recovery behavior,
   and real success evidence;
3. distinguish confirmed choices, safe proposed defaults, and unresolved
   material decisions;
4. obtain review where a decision changes scope, cost, authority, side effects,
   or success criteria;
5. write one readable workflow `SKILL.md`;
6. install it using the Harness's native Skill location and verify discovery;
7. invoke it through the Harness's ordinary entrypoint;
8. verify the promised external result or report truthful failure or partial
   completion.

Never confuse a tool call being accepted, a request being submitted, external
work completing, and the final result being verified.

## Finish With A Reuse Prompt

Tell the user:

- where both authoring Skills were installed;
- how their discovery was verified;
- which authoring Skill should be used for the user's first workflow and why;
- which real capabilities are available and which are missing;
- the exact next prompt to create the workflow;
- after creation, the exact ordinary prompt that reuses the generated Skill.

The portable part is the workflow method, decisions, recovery guidance, and
success evidence. Exact tools, credentials, permissions, task lifecycle, and
result conventions remain bound to the target Harness and external systems.
