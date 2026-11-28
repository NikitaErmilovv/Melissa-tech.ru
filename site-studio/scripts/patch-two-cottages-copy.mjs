import fs from 'node:fs';
import path from 'node:path';

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, acc);
    else if (/\.(html|js)$/.test(ent.name)) acc.push(p);
  }
  return acc;
}

function patchDir(root, map) {
  for (const file of walk(root)) {
    let s = fs.readFileSync(file, 'utf8');
    const orig = s;
    for (const [from, to] of map) s = s.split(from).join(to);
    if (s !== orig) {
      fs.writeFileSync(file, s, 'utf8');
      console.log('patched', path.relative(root, file));
    }
  }
}

function fixAbout(file, strip) {
  let html = fs.readFileSync(file, 'utf8');
  html = html.replace(/<div class="photo-strip">[\s\S]*?<\/div>/, strip);
  fs.writeFileSync(file, html, 'utf8');
  console.log('about photos', file);
}

const tish = 'workspace/tishiny-hochu-tyumen';
const dvd = 'workspace/dom-vyhodnogo-dnya';

patchDir(tish, [
  ['д. д. Новопокровка, Солнечная ул., 14', 'д. Новопокровка, Лесная улица, 18'],
  ['Альбомы — River home', 'Альбомы — Тишины хочу'],
  ['Контакты — River home', 'Контакты — Тишины хочу'],
  ['О нас — River home', 'О нас — Тишины хочу'],
  ['tel:+79834.9044.9116', 'tel:+79829004275'],
  ['+7 (983) 4.904-4.91-16', '+7 (982) 900-42-75'],
  ['Новопокровка, д. Новопокровка', 'Новопокровка'],
]);
patchDir(dvd, [
  ['д. с. Борки, Солнечная ул., 14', 'с. Борки, Береговая улица, 6'],
  ['Альбомы — River home', 'Альбомы — Дом выходного дня'],
  ['Контакты — River home', 'Контакты — Дом выходного дня'],
  ['О нас — River home', 'О нас — Дом выходного дня'],
  ['tel:+79834.9044.9116', 'tel:+79322003553'],
  ['+7 (983) 4.904-4.91-16', '+7 (932) 200-35-53'],
]);

fixAbout(
  `${tish}/about.html`,
  `<div class="photo-strip">
    <div class="photo big" style="background-image:url('photoHouse/Дом/01.jpg?v=tishiny-hochu-20261129')"></div>
    <div class="photo" style="background-image:url('photoHouse/Комнаты - Внутри дома/01.jpg?v=tishiny-hochu-20261129')"></div>
    <div class="photo" style="background-image:url('photoHouse/Баня и чан/01.jpg?v=tishiny-hochu-20261129')"></div>
  </div>`,
);
fixAbout(
  `${dvd}/about.html`,
  `<div class="photo-strip">
    <div class="photo big" style="background-image:url('photoHouse/Дом/01.jpg?v=dom-vyhodnogo-20261129')"></div>
    <div class="photo" style="background-image:url('photoHouse/Комнаты - Внутри дома/01.jpg?v=dom-vyhodnogo-20261129')"></div>
    <div class="photo" style="background-image:url('photoHouse/Бассейн/01.jpg?v=dom-vyhodnogo-20261129')"></div>
  </div>`,
);

const leftover = path.join(tish, 'services', 'kupel-sauna.html');
if (fs.existsSync(leftover)) {
  fs.unlinkSync(leftover);
  console.log('removed', leftover);
}

let tishAbout = fs.readFileSync(`${tish}/about.html`, 'utf8');
tishAbout = tishAbout.replace(
  /Гостевой дом в д\. Новопокровка, Лесная улица, 18\. Два этажа, до 6 гостей, мангал на территории\. Бронирование от суток\./,
  'Загородный дом «Тишины хочу» в д. Новопокровка, Лесная улица, 18. Круглосуточно, бронь по телефону.',
);
fs.writeFileSync(`${tish}/about.html`, tishAbout, 'utf8');

let dvdAbout = fs.readFileSync(`${dvd}/about.html`, 'utf8');
dvdAbout = dvdAbout.replace(
  /Гостевой дом в с\. Борки, Береговая улица, 6\. Два этажа, до 6 гостей, мангал на территории\. Бронирование от суток\./,
  'Гостевой дом «Дом выходного дня» в с. Борки, Береговая улица, 6. Круглосуточно по предварительной записи.',
);
fs.writeFileSync(`${dvd}/about.html`, dvdAbout, 'utf8');

console.log('done');
