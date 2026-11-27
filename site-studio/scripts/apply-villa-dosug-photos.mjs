import fs from 'node:fs';
import path from 'node:path';
import { siteDir, siteConfigPath, REPO_ROOT } from '../lib/repo.mjs';
import { applySiteConfig } from '../lib/apply-river-home.mjs';
import { writeSiteConfig } from '../lib/import-site.mjs';

const slug = 'villa-perevalovo';
const v = '?v=villa-dosug-20261127';
const dir = siteDir(slug);
const assets = 'C:/Users/Никита/.cursor/projects/c-Users-Melissa-tech-ru/assets';

const POOL = `${assets}/image-13701ae4-3fa3-457e-818c-145730cf530d.jpg`;
const BILL1 = `${assets}/image-68295dc9-7a1e-4681-b89d-223b52639a89.png`;
const BILL2 = `${assets}/image-481ecc28-83f5-46d9-9450-328ae95b8b80.png`;
const KIDS = `${assets}/image-b62927b5-05c0-4897-9839-c6a3a3eeddce.jpg`;

function extOf(file) {
  return path.extname(file).toLowerCase() || '.jpg';
}

function copyTo(dest, src) {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

const dosugFiles = [
  { src: POOL, name: '01-basseyn', alt: 'Бассейн в доме' },
  { src: BILL1, name: '02-bilyard', alt: 'Бильярдная' },
  { src: BILL2, name: '03-bilyard', alt: 'Бильярдный стол' },
  { src: KIDS, name: '04-detskaya', alt: 'Детская игровая комната' },
].map((row) => {
  const ext = extOf(row.src);
  const rel = `photoHouse/Досуг/${row.name}${ext}`;
  copyTo(path.join(dir, rel), row.src);
  return { path: rel, alt: row.alt };
});

function img(f) {
  return { image: `${f.path}${v}`, alt: f.alt };
}

const cfg = JSON.parse(fs.readFileSync(siteConfigPath(slug), 'utf8'));
cfg.gallery.cacheQuery = v;

const villaAlbum = cfg.albums.find((a) => a.id === 'villa');
const insideAlbum = cfg.albums.find((a) => a.id === 'inside');

cfg.albums = [
  villaAlbum,
  insideAlbum,
  {
    id: 'dosug',
    manifestKey: 'Досуг',
    label: 'Досуг',
    folder: 'photoHouse/Досуг',
    files: dosugFiles,
  },
].filter(Boolean);

cfg.carousels = [
  { label: 'Вилла', items: villaAlbum.files.map((f) => img(f)) },
  { label: 'Комнаты', items: insideAlbum.files.map((f) => img(f)) },
  { label: 'Досуг', items: dosugFiles.map(img) },
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
    `<div class="gallery gallery--portfolio">\n    ${items}  </div>` +
    html.slice(sectionEnd);
  fs.writeFileSync(p, html, 'utf8');
}

const dosugPage = path.join(dir, 'services/kupel-sauna.html');
let dosugHtml = fs.readFileSync(dosugPage, 'utf8');
dosugHtml = dosugHtml.replace(
  /<title>[\s\S]*?<\/title>/,
  '<title>Досуг — Вилла Перевалово</title>',
);
dosugHtml = dosugHtml.replace(
  /<section class="subpage-hero subpage-hero--service">[\s\S]*?<\/section>/,
  `<section class="subpage-hero subpage-hero--service">
  <div class="kicker">Досуг</div>
  <h1><span class="title-kino-line">Бассейн</span><span class="brand-stack brand-stack--section brand-stack--page-hero"><span class="brand-stack__base">Бильярд</span><span class="brand-stack__script">и детская</span></span></h1>
  <p>Закрытый бассейн, бильярдная и детская игровая — всё в одном доме для отдыха компанией и семьёй.</p>
</section>`,
);
fs.writeFileSync(dosugPage, dosugHtml, 'utf8');
regenGallery('services/kupel-sauna.html', dosugFiles);

const dosugBlock = `<article class="album-row" id="house-dosug">
      <div class="depth-carousel" data-depth-carousel data-tilt-direction="right" data-autoplay="false" data-label="Досуг" data-href="services/kupel-sauna.html">
        <script type="application/json" class="depth-carousel__items">${JSON.stringify(cfg.carousels[2].items)}</script>
      </div>
      <div class="album-copy">
        <div class="kicker">Досуг</div>
        <h3 class="album-title"><span class="title-kino-line">Бассейн</span><span class="brand-stack brand-stack--section"><span class="brand-stack__base">Бильярд</span><span class="brand-stack__script">детская</span></span></h3>
        <p>Бассейн, бильярдная и детская игровая комната — для взрослых и детей на одной вилле.</p>
        <div class="actions"><a class="button" href="services/kupel-sauna.html">СМОТРЕТЬ АЛЬБОМ</a></div>
      </div>
    </article>`;

let index = fs.readFileSync(path.join(dir, 'index.html'), 'utf8');
if (!index.includes('id="house-dosug"')) {
  index = index.replace(
    /(<article class="album-row album-row--flip" id="house-inside">[\s\S]*?<\/article>)\s*<\/div>\s*<\/section>\s*<section class="section" id="reviews">/,
    `$1\n    ${dosugBlock}\n  </div>\n</section>\n\n<section class="section" id="reviews">`,
  );
} else {
  index = index.replace(
    /<article class="album-row" id="house-dosug">[\s\S]*?<\/article>/,
    dosugBlock,
  );
}
index = index.replace(
  /Вилла снаружи и интерьеры — бассейн, банкетный зал, сауна и комнаты для гостей\./,
  'Вилла снаружи, интерьеры и досуг: бассейн, бильярд, детская игровая и просторные комнаты.',
);
fs.writeFileSync(path.join(dir, 'index.html'), index, 'utf8');

fs.writeFileSync(
  path.join(dir, 'album-more.js'),
  fs.readFileSync(path.join(REPO_ROOT, 'river-home-terentievo', 'album-more.js'), 'utf8')
    .replace(
      /var ALBUMS = \[[\s\S]*?\];/,
      `var ALBUMS = [
    {
      id: 'komnaty',
      href: 'komnaty.html',
      title: 'Комнаты',
      kicker: 'Интерьер',
      lead: 'Гостиная, столовая и спальни',
      preview: '../photoHouse/Комнаты - Внутри дома/03.jpg${v}',
    },
    {
      id: 'kupel-sauna',
      href: 'kupel-sauna.html',
      title: 'Досуг',
      kicker: 'На вилле',
      lead: 'Бассейн, бильярд и детская',
      preview: '../photoHouse/Досуг/01-basseyn.jpg${v}',
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
console.log('Dosug block:', dosugFiles.length, 'photos');