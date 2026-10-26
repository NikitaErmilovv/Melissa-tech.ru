#!/usr/bin/env python3
"""Rebuild about.html for six local prototypes (SDC layout)."""

from __future__ import annotations

import re
from pathlib import Path

from patch_six_org_labels_2gis import ORG_TYPES
from scaffold_six_from_prime38 import SITES, enrich_site

ROOT = Path(__file__).resolve().parents[1]

PHILOSOPHY_DEFAULT = (
    "Мы не гонимся за количеством машин в день. Каждый автомобиль проходит осмотр, "
    "согласование работ и контроль результата. Работаем по записи — без спешки."
)

LOBAVTO_PHILOSOPHY = (
    "Специализируемся на лобовых и других автостёклах: от ремонта скола до замены и "
    "восстановления герметичности. Перед работами осматриваем стекло и согласуем объём — "
    "без скрытых доплат."
)

FAQ_DEFAULT = """
    <details open><summary>Как узнать точную стоимость?</summary><p>Позвоните или напишите в мессенджер — опишите задачу или пришлите фото. Можно приехать на осмотр: после оценки назовём стоимость.</p></details>
    <details><summary>Сколько времени занимает работа?</summary><p>Зависит от услуги и состояния автомобиля. Точные сроки согласуем при осмотре и записи.</p></details>
    <details><summary>Работаете по записи?</summary><p>Да, принимаем по предварительной записи — так удобнее спланировать бокс и время мастера.</p></details>
    <details><summary>Где посмотреть отзывы?</summary><p>Отзывы и рейтинг — в карточке организации в 2ГИС, ссылка есть на сайте и в мессенджерах.</p></details>
"""

FAQ_LOBAVTO = """
    <details open><summary>Можно ли отремонтировать скол без замены стекла?</summary><p>Если повреждение в зоне ремонта и не затронута критическая область обзора, часто достаточно локального ремонта. Окончательное решение — после осмотра.</p></details>
    <details><summary>Сколько стоит замена лобового?</summary><p>Цена зависит от модели авто, типа стекла и объёма работ. Назовём сумму после осмотра или по VIN/модели по телефону.</p></details>
    <details><summary>Что такое восстановление герметичности?</summary><p>Если по краю лобового попадает вода в салон, выполняем переклейку или перегерметизацию с разбором обшивки и новым герметиком по технологии.</p></details>
    <details><summary>Как записаться?</summary><p>Звоните или пишите в WhatsApp/Telegram — согласуем время визита.</p></details>
"""


def extract_site_bottom(site_dir: Path) -> str:
    contact = (site_dir / "contact.html").read_text(encoding="utf-8")
    m = re.search(r"(<div class=\"site-bottom\">.*?</div>)\s*<script", contact, re.DOTALL)
    if not m:
        raise RuntimeError(f"site-bottom not found in {site_dir}")
    return m.group(1)


def extract_nav(site_dir: Path) -> str:
    contact = (site_dir / "contact.html").read_text(encoding="utf-8")
    m = re.search(r"(<nav class=\"site-nav\">.*?</nav>)", contact, re.DOTALL)
    if not m:
        raise RuntimeError(f"nav not found in {site_dir}")
    return m.group(1)


def css_version(site_dir: Path) -> str:
    contact = (site_dir / "contact.html").read_text(encoding="utf-8")
    m = re.search(r"styles\.css\?v=(\d+)", contact)
    return m.group(1) if m else "1"


def about_photos(site_dir: Path, site: dict) -> list[str]:
    svc = site_dir / "img" / "works" / "services"
    if svc.is_dir():
        files = sorted(svc.glob("*.jpg"))
        if len(files) >= 3:
            return [f"img/works/services/{p.name}" for p in files[:3]]
    inc = site_dir / "img" / "works" / "incoming" / site["photo_folder"]
    files = sorted(inc.glob("*.jpg")) if inc.is_dir() else []
    if len(files) >= 3:
        return [f"img/works/incoming/{site['photo_folder']}/{p.name}" for p in files[:3]]
    while len(files) < 3 and files:
        files.append(files[0])
    if not files:
        return ["img/works/incoming/{}/01-2gis.jpg".format(site["photo_folder"])] * 3
    return [f"img/works/incoming/{site['photo_folder']}/{p.name}" for p in files[:3]]


