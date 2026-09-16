# Model Signal Radar Evidence

This reference case records an observed reuse run of a generated workflow Skill.
It supports the repository's claim that a readable Skill can guide an Agent to
reuse existing RSS and HTTP capabilities and return an evidence-backed result.

Observed on 2026-08-25 with the Weft reference Harness:

- Run: `run_048c7564-ff8c-473b-8d3d-1cdbe6f16a8d`
- Skill: `model-signal-radar`
- Input: Google DeepMind changes in the previous 14 days, prioritizing
  sign-language-to-text, official sources only, maximum one signal
- External capabilities: the Harness's existing RSS adapter and `curl`
- Terminal state: `succeeded`
- Artifact: `model-signal-radar.md`

The observed files are preserved here:

- [`SKILL.md`](SKILL.md): the workflow Skill used by the Agent;
- [`success-output.md`](success-output.md): the resulting Markdown Artifact.

The Artifact is preserved without editorial cleanup. It includes one stray
Hebrew token in the source-policy label. The `succeeded` terminal state means
the run completed and returned the required evidence; it does not imply
flawless prose. The visual below cleans up presentation but does not change the
reported finding or its verification boundary.

The visual demo under [`../../media/`](../../media/) is an editorial
reconstruction of the intended two-page Create / Use experience. Its Use result
is based on this observed run. It is not a transcript of a live authoring run.

This evidence is Harness-specific. It does not prove zero-adaptation execution
in arbitrary Harnesses or general performance across every source and model.
