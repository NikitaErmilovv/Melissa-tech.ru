# -*- coding: utf-8 -*-
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
n = 0
for p in root.rglob("*.html"):
    t = p.read_text(encoding="utf-8")
    orig = t
    t = t.replace(">ДЕТЕЙЛИНГ</span>", ">DETAILING</span>")
    t = re.sub(r"styles\.css\?v=\d+", "styles.css?v=26", t)
    if t != orig:
        p.write_text(t, encoding="utf-8", newline="\n")
        n += 1
        print("updated", p.relative_to(root))

gen = root / "scripts" / "gen_service_pages.py"
if gen.exists():
    g = gen.read_text(encoding="utf-8")
    g2 = g.replace(">ДЕТЕЙЛИНГ</span>", ">DETAILING</span>")
    g2 = re.sub(r"styles\.css\?v=\d+", "styles.css?v=26", g2)
    if g2 != g:
        gen.write_text(g2, encoding="utf-8", newline="\n")
        print("updated gen_service_pages.py")
print("done", n)
