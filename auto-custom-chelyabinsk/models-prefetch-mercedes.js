/** Ранний fetch mercedes.glb для конфигуратора (без Three.js). */
window.__wrapGlb = window.__wrapGlb || {};

export function mercedesGlbHref(baseModuleUrl) {
  return new URL('models/mercedes.glb?v=5', baseModuleUrl).href;
}

export function prefetchMercedesGlb(url) {
  if (window.__wrapGlb.mercedes) return Promise.resolve(window.__wrapGlb.mercedes);
  if (window.__wrapMercedesFetch) return window.__wrapMercedesFetch;
  window.__wrapMercedesFetch = fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error('mercedes glb');
      return r.arrayBuffer();
    })
    .then((buf) => {
      window.__wrapGlb.mercedes = buf;
      return buf;
    })
    .catch(() => undefined);
  return window.__wrapMercedesFetch;
}

/** После загрузки страницы (idle), не блокируя первый рендер. */
export function scheduleMercedesGlbPrefetch(url) {
  if (window.__wrapGlb.mercedes || window.__wrapMercedesFetch) return;
  const run = () => prefetchMercedesGlb(url);
  const idle = () => {
    if ('requestIdleCallback' in window) requestIdleCallback(run, { timeout: 2500 });
    else setTimeout(run, 150);
  };
  if (document.readyState === 'complete') idle();
  else window.addEventListener('load', idle, { once: true });
}
