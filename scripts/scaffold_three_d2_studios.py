#!/usr/bin/env python3
"""Scaffold 3 local sites from D2 (delaikuzov) template — 5 pages, no configurators."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "delaikuzov"
CSS_V = "80"

SITES = [
    {
        "slug": "klyaksa-tuning-noyabrsk",
        "photo_folder": "klyaksa",
        "name": "Клякса Tuning studio",
        "logo_mark": "КЛЯКСА",
        "logo_word": "TUNING",
        "city": "Ноябрьск",
        "city_slug": "noyabrsk",
        "firm_id": "70000001035583613",
        "phone_tel": "+79320590591",
        "phone_display": "+7 (932) 059-05-91",
        "address": "г. Ноябрьск, ул. Строителей, 24",
        "schedule": "Ежедневно · 10:00–20:00",
        "map_lat": 63.182081,
        "map_lon": 75.431801,
        "port": 8121,
        "rating": "5.0",
        "reviews_count": "99",
        "hero_lead": "Детейлинг-мойка, полировка, химчистка, защита кузова и салона, антигравий, антихром, тонировка и шумоизоляция в Ноябрьске.",
        "about": "Клякса Tuning studio — тюнинг и детейлинг в Ноябрьске. Мойка, полировка, химчистка, защитные покрытия, тонировка и шумоизоляция — подбираем решение после осмотра автомобиля.",
        "services": [
            ("Детейлинг-мойка", "Комплексная бережная мойка кузова и салона.", "после осмотра"),
            ("Полировка", "Восстановление блеска ЛКП и оптики.", "после осмотра"),
            ("Химчистка салона", "Глубокая очистка сидений, ковров и пластика.", "после осмотра"),
            ("Защита кузова и салона", "Керамика и защитные составы под задачу.", "после осмотра"),
            ("Антигравийное покрытие", "Плёнка на кузов и лобовое стекло.", "после осмотра"),
            ("Антихром", "Оклейка хрома в цвет кузова или чёрный.", "после осмотра"),
            ("Тонировка", "Тонировка стёкол и атермальная плёнка.", "после осмотра"),
            ("Шумоизоляция", "Обработка дверей, пола и арок.", "после осмотра"),
        ],
        "reviews": [
            ("«Отличная студия, аккуратная работа и нормальные цены.»", "Клиент · 2ГИС"),
            ("«Делали тонировку и полировку — доволен результатом.»", "Клиент · 2ГИС"),
        ],
    },
    {
        "slug": "mir-tonirovki-tobolsk",
        "photo_folder": "mir-tonirovki",
        "name": "Мир тонировки",
        "logo_mark": "МИР",
        "logo_word": "ТОНИРОВКИ",
        "city": "Тобольск",
        "city_slug": "tobolsk",
        "firm_id": "70000001030915203",
        "phone_tel": "+79829128333",
        "phone_display": "+7 (982) 912-83-33",
        "address": "г. Тобольск, ул. Семёна Ремезова, 109 (бокс 44)",
        "schedule": "Круглосуточно · по предварительной записи",
        "map_lat": 58.221180,
        "map_lon": 68.268880,
        "port": 8122,
        "rating": "4.7",
        "reviews_count": "54",
        "hero_lead": "Центр автотонирования в Тобольске: тонировка, оклейка плёнкой, полировка, шумоизоляция салона и нанесение защитной плёнки.",
        "about": "«Мир тонировки» — центр автотонирования в Тобольске. Тонировка стёкол, оклейка плёнкой, полировка, шумоизоляция и защитные решения для кузова и салона.",
        "services": [
            ("Тонировка стёкол", "Подбор плёнки и аккуратный монтаж.", "после осмотра"),
            ("Оклейка плёнкой", "Защитная и декоративная плёнка на кузов.", "после осмотра"),
            ("Полировка", "Полировка кузова и фар.", "после осмотра"),
            ("Нанесение защитной плёнки", "Антигравий и зоны риска.", "после осмотра"),
            ("Шумоизоляция салона", "Снижение шума и вибраций в салоне.", "после осмотра"),
            ("Антикоррозийная обработка", "Защита скрытых полостей и днища.", "после осмотра"),
        ],
        "reviews": [
            ("«Тонировали авто — всё ровно, без пузырей.»", "Клиент · 2ГИС"),
            ("«Хороший сервис, можно записаться заранее.»", "Клиент · 2ГИС"),
        ],
    },
    {
        "slug": "imperiya-avtokompleks-chelyabinsk",
        "photo_folder": "imperiya",
        "name": "Империя",
        "logo_mark": "ИМПЕРИЯ",
        "logo_word": "АВТОКОМПЛЕКС",
        "city": "Челябинск",
        "city_slug": "chelyabinsk",
        "firm_id": "70000001019425061",
        "phone_tel": "+73512582283",
        "phone_display": "+7 (351) 258-22-83",
        "address": "г. Челябинск, ул. Профессора Благих, 85, стр. 1",
        "schedule": "Ежедневно · 09:00–20:00",
        "map_lat": 55.224562,
        "map_lon": 61.290522,
        "port": 8123,
        "rating": "4.7",
        "reviews_count": "194",
        "hero_lead": "Автокомплекс в Челябинске: мойка, шиномонтаж, химчистка, кузовной и малярный ремонт, детейлинг, антикор и сезонное хранение шин.",
        "about": "Автокомплекс «Империя» — мойка, шиномонтаж, детейлинг, кузовные и малярные работы, антикор и хранение шин. Работаем комплексно — от мелкого ремонта до полного цикла по кузову.",
        "services": [
            ("Автомойка", "Мойка кузова и салона.", "после осмотра"),
            ("Шиномонтаж", "Сезонная замена и балансировка.", "после осмотра"),
            ("Химчистка салона", "Глубокая очистка интерьера.", "после осмотра"),
            ("Сезонное хранение шин", "Хранение комплектов на сезон.", "после осмотра"),
            ("Кузовной ремонт", "Восстановление геометрии и элементов кузова.", "после осмотра"),
            ("Малярные работы", "Покраска и локальный ремонт ЛКП.", "после осмотра"),
            ("Детейлинг", "Полировка, защита и уход за авто.", "после осмотра"),
            ("Антикоррозийная обработка", "Защита днища и скрытых полостей.", "после осмотра"),
            ("Мелкий ремонт автомобиля", "Оперативные работы без длительного простоя.", "после осмотра"),
        ],
        "reviews": [
            ("«Удобно, что всё в одном месте — мойка и шиномонтаж.»", "Клиент · 2ГИС"),
            ("«Делали кузовной ремонт — сроки соблюли.»", "Клиент · 2ГИС"),
        ],
    },
]


def firm_url(site: dict) -> str:
    return f"https://2gis.ru/{site['city_slug']}/firm/{site['firm_id']}"


def map_img(site: dict, size: str) -> str:
    lat, lon = site["map_lat"], site["map_lon"]
    return (
        f"https://static.maps.2gis.com/1.0?s={size}&c={lat},{lon}&z=16"
        f"&pt={lat},{lon}~k:p"
    )


def nav(site: dict) -> str:
    return f"""<nav class="site-nav">
  <div class="logo"><a href="index.html"><span class="logo-mark">{site['logo_mark']}</span><span class="logo-word">{site['logo_word']}</span></a></div>
  <div class="links"><a href="services.html">УСЛУГИ</a><a href="gallery.html">РАБОТЫ</a><a href="about.html">О НАС</a><a href="contact.html">КОНТАКТЫ</a></div>
  <div class="nav-actions">
    <a class="phone" href="tel:{site['phone_tel']}">{site['phone_display']}</a>
    <button class="nav-burger" type="button" aria-label="Открыть меню" aria-expanded="false">
      <span class="nav-burger-line"></span>
      <span class="nav-burger-line"></span>
      <span class="nav-burger-line"></span>
    </button>
  </div>
  <div class="nav-mobile-menu">
    <a href="services.html">УСЛУГИ</a>
    <a href="gallery.html">РАБОТЫ</a>
    <a href="about.html">О НАС</a>
    <a href="contact.html">КОНТАКТЫ</a>
  </div>
