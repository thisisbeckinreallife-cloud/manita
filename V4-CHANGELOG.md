# V4 Changelog

## What changed from v3 hard
- adapted the pack to the actual vibe-coding workspace product spec
- added product-specific docs and phase map
- expanded and tightened every skill with concrete supporting files
- added `permissionMode` and `skills` across subagents in a product-aware way
- kept Bash out of analytical agents
- tightened pretool guard against mutating Bash and secret access
- preserved per-session validation state and improved validation messaging
- added sandbox configuration and stronger deny rules
- added richer review and phase templates so Claude has less room to improvise badly

## Design intent of v4
V3 was a harder generic system.
V4 is a product-fit operating system for this exact build.
