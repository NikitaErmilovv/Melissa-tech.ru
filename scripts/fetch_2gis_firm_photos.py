#!/usr/bin/env python3
"""Download firm album photos from 2GIS (HTML + photo API) into studio incoming folders."""

from __future__ import annotations

import json
import re
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

PHOTO_KEY = "gYu1s9N1wP"
UA = "Mozilla/5.0 (compatible; MelissaTechSite/1.0)"

STUDIOS = [
    {
        "slug": "pervushin-avtokompleks-ekaterinburg",
        "photo_folder": "pervushin",
        "firm_id": "70000001034025330",
        "city_slug": "ekaterinburg",
        "auto_sales": True,
    },
    {
        "slug": "pervyy-rul-masterskaya-novokuznetsk",
        "photo_folder": "pervyy-rul",
        "firm_id": "70000001111114731",
        "city_slug": "novokuznetsk",
        "auto_sales": True,
    },
    {
        "slug": "prime38-detailing-angarsk",
        "photo_folder": "prime38",
        "firm_id": "70000001061012787",
        "city_slug": "angarsk",
    },
    {
        "slug": "proffkar-avtotekhservis-tyumen",
        "photo_folder": "proffkar",
        "firm_id": "70000001080387917",
        "city_slug": "tyumen",
    },
]


def fetch_html(firm_id: str, city_slug: str) -> str:
    url = f"https://2gis.ru/{city_slug}/firm/{firm_id}"
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=35) as resp:
        return resp.read().decode("utf-8", "ignore")


def photo_urls_from_api(firm_id: str, limit: int = 40) -> list[str]:
    api = (
        f"https://api.photo.2gis.com/3.0/objects/{firm_id}/albums/all/media"
        f"?key={PHOTO_KEY}&page_size={min(limit, 50)}&locale=ru_RU"
        f"&preview_size=1920x1080%2C656x340"
    )
    req = urllib.request.Request(
        api, headers={"User-Agent": UA, "Referer": "https://2gis.ru/"}
    )
    try:
        with urllib.request.urlopen(req, timeout=40) as resp:
            data = json.loads(resp.read().decode("utf-8", "ignore"))
    except (urllib.error.URLError, TimeoutError, json.JSONDecodeError, OSError):
        return []

    urls: list[str] = []
    for item in data.get("items") or []:
        photo = item.get("photo") or {}
        previews = photo.get("preview_urls") or {}
        u = previews.get("1920x1080") or previews.get("656x340") or photo.get("url")
        if not u:
            continue
        u = u.replace("\\u002F", "/").replace("\\/", "/")
        if u not in urls:
            urls.append(u)
    return urls[:limit]


def photo_urls_from_html(html: str, limit: int = 40) -> list[str]:
    """Fallback: branch/profile images embedded in firm page HTML."""
    found: list[str] = []
    seen: set[str] = set()
    pattern = re.compile(
        r"https://i\d+\.photo\.2gis\.com/images/(?:branch|profile)/[A-Za-z0-9_./%-]+\.(?:jpg|jpeg|png|webp)",
        re.I,
    )
    for u in pattern.findall(html):
        u = re.sub(r"_\d+x(?:\d+)?\.(jpg|jpeg|png|webp)$", r".\1", u, flags=re.I)
        u = re.sub(r"_1920x1080\.(jpg|jpeg|png|webp)$", r".\1", u, flags=re.I)
        base = u.split("?")[0]
        if base in seen:
            continue
        if "64x64" in u or "64x" in u:
            continue
        seen.add(base)
        hi = u if "1920" in u or not re.search(r"_\d+x", u) else u.replace(".jpg", "_1920x1080.jpg")
        found.append(hi)
        if len(found) >= limit:
            break
    return found


def download(url: str, dest: Path) -> bool:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Referer": "https://2gis.ru/"})
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = resp.read()
    except (urllib.error.URLError, TimeoutError, OSError):
        return False
    if len(data) < 800:
        return False
    dest.write_bytes(data)
    return True


def patch_service_tiles(slug: str, rel_paths: list[str]) -> None:
    index = ROOT / slug / "index.html"
    if not index.is_file() or not rel_paths:
        return
    text = index.read_text(encoding="utf-8")
    photos = rel_paths[5:10] if len(rel_paths) > 5 else rel_paths
    i = 0

    def repl(match: re.Match[str]) -> str:
        nonlocal i
        rel = photos[i % len(photos)]
        i += 1
        return match.group(1) + rel + match.group(2)

    text = re.sub(
        r"(photo-strip--home[^>]*>[\s\S]*?background-image:url\(')([^']+)('\))",
        repl,
        text,
        count=5,
        flags=re.S,
    )
    index.write_text(text, encoding="utf-8")


