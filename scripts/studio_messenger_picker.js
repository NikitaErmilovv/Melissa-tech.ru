(function () {
  var cfg = window.STUDIO_MESSENGERS || {};
  var WA = String(cfg.wa || "").replace(/\D/g, "");
  var TG = String(cfg.tg || "").trim();
  var MAX_URL = String(cfg.max || "").trim();
  var defaultMsg =
    cfg.defaultMessage || "Здравствуйте! Хочу записаться. Подскажите, пожалуйста, по записи.";

  if (!WA && !TG && !MAX_URL) return;

  var openWrap = null;

  function closePick() {
    if (!openWrap) return;
    openWrap.classList.remove("is-open");
    var pick = openWrap.querySelector(".book-pick");
    if (pick) pick.hidden = true;
    openWrap = null;
  }

  function maxHref() {
    if (!MAX_URL) return "#";
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

  function tgHref(msg) {
    if (!TG) return "#";
    if (/^\+?\d+$/.test(TG.replace(/\s/g, ""))) {
      var digits = TG.replace(/\D/g, "");
      return "https://t.me/+" + digits + (msg ? "?text=" + msg : "");
    }
    return "https://t.me/" + TG.replace(/^@/, "") + (msg ? "?text=" + msg : "");
  }

  function messageFor(btn) {
    var custom = btn.getAttribute("data-book-message");
    if (custom) return custom;
    return defaultMsg;
  }

  function attachBook(btn) {
    if (!btn || btn.closest(".book-wrap")) return;
    var wrap = document.createElement("div");
    wrap.className = "book-wrap";
    btn.parentNode.insertBefore(wrap, btn);
    wrap.appendChild(btn);
    var pick = document.createElement("div");
    pick.className = "book-pick";
    pick.hidden = true;
    var parts = ['<span class="book-pick-label">Куда написать</span>'];
    if (WA) parts.push('<a data-ch="wa" target="_blank" rel="noopener noreferrer">WhatsApp</a>');
    if (TG) parts.push('<a data-ch="tg" target="_blank" rel="noopener noreferrer">Telegram</a>');
    if (MAX_URL) parts.push('<a data-ch="max" target="_blank" rel="noopener noreferrer">Max</a>');
    pick.innerHTML = parts.join("");
    wrap.appendChild(pick);

    if (btn.tagName === "A") btn.setAttribute("href", "#booking");

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      var msg = encodeURIComponent(messageFor(btn));
      if (WA) pick.querySelector('[data-ch="wa"]').href = "https://wa.me/" + WA + "?text=" + msg;
      if (TG) pick.querySelector('[data-ch="tg"]').href = tgHref(msg);
      if (MAX_URL) pick.querySelector('[data-ch="max"]').href = maxHref();
      if (openWrap && openWrap !== wrap) closePick();
      var willOpen = pick.hidden;
      pick.hidden = !willOpen;
      wrap.classList.toggle("is-open", willOpen);
      openWrap = willOpen ? wrap : null;
    });
  }

  document.querySelectorAll("a.button").forEach(function (btn) {
    var text = (btn.textContent || "").replace(/\s+/g, " ").trim();
    if (text === "ЗАПИСАТЬСЯ" || text === "ОНЛАЙН ЗАПИСЬ") attachBook(btn);
  });

  document.querySelectorAll('a[href*="max.ru"]').forEach(function (a) {
    if (!MAX_URL) return;
    a.setAttribute("href", maxHref());
    a.setAttribute("target", "_blank");
    a.setAttribute("rel", "noopener noreferrer");
  });

  document.addEventListener("click", function (e) {
    if (!openWrap) return;
    if (openWrap.contains(e.target)) return;
    closePick();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closePick();
  });
})();
