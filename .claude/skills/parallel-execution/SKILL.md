---
description: Decide whether a slice can be safely parallelized across subagents or worktrees without creating merge chaos.
allowed-tools: Read, Glob, Grep
model: sonnet
---
# parallel-execution

Use this before splitting work into parallel branches or subagents.

## Required output
- go or no-go
- split proposal
- shared-risk analysis
- merge order
- fallback plan

## Hard no-go conditions
Do not parallelize when the slice includes any of the following in first-time form:
- one migration or schema contract shared by multiple surfaces
- auth redesign plus product feature work
- repo bootstrap plus deploy state plus preview UI in one move
- shared provider adapter changes touching multiple tasks

Read before using:
- `decision-checklist.md`
- `worktree-playbook.md`
- `safe-vs-unsafe-splits.md`
