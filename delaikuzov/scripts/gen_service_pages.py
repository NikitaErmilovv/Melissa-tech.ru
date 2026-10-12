# -*- coding: utf-8 -*-
"""Generate service detail pages with stages timeline + price blocks."""
from pathlib import Path

root = Path(__file__).resolve().parents[1]
out = root / "services"
out.mkdir(exist_ok=True)

# Client-provided vehicle silhouettes (PNG)
SILHOUETTES = {
    name: (
        f'<img class="price-sil" src="../img/icons/vehicles/{name}.png" '
        f'alt="" width="72" height="72" loading="lazy">'
    )
    for name in ("moto", "hatch", "sedan", "wagon", "crossover", "jeep")
}

BODY_META = {
    "МОТО": "moto",
    "ХЕТЧБЕК": "hatch",
    "СЕДАН": "sedan",
    "УНИВЕРСАЛ": "wagon",
    "КРОССОВЕР": "crossover",
    "ДЖИП": "jeep",
}


def fmt_price(value, prefix=""):
    text = f"{int(value):,}".replace(",", " ") + " ₽"
    return f"{prefix}{text}" if prefix else text


services = [
    {
        "slug": "wash",
        "num": "01",
        "title": "Детейлинг-мойка",
        "h1": 'ДЕТЕЙЛИНГ-<br><span class="accent">МОЙКА.</span>',
        "lead": (
            "Это комплексная, бережная и тщательная очистка кузова автомобиля "
            "от загрязнений различной сложности с применением высокотехнологичных "
            "и профессиональных средств."
        ),
        "stages": [
            (
                "3-х фазная мойка кузова",
                "Основная+Шампунь+Воск с проработкой всех труднодоступных мест специальными кисточками",
            ),
            (
                "Диски + Чернение",
                "Тщательная мойка дисков с проработкой арочного пространства + Чернение на масляной основе",
            ),
            (
                "Металлические вкрапления",
                "Очистка кузова от колодочной пыли и дорожных металлических налётов",
            ),
            (
                "Уборка салона + Стекла",
                "Полная очистка салона, проработка труднодоступных мест: дефлекторы, ниши, подстаканники, карманы + Очистка всех стёкол в автомобиле",
            ),
            (
                "Пылесос",
                "Обработка всех текстильных и кожаных покрытий специальным моющим пылесосом",
            ),
            (
                "Уборка багажника",
                "Уборка всего багажного отделения включая все карманы и отдел для запасного колеса",
            ),
            (
                "Турбосушка",
                "Сушка автомобиля сжатым воздухом с применением специальных тряпок (для сохранения полировки автомобиля)",
            ),
        ],
        "price_mode": "body",
        "prices": [
            ("МОТО", 3000, ""),
            ("ХЕТЧБЕК", 6000, ""),
            ("СЕДАН", 6500, ""),
            ("УНИВЕРСАЛ", 6500, ""),
            ("КРОССОВЕР", 7000, ""),
            ("ДЖИП", 8000, ""),
        ],
        "price_note": "",
        "cta": "",
    },
    {
        "slug": "wrap",
        "num": "02",
        "title": "Оклейка",
        "h1": 'ОКЛЕЙКА<br><span class="accent">ПЛЁНКОЙ.</span>',
        "lead": (
            "Бронирование автомобиля — оклейка всего кузова либо отдельных частей "
            "специальной полиуретановой плёнкой, которая защищает автомобиль или его "
            "части от сколов и царапин. Также делаем цветную оклейку и акценты."
        ),
        "stages": [
            (
                "Осмотр и замер",
                "Смотрим кузов, согласуем зоны (фары, зона риска или весь кузов), материал и сроки",
            ),
            (
                "Подготовка поверхности",
                "Мойка, обезжиривание и подготовка ЛКП — чтобы плёнка легла ровно и держалась",
            ),
            (
                "Раскрой и оклейка",
                "Клеим выбранные зоны с проработкой кромок, ручек и сложных элементов",
            ),
            (
                "Прогрев и усадка",
                "Прогреваем плёнку, убираем воздушные карманы и фиксируем края",
            ),
            (
                "Контроль и выдача",
                "Проверяем стыки при свете и рассказываем уход в первые дни",
            ),
        ],
        "price_mode": "packages",
        "prices": [
            ("Фары", 8000, "от "),
            ("Зона риска", 80000, "от "),
            ("Весь кузов", 28000, "от "),
        ],
        "price_note": "Ориентир по защитной плёнке. Цветная оклейка и точная сумма — после осмотра. Можно собрать вариант в конфигураторе.",
        "cta": (
            '<div class="actions service-page-actions">'
            '<a class="button" href="../index.html#wrap">СОБРАТЬ ОКЛЕЙКУ</a>'
            '<a class="button dark" href="tel:+79130052315">ЗАПИСАТЬСЯ</a>'
            "</div>"
        ),
    },
    {
        "slug": "polish",
        "num": "03",
        "title": "Полировка",
        "h1": 'ПОЛИРОВКА<br><span class="accent">КУЗОВА.</span>',
        "lead": (
            "Придаёт автомобилю заводской зеркальный блеск посредством обработки кузова "
            "профессиональными абразивами. Устраняет мелкие повреждения, царапины, "
            "удаляет мельчайшие неровности лакокрасочного покрытия."
        ),
        "stages": [
            (
                "Подготовка",
                "Автомобиль проходит тщательную мойку, устраняются все металлические вкрапления, колодочная пыль. Удаляются все битумные отложения, следы насекомых. Кузов обрабатывается специальной глиной",
            ),
            (
                "Полировка",
                "Устраняются все дефекты. Кузов обрабатывается 3–4 специализированными абразивными пастами для придания автомобилю заводского блеска",
            ),
            (
                "Мойка",
                "Устраняются все видимые следы полировки",
            ),
        ],
        "price_mode": "body",
        "prices": [
            ("ХЕТЧБЕК", 26000, "от "),
            ("СЕДАН", 28000, "от "),
            ("УНИВЕРСАЛ", 30000, "от "),
            ("КРОССОВЕР", 35000, "от "),
            ("ДЖИП", 45000, "от "),
        ],
        "price_note": "Стоимость услуги «Полировка» может меняться в зависимости от состояния ЛКП. Конечная стоимость будет озвучена после визуального осмотра.",
        "cta": "",
    },
    {
        "slug": "interior",
        "num": "04",
        "title": "Химчистка",
        "h1": 'ХИМЧИСТКА<br><span class="accent">САЛОНА.</span>',
        "lead": (
            "Комплексная химчистка салона: сиденья, потолок, пластик, ковры и багажник. "
            "Убираем загрязнения и запахи без повреждения материалов."
        ),
        "stages": [
            (
                "Разбор и пылесос",
                "Снимаем ковры и коврики, пылесосим салон и скрытые ниши",
            ),
            (
                "Химия под материал",
                "Подбираем составы под ткань, кожу, алькантару и пластик",
            ),
            (
                "Проработка зон",
                "Чистим сиденья, потолок, двери, дефлекторы, подстаканники и карманы",
            ),
            (
                "Сушка и защита",
                "Сушим салон, при необходимости наносим защитные составы на кожу",
            ),
        ],
        "price_mode": "simple",
        "simple_price": "от 8 000 ₽",
        "price_note": "Стоимость зависит от объёма и материалов салона. Точная сумма — после осмотра.",
        "cta": "",
    },
    {
        "slug": "sound",
        "num": "05",
        "title": "Шумоизоляция",
        "h1": 'ШУМО-<br><span class="accent">ИЗОЛЯЦИЯ.</span>',
        "lead": (
            "Это процесс обработки салона специальными шумо- и вибропоглощающими материалами "
            "для достижения максимальной тишины и комфорта внутри автомобиля."
        ),
        "stages": [
            (
                "Разбор салона",
                "На данном этапе разбирается весь салон автомобиля (либо частично в зависимости от объёма услуги). Оголяется потолок, пол, двери, моторный щит",
            ),
            (
                "Очистка + подготовка",
                "После разбора все рабочие поверхности очищаются от грязи, пыли, старых изношенных материалов. Подготовка всех поверхностей для укладки материала",
            ),
            (
                "Шумоизоляция",
                "Послойная укладка шумо- и вибропоглощающих материалов до достижения необходимого эффекта (подбор и количество материала обсуждается индивидуально)",
            ),
            (
                "Сборка",
                "Все демонтированные элементы устанавливаются на штатные места. Стыки при необходимости проходятся специальной мягкой лентой для удаления скрипов (услуга с лентой обговаривается отдельно)",
            ),
        ],
        "price_mode": "note",
        "price_note": (
            "Стоимость услуги «Шумоизоляция» рассчитывается и зависит от выбора рабочей области, "
            "бренда, количества материалов и пожеланий клиента."
        ),
        "cta": "",
    },
    {
        "slug": "paint",
        "num": "06",
        "title": "Покраска",
        "h1": 'ПОКРАСКА<br><span class="accent">ЭЛЕМЕНТОВ.</span>',
        "lead": (
            "Окрас кузовных элементов с точным подбором оттенка: бампер, крыло, дверь "
            "или несколько деталей — акрил, металлик, перламутр."
        ),
        "stages": [
            (
                "Осмотр и подбор цвета",
                "Оцениваем повреждения, подбираем оттенок по каталогу и пробнику",
            ),
            (
                "Подготовка детали",
                "Рихтовка при необходимости, шпаклёвка, грунт и матирование",
            ),
            (
                "Окрас",
                "Наносим базу и лак в камере — ровный слой без опыла на соседние зоны",
            ),
            (
                "Сушка и полировка",
                "Сушим деталь, при необходимости полируем стыки под заводской блеск",
            ),
            (
                "Сборка и контроль",
                "Ставим деталь на место, сверяем цвет при дневном свете",
            ),
        ],
        "price_mode": "note",
        "price_note": "Стоимость зависит от детали и объёма. Предварительный расчёт — в конфигураторе окраса на странице «Кузов».",
        "cta": (
            '<div class="actions service-page-actions">'
            '<a class="button" href="../kuzov.html">ОЦЕНИТЬ ОКРАС</a>'
            '<a class="button dark" href="tel:+79130052315">ЗАПИСАТЬСЯ</a>'
            "</div>"
        ),
    },
    {
        "slug": "anticor",
        "num": "07",
        "title": "Антикор",
        "h1": 'АНТИКОР<br><span class="accent">ЗАЩИТА.</span>',
        "lead": (
            "Антикоррозийная защита днища, арок и скрытых полостей: очистка, "
            "обработка и консервация металла от соли и влаги."
        ),
        "stages": [
            (
                "Осмотр днища",
                "Поднимаем авто, оцениваем ржавчину, швы и состояние старого покрытия",
            ),
            (
                "Мойка и сушка",
                "Моем днище и арки, сушим скрытые полости перед обработкой",
            ),
            (
                "Подготовка металла",
                "Убираем рыхлую ржавчину, обезжириваем и готовим поверхности",
            ),
            (
                "Нанесение составов",
                "Обрабатываем днище, арки и полости профессиональными антикорами",
            ),
            (
                "Контроль",
                "Проверяем покрытие и подсказываем срок повторной обработки",
            ),
        ],
        "price_mode": "simple",
        "simple_price": "от 18 000 ₽",
        "price_note": "Точная сумма — после осмотра днища и арок.",
        "cta": "",
    },
    {
        "slug": "chips",
        "num": "08",
        "title": "Ремонт сколов и царапин",
        "h1": 'СКОЛЫ И<br><span class="accent">ЦАРАПИНЫ.</span>',
        "lead": (
            "Локальный ремонт сколов и царапин без полной покраски детали: "
            "закрываем повреждения, пока они не разрослись."
        ),
        "stages": [
            (
                "Осмотр повреждений",
                "Смотрим глубину сколов и царапин — до грунта, до металла или поверхностно",
            ),
            (
                "Подготовка зоны",
                "Очищаем и матируем локальный участок вокруг дефекта",
            ),
            (
                "Заполнение и цвет",
                "Заполняем скол, подбираем оттенок под ваш ЛКП",
            ),
            (
                "Лак и полировка",
                "Закрываем лаком и полируем стык, чтобы ремонт был незаметен",
            ),
        ],
        "price_mode": "simple",
        "simple_price": "от 2 500 ₽",
        "price_note": "Ориентир за один скол/царапину. Пакет нескольких зон — после осмотра.",
        "cta": "",
    },
    {
        "slug": "optics",
        "num": "09",
        "title": "Ремонт и восстановление оптики",
        "h1": 'РЕМОНТ И<br><span class="accent">ОПТИКА.</span>',
        "lead": (
            "Восстановление фар и фонарей: убираем помутнение и желтизну, "
            "при необходимости герметизируем корпус и ремонтируем повреждения."
        ),
        "stages": [
            (
                "Осмотр оптики",
                "Проверяем помутнение, трещины, влагу внутри и состояние креплений",
            ),
            (
                "Мойка и маскировка",
                "Моем фары, защищаем соседние элементы перед обработкой",
            ),
            (
                "Шлифовка и полировка",
                "Снимаем окисел и царапины, выводим прозрачность",
            ),
            (
                "Защита / герметизация",
                "Наносим защиту; при необходимости закрываем корпус от влаги",
            ),
        ],
        "price_mode": "simple",
        "simple_price": "от 4 000 ₽",
        "price_note": "Ориентир за пару фар (полировка). Ремонт и герметизация — после осмотра.",
        "cta": "",
    },
    {
        "slug": "pdr",
        "num": "10",
        "title": "Удаление вмятин (PDR)",
        "h1": 'УДАЛЕНИЕ<br><span class="accent">ВМЯТИН PDR.</span>',
        "lead": (
            "PDR — набор методов, который позволяет удалять вмятины на кузове автомобиля "
            "без покраски. Благодаря специализированному инструменту мастера удаляют "
            "вмятины практически любой сложности без вреда для ЛКП."
        ),
        "stages": [
            (
                "Подготовка",
                "Подготовка в каждом случае индивидуальна и представляет собой частичный разбор детали кузова для дальнейшего доступа к проблемному месту",
            ),
            (
                "Удаление вмятин",
                "В первую очередь мастер подбирает специальный инструмент под ваш случай. Затем — деликатная тонкая работа по устранению вмятины без вреда для ЛКП",
            ),
            (
                "Финал",
                "Сборка, визуальная проверка — и вмятины как не бывало",
            ),
        ],
        "price_mode": "simple",
        "simple_price": "от 500 ₽/шт",
        "price_note": "Цена может меняться в большую сторону. Окончательную стоимость озвучит специалист после визуального осмотра.",
        "cta": "",
    },
]

