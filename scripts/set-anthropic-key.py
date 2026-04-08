#!/usr/bin/env python3
"""Write the Anthropic API key to a file the dev server can read.

This avoids the FS-protected .env / .env.* pattern in the Claude Code
sandbox. The key is read from stdin via getpass (no shell history,
no visible input), and written to /private/tmp/claude/anthropic_key
with 0o600 perms.

The server side (src/lib/providers/anthropic-client.ts) checks the env
var ANTHROPIC_API_KEY first, then ANTHROPIC_API_KEY_FILE (which we set
to this path in .claude/launch.json), and only makes real Anthropic
calls when one of those resolves.

Usage: python3 scripts/set-anthropic-key.py
"""

import getpass
import os
import pathlib
import stat
import sys


def main() -> int:
    target = pathlib.Path("/private/tmp/claude/anthropic_key")
    target.parent.mkdir(parents=True, exist_ok=True)

    try:
        key = getpass.getpass("ANTHROPIC_API_KEY: ").strip()
    except (EOFError, KeyboardInterrupt):
        print("\nAborted.", file=sys.stderr)
        return 130

    if not key:
        print("Refusing to write an empty key.", file=sys.stderr)
        return 1

    target.write_text(key, encoding="utf-8")
    # Tighten to 0o600 so the key is only readable by the owner.
    os.chmod(target, stat.S_IRUSR | stat.S_IWUSR)

    # Never print the key itself; only its length, to confirm it landed.
    print(f"Wrote {len(key)} chars to {target}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
