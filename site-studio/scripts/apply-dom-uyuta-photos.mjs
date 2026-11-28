import fs from 'node:fs';
import path from 'node:path';
import { applySiteConfig } from '../lib/apply-river-home.mjs';
import { writeSiteConfig } from '../lib/import-site.mjs';
import { siteDir, siteConfigPath } from '../lib/repo.mjs';

const slug = 'dom-uyuta-365-tyumen';
const dir = siteDir(slug);
const assets = path.resolve(
  'C:\\Users\\Никита\\.cursor\\projects\\c-Users-Melissa-tech-ru\\assets',
);
const v = 'dom-uyuta-365-20261128';
const q = `?v=${v}`;
const BRAND = 'Дом Уюта 365';

const PH1 = 'image-8aa5cd1e-3c6b-4183-a7b1-80ec67632c9d.jpg';
const DOM = [
  { file: '01.jpg', asset: 'image-5ad7bdaf-d086-4c27-9b58-fe7a6e29d1fe.jpg' },
  { file: '02.jpg', asset: PH1 },
];
const INSIDE = [
  { file: '01.jpg', asset: 'image-502bcbcd-f274-4477-baed-46a2fab5d145.jpg' },
  { file: '02.jpg', asset: 'image-5ce3e25a-9941-4f42-a7ed-949a64cdf89a.jpg' },
];
const CHAN = [
  { file: '01.jpg', asset: 'image-cb8ff52e-bee2-46ca-a3bb-7a3eeab3a671.jpg' },
  { file: '02.jpg', asset: 'image-36a9fd95-e45f-4dc8-bfdc-4faac3d29c88.jpg' },
];

function copySet(folder, items) {
  const destDir = path.join(dir, 'photoHouse', folder);
  fs.mkdirSync(destDir, { recursive: true });
  for (const old of fs.readdirSync(destDir)) {
    try {
      fs.unlinkSync(path.join(destDir, old));
    } catch {
      /* ignore */
    }
  }
  for (const ent of items) {
    const src = path.join(assets, ent.asset);
    if (!fs.existsSync(src)) throw new Error(`Asset missing: ${ent.asset}`);
    fs.copyFileSync(src, path.join(destDir, ent.file));
  }
}

copySet('Дом', DOM);
copySet('Комнаты - Внутри дома', INSIDE);
copySet('Купель и сауна', CHAN);
fs.copyFileSync(path.join(assets, PH1), path.join(dir, 'photoHouse', 'hero-cover.jpg'));

function paths(folder, items) {
  return items.map((e) => `photoHouse/${folder}/${e.file}`);
}

function galleryItems(files, label) {
  return files.map((f, i) => ({
    path: f,
    alt: i === 0 ? `${label} — ${BRAND}, Тюмень` : `${label} — ${BRAND}`,
  }));
}

const domItems = galleryItems(paths('Дом', DOM), 'Дом');
const insideItems = galleryItems(paths('Комнаты - Внутри дома', INSIDE), 'Внутри');
const chanItems = galleryItems(paths('Купель и сауна', CHAN), 'Чан');

function carouselJson(items) {
  return JSON.stringify(items.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })));
}

function galleryHtml(items) {
  return items
    .map(
      (it) =>
        `<a class="g g--media" href="../${it.path}${q}"><img data-src="../${it.path}${q}" alt="${it.alt.replace(/"/g, '&quot;')}" loading="lazy" decoding="async"></a>`,
    )
    .join('\n    ');
}

const albumList = `  <div class="album-list">
    <article class="album-row" id="house-dom">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="right" data-autoplay="false" data-label="Дом" data-href="services/dom.html">
        <script type="application/json" class="depth-carousel__items">${carouselJson(domItems)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Дом</div>
        <h3 class="album-title"><span class="title-kino-line">Дом Уюта</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">365</span><span class="brand-stack__script">А-фрейм</span></span></h3>
        <p>Треугольный дом на Урожайной, 7: терраса, бассейн на участке и вечерняя подсветка.</p>
        <div class="actions"><a class="button" href="services/dom.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>
    <article class="album-row album-row--flip" id="house-inside">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="left" data-autoplay="false" data-label="Комнаты" data-href="services/komnaty.html">
        <script type="application/json" class="depth-carousel__items">${carouselJson(insideItems)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Внутри</div>
        <h3 class="album-title"><span class="title-kino-line">Интерьер</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">Кухня</span><span class="brand-stack__script">и зона отдыха</span></span></h3>
        <p>Деревянный интерьер, кухня, антресоль и уютная обеденная зона.</p>
        <div class="actions"><a class="button" href="services/komnaty.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>
    <article class="album-row" id="house-chan">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="right" data-autoplay="false" data-label="Чан" data-href="services/kupel-sauna.html">
        <script type="application/json" class="depth-carousel__items">${carouselJson(chanItems)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Чан</div>
        <h3 class="album-title"><span class="title-kino-line">Чан</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">на</span><span class="brand-stack__script">дворе</span></span></h3>
        <p>Уличный чан с дровяной подогревом — днём и вечером.</p>
        <div class="actions"><a class="button" href="services/kupel-sauna.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>
  </div>`;