def hero_subtitle(site: dict, org: dict) -> str:
    lead = site.get("about_lead") or site.get("hero_lead") or ""
    if "—" in lead:
        part = lead.split("—", 1)[1].strip()
        if part.endswith("."):
            part = part[:-1]
        return part + "."
    return lead


def build_about(site_dir: Path, site: dict, org: dict) -> str:
    photos = about_photos(site_dir, site)
    philosophy = LOBAVTO_PHILOSOPHY if site["slug"] == "lobavto-nizhniy-novgorod" else PHILOSOPHY_DEFAULT
    faq = FAQ_LOBAVTO if site["slug"] == "lobavto-nizhniy-novgorod" else FAQ_DEFAULT
    v = css_version(site_dir)
    nav = extract_nav(site_dir)
    bottom = extract_site_bottom(site_dir)
    subtitle = hero_subtitle(site, org)
    if site["slug"] == "lobavto-nizhniy-novgorod":
        subtitle = (
            "Ремонт и замена лобовых стёкол, восстановление герметичности и установка "
            "бронированных стёкол. Работаем по записи."
        )

    about_h1 = org["about_h1"]
    if site["slug"] == "lobavto-nizhniy-novgorod":
        about_h1 = 'УСТАНОВКА И РЕМОНТ<br><span class="accent">ЛОБОВЫХ СТЕКОЛ</span>'

    return f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>О нас — {site['brand']}</title>
<link rel="stylesheet" href="styles.css?v={v}">
</head>
<body>
{nav}

<section class="subpage-hero">
  <div class="kicker">03 / О НАС</div>
  <h1>{about_h1}</h1>
  <p>{subtitle}</p>
</section>

<div class="stats">
  <div class="stat"><b>{site.get('years', '5+')}</b><span>ЛЕТ НА РЫНКЕ</span></div>
  <div class="stat"><b id="stat-reviews">0</b><span>ОТЗЫВОВ · 2ГИС</span></div>
  <div class="stat"><b id="stat-rating">{site.get('rating', '5.0')}</b><span>СРЕДНЯЯ ОЦЕНКА · 2ГИС</span></div>
  <div class="stat"><b>100%</b><span>РАБОТА ПО ЗАПИСИ</span></div>
</div>

<section class="section">
  <div class="section-head">
    <div><div class="kicker">ФИЛОСОФИЯ</div><h2>КАЧЕСТВО<br><span class="accent">ВАЖНЕЕ СКОРОСТИ.</span></h2></div>
    <p class="intro">{philosophy}</p>
  </div>
  <div class="photo-strip">
    <div class="photo big" style="background-image:url('{photos[0]}')"></div>
    <div class="photo" style="background-image:url('{photos[1]}')"></div>
    <div class="photo" style="background-image:url('{photos[2]}')"></div>
  </div>
</section>

<section class="process">
  <div class="kicker">FAQ</div>
  <h2>ЧАСТЫЕ<br><span class="accent">ВОПРОСЫ.</span></h2>
  <div class="faq">
{faq}
  </div>
</section>

{bottom}
<script src="nav.js"></script>
<script src="stats.js"></script>
</body>
</html>
"""


def patch_accent_css(site_dir: Path) -> None:
    css_path = site_dir / "styles.css"
    text = css_path.read_text(encoding="utf-8")
    new_root = """:root{
  --accent:#5870cf;
  --accent-soft:rgba(88, 112, 207, .42);
  --accent-hover:#7088d9;
  --accent-deep:#4558a8;
  --accent-ink:#060912;
  --accent-rgb:88, 112, 207;
}"""
    text = re.sub(r":root\{[^}]+\}", new_root, text, count=1)
    css_path.write_text(text, encoding="utf-8")


def main() -> None:
    for raw in SITES:
        site = enrich_site(raw)
        org = ORG_TYPES[site["slug"]]
        site_dir = ROOT / site["slug"]
        html = build_about(site_dir, site, org)
        (site_dir / "about.html").write_text(html, encoding="utf-8")
        patch_accent_css(site_dir)
        print("about + accent", site["slug"])


if __name__ == "__main__":
    main()
