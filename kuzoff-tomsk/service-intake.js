(function () {
  var root = document.getElementById("svc-intake");
  if (!root) return;

  var cfg = window.STUDIO_MESSENGERS || {};
  var waPhone = String(cfg.wa || "79009211001").replace(/\D/g, "");
  var tgPhone = String(cfg.tg || "+79009211001").trim();
  var catalog = [];
  var active = null;

  var els = {
    title: root.querySelector("[data-intake-title]"),
    lead: root.querySelector("[data-intake-lead]"),
    img: root.querySelector("[data-intake-img]"),
    name: root.querySelector('[name="client_name"]'),
    phone: root.querySelector('[name="client_phone"]'),
    note: root.querySelector('[name="client_note"]'),
  };

  function byId(id) {
    for (var i = 0; i < catalog.length; i++) if (catalog[i].id === id) return catalog[i];
    return null;
  }

  function lockScroll(on) {
    document.documentElement.classList.toggle("svc-intake-open", on);
    document.body.classList.toggle("svc-intake-open", on);
  }

  function open(id) {
    var svc = byId(id);
    if (!svc) return;
    active = svc;
    els.title.textContent = svc.title;
    els.lead.textContent = svc.lead;
    els.img.src = svc.image;
    els.img.alt = svc.title;
  root.hidden = false;
    root.setAttribute("aria-hidden", "false");
    lockScroll(true);
    if (els.phone) els.phone.focus();
  }

  function close() {
    root.hidden = true;
    root.setAttribute("aria-hidden", "true");
    lockScroll(false);
    active = null;
  }

  function buildMessage() {
    if (!active) return "";
    var name = (els.name && els.name.value.trim()) || "—";
    var phone = (els.phone && els.phone.value.trim()) || "—";
    var note = (els.note && els.note.value.trim()) || "—";
    return (
      "Здравствуйте. Запись KuzOff: " +
      active.title +
      ".\nИмя: " +
      name +
      "\nТелефон: " +
      phone +
      "\nКомментарий: " +
      note
    );
  }

  function openMessenger(kind) {
    if (!els.phone || !els.phone.value.trim()) {
      els.phone.focus();
      els.phone.setCustomValidity("Укажите телефон");
      els.phone.reportValidity();
      return;
    }
    if (els.phone) els.phone.setCustomValidity("");

    var text = encodeURIComponent(buildMessage());
    var url;
    if (kind === "wa") {
      url = "https://wa.me/" + waPhone + "?text=" + text;
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }
    var plain = buildMessage();
    var tg = tgPhone.replace(/\s/g, "");
    if (!tg.startsWith("+")) tg = "+" + tg;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(plain).catch(function () {});
    }
    window.open("https://t.me/" + tg, "_blank", "noopener,noreferrer");
  }

  root.querySelectorAll("[data-intake-close]").forEach(function (node) {
    node.addEventListener("click", close);
  });

  var backdrop = root.querySelector(".svc-intake-backdrop");
  if (backdrop) backdrop.addEventListener("click", close);

  root.querySelectorAll('[data-intake-messenger]').forEach(function (btn) {
    btn.addEventListener("click", function () {
      openMessenger(btn.getAttribute("data-intake-messenger"));
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !root.hidden) close();
  });

  function bindButtons() {
    document.querySelectorAll("[data-service-intake]").forEach(function (btn) {
      if (btn.dataset.intakeBound) return;
      btn.dataset.intakeBound = "1";
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var id = btn.getAttribute("data-service-intake");
        if (!id) return;
        if (!catalog.length) {
          loadCatalog().then(function () {
            open(id);
          });
          return;
        }
        open(id);
      });
    });
  }

  function loadCatalog() {
    return fetch("data/services-intake.json", { cache: "no-store" })
      .then(function (r) {
        return r.json();
      })
      .then(function (json) {
        catalog = Array.isArray(json) ? json : [];
      })
      .catch(function () {
        catalog = [];
      });
  }

  loadCatalog().then(bindButtons);
})();