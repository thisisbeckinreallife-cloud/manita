---
name: safe-review
description: Final safety review before considering any coding task done. Use whenever Claude is about to declare work complete. Delegates bug, regression, and scope-drift checking to the code-reviewer subagent and blocks completion until findings are resolved.
---

# safe-review

Run this skill as the **last step** of every coding task, immediately before telling the user the work is done. Do not skip it for "small" changes.

## Procedure

1. **Collect the diff.** Run `git status` and `git diff` (staged + unstaged) to get the exact set of changes that will be attributed to this task. If nothing has changed, stop and report that.
2. **Restate scope.** In one or two sentences, write down what the user actually asked for. This is the reference for scope-drift detection.
3. **Delegate review.** Invoke the `code-reviewer` subagent. Pass it:
   - the restated scope from step 2
   - the diff from step 1
   - the list of files touched
   Ask it to report bugs, regressions, and scope drift.
4. **Triage findings.**
   - **Blocking** (bugs, regressions, scope drift, unapproved new files/deps): fix them, then re-run this skill from step 1.
   - **Non-blocking observations**: surface them to the user as notes, do not silently act on them.
5. **Final gate.** Only after the reviewer returns clean (or with non-blocking notes only) may the task be reported as done. The completion message to the user must include:
   - what was changed (files + one-line summary each)
   - confirmation that `safe-review` ran clean
   - any non-blocking notes from the reviewer

## Hard rules

- Never mark a task done without running this skill.
- Never override a blocking finding without explicit user approval.
- Never expand scope to "fix" something the reviewer flagged as drift — report it and ask.
