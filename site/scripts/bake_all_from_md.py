#!/usr/bin/env python3
"""Run all site Markdown → HTML bake scripts (used before Cloudflare deploy)."""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

SCRIPTS_DIR = Path(__file__).resolve().parent

BAKE_SCRIPTS = (
    "render_home_from_md.py",
    "render_about_from_md.py",
    "render_services_from_md.py",
    "render_service_details_from_md.py",
)


def main() -> int:
    for name in BAKE_SCRIPTS:
        path = SCRIPTS_DIR / name
        if not path.is_file():
            print(f"Missing bake script: {path}", file=sys.stderr)
            return 1
        print(f"Running {name}...", flush=True)
        result = subprocess.run([sys.executable, str(path)], check=False)
        if result.returncode != 0:
            print(f"{name} failed with exit code {result.returncode}", file=sys.stderr, flush=True)
            return result.returncode
    print("All Markdown bake scripts completed.", flush=True)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
