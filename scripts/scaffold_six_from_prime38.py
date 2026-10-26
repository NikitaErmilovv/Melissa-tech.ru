#!/usr/bin/env python3
"""Six Prime.38 copies with 2GIS data; home layout unchanged, services text per org."""

from __future__ import annotations

import json
import re
import shutil
import urllib.error
import urllib.request
from pathlib import Path

from fetch_2gis_firm_photos import (
    download,
    fetch_html,
    patch_home_hero,
    patch_index_works,
    patch_service_tiles,
    photo_urls_from_api,
    photo_urls_from_html,
)
from fetch_2gis_reviews import fetch_branch_reviews
from generate_gallery_manifest import write_manifest
from sync_gallery_album import write_gallery_load

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "prime38-detailing-angarsk"

PRIME = {
    "slug": "prime38-detailing-angarsk",
    "photo_folder": "prime38",
    "brand": "Прайм.38",
    "logo_mark": "ПРАЙМ.",
    "logo_word": "38",
    "hero_accent": "ПРАЙМ.38",
    "city": "Ангарск",
    "city_upper": "АНГАРСК",
    "city_slug": "angarsk",
    "firm_id": "70000001061012787",
    "phone_tel": "+79500913882",
    "phone_display": "+7 (950) 091-38-82",
    "wa": "79500913882",
    "address": "г. Ангарск, 253-й квартал, стр. 19",
    "schedule": "По предварительной записи · 10:00–20:00",
    "map_lat": 52.494004,
    "map_lon": 103.847366,
    "port": 8126,
    "rating": "5.0",
    "reviews": "45",
    "years": "5+",
    "hero_lead": (
        "Детейлинг-центр в Ангарске: мойка, полировка, защитные покрытия, антикор и тонировка по записи."
    ),
    "about_lead": (
        "«Прайм.38» — детейлинг-центр в 253-м квартале Ангарска. "
        "Мойка и детейлинг, полировка, защитные покрытия и плёнка, тонировка, химчистка салона и антикор. "
        "Работаем по предварительной записи с 10:00 до 20:00 — звоните или пишите в мессенджерах."
    ),
    "firm_url": "https://2gis.ru/angarsk/firm/70000001061012787",
    "map_c": "52.494004,103.847366",
    "map_alt": "Карта 2ГИС — г. Ангарск, 253-й квартал, стр. 19",
    "default_message": "Здравствуйте! Хочу записаться в Прайм.38.",
}

