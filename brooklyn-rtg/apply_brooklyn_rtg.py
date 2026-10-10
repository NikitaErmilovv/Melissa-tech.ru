# -*- coding: utf-8 -*-
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
GIS = "https://2gis.ru/magnitogorsk/firm/70000001112968680"
PHONE_TEL = "+79000755745"
PHONE_FMT = "+7 (900) 075-57-45"
EMAIL = "sokol174174797@gmail.com"
MAP_EMBED = "https://maps.google.com/maps?q=53.407556,58.984211&hl=ru&z=17&output=embed"
MAP_DIR = "https://2gis.ru/magnitogorsk/geo/58.984211%2C53.407556"

LABELS = [
    "Полировка",
    "PPF",
    "Детейлинг",
    "Салон",
    "Кузов",
    "Блеск",
    "Защита",
    "Студия",
    "Результат",
    "Комплекс",
    "Фары",
    "ЛКП",
    "Выдача",
]


def examples_html() -> str:
    lines = []
    for i in range(1, 14):
        f = f"bk-{i:02d}.jpg"
        label = LABELS[i - 1] if i <= len(LABELS) else "Работа"
        lines.append(
            f'    <button type="button" data-full="img/work/{f}"><img src="img/work/{f}" alt="Бруклин — {label}" loading="lazy"><span>{label}</span></button>'
        )
    return "\n".join(lines)


