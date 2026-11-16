#!/usr/bin/env python3
"""Post-process kuzoff-tomsk: 2GIS media, RTG wrap configurator on index, contacts."""

from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "kuzoff-tomsk"
AUTO = ROOT / "auto-custom-chelyabinsk"
FIRM_ID = "70000001061703033"

sys.path.insert(0, str(ROOT / "scripts"))
from fetch_2gis_firm_photos import patch_index_works, sync_studio  # noqa: E402
from fetch_2gis_reviews import fetch_branch_reviews  # noqa: E402

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
      <div class="wrap-badge"><b id="status">Подготовка 3D…</b></div>
      <div class="wrap-view-actions">
        <button id="rotate" class="tool active" type="button">Автоповорот</button>
        <button id="reset" class="tool" type="button">Сброс</button>
      </div>
      <div id="marker" class="marker" style="display:none"></div>
    </section>
    <aside class="sidebar">
      <h2 class="side-title">Соберите оклейку</h2>
      <div class="wrap-block">
        <div class="label">Автомобиль</div>
        <div class="tools">
          <button class="tool active" data-model="mercedes" type="button">Седан</button>
          <button class="tool" data-model="mazda" type="button">Кроссовер</button>
        </div>
      </div>
      <div class="wrap-block">
        <div class="label">Готовые варианты</div>
        <div class="presets">
          <button class="preset active" data-preset="0" type="button"><i class="stock"></i><span>Сток<small>Заводской цвет</small></span></button>
          <button class="preset" data-preset="1" type="button"><i style="background:#0b0d10"></i><span>Obsidian Black<small>Сатин · перламутр</small></span></button>
          <button class="preset" data-preset="2" type="button"><i style="background:#63351f"></i><span>Cocoa Brown<small>Глянец · металлик</small></span></button>
          <button class="preset" data-preset="3" type="button"><i style="background:#f5f5f2"></i><span>Pearl White<small>Глянец · металлик</small></span></button>
        </div>
      </div>
      <div class="wrap-block">
        <div class="label">Зоны кузова</div>
        <div class="zones" id="zones"></div>
      </div>
      <div class="wrap-block">
        <div class="label">Выбранная деталь</div>
        <div id="selectedInfo" class="selectedInfo">Нажмите на деталь на авто</div>
      </div>
      <div class="wrap-block">
        <div class="label">Инструмент</div>
        <div class="tools">
          <button class="tool active" data-tool="select" type="button">Выбор</button>
          <button class="tool" data-tool="fill" type="button">Заливка</button>
          <button class="tool" data-tool="remove" type="button">Снять</button>
        </div>
      </div>
      <div class="wrap-block">
        <div class="label">Цвет плёнки</div>
        <div id="swatches" class="swatches"></div>
      </div>
      <div class="wrap-block">
        <div class="label">Финиш</div>
        <div class="finish">
          <button class="active" data-finish="gloss" type="button">Глянец</button>
          <button data-finish="satin" type="button">Сатин</button>
          <button data-finish="matte" type="button">Матовый</button>
        </div>
      </div>
      <div class="wrap-block">
        <div class="label">Эффект</div>
        <div class="finish">
          <button class="active" data-effect="solid" type="button">Однотон</button>
          <button data-effect="metal" type="button">Металлик</button>
          <button data-effect="pearl" type="button">Перламутр</button>
        </div>
      </div>
      <div class="wrap-block" hidden>
        <div class="label">Детали</div>
        <div id="parts" class="parts"></div>
      </div>
    </aside>
    <div class="summary">
      <div class="summary-row">
        <div>
          <div class="sumlabel">Ваш подбор</div>
          <div id="total" class="total">0 ₽</div>
        </div>
        <a class="cta" id="quote" href="tel:+79009211001">Позвонить</a>
      </div>
    </div>
  </div>
