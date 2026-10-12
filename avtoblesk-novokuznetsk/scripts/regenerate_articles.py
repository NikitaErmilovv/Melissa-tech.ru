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


def render(article: dict, rel: str = "../../") -> str:
    slug = str(article.get("slug") or "")
    title = str(article.get("title") or "Статья")
    meta_title = (article.get("metaTitle") or "").strip() or f"{title} — АвтоБлеск"
    meta_desc = (article.get("metaDescription") or "").strip() or str(article.get("excerpt") or "")
    cover = str(article.get("cover") or "")
    og = f"{SITE}/{cover.lstrip('/')}" if cover else f"{SITE}/img/icon-512.png"
    canonical = f"{SITE}/works/{slug}/"
    gallery = article.get("gallery") or []
    gallery_html = ""
    for url in gallery:
        if not isinstance(url, str) or not url:
            continue
        href = esc(rel + url.lstrip("/"))
        gallery_html += f'<a class="g g--media" href="{href}" data-lightbox="article"><img src="{href}" alt="" loading="lazy" decoding="async"></a>'
    nav_works = esc(rel + "album.html")
    excerpt = str(article.get("excerpt") or "").strip()
    lead = f'<p class="article-page-lead">{esc(excerpt)}</p>' if excerpt else ""
    date = fmt_date(str(article.get("publishedAt") or ""))
    date_line = f'<p class="article-page-date">{date}</p>' if date else ""
    cover_block = ""
    if cover:
        src = esc(rel + cover.lstrip("/"))
        cover_block = f'<figure class="article-page-cover"><img src="{src}" alt="{esc(title)}" width="1200" height="675" loading="eager" decoding="async"></figure>'
    gal_block = (
        f'<div class="section gallery gallery--portfolio article-page-gallery">{gallery_html}</div>' if gallery_html else ""
    )
    return f"""<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="description" content="{esc(meta_desc)}">
<link rel="canonical" href="{esc(canonical)}">
<title>{esc(meta_title)}</title>
<link rel="icon" href="{esc(rel)}favicon.ico" sizes="any">
<link rel="stylesheet" href="{esc(rel)}styles.css?v=works1">
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
<article class="article-page">
  <header class="article-page-hero subpage-hero">
    <div class="kicker">НАШИ РАБОТЫ</div>
    <h1>{esc(title)}</h1>
    {date_line}
    {lead}
  </header>
  {cover_block}
  <div class="article-page-body section">{body_html(str(article.get("body") or ""))}</div>
  {gal_block}
  <p class="section intro"><a class="button dark" href="{nav_works}">← Все работы</a></p>
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
    print("OK", len(wanted), "articles")


if __name__ == "__main__":
    main()
