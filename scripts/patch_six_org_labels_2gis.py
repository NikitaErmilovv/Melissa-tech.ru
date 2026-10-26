#!/usr/bin/env python3
"""Replace generic «детейлинг-центр» labels with 2GIS org types for six Prime clones."""

from __future__ import annotations

import re
from pathlib import Path

from scaffold_six_from_prime38 import SITES, enrich_site

ROOT = Path(__file__).resolve().parents[1]

# Как в карточке 2ГИС (тип организации)
ORG_TYPES: dict[str, dict[str, str]] = {
    "okleyka07-avtotekhtsentr-bittsa": {
        "type_upper": "АВТОТЕХЦЕНТР",
        "type_gen": "АВТОТЕХЦЕНТРА",
        "type_lower": "автотехцентра",
        "hero_h1": 'АВТОТЕХ<br>ЦЕНТР<br><span class="accent">ОКЛЕЙКА07</span>',
        "about_h1": 'АВТОТЕХЦЕНТР<br><span class="accent">ОКЛЕЙКА07</span>',
        "services_h1": 'АВТОТЕХЦЕНТР<br><span class="accent">БИТЦА</span>',
        "contact_h2": "АВТОТЕХЦЕНТР<br>ОКЛЕЙКА07",
        "gallery_p": "Фото работ автотехцентра: мойка, полировка, защита и уход за салоном.",
        "album_h2": "РАБОТЫ АВТОТЕХЦЕНТРА",
        "title_type": "автотехцентр",
    },
    "lobavto-nizhniy-novgorod": {
        "type_upper": "ДЕТЕЙЛИНГ",
        "type_gen": "ДЕТЕЙЛИНГА",
        "type_lower": "детейлинга",
        "hero_h1": 'ДЕТЕЙЛИНГ<br><span class="accent">ЛОБАВТО</span>',
        "about_h1": 'ДЕТЕЙЛИНГ<br><span class="accent">ЛОБАВТО</span>',
        "services_h1": 'ДЕТЕЙЛИНГ<br><span class="accent">НИЖНИЙ НОВГОРОД</span>',
        "contact_h2": "ДЕТЕЙЛИНГ<br>ЛОБАВТО",
        "gallery_p": "Фото работ студии детейлинга: мойка, полировка, защита и уход за салоном.",
        "album_h2": "РАБОТЫ ДЕТЕЙЛИНГА",
        "title_type": "детейлинг",
    },
    "konkretika-detailing-omsk": {
        "type_upper": "СТУДИЯ ДЕТЕЙЛИНГА И АВТОСВЕТА",
        "type_gen": "СТУДИИ ДЕТЕЙЛИНГА И АВТОСВЕТА",
        "type_lower": "студии детейлинга и автосвета",
        "hero_h1": (
            'СТУДИЯ ДЕТЕЙЛИНГА<br>И АВТОСВЕТА<br><span class="accent">КОНКРЕТИКА</span>'
        ),
        "about_h1": (
            'СТУДИЯ ДЕТЕЙЛИНГА<br>И АВТОСВЕТА<br><span class="accent">КОНКРЕТИКА</span>'
        ),
        "services_h1": 'СТУДИЯ ДЕТЕЙЛИНГА<br><span class="accent">ОМСК</span>',
        "contact_h2": "СТУДИЯ ДЕТЕЙЛИНГА И АВТОСВЕТА<br>КОНКРЕТИКА",
        "gallery_p": "Фото студии детейлинга и автосвета: мойка, полировка, защита и уход за салоном.",
        "album_h2": "РАБОТЫ СТУДИИ",
        "title_type": "студия детейлинга и автосвета",
    },
    "pryamye-ruki-55-omsk": {
        "type_upper": "АВТОЦЕНТР",
        "type_gen": "АВТОЦЕНТРА",
        "type_lower": "автоцентра",
        "hero_h1": 'АВТО<br>ЦЕНТР<br><span class="accent">ПРЯМЫЕ РУКИ 55</span>',
        "about_h1": 'АВТОЦЕНТР<br><span class="accent">ПРЯМЫЕ РУКИ 55</span>',
        "services_h1": 'АВТОЦЕНТР<br><span class="accent">ОМСК</span>',
        "contact_h2": "АВТОЦЕНТР<br>ПРЯМЫЕ РУКИ 55",
        "gallery_p": "Фото работ автоцентра: мойка, полировка, защита и уход за салоном.",
        "album_h2": "РАБОТЫ АВТОЦЕНТРА",
        "title_type": "автоцентр",
    },
    "rp-detailing-tolyatti": {
        "type_upper": "ДЕТЕЙЛИНГ-СТУДИЯ",
        "type_gen": "ДЕТЕЙЛИНГ-СТУДИИ",
        "type_lower": "детейлинг-студии",
        "hero_h1": 'ДЕТЕЙЛИНГ-<br>СТУДИЯ<br><span class="accent">РП</span>',
        "about_h1": 'ДЕТЕЙЛИНГ-СТУДИЯ<br><span class="accent">РП</span>',
        "services_h1": 'ДЕТЕЙЛИНГ-СТУДИЯ<br><span class="accent">ТОЛЬЯТТИ</span>',
        "contact_h2": "ДЕТЕЙЛИНГ-СТУДИЯ<br>РП",
        "gallery_p": "Фото работ детейлинг-студии: мойка, полировка, защита и уход за салоном.",
        "album_h2": "РАБОТЫ ДЕТЕЙЛИНГ-СТУДИИ",
        "title_type": "детейлинг-студия",
    },
    "inavto-avtoservis-irkutsk": {
        "type_upper": "АВТОСЕРВИС",
        "type_gen": "АВТОСЕРВИСА",
        "type_lower": "автосервиса",
        "hero_h1": 'АВТО<br>СЕРВИС<br><span class="accent">ИНАВТО</span>',
        "about_h1": 'АВТОСЕРВИС<br><span class="accent">ИНАВТО</span>',
        "services_h1": 'АВТОСЕРВИС<br><span class="accent">ИРКУТСК</span>',
        "contact_h2": "АВТОСЕРВИС<br>ИНАВТО",
        "gallery_p": "Фото работ автосервиса: мойка, полировка, защита и уход за салоном.",
        "album_h2": "РАБОТЫ АВТОСЕРВИСА",
        "title_type": "автосервис",
    },
}


