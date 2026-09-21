#!/usr/bin/env python3
"""Training page + red accent for the Novokuznetsk clone."""

from __future__ import annotations

import json
import re
from pathlib import Path

RED_ACCENT_CSS = """
/* red-accent */
:root{
  --accent:#e10600;
  --accent-soft:rgba(225,6,0,.38);
  --accent-hover:#ff1f16;
  --accent-ink:#fff;
}
.process h2 .accent{color:#e10600}
@media (max-width:1024px){.process h2 .accent{color:#e10600}}
@media (max-width:768px){.process h2 .accent{color:#e10600}}
.review .stars{color:var(--accent)}
.faq details[open] summary{color:var(--accent)}
.process .faq details[open] summary{color:#e10600}

/* нейтральные подписи: крупные цифры белым, мелкие номера и лейблы серым */
.stat b{color:#f5f5f2}
.kicker,
.subpage-hero .kicker,
.award-panel-copy .kicker,
.founder-copy .kicker,
.address-map-kicker .kicker{color:#8d8d87}
.num,
.service-row .idx,
.ba-item figcaption,
.address-map-detail-label,
.footer-col b,
.footer-phones-block b,
.footer-hours-block b{color:#8d8d87;opacity:1}
.photo .tag{color:#f5f5f2}
.process .kicker,
.step b{color:#6f6f6a}
@media (max-width:1024px){.process .kicker,.step b{color:#6f6f6a}}
@media (max-width:768px){.process .kicker,.step b{color:#6f6f6a}}
.hero .eyebrow{visibility:hidden}
.heroimg{opacity:.80}
@media (max-width:768px){
  .heroimg{opacity:.53}
}
"""

