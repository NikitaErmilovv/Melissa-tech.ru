const CORE_URL = './wrap-configurator.core.js?v=fast2';
const DODGE_URL = './models/dodge.glb?v=2';
const MERCEDES_URL = './models/mercedes.glb?v=2';

let started = false;

function prefetch(url) {
  if (document.querySelector(`link[rel="prefetch"][href="${url}"]`)) return;
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.as = 'fetch';
  link.href = url;
  document.head.appendChild(link);
}

export function startConfigurator() {
  if (started) return;
  started = true;
  import(CORE_URL).catch(() => {
    started = false;
    const status = document.getElementById('status');
    if (status) status.textContent = 'Не удалось загрузить конфигуратор';
  });
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js?v=fast2').catch(() => {});
}

window.addEventListener('load', () => {
  prefetch(DODGE_URL);
  const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
  idle(() => {
    prefetch(MERCEDES_URL);
    startConfigurator();
  }, { timeout: 2000 });
});

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

document.querySelectorAll('a[href="#wrap"]').forEach((a) => {
  a.addEventListener('click', () => startConfigurator());
});

document.querySelectorAll('[data-model="mercedes"]').forEach((btn) => {
  btn.addEventListener('mouseenter', () => prefetch(MERCEDES_URL), { once: true });
  btn.addEventListener('focus', () => prefetch(MERCEDES_URL), { once: true });
});
