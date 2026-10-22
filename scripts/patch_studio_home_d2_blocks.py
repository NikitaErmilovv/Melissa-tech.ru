#!/usr/bin/env python3
"""Align studio home pages: SDC hero + D2 blocks (compare, works, process, map, footer)."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def map_block(
    *,
    kicker: str,
    firm_url: str,
    map_c: str,
    intro: str,
    brand_mark: str,
    brand_word: str,
    address: str,
    hours: str,
    phone: str,
    phone_href: str,
    btn: str,
) -> str:
    pin = f'<span class="logo-mark">{brand_mark}</span><span class="logo-word">{brand_word}</span>'
    return f"""
<div class="site-bottom">
<section class="address-map" id="contacts">
  <div class="address-map-bg">
    <div class="address-map-glow address-map-glow--tr"></div>
    <div class="address-map-glow address-map-glow--bl"></div>
  </div>
  <div class="address-map-inner">
    <div class="address-map-grid">
      <div class="address-map-intro">
        <div class="address-map-kicker">
          <span class="address-map-line"></span>
          <span class="kicker">{kicker}</span>
        </div>
        <h2 class="address-map-title">ГДЕ МЫ<br><span>НАХОДИМСЯ.</span></h2>
        <p class="address-map-text">{intro}</p>
        <div class="address-map-divider" aria-hidden="true"></div>
      </div>
      <div class="address-map-visual">
        <a href="{firm_url}" class="address-map-frame" target="_blank" rel="noopener noreferrer">
          <img class="address-map-img address-map-img--desktop" src="https://static.maps.2gis.com/1.0?s=880x450&amp;c={map_c}&amp;z=16&amp;pt={map_c}~k:p" alt="">
          <img class="address-map-img address-map-img--mobile" src="https://static.maps.2gis.com/1.0?s=720x720&amp;c={map_c}&amp;z=16&amp;pt={map_c}~k:p" alt="">
          <div class="address-map-pin-label" aria-hidden="true">
            <span class="address-map-pin-label-text">{pin}</span>
          </div>
        </a>
        <div class="address-map-decor"></div>
      </div>
      <div class="address-map-details-wrap">
        <div class="address-map-details">
          <div class="address-map-detail">
            <span class="address-map-detail-label">СЕРВИС</span>
            <p class="address-map-brand">{pin}</p>
            <p class="address-map-muted">{address}</p>
            <p class="address-map-muted-sm">{hours}</p>
          </div>
          <div class="address-map-detail">
            <span class="address-map-detail-label">ТЕЛЕФОН</span>
            <div class="address-map-phones">
            <a href="tel:{phone_href}" class="address-map-phone">{phone}</a>
            </div>
          </div>
        </div>
        <a href="{firm_url}" class="address-map-btn" target="_blank" rel="noopener noreferrer">{btn}</a>
      </div>
    </div>
  </div>
</section>
"""


def footer_block(
    *,
    brand_mark: str,
    brand_word: str,
    hours: str,
    phone: str,
    phone_href: str,
    wa: str,
    tg: str,
    firm_url: str,
    copyright_name: str,
    tagline: str,
) -> str:
    social = f"""<a href="{wa}" target="_blank" rel="noopener noreferrer">WhatsApp</a>
        <a href="{tg}" target="_blank" rel="noopener noreferrer">Telegram</a>
        <a href="{firm_url}" target="_blank" rel="noopener noreferrer">2ГИС</a>"""
    logo = f'<span class="logo-mark">{brand_mark}</span><span class="logo-word">{brand_word}</span>'
    return f"""
