"""Convert react-bits FlexCarousel.jsx to vanilla mountFlexCarousel for static site."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
jsx = (ROOT / "_fc_FlexCarousel.jsx").read_text(encoding="utf-8")

head_end = jsx.index("const Digits")
head = jsx[:head_end]
head = head.replace("'use client';\n\n", "")
head = head.replace("import { useEffect, useRef, useState } from 'react';\n", "")
head = head.replace("import './FlexCarousel.css';\n\n", "")
head = head.replace(
    "import { Renderer, Program, Mesh, Triangle, Plane, Texture, RenderTarget } from 'ogl';\n\n",
    "",
)

digits_js = """
function updateDigitsEl(el, value) {
  const padded = String(value).padStart(2, '0');
  el.replaceChildren();
  const wrap = document.createElement('span');
  wrap.className = 'flex-carousel__digits';
  for (let index = 0; index < padded.length; index++) {
    const digit = padded[index];
    const digitEl = document.createElement('span');
    digitEl.className = 'flex-carousel__digit';
    const reel = document.createElement('span');
    reel.className = 'flex-carousel__reel';
    reel.style.transform = `translateY(${-Number(digit) * 10}%)`;
    for (const n of '0123456789') {
      const s = document.createElement('span');
      s.textContent = n;
      reel.appendChild(s);
    }
    digitEl.appendChild(reel);
    wrap.appendChild(digitEl);
  }
  el.appendChild(wrap);
}
"""

marker = "  useEffect(() => {\n    const container = containerRef.current;"
start = jsx.index(marker)
end = jsx.index("  }, []);", start) + len("  }, []);")
engine = jsx[start:end]

engine = engine.replace(
    "  useEffect(() => {\n    const container = containerRef.current;\n    if (!container) return undefined;\n\n",
    "",
)
engine = engine.replace("engineRef.current", "engine")
engine = engine.replace("settingsRef.current", "settings")
engine = engine.replace("itemsRef.current", "list")
engine = engine.replace("callbacksRef.current", "callbacks")
engine = engine.replace("setActive(current)", "setActiveIndex(current)")
engine = engine.replace("setRevealed(true)", "setRevealedState(true)")
engine = engine.replace("setFocusOpen(true)", "setFocusOpenState(true)")
engine = engine.replace("setFocusOpen(false)", "setFocusOpenState(false)")
engine = engine.replace("    return () => {", "  const dispose = () => {")
engine = engine.replace("  }, []);", "")

mount = """
export function mountFlexCarousel(root, options = {}) {
  const {
    items = DEFAULT_ITEMS,
    preset = 'liquid',
    intro = 'rise',
    cardHeight = 0.5,
    gap = 12,
    radius = 0,
    fit = 'natural',
    lensWidth,
    lensHeight,
    tilt,
    roundness,
    bend,
    reach,
    curl,
    dispersion,
    liquid,
    followCursor,
    squeeze = 0.2,
    focusOnClick = true,
    autoplay = false,
    interval = 4,
    captions = true,
    captureWheel = true,
    onChange,
    onSelect,
    className = '',
    style
  } = options;

  const base = BEND_PRESETS[preset] || BEND_PRESETS.liquid;
  const pick = (value, key) => (value === undefined || value === null ? base[key] : value);

  const list = items && items.length ? items : DEFAULT_ITEMS;
  const callbacks = { onChange, onSelect };

  let settings = {
    intro,
    cardHeight,
    gap,
    radius,
    fit,
    lensWidth: pick(lensWidth, 'lensWidth'),
    lensHeight: pick(lensHeight, 'lensHeight'),
    tilt: pick(tilt, 'tilt'),
    roundness: pick(roundness, 'roundness'),
    bend: pick(bend, 'bend'),
    reach: pick(reach, 'reach'),
    curl: pick(curl, 'curl'),
    dispersion: pick(dispersion, 'dispersion'),
    liquid: pick(liquid, 'liquid'),
    followCursor: pick(followCursor, 'followCursor'),
    squeeze,
    focusOnClick,
    autoplay,
    interval,
    captureWheel
  };

  let captionActive = 0;
  let revealed = false;
  let focusOpen = false;
  let engine = null;

  root.className = `flex-carousel ${className}`.trim();
  Object.assign(root.style, style || {});
  root.style.setProperty('--flex-carousel-half', `${Math.min(Math.max(cardHeight, 0.05), 1) * 50}%`);
  root.setAttribute('role', 'region');
  root.setAttribute('aria-roledescription', 'carousel');
  root.setAttribute('aria-label', 'Image carousel');
  root.tabIndex = 0;

  const captionWrap = document.createElement('div');
  captionWrap.className = 'flex-carousel__caption';
  captionWrap.setAttribute('aria-hidden', 'true');
  captionWrap.hidden = true;

  const titleEl = document.createElement('span');
  titleEl.className = 'flex-carousel__title';

  const countEl = document.createElement('span');
  countEl.className = 'flex-carousel__count';
  const digitsHost = document.createElement('span');
  const slash = document.createElement('span');
  slash.className = 'flex-carousel__slash';
  slash.textContent = '/';
  const totalEl = document.createElement('span');
  totalEl.textContent = String(list.length).padStart(2, '0');
  countEl.append(digitsHost, slash, totalEl);

  captionWrap.append(titleEl, countEl);
  root.append(captionWrap);

  const liveEl = document.createElement('div');
  liveEl.className = 'flex-carousel__live';
  liveEl.setAttribute('aria-live', 'polite');
  liveEl.setAttribute('aria-atomic', 'true');
  root.append(liveEl);

  function renderCaption() {
    const current = list[captionActive] || list[0];
    if (!current) return;
    const label = current.title || current.alt || `Image ${captionActive + 1}`;
    liveEl.textContent = `${label}, ${captionActive + 1} of ${list.length}`;
    if (!captions || !revealed) {
      captionWrap.hidden = true;
      return;
    }
    captionWrap.hidden = false;
    titleEl.replaceChildren();
    titleEl.append(document.createTextNode(current.title || current.alt || ''));
    if (current.subtitle) {
      const sub = document.createElement('span');
      sub.className = 'flex-carousel__subtitle';
      sub.textContent = current.subtitle;
      titleEl.append(sub);
    }
    if (focusOpen) countEl.setAttribute('data-hidden', '');
    else countEl.removeAttribute('data-hidden');
    updateDigitsEl(digitsHost, captionActive + 1);
    totalEl.textContent = String(list.length).padStart(2, '0');
  }

  function setActiveIndex(i) {
    captionActive = i;
    renderCaption();
  }
  function setRevealedState(v) {
    revealed = v;
    renderCaption();
  }
  function setFocusOpenState(v) {
    focusOpen = v;
    renderCaption();
  }

  renderCaption();

  const container = root;

"""

footer = """
  return dispose;
}
"""

out = (
    "import { Renderer, Program, Mesh, Triangle, Plane, Texture, RenderTarget } from 'ogl';\n\n"
    + head
    + digits_js
    + mount
    + engine
    + footer
)

out_path = ROOT / "FlexCarousel.js"
out_path.write_text(out, encoding="utf-8")
print("Wrote", out_path, "bytes", out_path.stat().st_size)
