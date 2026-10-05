(function () {
  document.querySelectorAll('[data-cms-nav="services"], [data-cms-panel="services"]').forEach((el) => el.remove());
  const TOKEN_KEY = 'avtoblesk_cms_token';
  const ALBUM_PAGE = 'album.html';
  const PAGES = [
    { id: 'index.html', label: 'Сайт (одна главная)' },
    { id: ALBUM_PAGE, label: 'Альбом работ' },
    { id: 'training.html', label: 'Обучение' },
  ];
  const META_PAGES = [
    { id: 'index.html', label: 'Главная', title: 'АвтоБлеск — детейлинг' },
    { id: 'services.html', label: 'Услуги', title: 'Услуги — АвтоБлеск' },
    { id: 'about.html', label: 'О студии', title: 'О студии — АвтоБлеск' },
    { id: 'contact.html', label: 'Контакты', title: 'Контакты — АвтоБлеск' },
    { id: 'album.html', label: 'Альбом работ', title: 'Альбом работ — АвтоБлеск' },
    { id: 'training.html', label: 'Обучение', title: 'Обучение — АвтоБлеск' },
    { id: 'legal.html', label: 'Правовая информация', title: 'Правовая информация — АвтоБлеск' },
  ];

  let store = {};
  let albums = [];
  let services = [];
  let wrapZones = { order: [], zones: {}, models: {}, colors: [], finishes: [], effects: [] };
  let wrapCarTab = 'mercedes';
  let wrapSaveTimer = null;
  const STOCK_WRAP_COLORS = [
    { hex: '#0b0d10', name: 'Obsidian Black' },
    { hex: '#f5f5f2', name: 'Pearl White' },
    { hex: '#d71935', name: 'Racing Red' },
    { hex: '#1246b8', name: 'Sapphire Blue' },
    { hex: '#0b6f46', name: 'Emerald Green' },
    { hex: '#bfc4cc', name: 'Silver' },
    { hex: '#d39b16', name: 'Champagne Gold' },
    { hex: '#6d2bbd', name: 'Electric Purple' },
    { hex: '#ff6b16', name: 'Burnt Orange' },
    { hex: '#e64f89', name: 'Candy Pink' },
    { hex: '#11a9b0', name: 'Turquoise' },
    { hex: '#63351f', name: 'Cocoa Brown' },
  ];
  const STOCK_WRAP_FINISHES = [
    { id: 'gloss', name: 'Глубокий глянец' },
    { id: 'satin', name: 'Сатин' },
    { id: 'matte', name: 'Матовая' },
  ];
  const STOCK_WRAP_EFFECTS = [
    { id: 'solid', name: 'Solid' },
    { id: 'metal', name: 'Metallic' },
    { id: 'pearl', name: 'Pearl' },
  ];

  function token() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  function $(sel) {
    return document.querySelector(sel);
  }

  function showLogin(show) {
    const login = document.getElementById('cms-login');
    const app = document.getElementById('cms-app');
    if (login) {
      login.hidden = !show;
      login.classList.toggle('is-off', !show);
      login.style.setProperty('display', show ? 'grid' : 'none', 'important');
    }
    if (app) {
      app.hidden = show;
      app.style.display = show ? 'none' : '';
    }
  }

  function adminToast(msg) {
    const el = document.getElementById('cms-school-toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(adminToast._t);
    adminToast._t = setTimeout(() => el.classList.remove('is-visible'), 2200);
  }

  let wrapSaveGen = 0;
  let wrapSaveChain = Promise.resolve();

  function enqueueWrapSave() {
    const gen = ++wrapSaveGen;
    ensureWrapConfig();
    wrapZones.zones = wrapZones.models.mercedes.zones;
    const payload = JSON.parse(JSON.stringify(wrapZones));
    const run = wrapSaveChain.then(async () => {
      if (gen !== wrapSaveGen) return { ok: true, skipped: true };
      const res = await window.AvtoCmsApi.saveWrapZones(payload, token());
      if (!res || !res.ok) throw new Error('save');
      return res;
    });
    wrapSaveChain = run.then(
      () => {},
      () => {}
    );
    return run;
  }

  function scheduleWrapSave() {
    clearTimeout(wrapSaveTimer);
    wrapSaveTimer = setTimeout(() => {
      wrapSaveTimer = null;
      enqueueWrapSave()
        .then((res) => {
          if (res && res.skipped) return;
          adminToast('Палитра сохранена');
        })
        .catch(() => adminToast('Не удалось сохранить палитру'));
    }, 550);
  }

  async function loadStore() {
    const url = window.AvtoCmsApi.contentJsonUrl();
    const res = await fetch(url);
    store = res.ok ? await res.json() : {};
    const gal = store[ALBUM_PAGE] || store['gallery.html'] || {};
    const lists = gal.lists || {};
    if (lists.albums) albums = JSON.parse(JSON.stringify(lists.albums));
    else if (lists.portfolio && window.AvtoCmsAlbums) albums = window.AvtoCmsAlbums.migratePortfolio(lists.portfolio);
    else albums = [];

    if (!albums.length && window.AvtoCmsAlbums) {
      const htmlRes = await fetch('../' + ALBUM_PAGE + '?_=' + Date.now());
      if (htmlRes.ok) {
        const doc = new DOMParser().parseFromString(await htmlRes.text(), 'text/html');
        const parsed = window.AvtoCmsAlbums.collectAlbums(doc.querySelector('[data-cms-albums="portfolio"]'));
        if (parsed?.length) albums = parsed;
      } else {
        const legacy = await fetch('../gallery.html?_=' + Date.now());
        if (legacy.ok) {
          const doc = new DOMParser().parseFromString(await legacy.text(), 'text/html');
          const parsed = window.AvtoCmsAlbums.collectAlbums(doc.querySelector('[data-cms-albums="portfolio"]'));
          if (parsed?.length) albums = parsed;
        }
      }
    }

    const svc = store['index.html'] || store['services.html'] || {};
    services = svc.lists?.services ? JSON.parse(JSON.stringify(svc.lists.services)) : [];

    if (!services.length) {
      const htmlRes = await fetch('../index.html?_=' + Date.now());
      if (htmlRes.ok) {
        const doc = new DOMParser().parseFromString(await htmlRes.text(), 'text/html');
        const rows = doc.querySelectorAll('[data-cms-list="services"] .service-row');
        services = Array.from(rows).map((row) => ({
          title: row.querySelector('h3')?.textContent.trim() || '',
          text: row.querySelector('p')?.textContent.trim() || '',
          cost: row.querySelector('.cost')?.textContent.trim() || '',
        }));
      }
    }
  }

  function escapeAttr(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  async function savePageMeta(page, meta) {
    const prev = store[page] || { text: {}, images: {}, backgrounds: {} };
    const res = await window.AvtoCmsApi.save({ page, meta }, token());
    if (!res.ok) throw new Error('save');
    store[page] = Object.assign({}, prev, { meta });
  }

  async function savePageLists(page, lists) {
    const prev = store[page] || { text: {}, images: {}, backgrounds: {} };
    const payload = {
      page,
      text: prev.text || {},
      images: prev.images || {},
      backgrounds: prev.backgrounds || {},
      lists,
      hiddenBlocks: prev.hiddenBlocks || [],
    };
    const res = await window.AvtoCmsApi.save(payload, token());
    if (!res.ok) throw new Error('save');
    store[page] = Object.assign({}, prev, { lists });
  }

  function renderAlbumsAdmin() {
    const root = $('#cms-albums-editor');
    if (!root) return;
    const A = window.AvtoCmsAlbums;
    root.innerHTML = albums
      .map((album, ai) => {
        const items = (album.items || [])
          .map((it, ii) => {
            const thumb = it.type === 'video' ? '▶ video' : it.url.split('/').pop();
            return (
              '<div class="cms-admin-media" data-ai="' +
              ai +
              '" data-ii="' +
              ii +
              '">' +
              '<span class="cms-admin-media-label">' +
              A.escapeHtml(thumb) +
              '</span>' +
              '<button type="button" class="crm-link cms-admin-replace">Заменить</button>' +
              '<button type="button" class="crm-link cms-admin-del-media">×</button>' +
              '</div>'
            );
          })
          .join('');
        return (
          '<div class="cms-admin-album" data-ai="' +
          ai +
          '">' +
          '<div class="cms-admin-album-head">' +
          '<label>№ <input class="crm-input cms-admin-kicker" value="' +
          A.escapeAttr(album.kicker || '') +
          '"></label>' +
          '<label>Название <input class="crm-input cms-admin-title" value="' +
          A.escapeAttr(album.title || '') +
          '"></label>' +
          '<label>Описание<textarea class="crm-input cms-admin-desc" rows="2">' +
          A.escapeHtml(album.description || album.desc || '') +
          '</textarea></label>' +
          '<button type="button" class="crm-link cms-admin-del-album">Удалить альбом</button>' +
          '</div>' +
          '<div class="cms-admin-media-grid">' +
          items +
          '</div>' +
          '<button type="button" class="crm-btn cms-admin-add-photo">+ фото / видео</button>' +
          '</div>'
        );
      })
      .join('');

    root.querySelectorAll('.cms-admin-kicker').forEach((inp) => {
      inp.oninput = () => {
        albums[+inp.closest('[data-ai]').dataset.ai].kicker = inp.value;
      };
    });
    root.querySelectorAll('.cms-admin-title').forEach((inp) => {
      inp.oninput = () => {
        albums[+inp.closest('[data-ai]').dataset.ai].title = inp.value;
      };
    });
    root.querySelectorAll('.cms-admin-desc').forEach((inp) => {
      inp.oninput = () => {
        albums[+inp.closest('[data-ai]').dataset.ai].description = inp.value;
      };
    });
    root.querySelectorAll('.cms-admin-del-album').forEach((btn) => {
      btn.onclick = () => {
        const ai = +btn.closest('[data-ai]').dataset.ai;
        if (confirm('Удалить альбом?')) {
          albums.splice(ai, 1);
          renderAlbumsAdmin();
        }
      };
    });
    root.querySelectorAll('.cms-admin-del-media').forEach((btn) => {
      btn.onclick = () => {
        const box = btn.closest('.cms-admin-media');
        albums[+box.dataset.ai].items.splice(+box.dataset.ii, 1);
        renderAlbumsAdmin();
      };
    });
    root.querySelectorAll('.cms-admin-add-photo').forEach((btn) => {
      btn.onclick = () => uploadToAlbum(+btn.closest('[data-ai]').dataset.ai);
    });
    root.querySelectorAll('.cms-admin-replace').forEach((btn) => {
      btn.onclick = () => {
        const box = btn.closest('.cms-admin-media');
        replaceMedia(+box.dataset.ai, +box.dataset.ii);
      };
    });
  }

  function pickFile(cb) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,video/mp4,video/webm';
    input.onchange = () => {
      if (input.files?.[0]) cb(input.files[0]);
    };
    input.click();
  }

  async function uploadFile(file) {
    const res = await window.AvtoCmsApi.upload(file, token());
    if (!res.ok) throw new Error('upload');
    return (await res.json()).url;
  }

  async function uploadToAlbum(ai) {
    pickFile(async (file) => {
      try {
        const url = await uploadFile(file);
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        albums[ai].items.push({ type, url });
        renderAlbumsAdmin();
      } catch (_) {
        alert('Не удалось загрузить файл');
      }
    });
  }

  async function replaceMedia(ai, ii) {
    pickFile(async (file) => {
      try {
        const url = await uploadFile(file);
        albums[ai].items[ii] = {
          type: file.type.startsWith('video/') ? 'video' : 'image',
          url,
        };
        renderAlbumsAdmin();
      } catch (_) {
        alert('Не удалось загрузить файл');
      }
    });
  }

  function renderServicesAdmin() {
    const root = $('#cms-services-editor');
    if (!root) return;
    const A = window.AvtoCmsAlbums;
    root.innerHTML = services
      .map(
        (row, i) =>
          '<div class="cms-admin-service" data-si="' +
          i +
          '">' +
          '<label>Услуга<input class="crm-input cms-svc-title" value="' +
          A.escapeAttr(row.title) +
          '"></label>' +
          '<label>Описание<textarea class="crm-input cms-svc-text" rows="2">' +
          A.escapeHtml(row.text) +
          '</textarea></label>' +
          '<label>Цена<input class="crm-input cms-svc-cost" value="' +
          A.escapeAttr(row.cost) +
          '"></label>' +
          '<button type="button" class="crm-link cms-svc-del">Удалить</button>' +
          '</div>'
      )
      .join('');

    root.querySelectorAll('.cms-svc-title').forEach((el) => {
      el.oninput = () => {
        services[+el.closest('[data-si]').dataset.si].title = el.value;
      };
    });
    root.querySelectorAll('.cms-svc-text').forEach((el) => {
      el.oninput = () => {
        services[+el.closest('[data-si]').dataset.si].text = el.value;
      };
    });
    root.querySelectorAll('.cms-svc-cost').forEach((el) => {
      el.oninput = () => {
        services[+el.closest('[data-si]').dataset.si].cost = el.value;
      };
    });
    root.querySelectorAll('.cms-svc-del').forEach((btn) => {
      btn.onclick = () => {
        services.splice(+btn.closest('[data-si]').dataset.si, 1);
        renderServicesAdmin();
      };
    });
  }

  async function loadWrapZones() {
    const res = await fetch(window.AvtoCmsApi.wrapZonesUrl());
    wrapZones = res.ok ? await res.json() : { order: [], zones: {} };
    ensureWrapConfig();
  }

  function cloneJson(x) {
    return JSON.parse(JSON.stringify(x || {}));
  }

  function ensureWrapConfig() {
    if (!wrapZones || typeof wrapZones !== 'object') wrapZones = {};
    const base = wrapZones.zones && typeof wrapZones.zones === 'object' ? wrapZones.zones : {};
    wrapZones.order = wrapZones.order?.length ? wrapZones.order : Object.keys(base);
    wrapZones.models = wrapZones.models || {};
    if (!wrapZones.models.mercedes || !wrapZones.models.mercedes.zones) {
      wrapZones.models.mercedes = { label: 'Легковой автомобиль', zones: cloneJson(base) };
    }
    if (!wrapZones.models.mazda || !wrapZones.models.mazda.zones) {
      wrapZones.models.mazda = { label: 'Кроссовер', zones: cloneJson(base) };
    }
    wrapZones.models.mercedes.label = wrapZones.models.mercedes.label || 'Легковой автомобиль';
    wrapZones.models.mazda.label = wrapZones.models.mazda.label || 'Кроссовер';
    wrapZones.zones = wrapZones.models.mercedes.zones;
    if (!Array.isArray(wrapZones.colors) || !wrapZones.colors.length) {
      wrapZones.colors = STOCK_WRAP_COLORS.map((c) => ({ hex: c.hex, name: c.name, hidden: false }));
    } else {
      wrapZones.colors = wrapZones.colors.map((c, i) => {
        const stock = STOCK_WRAP_COLORS[i] || STOCK_WRAP_COLORS[0];
        return {
          hex: c.hex || stock.hex,
          name: c.name || stock.name,
          hidden: !!c.hidden,
        };
      });
    }
    wrapZones.finishes = STOCK_WRAP_FINISHES.map((s) => {
      const o = (wrapZones.finishes || []).find((x) => x.id === s.id) || {};
      return { id: s.id, name: o.name || s.name, hidden: !!o.hidden };
    });
    wrapZones.effects = STOCK_WRAP_EFFECTS.map((s) => {
      const o = (wrapZones.effects || []).find((x) => x.id === s.id) || {};
      return { id: s.id, name: o.name || s.name, hidden: !!o.hidden };
    });
  }

  function normHex(v) {
    let s = String(v || '').trim();
    if (!s.startsWith('#')) s = '#' + s;
    if (/^#[0-9a-fA-F]{3}$/.test(s)) s = '#' + s[1] + s[1] + s[2] + s[2] + s[3] + s[3];
    if (!/^#[0-9a-fA-F]{6}$/.test(s)) return '';
    return s.toLowerCase();
  }

  function renderWrapZonesAdmin() {
    const root = $('#cms-wrap-editor');
    if (!root) return;
    ensureWrapConfig();
    const A = window.AvtoCmsAlbums;
    const order = wrapZones.order || [];
    const zones = wrapZones.models[wrapCarTab].zones || {};
    const rows = order
      .map((id) => {
        const z = zones[id] || { name: '', price: 0 };
        return (
          '<tr data-zone-id="' +
          A.escapeAttr(id) +
          '">' +
          '<td><code>' +
          A.escapeHtml(id) +
          '</code></td>' +
          '<td><input class="crm-input cms-wrap-name" value="' +
          A.escapeAttr(z.name || '') +
          '"></td>' +
          '<td><input class="crm-input cms-wrap-price" type="number" min="0" step="100" value="' +
          A.escapeAttr(String(z.price ?? '')) +
          '"></td>' +
          '</tr>'
        );
      })
      .join('');
    const colors = wrapZones.colors
      .map((c, i) => {
        const hex = c.hex || '#000000';
        return (
          '<div class="cms-wrap-color" data-ci="' +
          i +
          '">' +
          '<div class="cms-wrap-color-row">' +
          '<input type="color" class="cms-wrap-hex-pick" value="' +
          A.escapeAttr(hex) +
          '">' +
          '<input class="crm-input cms-wrap-hex" value="' +
          A.escapeAttr(hex) +
          '" maxlength="7" placeholder="#rrggbb">' +
          '</div>' +
          '<input class="crm-input cms-wrap-cname" value="' +
          A.escapeAttr(c.name || '') +
          '" placeholder="Название">' +
          '<label class="cms-wrap-check"><input type="checkbox" class="cms-wrap-cshow"' +
          (c.hidden ? '' : ' checked') +
          '> Показывать</label>' +
          '</div>'
        );
      })
      .join('');
    function lookRows(list, kind) {
      return list
        .map((item, i) => {
          return (
            '<div class="cms-wrap-look" data-look="' +
            kind +
            '" data-li="' +
            i +
            '">' +
            '<label class="cms-wrap-check"><input type="checkbox" class="cms-wrap-lshow"' +
            (item.hidden ? '' : ' checked') +
            '> На сайте</label>' +
            '<input class="crm-input cms-wrap-lname" value="' +
            A.escapeAttr(item.name || '') +
            '">' +
            '<code>' +
            A.escapeHtml(item.id) +
            '</code>' +
            '</div>'
          );
        })
        .join('');
    }
    root.innerHTML =
      '<div class="cms-wrap-tabs">' +
      '<button type="button" data-wrap-car="mercedes"' +
      (wrapCarTab === 'mercedes' ? ' class="is-active"' : '') +
      '>Легковой автомобиль</button>' +
      '<button type="button" data-wrap-car="mazda"' +
      (wrapCarTab === 'mazda' ? ' class="is-active"' : '') +
      '>Кроссовер</button>' +
      '</div>' +
      '<table class="cms-wrap-table"><thead><tr><th>ID зоны</th><th>Название</th><th>Цена, ₽</th></tr></thead><tbody>' +
      rows +
      '</tbody></table>' +
      ' <h3 class="cms-wrap-h">Палитра плёнки</h3>' +
      '<div class="cms-admin-toolbar"><button type="button" class="crm-btn" id="cms-wrap-colors-stock">Вернуть стоковые цвета</button></div>' +
      '<div class="cms-wrap-colors">' +
      colors +
      '</div>' +
      '<h3 class="cms-wrap-h">Финиш (только название и видимость)</h3>' +
      '<div class="cms-wrap-looks">' +
      lookRows(wrapZones.finishes, 'finishes') +
      '</div>' +
      '<h3 class="cms-wrap-h">Материал / эффект (только название и видимость)</h3>' +
      '<div class="cms-wrap-looks">' +
      lookRows(wrapZones.effects, 'effects') +
      '</div>';

    root.querySelectorAll('[data-wrap-car]').forEach((btn) => {
      btn.onclick = () => {
        wrapCarTab = btn.dataset.wrapCar;
        renderWrapZonesAdmin();
      };
    });
    root.querySelectorAll('.cms-wrap-name').forEach((inp) => {
      inp.oninput = () => {
        const id = inp.closest('tr').dataset.zoneId;
        const z = wrapZones.models[wrapCarTab].zones;
        if (!z[id]) z[id] = {};
        z[id].name = inp.value;
        if (wrapCarTab === 'mercedes') wrapZones.zones = wrapZones.models.mercedes.zones;
      };
    });
    root.querySelectorAll('.cms-wrap-price').forEach((inp) => {
      inp.oninput = () => {
        const id = inp.closest('tr').dataset.zoneId;
        const z = wrapZones.models[wrapCarTab].zones;
        if (!z[id]) z[id] = {};
        z[id].price = +inp.value || 0;
        if (wrapCarTab === 'mercedes') wrapZones.zones = wrapZones.models.mercedes.zones;
      };
    });
    root.querySelectorAll('.cms-wrap-color').forEach((card) => {
      const i = +card.dataset.ci;
      const pick = card.querySelector('.cms-wrap-hex-pick');
      const hex = card.querySelector('.cms-wrap-hex');
      const name = card.querySelector('.cms-wrap-cname');
      const show = card.querySelector('.cms-wrap-cshow');
      pick.oninput = () => {
        wrapZones.colors[i].hex = pick.value;
        hex.value = pick.value;
        scheduleWrapSave();
      };
      hex.onchange = () => {
        const n = normHex(hex.value);
        if (!n) {
          hex.value = wrapZones.colors[i].hex;
          return;
        }
        wrapZones.colors[i].hex = n;
        pick.value = n;
        hex.value = n;
        scheduleWrapSave();
      };
      name.oninput = () => {
        wrapZones.colors[i].name = name.value;
        scheduleWrapSave();
      };
      show.onchange = () => {
        wrapZones.colors[i].hidden = !show.checked;
        scheduleWrapSave();
      };
    });
    const stockBtn = root.querySelector('#cms-wrap-colors-stock');
    if (stockBtn) {
      stockBtn.onclick = () => {
        wrapZones.colors = STOCK_WRAP_COLORS.map((c) => ({ hex: c.hex, name: c.name, hidden: false }));
        renderWrapZonesAdmin();
        scheduleWrapSave();
      };
    }
    root.querySelectorAll('.cms-wrap-look').forEach((row) => {
      const kind = row.dataset.look;
      const i = +row.dataset.li;
      row.querySelector('.cms-wrap-lname').oninput = (e) => {
        wrapZones[kind][i].name = e.target.value;
      };
      row.querySelector('.cms-wrap-lshow').onchange = (e) => {
        wrapZones[kind][i].hidden = !e.target.checked;
      };
    });
  }

  function renderPages() {
    const root = $('#cms-pages-list');
    if (!root) return;
    root.innerHTML = META_PAGES.map((p) => {
      const saved = (store[p.id] && store[p.id].meta) || {};
      const title = saved.title || p.title;
      const description = saved.description || '';
      const editable = PAGES.some((item) => item.id === p.id);
      return (
        '<div class="cms-admin-page-row cms-meta-row" data-page="' +
        p.id +
        '">' +
        '<div class="cms-meta-head"><b>' +
        escapeAttr(p.label) +
        '</b>' +
        '<a class="crm-link" href="../' +
        p.id +
        '" target="_blank" rel="noopener">Открыть</a>' +
        (editable
          ? '<a class="crm-btn" href="../' + p.id + '">Редактировать на сайте</a>'
          : '') +
        '</div>' +
        '<label class="cms-meta-field">Заголовок<input class="crm-input cms-meta-title" value="' +
        escapeAttr(title) +
        '"></label>' +
        '<label class="cms-meta-field">Описание<textarea class="crm-input cms-meta-desc" rows="3">' +
        escapeAttr(description) +
        '</textarea></label>' +
        '<button type="button" class="crm-btn cms-admin-save cms-meta-save">Сохранить</button>' +
        '</div>'
      );
    }).join('');
    root.querySelectorAll('.cms-meta-save').forEach((btn) => {
      btn.onclick = async () => {
        const row = btn.closest('[data-page]');
        const meta = {
          title: row.querySelector('.cms-meta-title').value.trim(),
          description: row.querySelector('.cms-meta-desc').value.trim(),
        };
        btn.disabled = true;
        try {
          await savePageMeta(row.dataset.page, meta);
          adminToast('Сохранено');
        } catch (_) {
          alert('Ошибка сохранения. Войдите снова.');
        } finally {
          btn.disabled = false;
        }
      };
    });
  }

  function switchView(view) {
    document.querySelectorAll('[data-cms-panel]').forEach((el) => {
      el.hidden = el.dataset.cmsPanel !== view;
    });
    document.querySelectorAll('[data-cms-nav]').forEach((btn) => {
      const nav = btn.dataset.cmsNav;
      btn.classList.toggle(
        'is-active',
        nav === view || (view === 'school-student' && nav === 'school-students')
      );
    });
    const titles = {
      dashboard: ['Панель CMS', 'Управление сайтом АвтоБлеск'],
      albums: ['Альбомы работ', 'Блоки 01, 02… — название, описание и фото на странице album.html'],
      services: ['Услуги и цены', 'Каталог на главной (раздел «Каталог»)'],
      pages: ['Страницы', 'Сайт, альбом и обучение — правки текста и фото на странице'],
      wrap: ['Конфигуратор 3D', 'Названия и цены зон оклейки на главной'],
      school: ['Обучение', 'Статистика школы и последние ученики'],
      'school-students': ['Обучающиеся', 'Все ученики, статусы и сертификаты'],
      'school-certs': ['Сертификаты', 'Выданные сертификаты и проверка на сайте'],
      'school-courses': ['Курсы', 'Программы школы, стоимость, преподаватели'],
      'school-users': ['Сотрудники', 'Команда школы и роли доступа'],
      'school-stats': ['Статистика', 'Показатели по фактической базе'],
      'school-settings': ['Настройки школы', 'Данные школы, сертификат, уведомления'],
      'school-student': ['Карточка ученика', 'Профиль, сертификат, история'],
    };
    const t = titles[view] || titles.dashboard;
    $('#cms-title').textContent = t[0];
    $('#cms-sub').textContent = t[1];
    if (window.AvtoSchoolCrm && String(view).indexOf('school') === 0) {
      window.AvtoSchoolCrm.render(view);
    }
  }

  async function initApp() {
    showLogin(false);
    try {
      await loadStore();
    } catch (e) {
      console.error(e);
    }
    try {
      await loadWrapZones();
    } catch (e) {
      console.error(e);
    }
    if (window.AvtoSchoolCrm) {
      window.AvtoSchoolCrm.bind({ token, go: switchView });
      try {
        await window.AvtoSchoolCrm.load();
      } catch (e) {
        console.error(e);
      }
    }
    renderPages();
    renderAlbumsAdmin();
    renderServicesAdmin();
    renderWrapZonesAdmin();
    switchView('dashboard');

    const addAlbum = $('#cms-add-album');
    if (addAlbum) {
      addAlbum.onclick = () => {
        albums.push({
          kicker: String(albums.length + 1).padStart(2, '0'),
          title: 'Новый альбом',
          description: '',
          items: [],
        });
        renderAlbumsAdmin();
      };
    }

    const saveAlbums = $('#cms-save-albums');
    if (saveAlbums) {
      saveAlbums.onclick = async () => {
        try {
          await savePageLists(ALBUM_PAGE, { albums });
          alert('Альбомы сохранены.');
        } catch (_) {
          alert('Ошибка сохранения. Войдите снова.');
        }
      };
    }

    const addService = $('#cms-add-service');
    if (addService) {
      addService.onclick = () => {
        services.push({ title: 'Новая услуга', text: 'Описание', cost: 'после осмотра' });
        renderServicesAdmin();
      };
    }

    const saveServices = $('#cms-save-services');
    if (saveServices) {
      saveServices.onclick = async () => {
        try {
          await savePageLists('index.html', { services });
          alert('Услуги сохранены.');
        } catch (_) {
          alert('Ошибка сохранения.');
        }
      };
    }

    const saveWrap = $('#cms-save-wrap');
    if (saveWrap) {
      saveWrap.onclick = async () => {
        clearTimeout(wrapSaveTimer);
        wrapSaveTimer = null;
        saveWrap.disabled = true;
        try {
          const res = await enqueueWrapSave();
          if (res && res.skipped) return;
          alert('Конфигуратор сохранён. Обновите главную страницу.');
        } catch (_) {
          alert('Ошибка сохранения зон.');
        } finally {
          saveWrap.disabled = false;
        }
      };
    }

    const logout = $('#cms-logout');
    if (logout) {
      logout.onclick = () => {
        sessionStorage.removeItem(TOKEN_KEY);
        location.reload();
      };
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-cms-nav]').forEach((btn) => {
      btn.onclick = () => switchView(btn.dataset.cmsNav);
    });

    $('#cms-login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = $('#cms-login-err');
      err.hidden = true;
      const password = ($('#cms-login-password').value || '').trim();
      if (!password) {
        err.textContent = 'Введите пароль';
        err.hidden = false;
        return;
      }
      let res;
      try {
        res = await window.AvtoCmsApi.login(password);
      } catch (ex) {
        err.textContent =
          'Нет связи с сервером. Запустите python server.py и откройте http://127.0.0.1:8092/cms/admin-panel.html';
        err.hidden = false;
        return;
      }
      if (!res || !res.ok) {
        err.textContent = 'Неверный пароль. Локально: avtoblesk-cms-change-me';
        err.hidden = false;
        return;
      }
      let data;
      try {
        data = await res.json();
      } catch (_) {
        err.textContent = 'Сервер не ответил JSON. Проверьте, что открыт адрес с портом 8092, не файл HTML.';
        err.hidden = false;
        return;
      }
      if (!data.token) {
        err.textContent = 'Сервер не выдал токен';
        err.hidden = false;
        return;
      }
      sessionStorage.setItem(TOKEN_KEY, data.token);
      try {
        await initApp();
      } catch (ex) {
        showLogin(false);
        console.error(ex);
        alert('Вход выполнен, но часть данных не загрузилась: ' + (ex && ex.message ? ex.message : ex));
      }
    });

    if (token()) {
      initApp().catch((ex) => {
        sessionStorage.removeItem(TOKEN_KEY);
        showLogin(true);
        const err = $('#cms-login-err');
        if (err) {
          err.textContent = 'Сессия сброшена. Войдите снова. ' + (ex && ex.message ? ex.message : '');
          err.hidden = false;
        }
      });
      return;
    }
    showLogin(true);
  });
})();
