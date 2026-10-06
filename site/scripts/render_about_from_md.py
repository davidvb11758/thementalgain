#!/usr/bin/env python3
"""Bake text_content/about.md paragraph blocks into about.html."""

from __future__ import annotations

import re
import sys
from pathlib import Path

SITE_DIR = Path(__file__).resolve().parent.parent
MD_PATH = SITE_DIR / "text_content" / "about.md"
HTML_PATH = SITE_DIR / "about.html"


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


def paragraphs_to_html(paragraphs: list[str], tag: str = "div") -> str:
    if not paragraphs:
        return ""
    parts = [inline_markdown_to_html(p) for p in paragraphs]
    if tag in ("h1", "h2", "h3"):
        return parts[0]
    if len(parts) == 1:
        return parts[0]
    return "".join(f"<p>{p}</p>" for p in parts)


def parse_id_blocks(text: str) -> dict[str, list[str]]:
    lines = text.splitlines()
    blocks: dict[str, list[str]] = {}
    i = 0
    while i < len(lines):
        id_match = re.match(r"^\*\*ID:\*\* `([^`]+)`\s*$", lines[i])
        if not id_match:
            i += 1
            continue
        block_id = id_match.group(1)
        i += 1
        paragraphs: list[str] = []
        current: list[str] = []
        while i < len(lines):
            line = lines[i]
            if re.match(r"^\*\*ID:\*\* `", line):
                break
            if re.match(r"^#{1,4} ", line):
                break
            if line == "---":
                break
            if line.strip().startswith("*("):
                break
            if re.match(r"^-\s", line) and not current and not paragraphs:
                break
            if line.strip() == "":
                if current:
                    paragraphs.append(" ".join(current).strip())
                    current = []
                i += 1
                continue
            current.append(line)
            i += 1
        if current:
            paragraphs.append(" ".join(current).strip())
        if paragraphs:
            blocks[block_id] = paragraphs
    return blocks


def fill_html(html: str, blocks: dict[str, list[str]]) -> str:
    def replace_by_id(match: re.Match[str]) -> str:
        tag = match.group(1)
        attrs = match.group(2)
        block_id = match.group(3)
        paragraphs = blocks.get(block_id)
        if not paragraphs:
            return match.group(0)
        inner = paragraphs_to_html(paragraphs, tag)
        return f"<{tag}{attrs}>{inner}</{tag}>"

    return re.sub(
        r'<(div|h1|h2|h3)([^>]* id="((?:about|social)-[^"]+)"[^>]*)>.*?</\1>',
        replace_by_id,
        html,
        flags=re.DOTALL,
    )


def main() -> int:
    md = MD_PATH.read_text(encoding="utf-8")
    html = HTML_PATH.read_text(encoding="utf-8")
    blocks = parse_id_blocks(md)
    updated = fill_html(html, blocks)
    if updated == html:
        print("No changes (check IDs in about.md match about.html).", file=sys.stderr)
    HTML_PATH.write_text(updated, encoding="utf-8", newline="\n")
    print(f"Rendered {len(blocks)} blocks from {MD_PATH.name} into {HTML_PATH.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
