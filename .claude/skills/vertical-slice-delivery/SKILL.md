---
description: Keep implementation focused on the smallest real vertical slice that proves the product model.
allowed-tools: Read, Glob, Grep
model: sonnet
---
# vertical-slice-delivery

Use this whenever deciding what to build next or whether a slice is too broad.

## Hard rules
- prove the product model before polishing the shell
- prefer one end-to-end credible path over many disconnected surfaces
- do not bundle multiple first-time integrations with broad UI change unless the slice is still clearly testable

Read before using:
- `slice-template.md`
- `ordering-heuristics.md`
- `done-definition.md`
