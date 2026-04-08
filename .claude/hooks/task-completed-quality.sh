#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
STATE_ROOT="$PROJECT_DIR/.claude/state/quality"
INPUT="$(cat)"

HOOK_INPUT="$INPUT" python3 - "$STATE_ROOT" <<'PY'
import json, os, pathlib, sys
state_root = pathlib.Path(sys.argv[1])
raw = os.environ.get("HOOK_INPUT", "")
try:
    data = json.loads(raw)
except Exception:
    data = {}

session_id = data.get("session_id") or "unknown-session"
session_dir = state_root / session_id
if not session_dir.exists():
    sys.exit(0)

failed = []
for p in sorted(session_dir.glob("*.json")):
    try:
        payload = json.loads(p.read_text())
    except Exception:
        continue
    if payload.get("status") == "failed":
        failed.append(payload)

if not failed:
    sys.exit(0)

summary = []
for item in failed[:5]:
    checks = ", ".join(item.get("failed") or []) or "unknown checks"
    summary.append(f"{item.get('file', 'unknown file')} -> {checks}")

print(json.dumps({
    "decision": "block",
    "reason": "Task cannot be marked complete while validation is red: " + " | ".join(summary),
    "hookSpecificOutput": {
        "hookEventName": "TaskCompleted",
        "additionalContext": f"Quality gate still failing for {len(failed)} record(s). Resolve them before closing the task."
    }
}))
PY