def main():
    index = ROOT / "index.html"
    text = index.read_text(encoding="utf-8")

    text = text.replace('<html lang="en">', '<html lang="ru">')
    text = text.replace('<base href="/rtg/">', '<base href="/brooklyn-rtg/">')
    text = text.replace(
        "<title>RTG Wrapzz — wraps, chrome delete, PPF</title>",
        "<title>Бруклин — детейлинг · Магнитогорск</title>",
    )
    text = text.replace(
        'content="RTG Wrapzz LLC in Arizona. Partial and full wraps, chrome delete, PPF, and custom decals."',
        f'content="Бруклин — студия детейлинга в Магнитогорске. Полировка, PPF, уход за кузовом и салоном. {PHONE_FMT}."',
    )

    text = re.sub(
        r'<a class="brand" href="#top">RTG WRAPZZ</a>',
        '<a class="brand" href="#top">БРУКЛИН</a>',
        text,
    )
    text = text.replace(
        '<a class="ig" href="https://www.instagram.com/rtg_wrapzz/" target="_blank" rel="noopener">Instagram</a>',
        f'<a class="ig" href="tel:{PHONE_TEL}">{PHONE_FMT}</a>',
    )

    # Nav
    for en, ru in [
        ("Services", "Услуги"),
        ("Builder", "Конфигуратор"),
        ("Work", "Работы"),
        ("Address", "Адрес"),
        ('aria-label="Menu"', 'aria-label="Меню"'),
    ]:
        text = text.replace(en, ru)

    # Hero
    text = text.replace(
        '<p class="eyebrow">Arizona · Licensed &amp; professional</p>',
        "<p class=\"eyebrow\">Магнитогорск · студия детейлинга</p>",
    )
    text = text.replace("<h1>RTG<br>WRAPZZ</h1>", "<h1>БРУКЛИН<br>STUDIO</h1>")
    text = text.replace(
        '<p class="lead">Partial and full wraps, chrome delete, and PPF. Custom decals when the car needs a face, not just a color.</p>',
        "<p class=\"lead\">Полировка, защитные плёнки и комплексный уход. Осмотр по записи — согласуем объём и срок до начала работ.</p>",
    )
    text = text.replace('href="#work">See the work</a>', 'href="#work">Смотреть работы</a>')
    text = text.replace('href="#wrap">Build a wrap</a>', 'href="#wrap">Конфигуратор</a>')

    # Line
    text = text.replace("<span><b>Partial / full wraps</b></span>", "<span><b>Полировка от 12 000 ₽</b></span>")
    text = text.replace("<span><b>Chrome delete</b></span>", "<span><b>PPF · зоны риска</b></span>")
    text = text.replace("<span><b>PPF</b></span>", "<span><b>от 45 000 ₽</b></span>", 1)
    text = text.replace("<span>Financing available</span>", "<span>Рейтинг 4.9 · 2ГИС</span>")
    text = text.replace("<span>DM for quotes</span>", "<span>Запись по телефону</span>")

    # Services band
    text = text.replace("<div class=\"kicker\">Services</div>", '<div class="kicker">Услуги</div>')
    text = text.replace("<h2>What the shop does.</h2>", "<h2>Чем занимаемся.</h2>")
    text = text.replace(
        '<p class="sub">Partial and full color, chrome delete, paint protection, and printed decals. The quote comes after we see the car.</p>',
        "<p class=\"sub\">Полировка, PPF, детейлинг кузова и салона. Точная смета — после осмотра автомобиля.</p>",
    )

    cards = [
        ("rtg-01.jpg", "bk-01.jpg", "Full and partial wraps", "Полировка кузова", "A whole color change, or just the hood, roof, mirrors, and trim.", "Коррекция ЛКП и восстановление блеска — от 12 000 ₽."),
        ("rtg-02.jpg", "bk-02.jpg", "Chrome delete", "Зоны риска (PPF)", "Trim, badges, and window surrounds wrapped so the brightwork goes dark.", "Защита капота, фар и зон сколов прозрачной плёнкой."),
        ("rtg-21.jpg", "bk-03.jpg", "PPF", "Детейлинг", "Clear film on the nose, mirrors, and rockers. Color PPF when the panel should stay protected and change tone.", "Мойка, подготовка и уход за кузовом в студии."),
        ("rtg-31.jpg", "bk-04.jpg", "Custom decals", "Салон", "Printed graphics and one-off art. Headlight tint when the lamps need to match the wrap.", "Химчистка и уход за интерьером."),
    ]
    for old_img, new_img, old_alt, new_h3, old_p, new_p in cards:
        text = text.replace(f"img/work/{old_img}", f"img/work/{new_img}")
        text = text.replace(f"RTG Wrapzz {old_alt.lower()}", f"Бруклин — {new_h3.lower()}")
        text = text.replace(f"<h3>{old_alt.title() if ' ' in old_alt else old_alt}</h3>", f"<h3>{new_h3}</h3>", 1)
    # Fix h3 manually for mixed case
    text = text.replace("<h3>Full and partial wraps</h3>", "<h3>Полировка кузова</h3>")
    text = text.replace("<h3>Chrome delete</h3>", "<h3>Зоны риска (PPF)</h3>")
    text = text.replace("<h3>PPF</h3>", "<h3>Детейлинг кузова</h3>")
    text = text.replace("<h3>Custom decals</h3>", "<h3>Уход за салоном</h3>")
    text = text.replace(
        "<p>A whole color change, or just the hood, roof, mirrors, and trim.</p>",
        "<p>Коррекция ЛКП и восстановление блеска — от 12 000 ₽.</p>",
    )
    text = text.replace(
        "<p>Trim, badges, and window surrounds wrapped so the brightwork goes dark.</p>",
        "<p>Защита капота, фар и зон сколов — от 45 000 ₽ по смете.</p>",
    )
    text = text.replace(
        "<p>Clear film on the nose, mirrors, and rockers. Color PPF when the panel should stay protected and change tone.</p>",
        "<p>Бережная мойка, подготовка и финишные работы в студии.</p>",
    )
    text = text.replace(
        "<p>Printed graphics and one-off art. Headlight tint when the lamps need to match the wrap.</p>",
        "<p>Химчистка, кожа и пластик — комплексный уход за салоном.</p>",
    )

    # Wrap band titles (keep 3D in English-ish but Russian headers)
    text = text.replace("<h2>Build the wrap.</h2>", "<h2>Соберите образ.</h2>")
    text = text.replace(
        '<p class="sub">Pick the car, the panels, the finish. The number on the card is a preview — the real quote comes from the shop.</p>',
        "<p class=\"sub\">Выберите авто, зоны и отделку. Цифра на экране — ориентир; точную смету дадим после осмотра.</p>",
    )
    text = text.replace('id="quote" type="button">Get a quote</button>', 'id="quote" type="button">Запросить смету</button>')
    text = text.replace("<div class=\"sumlabel\">Total price</div>", '<div class="sumlabel">Ориентир</div>')

    # Examples section
    text = text.replace("<div class=\"kicker\">Examples</div>", '<div class="kicker">Примеры</div>')
    text = text.replace("<h2>Cars that left the bay.</h2>", "<h2>Работы из студии.</h2>")
    text = text.replace(
        '<p class="sub">A few finishes from the shop. Open a photo to see it larger.</p>',
        "<p class=\"sub\">Фото с Московской. Нажмите, чтобы открыть крупнее.</p>",
    )
    m = re.search(r'<div class="examples">.*?</div>\n</section>', text, re.DOTALL)
    if m:
        text = text[: m.start()] + "<div class=\"examples\">\n" + examples_html() + "\n  </div>\n</section>" + text[m.end() :]

    # Contact / map
    text = text.replace("<span class=\"kicker\">05 / Location</span>", '<span class="kicker">05 / Адрес</span>')
    text = text.replace("<h2 class=\"address-map-title\">Where to<br><span>find us.</span></h2>", '<h2 class="address-map-title">Где мы<br><span>находимся.</span></h2>')
    text = text.replace(
        '<p class="address-map-text">The shop is in Arizona. Write before you come — we book by appointment. Address and route are in Google Maps.</p>',
        "<p class=\"address-map-text\">Студия в Магнитогорске. Лучше записаться заранее — маршрут и отзывы в 2ГИС.</p>",
    )
    text = text.replace(
        'title="RTG Wrapzz on Google Maps" src="https://maps.google.com/maps?q=Phoenix,+Arizona&amp;hl=en&amp;z=11&amp;output=embed"',
        f'title="Бруклин на карте" src="{MAP_EMBED}"',
    )
    text = text.replace(
        'href="https://www.google.com/maps/search/?api=1&amp;query=RTG+Wrapzz+Arizona"',
        f'href="{GIS}"',
    )
    text = text.replace('aria-label="Open RTG Wrapzz in Google Maps"', 'aria-label="Открыть в 2ГИС"')
    text = text.replace(
        '<span class="address-map-pin-label-text"><span>RTG</span> WRAPZZ</span>',
        '<span class="address-map-pin-label-text"><span>БРУКЛИН</span></span>',
    )
    text = text.replace('<span class="address-map-detail-label">Shop</span>', '<span class="address-map-detail-label">Студия</span>')
    text = text.replace('<p class="address-map-brand"><span>RTG</span> WRAPZZ</p>', '<p class="address-map-brand"><span>БРУКЛИН</span></p>')
    text = text.replace('<p class="address-map-muted">Arizona</p>', "<p class=\"address-map-muted\">Московская ул., 5 к1</p>")
    text = text.replace(
        '<p class="address-map-muted-sm">Licensed and professional · By appointment</p>',
        "<p class=\"address-map-muted-sm\">Студия детейлинга · по записи</p>",
    )
    text = text.replace('<span class="address-map-detail-label">Message</span>', '<span class="address-map-detail-label">Телефон</span>')
    text = text.replace(
        '<a href="https://www.instagram.com/rtg_wrapzz/" class="address-map-phone" target="_blank" rel="noopener noreferrer">@rtg_wrapzz</a>',
        f'<a href="tel:{PHONE_TEL}" class="address-map-phone">{PHONE_FMT}</a>',
    )
    text = text.replace(
        'href="https://www.google.com/maps/dir/?api=1&amp;destination=Phoenix,+Arizona"',
        f'href="{GIS}"',
    )
    text = text.replace(">Get directions</a>", ">Как добраться</a>")

    # Footer
    text = text.replace("<div class=\"footer-logo\"><span>RTG</span> WRAPZZ</div>", '<div class="footer-logo"><span>БРУКЛИН</span></div>')
    text = text.replace(">Instagram</a>", ">2ГИС</a>")
    text = text.replace("https://www.instagram.com/rtg_wrapzz/", GIS)
    text = text.replace(">Google Maps</a>", ">Карта</a>")
    text = text.replace("query=RTG+Wrapzz+Arizona", "query=53.407556,58.984211")
    text = text.replace("<b>Hours</b>", "<b>Режим</b>")
    text = text.replace("<span>By appointment</span>", "<span>По записи</span>")
    text = text.replace("<span>Financing available</span>", f"<span>{EMAIL}</span>")
    text = text.replace("<b>Navigate</b>", "<b>Навигация</b>")
    text = text.replace("<b>Contact</b>", "<b>Контакты</b>")
    text = text.replace('href="#top">Home</a>', 'href="#top">Главная</a>')
    text = text.replace("© 2026 RTG Wrapzz LLC. All rights reserved.", "© 2026 Бруклин · прототип Melissa-tech")
    text = text.replace(
        "Partial / full wraps · Chrome delete · PPF",
        "Полировка · PPF · детейлинг",
    )
    text = text.replace("@rtg_wrapzz", PHONE_FMT)
    text = text.replace("<span>Arizona</span>", "<span>Магнитогорск</span>")

    # Dialog
    text = text.replace("<h3>Send the build.</h3>", "<h3>Отправить заявку.</h3>")
    text = text.replace(
        '<p id="lead-meta">DM @rtg_wrapzz with the panels and the color.</p>',
        f'<p id="lead-meta">Позвоните {PHONE_FMT} или напишите на {EMAIL} — пришлите скрин конфигуратора.</p>',
    )
    text = text.replace(">Open Instagram</a>", f'>Позвонить</a>')
    text = text.replace(f'href="{GIS}" target="_blank" rel="noopener">Позвонить</a>', f'href="tel:{PHONE_TEL}">Позвонить</a>', 1)
    text = text.replace(">Close</button>", ">Закрыть</button>")

    index.write_text(text, encoding="utf-8")

    boot = ROOT / "flex-carousel-boot.js"
    boot.write_text(
        """import { mountFlexCarousel } from './FlexCarousel.js?v=fc2';

const carouselFiles = [
  { file: 'bk-01.jpg', title: 'Полировка' },
  { file: 'bk-02.jpg', title: 'PPF' },
  { file: 'bk-03.jpg', title: 'Детейлинг' },
  { file: 'bk-04.jpg', title: 'Салон' },
  { file: 'bk-05.jpg', title: 'Кузов' },
  { file: 'bk-06.jpg', title: 'Блеск' },
  { file: 'bk-07.jpg', title: 'Защита' },
  { file: 'bk-08.jpg', title: 'Студия' },
  { file: 'bk-09.jpg', title: 'Результат' },
  { file: 'bk-10.jpg', title: 'Комплекс' },
];

const items = carouselFiles.map(({ file, title }, i) => ({
  src: `img/work/${file}`,
  alt: `Бруклин — ${title}`,
  title,
  subtitle: i % 3 === 0 ? 'Бруклин' : undefined,
}));

const root = document.getElementById('flex-carousel');
if (root) {
  mountFlexCarousel(root, {
    items,
    preset: 'liquid',
    intro: 'rise',
    cardHeight: 0.5,
    gap: 12,
    squeeze: 0.2,
    focusOnClick: true,
    captions: true,
    fit: 'natural',
    radius: 0,
    captureWheel: true,
  });
}
""",
        encoding="utf-8",
    )

    (ROOT / "README.md").write_text(
        """# Бруклин — вариант в стиле RTG (прототип)

Одностраничник с каруселью и 3D-конфигуратором. Путь на сайте: `/brooklyn-rtg/`.
""",
        encoding="utf-8",
    )
    (ROOT / "deploy-version.txt").write_text("brooklyn-rtg-1\n", encoding="utf-8")
    print("brooklyn-rtg: done")


if __name__ == "__main__":
    main()