TRAINING_CSS = """
/* training-page */
.cert-box{display:grid;grid-template-columns:1.05fr .95fr;gap:1px;background:#292929;margin-top:50px}
.cert-box>*{background:#111;padding:35px}
.cert-tabs{display:flex;gap:26px;border-bottom:1px solid rgba(255,255,255,.09);margin-bottom:32px}
.cert-tab{background:none;border:0;border-bottom:2px solid transparent;color:#7d7d77;font:inherit;font-size:13px;letter-spacing:1px;padding:0 0 14px;cursor:pointer;transition:color .2s,border-color .2s}
.cert-tab:hover{color:#d7d7d2}
.cert-tab.is-active{color:#f5f5f2;border-bottom-color:var(--accent)}
.cert-field label{display:block;font-size:11px;letter-spacing:2px;color:#8d8d87;margin-bottom:12px}
.cert-field input{width:100%;background:#0a0a0a;border:1px solid rgba(255,255,255,.13);color:#f5f5f2;font:inherit;font-size:15px;padding:16px 18px;transition:border-color .2s}
.cert-field input:focus{outline:0;border-color:var(--accent)}
.cert-field .button{margin-top:18px}
.cert-note{color:#777;font-size:13px;line-height:1.7;margin:0 0 18px;max-width:420px}
.cert-hint{color:#5f5f5a;font-size:12px;margin-top:16px}
.cert-msg{margin-top:18px;font-size:13px;color:#e06a5f;min-height:18px}

.cert-card{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.1);background:#0d0d0d;padding:30px;height:100%;display:flex;flex-direction:column;justify-content:space-between;gap:24px}
.cert-card:before{content:"";position:absolute;inset:0;background:
  radial-gradient(circle at 88% 8%,rgba(225,6,0,.5),transparent 42%),
  linear-gradient(135deg,rgba(225,6,0,.18),transparent 55%)}
.cert-card:after{content:"";position:absolute;right:-70px;bottom:-110px;width:280px;height:280px;border:1px solid rgba(225,6,0,.3);transform:rotate(35deg)}
.cert-card>*{position:relative;z-index:1}
.cert-card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px}
.cert-card-brand{font-size:16px;font-weight:900;letter-spacing:-.4px;line-height:1.2}
.cert-card-brand span{color:var(--accent)}
.cert-card-brand small{display:block;font-size:8px;letter-spacing:3px;color:#8d8d87;font-weight:600;margin-top:4px}
.cert-card-seal{width:56px;height:56px;border:1px solid var(--accent-soft);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;letter-spacing:1px;color:var(--accent);text-align:center;line-height:1.3}
.cert-card h3{margin:0;font-size:clamp(23px,3vw,32px);letter-spacing:-.04em;line-height:1.05}
.cert-card-name{font-size:19px;border-bottom:1px solid rgba(255,255,255,.15);padding-bottom:12px}
.cert-card-rows{display:grid;gap:7px;font-size:12px;color:#8d8d87}
.cert-card-rows b{color:#e4e4df;font-weight:600}
.cert-card-foot{display:flex;justify-content:space-between;align-items:flex-end;gap:18px}
.cert-card-sign{font-size:10px;letter-spacing:1px;color:#777;border-top:1px solid rgba(255,255,255,.15);padding-top:8px;min-width:150px}
.cert-qr{width:58px;height:58px;flex:0 0 58px;background-color:#e4e4df;background-image:
  repeating-linear-gradient(90deg,#0a0a0a 0 4px,transparent 4px 8px),
  repeating-linear-gradient(0deg,#0a0a0a 0 4px,transparent 4px 8px)}

.cert-result{display:none;background:#111;border-top:1px solid #292929;padding:35px}
.cert-result.is-visible{display:block}
.cert-status{display:flex;align-items:center;gap:14px;font-size:13px;letter-spacing:1px;color:#8fbf8a}
.cert-status i{width:26px;height:26px;border:1px solid rgba(143,191,138,.45);border-radius:50%;display:flex;align-items:center;justify-content:center;font-style:normal;font-size:13px}
.cert-data{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:#292929;margin-top:28px}
.cert-data div{background:#0e0e0e;padding:22px}
.cert-data span{display:block;font-size:10px;letter-spacing:2px;color:#8d8d87;margin-bottom:10px}
.cert-data b{font-size:15px;font-weight:600;color:#f5f5f2;line-height:1.4}
.cert-valid{margin-top:1px;background:#0e130e;border:1px solid rgba(143,191,138,.25);color:#8fbf8a;padding:16px 22px;font-size:12px;letter-spacing:1px}

/* admin demo panel */
.crm{display:grid;grid-template-columns:232px 1fr;gap:1px;background:#242424;border:1px solid rgba(255,255,255,.09);margin-top:50px;overflow:hidden}
.crm-side{background:#0d0d0d;padding:26px 0;display:flex;flex-direction:column;gap:26px}
.crm-logo{padding:0 22px;font-size:17px;font-weight:900;letter-spacing:-.5px;line-height:1.1}
.crm-logo span{color:var(--accent)}
.crm-logo small{display:block;font-size:8px;letter-spacing:3px;color:#7d7d77;margin-top:5px}
.crm-nav{position:static;display:flex;flex-direction:column;flex:1;width:auto;height:auto;padding:0;border:0;z-index:auto}
.crm-nav-item{display:flex;align-items:center;gap:12px;background:none;border:0;border-left:3px solid transparent;color:#9a9a94;font:inherit;font-size:13px;text-align:left;padding:13px 22px;cursor:pointer;transition:color .2s,background .2s}
.crm-nav-item:hover{color:#f5f5f2;background:rgba(255,255,255,.03)}
.crm-nav-item.is-active{color:#fff;background:var(--accent);border-left-color:#ff5f57}
.crm-nav-item svg{width:16px;height:16px;flex:0 0 16px;stroke:currentColor;fill:none;stroke-width:1.6}
.crm-user{display:flex;align-items:center;gap:12px;padding:18px 22px 0;border-top:1px solid rgba(255,255,255,.08);margin-top:auto}
.crm-user-av{width:36px;height:36px;flex:0 0 36px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700}
.crm-user b{display:block;font-size:13px}
.crm-user span{font-size:11px;color:#7d7d77}

.crm-main{background:#111;padding:26px 28px 32px;min-width:0}
.crm-top{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;flex-wrap:wrap;margin-bottom:26px}
.crm-top h3{margin:0 0 6px;font-size:24px;letter-spacing:-.03em}
.crm-top p{margin:0;font-size:13px;color:#7d7d77}
.crm-top-meta{display:flex;align-items:center;gap:14px;font-size:12px;color:#7d7d77}
.crm-bell{width:32px;height:32px;border:1px solid rgba(255,255,255,.12);border-radius:50%;display:flex;align-items:center;justify-content:center;position:relative}
.crm-bell:after{content:"";position:absolute;top:7px;right:8px;width:6px;height:6px;border-radius:50%;background:var(--accent)}

.crm-cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.crm-card{background:#161616;border:1px solid rgba(255,255,255,.08);padding:20px}
.crm-card-top{display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:12px;color:#8d8d87}
.crm-card-ico{width:28px;height:28px;border:1px solid rgba(225,6,0,.35);display:flex;align-items:center;justify-content:center;color:var(--accent);font-size:12px}
.crm-card b{display:block;font-size:30px;letter-spacing:-.04em;margin:14px 0 8px}
.crm-card small{font-size:11px;color:#6f8f6c}
.crm-card small.is-flat{color:#7d7d77}

.crm-charts{display:grid;grid-template-columns:1.45fr 1fr;gap:14px;margin-top:14px}
.crm-box{background:#161616;border:1px solid rgba(255,255,255,.08);padding:20px}
.crm-box h4{margin:0 0 18px;font-size:15px;font-weight:600;letter-spacing:-.01em}
.crm-chart{width:100%;height:auto;display:block}
.crm-axis{display:flex;justify-content:space-between;font-size:10px;color:#6b6b66;margin-top:8px}
.crm-donut-wrap{display:flex;align-items:center;gap:22px;flex-wrap:wrap}
.crm-donut{width:150px;height:150px;flex:0 0 150px;position:relative}
.crm-donut-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px}
.crm-donut-center b{font-size:22px;letter-spacing:-.03em}
.crm-donut-center span{font-size:10px;color:#7d7d77}
.crm-legend{display:grid;gap:10px;font-size:12px;flex:1;min-width:150px}
.crm-legend div{display:flex;align-items:center;gap:10px;color:#9a9a94}
.crm-legend i{width:8px;height:8px;flex:0 0 8px;border-radius:50%}
.crm-legend b{margin-left:auto;color:#e4e4df;font-weight:600}

.crm-table-wrap{margin-top:14px;overflow-x:auto}
.crm-table{width:100%;border-collapse:collapse;font-size:12.5px;min-width:660px}
.crm-table th{text-align:left;font-size:10px;letter-spacing:1.5px;color:#7d7d77;font-weight:600;padding:0 14px 14px;border-bottom:1px solid rgba(255,255,255,.08)}
.crm-table td{padding:14px;border-bottom:1px solid rgba(255,255,255,.06);color:#c2c2bc;vertical-align:middle}
.crm-table tr:last-child td{border-bottom:0}
.crm-table tr:hover td{background:rgba(255,255,255,.02)}
.crm-pill{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(143,191,138,.3);color:#8fbf8a;font-size:10.5px;letter-spacing:.5px;padding:5px 10px}
.crm-pill.is-wait{border-color:rgba(225,6,0,.4);color:#ef8078}
.crm-link{background:none;border:1px solid rgba(255,255,255,.14);color:#d7d7d2;font:inherit;font-size:11px;padding:7px 14px;cursor:pointer;transition:border-color .2s,color .2s,background .2s}
.crm-link:hover{border-color:var(--accent);color:#fff;background:rgba(225,6,0,.16)}

.crm-back{background:none;border:0;color:#9a9a94;font:inherit;font-size:13px;padding:0;margin-bottom:18px;cursor:pointer}
.crm-back:hover{color:#f5f5f2}
.crm-student-head{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap;margin-bottom:20px}
.crm-student-head h3{margin:0;font-size:22px;letter-spacing:-.03em}
.crm-btn{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.14);color:#e4e4df;font:inherit;font-size:12px;padding:10px 18px;cursor:pointer;transition:border-color .2s,color .2s}
.crm-btn:hover{border-color:var(--accent);color:#fff}
.crm-btn.is-accent{background:var(--accent);border-color:var(--accent);color:#fff}
.crm-btn.is-accent:hover{background:var(--accent-hover)}
.crm-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.crm-profile-top{display:flex;align-items:center;gap:16px;margin-bottom:20px}
.crm-avatar{width:64px;height:64px;flex:0 0 64px;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:#0d0d0d;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:700;color:var(--accent)}
.crm-profile-top h4{margin:0 0 9px;font-size:17px}
.crm-badges{display:flex;flex-wrap:wrap;gap:8px}
.crm-badge{display:inline-flex;align-items:center;gap:6px;font-size:10.5px;letter-spacing:.5px;padding:5px 10px;border:1px solid rgba(255,255,255,.14);color:#a9a9a3}
.crm-badge.is-ok{border-color:rgba(143,191,138,.3);color:#8fbf8a}
.crm-badge.is-accent{border-color:rgba(225,6,0,.4);color:#ef8078}
.crm-fields{display:grid;gap:1px;background:#242424}
.crm-fields div{background:#131313;display:flex;justify-content:space-between;gap:16px;padding:13px 16px;font-size:12.5px}
.crm-fields span{color:#7d7d77}
.crm-fields b{color:#e4e4df;font-weight:600;text-align:right}
.crm-steps{list-style:none;margin:0;padding:0}
.crm-steps li{display:flex;justify-content:space-between;gap:16px;align-items:center;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.07);font-size:12.5px;color:#c2c2bc}
.crm-steps li:last-child{border-bottom:0}
.crm-steps i{font-style:normal;width:20px;height:20px;flex:0 0 20px;border-radius:50%;border:1px solid rgba(143,191,138,.35);color:#8fbf8a;display:inline-flex;align-items:center;justify-content:center;font-size:10px;margin-right:10px}
.crm-steps time{color:#7d7d77;white-space:nowrap}
.crm-notes p{margin:0 0 14px;font-size:13px;line-height:1.75;color:#9a9a94}
.crm-notes footer{border-top:1px solid rgba(255,255,255,.07);padding-top:14px;text-align:right;font-size:11px;color:#7d7d77}
.crm-notes footer b{display:block;color:#e4e4df;font-size:12.5px;margin-bottom:3px}
.crm-cert-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:16px}

@media (max-width:1180px){
  .crm{grid-template-columns:1fr}
  .crm-side{flex-direction:row;align-items:center;flex-wrap:wrap;gap:14px;padding:18px 20px}
  .crm-nav{flex-direction:row;flex-wrap:wrap;flex:1 1 100%}
  .crm-nav-item{border-left:0;border-bottom:2px solid transparent;padding:10px 14px}
  .crm-nav-item.is-active{border-left:0;border-bottom-color:#ff5f57}
  .crm-user{margin:0;padding:14px 0 0;border-top:1px solid rgba(255,255,255,.08);flex:1 1 100%}
  .crm-cards{grid-template-columns:repeat(2,minmax(0,1fr))}
  .crm-charts{grid-template-columns:1fr}
}
@media (max-width:1024px){
  .cert-data{grid-template-columns:repeat(2,1fr)}
}
@media (max-width:860px){
  .cert-box{grid-template-columns:1fr}
  .cert-box>*{padding:28px 22px}
  .cert-result{padding:28px 22px}
  .cert-data{grid-template-columns:1fr}
  .crm-main{padding:22px 18px 26px}
  .crm-cards{grid-template-columns:1fr}
  .crm-grid{grid-template-columns:1fr}
}
"""


