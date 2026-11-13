#!/usr/bin/env python3
"""Clone rp-detailing-tolyatti → Facet lab (Tyumen)."""

from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "rp-detailing-tolyatti"
HERO_SRC = Path(
    "/home/ubuntu/.cursor/projects/workspace/assets/093ab7f9-41aa-455b-ac13-620bb2c2005f.jpg"
)

sys.path.insert(0, str(ROOT / "scripts"))

from build_bunker_bubbles import (  # noqa: E402
    RP,
    apply_text as apply_text_base,
    copy_site,
    fetch_photos,
)
from fetch_2gis_firm_photos import patch_index_works, patch_service_tiles  # noqa: E402
from fetch_2gis_reviews import fetch_branch_reviews  # noqa: E402
from generate_gallery_manifest import write_manifest  # noqa: E402

SITE = {
    "slug": "facet-lab-tyumen",
    "photo_folder": "facet-lab",
    "brand": "Facet lab",
    "logo_mark": "FACET",
    "logo_word": "lab",
    "hero_accent": "FACET LAB",
    "photo_limit": 32,
    "city": "Тюмень",
    "city_upper": "ТЮМЕНЬ",
    "city_slug": "tyumen",
    "firm_id": "70000001093568213",
    "firm_url": "https://2gis.ru/tyumen/firm/70000001093568213",
    "phone_tel": "+79822116129",
    "phone_display": "+7 (982) 211-61-29",
    "phone2_tel": "+79220420383",
    "phone2_display": "+7 (922) 042-03-83",
    "wa": "79822116129",
    "tg": "+79220420383",
    "address": "Народная улица, 59, 1 этаж, Суходольский микрорайон, Восточный округ, Тюмень",
    "schedule": "Ежедневно · 09:00–19:00 · по записи",
    "map_lat": 57.093285,
    "map_lon": 65.602231,
    "port": 8164,
    "rating": "5.0",
    "reviews": "32",
    "hero_lead": (
        "Центр оклейки и детейлинга в Тюмени: PPF, полная и частичная оклейка, "
        "керамика, полировка, шумоизоляция и уход за кузовом по записи."
    ),
    "about_lead": (
        "Facet lab на Народной — центр оклейки и детейлинга в Восточном округе Тюмени. "
        "Защитные плёнки, керамика, детейлинг-мойка и комплексный уход. "
        "Запись по телефону или в мессенджерах."
    ),
}


def apply_text(text: str, site: dict) -> str:
    text = apply_text_base(text, site)
    text = text.replace(
        "BUBBLES<br><span class=\"accent\">ТЮМЕНЬ</span>",
        "FACET<br>LAB<br><span class=\"accent\">ТЮМЕНЬ</span>",
    )
    text = text.replace(
        "FACET LAB<br><span class=\"accent\">ТЮМЕНЬ</span>",
        "FACET<br>LAB<br><span class=\"accent\">ТЮМЕНЬ</span>",
    )
    return text


def apply_facet_theme(css: str) -> str:
    accent = """:root{
  --accent:#9887c2;
  --accent-soft:rgba(152,135,194,.42);
  --accent-hover:#b5a8d4;
  --accent-deep:#7a6aa8;
  --accent-ink:#0a0a0a;
  --accent-rgb:152,135,194;
}"""
    css = re.sub(r":root\{[^}]+\}", accent, css, count=1)
    css += """
.hero--facet-lab .heroimg{opacity:.9}
.hero--rp.hero--sdc .hero-logo-spacer.hero-logo-display{
  visibility:visible;position:static;transform:none;pointer-events:auto;user-select:text;
  margin:6px 0 18px;font-size:clamp(38px,5.2vw,68px);line-height:.98;letter-spacing:-.05em;
  font-weight:800;color:#fff;
}
.hero--rp.hero--sdc .hero-logo-wrap:has(.hero-logo-display){min-height:0}
.hero--rp.hero--sdc .hero-heading--logo .hero-eyebrow-city{
  margin-top:clamp(20px,3.5vw,42px);margin-bottom:2px;
}
.hero--facet-lab .hero-logo-spacer.hero-logo-display .accent{color:var(--accent)}
@media (max-width:800px){
  .hero--rp.hero--sdc .hero-logo-spacer.hero-logo-display{
    font-size:clamp(32px,9vw,48px);margin:4px 0 14px;
  }
}
"""
    return css


