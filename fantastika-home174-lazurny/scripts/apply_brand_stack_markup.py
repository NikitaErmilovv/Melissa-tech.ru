#!/usr/bin/env python3
"""Replace flat logo/heading markup with Kino + Great Vibes brand-stack."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

LOGO_COMPACT = (
    '<span class="brand-stack brand-stack--compact">'
    '<span class="brand-stack__base">Home</span>'
    '<span class="brand-stack__script">174</span></span>'
)
LOGO_FOOTER = LOGO_COMPACT.replace("--compact", "--footer")
LOGO_MAP = LOGO_COMPACT.replace("--compact", "--map")

OLD_LOGO = '<span class="logo-mark">HOME</span><span class="logo-word">174</span>'

HERO_H1 = """<h1><span class="hero-title-brand">
        <span class="brand-stack brand-stack--hero">
          <span class="brand-stack__base">Fantastika</span>
          <span class="brand-stack__script">home</span>
        </span>
        <span class="brand-stack brand-stack--hero brand-stack--hero-sub">
          <span class="brand-stack__base">Home</span>
          <span class="brand-stack__script">174</span>
        </span>
      </span></h1>"""

OLD_HERO = (
    "<h1><span class=\"hero-brand-accent\">FANTASTIKA</span><br>"
    "<span class=\"hero-brand-name\">HOME</span> "
    "<span class=\"hero-brand-num\">174</span></h1>"
)

REPLACEMENTS = [
    (OLD_LOGO, LOGO_COMPACT),
    (
        '<div class="footer-logo">' + OLD_LOGO + "</div>",
        '<div class="footer-logo">' + LOGO_FOOTER + "</div>",
    ),
    (
        "<p class=\"address-map-brand\">" + OLD_LOGO + "</p>",
        "<p class=\"address-map-brand\">" + LOGO_MAP + "</p>",
    ),
    (OLD_HERO, HERO_H1),
    (
        "<h2>УЮТ И<br><span class=\"accent\">ЗАБОТА О ВАС</span></h2>",
        "<h2><span class=\"title-kino-line\">Уют и</span>"
        '<span class="brand-stack brand-stack--section">'
        '<span class="brand-stack__base">Забота</span>'
        '<span class="brand-stack__script">о вас</span></span></h2>',
    ),
    (
        "<h2>НАШ<br><span class=\"accent\">ДОМ.</span></h2>",
        "<h2><span class=\"title-kino-line\">Наш</span>"
        '<span class="brand-stack brand-stack--section">'
        '<span class="brand-stack__base">Дом</span>'
        '<span class="brand-stack__script">у воды</span></span></h2>',
    ),
    (
        "<h2>КАК<br><span class=\"accent\">ОТДЫХАТЬ.</span></h2>",
        "<h2><span class=\"title-kino-line\">Как</span>"
        '<span class="brand-stack brand-stack--section">'
        '<span class="brand-stack__base">Отдыхать</span>'
        '<span class="brand-stack__script">с душой</span></span></h2>',
    ),
    (
        "<h2>ОТЗЫВЫ<br><span class=\"accent\">КЛИЕНТОВ.</span></h2>",
        "<h2><span class=\"title-kino-line\">Отзывы</span>"
        '<span class="brand-stack brand-stack--section">'
        '<span class="brand-stack__base">Гостей</span>'
        '<span class="brand-stack__script">о нас</span></span></h2>',
    ),
    (
        "<h1>НАШИ<br><span class=\"accent\">РАБОТЫ</span></h1>",
        "<h1><span class=\"title-kino-line\">Наши</span>"
        '<span class="brand-stack brand-stack--section brand-stack--page-hero">'
        '<span class="brand-stack__base">Фото</span>'
        '<span class="brand-stack__script">дома</span></span></h1>',
    ),
    (
        "<h2>ФОТО<br><span class=\"accent\">ДОМА</span></h2>",
        "<h2><span class=\"title-kino-line\">Фото</span>"
        '<span class="brand-stack brand-stack--section">'
        '<span class="brand-stack__base">Дома</span>'
        '<span class="brand-stack__script">и террасы</span></span></h2>',
    ),
    (
        "<h1>GUEST HOUSE<br><span class=\"accent\">174</span></h1>",
        "<h1>"
        '<span class="brand-stack brand-stack--section brand-stack--page-hero">'
        '<span class="brand-stack__base">Guest house</span>'
        '<span class="brand-stack__script">174</span></span></h1>',
    ),
    (
        "<h2>ТЕПЛО<br><span class=\"accent\">И ЗАБОТА.</span></h2>",
        "<h2><span class=\"title-kino-line\">Тепло</span>"
        '<span class="brand-stack brand-stack--section">'
        '<span class="brand-stack__base">И забота</span>'
        '<span class="brand-stack__script">каждый день</span></span></h2>',
    ),
    (
        "<h2>ЧАСТЫЕ<br><span class=\"accent\">ВОПРОСЫ.</span></h2>",
        "<h2><span class=\"title-kino-line\">Частые</span>"
        '<span class="brand-stack brand-stack--section">'
        '<span class="brand-stack__base">Вопросы</span>'
        '<span class="brand-stack__script">и ответы</span></span></h2>',
    ),
    (
        "<h1>АРЕНДА КОТТЕДЖА<br><span class=\"accent\">ЛАЗУРНЫЙ</span></h1>",
        "<h1><span class=\"title-kino-line\">Аренда коттеджа</span>"
        '<span class="brand-stack brand-stack--section brand-stack--page-hero">'
        '<span class="brand-stack__base">Лазурный</span>'
        '<span class="brand-stack__script">у воды</span></span></h1>',
    ),
    (
        "<h1>СВЯЗАТЬСЯ<br><span class=\"accent\">С НАМИ</span></h1>",
        "<h1><span class=\"title-kino-line\">Связаться</span>"
        '<span class="brand-stack brand-stack--section brand-stack--page-hero">'
        '<span class="brand-stack__base">С нами</span>'
        '<span class="brand-stack__script">удобно</span></span></h1>',
    ),
    (
        "<h2>GUEST HOUSE<br><span class=\"accent\">174</span></h2>",
        "<h2>"
        '<span class="brand-stack brand-stack--section">'
        '<span class="brand-stack__base">Guest house</span>'
        '<span class="brand-stack__script">174</span></span></h2>',
    ),
]

CSS_V = "130"


def patch_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    orig = text
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    if "styles.css?v=" in text:
        import re

        text = re.sub(r"styles\.css\?v=\d+", f"styles.css?v={CSS_V}", text)
        text = re.sub(r"\.\./styles\.css\?v=\d+", f"../styles.css?v={CSS_V}", text)
    if text != orig:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for path in sorted(ROOT.rglob("*.html")):
        if patch_file(path):
            changed.append(path.relative_to(ROOT))
    print("Updated:", len(changed))
    for p in changed:
        print(" ", p)


if __name__ == "__main__":
    main()
