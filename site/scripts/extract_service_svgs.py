#!/usr/bin/env python3
"""One-off helper: extract service icons from scraped WP HTML."""
from pathlib import Path
from bs4 import BeautifulSoup

html = Path(__file__).resolve().parent.parent.parent / "tmp-services.html"
if not html.exists():
    html = Path(__file__).resolve().parent.parent / "tmp-services.html"
html = html if html.exists() else Path(r"C:\9-personal\TMG_new\tmp-services.html")

soup = BeautifulSoup(html.read_text(encoding="utf-8"), "html.parser")
entry = soup.select_one(".entry-content")
icons_dir = Path(__file__).resolve().parent.parent / "images" / "icons"
icons_dir.mkdir(parents=True, exist_ok=True)

labels = [
    ("service-initial-consultation", "Initial Consultation"),
    ("service-individual-sessions", "Individual Sessions"),
    ("service-online-modules", "Online Learning Modules"),
    ("service-team-sessions", "Team Sessions"),
]

for fname, label in labels:
    for h in entry.find_all(["h2", "h3"]):
        if label not in h.get_text(" ", strip=True):
            continue
        svg = h.find("svg")
        if not svg:
            continue
        svg["aria-hidden"] = "true"
        if svg.get("xmlns") is None:
            svg["xmlns"] = "http://www.w3.org/2000/svg"
        out = icons_dir / f"{fname}.svg"
        out.write_text(str(svg), encoding="utf-8")
        print("wrote", out)
        break
