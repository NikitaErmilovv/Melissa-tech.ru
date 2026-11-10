(function () {
  var cfg = window.TEPLO_SITE || {};
  var form = document.getElementById("teplo-order-form");
  if (!form) return;
  var status = document.getElementById("teplo-order-status");

  function calcSnapshot() {
    return window.TEPLO_CALC_RESULT || { volumeM3: 0, totalRub: 0, typeLabel: "" };
  }

  function buildMessage(payload) {
    var c = payload.calc || {};
    var lines = [
      "Заявка — " + (cfg.name || "Тепло Сибири"),
      "Имя: " + payload.name,
      "Телефон: " + payload.phone,
      "Продукция: " + (c.typeLabel || payload.product || "—"),
      "Объём: " + (c.volumeM3 || payload.volume || "—") + " м³",
      "Доставка: " + (c.km ? c.km + " км" : "самовывоз / уточнить"),
      "Ориентир: " + (c.totalRub ? Math.round(c.totalRub) + " ₽" : "по запросу"),
    ];
    if (payload.comment) lines.push("Комментарий: " + payload.comment);
    return lines.join("\n");
  }

  async function submit(payload) {
    var webhook = String(cfg.orderWebhook || "").trim();
    if (webhook) {
      var res = await fetch(webhook, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("server");
      return "sent";
    }
    var wa = String(cfg.wa || "").replace(/\D/g, "");
    if (!wa) throw new Error("phone");
    var text = encodeURIComponent(buildMessage(payload));
    window.open("https://wa.me/" + wa + "?text=" + text, "_blank", "noopener,noreferrer");
    return "wa";
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    var fd = new FormData(form);
    var name = String(fd.get("name") || "").trim();
    var phone = String(fd.get("phone") || "").trim();
    var comment = String(fd.get("comment") || "").trim();
    if (!name || phone.length < 10) {
      if (status) {
        status.textContent = "Укажите имя и телефон.";
        status.className = "teplo-form-status is-error";
      }
      return;
    }
    var payload = {
      name: name,
      phone: phone,
      comment: comment,
      calc: calcSnapshot(),
      createdAt: new Date().toISOString(),
    };
    try {
      var queue = JSON.parse(localStorage.getItem("teplo_orders_queue") || "[]");
      queue.push(payload);
      localStorage.setItem("teplo_orders_queue", JSON.stringify(queue.slice(-20)));
    } catch (_) {}
    if (status) {
      status.textContent = "Отправляем…";
      status.className = "teplo-form-status";
    }
    try {
      var mode = await submit(payload);
      if (status) {
        status.textContent =
          mode === "wa"
            ? "Открылся WhatsApp с текстом заявки — отправьте сообщение. Позже заявка пойдёт на номер автоматически."
            : "Заявка отправлена. Мы перезвоним.";
        status.className = "teplo-form-status is-ok";
      }
      form.reset();
    } catch (_) {
      if (status) {
        status.textContent = "Не удалось отправить. Позвоните: " + (cfg.phoneDisplay || cfg.phone);
        status.className = "teplo-form-status is-error";
      }
    }
  });

  document.addEventListener("teplo-calc-updated", function () {
    var snap = calcSnapshot();
    var hidden = form.querySelector('[name="volume"]');
    if (hidden) hidden.value = snap.volumeM3 || "";
  });
})();
