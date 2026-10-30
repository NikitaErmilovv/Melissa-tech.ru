#!/usr/bin/env python3
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "fantastika-home174-lazurny" / "services"
PAGES = {
    "wash.html": "Светлые спальни и гостиная — место, где приятно собраться всей семьёй и почувствовать себя дома.",
    "engine-bay.html": "Тёплый пар и отдых после насыщенного дня — всё для душевного восстановления и лёгкости.",
    "wrap.html": "Вечера на свежем воздухе, аромат угольков и уютные разговоры под звёздным небом.",
    "ppf.html": "Спокойный посёлок и уединение — отдых без городской суеты, только вы и близкие.",
    "polish.html": "Тёплый свет, приятные текстуры и заботливо подобранные детали для вашего комфорта.",
    "glass-polish.html": "Много воздуха и света — природа за окном становится частью вашего отдыха.",
    "ceramic.html": "Дом держит приятное тепло — уютно даже в прохладные вечера у воды.",
    "interior.html": "Пледы, подушки и постель — чтобы вы отдыхали по-настоящему глубоко и спокойно.",
    "soundproof.html": "Тихие ночи и выспавшиеся утра — лучший подарок отдыху и новым впечатлениям.",
    "tint.html": "Безопасное пространство для детей, барбекю и неспешных прогулок на свежем воздухе.",
    "anticor.html": "Fantastika_home174 — аренда коттеджа с тёплым приёмом в посёлке Лазурный.",
}

for name, lead in PAGES.items():
    path = ROOT / name
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8")
    text = re.sub(
        r'(<p class="intro" style="max-width:720px">).*?(</p>)',
        rf"\1{lead} Стоимость аренды: <strong>уточняем</strong> по датам и числу гостей.\2",
        text,
        count=1,
        flags=re.DOTALL,
    )
    path.write_text(text, encoding="utf-8")
print("OK")
