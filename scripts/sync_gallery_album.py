#!/usr/bin/env python3
"""Manifest + gallery-load.js с встроенным fallback для статического хостинга."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(Path(__file__).resolve().parent))
from generate_gallery_manifest import collect_files, photo_dir_from_gallery, write_manifest

GALLERY_LOAD_TEMPLATE = """(function () {
  var grid = document.getElementById('gallery-grid');
  if (!grid) return;
  var FALLBACK_FILES = {fallback_json};
  var manifestUrl = 'data/gallery-manifest.json';

  function render(files) {
    if (!files.length) return;
    grid.innerHTML = '';
    files.forEach(function (src) {
      var a = document.createElement('a');
      a.className = 'g g--media';
      a.href = src;
      a.setAttribute('data-lightbox', 'work');
      var img = document.createElement('img');
      img.src = src;
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      a.appendChild(img);
      grid.appendChild(a);
    });
  }

  function load(files) {
    render(files || []);
  }

  fetch(manifestUrl)
    .then(function (r) {
      if (!r.ok) throw new Error('manifest status');
      var ct = (r.headers.get('content-type') || '').toLowerCase();
      if (ct.indexOf('json') === -1) throw new Error('manifest not json');
      return r.json();
    })
    .then(function (data) {
      var files = data.files || [];
      if (files.length) load(files);
      else load(FALLBACK_FILES);
    })
    .catch(function () {
      load(FALLBACK_FILES);
    });
})();
"""


def write_gallery_load(site_dir: Path, files: list[str]) -> None:
    fallback_json = json.dumps(files, ensure_ascii=False, indent=2)
    body = GALLERY_LOAD_TEMPLATE.replace("{fallback_json}", fallback_json)
    (site_dir / "gallery-load.js").write_text(body + "\n", encoding="utf-8")


def sync_site(site_dir: Path) -> tuple[bool, str]:
    sub = photo_dir_from_gallery(site_dir)
    if not sub:
        return False, "no data-photo-dir"
    files = collect_files(site_dir, sub)
    write_manifest(site_dir)
    write_gallery_load(site_dir, files)
    return True, f"{len(files)} photos"


def main(argv: list[str]) -> int:
    names = argv[1:] if len(argv) > 1 else [
        "pervushin-avtokompleks-ekaterinburg",
        "pervyy-rul-masterskaya-novokuznetsk",
        "prime38-detailing-angarsk",
        "proffkar-avtotekhservis-tyumen",
        "klyaksa-tuning-noyabrsk",
        "mir-tonirovki-tobolsk",
        "imperiya-avtokompleks-chelyabinsk",
    ]
    for name in names:
        site = ROOT / name
        ok, msg = sync_site(site)
        print(f"{'ok' if ok else 'skip'} {name}: {msg}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