</nav>"""


def footer(site: dict) -> str:
    gis = firm_url(site)
    return f"""<footer class="site-footer">
  <div class="footer-grid footer-desktop-only">
    <div class="footer-col footer-col--brand-hours">
      <div class="footer-brand-block">
        <div class="footer-logo"><span>{site['logo_mark']}</span> {site['logo_word']}</div>
        <div class="footer-social"><a href="{gis}" target="_blank" rel="noopener noreferrer">2ГИС</a></div>
      </div>
      <div class="footer-hours-block">
        <b>РЕЖИМ РАБОТЫ</b>
        <span>{site['schedule']}</span>
      </div>
    </div>
    <div class="footer-col">
      <b>НАВИГАЦИЯ</b>
      <a href="index.html">Главная</a>
      <a href="services.html">Услуги</a>
      <a href="gallery.html">Работы</a>
      <a href="about.html">О нас</a>
      <a href="contact.html">Контакты</a>
    </div>
    <div class="footer-col">
      <b>КОНТАКТЫ</b>
      <a class="footer-phone-inline" href="tel:{site['phone_tel']}">{site['phone_display']}</a>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2026 {site['name']}</span>
    <span>{site['city'].upper()}</span>
  </div>
</footer>"""


def map_block(site: dict) -> str:
    gis = firm_url(site)
    d = map_img(site, "880x450")
    m = map_img(site, "720x720")
    brand = f"<span>{site['logo_mark']}</span> {site['logo_word']}"
    return f"""<section class="address-map" id="contacts">
  <div class="address-map-inner">
    <div class="address-map-grid">
      <div class="address-map-intro">
        <div class="address-map-kicker"><span class="address-map-line"></span><span class="kicker">ЛОКАЦИЯ</span></div>
        <h2 class="address-map-title">ГДЕ МЫ<br><span>НАХОДИМСЯ.</span></h2>
        <p class="address-map-text">{site['address']}</p>
      </div>
      <div class="address-map-visual">
        <a href="{gis}" class="address-map-frame" target="_blank" rel="noopener noreferrer">
          <img class="address-map-img address-map-img--desktop" src="{d}" alt="">
          <img class="address-map-img address-map-img--mobile" src="{m}" alt="">
        </a>
      </div>
      <div class="address-map-details-wrap">
        <a href="{gis}" class="address-map-btn" target="_blank" rel="noopener noreferrer">Открыть в 2ГИС</a>
      </div>
    </div>
  </div>
