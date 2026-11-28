import fs from 'node:fs';
import path from 'node:path';
import { applySiteConfig } from '../lib/apply-river-home.mjs';
import { writeSiteConfig } from '../lib/import-site.mjs';
import { siteDir, siteConfigPath } from '../lib/repo.mjs';

const slug = 'molly-house-tyumen';
const dir = siteDir(slug);
const assets = path.resolve(
  'C:\\Users\\Никита\\.cursor\\projects\\c-Users-Melissa-tech-ru\\assets',
);
const v = 'molly-house-20261128';
const q = `?v=${v}`;
const BRAND = 'Молли Хаус';

const HERO = 'image-01575c31-36c3-4101-b8da-1a25410df08a.jpg';
const INSIDE = [
  { file: '01.jpg', asset: 'image-ff272bdc-e116-4af9-928c-8c4f006b0b91.jpg' },
  { file: '02.jpg', asset: 'image-5ec6e5b2-1bb0-4f7c-8101-aa003009e79d.jpg' },
  { file: '03.jpg', asset: 'image-0d173b6a-fd8a-4a46-a5da-66e586bbfd5c.jpg' },
  { file: '04.png', asset: 'image-d94f8ebb-c266-485d-89e4-b98b8cfcecbb.png' },
];
const DOM = [{ file: '01.jpg', asset: 'image-f36dfb03-da93-4d2d-9063-bc737b45d5a0.jpg' }];
const TERRITORY = [
  { file: '01.jpg', asset: 'image-83252ef8-af17-4641-ada4-3cdba67c7eb6.jpg' },
  { file: '02.jpg', asset: 'image-ea798ebe-edfe-4564-9a0e-4006c459dcf0.jpg' },
  { file: '03.jpg', asset: 'image-cc9af6cd-5626-46c7-a0b4-ca95c746d07f.jpg' },
  { file: '04.jpg', asset: 'image-66abcc54-c6d8-4775-8322-4a552c72ea41.jpg' },
];
const KUPEL = [{ file: '01.jpg', asset: 'image-35325812-fecd-4c38-bf6d-6dffc2fadc32.jpg' }];

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
copySet('Территория у дома', TERRITORY);
copySet('Купель и сауна', KUPEL);
fs.copyFileSync(path.join(assets, HERO), path.join(dir, 'photoHouse', 'hero-cover.jpg'));

function paths(folder, items) {
  return items.map((e) => `photoHouse/${folder}/${e.file}`);
}

function galleryItems(files, label) {
  return files.map((f, i) => ({
    path: f,
    alt: i === 0 ? `${label} — ${BRAND}, д. Якуши` : `${label} — ${BRAND}`,
  }));
}

