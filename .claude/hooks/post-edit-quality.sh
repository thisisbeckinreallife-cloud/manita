#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
STATE_DIR="$PROJECT_DIR/.claude/state/quality"
mkdir -p "$STATE_DIR"
INPUT="$(cat)"

HOOK_INPUT="$INPUT" python3 - "$PROJECT_DIR" "$STATE_DIR" <<'PY'
import hashlib, json, os, pathlib, subprocess, sys, time

project_dir = pathlib.Path(sys.argv[1])
state_root = pathlib.Path(sys.argv[2])
raw = os.environ.get("HOOK_INPUT", "")
try:
    data = json.loads(raw)
except Exception:
    sys.exit(0)

def emit(payload):
    print(json.dumps(payload))
    sys.exit(0)

tool_input = data.get("tool_input") or {}
file_path = tool_input.get("file_path") or tool_input.get("target_file") or ""
suffix = pathlib.Path(file_path).suffix.lower()
relevant_suffixes = {".ts", ".tsx", ".js", ".jsx", ".json", ".prisma", ".css", ".scss", ".mjs", ".cjs", ".mdx"}
markers = ["package.json", "pnpm-lock.yaml", "yarn.lock", "package-lock.json", "bun.lock", "bun.lockb", "next.config", "tailwind.config", "prisma/schema.prisma"]
if suffix not in relevant_suffixes and not any(m in file_path for m in markers):
    sys.exit(0)

session_id = data.get("session_id") or "unknown-session"
transcript_path = data.get("transcript_path") or "main"
actor_key = hashlib.sha1(transcript_path.encode("utf-8")).hexdigest()[:12]
session_dir = state_root / session_id
session_dir.mkdir(parents=True, exist_ok=True)
status_file = session_dir / f"{actor_key}.json"
log_file = session_dir / f"{actor_key}.log"
lock_file = session_dir / f"{actor_key}.lock"

if lock_file.exists():
    try:
        pid = int(lock_file.read_text().strip())
        os.kill(pid, 0)
        sys.exit(0)
    except Exception:
        pass
lock_file.write_text(str(os.getpid()))

try:
    package_json = project_dir / "package.json"
    if not package_json.exists():
        status_file.write_text(json.dumps({
            "timestamp": int(time.time()),
            "status": "skipped",
            "reason": "No package.json found",
            "file": file_path,
            "session_id": session_id,
            "transcript_path": transcript_path
        }, indent=2))
        emit({"additionalContext": f"Validation skipped after editing {file_path}: no package.json found."})

    pkg = json.loads(package_json.read_text())
    scripts = pkg.get("scripts") or {}

    if (project_dir / "pnpm-lock.yaml").exists():
        runner = ["pnpm"]
    elif (project_dir / "yarn.lock").exists():
        runner = ["yarn"]
    elif (project_dir / "bun.lockb").exists() or (project_dir / "bun.lock").exists():
        runner = ["bun", "run"]
    else:
        runner = ["npm", "run"]

    checks = []
    for name in ["lint", "typecheck"]:
        if name in scripts:
            checks.append((name, runner + [name]))

    if any(seg in file_path for seg in ["app/", "src/", "components/", "lib/", "server/", "prisma/"]):
        for name in ["test:ci", "test", "test:smoke"]:
            if name in scripts:
                checks.append((name, runner + [name]))
                break

    if any(seg in file_path for seg in ["app/", "src/", "components/", "package.json", "next.config", "tailwind.config"]) and "build" in scripts:
        checks.append(("build", runner + ["build"]))

    if not checks:
        status_file.write_text(json.dumps({
            "timestamp": int(time.time()),
            "status": "skipped",
            "reason": "No matching scripts found",
            "file": file_path,
            "session_id": session_id,
            "transcript_path": transcript_path
        }, indent=2))
        emit({"additionalContext": f"Validation skipped after editing {file_path}: no matching scripts found."})

    results = []
    logs = []
    failed = []
    for name, cmd in checks:
        proc = subprocess.run(cmd, cwd=str(project_dir), capture_output=True, text=True)
        out = ((proc.stdout or "") + (proc.stderr or ""))[-8000:]
        results.append({"name": name, "ok": proc.returncode == 0, "code": proc.returncode})
        logs.append(f"\n===== {name} :: {'PASS' if proc.returncode == 0 else 'FAIL'} =====\n{out}\n")
        if proc.returncode != 0:
            failed.append(name)

    log_file.write_text("\n".join(logs))
    payload = {
        "timestamp": int(time.time()),
        "status": "failed" if failed else "passed",
        "failed": failed,
        "results": results,
        "file": file_path,
        "session_id": session_id,
        "transcript_path": transcript_path,
        "log_file": str(log_file.relative_to(project_dir))
    }
    status_file.write_text(json.dumps(payload, indent=2))

    if failed:
        emit({"systemMessage": f"Quality gate failed after editing {file_path}. Failing checks: {', '.join(failed)}. Inspect {payload['log_file']} and fix before closing the slice."})
    else:
        emit({"additionalContext": f"Quality checks passed after editing {file_path}: {', '.join(r['name'] for r in results)}."})
finally:
    try:
        if lock_file.exists():
            lock_file.unlink()
    except Exception:
        pass
PY
