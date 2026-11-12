#!/usr/bin/env python3
"""Recreate auto-custom-chelyabinsk from rp-detailing-tolyatti + D2 wrap configurator (read-only copy)."""

from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "rp-detailing-tolyatti"
D2 = ROOT / "d2-detailing"
DEST = ROOT / "auto-custom-chelyabinsk"
ASSET_LOGO = Path(
    "/home/ubuntu/.cursor/projects/workspace/assets/4e9474d8-f9db-4cb2-8610-66ce66805a4a.png"
)

sys.path.insert(0, str(ROOT / "scripts"))
from build_den_dream import RP, apply_text, patch_files, patch_hero_index  # noqa: E402

try:
    from fetch_2gis_reviews import fetch_branch_reviews
except ImportError:
    fetch_branch_reviews = None  # type: ignore

SITE = {
    "slug": "auto-custom-chelyabinsk",
    "photo_folder": "auto-custom",
    "brand": "Auto Custom",
    "logo_mark": "Auto",
    "logo_word": "Custom",
    "hero_html": (
        'AUTO<br><span class="accent">CUSTOM</span><br>'
        '<span class="hero-title-sub">ДЕТЕЙЛИНГ<br>СТУДИЯ</span>'
    ),
    "city": "Челябинск",
    "city_upper": "ЧЕЛЯБИНСК",
    "city_slug": "chelyabinsk",
    "firm_id": "70000001034460339",
    "firm_url": "https://2gis.ru/chelyabinsk/firm/70000001034460339",
    "phone_tel": "+79000623277",
    "phone_display": "+7 (900) 062-32-77",
    "phone2_tel": "",
    "phone2_display": "",
    "wa": "79000623277",
    "tg": "",
    "address": "Градский Прииск пос., Курчатовский район, Челябинск, 454100",
    "schedule": "По записи · уточняйте по телефону",
    "map_lat": 55.184049,
    "map_lon": 61.263874,
    "port": 8114,
    "rating": "5.0",
    "reviews": "230",
    "theme_class": "hero--auto-custom",
    "hero_lead": (
        "Детейлинг в Челябинске: оклейка плёнкой, PPF, керамика, полировка и защита кузова. "
        "На главной — 3D-конфигуратор оклейки: соберите вариант и позвоните для расчёта."
    ),
    "about_lead": (
        "Auto Custom на Градском Прииске — студия оклейки и детейлинга в Курчатовском районе Челябинска. "
        "Работаем по записи: звоните, пишите в WhatsApp или на почту auto.custom174@gmail.com."
    ),
}

HOME_SERVICES = [
    {"slug": "wrap", "tag": "ОКЛЕЙКА", "image": "img/services-home/01.jpg"},
    {
        "slug": "ppf",
        "tag_html": '<span class="tag tag-split"><span>ЗОНЫ</span><span>РИСКА</span></span>',
        "image": "img/services-home/02.jpg",
    },
    {"slug": "armor", "tag": "БРОНИРОВАНИЕ", "image": "img/services-home/03.jpg"},
    {"slug": "polish", "tag": "ПОЛИРОВКА", "image": "img/services-home/04.jpg"},
    {"slug": "ceramic", "tag": "КЕРАМИКА", "image": "img/services-home/05.jpg"},
    {"slug": "antichrome", "tag": "АНТИХРОМ", "image": "img/services-home/06.jpg"},
    {"slug": "sound", "tag": "ШУМКА", "image": "img/services-home/07.jpg"},
    {
        "slug": "wash",
        "tag_html": '<span class="tag tag-split"><span>DETAILING</span><span>МОЙКА</span></span>',
        "image": "img/services-home/08.jpg",
    },
]

