import fs from 'node:fs';
import path from 'node:path';
import { siteDir, siteConfigPath, REPO_ROOT } from '../lib/repo.mjs';
import { applySiteConfig } from '../lib/apply-river-home.mjs';
import { writeSiteConfig } from '../lib/import-site.mjs';

const slug = 'villa-perevalovo';
const v = '?v=villa-sanuzel-20261127';
const dir = siteDir(slug);
const assets = 'C:/Users/Никита/.cursor/projects/c-Users-Melissa-tech-ru/assets';

const SOURCES = [
  `${assets}/image-f239589e-275e-4d46-a926-d2c0bd40c9c0.png`,
  `${assets}/image-599aaae0-9d89-4b40-aafb-8f127c808a50.jpg`,
  `${assets}/image-f35a2fef-212f-434d-ae2c-75d1f7352cf1.png`,
  `${assets}/image-05f00555-2022-40e6-956e-2013a5cb2ae3.png`,
  `${assets}/image-4ec7451b-37a1-436f-92aa-e57e4a3ea27c.png`,
  `${assets}/image-4f04f281-ab87-40aa-af35-06975dd17dca.png`,
];

function extOf(file) {
  return path.extname(file).toLowerCase() || '.jpg';
}

function copyTo(dest, src) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

const sanuzelFiles = SOURCES.map((src, i) => {
  const num = String(i + 1).padStart(2, '0');
  const rel = `photoHouse/Санузел/${num}${extOf(src)}`;
  copyTo(path.join(dir, rel), src);
  return { path: rel, alt: 'Санузел и ванная' };
});

function img(f) {
  return { image: `${f.path}${v}`, alt: f.alt };
}

const cfg = JSON.parse(fs.readFileSync(siteConfigPath(slug), 'utf8'));
const villaAlbum = cfg.albums.find((a) => a.id === 'villa');
const insideAlbum = cfg.albums.find((a) => a.id === 'inside');
const dosugAlbum = cfg.albums.find((a) => a.id === 'dosug');

cfg.albums = [
  villaAlbum,
  insideAlbum,
  {
    id: 'sanuzel',
    manifestKey: 'Санузел',
    label: 'Санузел',
    folder: 'photoHouse/Санузел',
    files: sanuzelFiles,
  },
  dosugAlbum,
].filter(Boolean);

cfg.carousels = [
  { label: 'Вилла', items: villaAlbum.files.map((f) => img(f)) },
  { label: 'Комнаты', items: insideAlbum.files.map((f) => img(f)) },
  { label: 'Санузел', items: sanuzelFiles.map(img) },
  { label: 'Досуг', items: dosugAlbum.files.map((f) => img(f)) },
];

function regenGallery(page, files) {
  const p = path.join(dir, page);
  let html = fs.readFileSync(p, 'utf8');
  const galleryStart = html.indexOf('<div class="gallery gallery--portfolio">');
  if (galleryStart < 0) return;
  let items = '';
  for (const f of files) {
    const href = `../${f.path}${v}`;
    items += `<a class="g g--media" href="${href}"><img data-src="${href}" alt="${f.alt}" loading="lazy" decoding="async"></a>\n    `;
  }
  const sectionEnd = html.indexOf('</section>', galleryStart);
  html =
    html.slice(0, galleryStart) +
    `<div class="gallery gallery--portfolio">\n    ${items}  </div>\n` +
    html.slice(sectionEnd);
  fs.writeFileSync(p, html, 'utf8');
}

const sanuzelTpl = fs.readFileSync(path.join(dir, 'services/komnaty.html'), 'utf8');
let sanuzelPage = sanuzelTpl
  .replace(/<title>[\s\S]*?<\/title>/, '<title>Санузел — Вилла Перевалово</title>')
  .replace(
    /<section class="subpage-hero subpage-hero--service">[\s\S]*?<\/section>/,
    `<section class="subpage-hero subpage-hero--service">
  <div class="kicker">Санузел</div>
  <h1><span class="title-kino-line">Санузел</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">и</span><span class="brand-stack__script">ванная</span></span></h1>
  <p>Мраморная плитка, подсветка зеркал, душевая и всё для комфортного проживания гостей.</p>
</section>`,
  )
  .replace('data-album-current="komnaty"', 'data-album-current="sanuzel"');
