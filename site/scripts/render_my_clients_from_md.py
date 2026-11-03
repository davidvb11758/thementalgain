#!/usr/bin/env python3
"""Bake text_content/my-clients.md into my-clients.html.

Two kinds of `**ID:**` block:
- Text blocks (`my-clients-*`): replace the inner HTML of the h1/h2/h3/p with that id.
- Client lists (`my-clients-individual-groups`, `my-clients-team-groups`): each `### Heading`
  starts a group and each `* item` under it is a chip. The groups between the matching
  `<!-- <id>:start -->` / `<!-- <id>:end -->` markers are regenerated.

A block ends at the next `**ID:**`, a `---` rule, or a `#` / `##` heading.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

SITE_DIR = Path(__file__).resolve().parent.parent
MD_PATH = SITE_DIR / "text_content" / "my-clients.md"
HTML_PATH = SITE_DIR / "my-clients.html"

# Block id -> prefix for the generated heading ids (`<prefix>-N-heading`).
GROUP_BLOCKS = {
    "my-clients-individual-groups": "individual-club",
    "my-clients-team-groups": "team-club",
}


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


def parse_blocks(text: str) -> dict[str, list[str]]:
    blocks: dict[str, list[str]] = {}
    current: list[str] | None = None
    for line in text.splitlines():
        id_match = re.match(r"^\*\*ID:\*\* `([^`]+)`\s*$", line)
        if id_match:
            current = blocks.setdefault(id_match.group(1), [])
        elif line.strip() == "---" or re.match(r"^#{1,2} ", line):
            current = None
        elif current is not None:
            current.append(line)
    return blocks


def text_to_html(lines: list[str]) -> str:
    """One paragraph; a line ending in `\\` is followed by a <br>."""
    html = ""
    for raw in lines:
        line = raw.strip()
        if not line:
            if html:
                break
            continue
        if html and not html.endswith("<br>"):
            html += " "
        if line.endswith("\\"):
            html += inline_markdown_to_html(line[:-1].rstrip()) + "<br>"
        else:
            html += inline_markdown_to_html(line)
    return html


def parse_groups(block_id: str, lines: list[str]) -> list[tuple[str, bool, list[str]]]:
    groups: list[tuple[str, bool, list[str]]] = []
    for raw in lines:
        line = raw.strip()
        heading = re.match(r"^### +(.*?)(\s+\{wide\})?$", line)
        item = re.match(r"^[*-] +(.*)$", line)
        if heading:
            groups.append((heading.group(1), bool(heading.group(2)), []))
        elif item:
            if not groups:
                raise ValueError(f"{block_id}: bullet before the first ### heading")
            groups[-1][2].append(item.group(1))
        elif line:
            raise ValueError(f"{block_id}: expected a ### heading or * bullet, got: {line}")
    if not groups:
        raise ValueError(f"{block_id}: no ### groups found")
    return groups


def build_groups_html(prefix: str, groups: list[tuple[str, bool, list[str]]]) -> str:
    out: list[str] = []
    for n, (title, wide, items) in enumerate(groups, start=1):
        heading_id = f"{prefix}-{n}-heading"
        variant = "wide" if wide else "compact"
        chips = "\n".join(
            f'            <li class="individual-client-chip">{inline_markdown_to_html(i)}</li>' for i in items
        )
        out.append(
            f"""        <div class="individual-club-group">
          <h3 id="{heading_id}" class="individual-club-heading">{inline_markdown_to_html(title)}</h3>
          <ul class="individual-client-grid individual-client-grid--{variant}" aria-labelledby="{heading_id}">
{chips}
          </ul>
        </div>"""
        )
    return "\n\n".join(out)


def replace_between_markers(html: str, block_id: str, body: str) -> str:
    start_marker = f"<!-- {block_id}:start -->"
    end_marker = f"<!-- {block_id}:end -->"
    start = html.find(start_marker)
    end = html.find(end_marker)
    if start == -1 or end == -1 or end < start:
        raise ValueError(f"{HTML_PATH.name} is missing the {start_marker} / {end_marker} markers")
    return html[: start + len(start_marker)] + "\n" + body + "\n        " + html[end:]


def main() -> int:
    md = MD_PATH.read_text(encoding="utf-8")
    html = HTML_PATH.read_text(encoding="utf-8")
    blocks = parse_blocks(md)

    try:
        for block_id, prefix in GROUP_BLOCKS.items():
            if block_id not in blocks:
                raise ValueError(f"{MD_PATH.name} has no {block_id} block")
            groups = parse_groups(block_id, blocks[block_id])
            html = replace_between_markers(html, block_id, build_groups_html(prefix, groups))
    except ValueError as err:
        print(err, file=sys.stderr)
        return 1

    text_count = 0
    for block_id, lines in blocks.items():
        if block_id in GROUP_BLOCKS:
            continue
        inner = text_to_html(lines)
        if not inner:
            print(f"Warning: {block_id} is empty in {MD_PATH.name}; skipped.", file=sys.stderr)
            continue
        html, n = re.subn(
            rf'(<(h1|h2|h3|p)[^>]* id="{re.escape(block_id)}"[^>]*>).*?(</\2>)',
            lambda m: m.group(1) + inner + m.group(3),
            html,
            count=1,
            flags=re.DOTALL,
        )
        if n == 0:
            print(f"Warning: no h1/h2/h3/p with id=\"{block_id}\" in {HTML_PATH.name}.", file=sys.stderr)
        text_count += n

    HTML_PATH.write_text(html, encoding="utf-8", newline="\n")
    print(f"Rendered {text_count} text blocks and {len(GROUP_BLOCKS)} client lists from {MD_PATH.name} into {HTML_PATH.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
