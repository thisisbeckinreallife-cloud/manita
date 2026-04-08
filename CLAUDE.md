# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Operating rules

These rules are strict and apply to every change, regardless of size.

1. **No assumptions about stack or architecture.** Do not invent frameworks, libraries, directory layouts, build tools, or conventions. Read the repository first. If something is not present, ask before introducing it.
2. **Solve only the requested problem.** The user's request defines the entire scope of work. Anything not strictly required to solve that exact problem is out of scope and must not be done.
3. **Do not touch unrelated files.** Only files that must be modified to solve the requested problem may be edited, created, or deleted. Discovering an unrelated issue is not a license to fix it.
4. **No opportunistic refactors.** Renaming, restructuring, extracting, inlining, reorganizing, or rewriting code that already works is forbidden, even if it would be "better." If a refactor is genuinely required to solve the problem, stop and explain it first (see rule 6).
5. **No cosmetic cleanup.** Reformatting, reindenting, reordering imports, fixing typos in unrelated comments, removing unrelated dead code, or any other purely cosmetic edit is forbidden. The only exception: a cosmetic change that is *physically inseparable* from the requested fix (e.g., the line you must edit is the same line). Inseparability must be real, not convenient.
6. **Stop and explain instead of expanding scope.** If the correct solution requires changes beyond what the user asked for — touching more files, refactoring, changing an interface, adding a dependency, modifying shared code — you must STOP, do not make those changes, and explain to the user:
   - what you found
   - why the requested scope is insufficient
   - what wider scope you believe is needed
   - what the alternatives are
   Then wait for an explicit decision. Silent scope expansion is a hard violation.
7. **Minimal diffs.** Prefer the smallest change that correctly solves the problem. Do not rewrite code that already works.
8. **No invented requirements.** Do not add features, validations, configuration, error handling, logging, tests, or documentation that the user did not request.
9. **Read before writing.** Before editing any file, read it. Before creating a file, verify it does not already exist and that its location matches existing conventions.
10. **No new dependencies without approval.** Adding, upgrading, or removing a dependency requires explicit user confirmation.
11. **Destructive operations require confirmation.** File deletion, history rewrites, force pushes, schema changes, and any irreversible action must be confirmed in chat first.
12. **Never fabricate.** Do not guess APIs, file paths, identifiers, command flags, or behavior. If unknown, inspect or ask.
13. **Preserve existing style.** Match the formatting, naming, and patterns already in the file you are editing.
14. **Finish with review.** Before declaring any task done, run the `safe-review` skill.

## Definition of done

A task is only considered done when all of the following are true:
- The user's request is satisfied exactly — nothing more, nothing less.
- No unrelated files were modified.
- No opportunistic refactors or cosmetic cleanup were performed.
- No new dependencies, files, or configuration were introduced without approval.
- If wider scope was needed, it was raised and explicitly approved before being acted on.
- The `safe-review` skill has been run and its findings addressed.


---

# Project Constitution — V4 Product-Fit Hard Mode

## Mission
Build a production-minded MVP for a Manus-inspired vibe-coding workspace with this exact product spine:

**Project -> Folder -> Task -> Task Chat -> Attachments -> Model Selection -> GitHub Repo Bootstrap -> Railway Deploy -> Right-Hand Preview/Deploy Truth**

This is not a generic AI app. It is an operator workspace for building and shipping software from task-scoped conversations.

## Non-negotiable product truth
The product must feel operational, not decorative.

Three-column layout truth:
- **far-left rail:** projects and global workspace navigation
- **left rail:** folders and tasks inside the selected project
- **center:** task workspace with task chat, task metadata, attachments, run state, model/provider controls, and task-level actions
- **right:** deploy status, preview, logs, health, and operational truth

Never fake progress. Never show a preview or deploy state that is not backed by real persisted state.

## Exact domain model to preserve
Core entities for the MVP:
- user
- project
- project_rule
- project_context
- project_skill_reference
- folder
- task
- task_message
- task_attachment
- task_run
- model_provider_connection
- model_selection_snapshot
- repository_link
- deploy_target
- deploy_run
- deploy_event
- preview_endpoint

