(function () {
  function mediaSrc(url) {
    if (!url) return '';
    if (/^https?:\/\//i.test(url) || String(url).indexOf('../') === 0) return url;
    return '../' + String(url).replace(/^\//, '');
  }

  function formatListDate(iso) {
    if (!iso) return '—';
    const p = String(iso).split('-');
    if (p.length !== 3) return iso;
    const dd = String(p[2]).padStart(2, '0');
    const mm = String(p[1]).padStart(2, '0');
    return dd + '.' + mm + '.' + p[0];
  }

  function bodyPreview(body, max) {
    const t = String(body || '')
      .replace(/\{\{img:[^}]+\}\}/g, ' [фото] ')
      .replace(/\s+/g, ' ')
      .trim();
    if (!t) return 'Текст статьи пока пустой…';
    return t.length > max ? t.slice(0, max) + '…' : t;
  }

  function statusMeta(art) {
    if (art.hidden) return { label: 'Скрыта', className: 'is-hidden' };
    if (art.pinned) return { label: 'Закреплена', className: 'is-pin' };
    return { label: 'Опубликована', className: 'is-live' };
  }

  function isEmptyDraft(art) {
    if (!art) return true;
    const title = String(art.title || '').trim();
    const body = String(art.body || '').trim();
    const excerpt = String(art.excerpt || '').trim();
    return !title && !body && !excerpt && !art.cover && !(art.gallery && art.gallery.length);
  }

  function articleHref(art) {
    const slug = String(art && art.slug ? art.slug : '').trim();
    if (!slug || /^draft-\d+$/.test(slug)) return '';
    return '../works/' + encodeURIComponent(slug) + '/';
  }

  function insertAtCursor(textarea, text) {
    if (!textarea) return;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || 0;
    const value = textarea.value || '';
    const before = value.slice(0, start);
    const after = value.slice(end);
    const needsLead = before.length && !/\n\n$/.test(before);
    const needsTrail = after.length && !/^\n\n/.test(after);
    const chunk = (needsLead ? '\n\n' : before.length ? '' : '') + text + (needsTrail || !after.length ? '\n\n' : '');
    textarea.value = before + chunk + after;
    const pos = (before + chunk).length;
    textarea.focus();
    textarea.setSelectionRange(pos, pos);
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
  }

  function bindArticlesAdmin(ctx) {
    const { articles, token, render, getActiveId, setActiveId, getMode, setMode, onSave } = ctx;
    const A = () => window.AvtoCmsArticles;
    let previewOpen = true;
    let saveTimer = null;

    function indexById(id) {
      if (!id) return -1;
      return articles.findIndex((a) => a && a.id === id);
    }

    function scheduleSave(immediate) {
      if (!onSave) return;
      clearTimeout(saveTimer);
      if (immediate) {
        saveTimer = null;
        return Promise.resolve(onSave());
      }
      saveTimer = setTimeout(() => {
        saveTimer = null;
        onSave();
      }, 700);
      return Promise.resolve();
    }

    function feedRowHtml(art, Esc, opts) {
      opts = opts || {};
      const interactive = !!opts.interactive;
      const cover = art.cover || ((art.gallery || [])[0] || '');
      const pinned = !!art.pinned;
      const pin = pinned ? '<span class="article-row-pin">Закреплено</span>' : '';
      const rowClass = 'article-row' + (pinned ? ' article-row--pinned' : '');
      const href = articleHref(art);
      let media;
      if (cover) {
        const img =
          '<img src="' +
          Esc.escapeAttr(mediaSrc(cover)) +
          '" alt="" loading="lazy" decoding="async">';
        media = interactive && href
          ? '<a class="article-row-media" href="' + Esc.escapeAttr(href) + '" target="_blank" rel="noopener">' + img + '</a>'
          : '<div class="article-row-media" aria-hidden="true">' + img + '</div>';
      } else {
        media = interactive && href
          ? '<a class="article-row-media article-row-media--empty" href="' + Esc.escapeAttr(href) + '" target="_blank" rel="noopener"><span>АвтоБлеск</span></a>'
          : '<div class="article-row-media article-row-media--empty" aria-hidden="true"><span>АвтоБлеск</span></div>';
      }
      const title = Esc.escapeHtml(art.title || 'Без названия');
      const titleHtml = interactive && href
        ? '<a href="' + Esc.escapeAttr(href) + '" target="_blank" rel="noopener">' + title + '</a>'
        : '<span>' + title + '</span>';
      const excerpt = Esc.escapeHtml(art.excerpt || 'Добавьте анонс');
      const date = Esc.escapeHtml(formatListDate(art.publishedAt));
      const dateAttr = Esc.escapeAttr(art.publishedAt || '');
      const btn = interactive && href
        ? '<a class="button dark article-row-btn" href="' + Esc.escapeAttr(href) + '" target="_blank" rel="noopener">Читать статью</a>'
        : '<span class="button dark article-row-btn is-disabled">Читать статью</span>';
      return (
        '<article class="' +
        rowClass +
        ' cms-art-feed-row">' +
        media +
        '<div class="article-row-body">' +
        pin +
        '<time class="article-row-date" datetime="' +
        dateAttr +
        '">' +
        date +
        '</time>' +
        '<h2 class="article-row-title">' +
        titleHtml +
        '</h2>' +
        '<p class="article-row-excerpt">' +
        excerpt +
        '</p>' +
        btn +
        '</div></article>'
      );
    }

    async function openList() {
      const ai = indexById(getActiveId());
      if (ai >= 0 && isEmptyDraft(articles[ai])) {
        articles.splice(ai, 1);
      } else if (ai >= 0) {
        await scheduleSave(true);
      }
      setActiveId(null);
      setMode('list');
      render();
    }

    function openEdit(id) {
      if (!id) return;
      setActiveId(id);
      setMode('edit');
      render();
    }

    function createNew() {
      const ts = Date.now();
      const id = 'art-' + ts;
      articles.unshift({
        id,
        slug: 'draft-' + ts,
        title: '',
        excerpt: '',
        body: '',
        cover: '',
        gallery: [],
        publishedAt: new Date().toISOString().slice(0, 10),
        pinned: false,
        hidden: false,
        order: articles.length + 1,
        metaTitle: '',
        metaDescription: '',
      });
      openEdit(id);
    }

    async function uploadFiles(files, ai, mode, bodyTextarea) {
      const list = Array.from(files || []).filter(Boolean);
      if (!list.length) return;
      for (const file of list) {
        const res = await window.AvtoCmsApi.upload(file, token());
        if (!res.ok) {
          alert('Не удалось загрузить файл');
          return;
        }
        const data = await res.json();
        if (!data.url) return;
        if (mode === 'cover') articles[ai].cover = data.url;
        else if (mode === 'inline') {
          insertAtCursor(bodyTextarea, '{{img:' + data.url + '}}');
          articles[ai].body = bodyTextarea.value;
        } else {
          if (!articles[ai].gallery) articles[ai].gallery = [];
          articles[ai].gallery.push(data.url);
        }
      }
      await scheduleSave(true);
      if (mode !== 'inline') render();
      else {
        const root = bodyTextarea && bodyTextarea.closest('.cms-art-screen');
        if (root) syncPreview(root, articles[ai]);
      }
    }

    function pickImage(ai, mode, bodyTextarea) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = mode === 'gallery';
      input.onchange = () => uploadFiles(input.files, ai, mode, bodyTextarea);
      input.click();
    }

    function syncPreview(root, art) {
      const box = root.querySelector('.cms-art-preview-feed');
      if (!box || !art) return;
      box.innerHTML =
        '<div class="article-feed article-feed--magazine cms-art-preview-magazine">' +
        feedRowHtml(art, A(), { interactive: true }) +
        '</div>' +
        '<p class="cms-art-preview-body">' +
        A().escapeHtml(bodyPreview(art.body, 280)) +
        '</p>';
    }

    function attachList(root) {
      root.querySelectorAll('[data-open-edit]').forEach((btn) => {
        btn.onclick = () => openEdit(btn.dataset.openEdit);
      });
      root.querySelectorAll('.cms-art-list-del').forEach((btn) => {
        btn.onclick = async () => {
          const id = btn.dataset.id;
          const ai = indexById(id);
          if (ai < 0) return;
          if (!confirm('Удалить статью? Она пропадёт с сайта.')) return;
          articles.splice(ai, 1);
          await scheduleSave(true);
          render();
        };
      });
      root.querySelectorAll('[data-art-create]').forEach((btn) => {
        btn.onclick = () => createNew();
      });
    }

    function attachEdit(root, ai) {
      const bodyTa = root.querySelector('[data-field="body"]');
      root.querySelectorAll('[data-back-list]').forEach((btn) => {
        btn.onclick = () => openList();
      });
      root.querySelectorAll('.cms-art-pin').forEach((inp) => {
        inp.onchange = () => {
          articles[ai].pinned = inp.checked;
          if (inp.checked) articles[ai].hidden = false;
          syncPreview(root, articles[ai]);
          scheduleSave(true);
        };
      });
      root.querySelectorAll('.cms-art-hidden').forEach((inp) => {
        inp.onchange = () => {
          articles[ai].hidden = inp.checked;
          if (inp.checked) articles[ai].pinned = false;
          syncPreview(root, articles[ai]);
          scheduleSave(true);
        };
      });
      root.querySelectorAll('.cms-art-field').forEach((inp) => {
        inp.oninput = () => {
          const field = inp.dataset.field;
          articles[ai][field] = inp.value;
          if (field === 'title') {
            const slugInp = root.querySelector('[data-field="slug"]');
            const autoSlug = /^draft-\d+$/.test(String(articles[ai].slug || ''));
            if (slugInp && (!slugInp.dataset.touched || autoSlug)) {
              slugInp.value = A().slugify(inp.value) || articles[ai].slug;
              articles[ai].slug = slugInp.value;
            }
          }
          syncPreview(root, articles[ai]);
          scheduleSave(false);
        };
      });
      root.querySelectorAll('[data-field="slug"]').forEach((inp) => {
        inp.onfocus = () => {
          inp.dataset.touched = '1';
          articles[ai]._slugManual = true;
        };
      });
      root.querySelectorAll('.cms-art-del').forEach((btn) => {
        btn.onclick = async () => {
          if (!confirm('Удалить статью?')) return;
          articles.splice(ai, 1);
          await scheduleSave(true);
          setActiveId(null);
          setMode('list');
          render();
        };
      });
      root.querySelectorAll('.cms-art-hero, .cms-art-hero-btn').forEach((btn) => {
        btn.onclick = () => pickImage(ai, 'cover');
      });
      root.querySelectorAll('.cms-art-add-gallery').forEach((btn) => {
        btn.onclick = () => pickImage(ai, 'gallery');
      });
      root.querySelectorAll('.cms-art-insert-inline').forEach((btn) => {
        btn.onclick = () => pickImage(ai, 'inline', bodyTa);
      });
      root.querySelectorAll('.cms-art-rm-gallery').forEach((btn) => {
        btn.onclick = async (e) => {
          e.stopPropagation();
          const box = btn.closest('[data-gi]');
          articles[ai].gallery.splice(+box.dataset.gi, 1);
          await scheduleSave(true);
          render();
        };
      });
      const toggle = root.querySelector('.cms-art-preview-toggle');
      if (toggle) {
        toggle.onclick = () => {
          previewOpen = !previewOpen;
          render();
        };
      }
      if (bodyTa) bodyTa.focus();
    }

    function renderList(root, list) {
      const Esc = A();
      const cards = list
        .map((art) => {
          const st = statusMeta(art);
          const id = Esc.escapeAttr(art.id || '');
          return (
            '<div class="cms-art-feed-item">' +
            feedRowHtml(art, Esc, { interactive: true }) +
            '<div class="cms-art-feed-actions">' +
            '<span class="cms-art-status ' +
            st.className +
            '">' +
            st.label +
            '</span>' +
            '<button type="button" class="crm-btn" data-open-edit="' +
            id +
            '">Редактировать</button>' +
            '<button type="button" class="crm-link cms-art-list-del" data-id="' +
            id +
            '">Удалить</button>' +
            '</div></div>'
          );
        })
        .join('');
      root.innerHTML =
        '<div class="cms-art-screen cms-art-screen--list">' +
        '<div class="cms-art-toolbar">' +
        '<button type="button" class="crm-btn cms-admin-save" data-art-create>Новая статья</button>' +
        '</div>' +
        (list.length
          ? '<div class="cms-art-feed-list article-feed article-feed--magazine">' + cards + '</div>'
          : '<div class="cms-art-empty"><p class="cms-art-empty-title">Пока нет статей</p><button type="button" class="crm-btn cms-admin-save" data-art-create>Новая статья</button></div>') +
        '</div>';
      attachList(root);
    }

    function renderEditPanel(art, ai, Esc) {
      const slug = art.slug || '';
      const cover = art.cover || '';
      const heroInner = cover
        ? '<img src="' + Esc.escapeAttr(mediaSrc(cover)) + '" alt="">'
        : '<div class="cms-art-hero-placeholder"><b>Обложка</b><span>Загрузить изображение</span></div>';
      const gallery = (art.gallery || [])
        .map(
          (url, gi) =>
            '<div class="cms-art-thumb" data-gi="' +
            gi +
            '"><img src="' +
            Esc.escapeAttr(mediaSrc(url)) +
            '" alt=""><button type="button" class="cms-art-rm-gallery" title="Убрать">×</button></div>'
        )
        .join('');
      return (
        '<div class="cms-art-screen cms-art-screen--edit">' +
        '<div class="cms-art-toolbar">' +
        '<button type="button" class="crm-link cms-art-back" data-back-list>← К списку</button>' +
        '<span class="cms-art-autosave-hint">Сохраняется автоматически</span>' +
        '</div>' +
        '<div class="cms-art-workspace">' +
        '<div class="cms-art-editor" data-ai="' +
        ai +
        '">' +
        '<div class="cms-art-editor-scroll">' +
        '<button type="button" class="cms-art-hero' +
        (cover ? '' : ' is-empty') +
        '"><span class="cms-art-hero-inner">' +
        heroInner +
        '</span><span class="cms-art-hero-btn">Обложка</span></button>' +
        '<div class="cms-art-doc">' +
        '<input class="cms-art-field cms-art-headline" data-field="title" value="' +
        Esc.escapeAttr(art.title || '') +
        '" placeholder="Заголовок">' +
        '<textarea class="cms-art-field cms-art-lead" data-field="excerpt" rows="2" placeholder="Анонс">' +
        Esc.escapeHtml(art.excerpt || '') +
        '</textarea>' +
        '<div class="cms-art-body-tools">' +
        '<button type="button" class="crm-btn cms-art-insert-inline">Фото в текст</button>' +
        '<span class="cms-art-body-tools-hint">Вставит фото в место курсора: текст → фото → текст</span>' +
        '</div>' +
        '<textarea class="cms-art-field cms-art-body" data-field="body" rows="16" placeholder="Текст статьи. Абзацы — через пустую строку">' +
        Esc.escapeHtml(art.body || '') +
        '</textarea>' +
        '</div>' +
        '<section class="cms-art-gallery-section">' +
        '<div class="cms-art-gallery-head"><h4>Галерея в конце</h4><button type="button" class="crm-btn cms-art-add-gallery">Добавить</button></div>' +
        '<div class="cms-art-thumbs">' +
        gallery +
        '<button type="button" class="cms-art-thumb-add cms-art-add-gallery">+</button>' +
        '</div></section></div>' +
        '<aside class="cms-art-sidebar' +
        (previewOpen ? '' : ' is-preview-off') +
        '">' +
        '<div class="cms-art-sidebar-block">' +
        '<h4>Публикация</h4>' +
        '<label class="cms-art-side-field">Дата<input class="crm-input cms-art-field" data-field="publishedAt" type="date" value="' +
        Esc.escapeAttr(art.publishedAt || '') +
        '"></label>' +
        '<label class="cms-art-switch"><input type="checkbox" class="cms-art-pin"' +
        (art.pinned ? ' checked' : '') +
        '><span><b>Закрепить</b></span></label>' +
        '<label class="cms-art-switch"><input type="checkbox" class="cms-art-hidden"' +
        (art.hidden ? ' checked' : '') +
        '><span><b>Скрыть</b></span></label>' +
        '<button type="button" class="crm-link cms-art-del">Удалить</button>' +
        '</div>' +
        '<div class="cms-art-sidebar-block cms-art-preview-block">' +
        '<div class="cms-art-preview-head"><h4>Превью</h4><button type="button" class="crm-link cms-art-preview-toggle">' +
        (previewOpen ? 'Свернуть' : 'Показать') +
        '</button></div>' +
        '<div class="cms-art-preview-feed"></div></div>' +
        '<div class="cms-art-sidebar-block cms-art-seo-block">' +
        '<h4>SEO</h4>' +
        '<label class="cms-art-side-field">Адрес<input class="crm-input cms-art-field" data-field="slug" value="' +
        Esc.escapeAttr(slug) +
        '"><small>works/' +
        Esc.escapeHtml(slug || '…') +
        '/</small></label>' +
        '<label class="cms-art-side-field">Title<input class="crm-input cms-art-field" data-field="metaTitle" value="' +
        Esc.escapeAttr(art.metaTitle || '') +
        '"></label>' +
        '<label class="cms-art-side-field">Description<textarea class="crm-input cms-art-field" data-field="metaDescription" rows="3">' +
        Esc.escapeHtml(art.metaDescription || '') +
        '</textarea></label>' +
        '</div></aside></div></div></div>'
      );
    }

    function renderEditor(root, list) {
      if (getMode() !== 'edit') {
        renderList(root, list);
        return;
      }
      const ai = indexById(getActiveId());
      if (ai < 0) {
        setMode('list');
        renderList(root, list);
        return;
      }
      const Esc = A();
      root.innerHTML = renderEditPanel(list[ai], ai, Esc);
      attachEdit(root, ai);
      syncPreview(root, list[ai]);
    }

    return { renderEditor, openList, createNew };
  }

  window.AvtoCmsArticlesAdmin = { bindArticlesAdmin };
})();