nav = """<nav class="site-nav">
  <div class="logo"><a href="../index.html"><span class="logo-mark">D2</span><span class="logo-word">DETAILING</span></a></div>
  <div class="links"><a href="../services.html">УСЛУГИ</a><a href="../kuzov.html">КУЗОВ</a><a href="../gallery.html">РАБОТЫ</a><a href="../about.html">О СТУДИИ</a><a href="../contact.html">КОНТАКТЫ</a></div>
  <div class="nav-actions">
    <a class="phone" href="tel:+79130052315">+7 (913) 005-23-15</a>
    <button class="nav-burger" type="button" aria-label="Открыть меню" aria-expanded="false">
      <span class="nav-burger-line"></span>
      <span class="nav-burger-line"></span>
      <span class="nav-burger-line"></span>
    </button>
  </div>
  <div class="nav-mobile-menu">
    <a href="../services.html">УСЛУГИ</a>
    <a href="../kuzov.html">КУЗОВ</a>
    <a href="../gallery.html">РАБОТЫ</a>
    <a href="../about.html">О СТУДИИ</a>
    <a href="../contact.html">КОНТАКТЫ</a>
  </div>
</nav>"""

footer = """<div class="site-bottom">
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
          <span class="kicker">ЛОКАЦИЯ</span>
        </div>
        <h2 class="address-map-title">ГДЕ МЫ<br><span>НАХОДИМСЯ.</span></h2>
        <p class="address-map-text">Приезжайте по записи. Адрес и маршрут — в 2ГИС.</p>
        <div class="address-map-divider" aria-hidden="true"></div>
      </div>
      <div class="address-map-visual">
        <a href="https://2gis.ru/novosibirsk/firm/70000001061278508" class="address-map-frame" target="_blank" rel="noopener noreferrer">
          <img class="address-map-img address-map-img--desktop" src="https://static.maps.2gis.com/1.0?s=880x450&amp;c=55.026031,82.943016&amp;z=18&amp;pt=55.026031,82.943016~k:p" alt="">
          <img class="address-map-img address-map-img--mobile" src="https://static.maps.2gis.com/1.0?s=720x720&amp;c=55.026031,82.943016&amp;z=18&amp;pt=55.026031,82.943016~k:p" alt="Карта 2ГИС — г. Новосибирск, Покатная улица, 30">
          <div class="address-map-pin-label" aria-hidden="true">
            <span class="address-map-pin-label-text"><span class="logo-mark">D2</span><span class="logo-word">DETAILING</span></span>
          </div>
        </a>
        <div class="address-map-decor"></div>
      </div>
      <div class="address-map-details-wrap">
        <div class="address-map-details">
          <div class="address-map-detail">
            <span class="address-map-detail-label">СЕРВИС</span>
            <p class="address-map-brand"><span class="logo-mark">D2</span><span class="logo-word">DETAILING</span></p>
            <p class="address-map-muted">г. Новосибирск, Покатная улица, 30</p>
            <p class="address-map-muted-sm">Пн–сб 10:00 – 20:00 · вс выходной</p>
          </div>
          <div class="address-map-detail">
            <span class="address-map-detail-label">ТЕЛЕФОН</span>
            <div class="address-map-phones">
            <a href="tel:+79130052315" class="address-map-phone">+7 (913) 005-23-15</a>
            </div>
          </div>
        </div>
        <a href="https://2gis.ru/novosibirsk/firm/70000001061278508" class="address-map-btn" target="_blank" rel="noopener noreferrer">Как добраться</a>
      </div>
    </div>
  </div>
</section>

<footer class="site-footer">
  <div class="footer-grid footer-desktop-only">
    <div class="footer-col footer-col--brand-hours">
      <div class="footer-brand-block">
        <div class="footer-logo"><span class="logo-mark">D2</span><span class="logo-word">DETAILING</span></div>
        <div class="footer-social"><a href="https://wa.me/79130052315" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="https://t.me/mromand2" target="_blank" rel="noopener noreferrer">Telegram</a><a href="https://2gis.ru/novosibirsk/firm/70000001061278508" target="_blank" rel="noopener noreferrer">2ГИС</a></div>
      </div>
      <div class="footer-hours-block">
        <b>РЕЖИМ РАБОТЫ</b>
        <span>Пн–сб 10:00 – 20:00 · вс выходной</span>
      </div>
    </div>
    <div class="footer-col">
      <b>НАВИГАЦИЯ</b>
      <a href="../index.html">Главная</a>
      <a href="../services.html">Услуги</a>
      <a href="../gallery.html">Работы</a>
      <a href="../about.html">О студии</a>
      <a href="../contact.html">Контакты</a>
    </div>
    <div class="footer-col footer-col--phones">
      <b>КОНТАКТЫ</b>
      <a class="footer-phone-inline" href="tel:+79130052315">+7 (913) 005-23-15</a>
    </div>
  </div>
  <div class="footer-grid footer-mobile-only">
    <div class="footer-col">
      <b>НАВИГАЦИЯ</b>
      <a href="../index.html">Главная</a>
      <a href="../services.html">Услуги</a>
      <a href="../gallery.html">Работы</a>
      <a href="../about.html">О студии</a>
      <a href="../contact.html">Контакты</a>
    </div>
    <div class="footer-col footer-col--brand-hours">
      <div class="footer-phones-block">
        <b>КОНТАКТЫ</b>
        <a class="footer-phone-inline" href="tel:+79130052315">+7 (913) 005-23-15</a>
      </div>
      <div class="footer-brand-divider" aria-hidden="true"></div>
      <div class="footer-brand-block">
        <div class="footer-logo"><span class="logo-mark">D2</span><span class="logo-word">DETAILING</span></div>
        <div class="footer-social"><a href="https://wa.me/79130052315" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="https://t.me/mromand2" target="_blank" rel="noopener noreferrer">Telegram</a><a href="https://2gis.ru/novosibirsk/firm/70000001061278508" target="_blank" rel="noopener noreferrer">2ГИС</a></div>
      </div>
      <div class="footer-hours-block">
        <b>РЕЖИМ РАБОТЫ</b>
        <span>Пн–сб 10:00 – 20:00 · вс выходной</span>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2026 D2_detailing</span>
    <span>ДЕТЕЙЛИНГ · НОВОСИБИРСК</span>
  </div>
</footer>
</div>"""