## Default stack for an empty or under-specified repo
Use these defaults unless a hard blocker appears:
- package manager: pnpm
- runtime: Node 20+
- app shell: Next.js App Router + TypeScript
- database: PostgreSQL
- ORM: Prisma
- styling: Tailwind CSS
- validation: Zod
- auth: real minimal session auth, not a fake client gate
- queue/jobs: simple persistent jobs first, not distributed complexity unless the slice proves it necessary
- file storage: local dev adapter + production storage abstraction
- transport for live updates: polling or SSE first; do not add websocket complexity without evidence
- tests: Vitest + Playwright for critical flows
- integrations: official GitHub API and Railway integration path only

## Product boundaries for MVP
The MVP must support:
- creating projects, folders, and tasks
- storing per-project context, rules, and skill references
- task chat with attachment support
- task-level model/provider selection
- task execution state and basic run history
- repository bootstrap per project
- Railway target linkage and deploy status
- right-hand operational pane with preview and deploy truth

The MVP must **not** attempt from v1:
- full browser IDE
- multi-user enterprise permissions
- branching UI
- token billing engine
- autonomous internal swarm visible to end users
- provider-specific lock-in in the data model

## Architecture rules
1. One GitHub repository per project for MVP.
2. Repo bootstrap and deploy linkage are server-side operations only.
3. GitHub and Railway credentials never touch the client.
4. Model provider selection is task-scoped and persisted.
5. Provider calls go through adapters; never couple core product state to one vendor.
6. The right pane must reflect persisted deploy/preview state, not optimistic fantasy.
7. Provisioning must be idempotent wherever practical.
8. Every phase must leave the repo runnable or explicitly document why not.
9. Prefer the smallest real vertical slice over broad fake completeness.
10. Do not mutate `.claude/**` unless the task explicitly asks to evolve the Claude system itself.

## Hard scope rule
Change only what the current phase requires.

Never do any of the following without explicit approval:
- swap the stack
- rename broad sections of the repo
- redesign unrelated UI surfaces
- refactor outside the active slice
- add hidden complexity "for later"
- change project constitution or Claude control files as collateral work

## Required execution contract
Before coding any phase, output:
- objective
- assumptions
- files and directories to create or change
- exact acceptance criteria
- validation plan
- rollback plan

Then implement only that phase.

After each meaningful block, output:
- what changed
- what was validated
- what failed or remains unproven
- whether the phase should continue, pause, or split

## Required subagent usage
Use specialized subagents when the task benefits from isolation:
- **architect** for domain model, contracts, module boundaries, migrations, and sequencing
- **builder-fullstack** for app implementation
- **devops-integrations** for GitHub/Railway and server-side integration safety
- **qa-e2e** for critical path tests and regression gates
- **reviewer** for final completeness verdict

The main thread must orchestrate, not become a dumping ground for all work.

## Mandatory phase order for this product
Prefer this build order unless the active repo state clearly requires a deviation:
1. product/domain skeleton and shared types
2. data model and migrations
3. project/folder/task CRUD shell
4. task chat + attachments + model selection UI
5. GitHub bootstrap backend path
6. Railway linkage + deploy state + preview truth
7. hardening, tests, and regression closure

## UI quality bar
- must read as premium operator software
- must not look like generic AI boilerplate
- spacing, hierarchy, loading states, empty states, and failure states must be intentional
- the center pane is the workspace of record
- the right pane is operational truth, not decoration

## Completion bar
A phase is not complete unless:
- acceptance criteria are met
- relevant checks ran
- the reviewer can understand the change surface
- no unacknowledged blocker remains
- any preview/deploy claim is backed by real state

## Safe defaults when the brief is ambiguous
- choose the simpler path that preserves future extensibility
- prefer adapters over vendor lock-in
- prefer typed boundaries over magic
- prefer a small real slice over a large fake shell
- prefer honesty over optimistic claims
