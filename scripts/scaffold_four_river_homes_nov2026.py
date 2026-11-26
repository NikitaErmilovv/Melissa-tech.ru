#!/usr/bin/env python3
"""Copy river-home-terentievo → 4 orgs (2GIS), rebrand text only."""

from __future__ import annotations

import json
import re
import shutil
import sys
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "river-home-terentievo"
TEXT_SUFFIXES = {".html", ".js", ".json", ".md", ".txt", ".py", ".css", ".bat"}

sys.path.insert(0, str(ROOT / "scripts"))
from fetch_2gis_reviews import fetch_branch_reviews  # noqa: E402


def fmt_phone(tel: str) -> str:
    d = re.sub(r"\D", "", tel)
    if d.startswith("8") and len(d) == 11:
        d = "7" + d[1:]
    if len(d) == 11 and d[0] == "7":
        return f"+7 ({d[1:4]}) {d[4:7]}-{d[7:9]}-{d[9:11]}"
    if len(d) == 10:
        return f"+7 ({d[0:3]}) {d[3:6]}-{d[6:8]}-{d[8:10]}"
    return tel


def wa_digits(tel: str) -> str:
    d = re.sub(r"\D", "", tel)
    if d.startswith("8"):
        d = "7" + d[1:]
    return d


def map_urls(lat: str, lon: str) -> tuple[str, str, str]:
    pair = f"{lat},{lon}"
    desktop = f"https://static.maps.2gis.com/1.0?s=880x450&amp;c={pair}&amp;z=16&amp;pt={pair}~k:p"
    mobile = f"https://static.maps.2gis.com/1.0?s=720x720&amp;c={pair}&amp;z=16&amp;pt={pair}~k:p"
    return desktop, mobile, pair


def parse_og(og: str) -> tuple[float, int]:
    rating_m = re.search(r"Оценка\s+([\d.]+)", og)
    reviews_m = re.search(r"(\d+)\s+отзыв", og)
    rating = float(rating_m.group(1)) if rating_m else 5.0
    reviews = int(reviews_m.group(1)) if reviews_m else 0
    return rating, reviews


def write_contacts(path: Path, cfg: dict) -> None:
  content = f'''window.STUDIO_MESSENGERS = {{
  wa: "{cfg["wa"]}",
  tg: "{cfg["tel_e164"]}",
  defaultMessage:
    "{cfg["default_message"]}",
}};

window.STUDIO_CONTACTS = {{
  addressLine: "{cfg["address_line"]}",
  hoursLine: "{cfg["hours"]}",
  mapLat: {cfg["lat"]},
  mapLon: {cfg["lon"]},
  gisFirm: "{cfg["gis_url"]}",
  email: "{cfg.get("email", "")}",
  phones: {json.dumps(cfg["phones"], ensure_ascii=False, indent=2)},
}};
'''
  path.write_text(content, encoding="utf-8")


def write_reviews_data(path: Path, cfg: dict, reviews: list) -> None:
    rating, ratings_count = parse_og(cfg["og_description"])
    items = []
    for i, r in enumerate(reviews[:7]):
        items.append(
            {
                "id": f"{cfg['review_prefix']}-{i + 1}",
                "name": r.get("name") or "Гость",
                "text": r.get("text") or "",
                "rating": int(r.get("rating") or 5),
                "date": r.get("date") or "",
            }
        )
    payload = {
        "meta": {
            "source": "2GIS snapshot (static, no live fetch)",
            "firmId": cfg["firm_id"],
            "snapshotAt": date.today().isoformat(),
            "rating": rating,
            "ratingsCount": ratings_count or len(items),
            "carouselCount": len(items),
        },
        "reviews": items,
    }
    js = "// Static snapshot from 2GIS — do not fetch at runtime\n"
    js += f"window.RIVER_HOME_SITE_REVIEWS = {json.dumps(payload, ensure_ascii=False, indent=2)};\n"
    path.write_text(js, encoding="utf-8")


