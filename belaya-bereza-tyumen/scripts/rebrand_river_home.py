#!/usr/bin/env python3
"""Rebrand belaya-bereza-tyumen copy → Белая береза (2GIS 70000001117255594)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT_SUFFIXES = {".html", ".js", ".json", ".md", ".txt", ".py", ".css", ".bat"}

GIS = "https://2gis.ru/tyumen/firm/70000001117255594"
FIRM_ID = "70000001117255594"
LAT, LON = "57.215415", "65.509153"
MAP_DESKTOP = (
    f"https://static.maps.2gis.com/1.0?s=880x450&amp;c={LAT},{LON}&amp;z=16&amp;pt={LAT},{LON}~k:p"
)
MAP_MOBILE = (
    f"https://static.maps.2gis.com/1.0?s=720x720&amp;c={LAT},{LON}&amp;z=16&amp;pt={LAT},{LON}~k:p"
)
MAP_ALT = "Карта 2ГИС — Тюмень, ул. Степана Третьякова, 58а"

REPLACEMENTS = [
    ("belaya-bereza-tyumen", "belaya-bereza-tyumen"),
    ("https://2gis.ru/tyumen/firm/70000001117255594", GIS),
    ("70000001117255594", FIRM_ID),
    ("57.215415,65.509153", f"{LAT},{LON}"),
    ("57.215415,65.509153", f"{LAT},{LON}"),
    ("+79829187031", "+79829187031"),
    ("+7 (982) 918-70-31", "+7 (982) 918-70-31"),
    ("79829187031", "79829187031"),
    ("RIVER_HOME_SITE_REVIEWS", "RIVER_HOME_SITE_REVIEWS"),
    ("БЕЛАЯ БЕРЕЗА", "БЕЛАЯ БЕРЕЗА"),
    ("«Белая береза»", "«Белая береза»"),
    ("Белая береза", "Белая береза"),
    ("Белая береза", "Белая береза"),
    ("гостевого дома", "гостевого дома"),
    ("belaya-bereza-", "belaya-bereza-"),
    ("map-belaya-bereza-desktop.jpg", MAP_DESKTOP),
    ("map-belaya-bereza-mobile.jpg", MAP_MOBILE),
    ("data-src=\"../img/" + MAP_DESKTOP, f"src=\"{MAP_DESKTOP}"),
    ("data-src=\"img/" + MAP_DESKTOP, f"src=\"{MAP_DESKTOP}"),
    ("Тюмень, ул. Степана Третьякова, 58а", "Тюмень, ул. Степана Третьякова, 58а"),
    ("Тюмень", "Тюмень"),
    ("Тюмень", "Тюмень"),
    ("58а", "58а"),
    ("Солнечная", "Солнечная"),
    ("Тюмень", "Тюмень"),
    ("Тюмень", "Тюмень"),
    ("Ждём вас в Тюмень, мкр. Лазурные берега.", "Ждём вас в Тюмень, мкр. Лазурные берега."),
    ("Ждём вас в Тюмень, мкр. Лазурные берега.", "Ждём вас в Тюмень, мкр. Лазурные берега."),
    ("Гостевой дом ·", "Гостевой дом ·"),
    ("Гостевой дом ", "Гостевой дом "),
    ("по записи", "по записи"),
    ("По предварительной записи", "По предварительной записи"),
    ('id="stat-reviews">2', 'id="stat-reviews">2'),
    (
        "Гостевой дом в стиле гостевого дома, Тюмень, ул. Степана Третьякова, 58а — 4 комнаты, до 6 гостей, два этажа. Терраса, пергола, зона барбекю с мангалом; с середины мая — подогреваемый джакузи. Бронируем от суток.",
        "Коттедж «Белая береза» в Тюмени, ул. Степана Третьякова, 58а — загородный дом для семейного отдыха и спокойных выходных. Бронирование по записи — звоните или пишите.",
    ),
    (
        "Гостевой дом «Белая береза» на ул. Радужной, 1.",
        "«Белая береза», Тюмень, ул. Степана Третьякова, 58а.",
    ),
    (
        "Сообщение уйдёт на +7 (982) 918-70-31 — номер Белая береза (как в 2ГИС).",
        "Сообщение уйдёт на +7 (982) 918-70-31 — номер Белая береза (как в 2ГИС).",
    ),
    ('alt="Карта 2ГИС — Тюмень, ул. Степана Третьякова, 58а"', f'alt="{MAP_ALT}"'),
    ("address-map-detail-label--brand\">Коттедж", "address-map-detail-label--brand\">Гостевой дом"),
    ('<b id="stat-reviews">2</b>', '<b id="stat-reviews">2</b>'),
]

MAP_LAZY = [
    (
        'loading="lazy" decoding="async" data-src="../img/map-belaya-bereza-desktop.jpg"',
        f'loading="lazy" decoding="async" src="{MAP_DESKTOP}"',
    ),
    (
        'loading="lazy" decoding="async" data-src="../img/map-belaya-bereza-mobile.jpg"',
        f'loading="lazy" decoding="async" src="{MAP_MOBILE}" alt="{MAP_ALT}"',
    ),
    (
        'loading="lazy" decoding="async" data-src="img/map-belaya-bereza-desktop.jpg"',
        f'loading="lazy" decoding="async" src="{MAP_DESKTOP}"',
    ),
    (
        'loading="lazy" decoding="async" data-src="img/map-belaya-bereza-mobile.jpg"',
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