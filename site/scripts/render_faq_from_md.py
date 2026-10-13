#!/usr/bin/env python3
"""Bake text_content/faq.md into the FAQ accordion in services.html.

Each FAQ is a pair of `**ID:** `faq-qN`` (question text) and `**ID:** `faq-aN`` (answer)
blocks. The items between the `<!-- faq:start -->` and `<!-- faq:end -->` markers inside
`<div id="services-faq">` are regenerated in the order the questions appear in the file.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

SITE_DIR = Path(__file__).resolve().parent.parent
MD_PATH = SITE_DIR / "text_content" / "faq.md"
HTML_PATH = SITE_DIR / "services.html"

START_MARKER = "<!-- faq:start -->"
END_MARKER = "<!-- faq:end -->"


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


def parse_faq_blocks(text: str) -> list[tuple[str, list[str]]]:
    """Return [(block_id, body_lines)] for every `**ID:**` block, in file order.

    A block ends at the next `**ID:**` line or a `---` rule. Notes before the first ID are ignored.
    """
    blocks: list[tuple[str, list[str]]] = []
    current: list[str] | None = None
    for line in text.splitlines():
        id_match = re.match(r"^\*\*ID:\*\* `([^`]+)`\s*$", line)
        if id_match:
            current = []
            blocks.append((id_match.group(1), current))
        elif line.strip() == "---":
            current = None
        elif current is not None:
            current.append(line)
    return blocks


def body_to_html(lines: list[str], indent: str) -> str:
    """Paragraphs and `*` bullet lists → <p> / <ul> elements, one per line."""
    out: list[str] = []
    para: list[str] = []
    items: list[str] = []

    def flush_para() -> None:
        if para:
            out.append(f"{indent}<p>{inline_markdown_to_html(' '.join(para))}</p>")
            para.clear()

    def flush_list() -> None:
        if items:
            out.append(f"{indent}<ul>")
            out.extend(f"{indent}  <li>{inline_markdown_to_html(i)}</li>" for i in items)
            out.append(f"{indent}</ul>")
            items.clear()

    for raw in lines:
        line = raw.strip()
        bullet = re.match(r"^[*-] +(.*)$", line)
        if not line:
            flush_para()
            flush_list()
        elif bullet:
            flush_para()
            items.append(bullet.group(1))
        else:
            flush_list()
            para.append(line)
    flush_para()
    flush_list()
    return "\n".join(out)


def build_items(blocks: list[tuple[str, list[str]]]) -> tuple[str, int]:
    bodies = dict(blocks)
    questions = [bid for bid, _ in blocks if re.fullmatch(r"faq-q\d+", bid)]
    answers = {bid for bid in bodies if re.fullmatch(r"faq-a\d+", bid)}
    html_items: list[str] = []
    for qid in questions:
        aid = "faq-a" + qid[len("faq-q"):]
        if aid not in bodies:
            raise ValueError(f"{qid} has no matching {aid} block in faq.md")
        answers.discard(aid)
        question = " ".join(l.strip() for l in bodies[qid] if l.strip())
        answer = body_to_html(bodies[aid], " " * 14)
        if not question or not answer:
            raise ValueError(f"{qid}/{aid} is empty in faq.md")
        html_items.append(
            f"""          <div class="faq-item">
            <h3 class="faq-question-heading">
              <button type="button" class="faq-question" id="{qid}" aria-expanded="false" aria-controls="{aid}">
                <span class="faq-question-text">{inline_markdown_to_html(question)}</span>
                <span class="faq-icon" aria-hidden="true"></span>
              </button>
            </h3>
            <div class="faq-answer" id="{aid}" role="region" aria-labelledby="{qid}" hidden>
{answer}
            </div>
          </div>"""
        )
    for orphan in sorted(answers):
        print(f"Warning: {orphan} has no matching question block; skipped.", file=sys.stderr)
    return "\n\n".join(html_items), len(html_items)


def main() -> int:
    md = MD_PATH.read_text(encoding="utf-8")
    html = HTML_PATH.read_text(encoding="utf-8")
    start = html.find(START_MARKER)
    end = html.find(END_MARKER)
    if start == -1 or end == -1 or end < start:
        print(f"{HTML_PATH.name} is missing the {START_MARKER} / {END_MARKER} markers.", file=sys.stderr)
        return 1
    try:
        items, count = build_items(parse_faq_blocks(md))
    except ValueError as err:
        print(err, file=sys.stderr)
        return 1
    if not count:
        print("No faq-qN / faq-aN pairs found in faq.md; leaving services.html unchanged.", file=sys.stderr)
        return 1
    updated = (
        html[: start + len(START_MARKER)]
        + "\n"
        + items
        + "\n          "
        + html[end:]
    )
    HTML_PATH.write_text(updated, encoding="utf-8", newline="\n")
    print(f"Rendered {count} FAQ items from {MD_PATH.name} into {HTML_PATH.name}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
