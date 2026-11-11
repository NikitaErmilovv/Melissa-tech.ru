#!/usr/bin/env python3
"""Clone rp-detailing-tolyatti → Den Brilliant (Novosibirsk) + Dream Dop (Perm)."""

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
        "slug": "den-brilliant-novosibirsk",
        "photo_folder": "den-brilliant",
        "brand": "Den Brilliant",
        "logo_mark": "DEN",
        "logo_word": "BRILLIANT",
        "hero_html": (
            'DEN<br>BRILLIANT<br><span class="hero-title-sub">ДЕТЕЙЛИНГ<br>СТУДИЯ</span>'
        ),
        "city": "Новосибирск",
        "city_upper": "НОВОСИБИРСК",
        "city_slug": "novosibirsk",
        "firm_id": "70000001020637363",
        "firm_url": "https://2gis.ru/novosibirsk/firm/70000001020637363",
        "yandex_url": "https://yandex.ru/maps/org/denbrilliant/187792613331/",
        "map_provider": "yandex",
        "phone_tel": "+79831399572",
        "phone_display": "+7 (983) 139-95-72",
        "phone2_tel": "",
        "phone2_display": "",
        "wa": "79831399572",
        "tg": "",
        "address": "Красногорский переулок, 17а, Заельцовский район, Новосибирск, 630123",
        "schedule": "Ежедневно · 10:00–20:00 · по записи",
        "map_lat": 55.071757,
        "map_lon": 82.901484,
        "port": 8162,
        "rating": "4.9",
        "reviews": "143",
        "photo_limit": 30,
        "theme_class": "hero--den-brilliant",
        "hero_lead": (
            "Детейлинг-студия в Новосибирске: химчистка, полировка, керамика, "
            "тонировка и защитные плёнки по записи."
        ),
        "about_lead": (
            "Den Brilliant на Красногорском переулке — детейлинг в Заельцовском районе "
            "Новосибирска. Комплексный уход за кузовом и салоном, оклейка и керамика."
        ),
    },
    {
        "slug": "dream-dop-perm",
        "photo_folder": "dream-dop",
        "brand": "Dream Dop",
        "logo_mark": "DREAM",
        "logo_word": "DOP",
        "hero_html": 'DREAM<br>DOP<br><span class="hero-title-sub">АВТОСТУДИЯ</span>',
        "city": "Пермь",
        "city_upper": "ПЕРМЬ",
        "city_slug": "perm",
        "firm_id": "70000001064852828",
        "phone_tel": "+79922498199",
        "phone_display": "+7 (992) 249-81-99",
        "phone2_tel": "",
        "phone2_display": "",
        "wa": "79922498199",
        "tg": "",
        "address": "Пихтовая улица, 37 к2, Свердловский район, Пермь, 614025",
        "schedule": "По предварительной записи · 10:00–20:00",
        "map_lat": 57.975225,
        "map_lon": 56.281882,
        "port": 8163,
        "rating": "5.0",
        "reviews": "43",
        "photo_limit": 24,
        "hero_lead": (
            "Автостудия в Перми: детейлинг, автозвук, оклейка и уход за автомобилем по записи."
        ),
        "about_lead": (
            "Dream Dop на Пихтовой — автостудия в Свердловском районе Перми. "
            "Детейлинг, тюнинг и сопутствующие услуги — звоните или пишите в мессенджерах."
        ),
    },
]


def map_urls_2gis(site: dict) -> tuple[str, str, str]:
    c = f"{site['map_lat']},{site['map_lon']}"
    desk = f"https://static.maps.2gis.com/1.0?s=880x450&amp;c={c}&amp;z=17&amp;pt={c}~k:p"
    mob = f"https://static.maps.2gis.com/1.0?s=720x720&amp;c={c}&amp;z=17&amp;pt={c}~k:p"
    return c, desk, mob


def map_urls_yandex(site: dict) -> tuple[str, str, str]:
    lon, lat = site["map_lon"], site["map_lat"]
    c = f"{lat},{lon}"
    desk = (
        f"https://static-maps.yandex.ru/1.x/?lang=ru_RU&ll={lon},{lat}&z=16&l=map"
        f"&size=880,450&pt={lon},{lat},pm2rdm"
    )
    mob = (
        f"https://static-maps.yandex.ru/1.x/?lang=ru_RU&ll={lon},{lat}&z=16&l=map"
        f"&size=720,720&pt={lon},{lat},pm2rdm"
    )
    return c, desk, mob


