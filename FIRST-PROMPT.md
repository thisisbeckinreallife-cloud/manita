Use the pack in this exact order.

1. Read `CLAUDE.md` fully.
2. Read `docs/VIBE-WORKSPACE-SPEC.md` fully.
3. Read `docs/PHASE-MAP.md` fully.
4. Use the `brief-to-spec` skill only to confirm deltas between the spec and the current repository.
5. Use the `architect` subagent to produce a phase-0/phase-1 architecture and file plan.
6. Do not write code yet.

Your next output must contain only these sections:
- Current repo reality
- Gaps versus product spec
- Recommended first vertical slice
- Files/directories to create or change
- Acceptance criteria
- Validation plan
- Risks and rollback

Rules:
- Do not code before producing the above.
- Do not modify `.claude/**`.
- Do not widen scope.
- Do not claim that GitHub bootstrap, Railway deploy, preview, or model selection are complete unless they are backed by real persisted state and executable flows.
