#!/usr/bin/env python3
"""Post-process grad54-novosibirsk: 2GIS photos, reviews, services, contacts."""

from __future__ import annotations

import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "grad54-novosibirsk"
FIRM_ID = "70000001065421759"
PHOTO_KEY = "gYu1s9N1wP"
UA = "Mozilla/5.0 (compatible; MelissaTechSite/1.0)"
INCOMING = SITE / "img" / "works" / "incoming" / "grad54"

sys.path.insert(0, str(ROOT / "scripts"))
from fetch_2gis_catalog_branch import fetch_branch_catalog  # noqa: E402
from fetch_2gis_firm_photos import (  # noqa: E402
    download,
    patch_home_hero,
    patch_index_works,
    patch_service_tiles,
)
from fetch_2gis_reviews import fetch_branch_reviews  # noqa: E402

HOME_SERVICES = [
    ("ppf", "РЕМОНТ ВМЯТИН", "01-2gis.jpg"),
    ("anticor", "КУЗОВНОЙ РЕМОНТ", "02-2gis.jpg"),
    ("polish", "ПОЛИРОВКА", "03-2gis.jpg"),
    ("ceramic", "ПОКРАСКА", "04-2gis.jpg"),
    ("wash", "ДЕТЕЙЛИНГ", "05-2gis.jpg"),
]

CATALOG = [
    ("ppf", "Ремонт вмятин без покраски", "PDR: восстановление формы кузова без перекраски."),
    ("anticor", "Кузовной ремонт", "Локальный и кузовной ремонт после осмотра."),
    ("polish", "Полировка", "Полировка ЛКП и подготовка поверхности."),
    ("ceramic", "Покраска автомобилей", "Покрасочные работы и подбор оттенка."),
    ("wash", "Детейлинг", "Комплексный уход за автомобилем."),
]


def fetch_all_photo_urls() -> list[str]:
    urls: list[str] = []
    token = ""
    for _ in range(30):
        q = urllib.parse.urlencode(
            {
                "key": PHOTO_KEY,
                "page_size": "10",
                "locale": "ru_RU",
                "preview_size": "656x340",
            }
        )
        url = f"https://api.photo.2gis.com/3.0/objects/{FIRM_ID}/albums/all/media?{q}"
        if token:
            url += "&" + urllib.parse.urlencode({"page_token": token})
        req = urllib.request.Request(
            url, headers={"User-Agent": UA, "Referer": "https://2gis.ru/"}
        )
        last_err: Exception | None = None
        data = None
        for attempt in range(4):
            try:
                with urllib.request.urlopen(req, timeout=45) as resp:
                    data = json.loads(resp.read().decode("utf-8", "ignore"))
                break
            except (TimeoutError, OSError) as exc:
                last_err = exc
        if data is None:
            if urls:
                break
            raise last_err or RuntimeError("2GIS photo API failed")
        for item in data.get("items") or []:
            photo = item.get("photo") or {}
            previews = photo.get("preview_urls") or {}
            u = previews.get("1920x1080") or previews.get("656x340") or photo.get("url")
            if not u:
                continue
            u = u.replace("\\u002F", "/").replace("\\/", "/")
            if u not in urls:
                urls.append(u)
        token = data.get("next_page_token") or ""
        if not token:
            break
    return urls


def sync_photos() -> list[str]:
    INCOMING.mkdir(parents=True, exist_ok=True)
    for old in INCOMING.glob("*"):
        if old.is_file():
            old.unlink()
    urls = fetch_all_photo_urls()
    if not urls:
        raise SystemExit("No 2GIS photos for Grad54")

    saved: list[Path] = []
    for i, url in enumerate(urls, 1):
        dest = INCOMING / f"{i:02d}-2gis.jpg"
        if download(url, dest):
            saved.append(dest)

    if not saved:
        raise SystemExit("Failed to download 2GIS photos")

    hero = SITE / "img" / "hero.jpg"
    hero.write_bytes(saved[0].read_bytes())
    rel_paths = [f"img/works/incoming/grad54/{p.name}" for p in saved]
    slug = "grad54-novosibirsk"
    patch_index_works(slug, rel_paths, max_strip=min(5, len(rel_paths)))
    patch_home_hero(slug, rel_paths[0])
    patch_service_tiles(slug, rel_paths)
    patch_about_photos(rel_paths)
    patch_home_services_strip()
    (INCOMING / "source.txt").write_text(
        f"2GIS firm {FIRM_ID}\nhttps://2gis.ru/novosibirsk/firm/{FIRM_ID}\nphotos: {len(saved)}\n",
        encoding="utf-8",
    )
    return rel_paths


