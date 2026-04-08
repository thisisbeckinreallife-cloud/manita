---
description: Design and review GitHub bootstrap, Railway linkage, deploy truth, and preview truth for the vibe-coding workspace.
allowed-tools: Read, Glob, Grep
model: opus
paths:
  - app/**
  - src/**
  - lib/**
  - server/**
  - prisma/**
---
# github-railway-bootstrap

Use this whenever the slice touches repository bootstrap, deploy targets, deploy runs/events, preview URLs, or operational state shown in the right pane.

## Required output
- requested state
- observed state
- persistence contract
- idempotency strategy
- failure matrix
- UI truth rules
- validation checklist

## Hard rules
- one GitHub repo per project for MVP
- all provisioning actions are server-side only
- preview cannot be marked live without observed backend confirmation
- requested deploy is not observed deploy
- errors must not corrupt the rest of the project workspace

Read before using:
- `state-machine.md`
- `idempotency-checklist.md`
- `failure-matrix.md`
- `env-contract.md`