<footer class="site-footer">
  <div class="footer-grid footer-desktop-only">
    <div class="footer-col footer-col--brand-hours">
      <div class="footer-brand-block">
        <div class="footer-logo">{logo}</div>
        <div class="footer-social">{social}</div>
      </div>
      <div class="footer-hours-block">
        <b>РЕЖИМ РАБОТЫ</b>
        <span>{hours}</span>
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
    <div class="footer-col footer-col--phones">
      <b>КОНТАКТЫ</b>
      <a class="footer-phone-inline" href="tel:{phone_href}">{phone}</a>
    </div>
  </div>
  <div class="footer-grid footer-mobile-only">
    <div class="footer-col">
      <b>НАВИГАЦИЯ</b>
      <a href="index.html">Главная</a>
      <a href="services.html">Услуги</a>
      <a href="gallery.html">Работы</a>
      <a href="about.html">О нас</a>
      <a href="contact.html">Контакты</a>
    </div>
    <div class="footer-col footer-col--brand-hours">
      <div class="footer-phones-block">
        <b>КОНТАКТЫ</b>
        <a class="footer-phone-inline" href="tel:{phone_href}">{phone}</a>
      </div>
      <div class="footer-brand-divider" aria-hidden="true"></div>
      <div class="footer-brand-block">
        <div class="footer-logo">{logo}</div>
        <div class="footer-social">{social}</div>
      </div>
      <div class="footer-hours-block">
        <b>РЕЖИМ РАБОТЫ</b>
        <span>{hours}</span>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2026 {copyright_name}</span>
    <span>{tagline}</span>
  </div>
</footer>
</div>
<script src="contacts-config.js"></script>
<script src="messenger-picker.js"></script>
<script src="nav.js"></script>
<script src="stats.js"></script>
<script src="ba-slider.js"></script>
<script src="reviews-carousel.js?v=r2"></script>
</body>
</html>
"""


def middle_blocks(compare: str, works: str, process: str) -> str:
    return f"""
{compare}

{works}

{process}

<section class="section" id="reviews">
  <div class="section-head">
    <div><div class="kicker">ОТЗЫВЫ</div><h2>ОТЗЫВЫ<br><span class="accent">КЛИЕНТОВ.</span></h2></div>
  </div>
  <div class="reviews-carousel" data-reviews-carousel data-reviews-src="data/reviews-2gis.json">
    <button type="button" class="reviews-nav reviews-nav--prev" aria-label="Предыдущие отзывы">‹</button>
    <div class="reviews-viewport">
      <div class="reviews-track"></div>
    </div>
    <button type="button" class="reviews-nav reviews-nav--next" aria-label="Следующие отзывы">›</button>
  </div>
