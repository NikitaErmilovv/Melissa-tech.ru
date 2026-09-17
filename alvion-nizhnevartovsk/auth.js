(function () {
  var TOKEN_KEY = "alvion-token";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || "";
  }

  function setToken(token, remember) {
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
    if (!token) return;
    if (remember === false) sessionStorage.setItem(TOKEN_KEY, token);
    else localStorage.setItem(TOKEN_KEY, token);
  }

  function nextUrl(fallback) {
    var next = new URLSearchParams(location.search).get("next") || "";
    return /^[\w.-]+\.html$/.test(next) ? next : fallback;
  }

  function fieldError(form, name, message) {
    var box = form.querySelector('[data-error-for="' + name + '"]');
    var input = form.querySelector('[name="' + name + '"]');
    if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
    if (!box) return;
    box.textContent = message || "";
    box.hidden = !message;
  }

  function clearErrors(form) {
    form.querySelectorAll("[data-error-for]").forEach(function (box) {
      box.textContent = "";
      box.hidden = true;
    });
    form.querySelectorAll("[aria-invalid]").forEach(function (input) {
      input.setAttribute("aria-invalid", "false");
    });
    var err = form.querySelector(".form-message--error");
    if (err) err.hidden = true;
  }

  function showFormError(form, message) {
    var err = form.querySelector(".form-message--error");
    if (err) {
      err.textContent = message;
      err.hidden = false;
      err.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value || "").trim());
  }

  function passwordScore(value) {
    var password = String(value || "");
    if (password.length < 6) return password.length ? 1 : 0;
    var score = 1;
    if (password.length >= 10) score++;
    if (/[a-zа-я]/.test(password) && /[A-ZА-Я]/.test(password)) score++;
    if (/\d/.test(password) || /[^\w\s]/.test(password)) score++;
    return Math.min(score, 4);
  }

  function submitLock(form, locked, label) {
    var button = form.querySelector('button[type="submit"]');
    if (!button) return;
    if (locked) {
      button.dataset.idleLabel = button.dataset.idleLabel || button.textContent;
      button.textContent = label || button.textContent;
    } else if (button.dataset.idleLabel) {
      button.textContent = button.dataset.idleLabel;
    }
    button.disabled = locked;
  }

  function phoneDigits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function formatPhoneInput(value) {
    var digits = phoneDigits(value);
    if (!digits.length) return "";
    if (digits.charAt(0) === "8") digits = "7" + digits.slice(1);
    else if (digits.charAt(0) === "9") digits = "7" + digits;
    else if (digits.charAt(0) !== "7") digits = "7" + digits;
    digits = digits.slice(0, 11);
    var local = digits.slice(1);
    if (!local.length) return "+7";
    var out = "+7 " + local.slice(0, 3);
    if (local.length > 3) out += " " + local.slice(3, 6);
    if (local.length > 6) out += "-" + local.slice(6, 8);
    if (local.length > 8) out += "-" + local.slice(8, 10);
    return out;
  }

  function isValidRuPhone(value) {
    var digits = phoneDigits(value);
    return digits.length === 11 && digits.charAt(0) === "7";
  }

  function bindPhoneMask(input) {
    if (!input || input.dataset.maskBound === "1") return;
    input.dataset.maskBound = "1";
    input.addEventListener("input", function () {
      input.value = formatPhoneInput(input.value);
    });
  }

  function siteDir() {
    var path = location.pathname || "/";
    if (path.charAt(path.length - 1) === "/") return path;
    return path.replace(/[^/]+$/, "");
  }

  function isLocalHost() {
    return location.hostname === "127.0.0.1" || location.hostname === "localhost";
  }

  function apiUrl(path) {
    if (isLocalHost()) return path;
    return siteDir() + "api.php?path=" + encodeURIComponent(path);
  }

  function api(path, options) {
    options = options || {};
    var headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
    var token = getToken();
    if (token) headers.Authorization = "Bearer " + token;
    return fetch(apiUrl(path), {
      method: options.method || "GET",
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    }).then(function (res) {
      var type = (res.headers.get("content-type") || "").toLowerCase();
      if (type.indexOf("application/json") === -1) {
        throw new Error("Авторизация на этом хостинге не запущена: нужен PHP или локальный server.py.");
      }
      return res.json().catch(function () {
        return { error: "Ошибка ответа сервера" };
      }).then(function (data) {
        if (!res.ok) throw new Error(data.error || "Ошибка запроса");
        return data;
      });
    });
  }

  function updateNav(user) {
    var isAdmin = !!(user && user.role === "admin");
    var isClient = !!(user && !isAdmin);
    document.querySelectorAll("[data-auth-guest]").forEach(function (el) {
      el.hidden = !!user;
    });
    document.querySelectorAll("[data-auth-user]").forEach(function (el) {
      el.hidden = !user;
    });
    document.querySelectorAll("[data-auth-client]").forEach(function (el) {
      el.hidden = !isClient;
    });
    document.querySelectorAll("[data-auth-admin]").forEach(function (el) {
      el.hidden = !isAdmin;
    });
    document.querySelectorAll("[data-auth-logout]").forEach(function (el) {
      el.hidden = !user;
    });
    document.querySelectorAll("[data-auth-name]").forEach(function (el) {
      el.textContent = user ? user.name : "";
    });
  }

  function fillUserFields(user) {
    if (!user) return;
    var email = document.querySelector("[data-user-email]");
    var phone = document.querySelector("[data-user-phone]");
    var car = document.querySelector("[data-user-car]");
    if (email) email.textContent = user.email || "";
    if (phone) phone.textContent = user.phone || "Телефон не указан";
    if (car) car.textContent = user.car || "Автомобиль не указан";
    var profile = document.querySelector("[data-profile-form]");
    if (profile) {
      profile.querySelector('[name="name"]').value = user.name || "";
      profile.querySelector('[name="phone"]').value = user.phone || "";
      profile.querySelector('[name="email"]').value = user.email || "";
      profile.querySelector('[name="car"]').value = user.car || "";
    }
    var appCar = document.querySelector('[data-application-form] [name="car"]');
    if (appCar && !appCar.value && user.car) appCar.value = user.car;
  }

  function initTabs(root) {
    if (!root) return;
    var tabs = root.querySelectorAll("[data-dash-tab]");
    var panels = root.querySelectorAll("[data-dash-panel]");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var id = tab.getAttribute("data-dash-tab");
        tabs.forEach(function (item) { item.classList.toggle("is-active", item === tab); });
        panels.forEach(function (panel) {
          var on = panel.getAttribute("data-dash-panel") === id;
          panel.hidden = !on;
          panel.classList.toggle("is-active", on);
        });
      });
    });
  }

  function refreshNav() {
    if (!getToken()) {
      updateNav(null);
      return Promise.resolve(null);
    }
    return api("/api/auth/me")
      .then(function (data) {
        updateNav(data.user);
        fillUserFields(data.user);
        return data.user;
      })
      .catch(function () {
        setToken("");
        updateNav(null);
        return null;
      });
  }

  function logout() {
    var token = getToken();
    setToken("");
    updateNav(null);
    if (token) {
      api("/api/auth/logout", { method: "POST" }).catch(function () {});
    }
  }

  document.querySelectorAll("[data-auth-logout]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      logout();
      if (/cabinet\.html|admin\.html/.test(location.pathname)) {
        location.href = "login.html";
      }
    });
  });

  document.querySelectorAll("[data-phone-mask]").forEach(bindPhoneMask);

  document.querySelectorAll("[data-password-toggle]").forEach(function (button) {
    button.addEventListener("click", function () {
      var input = button.parentNode.querySelector("input");
      if (!input) return;
      var hidden = input.type === "password";
      input.type = hidden ? "text" : "password";
      button.textContent = hidden ? "СКРЫТЬ" : "ПОКАЗАТЬ";
    });
  });

  var registerForm = document.querySelector("[data-register-form]");
  if (registerForm) {
    var meter = registerForm.querySelector("[data-password-meter]");
    var passwordInput = registerForm.querySelector('[name="password"]');
    if (meter && passwordInput) {
      passwordInput.addEventListener("input", function () {
        meter.dataset.score = String(passwordScore(passwordInput.value));
      });
    }

    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors(registerForm);

      var name = registerForm.querySelector('[name="name"]').value.trim();
      var phone = registerForm.querySelector('[name="phone"]').value.trim();
      var email = registerForm.querySelector('[name="email"]').value.trim().toLowerCase();
      var password = registerForm.querySelector('[name="password"]').value;
      var confirm = registerForm.querySelector('[name="passwordConfirm"]').value;
      var consent = registerForm.querySelector('[name="consent"]');
      var valid = true;

      if (name.length < 2) { fieldError(registerForm, "name", "Укажите имя — минимум 2 символа."); valid = false; }
      if (!isValidRuPhone(phone)) { fieldError(registerForm, "phone", "Телефон в формате +7 900 000-00-00."); valid = false; }
      if (!isValidEmail(email)) { fieldError(registerForm, "email", "Укажите корректный email."); valid = false; }
      if (password.length < 6) { fieldError(registerForm, "password", "Пароль — минимум 6 символов."); valid = false; }
      if (password !== confirm) { fieldError(registerForm, "passwordConfirm", "Пароли не совпадают."); valid = false; }
      if (consent && !consent.checked) { showFormError(registerForm, "Нужно согласие на обработку персональных данных."); valid = false; }
      if (!valid) return;

      submitLock(registerForm, true, "СОЗДАЁМ…");
      api("/api/auth/register", {
        method: "POST",
        body: { name: name, phone: phone, email: email, password: password },
      })
        .then(function (data) {
          setToken(data.token, true);
          location.href = nextUrl("cabinet.html");
        })
        .catch(function (e) {
          submitLock(registerForm, false);
          showFormError(registerForm, e.message);
        });
    });
  }

  var loginForm = document.querySelector("[data-login-form]");
  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors(loginForm);

      var email = loginForm.querySelector('[name="email"]').value.trim().toLowerCase();
      var password = loginForm.querySelector('[name="password"]').value;
      var remember = loginForm.querySelector('[name="remember"]');
      var valid = true;

      if (!isValidEmail(email)) { fieldError(loginForm, "email", "Укажите корректный email."); valid = false; }
      if (password.length < 6) { fieldError(loginForm, "password", "Пароль — минимум 6 символов."); valid = false; }
      if (!valid) return;

      submitLock(loginForm, true, "ВХОДИМ…");
      api("/api/auth/login", {
        method: "POST",
        body: { email: email, password: password },
      })
        .then(function (data) {
          setToken(data.token, !remember || remember.checked);
          location.href = nextUrl(data.user.role === "admin" ? "admin.html" : "cabinet.html");
        })
        .catch(function (e) {
          submitLock(loginForm, false);
          showFormError(loginForm, e.message);
        });
    });
  }

  var appForm = document.querySelector("[data-application-form]");
  if (appForm) {
    appForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var err = appForm.querySelector(".form-message--error");
      var ok = appForm.querySelector(".form-message--success");
      if (err) err.hidden = true;
      if (ok) ok.hidden = true;
      var service = appForm.querySelector('[name="service"]');
      if (!service.value) {
        if (err) { err.textContent = "Выберите услугу."; err.hidden = false; }
        return;
      }
      api("/api/applications", {
        method: "POST",
        body: {
          service: service.value,
          serviceLabel: service.options[service.selectedIndex].text,
          date: appForm.querySelector('[name="date"]').value,
          time: appForm.querySelector('[name="time"]').value,
          car: appForm.querySelector('[name="car"]').value.trim(),
          comment: appForm.querySelector('[name="comment"]').value.trim(),
        },
      })
        .then(function () {
          var car = appForm.querySelector('[name="car"]').value.trim();
          appForm.reset();
          if (car) appForm.querySelector('[name="car"]').value = car;
          if (ok) ok.hidden = false;
          loadMyApplications();
        })
        .catch(function (e) {
          if (err) { err.textContent = e.message; err.hidden = false; }
        });
    });
  }

  var profileForm = document.querySelector("[data-profile-form]");
  if (profileForm) {
    profileForm.addEventListener("submit", function (event) {
      event.preventDefault();
      clearErrors(profileForm);
      var ok = profileForm.querySelector(".form-message--success");
      if (ok) ok.hidden = true;
      var name = profileForm.querySelector('[name="name"]').value.trim();
      var phone = profileForm.querySelector('[name="phone"]').value.trim();
      if (name.length < 2) { fieldError(profileForm, "name", "Укажите имя."); return; }
      if (!isValidRuPhone(phone)) { showFormError(profileForm, "Введите корректный телефон."); return; }
      submitLock(profileForm, true, "СОХРАНЯЕМ…");
      api("/api/auth/profile", {
        method: "PATCH",
        body: {
          name: name,
          phone: phone,
          car: profileForm.querySelector('[name="car"]').value.trim(),
        },
      })
        .then(function (data) {
          submitLock(profileForm, false);
          updateNav(data.user);
          fillUserFields(data.user);
          if (ok) ok.hidden = false;
        })
        .catch(function (e) {
          submitLock(profileForm, false);
          showFormError(profileForm, e.message);
        });
    });
  }

  function loadMyApplications() {
    var list = document.querySelector("[data-my-applications]");
    if (!list) return;
    api("/api/applications/mine")
      .then(function (data) {
        if (!data.items.length) {
          list.innerHTML = "<p class=\"auth-empty\">Заявок пока нет — оформите первую запись.</p>";
          return;
        }
        list.innerHTML = data.items.map(renderApplication).join("");
      })
      .catch(function () {
        list.innerHTML = "<p class=\"auth-empty\">Не удалось загрузить заявки.</p>";
      });
  }

  function renderApplication(item) {
    return (
      "<article class=\"auth-app-item\">" +
      "<div class=\"auth-app-head\"><span class=\"auth-app-status auth-app-status--" + item.status + "\">" + statusLabel(item.status) + "</span>" +
      "<time>" + formatDate(item.createdAt) + "</time></div>" +
      "<h4>" + escapeHtml(item.serviceLabel) + "</h4>" +
      "<p>" + escapeHtml(item.car || "Авто не указано") + "</p>" +
      "<p class=\"auth-app-meta\">" + escapeHtml(item.date || "Дата не указана") + (item.time ? " · " + escapeHtml(item.time) : "") + "</p>" +
      (item.comment ? "<p class=\"auth-app-comment\">" + escapeHtml(item.comment) + "</p>" : "") +
      "</article>"
    );
  }

  function statusLabel(status) {
    if (status === "done") return "Выполнена";
    if (status === "progress") return "В работе";
    if (status === "cancelled") return "Отменена";
    return "Новая";
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    } catch (e) {
      return iso;
    }
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function optionHtml(value, current) {
    return "<option value=\"" + value + "\"" + (current === value ? " selected" : "") + ">" + statusLabel(value) + "</option>";
  }

  var adminApps = [];
  var adminFilter = "all";

  function renderAdminApps() {
    var root = document.querySelector("[data-admin-applications]");
    if (!root) return;
    var items = adminApps.filter(function (item) {
      return adminFilter === "all" || item.status === adminFilter;
    });
    if (!items.length) {
      root.innerHTML = "<p class=\"auth-empty\">Заявок в этом статусе нет.</p>";
      return;
    }
    root.innerHTML = items.map(function (item) {
      return (
        "<article class=\"admin-app\">" +
        "<div><div class=\"admin-app-top\">" +
        "<span class=\"auth-app-status auth-app-status--" + item.status + "\">" + statusLabel(item.status) + "</span>" +
        "<time>" + formatDate(item.createdAt) + "</time></div>" +
        "<h4>" + escapeHtml(item.serviceLabel) + "</h4>" +
        "<p>" + escapeHtml(item.userName) + " · " + escapeHtml(item.userPhone) + "</p>" +
        "<p>" + escapeHtml(item.car || "Авто не указано") + " · " + escapeHtml(item.date || "дата не указана") + (item.time ? " · " + escapeHtml(item.time) : "") + "</p>" +
        (item.comment ? "<p class=\"auth-app-comment\">" + escapeHtml(item.comment) + "</p>" : "") +
        "</div><select data-app-status data-id=\"" + item.id + "\">" +
        optionHtml("new", item.status) + optionHtml("progress", item.status) +
        optionHtml("done", item.status) + optionHtml("cancelled", item.status) +
        "</select></article>"
      );
    }).join("");
    root.querySelectorAll("[data-app-status]").forEach(function (select) {
      select.addEventListener("change", function () {
        api("/api/admin/applications/" + select.dataset.id, {
          method: "PATCH",
          body: { status: select.value },
        }).then(function () {
          loadAdminData();
        }).catch(function (e) {
          alert(e.message);
        });
      });
    });
  }

  function loadAdminData() {
    Promise.all([
      api("/api/admin/stats"),
      api("/api/admin/applications"),
      api("/api/admin/users"),
    ]).then(function (results) {
      var stats = results[0];
      adminApps = results[1].items || [];
      ["new", "progress", "done", "clients"].forEach(function (key) {
        var el = document.querySelector("[data-stat=\"" + key + "\"]");
        if (el) el.textContent = stats[key] || 0;
      });
      renderAdminApps();
      var list = document.querySelector("[data-admin-users]");
      if (!list) return;
      if (!results[2].items.length) {
        list.innerHTML = "<p class=\"auth-empty\">Клиентов пока нет.</p>";
        return;
      }
      list.innerHTML = results[2].items.map(function (item) {
        return (
          "<article class=\"admin-client\"><div>" +
          "<b>" + escapeHtml(item.name) + "</b>" +
          "<span>" + escapeHtml(item.phone || "без телефона") + " · " + escapeHtml(item.email) + "</span>" +
          "<span>" + escapeHtml(item.car || "авто не указано") + "</span></div>" +
          "<span>" + item.applications + " заяв.</span></article>"
        );
      }).join("");
    }).catch(function (e) {
      var root = document.querySelector("[data-admin-applications]");
      if (root) root.innerHTML = "<p class=\"auth-empty\">" + escapeHtml(e.message) + "</p>";
    });
  }

  document.querySelectorAll("[data-admin-filters] [data-filter]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      adminFilter = btn.getAttribute("data-filter");
      document.querySelectorAll("[data-admin-filters] [data-filter]").forEach(function (item) {
        item.classList.toggle("is-active", item === btn);
      });
      renderAdminApps();
    });
  });

  initTabs(document.querySelector(".dash"));

  if (document.querySelector("[data-auth-nav]")) {
    refreshNav().then(function (user) {
      var onCabinet = /cabinet\.html/.test(location.pathname);
      var onAdmin = /admin\.html/.test(location.pathname);
      if (onCabinet) {
        if (!user) location.href = "login.html?next=cabinet.html";
        else if (user.role === "admin") location.href = "admin.html";
        else loadMyApplications();
      } else if (onAdmin) {
        if (!user || user.role !== "admin") location.href = "login.html?next=admin.html";
        else loadAdminData();
      }
    });
  }

  window.AlvionAuth = {
    getToken: getToken,
    refreshNav: refreshNav,
    logout: logout,
    formatPhoneInput: formatPhoneInput,
  };
})();
