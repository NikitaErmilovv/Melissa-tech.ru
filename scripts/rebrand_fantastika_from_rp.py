#!/usr/bin/env python3
"""Rebrand rp-detailing copy → Fantastika_home174 cottage rental (structure unchanged)."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "fantastika-home174-lazurny"

LAT, LON = "55.370313", "61.688772"
GIS = "https://2gis.ru/chelyabinsk/geo/70000001098642477"
MAP_DESK = f"https://static.maps.2gis.com/1.0?s=880x450&amp;c={LAT},{LON}&amp;z=16&amp;pt={LAT},{LON}~k:p"
MAP_MOB = f"https://static.maps.2gis.com/1.0?s=720x720&amp;c={LAT},{LON}&amp;z=16&amp;pt={LAT},{LON}~k:p"
PHONE_TEL = "+79191213344"
PHONE_DISP = "+7 (919) 121-33-44"
PHONE2_TEL = "+79649696765"

REPLACEMENTS = [
    ("https://2gis.ru/togliatti/firm/70000001067251376", GIS),
    ("53.534132,49.25991", f"{LAT},{LON}"),
    ("tel:+79626123368", f"tel:{PHONE_TEL}"),
    ("tel:+79649696765", f"tel:{PHONE_TEL}"),
    ("+7 (962) 612-33-68", PHONE_DISP),
    ("+7 (964) 969-67-65", PHONE_DISP),
    ("79626123368", "79191213344"),
    ("9626123368", "9191213344"),
    ("+79626123368", PHONE_TEL),
    ('<span class="logo-mark">РП</span><span class="logo-word"></span>', '<span class="logo-mark">HOME</span><span class="logo-word">174</span>'),
    ("hero--rp", "hero--fantastika"),
    ("© 2026 РП", "© 2026 Fantastika_home174"),
    ("ДЕТЕЙЛИНГ-СТУДИЯ · ТОЛЬЯТТИ", "АРЕНДА КОТТЕДЖА · ПОС. ЛАЗУРНЫЙ"),
    ("г. Тольятти, 253-й квартал, стр. 19", "пос. Лазурный, ул. Радужная, 19"),
    ("По предварительной записи · 10:00–20:00", "Круглосуточно · по предварительной записи"),
    ("Приезжайте по записи. Адрес и маршрут — в 2ГИС.", "Ждём вас в гостеприимном доме у озера. Адрес и маршрут — в 2ГИС."),
    ('alt="Карта 2ГИС — г. Тольятти, 253-й квартал, стр. 19"', 'alt="Карта 2ГИС — пос. Лазурный, ул. Радужная, 19"'),
    ("<span class=\"address-map-detail-label\">СТУДИЯ</span>", "<span class=\"address-map-detail-label\">ДОМ</span>"),
    ("ТОЛЬЯТТИ", "ЛАЗУРНЫЙ"),
    ("Тольятти", "пос. Лазурный"),
    (" — РП", " — Fantastika_home174"),
    ("РП Detailing", "Fantastika_home174"),
    ('title>Услуги — РП', "title>Услуги — Fantastika_home174"),
    ("id=\"stat-reviews\">51", 'id="stat-reviews">16'),
    ("<b>5+</b><span>ЛЕТ НА РЫНКЕ</span>", "<b>24/7</b><span>КРУГЛОСУТОЧНО</span>"),
    ("<b>100%</b><span>РАБОТА ПО ЗАПИСИ</span>", "<b>100%</b><span>ТЁПЛЫЙ ПРИЁМ</span>"),
    ("ЗАПИСАТЬСЯ", "ЗАБРОНИРОВАТЬ"),
    ("Записаться", "Забронировать"),
    ("записаться", "забронировать"),
    ("ДЕТЕЙЛИНГ<br><span class=\"accent\">И ЗАЩИТА КУЗОВА</span>", "УЮТ И<br><span class=\"accent\">ЗАБОТА О ВАС</span>"),
    ("Работаем по записи — стоимость после осмотра автомобиля.", "Бронируйте заранее — с радостью подскажем свободные даты и расскажем о доме."),
    ("<span class=\"tag\">ПОЛИРОВКА</span>", "<span class=\"tag\">СВЕТ И УЮТ</span>"),
    ("<span class=\"tag\">ЗАЩИТНАЯ ПЛЁНКА</span>", "<span class=\"tag\">ПРИВАТНОСТЬ</span>"),
    ("<span class=\"tag\">ОКЛЕЙКА</span>", "<span class=\"tag\">ТЕРРАСА</span>"),
    ("<span class=\"tag\">МОЙКА ПОДКАПОТНОГО ПРОСТРАНСТВА</span>", "<span class=\"tag\">БАНЯ И РЕЛАКС</span>"),
    ("<span class=\"tag\">ДЕТЕЙЛИНГ-МОЙКА</span>", "<span class=\"tag\">ПРОСТОР</span>"),
    ("Работа с кузовом", "Уютные интерьеры"),
    ("Оптика и детали", "Территория и вид"),
    ("<h2>НАШИ<br><span class=\"accent\">РАБОТЫ.</span></h2>", "<h2>НАШ<br><span class=\"accent\">ДОМ.</span></h2>"),
    ("<h2>КАК МЫ<br><span class=\"accent\">РАБОТАЕМ.</span></h2>", "<h2>КАК<br><span class=\"accent\">ОТДЫХАТЬ.</span></h2>"),
    ("<h3>Заявка</h3><p>Звоните или пишите — уточняем задачу и удобное время.</p>", "<h3>Заявка</h3><p>Напишите или позвоните — с теплом подберём удобные даты для вашего отдыха.</p>"),
    ("<h3>Осмотр</h3><p>Оцениваем автомобиль и согласуем объём работ.</p>", "<h3>Знакомство</h3><p>Расскажем о доме, удобствах и том, что ждёт вас на отдыхе.</p>"),
    ("<h3>Работа</h3><p>Выполняем сервис по согласованному плану.</p>", "<h3>Отдых</h3><p>Встретим вас, поможем освоиться — чтобы вы чувствовали себя как дома.</p>"),
    ("<h3>Выдача</h3><p>Показываем результат и отвечаем на вопросы.</p>", "<h3>До встречи снова</h3><p>Будем искренне рады видеть вас снова в нашем уютном уголке.</p>"),
    ("ДЕТЕЙЛИНГ-СТУДИЯ<br><span class=\"accent\">ТОЛЬЯТТИ</span>", "АРЕНДА КОТТЕДЖА<br><span class=\"accent\">ЛАЗУРНЫЙ</span>"),
    ("ДЕТЕЙЛИНГ-СТУДИЯ<br><span class=\"accent\">РП</span>", "GUEST HOUSE<br><span class=\"accent\">174</span>"),
    ("ДЕТЕЙЛИНГ-<br>СТУДИЯ<br><span class=\"accent\">РП</span>", "GUEST<br>HOUSE<br><span class=\"accent\">174</span>"),
    ("детейлинг-студия на Московском проспекте в Автозаводском районе Тольятти. Уход за кузовом и салоном, полировка, плёнка и тонировка. Работаем по записи — звоните или пишите.", "Уютный гостевой дом в посёлке Лазурный — для тёплых встреч, семейного отдыха и спокойных выходных у воды. Принимаем гостей по предварительной записи — звоните или пишите, мы на связи."),
    ("КАЧЕСТВО<br><span class=\"accent\">ВАЖНЕЕ СКОРОСТИ.</span>", "ТЕПЛО<br><span class=\"accent\">И ЗАБОТА.</span>"),
    ("Мы не гонимся за количеством машин в день. Каждый автомобиль проходит осмотр, согласование работ и контроль результата. Работаем по записи — без спешки.", "Мы бережно относимся к каждому гостю: дом готовим заранее, всё продумано для вашего комфорта. Без суеты — только спокойный, душевный отдых."),
    ("<summary>Как узнать точную стоимость?</summary><p>Позвоните или напишите в мессенджер — опишите задачу или пришлите фото. Можно приехать на осмотр: после оценки назовём стоимость.</p>", "<summary>Как узнать стоимость аренды?</summary><p>Напишите или позвоните — уточним даты, число гостей и подскажем актуальную цену с заботой и без лишних формальностей.</p>"),
    ("<summary>Сколько времени занимает работа?</summary><p>Зависит от услуги и состояния автомобиля. Точные сроки согласуем при осмотре и записи.</p>", "<summary>На сколько можно снять дом?</summary><p>От коротких выходных до более длительного отдыха — подберём удобный срок именно для вас.</p>"),
    ("<summary>Работаете по записи?</summary><p>Да, принимаем по предварительной записи — так удобнее спланировать бокс и время мастера.</p>", "<summary>Нужна ли предварительная запись?</summary><p>Да, мы принимаем по записи — чтобы дом встретил вас идеально подготовленным и уютным.</p>"),
    ("<summary>Где посмотреть отзывы?</summary><p>Отзывы и рейтинг — в карточке организации в 2ГИС, ссылка есть на сайте и в мессенджерах.</p>", "<summary>Где почитать отзывы?</summary><p>Тёплые отзывы гостей — в 2ГИС, ссылка есть на сайте и в мессенджерах.</p>"),
    ("после осмотра", "уточняем"),
    ("автомобил", "дом"),
    ("Автомобил", "Дом"),
    ("машин", "гостей"),
    ("детейлинг", "отдых"),
    ("Детейлинг", "Отдых"),
    ("ДЕТЕЙЛИНГ", "ОТДЫХ"),
]

SERVICES_LIST = """    <a class="service-row" href="services/wash.html" id="svc-01"><div class="idx">01</div><div><h3>Просторные комнаты</h3><div class="service-desc"><p class="service-lead">Светлые спальни и гостиная — место, где приятно собраться всей семьёй.</p></div></div><div class="cost">уточняем</div></a>
    <a class="service-row" href="services/engine-bay.html" id="svc-02"><div class="idx">02</div><div><h3>Баня и релакс</h3><div class="service-desc"><p class="service-lead">Пар, тепло и отдых после насыщенного дня — всё для душевного восстановления.</p></div></div><div class="cost">уточняем</div></a>
    <a class="service-row" href="services/wrap.html" id="svc-03"><div class="idx">03</div><div><h3>Терраса и мангал</h3><div class="service-desc"><p class="service-lead">Вечера на свежем воздухе, аромат угольков и уютные разговоры до поздней ночи.</p></div></div><div class="cost">уточняем</div></a>
    <a class="service-row" href="services/ppf.html" id="svc-04"><div class="idx">04</div><div><h3>Тишина и приватность</h3><div class="service-desc"><p class="service-lead">Спокойный посёлок и уединение — отдых без городской суеты.</p></div></div><div class="cost">уточняем</div></a>
    <a class="service-row" href="services/polish.html" id="svc-05"><div class="idx">05</div><div><h3>Светлые интерьеры</h3><div class="service-desc"><p class="service-lead">Тёплый свет, приятные текстуры и заботливо подобранные детали.</p></div></div><div class="cost">уточняем</div></a>
    <a class="service-row" href="services/glass-polish.html" id="svc-06"><div class="idx">06</div><div><h3>Панорамные окна</h3><div class="service-desc"><p class="service-lead">Много воздуха и света — природа за окном как часть вашего отдыха.</p></div></div><div class="cost">уточняем</div></a>
    <a class="service-row" href="services/ceramic.html" id="svc-07"><div class="idx">07</div><div><h3>Тёплый пол и комфорт</h3><div class="service-desc"><p class="service-lead">Дом держит приятное тепло — уютно даже в прохладные вечера.</p></div></div><div class="cost">уточняем</div></a>
    <a class="service-row" href="services/interior.html" id="svc-08"><div class="idx">08</div><div><h3>Мягкий текстиль</h3><div class="service-desc"><p class="service-lead">Пледы, подушки и постель — чтобы вы отдыхали по-настоящему глубоко.</p></div></div><div class="cost">уточняем</div></a>
    <a class="service-row" href="services/soundproof.html" id="svc-09"><div class="idx">09</div><div><h3>Спокойный сон</h3><div class="service-desc"><p class="service-lead">Тихие ночи и выспавшиеся утра — лучший подарок отдыху.</p></div></div><div class="cost">уточняем</div></a>
    <a class="service-row" href="services/tint.html" id="svc-10"><div class="idx">10</div><div><h3>Закрытая территория</h3><div class="service-desc"><p class="service-lead">Безопасное пространство для детей, барбекю и неспешных прогулок.</p></div></div><div class="cost">уточняем</div></a>"""


def patch_file(path: Path, text: str) -> str:
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    text = text.replace(MAP_DESK.split("&amp;")[0], MAP_DESK)  # noop safety
    if path.name == "services.html":
        text = re.sub(
            r'<div class="service-list">.*?</div>\s*</section>',
            f'<div class="service-list">\n{SERVICES_LIST}\n  </div>\n</section>',
            text,
            count=1,
            flags=re.DOTALL,
        )
    if "address-map-img--desktop" in text and MAP_DESK not in text:
        text = re.sub(
            r'src="https://static\.maps\.2gis\.com/1\.0\?[^"]+"',
            f'src="{MAP_DESK}"',
            text,
            count=1,
        )
        text = re.sub(
            r'address-map-img--mobile" src="https://static\.maps\.2gis\.com/1\.0\?[^"]+"',
            f'address-map-img--mobile" src="{MAP_MOB}"',
            text,
            count=1,
        )
    return text


def main() -> None:
    for path in ROOT.rglob("*"):
        if path.suffix.lower() not in {".html", ".js", ".css", ".md", ".txt", ".bat", ".json"}:
            continue
        if path.is_dir():
            continue
        raw = path.read_text(encoding="utf-8")
        new = patch_file(path, raw)
        if new != raw:
            path.write_text(new, encoding="utf-8")
    print("OK", ROOT)


if __name__ == "__main__":
    main()