</section>
"""


def patch_index(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")


SITES = {
    "klyaksa-tuning-noyabrsk": {
        "eyebrow": "ТЮНИНГ · НОЯБРЬСК",
        "hero_h1": "КЛЯКСА<br><span class=\"accent\">TUNING.</span>",
        "hero_p": "Детейлинг-мойка, полировка, химчистка, защита кузова и салона, антигравий, антихром, тонировка и шумоизоляция в Ноябрьске.",
        "stat_rating": "5.0",
        "stat_reviews": "99",
        "stat_extra_b": "10+",
        "stat_extra_s": "НАПРАВЛЕНИЙ УСЛУГ",
        "services_intro": "Мойка, полировка, химчистка, защита, тонировка и шумоизоляция — стоимость после осмотра автомобиля.",
        "compare": [
            (
                "img/works/incoming/klyaksa/07-lexus-wash-bay.jpg",
                "img/works/home/polish.jpg",
                "Полировка кузова",
            ),
            (
                "img/works/incoming/klyaksa/08-engine-bay.jpg",
                "img/works/incoming/klyaksa/04-headlight-polish.jpg",
                "Восстановление фар",
            ),
        ],
        "works": [
            ("img/works/incoming/klyaksa/11-wrap-red-roof.jpg", "ОКЛЕЙКА"),
            ("img/works/incoming/klyaksa/10-tint-solaris-chameleon.jpg", "ТОНИРОВКА"),
            ("img/works/incoming/klyaksa/04-headlight-polish.jpg", "ПОЛИРОВКА"),
            ("img/works/incoming/klyaksa/05-interior-detailing.jpg", "САЛОН"),
            ("img/works/incoming/klyaksa/12-skyline-custom.jpg", "ТЮНИНГ"),
        ],
        "process_p": [
            ("Осмотр", "Фиксируем задачу и согласуем объём работ по кузову и салону."),
            ("Запись", "Подбираем удобное время и подтверждаем состав услуг."),
            ("Работа", "Моем, полируем, тонируем и защищаем по согласованному плану."),
            ("Выдача", "Показываем результат и даём рекомендации по уходу."),
        ],
        "map": {
            "kicker": "04 / ЛОКАЦИЯ",
            "firm_url": "https://2gis.ru/noyabrsk/firm/70000001035583613",
            "map_c": "63.182081,75.431801",
            "intro": "Приезжайте по записи. Адрес и маршрут — в 2ГИС.",
            "brand_mark": "КЛЯКСА",
            "brand_word": "TUNING",
            "address": "г. Ноябрьск, ул. Строителей, 24",
            "hours": "Ежедневно · 10:00–20:00",
            "phone": "+7 (932) 059-05-91",
            "phone_href": "+79320590591",
            "btn": "Как добраться",
            "wa": "https://wa.me/79320590591",
            "tg": "https://t.me/klyaksa_89",
            "copyright": "Клякса Tuning studio",
            "tagline": "ТЮНИНГ · НОЯБРЬСК",
        },
        "fix_sound_tile": True,
    },
    "mir-tonirovki-tobolsk": {
        "eyebrow": "ТОНИРОВКА · ТОБОЛСК",
        "hero_h1": "МИР<br><span class=\"accent\">ТОНИРОВКИ.</span>",
        "hero_p": "Центр автотонирования в Тобольске: тонировка, оклейка плёнкой, полировка, шумоизоляция салона и нанесение защитной плёнки.",
        "stat_rating": "4.7",
        "stat_reviews": "54",
        "stat_extra_b": "24/7",
        "stat_extra_s": "ЗАПИСЬ НА УСЛУГИ",
        "services_intro": "Тонировка, оклейка, полировка, защитная плёнка и шумоизоляция — стоимость после осмотра.",
        "compare": [
            (
                "img/works/incoming/mir-tonirovki/02-sandero-stepway.jpg",
                "img/works/home/polish.jpg",
                "Полировка кузова",
            ),
            (
                "img/works/incoming/mir-tonirovki/01-kia-optima-tint.jpg",
                "img/works/incoming/mir-tonirovki/06-bmw-tint.jpg",
                "Тонировка стёкол",
            ),
        ],
        "works": [
            ("img/works/incoming/mir-tonirovki/06-bmw-tint.jpg", "ТОНИРОВКА"),
            ("img/works/incoming/mir-tonirovki/04-range-rover-tint.jpg", "ТОНИРОВКА"),
            ("img/works/incoming/mir-tonirovki/09-mazda-polish.jpg", "ПОЛИРОВКА"),
            ("img/works/incoming/mir-tonirovki/03-kia-rio-ppf-hood.jpg", "ПЛЁНКА"),
            ("img/works/incoming/mir-tonirovki/05-camaro-tint.jpg", "ОКЛЕЙКА"),
        ],
        "process_p": [
            ("Осмотр", "Смотрим стёкла и кузов, подбираем плёнку и светопропускание."),
            ("Запись", "Согласуем срок и фиксируем время в боксе."),
            ("Работа", "Тонируем, оклеиваем или полируем по согласованному объёму."),
            ("Выдача", "Проверяем результат вместе и выдаём автомобиль."),
        ],
        "map": {
            "kicker": "04 / ЛОКАЦИЯ",
            "firm_url": "https://2gis.ru/tobolsk/firm/70000001030915203",
            "map_c": "58.218,68.254",
            "intro": "Приезжайте по записи. Адрес и маршрут — в 2ГИС.",
            "brand_mark": "МИР",
            "brand_word": "ТОНИРОВКИ",
            "address": "г. Тобольск, ул. Семёна Ремезова, 109 (бокс 44)",
            "hours": "Круглосуточно · по предварительной записи",
            "phone": "+7 (982) 912-83-33",
            "phone_href": "+79829128333",
            "btn": "Как добраться",
            "wa": "https://wa.me/79829128333",
            "tg": "https://t.me/+79829128333",
            "copyright": "Мир тонировки",
            "tagline": "ТОНИРОВКА · ТОБОЛЬСК",
        },
        "fix_sound_tile": False,
    },
    "imperiya-avtokompleks-chelyabinsk": {
        "eyebrow": "АВТОКОМПЛЕКС · ЧЕЛЯБИНСК",
        "hero_h1": "ИМПЕРИЯ<br><span class=\"accent\">АВТОКОМПЛЕКС.</span>",
        "hero_p": "Автокомплекс в Челябинске: мойка, шиномонтаж, химчистка, кузовной и малярный ремонт, детейлинг, антикор и сезонное хранение шин.",
        "stat_rating": "4.7",
        "stat_reviews": "194",
        "stat_extra_b": "7+",
        "stat_extra_s": "НАПРАВЛЕНИЙ СЕРВИСА",
        "services_intro": "Мойка, шиномонтаж, кузов, детейлинг и хранение шин — стоимость после осмотра автомобиля.",
        "compare": [
            (
                "img/works/incoming/imperiya/01-rav4.jpg",
                "img/works/home/wash.jpg",
                "Детейлинг-мойка",
            ),
            (
                "img/works/incoming/imperiya/08-subaru-interior.jpg",
                "img/works/home/interior.jpg",
                "Химчистка салона",
            ),
        ],
        "works": [
            ("img/works/incoming/imperiya/03-bmw-wash-bay.jpg", "МОЙКА"),
            ("img/works/incoming/imperiya/02-infiniti-qx70.jpg", "КУЗОВ"),
            ("img/works/incoming/imperiya/04-porsche-interior.jpg", "САЛОН"),
            ("img/works/incoming/imperiya/09-bmw-x5-service-pit.jpg", "СЕРВИС"),
            ("img/works/incoming/imperiya/07-renault-duster.jpg", "РАБОТЫ"),
        ],
        "process_p": [
            ("Осмотр", "Диагностика и согласование объёма: мойка, кузов или шиномонтаж."),
            ("Запись", "Фиксируем время и состав работ на комплексе."),
            ("Работа", "Выполняем услуги в боксе по согласованному плану."),
            ("Выдача", "Передаём автомобиль и отвечаем на вопросы по уходу."),
        ],
        "map": {
            "kicker": "04 / ЛОКАЦИЯ",
            "firm_url": "https://2gis.ru/chelyabinsk/firm/70000001019425061",
            "map_c": "55.145,61.452",
            "intro": "Приезжайте по записи. Адрес и маршрут — в 2ГИС.",
            "brand_mark": "ИМПЕРИЯ",
            "brand_word": "АВТОКОМПЛЕКС",
            "address": "г. Челябинск, ул. Профессора Благих, 85, стр. 1",
            "hours": "Ежедневно · 09:00–20:00",
            "phone": "+7 (351) 258-22-83",
            "phone_href": "+73512582283",
            "btn": "Как добраться",
            "wa": "https://wa.me/73512582283",
            "tg": "https://t.me/+73512582283",
            "copyright": "Империя",
            "tagline": "АВТОКОМПЛЕКС · ЧЕЛЯБИНСК",
        },
        "fix_sound_tile": False,
    },
}


def ba_slider(before: str, after: str, caption: str) -> str:
    return f"""    <figure class="ba-item">
      <div class="ba-slider" data-ba>
        <img class="ba-after" src="{after}" alt="После — {caption}">
        <div class="ba-before-wrap">
          <img class="ba-before" src="{before}" alt="До — {caption}">
        </div>
        <div class="ba-handle" aria-hidden="true"><span></span></div>
      </div>
      <figcaption>{caption}</figcaption>
    </figure>"""


def build_compare(_pairs: list[tuple[str, str, str]] | None = None) -> str:
    """Shared D2 before/after block (agency photos) — same on all studio prototypes."""
    return """<section class="section" id="compare">
  <div class="section-head">
    <div><div class="kicker">ДО / ПОСЛЕ</div><h2>РЕЗУЛЬТАТ,<br><span class="accent">КОТОРЫЙ ВИДНО.</span></h2></div>
  </div>
  <div class="ba-grid">
    <figure class="ba-item">
      <div class="ba-slider" data-ba>
        <img class="ba-after" src="img/works/before-after/hood-after.jpg" alt="После — полировка кузова">
        <div class="ba-before-wrap">
          <img class="ba-before" src="img/works/before-after/hood-before.jpg" alt="До — полировка кузова">
        </div>
        <div class="ba-handle" aria-hidden="true"><span></span></div>
      </div>
      <figcaption>Полировка кузова</figcaption>
    </figure>
    <figure class="ba-item">
      <div class="ba-slider" data-ba>
        <img class="ba-after" src="img/works/before-after/headlight-after.jpg" alt="После — восстановление фар">
        <div class="ba-before-wrap">
          <img class="ba-before" src="img/works/before-after/headlight-before.jpg" alt="До — восстановление фар">
        </div>
        <div class="ba-handle" aria-hidden="true"><span></span></div>
      </div>
      <figcaption>Восстановление фар</figcaption>
    </figure>
  </div>