COURSES = [
    ("Ремонт сколов и трещин", "Диагностика повреждения, инжектор, полимер и УФ-сушка.", "3 дня"),
    ("Полировка и шлифовка стёкол", "Мутность, налёт и царапины: абразивы, войлок, контроль стекла.", "3 дня"),
    ("Полировка фар и антидождь", "Восстановление оптики, защитные составы и гидрофоб на стёкла.", "2 дня"),
    ("Полировка кузова", "Замер ЛКП, подбор паст и кругов, работа машинкой, контроль света.", "4 дня"),
    ("Керамика и защитные составы", "Подготовка кузова, нанесение покрытия, сушка и уход.", "2 дня"),
]

STEPS = [
    ("Заявка", "Обсуждаем опыт и подбираем программу под задачу."),
    ("Теория", "Материалы, инструмент, техника безопасности и типы повреждений."),
    ("Практика", "Работаете руками на реальных автомобилях под присмотром мастера."),
    ("Аттестация", "Зачётная работа, сертификат и запись в базе проверки."),
]

FAQ = [
    (
        "Нужен ли опыт для обучения?",
        "Нет. Базовые курсы рассчитаны на новичков: начинаем с материалов и инструмента, "
        "затем переходим к практике на автомобилях.",
    ),
    (
        "Сколько человек в группе?",
        "До трёх человек, чтобы у каждого была практика на своём участке и обратная связь мастера.",
    ),
    (
        "Что выдаём после обучения?",
        "Сертификат с индивидуальным номером. Подлинность проверяется на этой странице "
        "по номеру или QR-коду с бланка.",
    ),
    (
        "Помогаете после курса?",
        "Да, остаётесь на связи с преподавателем: разбираем сложные случаи и подбор материалов.",
    ),
]

