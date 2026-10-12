(function () {
  const A = () => window.AvtoCmsArticles;

  function bindArticlesAdmin(ctx) {
    const { articles, token, onSave, render } = ctx;

    function move(ai, dir) {
      const j = ai + dir;
      if (j < 0 || j >= articles.length) return;
      const t = articles[ai];
      articles[ai] = articles[j];
      articles[j] = t;
      articles.forEach((a, i) => {
        a.order = articles.length - i;
      });
      render();
    }

    function attach(root) {
      if (!root) return;
      root.querySelectorAll('[data-move]').forEach((btn) => {
        btn.onclick = () => move(+btn.closest('[data-ai]').dataset.ai, +btn.dataset.move);
      });
      root.querySelectorAll('.cms-art-pin').forEach((inp) => {
        inp.onchange = () => {
          articles[+inp.closest('[data-ai]').dataset.ai].pinned = inp.checked;
        };
      });
      root.querySelectorAll('.cms-art-hidden').forEach((inp) => {
        inp.onchange = () => {
          articles[+inp.closest('[data-ai]').dataset.ai].hidden = inp.checked;
        };
      });
      root.querySelectorAll('.cms-art-select').forEach((sel) => {
        sel.onchange = () => {
          articles[+sel.closest('[data-ai]').dataset.ai][sel.dataset.field] = sel.value;
        };
      });
      root.querySelectorAll('.cms-art-show-cover').forEach((inp) => {
        inp.onchange = () => {
          articles[+inp.closest('[data-ai]').dataset.ai].showCover = inp.checked;
        };
      });
      root.querySelectorAll('.cms-art-field').forEach((inp) => {
        const ev = inp.tagName === 'TEXTAREA' || inp.dataset.field === 'body' ? 'input' : 'input';
        inp[ev] = () => {
          const ai = +inp.closest('[data-ai]').dataset.ai;
          const field = inp.dataset.field;
          articles[ai][field] = inp.value;
          if (field === 'title' && !articles[ai]._slugManual) {
            const slugInp = inp.closest('[data-ai]').querySelector('[data-field="slug"]');
            if (slugInp && !slugInp.dataset.touched) {
              slugInp.value = A().slugify(inp.value);
              articles[ai].slug = slugInp.value;
            }
          }
        };
      });
      root.querySelectorAll('[data-field="slug"]').forEach((inp) => {
        inp.onfocus = () => {
          inp.dataset.touched = '1';
          articles[+inp.closest('[data-ai]').dataset.ai]._slugManual = true;
        };
        inp.oninput = () => {
          articles[+inp.closest('[data-ai]').dataset.ai].slug = inp.value;
        };
      });
      root.querySelectorAll('.cms-art-del').forEach((btn) => {
        btn.onclick = () => {
          const ai = +btn.closest('[data-ai]').dataset.ai;
          if (!confirm('Удалить статью?')) return;
          articles.splice(ai, 1);
          render();
        };
      });
      root.querySelectorAll('.cms-art-cover-btn').forEach((btn) => {
        btn.onclick = () => pickImage(+btn.closest('[data-ai]').dataset.ai, 'cover');
      });
      root.querySelectorAll('.cms-art-add-gallery').forEach((btn) => {
        btn.onclick = () => pickImage(+btn.closest('[data-ai]').dataset.ai, 'gallery');
      });
      root.querySelectorAll('.cms-art-rm-gallery').forEach((btn) => {
        btn.onclick = () => {
          const box = btn.closest('[data-gi]');
          const ai = +box.closest('[data-ai]').dataset.ai;
          const gi = +box.dataset.gi;
          articles[ai].gallery.splice(gi, 1);
          render();
        };
      });
    }

    function pickImage(ai, mode) {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files && input.files[0];
        if (!file) return;
        const res = await window.AvtoCmsApi.upload(file, token());
        if (!res.ok) {
          alert('Не удалось загрузить файл');
          return;
        }
        const data = await res.json();
        if (!data.url) return;
        if (mode === 'cover') {
          articles[ai].cover = data.url;
        } else {
          if (!articles[ai].gallery) articles[ai].gallery = [];
          articles[ai].gallery.push(data.url);
        }
        render();
      };
      input.click();
    }

    function renderEditor(root, list) {
      const Esc = A();
      root.innerHTML = list
        .map((art, ai) => {
          const gallery = (art.gallery || [])
            .map(
              (url, gi) =>
                '<div class="cms-admin-media" data-gi="' +
                gi +
                '"><span class="cms-admin-media-label">' +
                Esc.escapeHtml(url.split('/').pop()) +
                '</span><button type="button" class="crm-link cms-art-rm-gallery">×</button></div>'
            )
            .join('');
          return (
            '<div class="cms-admin-article" data-ai="' +
            ai +
            '">' +
            '<div class="cms-admin-article-toolbar">' +
            '<button type="button" class="crm-link" data-move="-1" title="Выше">↑</button>' +
            '<button type="button" class="crm-link" data-move="1" title="Ниже">↓</button>' +
            '<label class="cms-art-flag"><input type="checkbox" class="cms-art-pin"' +
            (art.pinned ? ' checked' : '') +
            '> Закрепить</label>' +
            '<label class="cms-art-flag"><input type="checkbox" class="cms-art-hidden"' +
            (art.hidden ? ' checked' : '') +
            '> Скрыть</label>' +
            '<button type="button" class="crm-link cms-art-del">Удалить</button>' +
            '</div>' +
            '<label>Заголовок <input class="crm-input cms-art-field" data-field="title" value="' +
            Esc.escapeAttr(art.title || '') +
            '"></label>' +
            '<label>URL (slug) <input class="crm-input cms-art-field" data-field="slug" value="' +
            Esc.escapeAttr(art.slug || '') +
            '"><small>Страница: works/' +
            Esc.escapeHtml(art.slug || '…') +
            '/</small></label>' +
            '<label>Дата <input class="crm-input cms-art-field" data-field="publishedAt" type="date" value="' +
            Esc.escapeAttr(art.publishedAt || '') +
            '"></label>' +
            '<label>Краткое описание (анонс)<textarea class="crm-input cms-art-field" data-field="excerpt" rows="2">' +
            Esc.escapeHtml(art.excerpt || '') +
            '</textarea></label>' +
            '<label>Ширина колонки текста <select class="crm-input cms-art-select" data-field="contentWidth">' +
            '<option value="narrow"' +
            (art.contentWidth === 'narrow' ? ' selected' : '') +
            '>Узкая</option><option value="normal"' +
            (!art.contentWidth || art.contentWidth === 'normal' ? ' selected' : '') +
            '>Стандарт</option><option value="wide"' +
            (art.contentWidth === 'wide' ? ' selected' : '') +
            '>Широкая</option></select></label>' +
            '<label class="cms-art-flag"><input type="checkbox" class="cms-art-show-cover"' +
            (art.showCover !== false ? ' checked' : '') +
            '> Показывать обложку в начале статьи</label>' +
            '<label>Текст статьи <small>Абзацы — через пустую строку</small><textarea class="crm-input cms-art-field" data-field="body" rows="10">' +
            Esc.escapeHtml(art.body || '') +
            '</textarea></label>' +
            '<label>SEO title <input class="crm-input cms-art-field" data-field="metaTitle" value="' +
            Esc.escapeAttr(art.metaTitle || '') +
            '"></label>' +
            '<label>SEO description<textarea class="crm-input cms-art-field" data-field="metaDescription" rows="2">' +
            Esc.escapeHtml(art.metaDescription || '') +
            '</textarea></label>' +
            '<div class="cms-admin-article-media">' +
            '<div><b>Обложка</b> ' +
            (art.cover ? '<code>' + Esc.escapeHtml(art.cover) + '</code> ' : '') +
            '<button type="button" class="crm-btn cms-art-cover-btn">Загрузить обложку</button></div>' +
            '<div><b>Галерея</b><div class="cms-admin-media-grid">' +
            gallery +
            '</div><button type="button" class="crm-btn cms-art-add-gallery">+ фото в галерею</button></div>' +
            '</div></div>'
          );
        })
        .join('');
      attach(root);
    }

    return { renderEditor, pickImage };
  }

  window.AvtoCmsArticlesAdmin = { bindArticlesAdmin };
})();