CATALOG = [
    ("wrap", "Оклейка плёнкой", "Защитная и цветная плёнка на кузов и элементы.", "от 8 000 ₽"),
    ("ppf", "Зоны риска", "Антигравийная PPF на капот, бампер и зеркала.", "от 75 000 ₽"),
    ("armor", "Бронирование", "Бронирование лобового и боковых стёкол.", "после осмотра"),
    ("polish", "Полировка", "Восстановление блеска лакокрасочного покрытия.", "от 26 000 ₽"),
    ("ceramic", "Керамика", "Защитное керамическое покрытие.", "от 18 000 ₽"),
    ("antichrome", "Антихром", "Матирование или оклейка хромированных деталей.", "от 12 000 ₽"),
    ("sound", "Шумка", "Шумо- и виброизоляция салона.", "после осмотра"),
    ("wash", "Детейлинг мойка", "Комплексная бережная мойка.", "от 3 000 ₽"),
]

WRAP_BAND = """<section class="wrap-band section" id="wrap">
  <div class="section-head">
    <div>
      <div class="kicker">КОНФИГУРАТОР</div>
      <h2>СОБЕРИТЕ<br><span class="accent">ОКЛЕЙКУ.</span></h2>
    </div>
    <p class="intro">Выберите автомобиль, детали и финиш. Сумма на экране — ориентир; точный расчёт — после осмотра.</p>
  </div>
  <div id="wrap-cfg">
    <section class="wrap-viewer">
      <div id="canvas" class="canvas"></div>
      <div class="wrap-hero"><h3>Оклейка <span>плёнкой</span></h3></div>
      <div class="wrap-badge"><b id="status">Загрузка модели</b></div>
      <div class="wrap-view-actions">
        <button id="rotate" class="tool active" type="button">↻ Автовращение</button>
        <button id="reset" class="tool" type="button">⟲ Сброс</button>
      </div>
      <div id="marker" class="marker" style="display:none"></div>
    </section>
    <aside class="sidebar">
      <h2 class="side-title">Оклейка</h2>
      <div class="wrap-block">
        <div class="label">Автомобиль</div>
        <div class="tools" style="grid-template-columns:repeat(2,1fr)">
          <button class="tool active" data-model="mercedes" type="button">Седан</button>
          <button class="tool" data-model="mazda" type="button">Кроссовер</button>
        </div>
      </div>
      <div class="wrap-block">
        <div class="label">Готовые варианты</div>
        <div class="presets">
          <button class="preset active" data-preset="0" type="button"><i class="stock"></i><span>Сток<small>Заводской цвет</small></span></button>
          <button class="preset" data-preset="1" type="button"><i style="background:#0b0d10"></i><span>Obsidian Black<small>сатин · Перламутр</small></span></button>
          <button class="preset" data-preset="2" type="button"><i style="background:#63351f"></i><span>Cocoa Brown<small>Глянец · Металлик</small></span></button>
          <button class="preset" data-preset="3" type="button"><i style="background:#f5f5f2"></i><span>Pearl White<small>Глянец · Металлик</small></span></button>
        </div>
      </div>
      <div class="wrap-block" hidden><div class="label">Зоны кузова</div><div class="zones" id="zones"></div></div>
      <div class="wrap-block">
        <div class="label">Выбранная деталь</div>
        <div id="selectedInfo" class="selectedInfo">Нажмите на деталь автомобиля</div>
      </div>
      <div class="wrap-block">
        <div class="label">Инструмент</div>
        <div class="tools" style="grid-template-columns:repeat(3,1fr)">
          <button class="tool active" data-tool="select" type="button">Выбор</button>
          <button class="tool" data-tool="fill" type="button">Заливка</button>
          <button class="tool" data-tool="remove" type="button">Отмена</button>
        </div>
      </div>
      <div class="wrap-block"><div class="label">Цвет плёнки</div><div id="swatches" class="swatches"></div></div>
      <div class="wrap-block">
        <div class="label">Финиш</div>
        <div class="finish">
          <button class="active" data-finish="gloss" type="button">Глянец</button>
          <button data-finish="satin" type="button">сатин</button>
          <button data-finish="matte" type="button">Матовый</button>
        </div>
      </div>
      <div class="wrap-block">
        <div class="label">Материал / эффект</div>
        <div class="finish">
          <button class="active" data-effect="solid" type="button">Однотон</button>
          <button data-effect="metal" type="button">Металлик</button>
          <button data-effect="pearl" type="button">Перламутр</button>
        </div>
      </div>
      <div class="wrap-block" hidden><div class="label">Детали</div><div id="parts" class="parts"></div></div>
    </aside>
    <div class="summary">
      <div class="summary-row">
        <div><div class="sumlabel">Ваш подбор</div><div id="total" class="total">0 ₽</div></div>
        <a class="cta" id="quote" href="tel:+79000623277">ПОЛУЧИТЬ РАСЧЁТ</a>
      </div>
    </div>
  </div>
</section>"""