</section>"""


def build_works(photos: list[tuple[str, str]]) -> str:
    tiles = "\n".join(
        f'    <a class="photo" href="gallery.html" style="background-image:url(\'{src}\')"><span class="tag">{tag}</span></a>'
        for src, tag in photos
    )
    return f"""<section class="section" id="works">
  <div class="section-head">
    <div><div class="kicker">02 / РАБОТЫ</div><h2>НАШИ<br><span class="accent">РАБОТЫ.</span></h2></div>
  </div>
  <div class="photo-strip photo-strip--services">
{tiles}
  </div>
</section>"""


def build_process(steps: list[tuple[str, str]]) -> str:
    rows = "\n".join(
        f'    <div class="step"><b>{i:02d}</b><h3>{title}</h3><p>{text}</p></div>'
        for i, (title, text) in enumerate(steps, 1)
    )
    return f"""<section class="process" id="process">
  <div class="kicker">03 / ПРОЦЕСС</div>
  <h2>КАК МЫ<br><span class="accent">РАБОТАЕМ.</span></h2>
  <div class="steps">
{rows}
  </div>
</section>"""


def main() -> None:
    for slug, cfg in SITES.items():
        index = ROOT / slug / "index.html"
        html = index.read_text(encoding="utf-8")
        m = re.search(
            r"(<section class=\"section\" id=\"services\">.*?</section>)",
            html,
            re.DOTALL,
        )
        if not m:
            raise RuntimeError(f"services section not found in {slug}")
        services = m.group(1)
        services = services.replace(
            "<h2>УХОД<br><span class=\"accent\">ЗА АВТО.</span></h2>",
            "<h2>ДЕТЕЙЛИНГ<br><span class=\"accent\">И КУЗОВ.</span></h2>",
        )
        services = re.sub(
            r"<p class=\"intro\">.*?</p>",
            f'<p class="intro">{cfg["services_intro"]}</p>',
            services,
            count=1,
        )
        if cfg.get("fix_sound_tile"):
            services = services.replace(
                'href="services/antichrome.html" style="background-image:url(\'img/works/home/sound.jpg\')"',
                'href="services/sound.html" style="background-image:url(\'img/works/home/sound.jpg\')"',
            )

        head = html.split("</nav>", 1)[0] + "</nav>\n\n"
        nav = head

        hero = f"""<section class="hero hero--sdc">
  <div class="heroimg" style="background-image:url('img/hero.jpg')"></div>
  <div class="hero-content">
    <div class="eyebrow">{cfg["eyebrow"]}</div>
    <h1>{cfg["hero_h1"]}</h1>
    <p>{cfg["hero_p"]}</p>
    <div class="actions">
      <a class="button" href="tel:{cfg["map"]["phone_href"]}">ЗАПИСАТЬСЯ</a>
      <a class="button dark" href="services.html">СМОТРЕТЬ УСЛУГИ</a>
    </div>
  </div>