</section>"""


def head(site: dict, title: str) -> str:
    return f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>{title} — {site['name']}</title>
<link rel="stylesheet" href="styles.css?v={CSS_V}">
</head>
<body>
{nav(site)}"""


def service_rows(site: dict, slugs: list[str] | None = None) -> str:
    rows = []
    for i, (title, desc, cost) in enumerate(site["services"], 1):
        sid = f"svc-{i:02d}"
        slug = (slugs[i - 1] if slugs else None)
        if slug:
            row_open = f'    <a class="service-row" href="services/{slug}.html" id="{sid}">'
            row_close = "</a>"
        else:
            row_open = f'    <div class="service-row" id="{sid}">'
            row_close = "</div>"
        rows.append(
            f"{row_open}<div class=\"idx\">{i:02d}</div>"
            f'<div><h3>{title}</h3><div class="service-desc"><p class="service-lead">{desc}</p></div></div>'
            f'<div class="cost">{cost}</div>{row_close}'
        )
    return "\n".join(rows)


def home_service_tiles(site: dict, limit: int = 5) -> str:
    tiles = []
    for i, (title, _, _) in enumerate(site["services"][:limit], 1):
        tiles.append(
            f'    <a class="photo" href="services.html#svc-{i:02d}" '
            f'style="background-image:url(\'img/hero.jpg\')"><span class="tag">{title.upper()}</span></a>'
        )
    return "\n".join(tiles)


def reviews_html(site: dict) -> str:
    items = []
    for text, who in site["reviews"]:
        items.append(
            f'<div class="review"><div class="stars">★★★★★</div><p>{text}</p><small>{who}</small></div>'
        )
    return "\n".join(items)


