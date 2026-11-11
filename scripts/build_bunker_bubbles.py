#!/usr/bin/env python3
"""Clone rp-detailing-tolyatti → Bunker Box (Omsk) and Bubbles (Tyumen)."""

from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "rp-detailing-tolyatti"
sys.path.insert(0, str(ROOT / "scripts"))

from fetch_2gis_firm_photos import (  # noqa: E402
    download,
    fetch_html,
    patch_home_hero,
    patch_index_works,
    patch_service_tiles,
    photo_urls_from_api,
    photo_urls_from_html,
)
from fetch_2gis_reviews import fetch_branch_reviews  # noqa: E402
from generate_gallery_manifest import write_manifest  # noqa: E402

RP = {
    "firm_url": "https://2gis.ru/togliatti/firm/70000001067251376",
    "map_c": "53.534132,49.25991",
    "phone_tel": "+79626123368",
    "phone_display": "+7 (962) 612-33-68",
    "phone2_tel": "+79649696765",
    "phone2_display": "+7 (964) 969-67-65",
    "address": "г. Тольятти, 253-й квартал, стр. 19",
    "schedule": "По предварительной записи · 10:00–20:00",
    "city": "Тольятти",
    "city_upper": "ТОЛЬЯТТИ",
    "city_slug": "togliatti",
    "reviews": "51",
    "rating": "5.0",
    "wa": "79626123368",
    "tg": "+79626123368",
    "photo_folder": "rp",
    "port": 8134,
    "default_message": "Здравствуйте! Хочу записаться в РП.",
    "map_alt": "Карта 2ГИС — г. Тольятти, 253-й квартал, стр. 19",
}

SITES: list[dict] = [
    {
        "slug": "bunker-box-omsk",
        "photo_folder": "bunker-box",
        "brand": "Bunker Box",
        "logo_mark": "BUNKER",
        "logo_word": "BOX",
        "hero_accent": "BUNKER BOX",
        "city": "Омск",
        "city_upper": "ОМСК",
        "city_slug": "omsk",
        "firm_id": "70000001060700064",
        "phone_tel": "+79040733587",
        "phone_display": "+7 (904) 073-35-87",
        "phone2_tel": "+79136511554",
        "phone2_display": "+7 (913) 651-15-54",
        "wa": "79040733587",
        "tg": "+79136511554",
        "address": "Семиреченская улица, 18/1, Кировский округ, Омск, 644082",
        "schedule": "По предварительной записи · 10:00–20:00",
        "map_lat": 54.932567,
        "map_lon": 73.323382,
        "port": 8160,
        "rating": "5.0",
        "reviews": "143",
        "hero_lead": (
            "Автосервис в Омске: тонировка, детейлинг, мойка и уход за кузовом "
            "и салоном по предварительной записи."
        ),
        "about_lead": (
            "Bunker Box на Семиреченской — автосервис в Кировском округе Омска. "
            "Тонировка стёкол, детейлинг, мойка и сопутствующие работы. "
            "Запись по телефону или в Telegram."
        ),
    },
    {
        "slug": "bubbles-detailing-tyumen",
        "photo_folder": "bubbles",
        "brand": "Bubbles",
        "logo_mark": "BUB",
        "logo_word": "BLES",
        "hero_accent": "BUBBLES",
        "city": "Тюмень",
        "city_upper": "ТЮМЕНЬ",
        "city_slug": "tyumen",
        "firm_id": "70000001019568448",
        "phone_tel": "+73452609190",
        "phone_display": "8 (3452) 609-190",
        "phone2_tel": "+79220019190",
        "phone2_display": "+7 (922) 001-91-90",
        "wa": "79220019190",
        "tg": "",
        "address": "Дальняя улица, 26, 1 этаж, Ленинский округ, Тюмень, 625040",
        "schedule": "По предварительной записи · 09:00–20:00",
        "map_lat": 57.170505,
        "map_lon": 65.665596,
        "port": 8161,
        "rating": "4.7",
        "reviews": "59",
        "hero_lead": (
            "Детейлинг-студия в Тюмени: мойка, полировка, защита кузова, "
            "тонировка и уход за салоном по записи."
        ),
        "about_lead": (
            "Bubbles — детейлинг-студия на Дальней улице в Ленинском округе Тюмени. "
            "Полный спектр детейлинга и тюнинга. Запись по телефону или в WhatsApp."
        ),
    },
]


def map_urls(site: dict) -> tuple[str, str]:
    c = f"{site['map_lat']},{site['map_lon']}"
    desk = f"https://static.maps.2gis.com/1.0?s=880x450&amp;c={c}&amp;z=17&amp;pt={c}~k:p"
    mob = f"https://static.maps.2gis.com/1.0?s=720x720&amp;c={c}&amp;z=17&amp;pt={c}~k:p"
    return desk, mob