SITES: list[dict] = [
    {
        "slug": "okleyka07-avtotekhtsentr-bittsa",
        "photo_folder": "okleyka07",
        "brand": "Оклейка07",
        "logo_mark": "ОКЛЕЙКА",
        "logo_word": "07",
        "hero_accent": "ОКЛЕЙКА07",
        "city": "пос. Битца",
        "city_upper": "БИТЦА",
        "city_slug": "moscow",
        "firm_id": "70000001040721221",
        "address": "Московская обл., пос. Битца, Варшавское шоссе, 21-й км, 23 стр. 6",
        "port": 8130,
        "hero_lead": (
            "Автотехцентр в Битце: оклейка и защита кузова, тонировка стёкол, детейлинг и уход по записи."
        ),
        "about_lead": (
            "«Оклейка07» — автотехцентр на Варшавском шоссе в посёлке Битца. "
            "Оклейка и защита кузова, тонировка, детейлинг и сопутствующие работы. "
            "Запись по телефону или в мессенджерах — уточняйте время визита."
        ),
        "service_leads": {
            "wash": "Комплексная мойка и подготовка кузова под оклейку и защиту.",
            "polish": "Полировка ЛКП и восстановление блеска перед плёнкой.",
            "anticor": "Антикоррозийная обработка скрытых зон и днища.",
            "ppf": "Оклейка защитной плёнкой и винилом — зоны риска и элементы кузова.",
            "tint": "Тонировка стёкол и атермальные плёнки.",
            "interior": "Химчистка салона и уход за интерьером.",
        },
    },
    {
        "slug": "lobavto-nizhniy-novgorod",
        "photo_folder": "lobavto",
        "brand": "Лобавто",
        "logo_mark": "ЛОБ",
        "logo_word": "АВТО",
        "hero_accent": "ЛОБАВТО",
        "city": "Нижний Новгород",
        "city_upper": "НИЖНИЙ НОВГОРОД",
        "city_slug": "n_novgorod",
        "firm_id": "70000001061844477",
        "address": "г. Нижний Новгород, Восточный проезд, 5/1",
        "port": 8131,
        "hero_lead": (
            "Детейлинг в Нижнем Новгороде: мойка, полировка, защита кузова и салона по записи."
        ),
        "about_lead": (
            "«Лобавто» — детейлинг в Ленинском районе Нижнего Новгорода на Восточном проезде. "
            "Уход за кузовом и салоном, полировка, защитные покрытия и тонировка. "
            "Запись по телефону — согласуем время и объём работ."
        ),
    },
    {
        "slug": "konkretika-detailing-omsk",
        "photo_folder": "konkretika",
        "brand": "Конкретика",
        "logo_mark": "КОНКРЕТИКА",
        "logo_word": "",
        "hero_accent": "КОНКРЕТИКА",
        "city": "Омск",
        "city_upper": "ОМСК",
        "city_slug": "omsk",
        "firm_id": "70000001111019672",
        "address": "г. Омск, 4-я улица Челюскинцев, 4/5",
        "port": 8132,
        "hero_lead": (
            "Студия детейлинга и автосвета в Омске: мойка, полировка, защита и тонировка по записи."
        ),
        "about_lead": (
            "«Конкретика» — студия детейлинга и автосвета в Центральном округе Омска. "
            "Детейлинг, полировка, защита кузова, тонировка и работы с оптикой. "
            "Работаем по записи — звоните или пишите в мессенджерах."
        ),
        "service_leads": {
            "polish": "Полировка кузова и восстановление автосвета и оптики.",
        },
    },
    {
        "slug": "pryamye-ruki-55-omsk",
        "photo_folder": "pryamye-ruki",
        "brand": "Прямые руки 55",
        "logo_mark": "ПРЯМЫЕ",
        "logo_word": "РУКИ 55",
        "hero_accent": "ПРЯМЫЕ РУКИ 55",
        "city": "Омск",
        "city_upper": "ОМСК",
        "city_slug": "omsk",
        "firm_id": "70000001069922155",
        "address": "г. Омск, Енисейская улица, 3в",
        "port": 8133,
        "hero_lead": (
            "Автоцентр в Кировском округе Омска: детейлинг, мойка, защита кузова и тонировка."
        ),
        "about_lead": (
            "«Прямые руки 55» — автоцентр на Енисейской в Омске. "
            "Детейлинг, мойка, полировка, защитные покрытия и тонировка. "
            "Запись по телефону — подберём удобное время."
        ),
    },
    {
        "slug": "rp-detailing-tolyatti",
        "photo_folder": "rp",
        "brand": "РП",
        "logo_mark": "РП",
        "logo_word": "",
        "hero_accent": "РП",
        "city": "Тольятти",
        "city_upper": "ТОЛЬЯТТИ",
        "city_slug": "togliatti",
        "firm_id": "70000001067251376",
        "address": "г. Тольятти, Московский проспект, 8 к2",
        "port": 8134,
        "hero_lead": (
            "Детейлинг-студия в Тольятти: мойка, полировка, защита кузова и тонировка по записи."
        ),
        "about_lead": (
            "«РП» — детейлинг-студия на Московском проспекте в Автозаводском районе Тольятти. "
            "Уход за кузовом и салоном, полировка, плёнка и тонировка. "
            "Работаем по записи — звоните или пишите."
        ),
    },
    {
        "slug": "inavto-avtoservis-irkutsk",
        "photo_folder": "inavto",
        "brand": "Инавто",
        "logo_mark": "ИНАВТО",
        "logo_word": "",
        "hero_accent": "ИНАВТО",
        "city": "Иркутск",
        "city_upper": "ИРКУТСК",
        "city_slug": "irkutsk",
        "firm_id": "70000001033075462",
        "address": "г. Иркутск, Набережная Иркута, 1 стр. 4",
        "port": 8135,
        "hero_lead": (
            "Автосервис в Иркутске: кузовной ремонт, покраска, детейлинг и уход за автомобилем."
        ),
        "about_lead": (
            "«Инавто» — автосервис на Набережной Иркута в Свердловском районе Иркутска. "
            "Кузовной ремонт и покраска, детейлинг, мойка и сопутствующие работы. "
            "Запись по телефону — уточняйте время и перечень услуг."
        ),
        "service_leads": {
            "wash": "Мойка и подготовка кузова перед кузовными и малярными работами.",
            "polish": "Полировка ЛКП после ремонта и локальная коррекция.",
            "anticor": "Антикор и защита днища после кузовного ремонта.",
            "ppf": "Защитная плёнка на зоны риска после покраски.",
        },
    },
]