def patch_files(dest: Path, site: dict) -> None:
    for path in dest.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() not in {".html", ".js", ".json", ".py", ".css", ".txt"}:
            continue
        path.write_text(apply_text(path.read_text(encoding="utf-8"), site), encoding="utf-8")

    idx = dest / "index.html"
    html = idx.read_text(encoding="utf-8")
    html = re.sub(
        r'\s*<img class="hero-brand-logo"[^>]+>\s*',
        "\n",
        html,
        count=1,
    )
    html = html.replace(
        'class="hero hero--sdc hero--rp"',
        'class="hero hero--sdc hero--rp hero--facet-lab"',
        1,
    )
    html = html.replace('class="hero-logo-spacer"', 'class="hero-logo-spacer hero-logo-display"', 1)
    html = html.replace(
        'class="hero-logo-spacer" aria-hidden="true"',
        'class="hero-logo-spacer hero-logo-display"',
        1,
    )
    html = re.sub(
        r"<h1 class=\"hero-logo-spacer hero-logo-display\">.*?</h1>",
        '<h1 class="hero-logo-spacer hero-logo-display">FACET<br>LAB<br><span class="accent">ТЮМЕНЬ</span></h1>',
        html,
        count=1,
        flags=re.S,
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
                "date": "13.11.2026",
                "id": "placeholder-1",
            }
        ]
    (dest / "data" / "reviews-2gis.json").write_text(
        json.dumps(reviews, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    css_path = dest / "styles.css"
    css_path.write_text(apply_facet_theme(css_path.read_text(encoding="utf-8")), encoding="utf-8")

    (dest / "deploy-version.txt").write_text(
        f"site={site['slug']}\n"
        f"brand={site['brand']}\n"
        f"prod=https://melissa-tech.ru/{site['slug']}/\n"
        f"deploy=git-push-timeweb-hook\n"
        f"deploy-trigger={site['slug']}-20261113T0645Z\n",
        encoding="utf-8",
    )


def finish_site_photos(site: dict, rel_paths: list[str]) -> None:
    """Gallery and tiles from 2GIS only — no rp-detailing services-home copies."""
    slug = site["slug"]
    site_dir = ROOT / slug
    services_dir = site_dir / "img" / "services-home"
    if services_dir.is_dir():
        shutil.rmtree(services_dir)
    for name in ("logo-hero.jpg", "logo-hero.png"):
        p = site_dir / "img" / name
        if p.is_file():
            p.unlink()
    if rel_paths:
        patch_service_tiles(slug, rel_paths)
        patch_index_works(slug, rel_paths)
    write_manifest(site_dir)


def apply_custom_hero(dest: Path) -> None:
    hero = dest / "img" / "hero-home.jpg"
    hero.parent.mkdir(parents=True, exist_ok=True)
    if HERO_SRC.is_file():
        shutil.copy2(HERO_SRC, hero)
    idx = dest / "index.html"
    html = idx.read_text(encoding="utf-8")
    html = re.sub(
        r"background-image:url\('[^']+'\);background-position:[^\"]+",
        "background-image:url('img/hero-home.jpg');background-position:48% 42%",
        html,
        count=1,
    )
    idx.write_text(html, encoding="utf-8")


def main() -> None:
    print(f"→ {SITE['slug']}")
    dest = copy_site(SITE)
    rel = fetch_photos(SITE)
    patch_files(dest, SITE)
    finish_site_photos(SITE, rel)
    apply_custom_hero(dest)
    print(f"  OK {len(rel)} photos, port {SITE['port']}")


if __name__ == "__main__":
    main()