# Демо-база учеников: попадает и в таблицу панели, и в проверку сертификата
STUDENTS = [
    {
        "cert": "AB-2026-001",
        "name": "Иванов Алексей Сергеевич",
        "course": "Полировка кузова",
        "dates": "15.05.2026 — 18.05.2026",
        "issued": "18.05.2026",
        "status": "ok",
        "phone": "+7 900 123-45-67",
        "email": "ivanov@mail.ru",
        "group": "Группа №3",
        "teacher": "Сергей Ковалёв",
        "notes": [
            "Отлично проявил себя на практике: ровно выводит риски, аккуратно работает "
            "на кромках и рёбрах кузова.",
            "Рекомендуется для дальнейшего повышения квалификации.",
        ],
    },
    {
        "cert": "AB-2026-002",
        "name": "Петров Дмитрий Андреевич",
        "course": "Ремонт сколов и трещин",
        "dates": "12.05.2026 — 14.05.2026",
        "issued": "14.05.2026",
        "status": "ok",
        "phone": "+7 903 221-08-14",
        "email": "petrov.d@mail.ru",
        "group": "Группа №2",
        "teacher": "Сергей Ковалёв",
        "notes": [
            "Уверенно работает с инжектором и полимером — сколы выведены без остаточного контура.",
            "Стоит добавить практику по длинным трещинам.",
        ],
    },
    {
        "cert": "AB-2026-003",
        "name": "Смирнова Екатерина Викторовна",
        "course": "Полировка и шлифовка стёкол",
        "dates": "10.05.2026 — 12.05.2026",
        "issued": "12.05.2026",
        "status": "ok",
        "phone": "+7 913 640-77-02",
        "email": "smirnova@mail.ru",
        "group": "Группа №2",
        "teacher": "Артём Гуськов",
        "notes": [
            "Контролирует нагрев стекла и не допускает линз при шлифовке.",
            "Готова работать с клиентскими автомобилями самостоятельно.",
        ],
    },
    {
        "cert": "AB-2026-004",
        "name": "Кузнецов Максим Олегович",
        "course": "Керамика и защитные составы",
        "dates": "08.05.2026 — 09.05.2026",
        "issued": "09.05.2026",
        "status": "ok",
        "phone": "+7 923 118-93-40",
        "email": "kuznetsov@mail.ru",
        "group": "Группа №1",
        "teacher": "Сергей Ковалёв",
        "notes": [
            "Аккуратно готовит кузов перед нанесением, соблюдает время полимеризации.",
            "Рекомендован к курсу по полировке кузова.",
        ],
    },
    {
        "cert": "AB-2026-005",
        "name": "Васильев Артём Сергеевич",
        "course": "Полировка фар и антидождь",
        "dates": "05.05.2026 — 06.05.2026",
        "issued": "06.05.2026",
        "status": "ok",
        "phone": "+7 905 772-16-58",
        "email": "vasilev@mail.ru",
        "group": "Группа №1",
        "teacher": "Артём Гуськов",
        "notes": [
            "Выводит фары до полной прозрачности, ровно наносит защитный лак.",
            "Хорошо объясняет клиенту порядок ухода.",
        ],
    },
    {
        "cert": "AB-2026-006",
        "name": "Никитина Ольга Павловна",
        "course": "Ремонт сколов и трещин",
        "dates": "с 22.09.2026",
        "issued": "—",
        "status": "wait",
        "phone": "+7 908 415-30-771",
        "email": "nikitina@mail.ru",
        "group": "Группа №4",
        "teacher": "Сергей Ковалёв",
        "notes": ["Записана на курс, ожидает начала обучения."],
    },
]

POPULAR = [
    ("Полировка кузова", 33, "#e10600"),
    ("Химчистка салона", 24, "#b00500"),
    ("Базовый курс", 21, "#800400"),
    ("Нанесение покрытий", 15, "#4f0200"),
    ("Другие", 7, "#2f2f2f"),
]

DYNAMIC = [12, 15, 14, 19, 23, 21, 27, 31, 36]
MONTHS = ["Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен"]

NAV_ICONS = {
    "Главная": '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>',
    "Обучающиеся": '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><path d="M16 11h5"/><path d="M16 15h5"/>',
    "Сертификаты": '<rect x="3.5" y="4.5" width="17" height="12" rx="1.5"/><path d="M8 20l4-2.5 4 2.5"/>',
    "Курсы": '<path d="M4 6.5h16v12H4z"/><path d="M4 10h16"/><path d="M9 6.5v12"/>',
    "Пользователи": '<circle cx="8.5" cy="9" r="3"/><circle cx="16" cy="10" r="2.4"/><path d="M3 19c0-2.8 2.5-5 5.5-5s5.5 2.2 5.5 5"/><path d="M15 19c0-2 1.3-3.6 3-4"/>',
    "Статистика": '<path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M21 20H3"/>',
    "Настройки": '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1"/>',
}


def _initials(name: str) -> str:
    parts = [p for p in name.split(" ") if p]
    return "".join(p[0].upper() for p in parts[:2])


def _nav_html(site: dict, phone_tel: str, phone: str) -> str:
    links = (
        '<a href="index.html#services">УСЛУГИ</a>'
        '<a href="index.html#catalog">ЦЕНЫ</a>'
        '<a href="index.html#story">О СТУДИИ</a>'
        '<a href="index.html#contacts">КОНТАКТЫ</a>'
        '<a href="training.html">ОБУЧЕНИЕ</a>'
    )
    return f"""<nav class="site-nav">
  <div class="logo"><a href="index.html">{site['brand_html']}</a></div>
  <div class="links">{links}</div>
  <div class="nav-actions">
    <a class="phone" href="tel:{phone_tel}">{phone}</a>
    <button class="nav-burger" type="button" aria-label="Открыть меню" aria-expanded="false">
      <span class="nav-burger-line"></span>
      <span class="nav-burger-line"></span>
      <span class="nav-burger-line"></span>
    </button>
  </div>
  <div class="nav-mobile-menu">{links}</div>
</nav>"""


