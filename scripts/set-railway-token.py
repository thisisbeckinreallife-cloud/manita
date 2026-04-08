#!/usr/bin/env python3
"""Write a Railway API token to a file the current shell can source.

Mirrors scripts/set-anthropic-key.py: reads the token from stdin via
getpass (no shell history, no visible input) and writes it to
/private/tmp/claude/railway_token with 0o600 perms. The main agent
loop can then `export RAILWAY_TOKEN=$(cat ...)` — or read it directly
from the file — without the value ever appearing in a command line,
shell history, or process listing.

Get your token at https://railway.com/account/tokens (or
railway.app/account/tokens) and run:

    python3 scripts/set-railway-token.py

This file is for main-loop provisioning only. The app itself reads
RAILWAY_TOKEN from env at runtime (src/lib/railway/client.ts) and
does not consult this file.
"""

import getpass
import os
import pathlib
import stat
import sys


def main() -> int:
    target = pathlib.Path("/private/tmp/claude/railway_token")
    target.parent.mkdir(parents=True, exist_ok=True)

    try:
        token = getpass.getpass("RAILWAY_TOKEN: ").strip()
    except (EOFError, KeyboardInterrupt):
        print("\nAborted.", file=sys.stderr)
        return 130

    if not token:
        print("Refusing to write an empty token.", file=sys.stderr)
        return 1

    target.write_text(token, encoding="utf-8")
    os.chmod(target, stat.S_IRUSR | stat.S_IWUSR)

    print(f"Wrote {len(token)} chars to {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