def apply_text(text: str, site: dict) -> str:
    firm_url = f"https://2gis.ru/{site['city_slug']}/firm/{site['firm_id']}"
    map_c = f"{site['map_lat']},{site['map_lon']}"
    map_alt = f"Карта 2ГИС — {site['address']}"
    desk, mob = map_urls(site)

    pairs: list[tuple[str, str]] = [
        (RP["firm_url"], firm_url),
        (RP["map_c"], map_c),
        (RP["phone_tel"], site["phone_tel"]),
        (RP["phone_display"], site["phone_display"]),
        (RP["phone2_tel"], site["phone2_tel"]),
        (RP["phone2_display"], site["phone2_display"]),
        (RP["address"], site["address"]),
        (RP["schedule"], site["schedule"]),
        (RP["city"], site["city"]),
        (RP["city_upper"], site["city_upper"]),
        (RP["city_slug"], site["city_slug"]),
        (RP["map_alt"], map_alt),
        (f'tel:{RP["phone_tel"]}', f'tel:{site["phone_tel"]}'),
        (f'tel:{RP["phone2_tel"]}', f'tel:{site["phone2_tel"]}'),
        (RP["wa"], site["wa"]),
        (f"https://wa.me/{RP['wa']}", f"https://wa.me/{site['wa']}"),
        (RP["tg"], site["tg"] or site["wa"]),
        (f"https://t.me/{RP['tg']}", f"https://t.me/{site['tg']}" if site["tg"] else f"https://wa.me/{site['wa']}"),
        (f"https://t.me/+{RP['tg'].lstrip('+')}", f"https://t.me/{site['tg']}" if site["tg"] else f"https://wa.me/{site['wa']}"),
        ('<span class="logo-mark">РП</span><span class="logo-word"></span>', f'<span class="logo-mark">{site["logo_mark"]}</span><span class="logo-word">{site["logo_word"]}</span>'),
        ('<span class="logo-mark">РП</span>', f'<span class="logo-mark">{site["logo_mark"]}</span><span class="logo-word">{site["logo_word"]}</span>'),
        ("РП", site["brand"]),
        ("© 2026 РП", f"© 2026 {site['brand']}"),
        ("ДЕТЕЙЛИНГ-СТУДИЯ<br><span class=\"accent\">РП</span>", f"{site['hero_accent']}<br><span class=\"accent\">{site['city_upper']}</span>"),
        ("ДЕТЕЙЛИНГ-<br>СТУДИЯ<br><span class=\"accent\">РП</span>", f"BUNKER<br>BOX<br><span class=\"accent\">{site['city_upper']}</span>" if "Bunker" in site["brand"] else f"BUBBLES<br><span class=\"accent\">{site['city_upper']}</span>"),
        ("ДЕТЕЙЛИНГ-СТУДИЯ · ТОЛЬЯТТИ", f"{site['hero_accent']} · {site['city_upper']}"),
        (
            "Детейлинг-центр в Тольятти: мойка, полировка, защитные покрытия, антикор и тонировка по записи.",
            site["hero_lead"],
        ),
        (
            "детейлинг-студия на Московском проспекте в Автозаводском районе Тольятти. Уход за кузовом и салоном, полировка, плёнка и тонировка. Работаем по записи — звоните или пишите.",
            site["about_lead"],
        ),
        (f'id="stat-reviews">{RP["reviews"]}', f'id="stat-reviews">{site["reviews"]}'),
        (f'id="stat-rating">{RP["rating"]}', f'id="stat-rating">{site["rating"]}'),
        (f"incoming/{RP['photo_folder']}/", f"incoming/{site['photo_folder']}/"),
        ('data-photo-dir="rp"', f'data-photo-dir="{site["photo_folder"]}"'),
        (RP["default_message"], f"Здравствуйте! Хочу записаться в {site['brand']}."),
        (f"PORT = {RP['port']}", f"PORT = {site['port']}"),
        (RP["firm_url"], firm_url),
        ('FIRM_URL = "https://2gis.ru/togliatti/firm/70000001067251376"', f'FIRM_URL = "{firm_url}"'),
        ("Тольятти · работаем по записи", f"{site['city']} · работаем по записи"),
        ("Услуги — РП", f"Услуги — {site['brand']}"),
        ("О нас — РП", f"О нас — {site['brand']}"),
        ("Контакты — РП", f"Контакты — {site['brand']}"),
        ("Работы — РП", f"Работы — {site['brand']}"),
        ("РП — детейлинг-студия Тольятти", f"{site['brand']} — {site['city']}"),
    ]
    for old, new in sorted(pairs, key=lambda x: -len(x[0])):
        text = text.replace(old, new)

  # map images
    text = re.sub(
        r"https://static\.maps\.2gis\.com/1\.0\?s=880x450&amp;c=[^\"']+",
        desk,
        text,
    )
    text = re.sub(
        r"https://static\.maps\.2gis\.com/1\.0\?s=720x720&amp;c=[^\"']+",
        mob,
        text,
    )
    return text


