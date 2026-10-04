const CORE_URL = './wrap-configurator.core.js?v=mb28';
const MERCEDES_URL = './models/mercedes.glb?v=5';
const MAZDA_URL = './models/mazda.glb?v=5';

let started = false;

window.__wrapGlb = window.__wrapGlb || {};
const mercedesFetch = fetch(MERCEDES_URL, { priority: 'high' })
  .then((r) => r.arrayBuffer())
  .then((buf) => {
    window.__wrapGlb.mercedes = buf;
    return buf;
  })
  .catch(() => undefined);

export function startConfigurator() {
  if (started) return;
  started = true;
  Promise.all([mercedesFetch, import(CORE_URL)]).catch(() => {
    started = false;
    const status = document.getElementById('status');
    if (status) status.textContent = 'Не удалось загрузить конфигуратор';
  });
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
