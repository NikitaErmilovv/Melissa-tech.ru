(function () {
  var contacts = window.STUDIO_CONTACTS || {};
  var phones = contacts.phones || [];
  if (!phones.length) return;

  function telHref(raw) {
    if (!raw) return "#";
    var n = String(raw).trim();
    if (n.indexOf("tel:") === 0) return n;
    return "tel:" + n.replace(/\s/g, "");
  }

  document.querySelectorAll("[data-phone-picker]").forEach(function (root) {
    var btn = root.querySelector(".phone-picker__toggle");
    var menu = root.querySelector(".phone-picker__menu");
    if (!btn || !menu) return;

    menu.innerHTML = phones
      .map(function (p) {
        var label = (p.label || "") + (p.name ? " · " + p.name : "");
        return (
          '<a class="phone-picker__item" href="' +
          telHref(p.tel) +
          '"><span class="phone-picker__label">' +
          label +
          '</span><span class="phone-picker__number">' +
          (p.display || p.tel || "") +
          "</span></a>"
        );
      })
      .join("");

    function close() {
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
    }

    function open() {
      menu.hidden = false;
      btn.setAttribute("aria-expanded", "true");
    }

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (menu.hidden) open();
      else close();
    });

    document.addEventListener(
      "click",
      function (e) {
        if (!root.contains(e.target)) close();
      },
      true
    );

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
    });
  });
})();
