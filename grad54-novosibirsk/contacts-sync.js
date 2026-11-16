(function () {
  var c = window.STUDIO_CONTACTS || {};
  if (!c.addressLine) return;

  var hours = c.hoursLine || "";
  var addr = c.addressLine;
  var firm = c.gisFirm || "";
  var lat = c.mapLat;
  var lon = c.mapLon;
  var phones = c.phones || [];
  var primary = phones[0] || {};

  function telHref(t) {
    return "tel:" + String(t || "").replace(/\s/g, "");
  }

  document.querySelectorAll(".address-map-muted").forEach(function (el, i) {
    if (i === 0 || el.textContent.indexOf("Новосибирск") >= 0 || el.textContent.indexOf("Вилюй") >= 0) {
      el.textContent = addr;
    }
  });
  document.querySelectorAll(".address-map-muted-sm, .footer-hours-block span, .contact-panel-card p").forEach(function (el) {
    if (hours && /запис|:\d{2}|Пн|Ежедневно/i.test(el.textContent)) {
      el.textContent = hours;
    }
  });

  if (lat && lon) {
    var mapC = lat + "," + lon;
    var desk =
      "https://static.maps.2gis.com/1.0?s=880x450&amp;c=" + mapC + "&amp;z=16&amp;pt=" + mapC + "~k:p";
    var mob =
      "https://static.maps.2gis.com/1.0?s=720x720&amp;c=" + mapC + "&amp;z=16&amp;pt=" + mapC + "~k:p";
    var alt = "Карта 2ГИС — " + addr;
    document.querySelectorAll(".address-map-img--desktop").forEach(function (img) {
      img.src = desk;
      img.alt = alt;
    });
    document.querySelectorAll(".address-map-img--mobile").forEach(function (img) {
      img.src = mob;
      img.alt = alt;
    });
    document.querySelectorAll(".address-map-frame").forEach(function (a) {
      if (firm) a.href = firm;
    });
  }

  if (primary.tel) {
    document.querySelectorAll('a.phone, a.contact-phone, a.footer-phone-inline, a.address-map-phone').forEach(
      function (a, idx) {
        if (idx > 0 && phones.length < 2) {
          var row = a.closest(".address-map-phones, .contact-panel-card");
          if (row && a.classList.contains("contact-phone")) {
            a.remove();
            return;
          }
        }
        a.setAttribute("href", telHref(primary.tel));
        a.textContent = primary.display || primary.tel;
      }
    );
  }

  if (window.STUDIO_MESSENGERS) {
    var m = window.STUDIO_MESSENGERS;
    if (m.wa) {
      document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
        a.href = "https://wa.me/" + String(m.wa).replace(/\D/g, "");
      });
    }
    if (m.tg) {
      var tg = String(m.tg).trim();
      if (tg.indexOf("http") !== 0) tg = "https://t.me/" + tg.replace(/^\+/, "");
      document.querySelectorAll('a[href*="t.me"]').forEach(function (a) {
        a.href = tg;
      });
    }
  }

  if (firm) {
    document.querySelectorAll('a[href*="2gis.ru/novosibirsk/firm/"]').forEach(function (a) {
      a.href = firm;
    });
  }
})();