# -*- coding: utf-8 -*-
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]

repls = [
    (
        '<div class="logo"><a href="index.html">D2<span> detailing</span></a></div>',
        '<div class="logo"><a href="index.html"><span class="logo-mark">D2</span><span class="logo-word">ДЕТЕЙЛИНГ</span></a></div>',
    ),
    (
        '<div class="logo"><a href="../index.html">D2<span> detailing</span></a></div>',
        '<div class="logo"><a href="../index.html"><span class="logo-mark">D2</span><span class="logo-word">ДЕТЕЙЛИНГ</span></a></div>',
    ),
    (
        "D2<span> detailing</span>",
        '<span class="logo-mark">D2</span> <span class="logo-word">ДЕТЕЙЛИНГ</span>',
    ),
]

n = 0
for p in root.rglob("*.html"):
    text = p.read_text(encoding="utf-8")
    orig = text
    for a, b in repls:
        text = text.replace(a, b)
    text = re.sub(r"styles\.css\?v=\d+", "styles.css?v=25", text)
    if text != orig:
        p.write_text(text, encoding="utf-8", newline="\n")
        n += 1
        print("updated", p.relative_to(root))

# generator nav/footer brand
gen = root / "scripts" / "gen_service_pages.py"
if gen.exists():
    g = gen.read_text(encoding="utf-8")
    g2 = g.replace(
        'D2<span> detailing</span>',
        '<span class="logo-mark">D2</span><span class="logo-word">ДЕТЕЙЛИНГ</span>',
    )
    g2 = re.sub(r"styles\.css\?v=\d+", "styles.css?v=25", g2)
    # keep space in footer/map variants if needed — logo mark+word already adjacent in nav via CSS gap
    if g2 != g:
        gen.write_text(g2, encoding="utf-8", newline="\n")
        print("updated gen_service_pages.py")

print("done", n)
