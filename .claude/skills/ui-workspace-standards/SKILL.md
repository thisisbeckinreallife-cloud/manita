---
description: Enforce the premium operator-console UI and the exact three-column workspace contract for the vibe-coding product.
allowed-tools: Read, Glob, Grep
model: sonnet
paths:
  - app/**
  - src/**
  - components/**
---
# ui-workspace-standards

Use this whenever the slice touches the interface.

## Hard rules
- preserve the far-left rail, left rail, center task workspace, and right operational pane
- the center pane is the task workspace of record
- the right pane must communicate truthful operational state
- loading, empty, stale, and failure states must be visible and intentional
- the product must not look like a generic AI demo

Read before using:
- `layout-contract.md`
- `ui-review-checklist.md`
- `empty-states.md`