</section>"""


def copy_wrap_stack() -> None:
    for name in (
        "wrap-boot.js",
        "wrap-configurator.core.js",
        "wrap-configurator.css",
        "index-glb-prefetch.js",
        "wrap-loader.js",
    ):
        shutil.copy2(AUTO / name, SITE / name)
    shutil.copy2(AUTO / "data" / "wrap-zones.json", SITE / "data" / "wrap-zones.json")
    (SITE / "models").mkdir(parents=True, exist_ok=True)
    for model in ("mercedes.glb", "mazda.glb"):
        shutil.copy2(AUTO / "models" / model, SITE / "models" / model)
    dest_vendor = SITE / "vendor" / "three"
    src_vendor = AUTO / "vendor" / "three"
    if dest_vendor.exists():
        shutil.rmtree(dest_vendor)
    shutil.copytree(src_vendor, dest_vendor)


def sync_media() -> list[str]:
    studio = {
        "slug": "kuzoff-tomsk",
        "photo_folder": "kuzoff",
        "firm_id": FIRM_ID,
        "city_slug": "tomsk",
    }
    sync_studio(studio, limit=16)
    incoming = SITE / "img" / "works" / "incoming" / "kuzoff"
    rel_paths = sorted(
        f"img/works/incoming/kuzoff/{p.name}"
        for p in incoming.glob("*")
        if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}
    )
    if rel_paths:
        hero = SITE / "img" / "hero-home.jpg"
        shutil.copy2(SITE / "img" / "works" / "incoming" / "kuzoff" / Path(rel_paths[0]).name, hero)
        patch_index_works("kuzoff-tomsk", rel_paths)
        patch_works_strip(rel_paths)
    reviews = fetch_branch_reviews(FIRM_ID, limit=12)
    (SITE / "data" / "reviews-2gis.json").write_text(
        json.dumps(reviews, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    return rel_paths


def patch_works_strip(rel_paths: list[str]) -> None:
    idx = SITE / "index.html"
    tiles = [
        f'    <a class="photo" href="gallery.html" style="background-image:url(\'{rel}\')"></a>'
        for rel in rel_paths[:5]
    ]
    block = "  <div class=\"photo-strip photo-strip--services\">\n" + "\n".join(tiles) + "\n  </div>"
    text = idx.read_text(encoding="utf-8")
    text = re.sub(
        r'(<section class="section" id="works">[\s\S]*?)<div class="photo-strip photo-strip--services">.*?</div>',
        r"\1" + block,
        text,
        count=1,
        flags=re.S,
    )
    idx.write_text(text, encoding="utf-8")


def fix_home_services(rel_paths: list[str]) -> None:
    idx = SITE / "index.html"
    text = idx.read_text(encoding="utf-8")
    tiles = [
        ("polish", "ПОЛИРОВКА", "img/services-home/01-polish.jpg"),
        ("ppf", "ЗАЩИТНАЯ ПЛЁНКА", "img/services-home/02-ppf.jpg"),
        ("wrap", "ОКЛЕЙКА", "img/services-home/03-wrap.jpg"),
        ("engine-bay", "МОЙКА ПОДКАПОТНОГО ПРОСТРАНСТВА", "img/services-home/04-engine-bay.jpg"),
        ("wash", "ДЕТЕЙЛИНГ-МОЙКА", "img/services-home/05-wash.jpg"),
    ]
    if len(rel_paths) >= 5:
        for i in range(5):
            tiles[i] = (tiles[i][0], tiles[i][1], rel_paths[i % len(rel_paths)])

    block_lines = [
        f'    <a class="photo" href="services/{slug}.html" style="background-image:url(\'{img}\')"><span class="tag">{tag}</span></a>'
        for slug, tag, img in tiles
    ]
    block = (
        '  <div class="photo-strip photo-strip--services photo-strip--home">\n'
        + "\n".join(block_lines)
        + "\n  </div>"
    )
    text = re.sub(
        r'<div class="photo-strip photo-strip--services photo-strip--home">.*?</div>',
        block,
        text,
        count=1,
        flags=re.S,
    )
    idx.write_text(text, encoding="utf-8")


def patch_index_wrap() -> None:
    idx = SITE / "index.html"
    html = idx.read_text(encoding="utf-8")
    if "wrap-configurator.css" not in html:
        html = html.replace(
            '<link rel="stylesheet" href="styles.css',
            '<link rel="stylesheet" href="wrap-configurator.css?v=rtg2">\n<link rel="stylesheet" href="styles.css',
            1,
        )
    if 'id="wrap"' not in html:
        html = html.replace(
            '</section>\n\n<section class="section" id="compare">',
            "</section>\n\n" + WRAP_BAND + '\n\n<section class="section" id="compare">',
            1,
        )
    if 'href="#wrap"' not in html:
        html = html.replace(
            '<a class="button dark" href="services.html">СМОТРЕТЬ УСЛУГИ</a>',
            '<a class="button dark" href="#wrap">СОБРАТЬ ОКЛЕЙКУ</a>',
            1,
        )
    lead = (
        "Детейлинг в Томске: мойка, полировка, защитные покрытия и тонировка. "
        "На главной — 3D-конфигуратор оклейки (RTG): соберите вариант и позвоните для расчёта."
    )
    html = re.sub(
        r"<p>Детейлинг-студия в Томске:.*?</p>",
        f"<p>{lead}</p>",
        html,
        count=1,
        flags=re.S,
    )
    if "wrap-loader.js" not in html:
        html = html.replace(
            "</body>",
            '<script type="importmap">{"imports":{"three":"./vendor/three/build/three.module.js",'
            '"three/addons/":"./vendor/three/examples/jsm/"}}</script>\n'
            '<link rel="modulepreload" href="./vendor/three/build/three.module.js">\n'
            '<link rel="modulepreload" href="wrap-configurator.core.js?v=rtg2">\n'
            '<link rel="preload" href="models/mercedes.glb?v=5" as="fetch" type="model/gltf-binary" crossorigin fetchpriority="high">\n'
            '<script type="module" src="wrap-loader.js?v=rtg2"></script>\n</body>',
        )
    idx.write_text(html, encoding="utf-8")


def patch_styles() -> None:
    css = SITE / "styles.css"
    text = css.read_text(encoding="utf-8")
    snippet = """
.wrap-band{padding:120px 6vw 40px}
.wrap-band #wrap-cfg{margin-top:36px}
"""
    if ".wrap-band{" not in text:
        text += snippet
    css.write_text(text, encoding="utf-8")


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
  hoursLine: "По предварительной записи · 10:00–20:00",
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

    footer_phone = (
        '<a class="footer-phone-inline" href="tel:+79009211001">+7 (900) 921-10-01</a>\n'
        '      <a class="footer-phone-inline" href="tel:+79234088056">+7 (923) 408-80-56</a>'
    )
    for html_path in SITE.rglob("*.html"):
        text = html_path.read_text(encoding="utf-8")
        new = text.replace(
            '<a class="footer-phone-inline" href="tel:+79009211001">+7 (900) 921-10-01</a>',
            footer_phone,
        )
        if new != text:
            html_path.write_text(new, encoding="utf-8")


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
    copy_wrap_stack()
    rel = sync_media()
    fix_home_services(rel)
    patch_index_wrap()
    patch_styles()
    patch_contacts()
    patch_gallery_manifest()
    print("kuzoff-tomsk patched:", len(rel), "photos")


if __name__ == "__main__":
    main()