def patch_about_photos(rel_paths: list[str]) -> None:
    about = SITE / "about.html"
    if not about.is_file() or len(rel_paths) < 3:
        return
    imgs = rel_paths[8:11] if len(rel_paths) > 10 else rel_paths[:3]
    t = about.read_text(encoding="utf-8")
    for rel in imgs:
        t = re.sub(
            r"background-image:url\('[^']+'\)",
            f"background-image:url('{rel}')",
            t,
            count=1,
        )
    about.write_text(t, encoding="utf-8")


def patch_home_services_strip() -> None:
    idx = SITE / "index.html"
    lines = [
        f'    <a class="photo" href="services/{slug}.html" '
        f"style=\"background-image:url('img/works/incoming/grad54/{img}')\"><span class=\"tag\">{tag}</span></a>"
        for slug, tag, img in HOME_SERVICES
    ]
    block = '  <div class="photo-strip photo-strip--services photo-strip--home">\n' + "\n".join(lines) + "\n  </div>"
    text = idx.read_text(encoding="utf-8")
    text = re.sub(
        r'<div class="photo-strip photo-strip--services photo-strip--home">.*?</div>',
        block,
        text,
        count=1,
        flags=re.S,
    )
    idx.write_text(text, encoding="utf-8")


def patch_reviews() -> int:
    path = SITE / "data" / "reviews-2gis.json"
    prev: list = []
    if path.is_file():
        try:
            prev = json.loads(path.read_text(encoding="utf-8"))
            if not isinstance(prev, list):
                prev = []
        except json.JSONDecodeError:
            prev = []
    reviews: list = []
    last_err: Exception | None = None
    for attempt in range(5):
        try:
            reviews = fetch_branch_reviews(FIRM_ID, limit=12)
            if reviews:
                break
        except (TimeoutError, OSError, ValueError) as exc:
            last_err = exc
    if not reviews and prev:
        print(f"reviews: API empty, keeping {len(prev)} cached items")
        return len(prev)
    if not reviews:
        msg = f"reviews: none from 2GIS API ({last_err})" if last_err else "reviews: none from 2GIS API"
        print(msg)
        return 0
    path.write_text(json.dumps(reviews, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return len(reviews)


def patch_services_pages() -> None:
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


def sync_catalog() -> dict:
    return fetch_branch_catalog(FIRM_ID, city_slug="novosibirsk")


def patch_gis_meta(meta: dict) -> None:
    (SITE / "data" / "gis-meta.json").write_text(
        json.dumps(
            {
                "firm_id": meta["firm_id"],
                "firm_url": meta["firm_url"],
                "rating": meta["rating"],
                "review_count": meta["review_count"],
                "address": meta["address"],
                "hours_line": meta["hours_line"],
                "map_lat": meta["map_lat"],
                "map_lon": meta["map_lon"],
                "synced_at": "catalog.api.2gis.ru",
            },
            ensure_ascii=False,
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )


def patch_contacts(meta: dict) -> None:
    phones = meta.get("phones") or []
    phone_lines = "\n".join(
        f'    {{ tel: "{p["tel"]}", display: "{p["display"]}" }},' for p in phones
    )
    wa = str(meta.get("wa") or "").replace("+", "")
    tg = str(meta.get("tg") or (phones[0]["tel"] if phones else ""))
    (SITE / "contacts-config.js").write_text(
        f"""window.STUDIO_MESSENGERS = {{
  wa: "{wa}",
  tg: "{tg}",
  max: "",
  defaultMessage: "Здравствуйте! Хочу записаться в Grad54.",
}};

window.STUDIO_CONTACTS = {{
  addressLine: "{meta["address"]}",
  hoursLine: "{meta["hours_line"]}",
  mapLat: {meta["map_lat"]},
  mapLon: {meta["map_lon"]},
  gisFirm: "{meta["firm_url"]}",
  mapImage: "img/map-2gis-card.png",
  yandexMaps: "",
  phones: [
{phone_lines}
  ],
}};
""",
        encoding="utf-8",
    )


def patch_html_from_catalog(meta: dict) -> None:
    addr = meta["address"]
    hours = meta["hours_line"]
    tel = meta["phones"][0]["tel"] if meta.get("phones") else "+79530598840"
    disp = meta["phones"][0]["display"] if meta.get("phones") else tel
    desk = meta["map_desktop_url"]
    mob = meta["map_mobile_url"]
    alt = meta["map_alt"]
    firm = meta["firm_url"]
    rating = str(meta["rating"])
    reviews = str(meta["review_count"])

    for path in SITE.rglob("*.html"):
        text = path.read_text(encoding="utf-8")
        orig = text
        text = re.sub(r'id="stat-reviews">\d+', f'id="stat-reviews">{reviews}', text)
        text = re.sub(r'id="stat-rating">[\d.]+', f'id="stat-rating">{rating}', text)
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
        text = re.sub(
            r'alt="Карта 2ГИС — [^"]*"',
            f'alt="{alt}"',
            text,
        )
        text = re.sub(r"По предварительной записи · 10:00–20:00", hours, text)
        text = re.sub(r"По предварительной записи · 10:00—20:00", hours, text)
        text = re.sub(r"г\. Новосибирск, Вилюйская улица, 23", addr, text)
        if "contacts-sync.js" not in text and "contacts-config.js" in text:
            text = text.replace(
                '<script src="contacts-config.js"></script>',
                '<script src="contacts-config.js"></script>\n<script src="contacts-sync.js"></script>',
            )
            text = text.replace(
                '<script src="../contacts-config.js"></script>',
                '<script src="../contacts-config.js"></script>\n<script src="../contacts-sync.js"></script>',
            )
        if path.name == "contact.html":
            text = re.sub(
                r'<a class="contact-phone" href="tel:[^"]+">[^<]+</a>\s*<a class="contact-phone" href="tel:[^"]+">[^<]+</a>',
                f'<a class="contact-phone" href="tel:{tel}">{disp}</a>',
                text,
                count=1,
            )
        if orig != text:
            path.write_text(text, encoding="utf-8")


def patch_gallery_manifest(rel_paths: list[str]) -> None:
    (SITE / "data" / "gallery-manifest.json").write_text(
        json.dumps({"files": rel_paths}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def patch_hero_copy() -> None:
    idx = SITE / "index.html"
    text = idx.read_text(encoding="utf-8")
    text = re.sub(
        r'<div class="eyebrow hero-eyebrow-city">[^<]*</div>',
        '<div class="eyebrow hero-eyebrow-city">НОВОСИБИРСК · PDR</div>',
        text,
        count=1,
    )
    text = re.sub(
        r"<p>Кузовной ремонт и детейлинг[^<]+</p>",
        "<p>Удаление вмятин без покраски, кузовной ремонт и полировка в Новосибирске. Вилюйская, 23 — по записи.</p>",
        text,
        count=1,
    )
    idx.write_text(text, encoding="utf-8")


def purge_template_asset_paths() -> None:
    for path in SITE.rglob("*"):
        if not path.is_file() or path.suffix.lower() not in {".html", ".js", ".css", ".json"}:
            continue
        if "before-after" in str(path):
            continue
        text = path.read_text(encoding="utf-8")
        if "incoming/rp" not in text and "hero-home.jpg" not in text:
            continue
        text = text.replace("img/works/incoming/rp/", "img/works/incoming/grad54/")
        text = text.replace("url('img/hero-home.jpg')", "url('img/works/incoming/grad54/01-2gis.jpg')")
        text = text.replace("url('img/hero.jpg')", "url('img/works/incoming/grad54/01-2gis.jpg')")
        path.write_text(text, encoding="utf-8")


def patch_gallery_manifest_from_disk() -> None:
    incoming = SITE / "img" / "works" / "incoming" / "grad54"
    files = sorted(
        f"img/works/incoming/grad54/{p.name}"
        for p in incoming.glob("*")
        if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
    )
    if files:
        (SITE / "data" / "gallery-manifest.json").write_text(
            json.dumps({"files": files}, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )


def main() -> None:
    import argparse

    p = argparse.ArgumentParser(description="Sync Grad54 site from 2GIS")
    p.add_argument(
        "--skip-photos",
        action="store_true",
        help="Do not re-download or reassign 2GIS photos (hero/services unchanged)",
    )
    args = p.parse_args()

    meta = sync_catalog()
    patch_gis_meta(meta)
    patch_contacts(meta)
    patch_html_from_catalog(meta)
    n_rev = patch_reviews()
    patch_services_pages()
    patch_hero_copy()
    purge_template_asset_paths()

    if args.skip_photos:
        patch_gallery_manifest_from_disk()
        print(
            f"grad54-novosibirsk synced (catalog: {meta['review_count']} reviews @ {meta['rating']}, "
            f"carousel items {n_rev}; photos skipped)"
        )
        return

    rel = sync_photos()
    patch_gallery_manifest(rel)
    print(
        f"grad54-novosibirsk patched ({len(rel)} photos, catalog reviews {meta['review_count']}, "
        f"carousel items {n_rev})"
    )


if __name__ == "__main__":
    main()