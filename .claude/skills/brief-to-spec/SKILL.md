---
description: Convert ambiguous requests or repo states into an explicit spec, acceptance criteria, and implementation order for the vibe-coding workspace product.
allowed-tools: Read, Glob, Grep
model: opus
---
# brief-to-spec

Use this when the request is ambiguous, the repo is incomplete, or the active slice needs to be derived from the product spec.

## Required output
Produce these sections in order:
1. Current repo reality
2. Confirmed product requirements
3. Assumptions forced by missing information
4. Entities and contracts affected
5. Acceptance criteria
6. File and module plan
7. Validation plan
8. Risks and rollback
9. Recommended next slice

## Hard rules
- anchor every output to the vibe-workspace entity model
- state whether the slice touches projects/folders/tasks/chat/attachments/providers/repo bootstrap/deploy/preview
- if the request implies preview or deploy truth, require persisted observed state
- if the request implies provider choice, require persisted task-level selection
- if the request is too broad, reduce it to the smallest viable slice

Read before using:
- `template.md`
- `rubric.md`
- `defaults.md`
- `anti-patterns.md`
