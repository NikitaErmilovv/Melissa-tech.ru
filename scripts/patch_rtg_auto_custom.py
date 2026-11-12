#!/usr/bin/env python3
"""Apply Auto Custom org data to RTG template (layout unchanged)."""

from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "auto-custom-chelyabinsk-rtg"
INDEX = ROOT / "index.html"
FC = ROOT / "flex-carousel-boot.js"

REPLACEMENTS_INDEX = [
    ("RTG Wrapzz — wraps, chrome delete, PPF", "Auto Custom — wraps, chrome delete, PPF"),
    (
        "RTG Wrapzz LLC in Arizona. Partial and full wraps, chrome delete, PPF, and custom decals.",
        "Auto Custom in Chelyabinsk. Partial and full wraps, chrome delete, PPF, and custom decals.",
    ),
    (">RTG WRAPZZ<", ">AUTO CUSTOM<"),
    ("Arizona · Licensed &amp; professional", "Chelyabinsk · Licensed &amp; professional"),
    ("<h1>RTG<br>WRAPZZ</h1>", "<h1>AUTO<br>CUSTOM</h1>"),
    (
        'href="https://www.instagram.com/rtg_wrapzz/" target="_blank" rel="noopener">Instagram</a>',
        'href="tel:+79000623277">+7 (900) 062-32-77</a>',
    ),
    ("RTG Wrapzz", "Auto Custom"),
    ("The bay is in Arizona. Write before you come — we book by appointment.", "The bay is in Chelyabinsk. Call before you come — we book by appointment."),
    (
        "<p>Arizona</p>",
        "<p>пос. Градский Прииск, Курчатовский р-н</p>\n      <p>Челябинск, 454100</p>",
    ),
    ("<p>Licensed and professional</p>", ""),  # remove duplicate line after address block
    (
        'href="https://www.instagram.com/rtg_wrapzz/" target="_blank" rel="noopener">@rtg_wrapzz</a>',
        'href="tel:+79000623277">+7 (900) 062-32-77</a>\n      <a href="mailto:auto.custom174@gmail.com">auto.custom174@gmail.com</a>',
    ),
    (
        'href="https://www.instagram.com/rtg_wrapzz/" target="_blank" rel="noopener">Get directions in the DM</a>',
        'href="https://2gis.ru/chelyabinsk/firm/70000001034460339" target="_blank" rel="noopener noreferrer">Open in 2GIS</a>',
    ),
    (
        'href="https://www.instagram.com/rtg_wrapzz/" target="_blank" rel="noopener"',
        'href="https://2gis.ru/chelyabinsk/firm/70000001034460339" target="_blank" rel="noopener noreferrer"',
    ),
    ("<span>RTG Wrapzz LLC</span>", "<span>Auto Custom</span>"),
    ("DM @rtg_wrapzz with the panels and the color.", "Call +7 (900) 062-32-77 with the panels and the color."),
    (
        'href="https://www.instagram.com/rtg_wrapzz/" target="_blank" rel="noopener">Open Instagram</a>',
        'href="tel:+79000623277">Call the shop</a>',
    ),
    ("<p>Financing available</p>", "<p>Call for a quote</p>"),
]

def main() -> None:
    html = INDEX.read_text(encoding="utf-8")
    for old, new in REPLACEMENTS_INDEX:
        if old not in html:
            raise SystemExit(f"missing expected fragment: {old[:60]!r}")
        html = html.replace(old, new, 1)
    INDEX.write_text(html, encoding="utf-8")

    fc = FC.read_text(encoding="utf-8")
    fc = fc.replace("RTG Wrapzz", "Auto Custom")
    FC.write_text(fc, encoding="utf-8")
    print("patched", INDEX, FC)


if __name__ == "__main__":
    main()
