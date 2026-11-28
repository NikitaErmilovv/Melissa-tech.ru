import fs from 'node:fs';
import path from 'node:path';
import { applySiteConfig } from '../lib/apply-river-home.mjs';
import { writeSiteConfig } from '../lib/import-site.mjs';
import { siteDir, siteConfigPath } from '../lib/repo.mjs';

const slug = 'nashe-mesto-tyumen';
const dir = siteDir(slug);
const assets = path.resolve(
  'C:\\Users\\Никита\\.cursor\\projects\\c-Users-Melissa-tech-ru\\assets',
);

/** @type {Record<string, string>} */
const ASSET_MAP = {
  '01.jpg': 'image-0ebc685e-7737-42b6-ab67-29d7a23d977f.jpg',
  '02.jpg': 'image-ee28379c-2807-48b9-a82d-c9efa226e993.jpg',
  '03.jpg': 'image-8b9f8314-2c69-4294-b35b-525576bfc865.jpg',
  '04.jpg': 'image-2e511823-e21f-4235-ab7d-75322e7c365f.jpg',
  '05.jpg': 'image-7babb0d6-dc3d-4966-8a43-d9d2e23943d3.jpg',
  '06.jpg': 'image-b1db8d8f-ff4c-4294-8744-b0780f84e896.jpg',
};

/** @type {Record<string, string>} */
const AFRAME_MAP = {
  '01.jpg': 'image-f117ecc4-4b24-4c49-a1c6-914eed5c8c35.jpg',
  '02.jpg': 'image-cf00c2f9-434f-47eb-8ffd-43ee66cd190d.jpg',
  '03.jpg': 'image-0d6db03a-4e88-4bc0-a7dc-0ca24b897d1d.jpg',
  '04.jpg': 'image-4eb77c3d-458c-4311-be5f-57576021fa9b.jpg',
  '05.jpg': 'image-ee9e3546-ce79-4fe8-885c-4679b89acb36.jpg',
};

const v = 'nashe-mesto-20261128';
const q = `?v=${v}`;
const barnDir = path.join(dir, 'photoHouse', 'Барнхаус');
const aDir = path.join(dir, 'photoHouse', 'А-фрейм');

function copyMap(map, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const [outName, assetName] of Object.entries(map)) {
    const src = path.join(assets, assetName);
  if (!fs.existsSync(src)) throw new Error(`Asset missing: ${assetName}`);
    fs.copyFileSync(src, path.join(destDir, outName));
  }
}

copyMap(ASSET_MAP, barnDir);
copyMap(AFRAME_MAP, aDir);
fs.copyFileSync(path.join(barnDir, '01.jpg'), path.join(dir, 'photoHouse', 'hero-cover.jpg'));

function rel(p) {
  return p.replace(/\\/g, '/');
}

const barnPaths = Object.keys(ASSET_MAP).map((f) => `photoHouse/Барнхаус/${f}`);
const aPaths = Object.keys(AFRAME_MAP).map((f) => `photoHouse/А-фрейм/${f}`);

function galleryItems(files, label) {
  return files.map((f, i) => {
    const alt =
      i === 0
        ? `${label} — фасад и территория, Наше Место`
        : `${label} — Наше Место, с. Кулига`;
    return { path: f, alt };
  });
}

const barnItems = galleryItems(barnPaths, 'Барнхаус');
const aItems = galleryItems(aPaths, 'А-фрейм');

function carouselJson(items) {
  return JSON.stringify(
    items.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })),
  );
}

function galleryHtml(items, folderHref) {
  return items
    .map(
      (it) =>
        `<a class="g g--media" href="../${it.path}${q}"><img data-src="../${it.path}${q}" alt="${it.alt.replace(/"/g, '&quot;')}" loading="lazy" decoding="async"></a>`,
    )
    .join('\n    ');
}

const barnCarousel = carouselJson(barnItems);
const aCarousel = carouselJson(aItems);

const albumList = `  <div class="album-list">
    <article class="album-row" id="house-barnhaus">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="right" data-autoplay="false" data-label="Барнхаус" data-href="services/barnhaus.html">
        <script type="application/json" class="depth-carousel__items">${barnCarousel}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Барнхаус</div>
        <h3 class="album-title"><span class="title-kino-line">Барнхаус</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">Дом</span><span class="brand-stack__script">и двор</span></span></h3>
        <p>Дом из светлого дерева: терраса с панорамными окнами, чан, костровая зона и отдых у сосен.</p>
        <div class="actions"><a class="button" href="services/barnhaus.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>
    <article class="album-row album-row--flip" id="house-aframe">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="left" data-autoplay="false" data-label="А-фрейм" data-href="services/a-frame.html">
        <script type="application/json" class="depth-carousel__items">${aCarousel}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">А-фрейм</div>
        <h3 class="album-title"><span class="title-kino-line">А-фрейм</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">Дом</span><span class="brand-stack__script">и терраса</span></span></h3>
        <p>Треугольный дом с панорамным остеклением, качелями, террасой и отдельной чановой зоной.</p>
        <div class="actions"><a class="button" href="services/a-frame.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>
  </div>`;