def normalize_phone(raw: str) -> tuple[str, str, str]:
    digits = re.sub(r"\D", "", raw)
    if len(digits) == 11 and digits.startswith("8"):
        digits = "7" + digits[1:]
    if len(digits) == 10:
        digits = "7" + digits
    tel = f"+{digits}"
    disp = f"+7 ({digits[1:4]}) {digits[4:7]}-{digits[7:9]}-{digits[9:11]}"
    wa = digits[1:] if digits.startswith("7") else digits
    return tel, disp, wa


def firm_meta(city_slug: str, firm_id: str) -> dict:
    html = fetch_html(firm_id, city_slug)
    phone_m = re.search(r'"text":"(\+7[^"]+)"', html) or re.search(r"tel:(\+7\d+)", html)
    rating_m = re.search(r'"ratingValue":\s*([\d.]+)', html) or re.search(
        r'"rating":\s*([\d.]+)', html
    )
    reviews_m = re.search(r'"reviewCount":\s*(\d+)', html) or re.search(
        r'"reviewsCount":\s*(\d+)', html
    )
    tel, disp, wa = normalize_phone(phone_m.group(1) if phone_m else "+79000000000")
    rating = rating_m.group(1) if rating_m else "5.0"
    reviews = reviews_m.group(1) if reviews_m else "0"
    return {
        "phone_tel": tel,
        "phone_display": disp,
        "wa": wa,
        "rating": rating,
        "reviews": reviews,
        "html": html,
    }


def enrich_site(site: dict) -> dict:
    meta = firm_meta(site["city_slug"], site["firm_id"])
    site = {**site, **{k: meta[k] for k in ("phone_tel", "phone_display", "wa", "rating", "reviews")}}
    site["schedule"] = site.get("schedule", PRIME["schedule"])
    site["years"] = site.get("years", PRIME["years"])
    site["firm_url"] = f"https://2gis.ru/{site['city_slug']}/firm/{site['firm_id']}"
    site["map_lat"] = site.get("map_lat") or float(
        re.search(r'"lat":\s*([\d.]+)', meta["html"]).group(1)  # type: ignore[union-attr]
    )
    site["map_lon"] = site.get("map_lon") or float(
        re.search(r'"lon":\s*([\d.]+)', meta["html"]).group(1)  # type: ignore[union-attr]
    )
    site["map_c"] = f"{site['map_lat']},{site['map_lon']}"
    site["map_alt"] = f"Карта 2ГИС — {site['address']}"
    site["default_message"] = f"Здравствуйте! Хочу записаться в {site['brand']}."
    return site


def ignore_copy(_dir: str, names: list[str]) -> set[str]:
    skip = {"__pycache__", ".deploy-ping.txt"}
    if _dir.endswith("incoming/prime38"):
        return set(names)
    return {n for n in names if n in skip}


def copy_template(dest: Path) -> None:
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(TEMPLATE, dest, ignore=ignore_copy)


