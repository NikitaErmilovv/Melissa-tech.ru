#!/usr/bin/env python3
"""Lobavto: auto-glass services, photos, and messenger link fix."""

from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "lobavto-nizhniy-novgorod"

SERVICES = [
    {
        "file": "wash.html",
        "slug": "wash",
        "title": "Ремонт сколов",
        "tag": "РЕМОНТ СКОЛОВ",
        "lead": "Локальный ремонт сколов и трещин на лобовом и боковых стёклах.",
        "body": (
            "Восстанавливаем прозрачность и прочность стекла без полной замены, "
            "когда повреждение допускает ремонт. Осматриваем дефект, подбираем метод "
            "и согласуем стоимость до начала работ."
        ),
        "image": "chip-repair.jpg",
    },
    {
        "file": "anticor.html",
        "slug": "anticor",
        "title": "Замена лобового",
        "tag": "ЗАМЕНА ЛОБОВОГО",
        "lead": "Снятие повреждённого стекла и установка нового лобового.",
        "body": (
            "Подбираем стекло под марку и модель, аккуратно демонтируем старое, "
            "устанавливаем новое с правильной посадкой и герметизацией. "
            "Работаем в боксе, соблюдаем технологию клея и сроков полимеризации."
        ),
        "image": "windshield-replace.jpg",
    },
    {
        "file": "polish.html",
        "slug": "polish",
        "title": "Полировка стёкол",
        "tag": "ПОЛИРОВКА СТЁКОЛ",
        "lead": "Полировка лобового и других стёкол от налёта, царапин и помутнений.",
        "body": (
            "Возвращаем прозрачность и чистый обзор: оцениваем состояние стекла, "
            "подбираем абразив и полировальную пасту, работаем бережно без лишней нагрузки на ЛКП."
        ),
        "image": "glass-polish.jpg",
    },
    {
        "file": "ppf.html",
        "slug": "ppf",
        "title": "Восстановление герметичности",
        "tag": "ГЕРМЕТИЧНОСТЬ",
        "lead": "Переклейка лобового при протечках — устраняем попадание воды в салон.",
        "body": (
            "Если стекло «течёт» по краю, разбираем обшивку, снимаем старое стекло или "
            "перегерметизируем посадочное место, наносим новый герметик и выдерживаем срок сушки. "
            "Проверяем герметичность перед выдачей автомобиля."
        ),
        "image": "seal-restore.jpg",
    },
    {
        "file": "tint.html",
        "slug": "tint",
        "title": "Установка бронированных стёкол",
        "tag": "БРОНИРОВАННЫЕ СТЁКЛА",
        "lead": "Монтаж ударостойких и бронированных стёкол под задачу и модель авто.",
        "body": (
            "Консультируем по вариантам защиты, подбираем комплект, устанавливаем с соблюдением "
            "технологии крепления и герметизации. Стоимость и сроки — после осмотра и уточнения комплектации."
        ),
        "image": "armored-glass.jpg",
    },
]

SERVICE_LIST_HTML = "\n".join(
    f'    <a class="service-row" href="services/{s["file"]}" id="svc-{i:02d}">'
    f'<div class="idx">{i:02d}</div><div><h3>{s["title"]}</h3>'
    f'<div class="service-desc"><p class="service-lead">{s["lead"]}</p></div></div>'
    f'<div class="cost">после осмотра</div></a>'
    for i, s in enumerate(SERVICES, 1)
)

HOME_STRIP_HTML = "\n".join(
    f'    <a class="photo" href="services/{s["file"]}" '
    f'style="background-image:url(\'img/works/services/{s["image"]}\')">'
    f'<span class="tag">{s["tag"]}</span></a>'
    for s in SERVICES
)

WORKS_STRIP_IMAGES = [
    "chip-repair.jpg",
    "windshield-replace.jpg",
    "glass-polish.jpg",
    "seal-restore.jpg",
    "armored-glass.jpg",
    "gallery-01.jpg",
    "gallery-02.jpg",
]


def fix_messengers(text: str) -> str:
    text = text.replace("https://wa.me/7950091АВТО82", "https://wa.me/79960661251")
    text = text.replace("https://t.me/+7950091АВТО82", "https://t.me/+79960661251")
    return text