let index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
index = index.replace(
  /<p class="intro">[\s\S]*?<\/p>/,
  '<p class="intro">А-фрейм, интерьер и чан на участке — только наши фото.</p>',
);
index = index.replace(
  /<div class="album-list">[\s\S]*?<\/div>\s*<\/section>\s*<section class="section" id="reviews">/,
  `${albumList}\n</section>\n\n<section class="section" id="reviews">`,
);
index = index.replace(
  /(<div class="heroimg">\s*<img class="heroimg-photo")[^>]+>/,
  `<div class="heroimg"><img class="heroimg-photo" src="photoHouse/hero-cover.jpg${q}" alt="Дом Уюта 365, A-frame, Тюмень" width="1440" height="1920" fetchpriority="high" decoding="async">`,
);
index = index.replace(/(<link rel="preload" as="image" href=")[^"]+(")/, `$1photoHouse/hero-cover.jpg${q}$2`);
fs.writeFileSync(path.join(dir, 'index.html'), index, 'utf8');

const domTpl = fs.readFileSync(path.join(dir, 'services', 'dom.html'), 'utf8');
const phone = '+79920874656';
const phoneDisp = '+7 (992) 087-46-56';

function basePage(html) {
  return html
    .replace(/Дом — Дом отдыха/g, 'Дом Уюта 365')
    .replace(/ДОМ ОТДЫХА/g, 'ДОМ УЮТА 365')
    .replace(/\+79829143247/g, phone)
    .replace(/\+7 \(982\) 914-32-47/g, phoneDisp)
    .replace(/(dom-otdyha|molly-house|abazhur)[^"?]*/g, v);
}

function servicePage({ kicker, titleHtml, lead, items, current }) {
  let html = basePage(domTpl);
  html = html.replace(
    /<section class="subpage-hero[\s\S]*?<\/section>/,
    `<section class="subpage-hero subpage-hero--service">
  <div class="kicker">${kicker}</div>
  <h1>${titleHtml}</h1>
  <p>${lead}</p>
</section>`,
  );
  html = html.replace(
    /<section class="section section--album-gallery">[\s\S]*?<\/section>/,
    `<section class="section section--album-gallery">
  <div class="gallery gallery--portfolio">
    ${galleryHtml(items)}
  </div>
</section>`,
  );
  html = html.replace(/data-album-current="dom"/, `data-album-current="${current}"`);
  return html;
}

const hDom =
  '<span class="title-kino-line">Дом Уюта</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">365</span><span class="brand-stack__script">снаружи</span></span>';
const hIn =
  '<span class="title-kino-line">Интерьер</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">Внутри</span><span class="brand-stack__script">дома</span></span>';
const hChan =
  '<span class="title-kino-line">Чан</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">на</span><span class="brand-stack__script">участке</span></span>';

fs.writeFileSync(
  path.join(dir, 'services', 'dom.html'),
  servicePage({
    kicker: 'Дом',
    titleHtml: hDom,
    lead: 'A-frame на Урожайной, 7 — фасад, бассейн и двор.',
    items: domItems,
    current: 'dom',
  }),
  'utf8',
);
fs.writeFileSync(
  path.join(dir, 'services', 'komnaty.html'),
  servicePage({
    kicker: 'Внутри',
    titleHtml: hIn,
    lead: 'Кухня, антресоль и обеденная зона в деревянном интерьере.',
    items: insideItems,
    current: 'komnaty',
  }),
  'utf8',
);
fs.writeFileSync(
  path.join(dir, 'services', 'kupel-sauna.html'),
  servicePage({
    kicker: 'Чан',
    titleHtml: hChan,
    lead: 'Уличный чан с подогревом на дровах.',
    items: chanItems,
    current: 'kupel-sauna',
  }),
  'utf8',
);

const albumMore = `  var ALBUMS = [
    {
      id: 'dom',
      href: 'dom.html',
      title: 'Дом',
      kicker: 'A-frame',
      lead: 'Фасад и двор',
      preview: '../photoHouse/Дом/01.jpg${q}',
    },
    {
      id: 'komnaty',
      href: 'komnaty.html',
      title: 'Внутри',
      kicker: 'Интерьер',
      lead: 'Кухня и отдых',
      preview: '../photoHouse/Комнаты - Внутри дома/01.jpg${q}',
    },
    {
      id: 'kupel-sauna',
      href: 'kupel-sauna.html',
      title: 'Чан',
      kicker: 'На дворе',
      lead: 'Уличный чан',
      preview: '../photoHouse/Купель и сауна/01.jpg${q}',
    },
  ];`;

fs.writeFileSync(
  path.join(dir, 'album-more.js'),
  fs
    .readFileSync(path.join(dir, 'album-more.js'), 'utf8')
    .replace(/var ALBUMS = \[[\s\S]*?\];/, albumMore),
  'utf8',
);

const cfg = JSON.parse(fs.readFileSync(siteConfigPath(slug), 'utf8'));
cfg.gallery = { hero: 'photoHouse/hero-cover.jpg', cacheQuery: q };
cfg.hero = cfg.hero || {};
cfg.hero.imageAlt = 'Дом Уюта 365, A-frame, Урожайная 7, Тюмень';
cfg.carousels = [
  { label: 'Дом', items: domItems.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })) },
  { label: 'Комнаты', items: insideItems.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })) },
  { label: 'Чан', items: chanItems.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })) },
];
cfg.albums = [
  {
    id: 'dom',
    manifestKey: 'Дом',
    label: 'Дом',
    folder: 'photoHouse/Дом',
    files: domItems.map((it) => ({ path: it.path, alt: it.alt })),
  },
  {
    id: 'inside',
    manifestKey: 'Комнаты - Внутри дома',
    label: 'Внутри',
    folder: 'photoHouse/Комнаты - Внутри дома',
    files: insideItems.map((it) => ({ path: it.path, alt: it.alt })),
  },
  {
    id: 'chan',
    manifestKey: 'Купель и сауна',
    label: 'Чан',
    folder: 'photoHouse/Купель и сауна',
    files: chanItems.map((it) => ({ path: it.path, alt: it.alt })),
  },
];
cfg.meta = cfg.meta || {};
cfg.meta.cacheBust = '20261128';

applySiteConfig(cfg);
writeSiteConfig(slug, cfg);
console.log('OK', slug);