let index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
index = index.replace(
  /<p class="intro">Дом, интерьеры[\s\S]*?<\/p>/,
  '<p class="intro">Два формата отдыха на одной территории: барнхаус и а-фрейм — чан, кострище и лес.</p>',
);
index = index.replace(/<div class="album-list">[\s\S]*?<\/div>\s*<\/section>\s*<section class="section" id="reviews">/, `${albumList}\n</section>\n\n<section class="section" id="reviews">`);

index = index.replace(
  /(class="heroimg-photo"[^>]*src=")[^"]+(")/,
  `$1photoHouse/hero-cover.jpg${q}$2`,
);
index = index.replace(
  /(<link rel="preload" as="image" href=")[^"]+(")/,
  `$1photoHouse/hero-cover.jpg${q}$2`,
);
fs.writeFileSync(path.join(dir, 'index.html'), index, 'utf8');

const domTpl = fs.readFileSync(path.join(dir, 'services', 'dom.html'), 'utf8');

function albumPage({ id, kicker, titleHtml, lead, items, current }) {
  let html = domTpl
    .replace(/Дом — Дом отдыха/, `${kicker} — Наше Место`)
    .replace(/ДОМ ОТДЫХА/g, 'НАШЕ МЕСТО')
    .replace(/\+79829143247/g, '+79224766947')
    .replace(/\+7 \(982\) 914-32-47/g, '+7 (922) 476-69-47')
    .replace(
      /<section class="subpage-hero[\s\S]*?<\/section>/,
      `<section class="subpage-hero subpage-hero--service">
  <div class="kicker">${kicker}</div>
  <h1>${titleHtml}</h1>
  <p>${lead}</p>
</section>`,
    )
    const galleryBlock = `<section class="section section--album-gallery">
  <div class="gallery gallery--portfolio">
    ${galleryHtml(items, '')}
  </div>
</section>`;

  html = html.replace(
    /<section class="section section--album-gallery">[\s\S]*?<\/section>/,
    galleryBlock,
  );
  html = html.replace(/data-album-current="dom"/, `data-album-current="${current}"`);
  html = html.replace(/dom-otdyha-20261127/g, v);
  return html;
}

fs.writeFileSync(
  path.join(dir, 'services', 'barnhaus.html'),
  albumPage({
    id: 'barnhaus',
    kicker: 'Барнхаус',
    titleHtml:
      '<span class="title-kino-line">Барнхаус</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">Дом</span><span class="brand-stack__script">и двор</span></span>',
    lead: 'Дом из светлого дерева: терраса, чан, костровая зона и отдых у сосен.',
    items: barnItems,
    current: 'barnhaus',
  }),
  'utf8',
);

fs.writeFileSync(
  path.join(dir, 'services', 'a-frame.html'),
  albumPage({
    id: 'a-frame',
    kicker: 'А-фрейм',
    titleHtml:
      '<span class="title-kino-line">А-фрейм</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">Дом</span><span class="brand-stack__script">и терраса</span></span>',
    lead: 'Треугольный дом с панорамным остеклением, качелями и чановой зоной.',
    items: aItems,
    current: 'a-frame',
  }),
  'utf8',
);

const albumMore = `  var ALBUMS = [
    {
      id: 'barnhaus',
      href: 'barnhaus.html',
      title: 'Барнхаус',
      kicker: 'Дом',
      lead: 'Терраса, чан и двор',
      preview: '../photoHouse/Барнхаус/01.jpg${q}',
    },
    {
      id: 'a-frame',
      href: 'a-frame.html',
      title: 'А-фрейм',
      kicker: 'Дом',
      lead: 'Панорама и терраса',
      preview: '../photoHouse/А-фрейм/01.jpg${q}',
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
cfg.carousels = [
  { label: 'Барнхаус', items: barnItems.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })) },
  { label: 'А-фрейм', items: aItems.map((it) => ({ image: `${it.path}${q}`, alt: it.alt })) },
];
cfg.albums = [
  {
    id: 'barnhaus',
    manifestKey: 'Барнхаус',
    label: 'Барнхаус',
    folder: 'photoHouse/Барнхаус',
    files: barnItems.map((it) => ({ path: it.path, alt: it.alt })),
  },
  {
    id: 'a-frame',
    manifestKey: 'А-фрейм',
    label: 'А-фрейм',
    folder: 'photoHouse/А-фрейм',
    files: aItems.map((it) => ({ path: it.path, alt: it.alt })),
  },
];
cfg.hero = cfg.hero || {};
cfg.hero.imageAlt = 'Барнхаус «Наше Место», с. Кулига';
cfg.meta = cfg.meta || {};
cfg.meta.cacheBust = '20261128';

applySiteConfig(cfg);
writeSiteConfig(slug, cfg);
console.log('OK', slug, 'barnhaus', barnItems.length, 'a-frame', aItems.length);