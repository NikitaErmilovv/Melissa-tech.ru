#!/usr/bin/env python3
"""Regenerate works/*/index.html from data/articles.json (local dev without PHP)."""

from __future__ import annotations

import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTICLES = ROOT / "data" / "articles.json"
WORKS = ROOT / "works"
SITE = "https://autoblesk42.ru"


def esc(s: str) -> str:
    return html.escape(s, quote=True)


def body_html(body: str) -> str:
    parts = re.split(r"\n\s*\n", body.strip())
    out = []
    for para in parts:
        para = para.strip()
        if not para:
            continue
        out.append("<p>" + esc(para).replace("\n", "<br>") + "</p>")
    return "".join(out) or "<p></p>"


def fmt_date(iso: str) -> str:
    if not iso:
        return ""
    p = iso.split("-")
    if len(p) != 3:
        return esc(iso)
    return esc(f"{int(p[2])}.{p[1]}.{p[0]}")


def sort_articles(items: list) -> list:
    def key(a):
        return (
            1 if a.get("pinned") else 0,
            int(a.get("order") or 0),
            str(a.get("publishedAt") or ""),
        )

    return sorted(items, key=key, reverse=True)


def width_mod(width: str) -> str:
    w = (width or "normal").lower().strip()
    if w in ("narrow", "wide"):
        return f"article-page--width-{w}"
    return "article-page--width-normal"


def norm_path(p: str) -> str:
    return p.replace("\\", "/").lstrip("/")


def gallery_without_cover(gallery: list, cover: str) -> list:
    if not cover:
        return [u for u in gallery if isinstance(u, str) and u]
    c = norm_path(cover)
    return [u for u in gallery if isinstance(u, str) and u and norm_path(u) != c]


def render(article: dict, rel: str = "../../") -> str:
    slug = str(article.get("slug") or "")
    title = str(article.get("title") or "Статья")
    meta_title = (article.get("metaTitle") or "").strip() or f"{title} — АвтоБлеск"
    meta_desc = (article.get("metaDescription") or "").strip() or str(article.get("excerpt") or "")
    cover = str(article.get("cover") or "")
    og = f"{SITE}/{cover.lstrip('/')}" if cover else f"{SITE}/img/icon-512.png"
    canonical = f"{SITE}/works/{slug}/"
    gallery = gallery_without_cover(article.get("gallery") or [], cover)
    gallery_html = ""
    for url in gallery:
        href = esc(rel + url.lstrip("/"))
        gallery_html += f'<a class="g g--media" href="{href}" data-lightbox="article"><img src="{href}" alt="" loading="lazy" decoding="async"></a>'
    nav_works = esc(rel + "album.html")
    excerpt = str(article.get("excerpt") or "").strip()
    lead = f'<p class="article-page-lead">{esc(excerpt)}</p>' if excerpt else ""
    date = fmt_date(str(article.get("publishedAt") or ""))
    date_line = f'<p class="article-page-date">{date}</p>' if date else ""
    show_cover = article.get("showCover", True)
    cover_block = ""
    if cover and show_cover:
        src = esc(rel + cover.lstrip("/"))
        cover_block = f'<figure class="article-page-cover"><img src="{src}" alt="{esc(title)}" loading="eager" decoding="async"></figure>'
    gal_block = (
        f'<div class="gallery gallery--portfolio article-page-gallery">{gallery_html}</div>' if gallery_html else ""
    )
    wmod = esc(width_mod(str(article.get("contentWidth") or "normal")))
    return f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="{esc(meta_desc)}">
<link rel="canonical" href="{esc(canonical)}">
<title>{esc(meta_title)}</title>
<link rel="icon" href="{esc(rel)}favicon.ico" sizes="any">
<link rel="stylesheet" href="{esc(rel)}styles.css?v=works3">
<link rel="stylesheet" href="{esc(rel)}cms/cms.css?v=text1">
<meta property="og:type" content="article">
<meta property="og:site_name" content="АвтоБлеск">
<meta property="og:title" content="{esc(meta_title)}">
<meta property="og:description" content="{esc(meta_desc)}">
<meta property="og:url" content="{esc(canonical)}">
<meta property="og:image" content="{esc(og)}">
</head>
<body>
<nav class="site-nav">
  <div class="logo"><a href="{esc(rel)}index.html"><span>АВТО</span>БЛЕСК</a></div>
  <div class="links"><a href="{esc(rel)}index.html#services">УСЛУГИ</a><a href="{esc(rel)}index.html#story">О СТУДИИ</a><a href="{esc(rel)}index.html#contacts">КОНТАКТЫ</a><a href="{esc(rel)}training.html">ОБУЧЕНИЕ</a><a href="{nav_works}">НАШИ РАБОТЫ</a></div>
  <div class="nav-actions">
    <a class="phone" href="tel:+79235322652">+7 (923) 532-26-52</a>
    <button class="nav-burger" type="button" aria-label="Открыть меню" aria-expanded="false">
      <span class="nav-burger-line"></span><span class="nav-burger-line"></span><span class="nav-burger-line"></span>
    </button>
  </div>
  <div class="nav-mobile-menu">
    <a href="{esc(rel)}index.html#services">УСЛУГИ</a>
    <a href="{esc(rel)}index.html#story">О СТУДИИ</a>
    <a href="{esc(rel)}index.html#contacts">КОНТАКТЫ</a>
    <a href="{esc(rel)}training.html">ОБУЧЕНИЕ</a>
    <a href="{nav_works}">НАШИ РАБОТЫ</a>
  </div>
