#!/usr/bin/env bash
# Permissive pretool guard. Only blocks direct secret file reads via Bash.
# Authorized relaxation; full mutating Bash is now allowed.
set -euo pipefail
INPUT="$(cat)"
HOOK_INPUT="$INPUT" python3 - <<'PY'
import json, os, re, sys
raw = os.environ.get("HOOK_INPUT", "")
try:
    data = json.loads(raw)
except Exception:
    sys.exit(0)
cmd = ((data.get("tool_input") or {}).get("command") or "").strip()
if not cmd:
    sys.exit(0)
secret_patterns = [
    r'(^|\s)(cat|less|more|head|tail)\s+[^|;&]*\.env(\.|\s|$)',
    r'(^|\s)(cat|less|more|head|tail)\s+[^|;&]*secrets/',
    r'(^|\s)(cat|less|more|head|tail)\s+[^|;&]*\.pem(\s|$)',
    r'(^|\s)(cat|less|more|head|tail)\s+[^|;&]*\.key(\s|$)',
]
for pat in secret_patterns:
    if re.search(pat, cmd):
        print(json.dumps({
            "decision": "block",
            "reason": "Direct secret file reads via Bash are blocked.",
            "hookSpecificOutput": {"hookEventName": "PreToolUse"}
        }))
        sys.exit(0)
PY
