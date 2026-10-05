#!/usr/bin/env python3
"""Bake text_content/service-*.md ID blocks into each service detail index.html."""

from __future__ import annotations

import re
from pathlib import Path

SITE_DIR = Path(__file__).resolve().parent.parent

DETAIL_PAGES: tuple[tuple[Path, Path], ...] = (
    (
        SITE_DIR / "text_content" / "service-initial-consultation.md",
        SITE_DIR / "services" / "initial-consultation" / "index.html",
    ),
    (
        SITE_DIR / "text_content" / "service-individual-sessions.md",
        SITE_DIR / "services" / "individual-sessions" / "index.html",
    ),
    (
        SITE_DIR / "text_content" / "service-online-learning-modules.md",
        SITE_DIR / "services" / "online-learning-modules" / "index.html",
    ),
    (
        SITE_DIR / "text_content" / "service-team-sessions.md",
        SITE_DIR / "services" / "team-sessions" / "index.html",
    ),
)


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


def fill_html(html: str, blocks: dict[str, str]) -> tuple[str, list[str]]:
    missing: list[str] = []
    for block_id, inner in blocks.items():
        pattern = re.compile(
            rf"(<(\w+)[^>]*\sid=\"{re.escape(block_id)}\"[^>]*>)(.*?)(</\2>)",
            re.DOTALL,
        )

        def repl(match: re.Match[str], content: str = inner) -> str:
            return match.group(1) + content + match.group(4)

        new_html, count = pattern.subn(repl, html, count=1)
        if count:
            html = new_html
        else:
            missing.append(block_id)
    return html, missing


def main() -> int:
    total_blocks = 0
    for md_path, html_path in DETAIL_PAGES:
        if not md_path.is_file():
            print(f"Skip (missing md): {md_path.relative_to(SITE_DIR)}")
            continue
        if not html_path.is_file():
            print(f"Skip (missing html): {html_path.relative_to(SITE_DIR)}")
            continue

        blocks = parse_id_blocks(md_path.read_text(encoding="utf-8"))
        html = html_path.read_text(encoding="utf-8")
        updated, missing = fill_html(html, blocks)
        html_path.write_text(updated, encoding="utf-8", newline="\n")
        total_blocks += len(blocks)
        rel = html_path.relative_to(SITE_DIR)
        print(f"Rendered {len(blocks)} block(s) into {rel.as_posix()}")
        if missing:
            print(f"  Warning: no matching element for ID(s): {', '.join(missing)}")

    print(f"Done ({total_blocks} blocks across detail pages).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