def write_index(site: dict, dest: Path) -> None:
    gis = firm_url(site)
    body = f"""{head(site, site['name'])}

<section class="hero hero--studio">
  <div class="heroimg" style="background-image:url('img/hero.jpg')"></div>
  <div class="hero-stack">
    <h1 class="hero-brand">
      <span class="hero-brand-word">{site['logo_mark']}<br>{site['logo_word']}</span>
    </h1>
    <div class="hero-content">
      <p>{site['hero_lead']}</p>
      <div class="actions">
        <a class="button" href="tel:{site['phone_tel']}">ЗАПИСАТЬСЯ</a>
        <a class="button dark" href="services.html">УСЛУГИ</a>
      </div>
    </div>
    <div class="stats stats--hero">
      <div class="stat"><b>{site['rating']}</b><span>СРЕДНЯЯ ОЦЕНКА · 2ГИС</span></div>
      <div class="stat"><b>{site['reviews_count']}</b><span>ОЦЕНОК · 2ГИС</span></div>
    </div>
  </div>
</section>

<section class="section" id="services">
  <div class="section-head">
    <div><div class="kicker">01 / УСЛУГИ</div><h2>УХОД<br><span class="accent">ЗА АВТО.</span></h2></div>
    <p class="intro">Основные направления студии — стоимость после осмотра автомобиля.</p>
  </div>
  <div class="photo-strip photo-strip--services photo-strip--home">
{home_service_tiles(site)}
  </div>
</section>

<section class="section">
  <div class="section-head">
    <div><div class="kicker">ОТЗЫВЫ</div><h2>2ГИС</h2></div>
  </div>
  <div class="reviews">
{reviews_html(site)}
  </div>
  <p class="intro" style="margin-top:24px"><a href="{gis}" target="_blank" rel="noopener noreferrer">Все отзывы в 2ГИС →</a></p>
</section>

<div class="site-bottom">
{map_block(site)}
{footer(site)}
</div>
<script src="nav.js"></script>
<script src="stats.js"></script>
</body>
</html>
"""
    (dest / "index.html").write_text(body, encoding="utf-8")


def write_services(site: dict, dest: Path) -> None:
    body = f"""{head(site, "Услуги")}

<section class="subpage-hero">
  <div class="kicker">01 / УСЛУГИ</div>
  <h1>РАБОТАЕМ<br>С КАЖДОЙ<br><span class="accent">ДЕТАЛЬЮ</span></h1>
  <p>{site['name']} — {site['city']}. Финальная стоимость после осмотра.</p>
</section>

<section class="section">
  <div class="service-list">
{service_rows(site)}
  </div>
</section>

<div class="site-bottom">
{map_block(site)}
{footer(site)}
</div>
<script src="nav.js"></script>
</body>
</html>
"""
    (dest / "services.html").write_text(body, encoding="utf-8")


def write_gallery(site: dict, dest: Path) -> None:
    pf = site["photo_folder"]
    body = f"""{head(site, "Работы")}

<section class="subpage-hero">
  <div class="kicker">02 / РАБОТЫ</div>
  <h1>ФОТО<br><span class="accent">РАБОТ</span></h1>
  <p>Альбом заполняется из папки <code>img/works/incoming/{pf}/</code> — добавьте фото и обновите страницу.</p>
</section>

<section class="section work-block" id="work-album">
  <div class="section-head">
    <div><div class="kicker">АЛЬБОМ</div><h2>РАБОТЫ СТУДИИ</h2></div>
  </div>
  <div class="gallery gallery--portfolio" id="gallery-grid" data-photo-dir="{pf}">
    <p class="gallery-empty">Пока нет фото. Положите JPG/PNG в <strong>img/works/incoming/{pf}/</strong> и перезагрузите страницу.</p>
  </div>
</section>

<div class="site-bottom">
{map_block(site)}
{footer(site)}
</div>
<script src="nav.js"></script>
<script src="gallery-load.js"></script>
</body>
</html>
"""
    (dest / "gallery.html").write_text(body, encoding="utf-8")


