import {
  mercedesGlbHref,
  prefetchMercedesGlb,
  scheduleMercedesGlbPrefetch,
} from './models-prefetch-mercedes.js?v=1';

const CORE_URL = new URL('./wrap-configurator.core.js?v=prices6', import.meta.url).href;
const MERCEDES_URL = mercedesGlbHref(import.meta.url);
const MAZDA_URL = new URL('./models/mazda.glb?v=5', import.meta.url).href;

let started = false;

window.__wrapGlb = window.__wrapGlb || {};

function loadMercedes() {
  return prefetchMercedesGlb(MERCEDES_URL);
}

scheduleMercedesGlbPrefetch(MERCEDES_URL);

export function startConfigurator() {
  if (started) return;
  started = true;
  Promise.all([loadMercedes(), import(CORE_URL)]).catch(() => {
    started = false;
    const status = document.getElementById('status');
    if (status) status.textContent = 'Не удалось загрузить конфигуратор';
  });
}

const wrap = document.getElementById('wrap');
if (wrap && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) startConfigurator();
    },
    { rootMargin: '800px 0px 800px 0px', threshold: 0.01 }
  );
  io.observe(wrap);
}

if (location.hash === '#wrap') startConfigurator();

function prefetchMazda() {
  if (window.__wrapGlb.mazda || window.__mzPrefetch) return;
  window.__mzPrefetch = 1;
  fetch(MAZDA_URL, { priority: 'low' })
    .then((r) => r.arrayBuffer())
    .then((buf) => {
      window.__wrapGlb.mazda = buf;
    })
    .catch(() => {});
}

document.querySelectorAll('[data-model="mazda"]').forEach((btn) => {
  btn.addEventListener('mouseenter', prefetchMazda, { once: true });
  btn.addEventListener('focus', prefetchMazda, { once: true });
  btn.addEventListener('click', prefetchMazda);
});
