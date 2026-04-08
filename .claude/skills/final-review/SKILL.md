---
name: final-review
description: Manual, user-triggered final review of the current working tree before the user considers a task complete. Runs the in-repo code-reviewer subagent and, if the Codex CLI is available, an independent Codex review. Both reviews are ADVISORY — this skill never blocks, never edits files, never commits. Invoke explicitly when the user asks for a "final review".
---

# final-review

This skill is **manual** and **advisory**. It is invoked only when the user explicitly asks for a final review. It does not run automatically. It does not block task completion. It does not modify any file. It does not stage, commit, push, install, or run mutating commands.

Its purpose is to give the user two independent opinions on the current diff before they decide the work is done.

## Procedure

Do every step in order. Stop and ask the user if any step cannot be completed.

### 1. Capture the current state

- Run `git status` to list changed, added, and deleted files.
- Run `git diff` (unstaged) and `git diff --staged` to capture the full diff.
- If both diffs are empty, stop and tell the user there is nothing to review.

### 2. Restate the scope

Write one or two sentences describing what the user actually asked for in this task. This is the reference both reviewers will use to detect scope drift. If the scope is unclear, ask the user before proceeding.

### 3. Reviewer A — in-repo `code-reviewer` subagent

Invoke the `code-reviewer` subagent. Pass it:
- the scope statement from step 2
- the diff from step 1
- the list of files touched

Capture its full structured report verbatim. Do not edit it. Do not act on it.

### 4. Reviewer B — Codex CLI (only if available)

Check whether Codex is callable in the current shell:

```
command -v codex >/dev/null 2>&1 && codex --version
```

- **If Codex is not on PATH**: skip this step. Note in the final output: "Codex reviewer: skipped (CLI not available)." Do not attempt to install it. Do not touch `~/.codex/`.
- **If Codex is on PATH but errors on auth or any other reason**: skip this step. Note the exact error in the final output. Do not attempt to fix it.
- **If Codex is callable**: invoke it in non-interactive, read-only mode with the diff and scope as input, asking it to return the same review structure as the in-repo reviewer (bugs / regressions / scope drift / hygiene / verdict). Pass only the diff and scope. Do not point Codex at the repository root. Do not give it write permissions. Capture its full output verbatim.

The exact Codex invocation is left to the user's local Codex setup. If the user has not yet told Claude how to invoke Codex for review, ask once and remember the answer for the rest of the session only.

### 5. Present both reports to the user

Output to the user, in this exact order:

```
## Final review (advisory, manual)

### Scope
<one-line restatement>

### Files touched
- <path> (<status>)
...

### Reviewer A — in-repo code-reviewer
<verbatim report>

### Reviewer B — Codex CLI
<verbatim report, or "skipped: <reason>">

### Summary
- Reviewer A verdict: <PASS | BLOCK>
- Reviewer B verdict: <PASS | BLOCK | skipped>
- Agreement: <agree | disagree | only one reviewer ran>
```

### 6. Hand control back to the user

After presenting the reports, stop. Do **not**:
- mark the task done on the user's behalf
- silently fix anything the reviewers flagged
- expand scope based on reviewer suggestions
- commit, push, or stage anything

The user reads both reports and decides what to do next. If they want fixes, they will ask.

## Hard rules

- This skill is advisory. It never blocks.
- This skill never writes to files or to git.
- This skill never installs or configures Codex.
- This skill never reads `~/.codex/auth.json` or any other credential file.
- If the two reviewers disagree, surface the disagreement plainly. Do not pick a winner.
- If only one reviewer is available, say so explicitly. Do not pretend the missing one passed.