def write_about(site: dict, dest: Path) -> None:
    body = f"""{head(site, "О нас")}

<section class="subpage-hero">
  <div class="kicker">03 / О НАС</div>
  <h1>{site['logo_mark']}<br><span class="accent">{site['logo_word']}</span></h1>
  <p>{site['city']}</p>
</section>

<section class="section">
  <p class="intro" style="max-width:720px;font-size:16px;line-height:1.75">{site['about']}</p>
  <p class="intro" style="max-width:720px;margin-top:20px"><a href="{firm_url(site)}" target="_blank" rel="noopener noreferrer">Карточка в 2ГИС →</a></p>
</section>

<div class="site-bottom">
{map_block(site)}
{footer(site)}
</div>
<script src="nav.js"></script>
</body>
</html>
"""
    (dest / "about.html").write_text(body, encoding="utf-8")


def write_contact(site: dict, dest: Path) -> None:
    gis = firm_url(site)
    body = f"""{head(site, "Контакты")}

<section class="subpage-hero">
  <div class="kicker">04 / КОНТАКТЫ</div>
  <h1>СВЯЗАТЬСЯ<br><span class="accent">С НАМИ</span></h1>
  <p>{site['city']} · работаем по записи</p>
</section>

<section class="section">
  <div class="contact-panel">
    <div class="contact-panel-card">
      <div class="kicker">АДРЕС</div>
      <h2>{site['city'].upper()}</h2>
      <p class="contact-panel-lead">{site['address']}</p>
      <p>{site['schedule']}</p>
    </div>
    <div class="contact-panel-card">
      <div class="kicker">СВЯЗЬ</div>
      <a class="contact-phone" href="tel:{site['phone_tel']}">{site['phone_display']}</a>
      <div class="contact-chips">
        <a href="{gis}" target="_blank" rel="noopener noreferrer">2ГИС</a>
      </div>
    </div>
  </div>
</section>

<div class="site-bottom">
{map_block(site)}
{footer(site)}
</div>
<script src="nav.js"></script>
</body>
</html>
"""
    (dest / "contact.html").write_text(body, encoding="utf-8")


def write_gallery_js(dest: Path) -> None:
    js = """(function () {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;
  var dir = grid.getAttribute('data-photo-dir');
  var manifestUrl = 'data/gallery-manifest.json?dir=' + encodeURIComponent(dir || '');
  fetch(manifestUrl)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      var files = data.files || [];
      if (!files.length) return;
      grid.innerHTML = '';
      files.forEach(function (src) {
        var a = document.createElement('a');
        a.className = 'g g--media';
        a.href = src;
        a.setAttribute('data-lightbox', 'work');
        var img = document.createElement('img');
        img.src = src;
        img.alt = '';
        img.loading = 'lazy';
        img.decoding = 'async';
        a.appendChild(img);
        grid.appendChild(a);
      });
    })
    .catch(function () {});
})();
"""
    (dest / "gallery-load.js").write_text(js, encoding="utf-8")


def write_server(site: dict, dest: Path) -> None:
    tpl = (SRC / "server.py").read_text(encoding="utf-8")
    tpl = tpl.replace("PORT = 8110", f"PORT = {site['port']}")
    tpl = tpl.replace(
        'FIRM_URL = "https://2gis.ru/novosibirsk/firm/70000001061278508"',
        f'FIRM_URL = "{firm_url(site)}"',
    )
    (dest / "server.py").write_text(tpl, encoding="utf-8")


def patch_server_gallery(dest: Path) -> None:
    path = dest / "server.py"
    text = path.read_text(encoding="utf-8")
    if "gallery-manifest" in text:
        return
    needle = '    def do_GET(self) -> None:\n        if self.path.split("?", 1)[0] == "/api/2gis-rating.json":'
    insert = '''    def do_GET(self) -> None:
        if self.path.split("?", 1)[0] == "/data/gallery-manifest.json":
            from urllib.parse import urlparse, parse_qs

            q = parse_qs(urlparse(self.path).query)
            sub = (q.get("dir") or [""])[0]
            base = ROOT / "img" / "works" / "incoming" / sub
            files = []
            if sub and base.is_dir():
                for p in sorted(base.iterdir()):
                    if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp"}:
                        files.append(p.relative_to(ROOT).as_posix())
            body = json.dumps({"files": files}, ensure_ascii=False).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        if self.path.split("?", 1)[0] == "/api/2gis-rating.json":'''
    if needle not in text:
        raise RuntimeError("server.py template mismatch")
    path.write_text(text.replace(needle, insert), encoding="utf-8")