def apply_text(text: str, site: dict) -> str:
    firm_url = site.get("firm_url") or f"https://2gis.ru/{site['city_slug']}/firm/{site['firm_id']}"
    map_c, desk, mob = (
        map_urls_yandex(site)[:3]
        if site.get("map_provider") == "yandex"
        else map_urls_2gis(site)
    )
    map_alt = (
        f"Карта Яндекс — {site['address']}"
        if site.get("map_provider") == "yandex"
        else f"Карта 2ГИС — {site['address']}"
    )
    map_link = site.get("yandex_url") or firm_url

    pairs: list[tuple[str, str]] = [
        (RP["firm_url"], map_link),
        (RP["map_c"], map_c),
        (RP["phone_tel"], site["phone_tel"]),
        (RP["phone_display"], site["phone_display"]),
        (RP["phone2_tel"], site.get("phone2_tel") or site["phone_tel"]),
        (RP["phone2_display"], site.get("phone2_display") or site["phone_display"]),
        (RP["address"], site["address"]),
        (RP["schedule"], site["schedule"]),
        (RP["city"], site["city"]),
        (RP["city_upper"], site["city_upper"]),
        (RP["map_alt"], map_alt),
        (f'tel:{RP["phone_tel"]}', f'tel:{site["phone_tel"]}'),
        (RP["wa"], site["wa"]),
        (f"https://wa.me/{RP['wa']}", f"https://wa.me/{site['wa']}"),
        ('<span class="logo-mark">РП</span><span class="logo-word"></span>', f'<span class="logo-mark">{site["logo_mark"]}</span><span class="logo-word">{site["logo_word"]}</span>'),
        ('<span class="logo-mark">РП</span>', f'<span class="logo-mark">{site["logo_mark"]}</span><span class="logo-word">{site["logo_word"]}</span>'),
        ("РП", site["brand"]),
        ("© 2026 РП", f"© 2026 {site['brand']}"),
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
        ('FIRM_URL = "https://2gis.ru/togliatti/firm/70000001067251376"', f'FIRM_URL = "{firm_url}"'),
        ("Тольятти · работаем по записи", f"{site['city']} · работаем по записи"),
        ("Услуги — РП", f"Услуги — {site['brand']}"),
        ("О нас — РП", f"О нас — {site['brand']}"),
        ("Контакты — РП", f"Контакты — {site['brand']}"),
        ("Работы — РП", f"Работы — {site['brand']}"),
        ("РП — детейлинг-студия Тольятти", f"{site['brand']} — {site['city']}"),
        ("https://2gis.ru/togliatti/firm/70000001067251376", map_link),
    ]
    if site.get("phone2_tel"):
        pairs.append((f'tel:{RP["phone2_tel"]}', f'tel:{site["phone2_tel"]}'))
    for old, new in sorted(pairs, key=lambda x: -len(x[0])):
        text = text.replace(old, new)

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
    if site.get("map_provider") == "yandex":
        text = text.replace(">2ГИС</a>", ">Яндекс Карты</a>")
        text = text.replace("Маршрут в 2ГИС", "Маршрут в Яндекс Картах")
        text = text.replace("Приезжайте по записи. Адрес и маршрут — в 2ГИС.", "Приезжайте по записи. Адрес и маршрут — в Яндекс Картах.")
    return text


def apply_den_theme(css: str) -> str:
    accent = """:root{
  --accent:#9ec8ff;
  --accent-soft:rgba(158,200,255,.4);
  --accent-hover:#bdd9ff;
  --accent-deep:#6fa8e8;
  --accent-ink:#0a0a0a;
  --accent-rgb:158,200,255;
}"""
    css = re.sub(r":root\{[^}]+\}", accent, css, count=1)
    css = css.replace(
        "background:radial-gradient(circle at 72% 42%,#3a3626 0,#1a1810 22%,#0a0a0a 55%)",
        "background:radial-gradient(circle at 72% 42%,#1e2a3a 0,#121820 28%,#0a0a0a 58%)",
    )
    if ".hero-logo-display" not in css:
        css += """

.hero--rp.hero--sdc .hero-logo-spacer.hero-logo-display{
  visibility:visible;position:static;transform:none;
  margin:6px 0 18px;font-size:clamp(34px,4.8vw,62px);
  line-height:.98;letter-spacing:-.05em;font-weight:800;color:#fff;
}
.hero--rp.hero--sdc .hero-logo-spacer.hero-logo-display .hero-title-sub{
  display:block;margin-top:.08em;font-size:inherit;font-weight:inherit;
  letter-spacing:inherit;line-height:.98;color:#fff;
}
.hero--den-brilliant .heroimg{opacity:.88}
"""
    return css