def apply_auto_custom_theme(css: str) -> str:
    accent = """:root{
  --accent:#d4a82b;
  --accent-soft:rgba(212,168,43,.38);
  --accent-hover:#e8bb3a;
  --accent-deep:#a8841f;
  --accent-ink:#0a0a0a;
  --accent-rgb:212,168,43;
}"""
    css = re.sub(r":root\{[^}]+\}", accent, css, count=1)
    css = css.replace(".logo-mark{color:var(--accent)", ".logo-mark{color:#c8c8c8", 1)
    css = css.replace(
        ".site-nav .logo .logo-mark{color:var(--accent)}",
        ".site-nav .logo .logo-mark{color:#c8c8c8}",
    )
    if ".hero--auto-custom" not in css:
        css += """

.hero--auto-custom .heroimg{opacity:.9}
.hero--auto-custom .hero-logo-spacer .accent{color:var(--accent)}
.site-nav .logo .logo-word{color:var(--accent)}
"""
    if ".photo-strip--home-four" not in css:
        css += """
.photo-strip--home-four{grid-template-columns:repeat(4,1fr)!important}
@media (max-width:900px){
  .photo-strip--home-four{grid-template-columns:repeat(2,1fr)!important}
}
"""
    return css


def copy_wrap_stack() -> None:
    for name in ("wrap-boot.js", "wrap-configurator.core.js", "wrap-configurator.css", "index-glb-prefetch.js"):
        shutil.copy2(D2 / name, DEST / name)
    shutil.copy2(D2 / "data" / "wrap-zones.json", DEST / "data" / "wrap-zones.json")
    for model in ("mercedes.glb", "mazda.glb"):
        shutil.copy2(D2 / "models" / model, DEST / "models" / model)
    dest_vendor = DEST / "vendor" / "three"
    src_vendor = D2 / "vendor" / "three"
    if dest_vendor.exists():
        shutil.rmtree(dest_vendor)
    shutil.copytree(src_vendor, dest_vendor)


def home_strip_html() -> str:
    lines = []
    for svc in HOME_SERVICES:
        tag = svc.get("tag_html") or f'<span class="tag">{svc["tag"]}</span>'
        lines.append(
            f'    <a class="photo" href="services/{svc["slug"]}.html" '
            f'style="background-image:url(\'{svc["image"]}\')">{tag}</a>'
        )
    return "\n".join(lines)


def patch_services_catalog() -> None:
    path = DEST / "services.html"
    rows = []
    for i, (slug, title, lead, cost) in enumerate(CATALOG, 1):
        rows.append(
            f'    <a class="service-row" href="services/{slug}.html" id="svc-{i:02d}">'
            f'<div class="idx">{i:02d}</div><div><h3>{title}</h3>'
            f'<div class="service-desc"><p class="service-lead">{lead}</p></div></div>'
            f'<div class="cost">{cost}</div></a>'
        )
    html = path.read_text(encoding="utf-8")
    html = re.sub(
        r"<h1>.*?</h1>",
        f"<h1>AUTO CUSTOM<br><span class=\"accent\">{SITE['city_upper']}</span></h1>",
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r'  <div class="service-list">.*?</div>\n</section>',
        "  <div class=\"service-list\">\n" + "\n".join(rows) + "\n  </div>\n</section>",
        html,
        count=1,
        flags=re.S,
    )
    path.write_text(html, encoding="utf-8")


