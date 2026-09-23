const CORE_URL = './wrap-configurator.core.js?v=fast3';
const DODGE_URL = './models/dodge.glb?v=3';
const MERCEDES_URL = './models/mercedes.glb?v=3';

let started = false;

window.__wrapGlb = window.__wrapGlb || {};
const dodgeFetch = fetch(DODGE_URL, { priority: 'high' })
  .then((r) => r.arrayBuffer())
  .then((buf) => {
    window.__wrapGlb.dodge = buf;
    return buf;
  })
  .catch(() => undefined);

export function startConfigurator() {
  if (started) return;
  started = true;
  Promise.all([dodgeFetch, import(CORE_URL)]).catch(() => {
    started = false;
    const status = document.getElementById('status');
    if (status) status.textContent = 'Не удалось загрузить конфигуратор';
  });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js?v=fast3').catch(() => {});
}

startConfigurator();

const wrap = document.getElementById('wrap');
if (wrap && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) startConfigurator();
    },
    { rootMargin: '1200px 0px 1200px 0px', threshold: 0.01 }
  );
  io.observe(wrap);
}

if (location.hash === '#wrap') startConfigurator();

document.querySelectorAll('a[href="#wrap"]').forEach((a) => {
  a.addEventListener('click', () => startConfigurator());
});

function prefetchMercedes() {
  if (window.__wrapGlb.mercedes || window.__mbPrefetch) return;
  window.__mbPrefetch = 1;
  fetch(MERCEDES_URL, { priority: 'low' })
    .then((r) => r.arrayBuffer())
    .then((buf) => {
      window.__wrapGlb.mercedes = buf;
    })
    .catch(() => {});
}

document.querySelectorAll('[data-model="mercedes"]').forEach((btn) => {
  btn.addEventListener('mouseenter', prefetchMercedes, { once: true });
  btn.addEventListener('focus', prefetchMercedes, { once: true });
  btn.addEventListener('click', prefetchMercedes);
});
