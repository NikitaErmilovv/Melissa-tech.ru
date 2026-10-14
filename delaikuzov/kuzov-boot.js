const CORE_URL = new URL('./kuzov-configurator.core.js?v=paint5', import.meta.url).href;
const MERCEDES_URL = new URL('./models/mercedes.glb?v=5', import.meta.url).href;
const MAZDA_URL = new URL('./models/mazda.glb?v=5', import.meta.url).href;

let started = false;

window.__kuzovGlb = window.__kuzovGlb || {};

function loadMercedes() {
  if (window.__kuzovGlb.mercedes || window.__kuzovMercedesFetch) return window.__kuzovMercedesFetch;
  window.__kuzovMercedesFetch = fetch(MERCEDES_URL, { priority: 'low' })
    .then((r) => r.arrayBuffer())
    .then((buf) => {
      window.__kuzovGlb.mercedes = buf;
      return buf;
    })
    .catch(() => undefined);
  return window.__kuzovMercedesFetch;
}

export function startKuzovConfigurator() {
  if (started) return;
  started = true;
  Promise.all([loadMercedes(), import(CORE_URL)]).catch(() => {
    started = false;
    const status = document.getElementById('status');
    if (status) status.textContent = 'Не удалось загрузить конфигуратор';
  });
}

const kuzov = document.getElementById('kuzov');
if (kuzov && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) startKuzovConfigurator();
    },
    { rootMargin: '800px 0px 800px 0px', threshold: 0.01 }
  );
  io.observe(kuzov);
}

if (location.hash === '#kuzov') startKuzovConfigurator();
startKuzovConfigurator();

function prefetchMazda() {
  if (window.__kuzovGlb.mazda || window.__kuzovMzPrefetch) return;
  window.__kuzovMzPrefetch = 1;
  fetch(MAZDA_URL, { priority: 'low' })
    .then((r) => r.arrayBuffer())
    .then((buf) => {
      window.__kuzovGlb.mazda = buf;
    })
    .catch(() => {});
}

document.querySelectorAll('[data-model="mazda"]').forEach((btn) => {
  btn.addEventListener('mouseenter', prefetchMazda, { once: true });
  btn.addEventListener('focus', prefetchMazda, { once: true });
  btn.addEventListener('click', prefetchMazda);
});