def patch_index_works(slug: str, rel_paths: list[str], max_strip: int = 5) -> None:
    index = ROOT / slug / "index.html"
    if not index.is_file() or not rel_paths:
        return
    text = index.read_text(encoding="utf-8")
    tiles = []
    for rel in rel_paths[:max_strip]:
        tiles.append(
            f'    <a class="photo" href="gallery.html" style="background-image:url(\'{rel}\')"></a>'
        )
    block = (
        '  <div class="photo-strip photo-strip--services">\n'
        + "\n".join(tiles)
        + "\n  </div>"
    )
    text = re.sub(
        r'<section class="section" id="works">.*?</section>',
        lambda m: re.sub(
            r'<div class="photo-strip photo-strip--services">.*?</div>\s*<p class="intro"[^>]*>.*?</p>',
            block,
            m.group(0),
            count=1,
            flags=re.S,
        ),
        text,
        count=1,
        flags=re.S,
    )
    text = re.sub(
        r'<p class="intro" style="margin-top:20px">Фото появятся в альбоме.*?</p>\s*',
        "",
        text,
        flags=re.S,
    )
    index.write_text(text, encoding="utf-8")


def patch_cars_page(studio: dict, rel_paths: list[str]) -> None:
    if not studio.get("auto_sales"):
        return
    cars = ROOT / studio["slug"] / "cars.html"
    if not cars.is_file() or not rel_paths:
        return
    text = cars.read_text(encoding="utf-8")
    p1 = rel_paths[0]
    p2 = rel_paths[1] if len(rel_paths) > 1 else p1
    text = re.sub(
        r"background-image:url\('img/hero\.jpg'\)",
        f"background-image:url('{p1}')",
        text,
        count=1,
    )
    text = text.replace(
        "<article class=\"auto-card auto-card--muted\">",
        f'<article class="auto-card"><div class="auto-card-photo" style="background-image:url(\'{p2}\')"></div>',
        1,
    )
    cars.write_text(text, encoding="utf-8")


def patch_home_hero(slug: str, rel: str) -> None:
    index = ROOT / slug / "index.html"
    text = index.read_text(encoding="utf-8")
    text = text.replace("url('img/hero.jpg')", f"url('{rel}')", 1)
    index.write_text(text, encoding="utf-8")


def sync_studio(studio: dict, limit: int = 16) -> int:
    firm_id = studio["firm_id"]
    html = fetch_html(firm_id, studio["city_slug"])
    urls = photo_urls_from_api(firm_id, limit=limit)
    if len(urls) < 3:
        urls = photo_urls_from_html(html, limit=limit)
    if not urls:
        print(studio["slug"], "no photos")
        return 0

    dest_dir = ROOT / studio["slug"] / "img" / "works" / "incoming" / studio["photo_folder"]
    dest_dir.mkdir(parents=True, exist_ok=True)
    for old in dest_dir.glob("*.jpg"):
        old.unlink()
    for old in dest_dir.glob("*.jpeg"):
        old.unlink()

    saved: list[str] = []
    for i, url in enumerate(urls[:limit], 1):
        ext = ".jpg"
        if ".png" in url.lower():
            ext = ".png"
        elif ".webp" in url.lower():
            ext = ".webp"
        name = f"{i:02d}-2gis{ext}"
        path = dest_dir / name
        if download(url, path):
            saved.append(path)
            print(" ", name, len(path.read_bytes()) // 1024, "KB")

    if not saved:
        return 0

    hero_src = ROOT / studio["slug"] / "img" / "hero.jpg"
    hero_src.write_bytes(saved[0].read_bytes())

    rel_paths = [
        f"img/works/incoming/{studio['photo_folder']}/{p.name}" for p in saved
    ]
    patch_index_works(studio["slug"], rel_paths)
    patch_home_hero(studio["slug"], rel_paths[0])
    patch_cars_page(studio, rel_paths)
    patch_service_tiles(studio["slug"], rel_paths)

    meta = dest_dir / "source.txt"
    meta.write_text(
        f"2GIS firm {firm_id}\n"
        f"https://2gis.ru/{studio['city_slug']}/firm/{firm_id}\n"
        f"photos: {len(saved)}\n",
        encoding="utf-8",
    )
    print(studio["slug"], "saved", len(saved))
    return len(saved)


def main() -> None:
    total = 0
    for studio in STUDIOS:
        total += sync_studio(studio)
    print("done, files:", total)


if __name__ == "__main__":
    main()
