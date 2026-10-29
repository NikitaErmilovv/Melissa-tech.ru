#!/usr/bin/env python3
"""Replace stacked nav phones with Позвонить picker."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "pryamye-ruki-55-omsk"

NAV_BLOCK = re.compile(
    r'  <div class="nav-actions">\s*'
    r'<div class="nav-phones nav-phones--desktop">[\s\S]*?</div>\s*'
    r'<a class="phone phone--nav-mobile" href="tel:\+79087939563">\+7 \(908\) 793-95-63</a>\s*',
    re.MULTILINE,
)

REPLACEMENT = """  <div class="nav-actions">
    <div class="phone-picker" data-phone-picker>
      <button type="button" class="button button--nav-call phone-picker__toggle" aria-expanded="false" aria-haspopup="true">Позвонить</button>
      <div class="phone-picker__menu" hidden></div>
    </div>
"""

MOBILE_TELS = re.compile(
    r'\n    <a href="tel:\+79136273852">Автосигнализации · \+7 \(913\) 627-38-52</a>'
    r'\n    <a href="tel:\+79087939563">Бронирование / тонирование · \+7 \(908\) 793-95-63</a>'
    r'\n    <a href="tel:\+79681022224">Автосвет · \+7 \(968\) 102-22-24</a>',
)

def inject_scripts(html: str, rel: str) -> str:
    if "phone-picker.js" in html:
        return html
    cfg = f'<script src="{rel}contacts-config.js"></script>'
    picker = f'<script src="{rel}phone-picker.js"></script>'
    if "contacts-config.js" not in html:
        html = html.replace(f'<script src="{rel}nav.js"', cfg + "\n" + f'<script src="{rel}nav.js"')
    html = html.replace(
        f'<script src="{rel}messenger-picker.js"></script>',
        picker + "\n" + f'<script src="{rel}messenger-picker.js"></script>',
    )
    return html


def main() -> None:
    for path in sorted(SITE.rglob("*.html")):
        text = path.read_text(encoding="utf-8")
        orig = text
        text = NAV_BLOCK.sub(REPLACEMENT, text)
        text = MOBILE_TELS.sub("", text)
        rel = "../" if path.parent.name == "services" else ""
        text = inject_scripts(text, rel)
        if text != orig:
            path.write_text(text, encoding="utf-8")
            print("patched", path.relative_to(ROOT))


if __name__ == "__main__":
    main()
