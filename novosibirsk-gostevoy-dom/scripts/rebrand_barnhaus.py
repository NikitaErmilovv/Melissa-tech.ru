#!/usr/bin/env python3
"""One-off rebrand pass for novosibirsk-gostevoy-dom copy."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT_SUFFIXES = {".html", ".js", ".json", ".md", ".txt", ".py", ".css"}

REPLACEMENTS = [
    ("novosibirsk-gostevoy-dom", "novosibirsk-gostevoy-dom"),
    ("map-gostevoy-dom-desktop", "map-gostevoy-dom-desktop"),
    ("map-gostevoy-dom-mobile", "map-gostevoy-dom-mobile"),
    ("https://2gis.ru/novosibirsk/firm/70000001099867206", "https://2gis.ru/novosibirsk/firm/70000001099867206"),
    ("70000001099867206", "70000001099867206"),
    ("GOSTEVOY_DOM_SITE_REVIEWS", "GOSTEVOY_DOM_SITE_REVIEWS"),
    ("+7 (983) 306-09-02", "+7 (983) 306-09-02"),
    ("+79833060902", "+79833060902"),
    ("79833060902", "79833060902"),
    ("ГОСТЕВОЙ ДОМ", "ГОСТЕВОЙ ДОМ"),
    ("Гостевой дом", "Гостевой дом"),
    ("", ""),
    ("пос. Мичуринский, Береговой квартал, 39", "пос. Мичуринский, Береговой квартал, 39"),
    ("пос. Мичуринский, Береговой квартал, 39", "пос. Мичуринский, Береговой квартал, 39"),
    ("пос. Мичуринский", "пос. Мичуринский"),
    ("Мичуринский", "Мичуринский"),
    ("Ежедневно 09:00–22:00 · по записи", "Ежедневно 09:00–22:00 · по записи"),
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