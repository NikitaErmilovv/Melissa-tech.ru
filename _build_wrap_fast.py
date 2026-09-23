#!/usr/bin/env python3
"""Extract GLB models, vendor Three.js, build wrap-configurator.core.js."""

from __future__ import annotations

import base64
import re
import shutil
import subprocess
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SITE = ROOT / "avtoblesk-novokuznetsk"
LOGIC = ROOT / "_tmp_configurator" / "_logic.js"
LEGACY = SITE / "wrap-configurator.js"
CORE = SITE / "wrap-configurator.core.js"
MODELS = SITE / "models"
VENDOR = SITE / "vendor" / "three"
THREE_VER = "0.160.0"
THREE_BASE = f"https://unpkg.com/three@{THREE_VER}"

VENDOR_FILES = [
    "build/three.module.js",
    "examples/jsm/controls/OrbitControls.js",
    "examples/jsm/loaders/GLTFLoader.js",
    "examples/jsm/utils/BufferGeometryUtils.js",
    "examples/jsm/environments/RoomEnvironment.js",
    "examples/jsm/libs/meshopt_decoder.module.js",
]

IMPORTS = """import * as THREE from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';

"""


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": "Melissa-wrap-build/1.0"})
    with urllib.request.urlopen(req, timeout=120) as resp:
        return resp.read()


def ensure_models() -> None:
    MODELS.mkdir(parents=True, exist_ok=True)
    missing = [n for n in ("dodge", "mercedes") if not (MODELS / f"{n}.glb").is_file()]
    if not missing:
        return
    if not LEGACY.is_file() or LEGACY.stat().st_size < 1_000_000:
        raise SystemExit("GLB models missing and legacy wrap-configurator.js unavailable.")
    text = LEGACY.read_text(encoding="utf-8", errors="ignore")
    for name in missing:
        m = re.search(rf"{name}:'([^']+)'", text)
        if not m:
            raise SystemExit(f"Could not find embedded model: {name}")
        data = base64.b64decode(m.group(1))
        out = MODELS / f"{name}.glb"
        out.write_bytes(data)
        print(f"Wrote {out.name} ({len(data) // 1024 // 1024} MiB)")


def ensure_vendor() -> None:
    for rel in VENDOR_FILES:
        dest = VENDOR / rel.replace("/", "\\") if False else VENDOR / Path(rel)
        dest.parent.mkdir(parents=True, exist_ok=True)
        if dest.is_file() and dest.stat().st_size > 100:
            continue
        url = f"{THREE_BASE}/{rel}"
        print(f"Downloading {rel}...")
        dest.write_bytes(fetch(url))


def run_gltf(cmd: str) -> None:
    subprocess.run(cmd, check=True, cwd=ROOT, shell=True)


def compress_models() -> None:
    source_dir = MODELS / "source"
    source_dir.mkdir(parents=True, exist_ok=True)
    specs = (
        ("dodge", 1.0),
        ("mercedes", 0.68),
    )
    for name, simplify_ratio in specs:
        published = MODELS / f"{name}.glb"
        source = source_dir / f"{name}.glb"
        if not source.is_file():
            if not published.is_file():
                continue
            shutil.copy2(published, source)
            print(f"Archived source {name}.glb")
        raw_size = source.stat().st_size
        stage = MODELS / f"{name}.stage.glb"
        tmp = MODELS / f"{name}.compressed.glb"
        print(f"Compressing {name}.glb (meshopt)...")
        if simplify_ratio < 1.0:
            run_gltf(
                f'npx --yes @gltf-transform/cli simplify "{source}" "{stage}" --ratio {simplify_ratio}'
            )
            input_path = stage
        else:
            input_path = source
        run_gltf(
            f'npx --yes @gltf-transform/cli optimize "{input_path}" "{tmp}" --compress meshopt'
        )
        shutil.copy2(tmp, published)
        stage.unlink(missing_ok=True)
        tmp.unlink(missing_ok=True)
        new_size = published.stat().st_size
        pct = 100 - int(new_size * 100 / raw_size)
        print(f"{name}.glb {raw_size // 1024 // 1024} MiB -> {new_size // 1024 // 1024} MiB (-{pct}%)")


def build_core() -> None:
    body = LOGIC.read_text(encoding="utf-8").strip()
    if "MODEL_DATA" in body:
        raise SystemExit("_logic.js still references MODEL_DATA")
    CORE.write_text(IMPORTS + body + "\n", encoding="utf-8")
    print(f"Wrote {CORE.name} ({CORE.stat().st_size // 1024} KiB)")


def main() -> None:
    ensure_models()
    compress_models()
    ensure_vendor()
    build_core()
    print("Wrap fast build OK")


if __name__ == "__main__":
    main()