others = "".join(f'<a href="{s["slug"]}.html">{s["title"]}</a>' for s in services)
default_cta = (
    '<div class="actions service-page-actions">'
    '<a class="button" href="tel:+79130052315">ПОЗВОНИТЬ</a>'
    '<a class="button dark" href="tel:+79130052315">ЗАПИСАТЬСЯ</a>'
    "</div>"
)


def stages_html(stages):
    items = []
    for i, (title, text) in enumerate(stages, 1):
        side = "left" if i % 2 else "right"
        items.append(
            f'<div class="service-timeline-item service-timeline-item--{side}">'
            f'<div class="service-timeline-content">'
            f"<h3>{title}</h3>"
            f"<p>{text}</p>"
            f"</div>"
            f'<span class="service-timeline-dot" aria-hidden="true">{i}</span>'
            f"</div>"
        )
    return (
        '<div class="service-timeline">'
        '<div class="service-timeline-line" aria-hidden="true"></div>'
        + "".join(items)
        + "</div>"
    )


def body_prices_html(prices):
    cards = []
    for label, value, prefix in prices:
        sil_key = BODY_META[label]
        cards.append(
            f'<div class="service-price-sil-card">'
            f'{SILHOUETTES[sil_key]}'
            f'<span class="service-price-type">{label}</span>'
            f'<b class="service-price-value">{fmt_price(value, prefix)}</b>'
            f"</div>"
        )
    return f'<div class="service-price-sil-grid">{"".join(cards)}</div>'


