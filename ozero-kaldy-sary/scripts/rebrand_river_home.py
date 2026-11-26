#!/usr/bin/env python3
"""Rebrand ozero-kaldy-sary copy → На берегу озера Калды (2GIS 70000001101369405)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT_SUFFIXES = {".html", ".js", ".json", ".md", ".txt", ".py", ".css", ".bat"}

GIS = "https://2gis.ru/chelyabinsk/firm/70000001101369405"
FIRM_ID = "70000001101369405"
LAT, LON = "55.688073", "61.321148"
MAP_DESKTOP = (
    f"https://static.maps.2gis.com/1.0?s=880x450&amp;c={LAT},{LON}&amp;z=16&amp;pt={LAT},{LON}~k:p"
)
MAP_MOBILE = (
    f"https://static.maps.2gis.com/1.0?s=720x720&amp;c={LAT},{LON}&amp;z=16&amp;pt={LAT},{LON}~k:p"
)
MAP_ALT = "Карта 2ГИС — с. Сары, Полевая ул., 35"

REPLACEMENTS = [
    ("ozero-kaldy-sary", "ozero-kaldy-sary"),
    ("https://2gis.ru/chelyabinsk/firm/70000001101369405", GIS),
    ("70000001101369405", FIRM_ID),
    ("55.688073,61.321148", f"{LAT},{LON}"),
    ("55.688073,61.321148", f"{LAT},{LON}"),
    ("+79229999275", "+79229999275"),
    ("+7 (922) 999-92-75", "+7 (922) 999-92-75"),
    ("79229999275", "79229999275"),
    ("RIVER_HOME_SITE_REVIEWS", "RIVER_HOME_SITE_REVIEWS"),
    ("ОЗЕРО КАЛДЫ", "ОЗЕРО КАЛДЫ"),
    ("«На берегу озера Калды»", "«На берегу озера Калды»"),
    ("На берегу озера Калды", "На берегу озера Калды"),
    ("На берегу озера Калды", "На берегу озера Калды"),
    ("гостевого дома", "гостевого дома"),
    ("ozero-kaldy-", "ozero-kaldy-"),
    ("map-ozero-kaldy-desktop.jpg", MAP_DESKTOP),
    ("map-ozero-kaldy-mobile.jpg", MAP_MOBILE),
    ("data-src=\"../img/" + MAP_DESKTOP, f"src=\"{MAP_DESKTOP}"),
    ("data-src=\"img/" + MAP_DESKTOP, f"src=\"{MAP_DESKTOP}"),
    ("с. Сары, Полевая ул., 35", "с. Сары, Полевая ул., 35"),
    ("с. Сары", "с. Сары"),
    ("с. Сары", "с. Сары"),
    ("35", "35"),
    ("Солнечная", "Солнечная"),
    ("с. Сары", "с. Сары"),
    ("с. Сары", "с. Сары"),
    ("Ждём вас в с. Сары, мкр. Лазурные берега.", "Ждём вас в с. Сары, мкр. Лазурные берега."),
    ("Ждём вас в с. Сары, мкр. Лазурные берега.", "Ждём вас в с. Сары, мкр. Лазурные берега."),
    ("Гостевой дом ·", "Гостевой дом ·"),
    ("Гостевой дом ", "Гостевой дом "),
    ("по записи", "по записи"),
    ("По предварительной записи", "По предварительной записи"),
    ('id="stat-reviews">8', 'id="stat-reviews">8'),
    (
        "Гостевой дом в стиле гостевого дома, с. Сары, Полевая ул., 35 — 4 комнаты, до 6 гостей, два этажа. Терраса, пергола, зона барбекю с мангалом; с середины мая — подогреваемый джакузи. Бронируем от суток.",
        "Дом с чаном и баней на берегу озера Калды, с. Сары, Полевая ул., 35 — уютный отдых у воды, парная, купель и тёплая территория. Бронирование по записи — звоните или пишите.",
    ),
    (
        "Гостевой дом «На берегу озера Калды» на ул. Радужной, 1.",
        "«На берегу озера Калды», с. Сары, Полевая ул., 35.",
    ),
    (
        "Сообщение уйдёт на +7 (922) 999-92-75 — номер На берегу озера Калды (как в 2ГИС).",
        "Сообщение уйдёт на +7 (922) 999-92-75 — номер На берегу озера Калды (как в 2ГИС).",
    ),
    ('alt="Карта 2ГИС — с. Сары, Полевая ул., 35"', f'alt="{MAP_ALT}"'),
    ("address-map-detail-label--brand\">Коттедж", "address-map-detail-label--brand\">Гостевой дом"),
    ('<b id="stat-reviews">8</b>', '<b id="stat-reviews">8</b>'),
]

MAP_LAZY = [
    (
        'loading="lazy" decoding="async" data-src="../img/map-ozero-kaldy-desktop.jpg"',
        f'loading="lazy" decoding="async" src="{MAP_DESKTOP}"',
    ),
    (
        'loading="lazy" decoding="async" data-src="../img/map-ozero-kaldy-mobile.jpg"',
        f'loading="lazy" decoding="async" src="{MAP_MOBILE}" alt="{MAP_ALT}"',
    ),
    (
        'loading="lazy" decoding="async" data-src="img/map-ozero-kaldy-desktop.jpg"',
        f'loading="lazy" decoding="async" src="{MAP_DESKTOP}"',
    ),
    (
        'loading="lazy" decoding="async" data-src="img/map-ozero-kaldy-mobile.jpg"',
        f'loading="lazy" decoding="async" src="{MAP_MOBILE}" alt="{MAP_ALT}"',
    ),
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
        for old, new in MAP_LAZY:
            text = text.replace(old, new)
        if text != orig:
            path.write_text(text, encoding="utf-8")


if __name__ == "__main__":
    main()