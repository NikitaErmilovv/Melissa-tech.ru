(function () {
  var s = window.TEPLO_SITE || {};
  window.STUDIO_MESSENGERS = {
    wa: String(s.wa || "").replace(/\D/g, ""),
    tg: s.tg || s.phone || "",
    max: "",
    defaultMessage: s.defaultMessage || "Здравствуйте! Заказ — Тепло Сибири.",
  };
})();
