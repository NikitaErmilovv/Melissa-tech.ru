#!/usr/bin/env python3
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1] / "fantastika-home174-lazurny" / "services"

PAGES = {
    "wash.html": ("ПРОСТОРНЫЕ КОМНАТЫ", "Светлые спальни и гостиная — место, где приятно собраться всей семьёй и почувствовать себя дома."),
    "engine-bay.html": ("БАНЯ И РЕЛАКС", "Тёплый пар и отдых после насыщенного дня — всё для душевного восстановления и лёгкости."),
    "wrap.html": ("ТЕРРАСА И МАНГАЛ", "Вечера на свежем воздухе, аромат угольков и уютные разговоры под звёздным небом."),
    "ppf.html": ("ТИШИНА И ПРИВАТНОСТЬ", "Спокойный посёлок и уединение — отдых без городской суеты, только вы и близкие."),
    "polish.html": ("СВЕТЛЫЕ ИНТЕРЬЕРЫ", "Тёплый свет, приятные текстуры и заботливо подобранные детали для вашего комфорта."),
    "glass-polish.html": ("ПАНОРАМНЫЕ ОКНА", "Много воздуха и света — природа за окном становится частью вашего отдыха."),
    "ceramic.html": ("ТЁПЛЫЙ ПОЛ И КОМФОРТ", "Дом держит приятное тепло — уютно даже в прохладные вечера у воды."),
    "interior.html": ("МЯГКИЙ ТЕКСТИЛЬ", "Пледы, подушки и постель — чтобы вы отдыхали по-настоящему глубоко и спокойно."),
    "soundproof.html": ("СПОКОЙНЫЙ СОН", "Тихие ночи и выспавшиеся утра — лучший подарок отдыху и новым впечатлениям."),
    "tint.html": ("ЗАКРЫТАЯ ТЕРРИТОРИЯ", "Безопасное пространство для детей, барбекю и неспешных прогулок на свежем воздухе."),
    "anticor.html": ("ГОСТЕВОЙ ДОМ", "Fantastika_home174 — аренда коттеджа с тёплым приёмом в посёлке Лазурный."),
}

for name, (h1, lead) in PAGES.items():
    path = ROOT / name
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8")
    title = h1.title().replace("И", "и") if False else h1
    text = re.sub(r"<title>[^<]+</title>", f"<title>{h1} — Fantastika_home174</title>", text, count=1)
    text = re.sub(
        r"(<section class=\"subpage-hero[^\"]*\">.*?<h1>)[^<]+(</h1>\s*<p>)[^<]+(</p>)",
        rf"\1{h1}\2{lead}\3",
        text,
        count=1,
        flags=re.DOTALL,
    )
    text = re.sub(
        r'(<p class="intro" style="max-width:720px">)[^<]+(</p>)',
        rf"\1{lead} Стоимость аренды: <strong>уточняем</strong> по датам и числу гостей.\2",
        text,
        count=1,
    )
    path.write_text(text, encoding="utf-8")
print("OK")