def apply_replacements(dest: Path, pairs: list[tuple[str, str]]) -> None:
    for path in dest.rglob("*"):
        if not path.is_file() or path.suffix not in TEXT_SUFFIXES:
            continue
        if "node_modules" in path.parts:
            continue
        text = path.read_text(encoding="utf-8")
        orig = text
        for old, new in pairs:
            if old:
                text = text.replace(old, new)
        if text != orig:
            path.write_text(text, encoding="utf-8")


def patch_server_py(path: Path, port: int, gis_url: str, firm_id: str) -> None:
    text = path.read_text(encoding="utf-8")
    text = re.sub(r"^PORT = \d+", f"PORT = {port}", text, count=1, flags=re.M)
    text = re.sub(
        r'^FIRM_URL = "https://2gis\.ru/[^"]+"',
        f'FIRM_URL = "{gis_url}"',
        text,
        count=1,
        flags=re.M,
    )
    path.write_text(text, encoding="utf-8")


SITES = [
    {
        "slug": "ozero-kaldy-sary",
        "port": 8153,
        "city_slug": "chelyabinsk",
        "firm_id": "70000001101369405",
        "gis_url": "https://2gis.ru/chelyabinsk/firm/70000001101369405",
        "og_description": "Оценка 5, 63 фото, 8 отзывов. Вся информация об этом месте есть в 2ГИС",
        "brand_upper": "ОЗЕРО КАЛДЫ",
        "brand_title": "На берегу озера Калды",
        "brand_quoted": "«На берегу озера Калды»",
        "eyebrow": "с. Сары",
        "address_short": "с. Сары, Полевая ул., 35",
        "address_line": "Челябинская область, с. Сары, Полевая ул., 35",
        "location_p": "Ждём вас у озера Калды в селе Сары. Адрес и маршрут — в 2ГИС.",
        "footer_tag": "дом с чаном и баней",
        "tel_e164": "+79229999275",
        "wa": "79229999275",
        "email": "",
        "lat": "55.688073",
        "lon": "61.321148",
        "hours": "По предварительной записи",
        "hours_stat": "по записи",
        "reviews_stat": "8",
        "rating_stat": "5",
        "review_prefix": "kaldy",
        "cache_prefix": "ozero-kaldy",
        "default_message": "Здравствуйте! Хочу забронировать дом на берегу озера Калды, с. Сары, Полевая ул., 35.",
        "hero_p": (
            "Дом с чаном и баней на берегу озера Калды, с. Сары, Полевая ул., 35 — уютный отдых "
            "у воды, парная, купель и тёплая территория. Бронирование по записи — звоните или пишите."
        ),
        "booking_p": (
            "«На берегу озера Калды», с. Сары, Полевая ул., 35. Укажите даты и гостей — "
            "заявку отправите в WhatsApp или Telegram на номер из 2ГИС."
        ),
        "album_intro": "Внутри дома, баня с чаном и двор у озера — как это видят гости.",
        "about_p": "Дом с чаном и баней в с. Сары, Полевая ул., 35. Отдых у озера Калды, баня и купель. Бронирование по записи.",
        "phones": [
            {
                "label": "Бронирование",
                "name": "",
                "tel": "+79229999275",
                "display": fmt_phone("+79229999275"),
            }
        ],
    },
    {
        "slug": "u-kremlya-tobolsk",
        "port": 8154,
        "city_slug": "tobolsk",
        "firm_id": "70000001047635862",
        "gis_url": "https://2gis.ru/tobolsk/firm/70000001047635862",
        "og_description": "Оценка 4.7, 50 фото, 130 отзывов. Вся информация об этом месте есть в 2ГИС",
        "brand_upper": "У КРЕМЛЯ",
        "brand_title": "У Кремля",
        "brand_quoted": "«У Кремля»",
        "eyebrow": "Тобольск",
        "address_short": "Тобольск, ул. Свердлова, 55",
        "address_line": "Тюменская область, Тобольск, ул. Свердлова, 55",
        "location_p": "Ждём вас в гостевом доме «У Кремля» в Тобольске. Адрес и маршрут — в 2ГИС.",
        "footer_tag": "гостевой дом",
        "tel_e164": "+79123803538",
        "wa": "79123803538",
        "email": "natalya.dorovickova@yandex.ru",
        "lat": "58.209204",
        "lon": "68.253582",
        "hours": "Круглосуточно",
        "hours_stat": "24–7",
        "reviews_stat": "130",
        "rating_stat": "4.7",
        "review_prefix": "kremlya",
        "cache_prefix": "u-kremlya",
        "default_message": "Здравствуйте! Хочу забронировать гостевой дом «У Кремля», Тобольск, ул. Свердлова, 55.",
        "hero_p": (
            "Гостевой дом «У Кремля» в Тобольске, ул. Свердлова, 55 — уютное размещение рядом с историческим "
            "центром, тёплый приём и всё для спокойного отдыха. Круглосуточно, бронь от суток."
        ),
        "booking_p": (
            "«У Кремля», Тобольск, ул. Свердлова, 55. Укажите даты и гостей — заявку отправите "
            "в WhatsApp или Telegram на номер из 2ГИС."
        ),
        "album_intro": "Комнаты, зона отдыха и территория — как это видят гости «У Кремля».",
        "about_p": "Гостевой дом в Тобольске, ул. Свердлова, 55. Уютные комнаты и тёплый приём у Кремля. Бронирование от суток.",
        "phones": [
            {
                "label": "Бронирование",
                "name": "",
                "tel": "+79123803538",
                "display": fmt_phone("+79123803538"),
            }
        ],
    },
    {
        "slug": "dobrynya-tobolsk",
        "port": 8155,
        "city_slug": "tobolsk",
        "firm_id": "70000001051174149",
        "gis_url": "https://2gis.ru/tobolsk/firm/70000001051174149",
        "og_description": "Оценка 4.8, 149 фото, 123 отзыва. Вся информация об этом месте есть в 2ГИС",
        "brand_upper": "ДОБРЫНЯ",
        "brand_title": "Добрыня",
        "brand_quoted": "«Добрыня»",
        "eyebrow": "Тобольск",
        "address_short": "Тобольск, Заречный пер., 9а",
        "address_line": "Тюменская область, Тобольск, Заречный пер., 9а",
        "location_p": "Ждём вас на базе отдыха «Добрыня» в Тобольске. Адрес и маршрут — в 2ГИС.",
        "footer_tag": "база отдыха",
        "tel_e164": "+79526891602",
        "wa": "79526891602",
        "email": "",
        "lat": "58.276545",
        "lon": "68.252493",
        "hours": "Круглосуточно",
        "hours_stat": "24–7",
        "reviews_stat": "123",
        "rating_stat": "4.8",
        "review_prefix": "dobrynya",
        "cache_prefix": "dobrynya",
        "default_message": "Здравствуйте! Хочу забронировать базу отдыха «Добрыня», Тобольск, Заречный пер., 9а.",
        "hero_p": (
            "База отдыха «Добрыня» в Тобольске, Заречный пер., 9а — бани, сауны, чан и зона для "
            "спокойного отдыха компанией. Принимаем круглосуточно, бронь по телефону или в мессенджерах."
        ),
        "booking_p": (
            "«Добрыня», Тобольск, Заречный пер., 9а. Укажите даты и гостей — заявку отправите "
            "в WhatsApp или Telegram на номер из 2ГИС."
        ),
        "album_intro": "Интерьеры, парная с чаном и территория — как это видят гости «Добрыня».",
        "about_p": "База отдыха в Тобольске, Заречный пер., 9а. Баня, сауна и отдых на природе. Бронирование от суток.",
        "phones": [
            {
                "label": "Бронирование",
                "name": "",
                "tel": "+79526891602",
                "display": fmt_phone("+79526891602"),
            },
            {
                "label": "Дополнительно",
                "name": "",
                "tel": "+79292665665",
                "display": fmt_phone("+79292665665"),
            },
            {
                "label": "Справочная",
                "name": "",
                "tel": "+73456263474",
                "display": "+7 (3456) 26-34-74",
            },
        ],
    },
    {
        "slug": "belaya-bereza-tyumen",
        "port": 8156,
        "city_slug": "tyumen",
        "firm_id": "70000001117255594",
        "gis_url": "https://2gis.ru/tyumen/firm/70000001117255594",
        "og_description": "Оценка 5, 20 фото, 2 отзыва. Вся информация об этом месте есть в 2ГИС",
        "brand_upper": "БЕЛАЯ БЕРЕЗА",
        "brand_title": "Белая береза",
        "brand_quoted": "«Белая береза»",
        "eyebrow": "Тюмень",
        "address_short": "Тюмень, ул. Степана Третьякова, 58а",
        "address_line": "Тюменская область, Тюмень, ул. Степана Третьякова, 58а",
        "location_p": "Ждём вас в коттедже «Белая береза» в Тюмени. Адрес и маршрут — в 2ГИС.",
        "footer_tag": "загородный дом",
        "tel_e164": "+79829187031",
        "wa": "79829187031",
        "email": "",
        "lat": "57.215415",
        "lon": "65.509153",
        "hours": "По предварительной записи",
        "hours_stat": "по записи",
        "reviews_stat": "2",
        "rating_stat": "5",
        "review_prefix": "bereza",
        "cache_prefix": "belaya-bereza",
        "default_message": "Здравствуйте! Хочу забронировать коттедж «Белая береза», Тюмень, ул. Степана Третьякова, 58а.",
        "hero_p": (
            "Коттедж «Белая береза» в Тюмени, ул. Степана Третьякова, 58а — загородный дом для семейного "
            "отдыха и спокойных выходных. Бронирование по записи — звоните или пишите."
        ),
        "booking_p": (
            "«Белая береза», Тюмень, ул. Степана Третьякова, 58а. Укажите даты и гостей — заявку отправите "
            "в WhatsApp или Telegram на номер из 2ГИС."
        ),
        "album_intro": "Интерьеры, зона отдыха и участок — как это видят гости коттеджа.",
        "about_p": "Загородный коттедж в Тюмени, ул. Степана Третьякова, 58а. Уютный дом для отдыха компанией или семьёй.",
        "phones": [
            {
                "label": "Бронирование",
                "name": "",
                "tel": "+79829187031",
                "display": fmt_phone("+79829187031"),
            },
            {
                "label": "Дополнительно",
                "name": "",
                "tel": "+73452992275",
                "display": "+7 (345) 299-22-75",
            },
        ],
    },
]