def scaffold_site(site: dict) -> Path:
    dest = ROOT / site["slug"]
    if dest.exists():
        shutil.rmtree(dest)
    dest.mkdir(parents=True)

    shutil.copy2(SRC / "styles.css", dest / "styles.css")
    shutil.copy2(SRC / "stats.js", dest / "stats.js")

    nav_js = """(function () {
  var burger = document.querySelector('.nav-burger');
  var panel = document.querySelector('.nav-mobile-menu');
  if (!burger || !panel) return;
  function setOpen(open) {
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    panel.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  }
  burger.addEventListener('click', function () { setOpen(!panel.classList.contains('is-open')); });
  panel.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', function () { setOpen(false); });
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
})();
"""
    (dest / "nav.js").write_text(nav_js, encoding="utf-8")

    hero_src = SRC / "img" / "works" / "hero-delaikuzov.jpg"
    if not hero_src.is_file():
        hero_src = SRC / "img" / "works" / "hero.jpg"
    (dest / "img").mkdir(parents=True, exist_ok=True)
    shutil.copy2(hero_src, dest / "img" / "hero.jpg")

    inc = dest / "img" / "works" / "incoming" / site["photo_folder"]
    inc.mkdir(parents=True, exist_ok=True)
    (inc / "README.txt").write_text(
        f"Положите сюда фото для «{site['name']}» (jpg/png).\n"
        f"Страница «Работы» подхватит их автоматически при локальном запуске server.py.\n",
        encoding="utf-8",
    )

    (dest / "data").mkdir(exist_ok=True)
    (dest / "data" / "reviews-2gis.json").write_text(
        json.dumps({"reviews": []}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    extra_css = """
.hero--studio .hero-brand-word{font-size:clamp(42px,6vw,72px);line-height:.95;letter-spacing:-.04em}
.hero--studio .heroimg{opacity:.75}
.gallery-empty{grid-column:1/-1;color:#888;padding:24px;border:1px dashed rgba(255,255,255,.15)}
.service-list .service-row{text-decoration:none;color:inherit}
.gallery--portfolio{
  grid-template-columns:repeat(auto-fill,minmax(min(100%,280px),1fr));
  grid-auto-rows:auto;align-items:start;
}
.gallery--portfolio .g--media img{width:100%;height:auto;display:block}
"""
    (dest / "styles.css").write_text(
        (dest / "styles.css").read_text(encoding="utf-8") + extra_css,
        encoding="utf-8",
    )

    write_gallery_js(dest)
    write_index(site, dest)
    write_services(site, dest)
    write_gallery(site, dest)
    write_about(site, dest)
    write_contact(site, dest)
    write_server(site, dest)
    patch_server_gallery(dest)

    (dest / "start.bat").write_text(
        f"@echo off\ncd /d %~dp0\npython server.py\npause\n",
        encoding="utf-8",
    )
    (dest / "README.md").write_text(
        f"# {site['name']}\n\n"
        f"Локально: `python server.py` → http://127.0.0.1:{site['port']}/\n\n"
        f"Фото: `img/works/incoming/{site['photo_folder']}/`\n\n"
        f"2ГИС: {firm_url(site)}\n",
        encoding="utf-8",
    )
    return dest


def main() -> None:
    lines = ["# Локальные прототипы (D2-шаблон)\n\n"]
    for site in SITES:
        dest = scaffold_site(site)
        lines.append(
            f"- **{site['name']}** — `{dest.name}/` — http://127.0.0.1:{site['port']}/ "
            f"(фото: `img/works/incoming/{site['photo_folder']}/`)\n"
        )
        print("OK", dest.name, site["port"])
    (ROOT / "docs" / "LOCAL_THREE_STUDIOS.md").write_text("".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