</section>

<div class="stats">
  <div class="stat"><b id="stat-rating">{cfg["stat_rating"]}</b><span>СРЕДНЯЯ ОЦЕНКА · 2ГИС</span></div>
  <div class="stat"><b>{cfg["stat_reviews"]}</b><span>ОЦЕНОК · 2ГИС</span></div>
  <div class="stat"><b>{cfg["stat_extra_b"]}</b><span>{cfg["stat_extra_s"]}</span></div>
  <div class="stat"><b>2ГИС</b><span>ОТЗЫВЫ КЛИЕНТОВ</span></div>
</div>
"""

        mid = middle_blocks(
            build_compare(cfg["compare"]),
            build_works(cfg["works"]),
            build_process(cfg["process_p"]),
        )

        m = cfg["map"]
        map_kw = {k: m[k] for k in (
            "kicker", "firm_url", "map_c", "intro", "brand_mark", "brand_word",
            "address", "hours", "phone", "phone_href", "btn",
        )}
        tail = map_block(**map_kw) + footer_block(
            brand_mark=m["brand_mark"],
            brand_word=m["brand_word"],
            hours=m["hours"],
            phone=m["phone"],
            phone_href=m["phone_href"],
            wa=m["wa"],
            tg=m["tg"],
            firm_url=m["firm_url"],
            copyright_name=m["copyright"],
            tagline=m["tagline"],
        )

        new_html = nav + hero + services + "\n" + mid + tail
        patch_index(index, new_html)
        print("patched", slug)


if __name__ == "__main__":
    main()
