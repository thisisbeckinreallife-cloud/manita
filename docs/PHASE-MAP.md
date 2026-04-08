# Phase Map

## Phase 0 — Reality check and architecture
Deliverables:
- repo reality summary
- gap analysis versus product spec
- target module map
- file plan
- acceptance criteria for phase 1

## Phase 1 — Domain model and CRUD shell
Deliverables:
- initial schema
- project/folder/task CRUD
- baseline layout with three-column shell
- seed or fixture path if helpful

## Phase 2 — Task workspace core
Deliverables:
- task chat thread
- attachment storage abstraction
- task-level model/provider selection UI + persistence
- task workspace metadata

## Phase 3 — Repo bootstrap path
Deliverables:
- project-level GitHub bootstrap backend flow
- persisted repo linkage state
- UI truth for requested vs observed bootstrap state

## Phase 4 — Railway linkage and deploy truth
Deliverables:
- deploy target linkage
- deploy run/event persistence
- right-pane deploy truth, logs, preview availability state

## Phase 5 — Validation and hardening
Deliverables:
- critical path tests
- reviewer sign-off
- honest known-gaps list

## Forbidden phase mixing
Avoid combining, for the first time in one slice:
- major schema change + broad visual redesign
- auth redesign + provider integration
- repo bootstrap + deploy linkage + preview polish in one jump
- multiple external integrations without persisted state contracts
