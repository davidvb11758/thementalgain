#!/usr/bin/env python3
"""Bake text_content/services.md paragraph blocks into services.html."""

from __future__ import annotations

import re
import sys
from pathlib import Path

SITE_DIR = Path(__file__).resolve().parent.parent
MD_PATH = SITE_DIR / "text_content" / "services.md"
HTML_PATH = SITE_DIR / "services.html"


def unescape_md(raw: str) -> str:
    return raw.replace("\\!", "!").replace("\\[", "[").replace("\\]", "]")


def escape_html(s: str) -> str:
    return (
        s.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def inline_markdown_to_html(raw: str) -> str:
    s = escape_html(unescape_md(raw))
    s = re.sub(
        r"\[([^\]]+)\]\(([^)]+)\)",
        lambda m: f'<a href="{m.group(2).replace(chr(34), "%22")}">{m.group(1)}</a>',
        s,
    )
    s = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", s)
    s = re.sub(r"\*([^*]+)\*", r"<em>\1</em>", s)
    return s


def parse_id_blocks(text: str) -> dict[str, str]:
    lines = text.splitlines()
    blocks: dict[str, str] = {}
    i = 0
    while i < len(lines):
        id_match = re.match(r"^\*\*ID:\*\* `([^`]+)`\s*$", lines[i])
        if not id_match:
            i += 1
            continue
        block_id = id_match.group(1)
        i += 1
        para_lines: list[str] = []
        while i < len(lines):
            line = lines[i]
            if re.match(r"^\*\*ID:\*\* `", line):
                break
            if re.match(r"^\*\*Image", line):
                break
            if re.match(r"^#{1,4} ", line):
                break
            if line == "---":
                break
            if re.match(r"^\*\(", line.strip()):
                break
            if line.strip() == "":
                if not para_lines:
                    i += 1
                    continue
                break
            para_lines.append(line)
            i += 1
        raw = " ".join(para_lines).strip()
        if raw:
            blocks[block_id] = inline_markdown_to_html(raw)
    return blocks


def fill_html(html: str, blocks: dict[str, str]) -> str:
    def replace_div(match: re.Match[str]) -> str:
        classes = match.group(1)
        block_id = match.group(2)
        inner = blocks.get(block_id, "")
        if not inner:
            return match.group(0)
        return f'<div class="{classes}" id="{block_id}">{inner}</div>'

    return re.sub(
        r'<div class="([^"]*)" id="(services-[^"]+)"></div>',
        replace_div,
        html,
    )


def main() -> int:
    md = MD_PATH.read_text(encoding="utf-8")
    html = HTML_PATH.read_text(encoding="utf-8")
    blocks = parse_id_blocks(md)
    updated = fill_html(html, blocks)
    HTML_PATH.write_text(updated, encoding="utf-8", newline="\n")
    print(f"Rendered {len(blocks)} text blocks into {HTML_PATH.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