def package_prices_html(prices):
    cards = []
    for label, value, prefix in prices:
        cards.append(
            f'<div class="service-price-pack-card">'
            f'<span class="service-price-type">{label}</span>'
            f'<b class="service-price-value">{fmt_price(value, prefix)}</b>'
            f"</div>"
        )
    return f'<div class="service-price-pack-grid">{"".join(cards)}</div>'


def price_section(s):
    mode = s.get("price_mode", "note")
    note = s.get("price_note") or ""
    head = (
        '<div class="service-price-title-wrap">'
        '<h2 class="service-price-title">ПРАЙС</h2>'
        "</div>"
    )
    if mode == "body":
        body = body_prices_html(s["prices"])
    elif mode == "packages":
        body = package_prices_html(s["prices"])
    elif mode == "simple":
        body = (
            f'<div class="service-price-simple">'
            f'<b class="service-price-value">{s["simple_price"]}</b>'
            f'<span class="service-price-simple-label">стоимость услуги</span>'
            f"</div>"
        )
    else:
        body = ""

    note_html = f'<p class="service-page-footnote">{note}</p>' if note else ""
    return f"{head}{body}{note_html}"


for s in services:
    cta = s["cta"] or default_cta
    html = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta name="site-build" content="delaikuzov-service-{s['slug']}-timeline-2026-10-12">
