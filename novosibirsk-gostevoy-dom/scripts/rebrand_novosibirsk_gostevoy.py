#!/usr/bin/env python3
"""Rebrand novosibirsk-gostevoy-dom copy → novosibirsk-gostevoy-dom (2GIS 70000001099867206)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT_SUFFIXES = {".html", ".js", ".json", ".md", ".txt", ".py", ".css", ".bat"}

REPLACEMENTS = [
    ("novosibirsk-gostevoy-dom", "novosibirsk-gostevoy-dom"),
    ("GOSTEVOY_DOM_SITE_REVIEWS", "GOSTEVOY_DOM_SITE_REVIEWS"),
    ("map-gostevoy-dom-desktop", "map-gostevoy-dom-desktop"),
    ("map-gostevoy-dom-mobile", "map-gostevoy-dom-mobile"),
    ("https://2gis.ru/novosibirsk/firm/70000001099867206", "https://2gis.ru/novosibirsk/firm/70000001099867206"),
    ("70000001099867206", "70000001099867206"),
    ("+7 (983) 306-09-02", "+7 (983) 306-09-02"),
    ("+79833060902", "+79833060902"),
    ("79833060902", "79833060902"),
    ("«Гостевой дом»", "«Гостевой дом»"),
    ("гостевого дома", "гостевого дома"),
    ("Гостевой дом", "Гостевой дом"),
    ("гостевой дом", "гостевой дом"),
    ("ГОСТЕВОЙ ДОМ", "ГОСТЕВОЙ ДОМ"),
    ("пос. Мичуринский, Береговой квартал, 39", "пос. Мичуринский, Береговой квартал, 39"),
    ("на Береговом квартале, 39", "на Береговом квартале, 39"),
    ("Береговой квартал, 39", "Береговой квартал, 39"),
    ("пос. Мичуринский", "пос. Мичуринский"),
    ("Мичуринский", "Мичуринский"),
    ("Ежедневно 09:00–22:00 · по записи", "Ежедневно 09:00–22:00 · по записи"),
    ("09:00–22:00", "09:00–22:00"),
    ("09–22", "09–22"),
    ("ngd-", "ngd-"),
    ("ngd_", "ngd_"),
    ("Новосибирске", "Новосибирске"),
    ("Новосибирска", "Новосибирска"),
]


def main() -> None:
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix not in TEXT_SUFFIXES:
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