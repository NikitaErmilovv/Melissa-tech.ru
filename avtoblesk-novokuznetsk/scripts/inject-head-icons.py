"""Insert favicon / OG icon tags into Avtoblesk HTML pages (idempotent)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MARKER = '<!-- avtoblesk-head-icons -->'

def block(prefix: str, og_image: str) -> str:
    return f"""{MARKER}
<link rel="icon" href="{prefix}favicon.ico?v=logo2" sizes="any">
<link rel="icon" type="image/png" sizes="32x32" href="{prefix}favicon-32.png?v=logo2">
<link rel="apple-touch-icon" sizes="180x180" href="{prefix}apple-touch-icon.png?v=logo2">
<link rel="manifest" href="{'site.webmanifest?v=logo2' if prefix == 'img/' else '../site.webmanifest?v=logo2'}">
<meta name="theme-color" content="#0c0c0c">
<meta property="og:type" content="website">
<meta property="og:site_name" content="АвтоБлеск">
<meta property="og:image" content="{og_image}">
<meta property="og:image:width" content="512">
<meta property="og:image:height" content="512">
<meta name="twitter:card" content="summary">
<meta name="twitter:image" content="{og_image}">
"""

OG = "https://autoblesk42.ru/img/icon-512.png?v=logo2"

pages = [
    (ROOT / "index.html", "img/"),
    (ROOT / "about.html", "img/"),
    (ROOT / "services.html", "img/"),
    (ROOT / "training.html", "img/"),
    (ROOT / "contact.html", "img/"),
    (ROOT / "album.html", "img/"),
    (ROOT / "legal.html", "img/"),
    (ROOT / "gallery.html", "img/"),
    (ROOT / "cms" / "admin.html", "../img/"),
    (ROOT / "cms" / "admin-panel.html", "../img/"),
]

for path, prefix in pages:
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8")
    if MARKER in text:
        # replace existing block up to twitter:image line
        start = text.index(MARKER)
        end = text.index("\n", text.index("twitter:image", start)) + 1
        text = text[:start] + block(prefix, OG).rstrip() + "\n" + text[end:]
    else:
        insert = block(prefix, OG)
        if "</title>" in text:
            text = text.replace("</title>", "</title>\n" + insert, 1)
        else:
            text = text.replace("<head>", "<head>\n" + insert, 1)
    path.write_text(text, encoding="utf-8")
    print("updated", path.relative_to(ROOT))