def _site_bottom(dst: Path) -> str:
    """Reuse the real footer + map block from an already built subpage."""
    html = (dst / "contact.html").read_text(encoding="utf-8")
    m = re.search(r'<div class="site-bottom">[\s\S]*?</div>\s*(?=<script)', html)
    if not m:
        return ""
    chunk = m.group(0)
    for old, new in (
        ("services.html", "index.html#catalog"),
        ("gallery.html", "index.html#works"),
        ("about.html", "index.html#story"),
        ("contact.html", "index.html#contacts"),
    ):
        chunk = chunk.replace(f'href="{old}"', f'href="{new}"')
    return chunk.replace(
        '<a href="index.html#contacts">Контакты</a>',
        '<a href="index.html#contacts">Контакты</a>\n      <a href="training.html">Обучение</a>',
    )


def _cert_card(brand_html: str, brand: str, city: str, sign: str) -> str:
    return f"""<div class="cert-card">
      <div class="cert-card-top">
        <div class="cert-card-brand">{brand_html}<small>ДЕТЕЙЛИНГ</small></div>
        <div class="cert-card-seal">ПРЕМИЯ<br>2ГИС</div>
      </div>
      <h3>СЕРТИФИКАТ</h3>
      <div class="cert-card-name" data-cert-name>{STUDENTS[0]['name']}</div>
      <div class="cert-card-rows">
        <div>Курс · <b data-cert-course>{STUDENTS[0]['course']}</b></div>
        <div>Номер · <b data-cert-code>{STUDENTS[0]['cert']}</b></div>
        <div>Выдал · <b>{brand}, {city}</b></div>
      </div>
      <div class="cert-card-foot">
        <div class="cert-card-sign">{sign}</div>
        <div class="cert-qr" aria-hidden="true"></div>
      </div>
    </div>"""


def _courses_rows() -> str:
    rows = []
    for idx, (title, desc, dur) in enumerate(COURSES, start=1):
        rows.append(
            f'    <div class="service-row"><div class="idx">{idx:02d}</div>'
            f"<div><h3>{title}</h3><p>{desc}</p></div>"
            f'<div class="cost">{dur}</div></div>'
        )
    return "\n".join(rows)


def _steps_html() -> str:
    return "\n".join(
        f'      <div class="step"><b>{idx:02d}</b><h3>{title}</h3><p>{desc}</p></div>'
        for idx, (title, desc) in enumerate(STEPS, start=1)
    )


def _faq_html() -> str:
    items = []
    for i, (question, answer) in enumerate(FAQ):
        open_attr = " open" if i == 0 else ""
        items.append(
            f"    <details{open_attr}><summary>{question}</summary><p>{answer}</p></details>"
        )
    return "\n".join(items)


def _crm_nav() -> str:
    items = []
    views = {
        "Главная": "dashboard",
        "Обучающиеся": "dashboard",
        "Статистика": "dashboard",
        "Сертификаты": "student",
    }
    for i, (label, path) in enumerate(NAV_ICONS.items()):
        view = views.get(label, "")
        cls = "crm-nav-item is-active" if i == 0 else "crm-nav-item"
        attr = f' data-crm-view="{view}"' if view else ""
        items.append(
            f'        <button type="button" class="{cls}"{attr}>'
            f'<svg viewBox="0 0 24 24" aria-hidden="true">{path}</svg>{label}</button>'
        )
    return "\n".join(items)


def _line_chart() -> str:
    width, height = 520, 190
    max_v = max(DYNAMIC) * 1.15
    step = width / (len(DYNAMIC) - 1)
    pts = [
        (round(i * step, 1), round(height - (v / max_v) * height, 1))
        for i, v in enumerate(DYNAMIC)
    ]
    line = " ".join(f"{x},{y}" for x, y in pts)
    area = f"M0,{height} " + " ".join(f"L{x},{y}" for x, y in pts) + f" L{width},{height} Z"
    grid = "".join(
        f'<line x1="0" y1="{round(height / 4 * i, 1)}" x2="{width}" '
        f'y2="{round(height / 4 * i, 1)}" stroke="rgba(255,255,255,.06)"/>'
        for i in range(5)
    )
    dots = "".join(
        f'<circle cx="{x}" cy="{y}" r="3" fill="#e10600" stroke="#161616" stroke-width="2"/>'
        for x, y in pts
    )
    axis = "".join(f"<span>{m}</span>" for m in MONTHS)
    return f"""      <svg class="crm-chart" viewBox="0 0 {width} {height}" preserveAspectRatio="none" role="img" aria-label="Динамика обучающихся">
        <defs>
          <linearGradient id="crmFade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="rgba(225,6,0,.45)"/>
            <stop offset="100%" stop-color="rgba(225,6,0,0)"/>
          </linearGradient>
        </defs>
        {grid}
        <path d="{area}" fill="url(#crmFade)"/>
        <polyline points="{line}" fill="none" stroke="#e10600" stroke-width="2.5" stroke-linejoin="round"/>
        {dots}
      </svg>
      <div class="crm-axis">{axis}</div>"""


