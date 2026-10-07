#!/usr/bin/env python3
"""Bake partials/site-footer.html into every page's <footer id="site-footer">."""

from __future__ import annotations

import re
import sys
import textwrap
from pathlib import Path

SITE_DIR = Path(__file__).resolve().parent.parent
PARTIALS_DIR = SITE_DIR / "partials"
PARTIAL_PATH = PARTIALS_DIR / "site-footer.html"

FOOTER_RE = re.compile(r'(<footer id="site-footer"[^>]*>)(.*?)(</footer>)', re.DOTALL)


def page_paths() -> list[Path]:
    return sorted(p for p in SITE_DIR.rglob("*.html") if PARTIALS_DIR not in p.parents)


def root_prefix(page: Path) -> str:
    """Relative path from the page back to site/ ('' or '../../')."""
    depth = len(page.relative_to(SITE_DIR).parts) - 1
    return "../" * depth


def fill_footer(html: str, partial: str, root: str) -> tuple[str, int]:
    body = textwrap.indent(partial.replace("@ROOT@", root).strip("\n"), "    ")

    def repl(match: re.Match[str]) -> str:
        return f"{match.group(1)}\n{body}\n  {match.group(3)}"

    return FOOTER_RE.subn(repl, html, count=1)


def main() -> int:
    partial = PARTIAL_PATH.read_text(encoding="utf-8")
    if "<footer" in partial or "</footer>" in partial:
        # A nested footer would end the non-greedy match early on the next run.
        print(f"{PARTIAL_PATH.name} must not contain a <footer> element.", file=sys.stderr)
        return 1

    baked = 0
    for page in page_paths():
        rel = page.relative_to(SITE_DIR).as_posix()
        html = page.read_text(encoding="utf-8")
        updated, count = fill_footer(html, partial, root_prefix(page))
        if not count:
            print(f"Skip (no <footer id=\"site-footer\">): {rel}")
            continue
        if updated != html:
            page.write_text(updated, encoding="utf-8", newline="\n")
        baked += 1

    print(f"Baked site footer into {baked} page(s) from {PARTIAL_PATH.relative_to(SITE_DIR).as_posix()}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