def patch_hero_index(dest: Path, site: dict) -> None:
    idx = dest / "index.html"
    html = idx.read_text(encoding="utf-8")
    html = re.sub(
        r'\s*<img class="hero-brand-logo"[^>]+>\s*',
        "\n",
        html,
        count=1,
    )
    extra = site.get("theme_class") or ""
    if extra and extra not in html:
        html = html.replace('class="hero hero--sdc hero--rp"', f'class="hero hero--sdc hero--rp {extra}"', 1)
    hero_html = site["hero_html"]
    html = re.sub(
        r"<h1 class=\"hero-logo-spacer[^\"]*\">.*?</h1>",
        f'<h1 class="hero-logo-spacer hero-logo-display">{hero_html}</h1>',
        html,
        count=1,
        flags=re.S,
    )
    idx.write_text(html, encoding="utf-8")


def patch_files(dest: Path, site: dict) -> None:
    patch_hero_index(dest, site)
    for path in dest.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() not in {".html", ".js", ".json", ".py", ".css", ".txt"}:
            continue
        if path.name == "index.html":
            continue
        text = apply_text(path.read_text(encoding="utf-8"), site)
        path.write_text(text, encoding="utf-8")
    idx = dest / "index.html"
    idx.write_text(apply_text(idx.read_text(encoding="utf-8"), site), encoding="utf-8")
    patch_hero_index(dest, site)

    if not site.get("phone2_tel"):
        for name in ("contact.html", "index.html", "partials/site-bottom-root.html"):
            p = dest / name
            if not p.is_file():
                continue
            t = p.read_text(encoding="utf-8")
            t = re.sub(
                r'\s*<a class="contact-phone" href="tel:\+79649696765">[^<]+</a>\s*',
                "\n",
                t,
            )
            p.write_text(t, encoding="utf-8")

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
                "text": f"Отзывы — см. карточку {site['brand']}.",
                "rating": 5,
                "date": "11.11.2026",
                "id": "placeholder-1",
            }
        ]
    (dest / "data" / "reviews-2gis.json").write_text(
        json.dumps(reviews, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    if site.get("theme_class") == "hero--den-brilliant":
        css_path = dest / "styles.css"
        css_path.write_text(apply_den_theme(css_path.read_text(encoding="utf-8")), encoding="utf-8")

    (dest / "deploy-version.txt").write_text(
        f"site={site['slug']}\n"
        f"brand={site['brand']}\n"
        f"prod=https://melissa-tech.ru/{site['slug']}/\n"
        f"deploy=git-push-timeweb-hook\n"
        f"deploy-trigger={site['slug']}-20261111T0915Z\n",
        encoding="utf-8",
    )


def fetch_photos(site: dict) -> list[str]:
    dest_dir = ROOT / site["slug"] / "img" / "works" / "incoming" / site["photo_folder"]
    dest_dir.mkdir(parents=True, exist_ok=True)
    for old in dest_dir.glob("*"):
        if old.is_file():
            old.unlink()

    limit = int(site.get("photo_limit", 24))
    urls = photo_urls_from_api(site["firm_id"], limit=limit)
    if len(urls) < 6:
        try:
            html = fetch_html(site["firm_id"], site["city_slug"])
            urls = photo_urls_from_html(html, limit=limit) or urls
        except OSError:
            pass

    rel_paths: list[str] = []
    for i, url in enumerate(urls[:limit], start=1):
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
        text = re.sub(
            r"background-image:url\('img/works/incoming/[^']+'\)",
            f"background-image:url('{hero}')",
            text,
            count=1,
        )
        idx.write_text(text, encoding="utf-8")
        for i, fname in enumerate(["01-polish.jpg", "02-ppf.jpg", "03-wrap.jpg", "04-engine-bay.jpg", "05-wash.jpg"]):
            src_path = site_dir / rel_paths[i % len(rel_paths)]
            dst = site_dir / "img" / "services-home" / fname
            if src_path.is_file():
                shutil.copy2(src_path, dst)
    patch_service_tiles(slug, rel_paths)
    patch_index_works(slug, rel_paths)
    write_manifest(site_dir)


def build_one(site: dict) -> None:
    print(f"→ {site['slug']}")
    dest = ROOT / site["slug"]
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(SRC, dest, ignore=shutil.ignore_patterns("__pycache__", ".DS_Store"))
    rel = fetch_photos(site)
    patch_files(dest, site)
    finish_site(site, rel)
    print(f"  OK {len(rel)} photos, port {site['port']}")


def main() -> None:
    for site in SITES:
        build_one(site)
    print("Done.")


if __name__ == "__main__":
    main()