def _donut() -> str:
    circumference = 2 * 3.14159 * 42
    offset = 0.0
    segments = []
    legend = []
    for label, percent, color in POPULAR:
        length = circumference * percent / 100
        segments.append(
            f'<circle cx="60" cy="60" r="42" fill="none" stroke="{color}" stroke-width="15" '
            f'stroke-dasharray="{length:.1f} {circumference - length:.1f}" '
            f'stroke-dashoffset="{-offset:.1f}" transform="rotate(-90 60 60)"/>'
        )
        legend.append(
            f'        <div><i style="background:{color}"></i>{label}<b>{percent}%</b></div>'
        )
        offset += length
    total = sum(s["status"] == "ok" for s in STUDENTS)
    return f"""    <div class="crm-donut-wrap">
      <div class="crm-donut">
        <svg viewBox="0 0 120 120" role="img" aria-label="Курсы по популярности">
          <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="15"/>
          {''.join(segments)}
        </svg>
        <div class="crm-donut-center"><b>124</b><span>чел.</span></div>
      </div>
      <div class="crm-legend">
{chr(10).join(legend)}
      </div>
    </div>
    <p class="crm-axis" style="margin-top:14px">Выдано сертификатов за сезон · {total} в демо-базе</p>"""


def _table_rows() -> str:
    rows = []
    for s in STUDENTS:
        pill = (
            '<span class="crm-pill">● Обучен</span>'
            if s["status"] == "ok"
            else '<span class="crm-pill is-wait">● Ожидает</span>'
        )
        rows.append(
            f"""          <tr>
            <td>{s['name']}</td>
            <td>{s['course']}</td>
            <td>{s['dates']}</td>
            <td>{pill}</td>
            <td>{s['cert']}</td>
            <td><button type="button" class="crm-link" data-crm-open="{s['cert']}">Смотреть</button></td>
          </tr>"""
        )
    return "\n".join(rows)


def _student_view(site: dict, brand: str, city: str) -> str:
    first = STUDENTS[0]
    return f"""      <div class="crm-view" data-crm-panel="student" hidden>
        <button type="button" class="crm-back" data-crm-view="dashboard">← Назад</button>
        <div class="crm-student-head">
          <h3>Карточка обучающегося</h3>
          <button type="button" class="crm-btn">Редактировать</button>
        </div>
        <div class="crm-grid">
          <div class="crm-box">
            <div class="crm-profile-top">
              <div class="crm-avatar" data-cert-initials>{_initials(first['name'])}</div>
              <div>
                <h4 data-cert-name>{first['name']}</h4>
                <div class="crm-badges">
                  <span class="crm-badge is-ok" data-cert-status>● Обучен</span>
                  <span class="crm-badge is-accent">Сертификат выдан</span>
                </div>
              </div>
            </div>
            <div class="crm-fields">
              <div><span>Телефон</span><b data-cert-phone>{first['phone']}</b></div>
              <div><span>Email</span><b data-cert-email>{first['email']}</b></div>
              <div><span>Даты обучения</span><b data-cert-dates>{first['dates']}</b></div>
              <div><span>Курс</span><b data-cert-course>{first['course']}</b></div>
              <div><span>Группа</span><b data-cert-group>{first['group']}</b></div>
              <div><span>Преподаватель</span><b data-cert-teacher>{first['teacher']}</b></div>
            </div>
          </div>
          <div class="crm-box">
            <h4>Сертификат</h4>
            {_cert_card(site['brand_html'], brand, city, 'Подпись преподавателя')}
            <div class="crm-cert-actions">
              <button type="button" class="crm-btn is-accent">Скачать PDF</button>
              <a class="crm-btn" href="#verify">Проверить в базе</a>
            </div>
          </div>
          <div class="crm-box">
            <h4>История обучения</h4>
            <ul class="crm-steps">
              <li><span><i>✓</i>Регистрация на курс</span><time data-cert-reg>05.05.2026</time></li>
              <li><span><i>✓</i>Прохождение обучения</span><time data-cert-dates>{first['dates']}</time></li>
              <li><span><i>✓</i>Сдача итогового теста</span><time data-cert-issued>{first['issued']}</time></li>
              <li><span><i>✓</i>Выдача сертификата</span><time data-cert-issued>{first['issued']}</time></li>
            </ul>
          </div>
          <div class="crm-box crm-notes">
            <h4>Примечания</h4>
            <div data-cert-notes>
              {''.join(f'<p>{n}</p>' for n in first['notes'])}
            </div>
            <footer><b data-cert-teacher>{first['teacher']}</b>Преподаватель</footer>
          </div>
        </div>
      </div>"""


def training_html(site: dict, firm: dict, dst: Path) -> str:
    brand = site["brand"]
    city = site["city_contact"]
    city_nom = firm.get("city") or site["city_short"].title()
    phone = firm.get("phone_display") or ""
    phone_tel = firm.get("phone_tel") or ""
    first = STUDENTS[0]

    return f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate">
<title>Обучение — {brand}</title>
<link rel="stylesheet" href="styles.css?v=1">
</head>
<body>
{_nav_html(site, phone_tel, phone)}

<section class="subpage-hero">
  <div class="kicker">05 / ОБУЧЕНИЕ</div>
  <h1>ШКОЛА<br>ДЕТЕЙЛИНГА<br><span class="accent">{brand.upper()}.</span></h1>
  <p>Учим работать со стёклами, оптикой и кузовом: ремонт сколов, полировка, защитные составы.
  Практика на реальных автомобилях в студии в {city}, по итогу — сертификат с проверкой подлинности.</p>
  <div class="actions">
    <a class="button" href="tel:{phone_tel}">ЗАПИСАТЬСЯ НА КУРС</a>
    <a class="button dark" href="#verify">ПРОВЕРИТЬ СЕРТИФИКАТ</a>
  </div>
</section>

<div class="stats">
  <div class="stat"><b>124</b><span>ВЫПУСКНИКА</span></div>
  <div class="stat"><b>5</b><span>ПРОГРАММ ОБУЧЕНИЯ</span></div>
  <div class="stat"><b>70%</b><span>ВРЕМЕНИ — ПРАКТИКА</span></div>
  <div class="stat"><b>до 3</b><span>ЧЕЛОВЕК В ГРУППЕ</span></div>
