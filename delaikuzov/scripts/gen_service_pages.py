# -*- coding: utf-8 -*-
from pathlib import Path

root = Path(__file__).resolve().parents[1]
out = root / "services"
out.mkdir(exist_ok=True)

services = [
    {
        "slug": "wash",
        "num": "01",
        "title": "Детейлинг-мойка",
        "h1": 'ДЕТЕЙЛИНГ-<br><span class="accent">МОЙКА.</span>',
        "lead": "Бережная мойка кузова и дисков без риска для лака и плёнки.",
        "body": "Готовим автомобиль к оклейке, полировке или просто возвращаем чистый вид после дороги. Работаем составами под тип покрытия — обычный лак, керамика или плёнка.",
        "cost": "после осмотра",
        "extra": "",
    },
    {
        "slug": "wrap",
        "num": "02",
        "title": "Оклейка",
        "h1": 'ОКЛЕЙКА<br><span class="accent">ПЛЁНКОЙ.</span>',
        "lead": "Цветная и защитная плёнка — отдельные детали или весь кузов.",
        "body": "Меняем цвет, защищаем капот и пороги, делаем акценты. Предварительный вид можно собрать в конфигураторе на главной — точную стоимость скажем после осмотра.",
        "cost": "после осмотра",
        "extra": (
            '<div class="actions" style="margin-top:28px">'
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
        "lead": "Абразивная полировка кузова — блеск и ровный лак.",
        "body": "Убираем мелкие царапины, голограммы и помутнения, возвращаем глубину цвета. Объём работ зависит от состояния ЛКП — согласуем на осмотре.",
        "cost": "после осмотра",
        "extra": "",
    },
    {
        "slug": "interior",
        "num": "04",
        "title": "Химчистка",
        "h1": 'ХИМЧИСТКА<br><span class="accent">САЛОНА.</span>',
        "lead": "Салон: сиденья, потолок, пластик и ковры.",
        "body": "Выводим запахи и пятна, не портя кожу и ткань. Можно сделать локально или полный комплекс — подберём под задачу.",
        "cost": "после осмотра",
        "extra": "",
    },
    {
        "slug": "sound",
        "num": "05",
        "title": "Шумоизоляция",
        "h1": 'ШУМО-<br><span class="accent">ИЗОЛЯЦИЯ.</span>',
        "lead": "Двери, пол, арки и крыша — меньше шума и вибраций.",
        "body": "Подбираем пакет под задачу: город, трасса или полная обработка. Материалы и объём согласуем до начала работ.",
        "cost": "после осмотра",
        "extra": "",
    },
    {
        "slug": "paint",
        "num": "06",
        "title": "Покраска",
        "h1": 'ПОКРАСКА<br><span class="accent">ЭЛЕМЕНТОВ.</span>',
        "lead": "Окрас кузовных элементов с точным подбором оттенка.",
        "body": "Бампер, крыло, дверь или весь кузов. Предварительный ориентир по деталям — в конфигураторе ремонта.",
        "cost": "от 15 000 ₽",
        "extra": (
            '<div class="actions" style="margin-top:28px">'
            '<a class="button" href="../kuzov.html">ОЦЕНИТЬ РЕМОНТ</a>'
            '<a class="button dark" href="tel:+79130052315">ЗАПИСАТЬСЯ</a>'
            "</div>"
        ),
    },
    {
        "slug": "anticor",
        "num": "07",
        "title": "Антикор",
        "h1": 'АНТИКОР<br><span class="accent">ЗАЩИТА.</span>',
        "lead": "Защита днища, арок и скрытых полостей.",
        "body": "Очищаем, обрабатываем и закрываем металл от соли и влаги. Подходит и для профилактики, и после кузовного ремонта.",
        "cost": "после осмотра",
        "extra": "",
    },
    {
        "slug": "chips",
        "num": "08",
        "title": "Ремонт сколов и царапин",
        "h1": 'СКОЛЫ И<br><span class="accent">ЦАРАПИНЫ.</span>',
        "lead": "Локальный ремонт лака без полной покраски детали.",
        "body": "Убираем сколы капота, царапины дверей и следы от веток. Если повреждение глубже — предложим покраску элемента.",
        "cost": "после осмотра",
        "extra": "",
    },
    {
        "slug": "optics",
        "num": "09",
        "title": "Ремонт и восстановление оптики",
        "h1": 'РЕМОНТ И<br><span class="accent">ОПТИКА.</span>',
        "lead": "Полировка, герметизация и ремонт фар и фонарей.",
        "body": "Возвращаем прозрачность стеклу, убираем помутнение и желтизну. При необходимости — герметизация и ремонт корпуса.",
        "cost": "после осмотра",
        "extra": "",
    },
    {
        "slug": "pdr",
        "num": "10",
        "title": "Удаление вмятин (PDR)",
        "h1": 'УДАЛЕНИЕ<br><span class="accent">ВМЯТИН PDR.</span>',
        "lead": "Мелкие вмятины и град — без нарушения заводского лака.",
        "body": "Исправляем повреждения, когда покраска не нужна. Если лак уже повреждён — скажем честно и предложим другой вариант.",
        "cost": "после осмотра",
        "extra": "",
    },
]

nav = """<nav class="site-nav">
  <div class="logo"><a href="../index.html"><span>ДЕЛАЙ</span>КУЗОВ</a></div>
  <div class="links"><a href="../services.html">УСЛУГИ</a><a href="../index.html#wrap">ОКЛЕЙКА</a><a href="../kuzov.html">КУЗОВ</a><a href="../gallery.html">РАБОТЫ</a><a href="../about.html">О СТУДИИ</a><a href="../contact.html">КОНТАКТЫ</a></div>
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
    <a href="../index.html#wrap">ОКЛЕЙКА</a>
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
        <a href="https://2gis.ru/novosibirsk/firm/70000001033514700" class="address-map-frame" target="_blank" rel="noopener noreferrer">
          <img class="address-map-img address-map-img--desktop" src="https://static.maps.2gis.com/1.0?s=880x450&amp;c=55.026024,82.942959&amp;z=18&amp;pt=55.026024,82.942959~k:p" alt="">
          <img class="address-map-img address-map-img--mobile" src="https://static.maps.2gis.com/1.0?s=720x720&amp;c=55.026024,82.942959&amp;z=18&amp;pt=55.026024,82.942959~k:p" alt="Карта 2ГИС — г. Новосибирск, Покатная улица, 30">
          <div class="address-map-pin-label" aria-hidden="true">
            <span class="address-map-pin-label-text"><span>ДЕЛАЙ</span>КУЗОВ</span>
          </div>
        </a>
        <div class="address-map-decor"></div>
      </div>
      <div class="address-map-details-wrap">
        <div class="address-map-details">
          <div class="address-map-detail">
            <span class="address-map-detail-label">СЕРВИС</span>
            <p class="address-map-brand"><span>ДЕЛАЙ</span>КУЗОВ</p>
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
        <a href="https://2gis.ru/novosibirsk/firm/70000001033514700" class="address-map-btn" target="_blank" rel="noopener noreferrer">Как добраться</a>
      </div>
    </div>
  </div>
</section>

<footer class="site-footer">
  <div class="footer-grid footer-desktop-only">
    <div class="footer-col footer-col--brand-hours">
      <div class="footer-brand-block">
        <div class="footer-logo"><span>ДЕЛАЙ</span>КУЗОВ</div>
        <div class="footer-social"><a href="https://wa.me/79130052315" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="https://t.me/mromand2" target="_blank" rel="noopener noreferrer">Telegram</a><a href="https://2gis.ru/novosibirsk/firm/70000001033514700" target="_blank" rel="noopener noreferrer">2ГИС</a></div>
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
        <div class="footer-logo"><span>ДЕЛАЙ</span>КУЗОВ</div>
        <div class="footer-social"><a href="https://wa.me/79130052315" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="https://t.me/mromand2" target="_blank" rel="noopener noreferrer">Telegram</a><a href="https://2gis.ru/novosibirsk/firm/70000001033514700" target="_blank" rel="noopener noreferrer">2ГИС</a></div>
      </div>
      <div class="footer-hours-block">
        <b>РЕЖИМ РАБОТЫ</b>
        <span>Пн–сб 10:00 – 20:00 · вс выходной</span>
      </div>
    </div>
  </div>
  <div class="footer-bottom">
    <span>© 2026 Делайкузов</span>
    <span>КУЗОВНОЙ РЕМОНТ · НОВОСИБИРСК</span>
  </div>
</footer>
</div>"""

others = "".join(
    f'<a href="{s["slug"]}.html">{s["title"]}</a>' for s in services
)

default_cta = (
    '<div class="actions" style="margin-top:28px">'
    '<a class="button" href="tel:+79130052315">ЗАПИСАТЬСЯ</a>'
    '<a class="button dark" href="../services.html">ВСЕ УСЛУГИ</a>'
    "</div>"
)

for s in services:
    cta = s["extra"] or default_cta
    html = f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<meta name="site-build" content="delaikuzov-service-{s['slug']}-2026-10-12">
<title>{s['title']} — Делайкузов</title>
<link rel="stylesheet" href="../styles.css?v=13">
</head>
<body>
{nav}

<section class="subpage-hero">
  <div class="kicker">{s['num']} / УСЛУГА</div>
  <h1>{s['h1']}</h1>
  <p>{s['lead']}</p>
</section>

<section class="section service-page">
  <div class="section-head">
    <div>
      <div class="kicker">О УСЛУГЕ</div>
      <h2>ЧТО<br><span class="accent">ДЕЛАЕМ.</span></h2>
    </div>
    <p class="intro">{s['body']}</p>
  </div>
  <div class="service-page-meta">
    <div class="service-page-cost"><span>Стоимость</span><b>{s['cost']}</b></div>
    <div class="service-page-note">Точная цена — после осмотра автомобиля.</div>
  </div>
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
    (out / f"{s['slug']}.html").write_text(html, encoding="utf-8")
    print("wrote", s["slug"])

print("done", len(services))
