"""Build gallery manifest file lists: same pixel size grouped, natural filenames within."""

from __future__ import annotations

import struct
from pathlib import Path

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def _png_size(data: bytes) -> tuple[int, int]:
    w, h = struct.unpack(">II", data[16:24])
    return int(w), int(h)


def _jpeg_size(data: bytes) -> tuple[int, int] | None:
    i = 2
    n = len(data)
    while i < n - 8:
        if data[i] != 0xFF:
            i += 1
            continue
        marker = data[i + 1]
        if marker in (
            0xC0,
            0xC1,
            0xC2,
            0xC3,
            0xC5,
            0xC6,
            0xC7,
            0xC9,
            0xCA,
            0xCB,
            0xCD,
            0xCE,
            0xCF,
        ):
            h, w = struct.unpack(">HH", data[i + 5 : i + 9])
            return int(w), int(h)
        if marker in (0xD0, 0xD1, 0xD8, 0x01):
            i += 2
            continue
        length = struct.unpack(">H", data[i + 2 : i + 4])[0]
        i += 2 + length
    return None


def image_pixel_size(path: Path) -> tuple[int, int]:
    try:
        head = path.read_bytes()[: 512 * 1024]
    except OSError:
        return 0, 0
    if head[:8] == b"\x89PNG\r\n\x1a\n":
        return _png_size(head)
    if head[:2] == b"\xff\xd8":
        sz = _jpeg_size(head)
        if sz:
            return sz
    return 0, 0


def sorted_gallery_files(incoming_dir: Path, site_root: Path) -> list[str]:
    paths = [
        p
        for p in incoming_dir.iterdir()
        if p.is_file() and p.suffix.lower() in IMAGE_EXTS
    ]

    def sort_key(p: Path) -> tuple:
        w, h = image_pixel_size(p)
        if w <= 0 or h <= 0:
            return (1, 0, 0, p.name.lower())
        return (0, w, h, p.name.lower())

    paths.sort(key=sort_key)
    return [p.relative_to(site_root).as_posix() for p in paths]
