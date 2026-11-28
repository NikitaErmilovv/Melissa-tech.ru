#!/usr/bin/env python3
"""Rebrand river-home-terentievo copy → River home (2GIS 70000001100637525)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEXT_SUFFIXES = {".html", ".js", ".json", ".md", ".txt", ".py", ".css", ".bat"}

GIS = "https://2gis.ru/krasnoyarsk/firm/70000001100637525"
FIRM_ID = "70000001100637525"
LAT, LON = "56.118296", "93.291262"
MAP_DESKTOP = (
    f"https://static.maps.2gis.com/1.0?s=880x450&amp;c={LAT},{LON}&amp;z=16&amp;pt={LAT},{LON}~k:p"
)
MAP_MOBILE = (
    f"https://static.maps.2gis.com/1.0?s=720x720&amp;c={LAT},{LON}&amp;z=16&amp;pt={LAT},{LON}~k:p"
)
MAP_ALT = "Карта 2ГИС — д. Терентьево, Солнечная ул., 14"

REPLACEMENTS = [
    ("river-home-terentievo", "river-home-terentievo"),
    ("https://2gis.ru/krasnoyarsk/firm/70000001100637525", GIS),
    ("70000001100637525", FIRM_ID),
    ("56.118296,93.291262", f"{LAT},{LON}"),
    ("56.118296,93.291262", f"{LAT},{LON}"),
    ("+79835045116", "+79835045116"),
    ("+7 (983) 504-51-16", "+7 (983) 504-51-16"),
    ("79835045116", "79835045116"),
    ("RIVER_HOME_SITE_REVIEWS", "RIVER_HOME_SITE_REVIEWS"),
    ("RIVER HOME", "RIVER HOME"),
    ("«River home»", "«River home»"),
    ("River home", "River home"),
    ("River home", "River home"),
    ("гостевого дома", "гостевого дома"),
    ("river-home-", "river-home-"),
    ("map-river-home-desktop.jpg", MAP_DESKTOP),
    ("map-river-home-mobile.jpg", MAP_MOBILE),
    ("data-src=\"../img/" + MAP_DESKTOP, f"src=\"{MAP_DESKTOP}"),
    ("data-src=\"img/" + MAP_DESKTOP, f"src=\"{MAP_DESKTOP}"),
    ("д. Терентьево, Солнечная ул., 14", "д. Терентьево, Солнечная ул., 14"),
    ("д. Терентьево", "д. Терентьево"),
    ("Терентьево", "Терентьево"),
    ("Солнечная ул., 14", "Солнечная ул., 14"),
    ("Солнечная", "Солнечная"),
    ("Терентьево", "Терентьево"),
    ("Терентьево", "Терентьево"),
    ("Ждём вас в д. Терентьево, мкр. Лазурные берега.", "Ждём вас в д. Терентьево, мкр. Лазурные берега."),
    ("Ждём вас в д. Терентьево, мкр. Лазурные берега.", "Ждём вас в д. Терентьево, мкр. Лазурные берега."),
    ("Гостевой дом ·", "Гостевой дом ·"),
    ("Гостевой дом ", "Гостевой дом "),
    ("24–7", "24–7"),
    ("Круглосуточно", "Круглосуточно"),
    ('id="stat-reviews">29', 'id="stat-reviews">29'),
    (
        "Гостевой дом в стиле гостевого дома, д. Терентьево, Солнечная ул., 14 — 4 комнаты, до 6 гостей, два этажа. Терраса, пергола, зона барбекю с мангалом; с середины мая — подогреваемый джакузи. Бронируем от суток.",
        "Гостевой дом River home в д. Терентьево, Солнечная ул., 14 — уютный домик у реки, сауна и купель-чан, мангальная зона и место у костра. Круглосуточно, бронь от суток. Скидка 10% при бронировании дома и купели.",
    ),
    (
        "Гостевой дом «River home» на ул. Радужной, 1.",
        "«River home», д. Терентьево, Солнечная ул., 14.",
    ),
    (
        "Сообщение уйдёт на +7 (983) 504-51-16 — номер River home (как в 2ГИС).",
        "Сообщение уйдёт на +7 (983) 504-51-16 — номер River home (как в 2ГИС).",
    ),
    ('alt="Карта 2ГИС — д. Терентьево, Солнечная ул., 14"', f'alt="{MAP_ALT}"'),
    ("address-map-detail-label--brand\">Коттедж", "address-map-detail-label--brand\">Гостевой дом"),
    ('<b id="stat-reviews">29</b>', '<b id="stat-reviews">29</b>'),
]

MAP_LAZY = [
    (
        'loading="lazy" decoding="async" data-src="../img/map-river-home-desktop.jpg"',
        f'loading="lazy" decoding="async" src="{MAP_DESKTOP}"',
    ),
    (
        'loading="lazy" decoding="async" data-src="../img/map-river-home-mobile.jpg"',
        f'loading="lazy" decoding="async" src="{MAP_MOBILE}" alt="{MAP_ALT}"',
    ),
    (
        'loading="lazy" decoding="async" data-src="img/map-river-home-desktop.jpg"',
        f'loading="lazy" decoding="async" src="{MAP_DESKTOP}"',
    ),
    (
        'loading="lazy" decoding="async" data-src="img/map-river-home-mobile.jpg"',
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