def patch_file(path: Path, site: dict, org: dict) -> None:
    text = path.read_text(encoding="utf-8")
    name = path.name

    # Hero index
    if name == "index.html":
        text = re.sub(
            r"<h1>ДЕТЕЙЛИНГ<br>ЦЕНТР<br><span class=\"accent\">[^<]+</span></h1>",
            f"<h1>{org['hero_h1']}</h1>",
            text,
            count=1,
        )
        text = re.sub(
            r"<title>[^<]+</title>",
            f"<title>{site['brand']} — {org['title_type']} {site['city']}</title>",
            text,
            count=1,
        )

    if name == "about.html":
        text = re.sub(
            r"<h1>ДЕТЕЙЛИНГ-ЦЕНТР<br><span class=\"accent\">[^<]+</span></h1>",
            f"<h1>{org['about_h1']}</h1>",
            text,
            count=1,
        )
        text = re.sub(
            r'<p class="subpage-hero-lead">[^<]*(?:<[^>]+>[^<]*)*</p>',
            f'<p class="subpage-hero-lead">{site["about_lead"]}</p>',
            text,
            count=1,
        )

    if name == "services.html":
        text = re.sub(
            r"<h1>ДЕТЕЙЛИНГ-ЦЕНТР<br><span class=\"accent\">[^<]+</span></h1>",
            f"<h1>{org['services_h1']}</h1>",
            text,
            count=1,
        )

    if name == "contact.html":
        text = re.sub(
            r"<h2>ДЕТЕЙЛИНГ-ЦЕНТР<br>[^<]+</h2>",
            f"<h2>{org['contact_h2']}</h2>",
            text,
            count=1,
        )

    if name == "gallery.html":
        text = re.sub(
            r"<p>Фото работ детейлинг-центра:[^<]+</p>",
            f"<p>{org['gallery_p']}</p>",
            text,
            count=1,
        )
        text = re.sub(
            r"<h2>РАБОТЫ ДЕТЕЙЛИНГ-ЦЕНТРА</h2>",
            f"<h2>{org['album_h2']}</h2>",
            text,
            count=1,
        )

    # Footer line on all pages
    text = re.sub(
        r"<span>ДЕТЕЙЛИНГ · [^<]+</span>",
        f"<span>{org['type_upper']} · {site['city_upper']}</span>",
        text,
    )

    # Residual generic phrases
    text = text.replace("ДЕТЕЙЛИНГ-ЦЕНТР", org["type_upper"])
    text = text.replace("детейлинг-центра", org["type_lower"])
    text = text.replace("детейлинг-центр", org["title_type"])

    path.write_text(text, encoding="utf-8")


def main() -> None:
    for raw in SITES:
        site = enrich_site(raw)
        org = ORG_TYPES[site["slug"]]
        dest = ROOT / site["slug"]
        for path in dest.rglob("*.html"):
            patch_file(path, site, org)
        print(site["slug"], "→", org["type_upper"])


if __name__ == "__main__":
    main()
