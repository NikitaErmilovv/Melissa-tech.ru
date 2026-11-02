#!/usr/bin/env python3
"""Клон шаблона rp-detailing-tolyatti под другую организацию (без 3D-конфигуратора)."""

from __future__ import annotations

import json
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "rp-detailing-tolyatti"


def apply_replacements(text: str, rep: dict[str, str]) -> str:
    for old, new in sorted(rep.items(), key=lambda x: -len(x[0])):
        text = text.replace(old, new)
    return text


def build_services_html(services: list[dict]) -> str:
    rows = []
    for i, svc in enumerate(services, start=1):
        idx = f"{i:02d}"
        rows.append(
            f'    <a class="service-row" href="services/{svc["slug"]}.html" id="svc-{idx}">'
            f'<div class="idx">{idx}</div><div><h3>{svc["title"]}</h3>'
            f'<div class="service-desc"><p class="service-lead">{svc["lead"]}</p></div></div>'
            f'<div class="cost">после осмотра</div></a>'
        )
    return "\n".join(rows)


def build_home_strip(services: list[dict]) -> str:
    rows = []
    for svc in services:
        rows.append(
            f'    <a class="photo" href="services/{svc["slug"]}.html" '
            f'style="background-image:url(\'{svc["image"]}\')"><span class="tag">{svc["tag"]}</span></a>'
        )
    return "\n".join(rows)


def clone_site(cfg: dict) -> Path:
    dest = ROOT / cfg["slug"]
    if dest.exists():
        shutil.rmtree(dest)
    shutil.copytree(
        TEMPLATE,
        dest,
        ignore=shutil.ignore_patterns("__pycache__", "deploy-version.txt", ".DS_Store"),
    )

    rep = cfg["replace"]
    for path in dest.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix.lower() not in {".html", ".js", ".json", ".md", ".css", ".txt", ".py"}:
            continue
        raw = path.read_text(encoding="utf-8")
        path.write_text(apply_replacements(raw, rep), encoding="utf-8")

    server = dest / "server.py"
    server.write_text(
        server.read_text(encoding="utf-8")
        .replace("PORT = 8134", f'PORT = {cfg["port"]}')
        .replace(
            'FIRM_URL = "https://2gis.ru/togliatti/firm/70000001067251376"',
            f'FIRM_URL = "{cfg["gis_firm_url"]}"',
        ),
        encoding="utf-8",
    )

    contacts = dest / "contacts-config.js"
    contacts.write_text(
        f"""window.STUDIO_MESSENGERS = {{
  wa: "{cfg["phone_wa"]}",
  tg: "{cfg["phone_tg"]}",
  max: "",
  defaultMessage: "{cfg["default_message"]}",
}};
""",
        encoding="utf-8",
    )

    (dest / "data" / "reviews-2gis.json").write_text(
        json.dumps(cfg.get("reviews", []), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    index = dest / "index.html"
    idx = index.read_text(encoding="utf-8")
    idx = re.sub(
        r'<div class="photo-strip photo-strip--services photo-strip--home">.*?</div>\n</section>',
        '<div class="photo-strip photo-strip--services photo-strip--home">\n'
        + build_home_strip(cfg["home_services"])
        + "\n  </div>\n</section>",
        idx,
        count=1,
        flags=re.S,
    )
    idx = re.sub(
        r'<section class="hero hero--sdc hero--rp">',
        f'<section class="hero hero--sdc hero--{cfg["hero_class"]}">',
        idx,
        count=1,
    )
    if cfg.get("hero_text_only"):
        idx = re.sub(
            r'<div class="hero-logo-wrap">.*?</div>\s*</div>',
            f'<h1 class="hero-title-text">{cfg["hero_title_html"]}</h1>\n      </div>',
            idx,
            count=1,
            flags=re.S,
        )
    index.write_text(idx, encoding="utf-8")

    services_html = dest / "services.html"
    svc = services_html.read_text(encoding="utf-8")
    svc = re.sub(
        r'<div class="service-list">.*?</div>\n</section>',
        '<div class="service-list">\n' + build_services_html(cfg["services"]) + "\n  </div>\n</section>",
        svc,
        count=1,
        flags=re.S,
    )
    services_html.write_text(svc, encoding="utf-8")

    if cfg.get("theme_css"):
        styles = dest / "styles.css"
        styles.write_text(styles.read_text(encoding="utf-8") + "\n\n" + cfg["theme_css"], encoding="utf-8")

    readme = dest / "README.md"
    readme.write_text(
        f"# {cfg['name']}\n\n"
        f"Шаблон: rp-detailing-tolyatti (без 3D-конфигуратора).\n\n"
        f"Локально: `python server.py` → http://127.0.0.1:{cfg['port']}/\n\n"
        f"2ГИС: {cfg['gis_firm_url']}\n",
        encoding="utf-8",
    )
    return dest


def main() -> None:
    cfg_path = Path(sys.argv[1])
    cfg = json.loads(cfg_path.read_text(encoding="utf-8"))
    dest = clone_site(cfg)
    print(dest)


if __name__ == "__main__":
    main()
