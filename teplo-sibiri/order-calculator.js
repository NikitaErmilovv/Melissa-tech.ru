(function () {
  var cfg = window.TEPLO_SITE || {};
  var prices = cfg.prices || {};

  var root = document.getElementById("teplo-calc");
  if (!root) return;

  var typeEl = root.querySelector('[data-calc="type"]');
  var volEl = root.querySelector('[data-calc="volume"]');
  var kmEl = root.querySelector('[data-calc="km"]');
  var outWood = root.querySelector('[data-calc="out-wood"]');
  var outDel = root.querySelector('[data-calc="out-delivery"]');
  var outTotal = root.querySelector('[data-calc="out-total"]');
  var hint = root.querySelector('[data-calc="hint"]');

  function num(el) {
    var v = parseFloat(String(el && el.value).replace(",", "."));
    return Number.isFinite(v) ? v : 0;
  }

  function formatRub(n) {
    return new Intl.NumberFormat("ru-RU").format(Math.round(n)) + " ₽";
  }

  function recalc() {
    var type = typeEl ? typeEl.value : "kolotye";
    var vol = Math.max(0, num(volEl));
    var km = Math.max(0, num(kmEl));
    var priceM3 = prices[type] || prices.kolotye || 0;
    var wood = vol * priceM3;
    var delivery = 0;
    if (vol > 0 && km > 0) {
      if (vol >= (cfg.freeDeliveryFromM3 || 99)) {
        delivery = 0;
      } else {
        delivery = Math.max(cfg.deliveryMin || 0, km * (cfg.deliveryPerKm || 0));
      }
    }
    var total = wood + delivery;
    if (outWood) outWood.textContent = vol > 0 ? formatRub(wood) : "—";
    if (outDel) outDel.textContent = vol > 0 && km > 0 ? (delivery ? formatRub(delivery) : "Бесплатно") : "—";
    if (outTotal) outTotal.textContent = vol > 0 ? formatRub(total) : "—";
    if (hint) {
      var min = cfg.minOrderM3 || 0;
      hint.textContent =
        vol > 0 && vol < min
          ? "Минимальный заказ от " + min + " м³ — итог ориентировочный, менеджер уточнит."
          : "Сумма ориентировочная: влажность, порода и дальность влияют на финальную цену.";
    }
    window.TEPLO_CALC_RESULT = {
      type: type,
      typeLabel: typeEl && typeEl.selectedOptions[0] ? typeEl.selectedOptions[0].textContent.trim() : "",
      volumeM3: vol,
      km: km,
      woodRub: wood,
      deliveryRub: delivery,
      totalRub: total,
    };
    document.dispatchEvent(new CustomEvent("teplo-calc-updated", { detail: window.TEPLO_CALC_RESULT }));
  }

  [typeEl, volEl, kmEl].forEach(function (el) {
    if (el) {
      el.addEventListener("input", recalc);
      el.addEventListener("change", recalc);
    }
  });
  recalc();
})();
