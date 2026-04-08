# Start Here

## What this pack is
This is a V4 Claude Code autonomy pack tailored to the vibe-coding workspace product.

It is designed to maximize:
- scope discipline
- product-specific execution
- subagent specialization
- real validation before closure
- safer autonomy for a complex build

## Drop-in structure
Copy these files into the root of the target repo.

## Recommended working mode
1. Start Claude Code in `plan` mode.
2. Paste `FIRST-PROMPT.md`.
3. Approve only the first vertical slice.
4. Move to `acceptEdits` for implementation.
5. Let the hooks and reviewer block premature closure.
6. Use `parallel-execution` only when the slice is truly separable.

## Intended default subagent rhythm
- architect -> define slice
- builder-fullstack / devops-integrations -> implement slice
- qa-e2e -> validate critical path
- reviewer -> approve or block

## Important operational rule
This pack assumes that file mutation should happen through Claude file-edit tools, not through ad-hoc mutating Bash.

Bash is for:
- install
- lint
- typecheck
- tests
- build
- git status/log/diff
- safe read-only inspection

It is not for:
- editing source files
- force git operations
- changing `.claude/**`
- reading secrets