const domItems = galleryItems(paths('Дом', DOM), 'Дом');
const insideItems = galleryItems(paths('Комнаты - Внутри дома', INSIDE), 'Внутри');
const terrItems = galleryItems(paths('Территория у дома', TERRITORY), 'Территория');
const kupelItems = galleryItems(paths('Купель и сауна', KUPEL), 'Купель');

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
        <h3 class="album-title"><span class="title-kino-line">Дом</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">Молли Хаус</span><span class="brand-stack__script">снаружи</span></span></h3>
        <p>Гостевой дом из светлого дерева: терраса, панорамные окна и отдых у сосен в д. Якуши.</p>
        <div class="actions"><a class="button" href="services/dom.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>
    <article class="album-row album-row--flip" id="house-inside">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="left" data-autoplay="false" data-label="Комнаты" data-href="services/komnaty.html">
        <script type="application/json" class="depth-carousel__items">${carouselJson(insideItems)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Комнаты</div>
        <h3 class="album-title"><span class="title-kino-line">Комнаты</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">Внутри</span><span class="brand-stack__script">дома</span></span></h3>
        <p>Гостиная с панорамными окнами, обеденная зона, спальни и современная ванная.</p>
        <div class="actions"><a class="button" href="services/komnaty.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>
    <article class="album-row">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="right" data-autoplay="false" data-label="Территория" data-href="services/territoriya.html">
        <script type="application/json" class="depth-carousel__items">${carouselJson(terrItems)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Территория</div>
        <h3 class="album-title"><span class="title-kino-line">У дома</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">Двор</span><span class="brand-stack__script">и терраса</span></span></h3>
        <p>Крытая терраса, зона отдыха, мангал и озеленённый участок среди сосен.</p>
        <div class="actions"><a class="button" href="services/territoriya.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>
    <article class="album-row album-row--flip" id="house-kupel">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="left" data-autoplay="false" data-label="Купель" data-href="services/kupel-sauna.html">
        <script type="application/json" class="depth-carousel__items">${carouselJson(kupelItems)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Купель</div>
        <h3 class="album-title"><span class="title-kino-line">Купель</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">и</span><span class="brand-stack__script">чан</span></span></h3>
        <p>Фурако на участке — для релакса на свежем воздухе после бани или просто вечером.</p>
        <div class="actions"><a class="button" href="services/kupel-sauna.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>
  </div>`;

let index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
index = index.replace(
  /<p class="intro">Дом, интерьеры[\s\S]*?<\/p>/,
  '<p class="intro">Дом, интерьер, двор и купель — только наши фото, как у гостей.</p>',
);
index = index.replace(
  /<div class="album-list">[\s\S]*?<\/div>\s*<\/section>\s*<section class="section" id="reviews">/,
  `${albumList}\n</section>\n\n<section class="section" id="reviews">`,
);
index = index.replace(/(class="heroimg-photo"[^>]*src=")[^"]+(")/, `$1photoHouse/hero-cover.jpg${q}$2`);
index = index.replace(/(<link rel="preload" as="image" href=")[^"]+(")/, `$1photoHouse/hero-cover.jpg${q}$2`);
index = index.replace(
  /class="heroimg-photo"[^>]*alt="[^"]*"/,
  `class="heroimg-photo" src="photoHouse/hero-cover.jpg${q}" alt="Молли Хаус, гостевой дом, д. Якуши" width="1440" height="1920" fetchpriority="high" decoding="async"`,
);
fs.writeFileSync(path.join(dir, 'index.html'), index, 'utf8');

const domTpl = fs.readFileSync(path.join(dir, 'services', 'dom.html'), 'utf8');
const phone = '+79224850171';
const phoneDisp = '+7 (922) 485-01-71';

function basePage(html) {
  return html
    .replace(/Дом — Дом отдыха/g, 'Молли Хаус')
    .replace(/ДОМ ОТДЫХА/g, 'МОЛЛИ ХАУС')
    .replace(/\+79829143247/g, phone)
    .replace(/\+7 \(982\) 914-32-47/g, phoneDisp)
    .replace(/dom-otdyha[^"?]*/g, v);
}

function servicePage({ kicker, titleHtml, lead, items, current, id }) {
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
  '<span class="title-kino-line">Дом</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">Молли Хаус</span><span class="brand-stack__script">снаружи</span></span>';
const hIn =
  '<span class="title-kino-line">Комнаты</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">Внутри</span><span class="brand-stack__script">дома</span></span>';
const hTerr =
  '<span class="title-kino-line">Территория</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">У дома</span><span class="brand-stack__script">во дворе</span></span>';
const hKu =
  '<span class="title-kino-line">Купель</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">и</span><span class="brand-stack__script">чан</span></span>';

fs.writeFileSync(
  path.join(dir, 'services', 'dom.html'),
  servicePage({
    kicker: 'Дом',
    titleHtml: hDom,
    lead: 'Гостевой дом из светлого дерева в д. Якуши — терраса и сосны.',
    items: domItems,
    current: 'dom',
  }),
  'utf8',
);
fs.writeFileSync(
  path.join(dir, 'services', 'komnaty.html'),
  servicePage({
    kicker: 'Комнаты',
    titleHtml: hIn,
    lead: 'Гостиная, столовая, спальни и ванная — с панорамными окнами.',
    items: insideItems,
    current: 'komnaty',
  }),
  'utf8',
);
fs.writeFileSync(
  path.join(dir, 'services', 'territoriya.html'),
  servicePage({
    kicker: 'Территория',
    titleHtml: hTerr,
    lead: 'Терраса, двор, мангал и зона отдыха на участке.',
    items: terrItems,
    current: 'territoriya',
  }),
  'utf8',
);
fs.writeFileSync(
  path.join(dir, 'services', 'kupel-sauna.html'),
  servicePage({
    kicker: 'Купель',
    titleHtml: hKu,
    lead: 'Фурако на участке — релакс на свежем воздухе.',
    items: kupelItems,
    current: 'kupel-sauna',
  }),
  'utf8',
);

const albumMore = `  var ALBUMS = [
    {
      id: 'dom',
      href: 'dom.html',
      title: 'Дом',
      kicker: 'Снаружи',
      lead: 'Фасад и терраса',
      preview: '../photoHouse/Дом/01.jpg${q}',
    },
    {
      id: 'komnaty',
      href: 'komnaty.html',
      title: 'Комнаты',
      kicker: 'Внутри',
      lead: 'Гостиная и спальни',
      preview: '../photoHouse/Комнаты - Внутри дома/01.jpg${q}',
    },
    {
      id: 'territoriya',
      href: 'territoriya.html',
      title: 'Территория',
      kicker: 'Двор',
      lead: 'Терраса и участок',
      preview: '../photoHouse/Территория у дома/01.jpg${q}',
    },
    {
      id: 'kupel-sauna',
      href: 'kupel-sauna.html',
      title: 'Купель',
      kicker: 'Чан',
      lead: 'Фурако на участке',
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
cfg.hero.imageAlt = 'Молли Хаус, гостевой дом, д. Якуши';
cfg.carousels = [
  { label: 'Дом', items: domItems.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })) },
  { label: 'Комнаты', items: insideItems.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })) },
  { label: 'Территория', items: terrItems.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })) },
  { label: 'Купель', items: kupelItems.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })) },
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
    id: 'territory',
    manifestKey: 'Территория у дома',
    label: 'Территория',
    folder: 'photoHouse/Территория у дома',
    files: terrItems.map((it) => ({ path: it.path, alt: it.alt })),
  },
  {
    id: 'kupel',
    manifestKey: 'Купель и сауна',
    label: 'Купель',
    folder: 'photoHouse/Купель и сауна',
    files: kupelItems.map((it) => ({ path: it.path, alt: it.alt })),
  },
];
cfg.meta = cfg.meta || {};
cfg.meta.cacheBust = '20261128';

applySiteConfig(cfg);
writeSiteConfig(slug, cfg);
console.log('OK', slug);