</div>

<section class="section" id="verify">
  <div class="section-head">
    <div>
      <div class="kicker">ПРОВЕРКА СЕРТИФИКАТА</div>
      <h2>ПОДТВЕРДИТЕ<br><span class="accent">ПОДЛИННОСТЬ.</span></h2>
    </div>
    <p class="intro">Введите номер с бланка или отсканируйте QR-код — покажем данные обучения
    и статус сертификата в базе {brand}.</p>
  </div>

  <div class="cert-box">
    <div>
      <div class="cert-tabs" role="tablist">
        <button type="button" class="cert-tab is-active" data-cert-tab="number">ПО НОМЕРУ</button>
        <button type="button" class="cert-tab" data-cert-tab="qr">ПО QR-КОДУ</button>
      </div>
      <form class="cert-field" id="cert-form" data-cert-panel="number" novalidate>
        <label for="cert-no">НОМЕР СЕРТИФИКАТА</label>
        <input id="cert-no" name="cert-no" type="text" placeholder="AB-2026-001" autocomplete="off">
        <button class="button" type="submit">ПРОВЕРИТЬ</button>
        <p class="cert-hint">Демо-номера: AB-2026-001 … AB-2026-006.</p>
        <p class="cert-msg" id="cert-msg" role="status"></p>
      </form>
      <div data-cert-panel="qr" hidden>
        <p class="cert-note">Наведите камеру телефона на QR-код в правом нижнем углу бланка —
        ссылка откроет эту страницу с уже заполненным номером.</p>
        <p class="cert-note">Если QR повреждён, введите номер вручную на вкладке «По номеру».</p>
      </div>
    </div>
    {_cert_card(site['brand_html'], brand, city_nom, 'Подпись преподавателя')}
  </div>

  <div class="cert-result" id="cert-result" aria-live="polite">
    <div class="cert-status"><i>✓</i>СЕРТИФИКАТ НАЙДЕН</div>
    <div class="cert-data">
      <div><span>ФИО</span><b id="res-name">—</b></div>
      <div><span>КУРС</span><b id="res-course">—</b></div>
      <div><span>ДАТЫ ОБУЧЕНИЯ</span><b id="res-dates">—</b></div>
      <div><span>НОМЕР</span><b id="res-code">—</b></div>
    </div>
    <div class="cert-valid">СЕРТИФИКАТ ДЕЙСТВИТЕЛЕН · ВЫДАН {brand.upper()}, {city_nom.upper()}</div>
  </div>
</section>

<section class="section" id="courses">
  <div class="section-head">
    <div>
      <div class="kicker">ПРОГРАММЫ</div>
      <h2>ЧЕМУ<br><span class="accent">УЧИМ.</span></h2>
    </div>
    <p class="intro">Каждая программа — отдельный навык с практикой на автомобилях студии.
    Можно пройти один курс или собрать комплекс.</p>
  </div>
  <div class="service-list">
{_courses_rows()}
  </div>
</section>

<section class="process" id="how">
  <div class="kicker">КАК ПРОХОДИТ</div>
  <h2>ОТ ЗАЯВКИ<br><span class="accent">ДО СЕРТИФИКАТА.</span></h2>
  <div class="steps">
{_steps_html()}
  </div>
</section>

<section class="section" id="crm">
  <div class="section-head">
    <div>
      <div class="kicker">ПАНЕЛЬ ШКОЛЫ</div>
      <h2>УЧЁТ<br><span class="accent">БЕЗ ТАБЛИЦ.</span></h2>
    </div>
    <p class="intro">Внутренняя панель: статистика, список учеников, сертификаты и карточка
    каждого обучающегося. Нажмите «Смотреть» в таблице — откроется карточка. Данные демонстрационные.</p>
  </div>

  <div class="crm">
    <aside class="crm-side">
      <div class="crm-logo">{site['brand_html']}<small>ДЕТЕЙЛИНГ</small></div>
      <div class="crm-nav" role="tablist">
{_crm_nav()}
      </div>
      <div class="crm-user">
        <div class="crm-user-av">ВЛ</div>
        <div><b>Владислав</b><span>Администратор</span></div>
      </div>
    </aside>
    <div class="crm-main">
      <header class="crm-top">
        <div>
          <h3>Панель администратора</h3>
          <p>Общая информация и статистика по обучению</p>
        </div>
        <div class="crm-top-meta">
          <span>18 сентября 2026</span>
          <span class="crm-bell" aria-hidden="true">🔔</span>
        </div>
      </header>

      <div class="crm-view" data-crm-panel="dashboard">
        <div class="crm-cards">
          <div class="crm-card">
            <div class="crm-card-top">Всего обучающихся<span class="crm-card-ico">◫</span></div>
            <b>124</b><small>+12% за месяц</small>
          </div>
          <div class="crm-card">
            <div class="crm-card-top">Активные курсы<span class="crm-card-ico">◷</span></div>
            <b>5</b><small>+1 новый</small>
          </div>
          <div class="crm-card">
            <div class="crm-card-top">Выдано сертификатов<span class="crm-card-ico">✓</span></div>
            <b>118</b><small>+15% за месяц</small>
          </div>
          <div class="crm-card">
            <div class="crm-card-top">Ожидают обучения<span class="crm-card-ico">◔</span></div>
            <b>7</b><small class="is-flat">в процессе</small>
          </div>
        </div>

        <div class="crm-charts">
          <div class="crm-box">
            <h4>Динамика обучающихся</h4>
{_line_chart()}
          </div>
          <div class="crm-box">
            <h4>Курсы по популярности</h4>
{_donut()}
          </div>
        </div>

        <div class="crm-box" style="margin-top:14px">
          <h4>Последние обучающиеся</h4>
          <div class="crm-table-wrap">
            <table class="crm-table">
              <thead>
                <tr><th>ФИО</th><th>Курс</th><th>Дата обучения</th><th>Статус</th><th>Сертификат</th><th></th></tr>
              </thead>
              <tbody>
{_table_rows()}
              </tbody>
            </table>
          </div>
        </div>
      </div>