def patch_service_page(path: Path, svc: dict) -> None:
    text = fix_messengers(path.read_text(encoding="utf-8"))
    text = re.sub(r"<title>[^<]+</title>", f"<title>{svc['title']} — Лобавто</title>", text, count=1)
    hero_block = (
        f'<section class="subpage-hero subpage-hero--service subpage-hero--service-photo" '
        f'style="--service-photo:url(\'../img/works/services/{svc["image"]}\')">\n'
        f'  <div class="kicker">УСЛУГА</div>\n'
        f"  <h1>{svc['title'].upper()}</h1>\n"
        f"  <p>{svc['lead']}</p>\n"
        f"</section>"
    )
    text = re.sub(
        r'<section class="subpage-hero subpage-hero--service[^"]*">.*?</section>',
        hero_block,
        text,
        count=1,
        flags=re.DOTALL,
    )
    intro = f'{svc["body"]} Стоимость: <strong>после осмотра</strong>.'
    text = re.sub(
        r'(<p class="intro" style="max-width:720px">).*?(</p>)',
        rf"\1{intro}\2",
        text,
        count=1,
        flags=re.DOTALL,
    )
    path.write_text(text, encoding="utf-8")


def main() -> None:
    index = ROOT / "index.html"
    idx = fix_messengers(index.read_text(encoding="utf-8"))
    idx = re.sub(
        r"<p>Детейлинг в Нижнем Новгороде:[^<]+</p>",
        "<p>Ремонт и замена автостёкол в Нижнем Новгороде: сколы, лобовое, герметичность и бронированные стёкла по записи.</p>",
        idx,
        count=1,
    )
    idx = re.sub(
        r"<h2>ДЕТЕЙЛИНГ<br><span class=\"accent\">И ЗАЩИТА КУЗОВА</span></h2>",
        '<h2>АВТОСТЁКЛА<br><span class="accent">И СЕРВИС</span></h2>',
        idx,
        count=1,
    )
    idx = re.sub(
        r'<div class="photo-strip photo-strip--services photo-strip--home">.*?</div>',
        f'<div class="photo-strip photo-strip--services photo-strip--home">\n{HOME_STRIP_HTML}\n  </div>',
        idx,
        count=1,
        flags=re.DOTALL,
    )
    works_links = "\n".join(
        f'    <a class="photo" href="gallery.html" '
        f'style="background-image:url(\'img/works/services/{name}\')"></a>'
        for name in WORKS_STRIP_IMAGES[:5]
    )
    idx = re.sub(
        r'(<section class="section" id="works">.*?<div class="photo-strip photo-strip--services">).*?(</div>\s*</section>)',
        lambda m: m.group(1) + "\n" + works_links + "\n  " + m.group(2),
        idx,
        count=1,
        flags=re.DOTALL,
    )
    index.write_text(idx, encoding="utf-8")

    services = ROOT / "services.html"
    svc_html = fix_messengers(services.read_text(encoding="utf-8"))
    svc_html = re.sub(
        r"<h1>ДЕТЕЙЛИНГ<br><span class=\"accent\">НИЖНИЙ НОВГОРОД</span></h1>",
        '<h1>УСЛУГИ<br><span class="accent">ПО СТЁКЛАМ</span></h1>',
        svc_html,
        count=1,
    )
    svc_html = re.sub(
        r'<div class="service-list">.*?</div>\s*</section>',
        f'<div class="service-list">\n{SERVICE_LIST_HTML}\n  </div>\n</section>',
        svc_html,
        count=1,
        flags=re.DOTALL,
    )
    services.write_text(svc_html, encoding="utf-8")

    about = ROOT / "about.html"
    ab = fix_messengers(about.read_text(encoding="utf-8"))
    ab = re.sub(
        r'<p class="subpage-hero-lead">[^<]*(?:<[^>]+>[^<]*)*</p>',
        '<p class="subpage-hero-lead">«Лобавто» — сервис по автостёклам в Нижнем Новгороде на Восточном проезде. Ремонт сколов, замена и переклейка лобового, полировка стёкол, восстановление герметичности и установка бронированных стёкол. Запись по телефону — согласуем время и объём работ.</p>',
        ab,
        count=1,
    )
    about.write_text(ab, encoding="utf-8")

    for svc in SERVICES:
        patch_service_page(ROOT / "services" / svc["file"], svc)

    for path in ROOT.rglob("*.html"):
        text = fix_messengers(path.read_text(encoding="utf-8"))
        if text != path.read_text(encoding="utf-8"):
            path.write_text(text, encoding="utf-8")

    print("patched lobavto glass services")


if __name__ == "__main__":
    main()