def fix_hero_block() -> None:
    idx = DEST / "index.html"
    html = idx.read_text(encoding="utf-8")
    html = re.sub(
        r'<div class="hero-logo-wrap">.*?</div>\s*</div>\s*<div class="hero-content">',
        (
            '<div class="hero-logo-wrap">\n'
            f'        <h1 class="hero-logo-spacer hero-logo-display">{SITE["hero_html"]}</h1>\n'
            "      </div>\n    </div>\n    <div class=\"hero-content\">"
        ),
        html,
        count=1,
        flags=re.S,
    )
    idx.write_text(html, encoding="utf-8")


def patch_index() -> None:
    idx = DEST / "index.html"
    html = idx.read_text(encoding="utf-8")
    html = re.sub(
        r'<div class="photo-strip photo-strip--services photo-strip--home">.*?</div>',
        '<div class="photo-strip photo-strip--services photo-strip--home">\n' + home_strip_html() + "\n  </div>",
        html,
        count=1,
        flags=re.S,
    )
    html = re.sub(
        r"<h2>ДЕТЕЙЛИНГ<br><span class=\"accent\">И ЗАЩИТА КУЗОВА</span></h2>",
        "<h2>УСЛУГИ<br><span class=\"accent\">СТУДИИ</span></h2>",
        html,
        count=1,
    )
    html = re.sub(
        r'<p class="intro">Работаем по записи — стоимость после осмотра автомобиля\.</p>',
        "<p class=\"intro\">Оклейка, зоны риска, бронирование, полировка, керамика, антихром, шумка и детейлинг-мойка — в одной студии.</p>",
        html,
        count=1,
    )
    if "wrap-configurator.css" not in html:
        html = html.replace(
            '<link rel="stylesheet" href="styles.css',
            '<link rel="stylesheet" href="wrap-configurator.css?v=1">\n<link rel="stylesheet" href="styles.css',
            1,
        )
    if 'id="wrap"' not in html:
        html = html.replace(
            '</section>\n\n<section class="section" id="compare">',
            '</section>\n\n' + WRAP_BAND + '\n\n<section class="section" id="compare">',
            1,
        )
    html = html.replace(
        "photo-strip--services photo-strip--home",
        "photo-strip--services photo-strip--home photo-strip--home-four",
    )
    hero_actions = html
    if 'href="#wrap"' not in hero_actions:
        html = re.sub(
            r'(<a class="button dark" href=")[^"]+(">)[^<]+(</a>)',
            r'\1#wrap\2СОБРАТЬ ОКЛЕЙКУ\3',
            html,
            count=1,
        )
    if "wrap-boot.js" not in html:
        html = html.replace(
            "</body>",
            '<script type="importmap">{"imports":{"three":"vendor/three/build/three.module.js",'
            '"three/addons/":"vendor/three/examples/jsm/"}}</script>\n'
            '<script type="module" src="wrap-boot.js?v=1"></script>\n</body>',
        )
    idx.write_text(html, encoding="utf-8")


def service_page_from(src_name: str, dst_name: str, title: str, h1: str, lead: str) -> None:
    src = DEST / "services" / src_name
    if not src.is_file():
        return
    text = apply_text(src.read_text(encoding="utf-8"), SITE)
    text = re.sub(r"<title>[^<]+</title>", f"<title>{title} — Auto Custom</title>", text, count=1)
    text = re.sub(
        r"<h1[^>]*>.*?</h1>",
        f"<h1>{h1}</h1>",
        text,
        count=1,
        flags=re.S,
    )
    if lead:
        text = re.sub(r"<p>[^<]{20,}</p>", f"<p>{lead}</p>", text, count=1, flags=re.S)
    (DEST / "services" / dst_name).write_text(text, encoding="utf-8")