def copy_site(site: dict) -> Path:
    dest = ROOT / site["slug"]
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(SRC, dest, ignore=shutil.ignore_patterns("__pycache__", ".DS_Store"))
    return dest


def patch_files(dest: Path, site: dict) -> None:
    for path in dest.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() not in {".html", ".js", ".json", ".py", ".css", ".txt"}:
            continue
        text = path.read_text(encoding="utf-8")
        path.write_text(apply_text(text, site), encoding="utf-8")

    # hero: drop broken logo png, use text brand
    idx = dest / "index.html"
    html = idx.read_text(encoding="utf-8")
    html = re.sub(
        r'\s*<img class="hero-brand-logo"[^>]+>\s*',
        "\n",
        html,
        count=1,
    )
    html = html.replace(
        'class="hero-logo-spacer" aria-hidden="true"',
        'class="hero-logo-spacer"',
    )
    idx.write_text(html, encoding="utf-8")

    contacts = f"""window.STUDIO_MESSENGERS = {{
  wa: "{site['wa']}",
  tg: "{site['tg'] or '+' + site['wa']}",
  max: "",
  defaultMessage: "Здравствуйте! Хочу записаться в {site['brand']}.",
}};
"""
    (dest / "contacts-config.js").write_text(contacts, encoding="utf-8")

    try:
        reviews = fetch_branch_reviews(site["firm_id"], limit=8)
    except (TimeoutError, OSError, ValueError):
        reviews = [
            {
                "name": "Гость",
                "text": f"Отзывы с 2ГИС — см. карточку {site['brand']}.",
                "rating": 5,
                "date": "10.11.2026",
                "id": "placeholder-1",
            }
        ]
    (dest / "data" / "reviews-2gis.json").write_text(
        json.dumps(reviews, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def fetch_photos(site: dict) -> list[str]:
    dest_dir = ROOT / site["slug"] / "img" / "works" / "incoming" / site["photo_folder"]
    dest_dir.mkdir(parents=True, exist_ok=True)
    for old in dest_dir.glob("*"):
        if old.is_file():
            old.unlink()

    urls = photo_urls_from_api(site["firm_id"], limit=24)
    if len(urls) < 6:
        html = fetch_html(site["firm_id"], site["city_slug"])
        urls = photo_urls_from_html(html, limit=24) or urls

    rel_paths: list[str] = []
    for i, url in enumerate(urls[:20], start=1):
        out = dest_dir / f"{i:02d}-2gis.jpg"
        if download(url, out):
            rel_paths.append(out.relative_to(ROOT / site["slug"]).as_posix())

    if not rel_paths:
        src_rp = SRC / "img" / "works" / "incoming" / "rp"
        for j, p in enumerate(sorted(src_rp.glob("*.jpg"))[:12], start=1):
            out = dest_dir / f"{j:02d}-2gis.jpg"
            shutil.copy2(p, out)
            rel_paths.append(out.relative_to(ROOT / site["slug"]).as_posix())

    return rel_paths


def finish_site(site: dict, rel_paths: list[str]) -> None:
    slug = site["slug"]
    site_dir = ROOT / slug
    if rel_paths:
        hero = rel_paths[0]
        idx = site_dir / "index.html"
        text = idx.read_text(encoding="utf-8")
        text = re.sub(
            r"background-image:url\('img/hero-home\.jpg'\)",
            f"background-image:url('{hero}')",
            text,
            count=1,
        )
        idx.write_text(text, encoding="utf-8")
        # services-home tiles
        for i, fname in enumerate(["01-polish.jpg", "02-ppf.jpg", "03-wrap.jpg", "04-engine-bay.jpg", "05-wash.jpg"]):
            src = rel_paths[i % len(rel_paths)]
            dst = site_dir / "img" / "services-home" / fname
            if dst.exists():
                shutil.copy2(site_dir / src, dst)
    patch_service_tiles(slug, rel_paths)
    patch_index_works(slug, rel_paths)
    write_manifest(site_dir)


def build_one(site: dict) -> None:
    print(f"→ {site['slug']}")
    copy_site(site)
    rel = fetch_photos(site)
    patch_files(ROOT / site["slug"], site)
    finish_site(site, rel)
    print(f"  OK {len(rel)} photos, port {site['port']}")


def main() -> None:
    for site in SITES:
        build_one(site)
    print("Done.")


if __name__ == "__main__":
    main()
