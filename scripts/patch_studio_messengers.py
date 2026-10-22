#!/usr/bin/env python3
"""Inject messenger scripts, contact chips, and footer social links."""

from __future__ import annotations

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

SITES = {
    "klyaksa-tuning-noyabrsk": {
        "gis": "https://2gis.ru/noyabrsk/firm/70000001035583613",
        "wa": "79320590591",
        "tg_url": "https://t.me/+79320590591",
        "tg_label": "Telegram",
        "max_url": "",
    },
    "mir-tonirovki-tobolsk": {
        "gis": "https://2gis.ru/tobolsk/firm/70000001030915203",
        "wa": "79829128333",
        "tg_url": "https://t.me/+79829128333",
        "tg_label": "Telegram",
        "max_url": "",
    },
    "imperiya-avtokompleks-chelyabinsk": {
        "gis": "https://2gis.ru/chelyabinsk/firm/70000001019425061",
        "wa": "73512582283",
        "tg_url": "https://t.me/+73512582283",
        "tg_label": "Telegram",
        "max_url": "",
    },
}


def chips_html(meta: dict) -> str:
    parts = [
        f'<a href="https://wa.me/{meta["wa"]}" target="_blank" rel="noopener noreferrer">WhatsApp</a>',
        f'<a href="{meta["tg_url"]}" target="_blank" rel="noopener noreferrer">{meta["tg_label"]}</a>',
    ]
    if meta.get("max_url"):
        parts.append(
            f'<a href="{meta["max_url"]}" target="_blank" rel="noopener noreferrer">Max</a>'
        )
    parts.append(
        f'<a href="{meta["gis"]}" target="_blank" rel="noopener noreferrer">2ГИС</a>'
    )
    return "\n        ".join(parts)


def footer_social(meta: dict) -> str:
    return f'<div class="footer-social">{chips_html(meta)}</div>'


def inject_scripts(html: str, depth: int) -> str:
    prefix = "../" * depth
    block = (
        f'<script src="{prefix}contacts-config.js"></script>\n'
        f'<script src="{prefix}messenger-picker.js"></script>\n'
    )
    if "messenger-picker.js" in html:
        return html
    needle = f'<script src="{prefix}nav.js"></script>'
    if needle in html:
        return html.replace(needle, block + needle, 1)
    if "</body>" in html:
        return html.replace("</body>", block + "</body>", 1)
    return html


def patch_contact(path: Path, meta: dict) -> None:
    text = path.read_text(encoding="utf-8")
    old = """      <div class="contact-chips">
        <a href="""
    if "WhatsApp" in text and "contact-chips" in text:
        return
    import re

    text = re.sub(
        r'<div class="contact-chips">.*?</div>',
        f'<div class="contact-chips">\n        {chips_html(meta)}\n      </div>',
        text,
        count=1,
        flags=re.DOTALL,
    )
    path.write_text(inject_scripts(text, 0), encoding="utf-8")


def patch_file(path: Path, meta: dict, slug: str) -> None:
    rel = path.relative_to(ROOT / slug)
    depth = len(rel.parts) - 1
    text = path.read_text(encoding="utf-8")
    text = text.replace(
        f'<div class="footer-social"><a href="{meta["gis"]}" target="_blank" rel="noopener noreferrer">2ГИС</a></div>',
        footer_social(meta),
    )
    text = inject_scripts(text, depth)
    path.write_text(text, encoding="utf-8")


def main() -> None:
    for slug, meta in SITES.items():
        base = ROOT / slug
        patch_contact(base / "contact.html", meta)
        for html in base.rglob("*.html"):
            if html.name == "contact.html":
                continue
            patch_file(html, meta, slug)
        print("OK", slug)


if __name__ == "__main__":
    main()