def prune_services() -> None:
    keep = {"wrap", "ppf", "polish", "ceramic", "wash", "armor", "antichrome", "sound"}
    for path in list((DEST / "services").glob("*.html")):
        if path.stem not in keep:
            path.unlink()

    service_page_from("ppf.html", "ppf.html", "Зоны риска", "ЗОНЫ<br><span class=\"accent\">РИСКА</span>", "Антигравийная плёнка на зоны риска и отдельные элементы.")
    if not (DEST / "services" / "armor.html").is_file():
        shutil.copy2(DEST / "services" / "ceramic.html", DEST / "services" / "armor.html")
    service_page_from("armor.html", "armor.html", "Бронирование", "БРОНИРОВАНИЕ<br><span class=\"accent\">СТЁКОЛ</span>", "Защитная плёнка на лобовое и боковые стёкла.")
    if not (DEST / "services" / "antichrome.html").is_file():
        shutil.copy2(DEST / "services" / "wrap.html", DEST / "services" / "antichrome.html")
    service_page_from(
        "antichrome.html",
        "antichrome.html",
        "Антихром",
        "АНТИХРОМ",
        "Матирование или оклейка хромированных деталей.",
    )
    if (DEST / "services" / "soundproof.html").is_file():
        shutil.copy2(DEST / "services" / "soundproof.html", DEST / "services" / "sound.html")
    service_page_from("sound.html", "sound.html", "Шумка", "ШУМКА", "Шумо- и виброизоляция салона и дверей.")
    for name in ("wrap.html", "polish.html", "ceramic.html", "wash.html"):
        p = DEST / "services" / name
        if p.is_file():
            p.write_text(apply_text(p.read_text(encoding="utf-8"), SITE), encoding="utf-8")


def setup_photos_placeholder() -> None:
    incoming = DEST / "img" / "works" / "incoming" / SITE["photo_folder"]
    incoming.mkdir(parents=True, exist_ok=True)
    src_in = SRC / "img" / "works" / "incoming" / "rp"
    for i, src in enumerate(sorted(src_in.glob("*"))[:5], 1):
        shutil.copy2(src, incoming / f"{i:02d}-placeholder.jpg")


def main() -> None:
    if not SRC.is_dir() or not D2.is_dir():
        raise SystemExit("Need rp-detailing-tolyatti and d2-detailing")
    if DEST.exists():
        shutil.rmtree(DEST)
    shutil.copytree(
        SRC,
        DEST,
        ignore=shutil.ignore_patterns("__pycache__", ".DS_Store"),
    )
    (DEST / "models").mkdir(exist_ok=True)
    copy_wrap_stack()
    patch_files(DEST, SITE)
    css = apply_auto_custom_theme((DEST / "styles.css").read_text(encoding="utf-8"))
    (DEST / "styles.css").write_text(css, encoding="utf-8")
    patch_index()
    fix_hero_block()
    patch_services_catalog()
    prune_services()
    setup_photos_placeholder()
    if ASSET_LOGO.is_file():
        shutil.copy2(ASSET_LOGO, DEST / "img" / "logo-auto-custom-ref.png")
    (DEST / "deploy-version.txt").write_text(
        f"site={SITE['slug']}\n"
        f"brand={SITE['brand']}\n"
        f"template=rp-detailing-tolyatti\n"
        f"wrap-config=d2-detailing-copy\n"
        f"local=http://127.0.0.1:{SITE['port']}/\n"
        f"2gis={SITE['firm_url']}\n"
        f"deploy-trigger=auto-custom-rp-rebuild-20261112\n",
        encoding="utf-8",
    )
    (DEST / "README.md").write_text(
        f"# {SITE['brand']} — {SITE['city']}\n\n"
        "Шаблон: `rp-detailing-tolyatti`. 3D-конфигуратор оклейки — копия из `d2-detailing` (сам D2 не меняется).\n\n"
        "Фото для галереи и карточек услуг — ждём от заказчика.\n",
        encoding="utf-8",
    )
    if fetch_branch_reviews:
        try:
            reviews = fetch_branch_reviews(SITE["firm_id"], limit=12)
            (DEST / "data" / "reviews-2gis.json").write_text(
                json.dumps(reviews, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
        except (TimeoutError, OSError, ValueError):
            pass
    print("OK:", DEST)


if __name__ == "__main__":
    main()