fs.writeFileSync(path.join(dir, 'services/sanuzel.html'), sanuzelPage, 'utf8');
regenGallery('services/sanuzel.html', sanuzelFiles);

const sanuzelBlock = `<article class="album-row" id="house-sanuzel">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="right" data-autoplay="false" data-label="Санузел" data-href="services/sanuzel.html">
        <script type="application/json" class="depth-carousel__items">${JSON.stringify(cfg.carousels[2].items)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Санузел</div>
        <h3 class="album-title"><span class="title-kino-line">Санузел</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">и</span><span class="brand-stack__script">душ</span></span></h3>
        <p>Современные ванные комнаты с мраморной отделкой, подсветкой и просторной душевой.</p>
        <div class="actions"><a class="button" href="services/sanuzel.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>`;

const dosugBlock = `<article class="album-row album-row--flip" id="house-dosug">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="left" data-autoplay="false" data-label="Досуг" data-href="services/kupel-sauna.html">
        <script type="application/json" class="depth-carousel__items">${JSON.stringify(cfg.carousels[3].items)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Досуг</div>
        <h3 class="album-title"><span class="title-kino-line">Бассейн</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">Бильярд</span><span class="brand-stack__script">детская</span></span></h3>
        <p>Бассейн, бильярдная и детская игровая комната — для взрослых и детей на одной вилле.</p>
        <div class="actions"><a class="button" href="services/kupel-sauna.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>`;

let index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
index = index.replace(/<article class="album-row" id="house-sanuzel">[\s\S]*?<\/article>\s*/g, '');
index = index.replace(/<article class="album-row(?: album-row--flip)?" id="house-dosug">[\s\S]*?<\/article>\s*/g, '');

index = index.replace(
  /(<article class="album-row album-row--flip" id="house-inside">[\s\S]*?<\/article>)\s*/,
  `$1\n    ${sanuzelBlock}\n    ${dosugBlock}\n    `,
);

index = index.replace(
  /Вилла снаружи, интерьеры и досуг:[^<]+/,
  'Вилла снаружи, интерьеры, санузел, бассейн и бильярд — всё для отдыха и мероприятий.',
);
fs.writeFileSync(path.join(dir, 'index.html'), index, 'utf8');

fs.writeFileSync(
  path.join(dir, 'album-more.js'),
  fs
    .readFileSync(path.join(REPO_ROOT, 'river-home-terentievo', 'album-more.js'), 'utf8')
    .replace(
      /var ALBUMS = \[[\s\S]*?\];/,
      `var ALBUMS = [
    {
      id: 'komnaty',
      href: 'komnaty.html',
      title: 'Комнаты',
      kicker: 'Интерьер',
      lead: 'Гостиная, столовая и спальни',
      preview: '../photoHouse/Комнаты - Внутри дома/03.jpg?v=villa-photos-20261127',
    },
    {
      id: 'sanuzel',
      href: 'sanuzel.html',
      title: 'Санузел',
      kicker: 'Ванная',
      lead: 'Душевая и современная отделка',
      preview: '../photoHouse/Санузел/02.jpg${v}',
    },
    {
      id: 'kupel-sauna',
      href: 'kupel-sauna.html',
      title: 'Досуг',
      kicker: 'На вилле',
      lead: 'Бассейн, бильярд и детская',
      preview: '../photoHouse/Досуг/01-basseyn.jpg?v=villa-dosug-20261127',
    },
    {
      id: 'territoriya',
      href: 'territoriya.html',
      title: 'Вилла',
      kicker: 'Снаружи',
      lead: 'Фасад и территория',
      preview: '../photoHouse/Вилла/01.png?v=villa-photos-20261127',
    },
  ];`,
    ),
  'utf8',
);

applySiteConfig(cfg);
writeSiteConfig(slug, cfg);
console.log('Sanuzel:', sanuzelFiles.length, 'photos — after Комнаты');