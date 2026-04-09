# Immersive Executive Web Architect

Portable executive-grade skill package for:
- Manus Skills
- Agent Skills-compatible clients
- Claude Code subagent preload workflows

## Package contents
- `SKILL.md` — main skill with standard frontmatter and full operating doctrine
- `claude-subagent.md` — Claude Code subagent that preloads this skill
- `references/QA_CHECKLIST.md` — QA checklist
- `references/DELIVERABLE_TEMPLATES.md` — output templates
- `references/SCORING_RUBRIC.md` — hard approval gates and weighted scoring
- `references/GOLD_STANDARD_PATTERNS.md` — reusable premium structural patterns
- `references/ANTI_PATTERNS.md` — failure modes to reject immediately

## What changed in v2
- added standards-compliant `SKILL.md` frontmatter
- added hard scoring and approval thresholds
- added quantified defaults for typography, spacing, motion, and 3D discipline
- added gold-standard patterns and anti-patterns
- upgraded Claude subagent to preload the skill directly

## Recommended use

### Manus
Upload the folder or ZIP.
Trigger the skill when you need premium website direction, a full website spec, or a premium audit.

### Claude Code
Place:
- `claude-subagent.md` into `.claude/agents/` or `~/.claude/agents/`
- the skill folder into `.claude/skills/` or `~/.claude/skills/`

The subagent preloads:
- `immersive-executive-web-architect`

## Approval philosophy
This package is designed to reject “good-looking but weak” work.
A result is only approved when it clears the score threshold and avoids blocking failures.
