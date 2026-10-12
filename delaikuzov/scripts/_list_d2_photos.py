# -*- coding: utf-8 -*-
from pathlib import Path
import urllib.request
import re

src = Path(r"C:\Users\Никита\Work\Фото для прототипов\D2_detailing")
rep = Path(__file__).resolve().parent / "_d2_list.txt"
lines = []
if not src.exists():
    lines.append(f"MISSING {src}")
else:
    files = sorted(src.rglob("*"))
    for p in files:
        if p.is_file():
            lines.append(f"{p.relative_to(src)} | {p.suffix} | {p.stat().st_size}")
    lines.append(f"COUNT={sum(1 for p in files if p.is_file())}")

# 2gis scrape
try:
    html = urllib.request.urlopen(
        "https://2gis.ru/novosibirsk/firm/70000001061278508", timeout=25
    ).read().decode("utf-8", "ignore")
    for pat in [
        r'og:title" content="([^"]+)"',
        r'og:description" content="([^"]+)"',
        r'tel:(\+?[0-9]+)',
        r'\+7[0-9\u2012\u2013\-]{10,20}',
        r'Покатная[^"<]{0,50}',
        r'd2detailing[^"<]{0,40}',
        r'"phones"[^]]{0,200}',
    ]:
        m = re.findall(pat, html)
        if m:
            lines.append(f"2GIS {pat[:40]} -> {m[:8]}")
except Exception as e:
    lines.append(f"2GIS ERR {e}")

rep.write_text("\n".join(lines), encoding="utf-8")
print("wrote", rep)
