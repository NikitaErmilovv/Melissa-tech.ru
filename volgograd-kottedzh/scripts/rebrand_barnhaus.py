#!/usr/bin/env python3
"""One-off rebrand pass for volgograd-kottedzh copy."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT_SUFFIXES = {".html", ".js", ".json", ".md", ".txt", ".py", ".css"}

REPLACEMENTS = [
    ("volgograd-kottedzh", "volgograd-kottedzh"),
    ("map-barnhaus-desktop", "map-barnhaus-desktop"),
    ("map-barnhaus-mobile", "map-barnhaus-mobile"),
    ("https://2gis.ru/volgograd/firm/70000001114200104", "https://2gis.ru/volgograd/firm/70000001114200104"),
    ("70000001114200104", "70000001114200104"),
    ("BARNHAUS_SITE_REVIEWS", "BARNHAUS_SITE_REVIEWS"),
    ("+7 (902) 388-58-02", "+7 (902) 388-58-02"),
    ("+79023885802", "+79023885802"),
    ("79023885802", "79023885802"),
    ("БАРНХАУС", "БАРНХАУС"),
    ("Барнхаус", "Барнхаус"),
    ("", ""),
    ("пос. Царицын, ул. Радужная, 1", "пос. Царицын, ул. Радужная, 1"),
    ("пос. Царицын, ул. Радужная, 1", "пос. Царицын, ул. Радужная, 1"),
    ("пос. Царицын", "пос. Царицын"),
    ("Царицын", "Царицын"),
    ("Ежедневно 09:00–21:00 · по записи", "Ежедневно 09:00–21:00 · по записи"),
    ("ежедневно", "ежедневно"),
]


def main() -> None:
    for path in ROOT.rglob("*"):
        if path.suffix not in TEXT_SUFFIXES or path.is_dir():
            continue
        if "node_modules" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        orig = text
        for old, new in REPLACEMENTS:
            text = text.replace(old, new)
        if text != orig:
            path.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()