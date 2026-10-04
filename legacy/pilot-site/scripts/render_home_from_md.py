#!/usr/bin/env python3
"""Bake text_content/home.md paragraph blocks into index.html."""

from __future__ import annotations

import re
import sys
from pathlib import Path

SITE_DIR = Path(__file__).resolve().parent.parent
MD_PATH = SITE_DIR / "text_content" / "home.md"
HTML_PATH = SITE_DIR / "index.html"


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
            if re.match(r"^#{1,4} ", line):
                break
            if line == "---":
                break
            if line.strip().startswith("*("):
                break
            if line.startswith("*Form label:"):
                break
            if line.startswith("**Links:**"):
                break
            if line.startswith("**Listen on:**"):
                break
            if re.match(r"^-\s", line) and not para_lines:
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


def parse_newsletter_hints(text: str) -> dict[str, str]:
    hints: dict[str, str] = {}
    label = re.search(r"\*Form label:\* (.+?)(?: \*Button text:|\n\*Button text:)", text, re.DOTALL)
    button = re.search(r"\*Button text:\* (.+?)(?: \*Success message:|\n\*Success message:)", text, re.DOTALL)
    success = re.search(r"\*Success message:\* (.+?)(?:\n---|\n## |\Z)", text, re.DOTALL)
    if label:
        hints["placeholder"] = unescape_md(label.group(1).strip())
    if button:
        hints["button"] = unescape_md(button.group(1).strip())
    if success:
        hints["success"] = unescape_md(success.group(1).strip())
    return hints


def fill_html(html: str, blocks: dict[str, str], hints: dict[str, str]) -> str:
    def replace_div(match: re.Match[str]) -> str:
        classes = match.group(1)
        block_id = match.group(2)
        inner = blocks.get(block_id, "")
        if not inner:
            return match.group(0)
        return f'<div class="{classes}" id="{block_id}">{inner}</div>'

    html = re.sub(
        r'<div class="([^"]*)" id="(home-[^"]+)"></div>',
        replace_div,
        html,
    )

    if "placeholder" in hints:
        html = re.sub(
            r'(<input type="email" id="newsletter-email"[^>]*placeholder=")[^"]*(")',
            rf"\1{hints['placeholder']}\2",
            html,
            count=1,
        )
    if "button" in hints:
        html = re.sub(
            r"(<form class=\"newsletter\" id=\"newsletter-form\"[^>]*>.*?<button type=\"submit\">)[^<]*(</button>)",
            rf"\1{hints['button']}\2",
            html,
            count=1,
            flags=re.DOTALL,
        )
    if "success" in hints:
        esc = hints["success"].replace("&", "&amp;").replace('"', "&quot;")
        if "data-newsletter-success=" in html:
            html = re.sub(
                r'data-newsletter-success="[^"]*"',
                f'data-newsletter-success="{esc}"',
                html,
                count=1,
            )
        else:
            html = re.sub(
                r'(<html lang="en")',
                rf'\1 data-newsletter-success="{esc}"',
                html,
                count=1,
            )

    return html


def main() -> int:
    md = MD_PATH.read_text(encoding="utf-8")
    html = HTML_PATH.read_text(encoding="utf-8")
    blocks = parse_id_blocks(md)
    hints = parse_newsletter_hints(md)
    updated = fill_html(html, blocks, hints)
    if updated == html:
        print("No changes (check IDs in home.md match index.html).", file=sys.stderr)
    HTML_PATH.write_text(updated, encoding="utf-8", newline="\n")
    print(f"Rendered {len(blocks)} blocks from {MD_PATH.name} into {HTML_PATH.name}")
    if hints:
        print(f"Newsletter hints: {', '.join(hints.keys())}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