def apply_replacements(text: str, site: dict) -> str:
    pairs: list[tuple[str, str]] = [
        (PRIME["slug"], site["slug"]),
        (PRIME["photo_folder"], site["photo_folder"]),
        (PRIME["brand"], site["brand"]),
        (PRIME["logo_mark"], site["logo_mark"]),
        ('<span class="logo-word">38</span>', f'<span class="logo-word">{site["logo_word"]}</span>'),
        (PRIME["hero_accent"], site["hero_accent"]),
        (PRIME["city"], site["city"]),
        (PRIME["city_upper"], site["city_upper"]),
        (PRIME["city_slug"], site["city_slug"]),
        (PRIME["firm_id"], site["firm_id"]),
        (PRIME["phone_tel"], site["phone_tel"]),
        (PRIME["phone_display"], site["phone_display"]),
        (PRIME["address"], site["address"]),
        (PRIME["schedule"], site["schedule"]),
        (PRIME["hero_lead"], site["hero_lead"]),
        (PRIME["about_lead"], site["about_lead"]),
        (PRIME["firm_url"], site["firm_url"]),
        (PRIME["map_c"], site["map_c"]),
        (PRIME["map_alt"], site["map_alt"]),
        (PRIME["default_message"], site["default_message"]),
        (f"tel:{PRIME['phone_tel']}", f"tel:{site['phone_tel']}"),
        (PRIME["wa"], site["wa"]),
        (f"id=\"stat-reviews\">{PRIME['reviews']}", f'id="stat-reviews">{site["reviews"]}'),
        (
            f'id="stat-reviews-foot">{PRIME["reviews"]}',
            f'id="stat-reviews-foot">{site["reviews"]}',
        ),
        (f'id="stat-rating">{PRIME["rating"]}', f'id="stat-rating">{site["rating"]}'),
        (f"Прайм.38 — детейлинг {PRIME['city']}", f"{site['brand']} — {site['city']}"),
        ("Услуги — Прайм.38", f"Услуги — {site['brand']}"),
        ("О нас — Прайм.38", f"О нас — {site['brand']}"),
        ("Контакты — Прайм.38", f"Контакты — {site['brand']}"),
        ("Работы — Прайм.38", f"Работы — {site['brand']}"),
        ("© 2026 Прайм.38", f"© 2026 {site['brand']}"),
        ("ПРАЙМ.38 · АНГАРСК", f"{site['hero_accent']} · {site['city_upper']}"),
        (f"PORT = {PRIME['port']}", f"PORT = {site['port']}"),
        (PRIME["firm_url"], site["firm_url"]),
        ("incoming/prime38/", f"incoming/{site['photo_folder']}/"),
        ("data-photo-dir=\"prime38\"", f'data-photo-dir="{site["photo_folder"]}"'),
    ]
    for old, new in pairs:
        text = text.replace(old, new)
    return text


def patch_services_html(site: Path, site_cfg: dict) -> None:
    path = site / "services.html"
    if not path.is_file():
        return
    text = path.read_text(encoding="utf-8")
    leads: dict[str, str] = site_cfg.get("service_leads") or {}
    for slug, lead in leads.items():
        text = re.sub(
            rf'(href="services/{slug}\.html"[^>]*>[\s\S]*?<p class="service-lead">)([^<]*)(</p>)',
            rf"\1{lead}\3",
            text,
            count=1,
        )
    path.write_text(text, encoding="utf-8")


def patch_service_pages(site_dir: Path, site_cfg: dict) -> None:
    leads: dict[str, str] = site_cfg.get("service_leads") or {}
    for slug, lead in leads.items():
        p = site_dir / "services" / f"{slug}.html"
        if not p.is_file():
            continue
        text = p.read_text(encoding="utf-8")
        text = re.sub(
            r'(<p class="service-lead">)([^<]*)(</p>)',
            rf"\1{lead}\3",
            text,
            count=1,
        )
        p.write_text(text, encoding="utf-8")


