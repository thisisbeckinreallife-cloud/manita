---
description: Guard against collateral damage, mutating Bash misuse, hidden refactors, and accidental edits to protected control files.
allowed-tools: Read, Glob, Grep
model: sonnet
paths:
  - "**/*"
---
# repo-safety

Use this as background policy for every slice.

## Hard rules
- edit only the active change surface
- do not mutate files via Bash
- do not read secrets directly
- do not touch `.claude/**` unless the task is explicitly about Claude controls
- do not broaden scope by cleanup, renaming, or unrelated refactors

Read before using:
- `forbidden-bash-patterns.md`
- `closure-template.md`
- `change-surface.md`