def build_pairs(cfg: dict) -> list[tuple[str, str]]:
    desktop, mobile, pair = map_urls(cfg["lat"], cfg["lon"])
    map_alt = f"Карта 2ГИС — {cfg['address_short']}"
    tel_display = fmt_phone(cfg["tel_e164"])
    pairs = [
        (
            "Гостевой дом River home в д. Терентьево, Солнечная ул., 14 — уютный домик у реки, сауна и купель-чан, мангальная зона и место у костра. Круглосуточно, бронь от суток. Скидка 10% при бронировании дома и купели.",
            cfg["hero_p"],
        ),
        (
            "«River home», д. Терентьево, Солнечная ул., 14. Укажите даты и гостей — заявку отправите в WhatsApp или Telegram на номер из 2ГИС.",
            cfg["booking_p"],
        ),
        (
            "Внутри дома, купель с сауной и двор у реки — как это видят гости River home.",
            cfg["album_intro"],
        ),
        (
            "Гостевой дом в д. Терентьево, Солнечная ул., 14. Два этажа, до 6 гостей, мангал на территории. Бронирование от суток.",
            cfg["about_p"],
        ),
        (
            "Здравствуйте! Хочу забронировать «River home», д. Терентьево, Солнечная ул., 14.",
            cfg["default_message"],
        ),
        ("river-home-terentievo", cfg["slug"]),
        ("river-home-", f"{cfg['cache_prefix']}-"),
        ("https://2gis.ru/krasnoyarsk/firm/70000001100637525", cfg["gis_url"]),
        ("70000001100637525", cfg["firm_id"]),
        ("56.118296,93.291262", pair),
        ("56.118296", cfg["lat"]),
        ("93.291262", cfg["lon"]),
        ("+79835045116", cfg["tel_e164"]),
        ("+7 (983) 504-51-16", tel_display),
        ("79835045116", cfg["wa"]),
        ("RIVER HOME", cfg["brand_upper"]),
        ("River home", cfg["brand_title"]),
        ("«River home»", cfg["brand_quoted"]),
        ("© 2026 RIVER HOME", f"© 2026 {cfg['brand_upper']}"),
        ("д. Терентьево, Солнечная ул., 14", cfg["address_short"]),
        ("д. Терентьево", cfg["eyebrow"] if cfg["slug"] == "ozero-kaldy-sary" else cfg["address_short"].split(",")[0].strip()),
        ("Терентьево", cfg["eyebrow"]),
        ("Солнечная ул., 14", cfg["address_short"].split(",")[-1].strip() if "," in cfg["address_short"] else cfg["address_short"]),
        (
            "Красноярский край, Сосновоборский муниципальный округ, д. Терентьево, Солнечная ул., 14",
            cfg["address_line"],
        ),
        ("Ждём вас в д. Терентьево, мкр. Лазурные берега. Адрес и маршрут — в 2ГИС.", cfg["location_p"]),
        ("Гостевой дом · д. Терентьево, Солнечная ул., 14", f"{cfg['footer_tag'].capitalize()} · {cfg['address_short']}"),
        ("Круглосуточно", cfg["hours"]),
        ("24–7", cfg["hours_stat"]),
        ('id="stat-reviews">29', f'id="stat-reviews">{cfg["reviews_stat"]}'),
        ('id="stat-reviews">29', f'id="stat-reviews">{cfg["reviews_stat"]}'),
        ('id="stat-rating">5', f'id="stat-rating">{cfg["rating_stat"]}'),
        (
            f"Сообщение уйдёт на +7 (983) 504-51-16 — номер River home (как в 2ГИС).",
            f"Сообщение уйдёт на {tel_display} — номер {cfg['brand_title']} (как в 2ГИС).",
        ),
        ('alt="Гостевой дом River home в д. Терентьево"', f'alt="{cfg["brand_title"]}, {cfg["address_short"]}"'),
        (
            'alt="Карта 2ГИС — д. Терентьево, Солнечная ул., 14"',
            f'alt="{map_alt}"',
        ),
        ("title>River home", f"title>{cfg['brand_title']}"),
        ("— River home", f"— {cfg['brand_title']}"),
        ("у реки", "на участке"),
        ("на берегу реки", "на территории"),
    ]
    return pairs


