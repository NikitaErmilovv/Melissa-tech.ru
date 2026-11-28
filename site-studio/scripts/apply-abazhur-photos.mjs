import fs from 'node:fs';
import path from 'node:path';
import { applySiteConfig } from '../lib/apply-river-home.mjs';
import { writeSiteConfig } from '../lib/import-site.mjs';
import { siteDir, siteConfigPath } from '../lib/repo.mjs';

const slug = 'abazhur-tyumen';
const dir = siteDir(slug);
const assets = path.resolve(
  'C:\\Users\\Никита\\.cursor\\projects\\c-Users-Melissa-tech-ru\\assets',
);
const v = 'abazhur-20261128';
const q = `?v=${v}`;
const BRAND = 'Абажур';

const HERO = 'image-02f0cc00-1b43-4c02-ab90-b2b1b0859e18.jpg';
const DOM = [
  { file: '01.jpg', asset: HERO },
  { file: '02.jpg', asset: 'image-0c5c5cef-93f3-4041-9f99-6b9401fb82bc.jpg' },
  { file: '03.jpg', asset: 'image-344c41dd-ba92-42bf-99a8-a4b0cdfb332e.jpg' },
];
const CHAN = [{ file: '01.jpg', asset: 'image-fc4c4015-ad0a-42c0-88da-6e7ff8a15106.jpg' }];
const SAUNA = [
  { file: '01.png', asset: 'image-e9fbb250-a21c-469c-8cb7-964baebe8df6.png' },
  { file: '02.jpg', asset: 'image-b10f07b5-461b-4198-9614-60140f51aad4.jpg' },
  { file: '03.jpg', asset: 'image-ce0f86c6-ca40-4e46-a180-ec8e449f2708.jpg' },
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
copySet('Купель и сауна', CHAN);
copySet('Сауна', SAUNA);
fs.copyFileSync(path.join(assets, HERO), path.join(dir, 'photoHouse', 'hero-cover.jpg'));

function paths(folder, items) {
  return items.map((e) => `photoHouse/${folder}/${e.file}`);
}

function galleryItems(files, label) {
  return files.map((f, i) => ({
    path: f,
    alt: i === 0 ? `${label} — ${BRAND}, д. Патрушева` : `${label} — ${BRAND}`,
  }));
}

const domItems = galleryItems(paths('Дом', DOM), 'Дом');
const chanItems = galleryItems(paths('Купель и сауна', CHAN), 'Чан');
const saunaItems = galleryItems(paths('Сауна', SAUNA), 'Сауна');

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
        <h3 class="album-title"><span class="title-kino-line">Абажур</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">Дом</span><span class="brand-stack__script">и терраса</span></span></h3>
        <p>Гостевой дом в д. Патрушева: тёмный фасад, светлая терраса, праздничная подсветка и уютный вход.</p>
        <div class="actions"><a class="button" href="services/dom.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>
    <article class="album-row album-row--flip" id="house-chan">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="left" data-autoplay="false" data-label="Чан" data-href="services/kupel-sauna.html">
        <script type="application/json" class="depth-carousel__items">${carouselJson(chanItems)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Чан</div>
        <h3 class="album-title"><span class="title-kino-line">Чан</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">на</span><span class="brand-stack__script">дворе</span></span></h3>
        <p>Уличный чан с подогревом — отдых зимой и летом у террасы.</p>
        <div class="actions"><a class="button" href="services/kupel-sauna.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>
    <article class="album-row" id="house-sauna">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="right" data-autoplay="false" data-label="Сауна" data-href="services/sauna.html">
        <script type="application/json" class="depth-carousel__items">${carouselJson(saunaItems)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Сауна</div>
        <h3 class="album-title"><span class="title-kino-line">Сауна</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">Парная</span><span class="brand-stack__script">внутри</span></span></h3>
        <p>Деревянная парная с каменкой, полками и видом на участок.</p>
        <div class="actions"><a class="button" href="services/sauna.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>
  </div>`;

let index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
index = index.replace(
  /<p class="intro">Дом, интерьеры[\s\S]*?<\/p>/,
  '<p class="intro">Дом, чан и сауна — только наши снимки, как у гостей на месте.</p>',
);
index = index.replace(
  /<div class="album-list">[\s\S]*?<\/div>\s*<\/section>\s*<section class="section" id="reviews">/,
  `${albumList}\n</section>\n\n<section class="section" id="reviews">`,
);
index = index.replace(/(class="heroimg-photo"[^>]*src=")[^"]+(")/, `$1photoHouse/hero-cover.jpg${q}$2`);
index = index.replace(/(<link rel="preload" as="image" href=")[^"]+(")/, `$1photoHouse/hero-cover.jpg${q}$2`);
index = index.replace(
  /class="heroimg-photo"[^>]*alt="[^"]*"/,
  `class="heroimg-photo" src="photoHouse/hero-cover.jpg${q}" alt="Абажур, гостевой дом, д. Патрушева" width="1440" height="1920" fetchpriority="high" decoding="async"`,
);
fs.writeFileSync(path.join(dir, 'index.html'), index, 'utf8');

const domTpl = fs.readFileSync(path.join(dir, 'services', 'dom.html'), 'utf8');
const phone = '+79829825404';
const phoneDisp = '+7 (982) 982-54-04';

function basePage(html) {
  return html
    .replace(/Дом — Дом отдыха/g, 'Абажур')
    .replace(/ДОМ ОТДЫХА/g, 'АБАЖУР')
    .replace(/\+79829143247/g, phone)
    .replace(/\+7 \(982\) 914-32-47/g, phoneDisp)
    .replace(/dom-otdyha[^"?]*/g, v)
    .replace(/molly-house[^"?]*/g, v);
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
  '<span class="title-kino-line">Абажур</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">Дом</span><span class="brand-stack__script">и терраса</span></span>';
const hChan =
  '<span class="title-kino-line">Чан</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">на</span><span class="brand-stack__script">участке</span></span>';
const hSauna =
  '<span class="title-kino-line">Сауна</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">Парная</span><span class="brand-stack__script">в доме</span></span>';

fs.writeFileSync(
  path.join(dir, 'services', 'dom.html'),
  servicePage({
    kicker: 'Дом',
    titleHtml: hDom,
    lead: 'Гостевой дом «Абажур» — фасад, терраса и подсветка в д. Патрушева.',
    items: domItems,
    current: 'dom',
  }),
  'utf8',
);
fs.writeFileSync(
  path.join(dir, 'services', 'kupel-sauna.html'),
  servicePage({
    kicker: 'Чан',
    titleHtml: hChan,
    lead: 'Уличный чан с подогревом на дворе.',
    items: chanItems,
    current: 'kupel-sauna',
  }),
  'utf8',
);
fs.writeFileSync(
  path.join(dir, 'services', 'sauna.html'),
  servicePage({
    kicker: 'Сауна',
    titleHtml: hSauna,
    lead: 'Деревянная парная внутри дома.',
    items: saunaItems,
    current: 'sauna',
  }),
  'utf8',
);

const albumMore = `  var ALBUMS = [
    {
      id: 'dom',
      href: 'dom.html',
      title: 'Дом',
      kicker: 'Фасад',
      lead: 'Терраса и вход',
      preview: '../photoHouse/Дом/01.jpg${q}',
    },
    {
      id: 'kupel-sauna',
      href: 'kupel-sauna.html',
      title: 'Чан',
      kicker: 'На дворе',
      lead: 'Уличный чан',
      preview: '../photoHouse/Купель и сауна/01.jpg${q}',
    },
    {
      id: 'sauna',
      href: 'sauna.html',
      title: 'Сауна',
      kicker: 'Парная',
      lead: 'Внутри дома',
      preview: '../photoHouse/Сауна/01.jpg${q}',
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
cfg.hero.imageAlt = 'Абажур, гостевой дом, д. Патрушева';
cfg.carousels = [
  { label: 'Дом', items: domItems.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })) },
  { label: 'Чан', items: chanItems.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })) },
  { label: 'Сауна', items: saunaItems.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })) },
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
    id: 'chan',
    manifestKey: 'Купель и сауна',
    label: 'Чан',
    folder: 'photoHouse/Купель и сауна',
    files: chanItems.map((it) => ({ path: it.path, alt: it.alt })),
  },
  {
    id: 'sauna',
    manifestKey: 'Сауна',
    label: 'Сауна',
    folder: 'photoHouse/Сауна',
    files: saunaItems.map((it) => ({ path: it.path, alt: it.alt })),
  },
];
cfg.meta = cfg.meta || {};
cfg.meta.cacheBust = '20261128';

applySiteConfig(cfg);
writeSiteConfig(slug, cfg);
console.log('OK', slug);