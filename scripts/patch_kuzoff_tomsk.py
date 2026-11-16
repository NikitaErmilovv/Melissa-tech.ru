#!/usr/bin/env python3
"""Post-process kuzoff-tomsk: 2GIS reviews, services, contacts (no 3D configurator)."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "kuzoff-tomsk"
FIRM_ID = "70000001061703033"

sys.path.insert(0, str(ROOT / "scripts"))
from fetch_2gis_reviews import fetch_branch_reviews  # noqa: E402

HOME_SERVICES = [
    ("anticor", "КУЗОВНОЙ РЕМОНТ", "01-client.jpg"),
    ("ceramic", "ПОКРАСКА", "03-client.jpg"),
    ("polish", "ПОЛИРОВКА", "04-client.jpg"),
    ("ppf", "РЕМОНТ ВМЯТИН", "06-client.jpg"),
    ("wash", "ДЕТЕЙЛИНГ", "08-client.jpg"),
]

CATALOG = [
    ("anticor", "Кузовной ремонт", "Восстановление геометрии и элементов кузова."),
    ("ceramic", "Покраска автомобилей", "Локальная и полная покраска, подбор цвета."),
    ("polish", "Полировка", "Полировка ЛКП и оптики, подготовка кузова."),
    ("ppf", "Ремонт вмятин", "Кузовные работы, удаление вмятин."),
    ("engine-bay", "Сварочные работы", "Сварка и ремонт кузовных элементов."),
    ("wash", "Детейлинг", "Мойка, уход за салоном и финишная подготовка."),
]


def patch_reviews() -> None:
    reviews = fetch_branch_reviews(FIRM_ID, limit=12)
    (SITE / "data" / "reviews-2gis.json").write_text(
        json.dumps(reviews, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def patch_services_pages() -> None:
    incoming = SITE / "img" / "works" / "incoming" / "kuzoff"
    idx = SITE / "index.html"
    text = idx.read_text(encoding="utf-8")
    lines = [
        f"    <a class=\"photo\" href=\"services/{slug}.html\" "
        f"style=\"background-image:url('img/works/incoming/kuzoff/{img}')\"><span class=\"tag\">{tag}</span></a>"
        for slug, tag, img in HOME_SERVICES
    ]
    block = '  <div class="photo-strip photo-strip--services photo-strip--home">\n' + "\n".join(lines) + "\n  </div>"
    text = re.sub(
        r'<div class="photo-strip photo-strip--services photo-strip--home">.*?</div>',
        block,
        text,
        count=1,
        flags=re.S,
    )
    idx.write_text(text, encoding="utf-8")

    svc = SITE / "services.html"
    html = svc.read_text(encoding="utf-8")
    rows = []
    for i, (slug, title, lead) in enumerate(CATALOG, 1):
        rows.append(
            f'    <a class="service-row" href="services/{slug}.html" id="svc-{i:02d}">'
            f'<div class="idx">{i:02d}</div><div><h3>{title}</h3>'
            f'<div class="service-desc"><p class="service-lead">{lead}</p></div></div>'
            f'<div class="cost">после осмотра</div></a>'
        )
    html = re.sub(
        r'<div class="service-list">.*?</div>\n</section>',
        '<div class="service-list">\n' + "\n".join(rows) + "\n  </div>\n</section>",
        html,
        count=1,
        flags=re.S,
    )
    svc.write_text(html, encoding="utf-8")
    _ = incoming  # client photos are added manually to img/works/incoming/kuzoff/


def patch_contacts() -> None:
    path = SITE / "contacts-config.js"
    path.write_text(
        """window.STUDIO_MESSENGERS = {
  wa: "79009211001",
  tg: "+79009211001",
  max: "",
  defaultMessage: "Здравствуйте! Хочу записаться в KuzOff.",
};

window.STUDIO_CONTACTS = {
  addressLine: "г. Томск, ул. Пушкина, 10/1, 634003",
  hoursLine: "По предварительной записи · 11:00–20:00",
  mapLat: 56.495371,
  mapLon: 84.95699,
  gisFirm: "https://2gis.ru/tomsk/firm/70000001061703033",
  yandexMaps: "https://yandex.ru/maps/org/kuzoff/40290939410/?ll=84.956929%2C56.495494&z=16",
  phones: [
    { tel: "+79009211001", display: "+7 (900) 921-10-01" },
    { tel: "+79234088056", display: "+7 (923) 408-80-56" },
  ],
};
""",
        encoding="utf-8",
    )


def patch_gallery_manifest() -> None:
    incoming = SITE / "img" / "works" / "incoming" / "kuzoff"
    files = sorted(
        f"img/works/incoming/kuzoff/{p.name}"
        for p in incoming.glob("*")
        if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
    )
    (SITE / "data" / "gallery-manifest.json").write_text(
        json.dumps({"files": files}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    patch_reviews()
    patch_services_pages()
    patch_contacts()
    patch_gallery_manifest()
    print("kuzoff-tomsk patched (reviews, services, contacts)")


if __name__ == "__main__":
    main()