{_student_view(site, brand, city_nom)}
    </div>
  </div>
</section>

<section class="process" id="faq">
  <div class="kicker">FAQ</div>
  <h2>ЧАСТЫЕ<br><span class="accent">ВОПРОСЫ.</span></h2>
  <div class="faq">
{_faq_html()}
  </div>
</section>

{_site_bottom(dst)}
<script src="nav.js"></script>
<script>window.TRAINING_DB = {json.dumps({s['cert']: s for s in STUDENTS}, ensure_ascii=False)};
window.TRAINING_DEFAULT = "{first['cert']}";</script>
<script src="training.js"></script>
</body>
</html>
"""


TRAINING_JS = """(function () {
  var DB = window.TRAINING_DB || {};

  function initials(name) {
    return name.split(' ').filter(Boolean).slice(0, 2)
      .map(function (p) { return p[0].toUpperCase(); }).join('');
  }

  function fill(selector, value) {
    document.querySelectorAll(selector).forEach(function (el) { el.textContent = value; });
  }

  function applyStudent(code) {
    var s = DB[code];
    if (!s) return false;
    fill('[data-cert-code]', s.cert);
    fill('[data-cert-name]', s.name);
    fill('[data-cert-course]', s.course);
    fill('[data-cert-dates]', s.dates);
    fill('[data-cert-issued]', s.issued);
    fill('[data-cert-phone]', s.phone);
    fill('[data-cert-email]', s.email);
    fill('[data-cert-group]', s.group);
    fill('[data-cert-teacher]', s.teacher);
    fill('[data-cert-initials]', initials(s.name));
    document.querySelectorAll('[data-cert-status]').forEach(function (el) {
      var done = s.status === 'ok';
      el.textContent = done ? '● Обучен' : '● Ожидает обучения';
      el.classList.toggle('is-ok', done);
      el.classList.toggle('is-accent', !done);
    });
    document.querySelectorAll('[data-cert-notes]').forEach(function (el) {
      el.innerHTML = s.notes.map(function (n) { return '<p>' + n + '</p>'; }).join('');
    });
    return true;
  }

  if (window.TRAINING_DEFAULT) applyStudent(window.TRAINING_DEFAULT);

  /* --- вкладки проверки --- */
  var tabs = document.querySelectorAll('.cert-tab');
  var panels = document.querySelectorAll('[data-cert-panel]');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('is-active'); });
      tab.classList.add('is-active');
      panels.forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-cert-panel') !== tab.getAttribute('data-cert-tab');
      });
    });
  });

  /* --- проверка сертификата --- */
  var form = document.getElementById('cert-form');
  var input = document.getElementById('cert-no');
  var result = document.getElementById('cert-result');
  var msg = document.getElementById('cert-msg');

  if (form && input && result) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var code = input.value.trim().toUpperCase();
      if (!applyStudent(code)) {
        result.classList.remove('is-visible');
        msg.textContent = code
          ? 'Сертификат ' + code + ' не найден. Проверьте номер на бланке.'
          : 'Введите номер сертификата.';
        return;
      }
      var s = DB[code];
      msg.textContent = '';
      document.getElementById('res-name').textContent = s.name;
      document.getElementById('res-course').textContent = s.course;
      document.getElementById('res-dates').textContent = s.dates;
      document.getElementById('res-code').textContent = s.cert;
      result.classList.add('is-visible');
    });

    var fromUrl = new URLSearchParams(location.search).get('cert');
    if (fromUrl) {
      input.value = fromUrl.toUpperCase();
      form.dispatchEvent(new Event('submit'));
    }
  }

  /* --- демо-панель: переключение вида --- */
  var views = document.querySelectorAll('[data-crm-panel]');
  var navItems = document.querySelectorAll('.crm-nav-item');

  function setActive(item) {
    navItems.forEach(function (i) { i.classList.remove('is-active'); });
    if (item) item.classList.add('is-active');
  }

  function navFor(view) {
    return [].filter.call(navItems, function (i) {
      return i.getAttribute('data-crm-view') === view;
    })[0];
  }

  function showView(name, clicked) {
    views.forEach(function (view) {
      view.hidden = view.getAttribute('data-crm-panel') !== name;
    });
    setActive(clicked || navFor(name));
  }

  navItems.forEach(function (item) {
    item.addEventListener('click', function () {
      var target = item.getAttribute('data-crm-view');
      if (target) {
        showView(target, item);
      } else {
        setActive(item);
      }
    });
  });

  var backBtn = document.querySelector('.crm-back');
  if (backBtn) {
    backBtn.addEventListener('click', function () { showView('dashboard'); });
  }

  document.querySelectorAll('[data-crm-open]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      applyStudent(btn.getAttribute('data-crm-open'));
      showView('student');
      document.querySelector('.crm-main').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
"""


def write_training_assets(dst: Path, site: dict, firm: dict) -> None:
    css_path = dst / "styles.css"
    css = css_path.read_text(encoding="utf-8")
    extra = ""
    if "/* red-accent */" not in css:
        extra += RED_ACCENT_CSS
    if "/* training-page */" not in css:
        extra += TRAINING_CSS
    if extra:
        css_path.write_text(css.rstrip() + "\n" + extra, encoding="utf-8")
    (dst / "training.html").write_text(training_html(site, firm, dst), encoding="utf-8")
    (dst / "training.js").write_text(TRAINING_JS, encoding="utf-8")