</nav>
<article class="article-page {wmod}">
  <header class="article-page-hero subpage-hero">
    <div class="kicker">НАШИ РАБОТЫ</div>
    <h1>{esc(title)}</h1>
    {date_line}
    {lead}
  </header>
  <div class="article-page-inner">
  {cover_block}
  <div class="article-page-body">{body_html(str(article.get("body") or ""))}</div>
  {gal_block}
  <p class="intro article-page-back"><a class="button dark" href="{nav_works}">← Все работы</a></p>
  </div>
</article>
<footer class="site-footer" style="margin-top:48px">
  <div class="footer-bottom">
    <span>© 2026 Детейлинг-студия «АвтоБлеск». Все права защищены.</span>
    <span class="footer-requisites"><a class="footer-legal-link" href="{esc(rel)}legal.html">Документы</a></span>
  </div>
</footer>
<script src="{esc(rel)}nav.js"></script>
<script src="{esc(rel)}gallery-lightbox.js" defer></script>
</body>
</html>"""


def feed_row(article: dict, base: str = "") -> str:
    slug = str(article.get("slug") or "")
    href = esc(base + "works/" + slug + "/")
    title = esc(str(article.get("title") or ""))
    excerpt = esc(str(article.get("excerpt") or ""))
    date_attr = esc(str(article.get("publishedAt") or ""))
    date = fmt_date(str(article.get("publishedAt") or ""))
    cover = str(article.get("cover") or "")
    gallery = article.get("gallery") or []
    if not cover and gallery:
        cover = str(gallery[0])
    pinned = bool(article.get("pinned"))
    pin = '<span class="article-row-pin">Закреплено</span>' if pinned else ""
    row_class = "article-row" + (" article-row--pinned" if pinned else "")
    if cover:
        src = esc(base + cover.lstrip("/"))
        media = f'<a class="article-row-media" href="{href}" tabindex="-1" aria-hidden="true"><img src="{src}" alt="" loading="lazy" decoding="async"></a>'
    else:
        media = f'<a class="article-row-media article-row-media--empty" href="{href}" tabindex="-1" aria-hidden="true"><span>АвтоБлеск</span></a>'
    return (
        f'<article class="{row_class}">{media}<div class="article-row-body">{pin}'
        f'<time class="article-row-date" datetime="{date_attr}">{date}</time>'
        f'<h2 class="article-row-title"><a href="{href}">{title}</a></h2>'
        f'<p class="article-row-excerpt">{excerpt}</p>'
        f'<a class="button dark article-row-btn" href="{href}">Читать статью</a>'
        f"</div></article>"
    )


def feed_inner(data: dict, base: str = "") -> str:
    articles = [a for a in data.get("articles", []) if isinstance(a, dict) and not a.get("hidden")]
    if not articles:
        return '<p class="intro">Пока нет опубликованных материалов. Загляните позже.</p>'
    rows = "".join(feed_row(a, base) for a in sort_articles(articles))
    return f'<div class="article-feed article-feed--magazine">{rows}</div>'


def patch_album(data: dict) -> None:
    album = ROOT / "album.html"
    if not album.is_file():
        return
    html = album.read_text(encoding="utf-8")
    inner = feed_inner(data, "")
    replacement = f"<!-- ARTICLES_FEED -->\n{inner}\n<!-- /ARTICLES_FEED -->"
    new_html, n = re.subn(
        r"<!-- ARTICLES_FEED -->[\s\S]*?<!-- /ARTICLES_FEED -->",
        replacement,
        html,
        count=1,
    )
    if n:
        album.write_text(new_html, encoding="utf-8")


def main() -> None:
    data = json.loads(ARTICLES.read_text(encoding="utf-8"))
    articles = [a for a in data.get("articles", []) if isinstance(a, dict) and not a.get("hidden")]
    wanted: set[str] = set()
    WORKS.mkdir(exist_ok=True)
    for article in sort_articles(articles):
        slug = re.sub(r"[^a-z0-9-]", "", str(article.get("slug") or "").lower())
        if not slug:
            continue
        wanted.add(slug)
        dest = WORKS / slug
        dest.mkdir(exist_ok=True)
        (dest / "index.html").write_text(render(article), encoding="utf-8")
    for child in WORKS.iterdir():
        if not child.is_dir():
            continue
        if child.name not in wanted:
            idx = child / "index.html"
            if idx.is_file():
                idx.unlink()
            try:
                child.rmdir()
            except OSError:
                pass
    patch_album(data)
    print("OK", len(wanted), "articles")


if __name__ == "__main__":
    main()
