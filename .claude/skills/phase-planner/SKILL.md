---
description: Break the product into defensible phases and slices with explicit acceptance criteria, validation, and rollback.
allowed-tools: Read, Glob, Grep
model: opus
---
# phase-planner

Use this when planning implementation order or re-planning after blockers.

## Required output
- phase objective
- why now
- included scope
- excluded scope
- acceptance criteria
- validation plan
- rollback plan
- follow-on phase

## Hard rules
- isolate first-time infra risk from broad UI change
- prove the product model before polishing secondary surfaces
- do not hide blockers by moving them into vague future phases

Read before using:
- `template.md`
- `sequencing-heuristics.md`
- `risk-budget.md`
- `product-phase-map.md`
