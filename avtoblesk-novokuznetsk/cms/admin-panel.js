(function () {
  const TOKEN_KEY = 'avtoblesk_cms_token';
  const PAGES = [
    { id: 'index.html', label: 'Главная' },
    { id: 'services.html', label: 'Услуги' },
    { id: 'gallery.html', label: 'Работы' },
    { id: 'about.html', label: 'О студии' },
    { id: 'contact.html', label: 'Контакты' },
    { id: 'training.html', label: 'Обучение' },
  ];

  let store = {};
  let albums = [];
  let services = [];

  function token() {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  function $(sel) {
    return document.querySelector(sel);
  }

  function showLogin(show) {
    $('#cms-login').hidden = !show;
    $('#cms-app').hidden = show;
  }

  async function loadStore() {
    const url = window.AvtoCmsApi.contentJsonUrl();
    const res = await fetch(url);
    store = res.ok ? await res.json() : {};
    const gal = store['gallery.html'] || {};
    const lists = gal.lists || {};
    if (lists.albums) albums = JSON.parse(JSON.stringify(lists.albums));
    else if (lists.portfolio && window.AvtoCmsAlbums) albums = window.AvtoCmsAlbums.migratePortfolio(lists.portfolio);
    else albums = [];

    if (!albums.length && window.AvtoCmsAlbums) {
      const htmlRes = await fetch('../gallery.html?_=' + Date.now());
      if (htmlRes.ok) {
        const doc = new DOMParser().parseFromString(await htmlRes.text(), 'text/html');
        const parsed = window.AvtoCmsAlbums.collectAlbums(doc.querySelector('[data-cms-albums="portfolio"]'));
        if (parsed?.length) albums = parsed;
      }
    }

    const svc = store['services.html'] || {};
    services = svc.lists?.services ? JSON.parse(JSON.stringify(svc.lists.services)) : [];

    if (!services.length) {
      const htmlRes = await fetch('../services.html?_=' + Date.now());
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

  async function savePageLists(page, lists) {
    const prev = store[page] || { text: {}, images: {}, backgrounds: {} };
    const payload = {
      page,
      text: prev.text || {},
      images: prev.images || {},
      backgrounds: prev.backgrounds || {},
      lists,
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

  function renderPages() {
    const root = $('#cms-pages-list');
    if (!root) return;
    root.innerHTML = PAGES.map(
      (p) =>
        '<div class="cms-admin-page-row">' +
        '<span>' +
        p.label +
        '</span>' +
        '<a class="crm-link" href="../' +
        p.id +
        '" target="_blank" rel="noopener">Открыть</a>' +
        '<a class="crm-btn" href="../' +
        p.id +
        '">Редактировать на сайте</a>' +
        '</div>'
    ).join('');
  }

  function switchView(view) {
    document.querySelectorAll('[data-cms-panel]').forEach((el) => {
      el.hidden = el.dataset.cmsPanel !== view;
    });
    document.querySelectorAll('[data-cms-nav]').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.cmsNav === view);
    });
    const titles = {
      dashboard: ['Панель CMS', 'Управление сайтом АвтоБлеск'],
      albums: ['Альбомы работ', 'Структура как на Brilliant Auto — блоки по услугам'],
      services: ['Услуги', 'Каталог на странице services.html'],
      pages: ['Страницы', 'Открыть страницу и править текст/фото внизу'],
    };
    const t = titles[view] || titles.dashboard;
    $('#cms-title').textContent = t[0];
    $('#cms-sub').textContent = t[1];
  }

  async function initApp() {
    showLogin(false);
    await loadStore();
    renderPages();
    renderAlbumsAdmin();
    renderServicesAdmin();
    switchView('dashboard');

    $('#cms-add-album').onclick = () => {
      albums.push({
        kicker: String(albums.length + 1).padStart(2, '0'),
        title: 'Новый альбом',
        items: [],
      });
      renderAlbumsAdmin();
    };

    $('#cms-save-albums').onclick = async () => {
      try {
        await savePageLists('gallery.html', { albums });
        alert('Альбомы сохранены.');
      } catch (_) {
        alert('Ошибка сохранения. Войдите снова.');
      }
    };

    $('#cms-add-service').onclick = () => {
      services.push({ title: 'Новая услуга', text: 'Описание', cost: 'после осмотра' });
      renderServicesAdmin();
    };

    $('#cms-save-services').onclick = async () => {
      try {
        await savePageLists('services.html', { services });
        alert('Услуги сохранены.');
      } catch (_) {
        alert('Ошибка сохранения.');
      }
    };

    $('#cms-logout').onclick = () => {
      sessionStorage.removeItem(TOKEN_KEY);
      location.reload();
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-cms-nav]').forEach((btn) => {
      btn.onclick = () => switchView(btn.dataset.cmsNav);
    });

    if (token()) {
      initApp().catch(() => showLogin(true));
      return;
    }
    showLogin(true);

    $('#cms-login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const err = $('#cms-login-err');
      err.hidden = true;
      const password = $('#cms-login-password').value;
      const res = await window.AvtoCmsApi.login(password);
      if (!res.ok) {
        err.textContent = 'Неверный пароль';
        err.hidden = false;
        return;
      }
      const data = await res.json();
      sessionStorage.setItem(TOKEN_KEY, data.token);
      initApp().catch(() => showLogin(true));
    });
  });
})();