def write_readme(path: Path, cfg: dict) -> None:
    path.write_text(
        f"# {cfg['brand_title']}\n\n"
        f"Копия шаблона `river-home-terentievo/`. Данные: [2ГИС]({cfg['gis_url']}) — {cfg['address_short']}.\n\n"
        f"Локально: `python server.py` → http://127.0.0.1:{cfg['port']}/\n\n"
        f"Прод (после выкладки): https://melissa-tech.ru/{cfg['slug']}/\n\n"
        f"Фото — временно из шаблона River home; заменить в `photoHouse/`.\n",
        encoding="utf-8",
    )


def main() -> None:
    if not SRC.is_dir():
        raise SystemExit(f"Missing template: {SRC}")

    for cfg in SITES:
        dest = ROOT / cfg["slug"]
        if dest.exists():
            shutil.rmtree(dest)
        shutil.copytree(SRC, dest, dirs_exist_ok=True)
        apply_replacements(dest, build_pairs(cfg))
        write_contacts(dest / "contacts-config.js", cfg)
        reviews = fetch_branch_reviews(cfg["firm_id"], limit=7)
        write_reviews_data(dest / "reviews-data.js", cfg, reviews)
        patch_server_py(dest / "server.py", cfg["port"], cfg["gis_url"], cfg["firm_id"])
        pkg = dest / "package.json"
        if pkg.is_file():
            data = json.loads(pkg.read_text(encoding="utf-8"))
            data["name"] = cfg["slug"]
            pkg.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        write_readme(dest / "README.md", cfg)
        print(f"OK {cfg['slug']} -> http://127.0.0.1:{cfg['port']}/")


if __name__ == "__main__":
    main()