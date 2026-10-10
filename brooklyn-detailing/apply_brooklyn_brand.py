# -*- coding: utf-8 -*-
"""One-off brand pass: Altay Toner -> Brooklyn detailing (Magnitogorsk)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LAT, LON = "53.407556", "58.984211"
GIS = "https://2gis.ru/magnitogorsk/firm/70000001112968680"
PHONE_TEL = "+79000755745"
PHONE_FMT = "+7 (900) 075-57-45"
EMAIL = "sokol174174797@gmail.com"

COMMON = [
    ("<span>АЛТАЙ</span> ТОНЕР", "<span>БРУКЛИН</span>"),
    ("<span>АЛТАЙ</span> ТОНЕР", "<span>БРУКЛИН</span>"),
    ("Алтай тонер", "Бруклин"),
    ("АЛТАЙ<br>ТОНЕР<br>", "БРУКЛИН<br>"),
    ("АЛТАЙ ТОНЕР", "БРУКЛИН"),
    ("Новоалтайск", "Магнитогорск"),
    ("НОВОАЛТАЙСК", "МАГНИТОГОРСК"),
    ("новоалтайск", "магнитогорск"),
    ("+79130843999", PHONE_TEL),
    ("+7 (913) 084-39-99", PHONE_FMT),
    ("https://wa.me/79130843999", f"https://wa.me/{PHONE_TEL[1:]}"),
    ("https://2gis.ru/novoaltajsk/firm/70000001078690287", GIS),
    ("53.406193,83.939082", f"{LAT},{LON}"),
    ("г. Новоалтайск, ул. Анатолия, 55, бокс 8", "г. Магнитогорск, Московская ул., 5 к1"),
    ("ул. Анатолия", "Московская ул., 5 к1"),
    ("бокс 8", "2-й б м-н"),
    ("© 2026 <span>АЛТАЙ</span> ТОНЕР", "© 2026 <span>БРУКЛИН</span>"),
]

INDEX_EXTRA = [
    (
        'content="Алтай тонер — студия детейлинга и тонировки LLumar в Новоалтайске. ул. Анатолия, 55. Запись по телефону +7 (913) 084-39-99."',
        f'content="Бруклин — студия детейлинга в Магнитогорске. Московская ул., 5 к1. Запись: {PHONE_FMT}."',
    ),
    ("детейлинга и тонировки · Новоалтайск", "детейлинга · Магнитогорск"),
    (
        "<p>Студия детейлинга и тонировки в Новоалтайске. Работаем с плёнками LLumar, бережно готовим кузов и выдаём автомобиль с гарантией на результат.</p>",
        "<p>Студия детейлинга в Магнитогорске: полировка, защита кузова и уход за салоном. Осмотр и запись по телефону — работаем аккуратно и с контролем результата.</p>",
    ),
    (
        """<div class="stat"><b>LLumar</b><span>ОФИЦИАЛЬНАЯ ПЛЁНКА</span></div>
  <div class="stat"><b>5.0</b><span>РЕЙТИНГ · 89 ОТЗЫВОВ · 2ГИС</span></div>
  <div class="stat"><b id="stat-rating">5.0</b><span>ОЦЕНКА КЛИЕНТОВ</span></div>
  <div class="stat"><b>8</b><span>БОКС · УЛ. АНАТОЛИЯ, 55</span></div>""",
        """<div class="stat"><b>PPF</b><span>ЗОНЫ РИСКА · ОТ 45 000 ₽</span></div>
  <div class="stat"><b>4.9</b><span>РЕЙТИНГ · 57 ОТЗЫВОВ · 2ГИС</span></div>
  <div class="stat"><b id="stat-rating">4.9</b><span>ОЦЕНКА КЛИЕНТОВ</span></div>
  <div class="stat"><b>12К+</b><span>ПОЛИРОВКА · ОТ</span></div>""",
    ),
    (
        "<p class=\"intro\">Тонировка по ГОСТу, детейлинг кузова и салона. Сначала осмотр и консультация — затем работа в закрытом боксе с контролем света.</p>",
        "<p class=\"intro\">Полировка, защитные плёнки и комплексный уход. Сначала осмотр — затем работа в студии с контролем света и финальной проверкой.</p>",
    ),
    ("<h3>Тонировка</h3><p>Плёнки LLumar: лобовое и боковые стёкла, атермальные решения, аккуратная установка без пузырей.</p>", "<h3>Зоны риска (PPF)</h3><p>Защита капота, фар, зеркал и зон сколов прозрачной плёнкой — от 45 000 ₽ по смете после осмотра.</p>"),
    ("<h3>Детейлинг</h3><p>Мойка, подготовка кузова, полировка и защита — восстанавливаем блеск и ухаживаем за лаком.</p>", "<h3>Полировка</h3><p>Коррекция ЛКП и восстановление блеска — от 12 000 ₽, срок и объём зависят от состояния кузова.</p>"),
    ("<h3>Комплекс</h3><p>Сочетаем тонировку с уходом за салоном и кузовом — один визит, понятный результат.</p>", "<h3>Детейлинг салона</h3><p>Химчистка, уход за кожей и пластиком — комплексно готовим автомобиль к сезону.</p>"),
    ("<span class=\"tag\">ТОНИРОВКА</span>", "<span class=\"tag\">ПОЛИРОВКА</span>"),
    (
        "<div class=\"quote\">«Тонировка и уход за авто — <span>когда видно качество с первого взгляда.</span>»</div>",
        "<div class=\"quote\">«Детейлинг — <span>когда блеск и чистота видны с первого взгляда.</span>»</div>",
    ),
    ("alt=\"Карта 2ГИС — г. Новоалтайск, ул. Анатолия, 55, бокс 8\"", "alt=\"Карта 2ГИС — Магнитогорск, Московская ул., 5 к1\""),
    ("<p class=\"address-map-muted-sm\">с 10:00 · по записи · по записи</p>", "<p class=\"address-map-muted-sm\">по записи · уточняйте по телефону</p>"),
    ("<title>Алтай тонер — детейлинг и тонировка · Новоалтайск</title>", "<title>Бруклин — студия детейлинга · Магнитогорск</title>"),
]

SERVICES_EXTRA = [
    ("<title>Услуги — Алтай тонер</title>", "<title>Услуги — Бруклин</title>"),
    (
        """<div class="service-row"><div class="idx">01</div><div><h3>Тонировка LLumar</h3><p>Боковые стёкла, задняя полусфера, атермальные плёнки. Подбор плотности под ваши задачи и требования.</p></div><div class="meta">по записи<br>любой класс авто</div><div class="cost">по смете</div></div>
    <div class="service-row"><div class="idx">02</div><div><h3>Детейлинг и мойка</h3><p>Бережная мойка, очистка кузова и подготовка к дальнейшим работам в студии.</p></div><div class="meta">от 2 часов<br>кузов / диски</div><div class="cost">по смете</div></div>
    <div class="service-row"><div class="idx">03</div><div><h3>Полировка кузова</h3><p>Коррекция мелких дефектов ЛКП, восстановление глубины цвета и блеска.</p></div><div class="meta">1–2 дня<br>по состоянию ЛКП</div><div class="cost">по смете</div></div>
    <div class="service-row"><div class="idx">04</div><div><h3>Химчистка салона</h3><p>Текстиль, кожа, пластик — глубокая очистка и уход за интерьером.</p></div><div class="meta">≈ 4–8 часов<br>салон целиком</div><div class="cost">по смете</div></div>
    <div class="service-row"><div class="idx">05</div><div><h3>Комплексный уход</h3><p>Тонировка + детейлинг в одном визите: согласуем этапы и сроки заранее.</p></div><div class="meta">индивидуально<br>по осмотру</div><div class="cost">по смете</div></div>""",
        """<div class="service-row"><div class="idx">01</div><div><h3>Зоны риска (PPF)</h3><p>Защита капота, фар, зеркал и зон сколов. Прозрачная плёнка сохраняет лак и снижает риск повреждений.</p></div><div class="meta">по осмотру<br>любой класс</div><div class="cost">от 45 000 ₽</div></div>
    <div class="service-row"><div class="idx">02</div><div><h3>Полировка кузова</h3><p>Удаление мелких царапин и восстановление глубины цвета. Финиш под защиту или выдачу «как с выставки».</p></div><div class="meta">1–2 дня<br>по ЛКП</div><div class="cost">от 12 000 ₽</div></div>
    <div class="service-row"><div class="idx">03</div><div><h3>Детейлинг и мойка</h3><p>Бережная мойка, деконтаминация и подготовка к полировке или защите.</p></div><div class="meta">от 2 часов<br>кузов / диски</div><div class="cost">по смете</div></div>
    <div class="service-row"><div class="idx">04</div><div><h3>Химчистка салона</h3><p>Текстиль, кожа, пластик — глубокая очистка и уход за интерьером.</p></div><div class="meta">≈ 4–8 часов<br>салон целиком</div><div class="cost">по смете</div></div>
    <div class="service-row"><div class="idx">05</div><div><h3>Комплекс</h3><p>Полировка, защита и уход за салоном в одном визите — согласуем этапы заранее.</p></div><div class="meta">индивидуально<br>по осмотру</div><div class="cost">по смете</div></div>""",
    ),
]

GALLERY_WORK03 = """  <div class="gallery gallery--portfolio">
    <a class="g g--media" href="img/works/brooklyn-05.jpg" data-lightbox="work-03"><img src="img/works/brooklyn-05.jpg" alt="" loading="lazy" decoding="async"></a>
    <a class="g g--media" href="img/works/brooklyn-06.jpg" data-lightbox="work-03"><img src="img/works/brooklyn-06.jpg" alt="" loading="lazy" decoding="async"></a>
    <a class="g g--media" href="img/works/brooklyn-07.jpg" data-lightbox="work-03"><img src="img/works/brooklyn-07.jpg" alt="" loading="lazy" decoding="async"></a>
    <a class="g g--media" href="img/works/brooklyn-08.jpg" data-lightbox="work-03"><img src="img/works/brooklyn-08.jpg" alt="" loading="lazy" decoding="async"></a>
    <a class="g g--media" href="img/works/brooklyn-09.jpg" data-lightbox="work-03"><img src="img/works/brooklyn-09.jpg" alt="" loading="lazy" decoding="async"></a>
    <a class="g g--media" href="img/works/brooklyn-10.jpg" data-lightbox="work-03"><img src="img/works/brooklyn-10.jpg" alt="" loading="lazy" decoding="async"></a>
    <a class="g g--media" href="img/works/brooklyn-11.jpg" data-lightbox="work-03"><img src="img/works/brooklyn-11.jpg" alt="" loading="lazy" decoding="async"></a>
    <a class="g g--media" href="img/works/brooklyn-12.jpg" data-lightbox="work-03"><img src="img/works/brooklyn-12.jpg" alt="" loading="lazy" decoding="async"></a>
    <a class="g g--media" href="img/works/brooklyn-13.jpg" data-lightbox="work-03"><img src="img/works/brooklyn-13.jpg" alt="" loading="lazy" decoding="async"></a>
  </div>"""


def apply(text: str, extra=None) -> str:
    for a, b in COMMON:
        text = text.replace(a, b)
    if extra:
        for a, b in extra:
            text = text.replace(a, b)
    return text


def patch_file(name: str, extra=None):
    path = ROOT / name
    if not path.exists():
        return
    raw = path.read_text(encoding="utf-8")
    path.write_text(apply(raw, extra), encoding="utf-8")


def main():
    for html in ROOT.glob("*.html"):
        extra = None
        if html.name == "index.html":
            extra = INDEX_EXTRA
        elif html.name == "services.html":
            extra = SERVICES_EXTRA
        elif html.name == "gallery.html":
            extra = [
                ("<title>Работы — Алтай тонер</title>", "<title>Работы — Бруклин</title>"),
                ("<h2>Тонировка LLumar</h2>", "<h2>Защита кузова (PPF)</h2>"),
                (
                    "<p class=\"service-lead\">Аккуратная установка плёнки и ровная линия реза.</p>\n        <p>Тонируем боковые стёкла и заднюю полусферу, подбираем светопропускание под ваши задачи. В студии — баннер и материалы LLumar.</p>",
                    "<p class=\"service-lead\">Прозрачная плёнка на зоны риска.</p>\n        <p>Защищаем капот, фары и зоны сколов — сохраняем заводской лак и внешний вид автомобиля.</p>",
                ),
                (
                    "<p class=\"service-lead\">Разные классы и задачи — от тонировки до комплексного ухода.</p>\n        <p>Фото из бокса на ул. Анатолия: то, с чем работаем каждый день.</p>",
                    "<p class=\"service-lead\">Разные классы и задачи — от полировки до комплекса.</p>\n        <p>Фото из студии на Московской: реальные автомобили клиентов.</p>",
                ),
                (
                    'href="img/works/photo_2025-08-30_16-21-25.jpg" data-lightbox="work-02"><img src="img/works/photo_2025-08-30_16-21-25.jpg"',
                    'href="img/works/brooklyn-04.jpg" data-lightbox="work-02"><img src="img/works/brooklyn-04.jpg"',
                ),
            ]
        elif html.name == "about.html":
            extra = [
                ("<title>О студии — Алтай тонер</title>", "<title>О студии — Бруклин</title>"),
                (
                    "«Алтай тонер» — студия детейлинга и тонировки в Новоалтайске. Используем плёнки LLumar, работаем в закрытом боксе и показываем результат на свету — до выдачи автомобиля.",
                    "«Бруклин» — студия детейлинга в Магнитогорске. Полировка, защита кузова и уход за салоном. Показываем результат при студийном свете — до выдачи автомобиля.",
                ),
            ]
        elif html.name == "contact.html":
            extra = [
                ("<title>Контакты — Алтай тонер</title>", "<title>Контакты — Бруклин</title>"),
            ]
        patch_file(html.name, extra)

    gal = ROOT / "gallery.html"
    text = gal.read_text(encoding="utf-8")
    start = text.find('<section class="section work-block" id="work-03">')
    end = text.find("</section>", text.find("id=\"work-03\""))
    if start != -1:
        block_end = text.find("</section>", text.find('<div class="gallery gallery--portfolio">', start))
        if block_end != -1:
            inner_start = text.find('<div class="gallery gallery--portfolio">', start)
            inner_end = text.find("</div>", text.find("brooklyn-13", text) if "brooklyn-13" in text else inner_start)
    # replace png gallery block
    old = text[text.find('<div class="gallery gallery--portfolio">', text.find("work-03")) : text.find("</section>", text.find("work-03"))].split("</div>\n</section>")[0]
    if "porsche-white" in text:
        i0 = text.index('<section class="section work-block" id="work-03">')
        i1 = text.index("</section>", text.index('id="work-03"'))
        chunk = text[i0 : i1 + len("</section>")]
        new_chunk = chunk
        g0 = chunk.index('<div class="gallery gallery--portfolio">')
        g1 = chunk.rindex("</div>")
        new_chunk = chunk[:g0] + GALLERY_WORK03.strip() + "\n" + chunk[g1 + len("</div>") :]
        text = text[:i0] + new_chunk + text[i1 + len("</section>") :]
        gal.write_text(apply(text), encoding="utf-8")

    readme = ROOT / "README.md"
    readme.write_text(
        """# Бруклин — студия детейлинга (прототип)

Магнитогорск, Московская ул., 5 к1. Демо на Melissa-tech: `/brooklyn-detailing/`.

Локально: `start.bat` → http://127.0.0.1:8088/
""",
        encoding="utf-8",
    )
    (ROOT / "deploy-version.txt").write_text("brooklyn-detailing-1\n", encoding="utf-8")
    print("brooklyn-detailing: done")


if __name__ == "__main__":
    main()
