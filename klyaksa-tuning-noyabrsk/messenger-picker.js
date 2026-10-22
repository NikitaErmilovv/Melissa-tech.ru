(function () {
  var cfg = window.STUDIO_MESSENGERS || {};
  var MAX_URL = String(cfg.max || "").trim();

  if (!MAX_URL) return;

  function maxHref() {
    if (/Android/i.test(navigator.userAgent)) {
      return (
        "intent://" +
        MAX_URL.replace(/^https?:\/\//, "") +
        "#Intent;scheme=https;package=ru.oneme.app;S.browser_fallback_url=" +
        encodeURIComponent(MAX_URL) +
        ";end"
      );
    }
    return MAX_URL;
  }

  document.querySelectorAll('a[href*="max.ru"]').forEach(function (a) {
    a.setAttribute("href", maxHref());
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  });
})();