def write_reviews(site_dir: Path, firm_id: str) -> None:
    reviews = fetch_branch_reviews(firm_id, limit=8)
    out = site_dir / "data" / "reviews-2gis.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(reviews, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def _fix_index_photos(site_dir: Path, files: list[str]) -> None:
    if not files:
        return
    idx = site_dir / "index.html"
    text = idx.read_text(encoding="utf-8")
    text = re.sub(
        r"(<div class=\"heroimg\" style=\"background-image:url\(')[^']+('\))",
        rf"\1{files[0]}\2",
        text,
        count=1,
    )
    tags = ["ДЕТЕЙЛИНГ-МОЙКА", "ПОЛИРОВКА", "АНТИКОР", "ЗАЩИТНАЯ ПЛЁНКА", "ТОНИРОВКА"]
    for i, tag in enumerate(tags):
        rel = files[i % len(files)]
        text = re.sub(
            rf"(<a class=\"photo[^\"]*\" href=\"services/[^\"]+\" style=\"background-image:url\(')[^']+('\"><span class=\"tag\">{tag}</span></a>)",
            rf"\1{rel}\2",
            text,
            count=1,
        )
    works = "\n".join(
        f"    <a class=\"photo\" href=\"gallery.html\" style=\"background-image:url('{files[i % len(files)]}')\"></a>"
        for i in range(5)
    )
    text = re.sub(
        r'<div class="photo-strip photo-strip--services">\s*.*?\s*</div>',
        '<div class="photo-strip photo-strip--services">\n' + works + "\n  </div>",
        text,
        count=1,
        flags=re.S,
    )
    idx.write_text(text, encoding="utf-8")


def sync_photos(site_cfg: dict) -> list[str]:
    firm_id = site_cfg["firm_id"]
    html = fetch_html(firm_id, site_cfg["city_slug"])
    urls = photo_urls_from_api(firm_id, limit=16)
    if len(urls) < 3:
        urls = photo_urls_from_html(html, limit=16)
    dest_dir = ROOT / site_cfg["slug"] / "img" / "works" / "incoming" / site_cfg["photo_folder"]
    dest_dir.mkdir(parents=True, exist_ok=True)
    for old in dest_dir.glob("*"):
        if old.is_file() and old.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
            old.unlink()
    rel_paths: list[str] = []
    for i, url in enumerate(urls[:16], 1):
        ext = ".jpg"
        if ".png" in url.lower():
            ext = ".png"
        elif ".webp" in url.lower():
            ext = ".webp"
        name = f"{i:02d}-2gis{ext}"
        path = dest_dir / name
        if download(url, path):
            rel_paths.append(f"img/works/incoming/{site_cfg['photo_folder']}/{name}")
    return rel_paths


def write_contacts_js(site_dir: Path, site_cfg: dict) -> None:
    js = f"""window.STUDIO_MESSENGERS = {{
  wa: "{site_cfg['wa']}",
  tg: "{site_cfg['phone_tel']}",
  max: "",
  defaultMessage: "{site_cfg['default_message']}",
}};
"""
    (site_dir / "contacts-config.js").write_text(js, encoding="utf-8")


def scaffold_one(raw: dict) -> None:
    site = enrich_site(raw)
    dest = ROOT / site["slug"]
    print("scaffold", site["slug"])
    copy_template(dest)
    for path in dest.rglob("*"):
        if path.suffix.lower() not in {".html", ".js", ".py", ".md", ".txt", ".json"}:
            continue
        if path.name == "gallery-manifest.json":
            continue
        text = path.read_text(encoding="utf-8")
        new = apply_replacements(text, site)
        if new != text:
            path.write_text(new, encoding="utf-8")
    write_contacts_js(dest, site)
    patch_services_html(dest, site)
    patch_service_pages(dest, site)
    write_reviews(dest, site["firm_id"])
    rels = sync_photos(site)
    n = len(rels)
    _fix_index_photos(dest, rels)
    write_manifest(dest)
    files = json.loads((dest / "data" / "gallery-manifest.json").read_text())["files"]
    write_gallery_load(dest, files)
    (dest / "README.md").write_text(
        f"# {site['brand']}\n\n"
        f"Локально: `python server.py` → http://127.0.0.1:{site['port']}/\n\n"
        f"2ГИС: {site['firm_url']}\n\n"
        f"Шаблон: prime38-detailing-angarsk. Фото альбома: {n} из 2ГИС.\n",
        encoding="utf-8",
    )
    print("  photos", n, "port", site["port"])


def main() -> None:
    for raw in SITES:
        scaffold_one(raw)
    print("done")


if __name__ == "__main__":
    main()
