import fs from 'node:fs';
import path from 'node:path';
import { applySiteConfig } from '../lib/apply-river-home.mjs';
import { writeSiteConfig } from '../lib/import-site.mjs';
import { siteDir, siteConfigPath } from '../lib/repo.mjs';

const slug = 'dom-vyhodnogo-dnya';
const dir = siteDir(slug);
const assets = path.resolve(
  'C:\\Users\\Никита\\.cursor\\projects\\c-Users-Melissa-tech-ru\\assets',
);
const v = 'dom-vyhodnogo-20261129';
const q = `?v=${v}`;
const BRAND = 'Дом выходного дня';

const PH1 = 'image-32a14e62-e3db-4d3f-86a2-7b926281c459.jpg';
const DOM = [
  { file: '01.jpg', asset: 'image-5c9b4f52-b8bd-4f5b-b3df-8d2c92a3cf16.jpg' },
  { file: '02.jpg', asset: 'image-4b1c8f5c-0903-4443-96ca-8604230944e2.jpg' },
  { file: '03.jpg', asset: 'image-3ebdca2f-5f88-4ec8-8877-4b092155cbf0.jpg' },
  { file: '04.jpg', asset: 'image-80be198e-6092-4574-a5e0-7ac5d62b49c5.jpg' },
];
const INSIDE = [
  { file: '01.jpg', asset: 'image-163dc2e3-62a9-40fb-9b9d-c4fd8632cdb2.jpg' },
  { file: '02.jpg', asset: 'image-807a2f76-10c0-4eb1-97a0-e421ae3fc197.jpg' },
];
const POOL = [
  { file: '01.jpg', asset: 'image-b12111fb-dd36-4c5b-9218-867d30998394.jpg' },
  { file: '02.jpg', asset: 'image-720718db-8cb8-4a64-8caf-3de9d6628846.jpg' },
  { file: '03.jpg', asset: 'image-e816ec99-2ed3-40b9-96c5-47c8bf7953b4.jpg' },
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

function wipeFolder(folder) {
  const destDir = path.join(dir, 'photoHouse', folder);
  if (!fs.existsSync(destDir)) return;
  for (const old of fs.readdirSync(destDir)) {
    try {
      fs.unlinkSync(path.join(destDir, old));
    } catch {
      /* ignore */
    }
  }
}

copySet('Дом', DOM);
copySet('Комнаты - Внутри дома', INSIDE);
copySet('Бассейн', POOL);
fs.copyFileSync(path.join(assets, PH1), path.join(dir, 'photoHouse', 'hero-cover.jpg'));
for (const folder of ['Санузел', 'Прихожая', 'Купель и сауна', 'Территория у дома']) {
  wipeFolder(folder);
}

function paths(folder, items) {
  return items.map((e) => `photoHouse/${folder}/${e.file}`);
}

function galleryItems(files, label) {
  return files.map((f, i) => ({
    path: f,
    alt: i === 0 ? `${label} — ${BRAND}, с. Борки` : `${label} — ${BRAND}`,
  }));
}

const domItems = galleryItems(paths('Дом', DOM), 'Дом');
const insideItems = galleryItems(paths('Комнаты - Внутри дома', INSIDE), 'Внутри');
const poolItems = galleryItems(paths('Бассейн', POOL), 'Бассейн');

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
        <h3 class="album-title"><span class="title-kino-line">Дом</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">снаружи</span><span class="brand-stack__script">терраса и двор</span></span></h3>
        <p>Кирпичный дом в с. Борки: фасад, терраса со столиком и беседка на участке.</p>
        <div class="actions"><a class="button" href="services/dom.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>
    <article class="album-row album-row--flip" id="house-inside">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="left" data-autoplay="false" data-label="Комнаты" data-href="services/komnaty.html">
        <script type="application/json" class="depth-carousel__items">${carouselJson(insideItems)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Внутри</div>
        <h3 class="album-title"><span class="title-kino-line">Внутри</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">дома</span><span class="brand-stack__script">спальня и кухня</span></span></h3>
        <p>Деревянный интерьер: спальня и кухня-гостиная.</p>
        <div class="actions"><a class="button" href="services/komnaty.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>
    <article class="album-row" id="house-pool">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="right" data-autoplay="false" data-label="Бассейн" data-href="services/basseyn.html">
        <script type="application/json" class="depth-carousel__items">${carouselJson(poolItems)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Бассейн</div>
        <h3 class="album-title"><span class="title-kino-line">Бассейн</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">в доме</span><span class="brand-stack__script">крытый</span></span></h3>
        <p>Крытый бассейн в доме — спокойная вода и гидромассаж.</p>
        <div class="actions"><a class="button" href="services/basseyn.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>
  </div>`;

let index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
index = index.replace(
  /<p class="intro">[\s\S]*?<\/p>/,
  '<p class="intro">Дом, интерьер и крытый бассейн — только наши фото.</p>',
);
index = index.replace(
  /<div class="album-list">[\s\S]*?<\/div>\s*<\/section>\s*<section class="section" id="reviews">/,
  `${albumList}\n</section>\n\n<section class="section" id="reviews">`,
);
index = index.replace(
  /<div class="heroimg">\s*<img class="heroimg-photo"[^>]*>/,
  `<div class="heroimg"><img class="heroimg-photo" src="photoHouse/hero-cover.jpg${q}" alt="Дом выходного дня, терраса, с. Борки" width="1440" height="1920" fetchpriority="high" decoding="async">`,
);
index = index.replace(/(<link rel="preload" as="image" href=")[^"]+(")/, `$1photoHouse/hero-cover.jpg${q}$2`);
fs.writeFileSync(path.join(dir, 'index.html'), index, 'utf8');

const domTpl = fs.readFileSync(path.join(dir, 'services', 'dom.html'), 'utf8');
const phone = '+79322003553';
const phoneDisp = '+7 (932) 200-35-53';

function basePage(html) {
  return html
    .replace(/Дом — Дом отдыха/g, 'Дом выходного дня')
    .replace(/ДОМ ОТДЫХА/g, 'ДОМ ВЫХОДНОГО ДНЯ')
    .replace(/\+79829143247/g, phone)
    .replace(/\+7 \(982\) 914-32-47/g, phoneDisp)
    .replace(/\?v=[^"'&\s]+/g, q);
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
  html = html.replace(/data-album-current="[^"]*"/, `data-album-current="${current}"`);
  return html;
}

const hDom =
  '<span class="title-kino-line">Дом</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">снаружи</span><span class="brand-stack__script">терраса и двор</span></span>';
const hIn =
  '<span class="title-kino-line">Внутри</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">дома</span><span class="brand-stack__script">спальня и кухня</span></span>';
const hPool =
  '<span class="title-kino-line">Бассейн</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">крытый</span><span class="brand-stack__script">в доме</span></span>';

fs.writeFileSync(
  path.join(dir, 'services', 'dom.html'),
  servicePage({
    kicker: 'Дом',
    titleHtml: hDom,
    lead: 'Фасад, терраса и двор в с. Борки, Береговая улица, 6.',
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
    lead: 'Спальня и кухня-гостиная в деревянном интерьере.',
    items: insideItems,
    current: 'komnaty',
  }),
  'utf8',
);
fs.writeFileSync(
  path.join(dir, 'services', 'basseyn.html'),
  servicePage({
    kicker: 'Бассейн',
    titleHtml: hPool,
    lead: 'Крытый бассейн в доме — спокойная вода и гидромассаж.',
    items: poolItems,
    current: 'basseyn',
  }),
  'utf8',
);

const albumMore = `  var ALBUMS = [
    {
      id: 'dom',
      href: 'dom.html',
      title: 'Дом',
      kicker: 'Снаружи',
      lead: 'Фасад, терраса и двор',
      preview: '../photoHouse/Дом/01.jpg${q}',
    },
    {
      id: 'komnaty',
      href: 'komnaty.html',
      title: 'Внутри',
      kicker: 'Интерьер',
      lead: 'Спальня и кухня',
      preview: '../photoHouse/Комнаты - Внутри дома/01.jpg${q}',
    },
    {
      id: 'basseyn',
      href: 'basseyn.html',
      title: 'Бассейн',
      kicker: 'В доме',
      lead: 'Крытый бассейн',
      preview: '../photoHouse/Бассейн/01.jpg${q}',
    },
  ];`;

fs.writeFileSync(
  path.join(dir, 'album-more.js'),
  fs
    .readFileSync(path.join(dir, 'album-more.js'), 'utf8')
    .replace(/var ALBUMS = \[[\s\S]*?\];/, albumMore),
  'utf8',
);

let services = fs.readFileSync(path.join(dir, 'services.html'), 'utf8');
services = services.replace(
  /<div class="service-list">[\s\S]*?<\/div>/,
  `<div class="service-list">
    <a class="service-row" href="services/dom.html" id="album-01"><div class="idx">01</div><div><h3>Дом снаружи</h3><div class="service-desc"><p class="service-lead">Фасад, терраса и двор.</p></div></div><div class="cost">4 фото</div></a>
    <a class="service-row" href="services/komnaty.html" id="album-02"><div class="idx">02</div><div><h3>Внутри дома</h3><div class="service-desc"><p class="service-lead">Спальня и кухня-гостиная.</p></div></div><div class="cost">2 фото</div></a>
    <a class="service-row" href="services/basseyn.html" id="album-03"><div class="idx">03</div><div><h3>Бассейн</h3><div class="service-desc"><p class="service-lead">Крытый бассейн в доме.</p></div></div><div class="cost">3 фото</div></a>
  </div>`,
);
services = services.replace(
  /<p>Альбомы:[\s\S]*?<\/p>/,
  '<p>Альбомы: дом снаружи, внутри и крытый бассейн.</p>',
);
fs.writeFileSync(path.join(dir, 'services.html'), services, 'utf8');

const cfg = JSON.parse(fs.readFileSync(siteConfigPath(slug), 'utf8'));
cfg.gallery = { hero: 'photoHouse/hero-cover.jpg', cacheQuery: q };
cfg.hero = cfg.hero || {};
cfg.hero.imageAlt = 'Дом выходного дня, терраса, с. Борки, Береговая улица, 6';
cfg.carousels = [
  { label: 'Дом', items: domItems.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })) },
  { label: 'Комнаты', items: insideItems.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })) },
  { label: 'Бассейн', items: poolItems.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })) },
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
    id: 'basseyn',
    manifestKey: 'Бассейн',
    label: 'Бассейн',
    folder: 'photoHouse/Бассейн',
    files: poolItems.map((it) => ({ path: it.path, alt: it.alt })),
  },
];
cfg.meta = cfg.meta || {};
cfg.meta.cacheBust = '20261129';

applySiteConfig(cfg);
writeSiteConfig(slug, cfg);
console.log('OK', slug);
