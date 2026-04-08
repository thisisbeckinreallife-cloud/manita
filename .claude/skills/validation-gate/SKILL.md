---
description: Manual isolated validation gate for deciding whether a slice is actually complete.
allowed-tools: Read, Glob, Grep
model: opus
context: fork
agent: reviewer
disable-model-invocation: true
---
# validation-gate

This is a manual validation workflow.
Use it only when you want a final structured verdict.

## Required output
- evidence reviewed
- tested
- partially tested
- untested
- critical risks
- verdict

## Hard rules
- if preview/deploy/repo bootstrap is claimed, require evidence of persisted state and executed path
- if provider selection is claimed, require task-level persistence evidence
- if tests were not run, completeness cannot be rated as proven

Read before using:
- `checklist.md`
- `verdict-template.md`