<title>{s['title']} — D2_detailing</title>
<link rel="stylesheet" href="../styles.css?v=26">
</head>
<body>
{nav}

<section class="subpage-hero">
  <div class="kicker">{s['num']} / УСЛУГА</div>
  <h1>{s['h1']}</h1>
  <p>{s['lead']}</p>
  <div class="actions" style="margin-top:28px">
    <a class="button" href="tel:+79130052315">ОНЛАЙН ЗАПИСЬ</a>
  </div>
</section>

<section class="section service-page service-page--stages">
  <h2 class="service-stages-title">Этапы работ</h2>
  {stages_html(s['stages'])}
</section>

<section class="section service-page service-page--price" id="price">
  {price_section(s)}
  {cta}
</section>

<section class="section service-page-works" id="works">
  <div class="section-head">
    <div><div class="kicker">РАБОТЫ</div><h2>ПРИМЕРЫ<br><span class="accent">ПО УСЛУГЕ.</span></h2></div>
    <p class="intro">Фото работ по этой услуге появятся здесь — пришлём и добавим.</p>
  </div>
  <div class="service-works-placeholder" data-service="{s['slug']}">
    <p>Галерея работ пока пустая. Когда будут фото — вставятся в этот блок.</p>
  </div>
</section>

<section class="section service-page-nav">
  <div class="kicker">ДРУГИЕ УСЛУГИ</div>
  <div class="service-page-links">{others}</div>
</section>

{footer}
<script src="../nav.js"></script>
</body>
</html>
"""
    (out / f"{s['slug']}.html").write_text(html, encoding="utf-8", newline="\n")
    print("wrote", s["slug"])

print("done", len(services))
