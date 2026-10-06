"""Insert favicon / OG icon tags into Avtoblesk HTML pages (idempotent)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MARKER = '<!-- avtoblesk-head-icons -->'

def block(og_image: str) -> str:
    # Absolute paths from site root — required for Google favicon in search results.
    return f"""{MARKER}
<link rel="icon" href="/favicon.ico" sizes="any">
<link rel="icon" type="image/png" sizes="48x48" href="/img/favicon-48.png">
<link rel="icon" type="image/png" sizes="96x96" href="/img/favicon-96.png">
<link rel="icon" type="image/png" sizes="192x192" href="/img/favicon-192.png">
<link rel="apple-touch-icon" sizes="180x180" href="/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#0c0c0c">
<meta property="og:type" content="website">
<meta property="og:site_name" content="АвтоБлеск">
<meta property="og:image" content="{og_image}">
<meta property="og:image:width" content="512">
<meta property="og:image:height" content="512">
<meta name="twitter:card" content="summary">
<meta name="twitter:image" content="{og_image}">
"""

OG = "https://autoblesk42.ru/img/icon-512.png"

pages = [
    ROOT / "index.html",
    ROOT / "about.html",
    ROOT / "services.html",
    ROOT / "training.html",
    ROOT / "contact.html",
    ROOT / "album.html",
    ROOT / "legal.html",
    ROOT / "gallery.html",
    ROOT / "cms" / "admin.html",
    ROOT / "cms" / "admin-panel.html",
]

for path in pages:
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8")
    insert = block(OG)
    if MARKER in text:
        start = text.index(MARKER)
        end = text.index("\n", text.index("twitter:image", start)) + 1
        text = text[:start] + insert.rstrip() + "\n" + text[end:]
    elif "</title>" in text:
        text = text.replace("</title>", "</title>\n" + insert, 1)
    else:
        text = text.replace("<head>", "<head>\n" + insert, 1)
    path.write_text(text, encoding="utf-8")
    print("updated", path.relative_to(ROOT))
