# -*- coding: utf-8 -*-
from pathlib import Path
import re

root = Path(__file__).resolve().parents[1]
old = '</span> <span class="logo-word">'
new = '</span><span class="logo-word">'
n = 0
for p in root.rglob("*.html"):
    t = p.read_text(encoding="utf-8")
    t2 = t.replace(old, new)
    t2 = re.sub(r"styles\.css\?v=\d+", "styles.css?v=29", t2)
    if t2 != t:
        p.write_text(t2, encoding="utf-8", newline="\n")
        n += 1
        print("updated", p.relative_to(root))
print("done", n)
