from pathlib import Path

root = Path(__file__).resolve().parent
html = (root / "gallery.html").read_text(encoding="utf-8")
body = (root / "_gallery_body.html").read_text(encoding="utf-8").strip()

hero_i = html.index('<section class="subpage-hero">')
hero_end = html.index("</section>", hero_i) + len("</section>")
while hero_end < len(html) and html[hero_end] in "\r\n":
    hero_end += 1

reviews_marker = '<div class="kicker">ОТЗЫВЫ</div><h2>ЛЮДИ'
reviews_i = html.index(reviews_marker)
section_i = html.rfind("<section", 0, reviews_i)

(root / "gallery.html").write_text(html[:hero_end] + "\n\n" + body + "\n\n" + html[section_i:], encoding="utf-8")
print("patched")
