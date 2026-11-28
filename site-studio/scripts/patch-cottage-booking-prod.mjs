import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const SRC = path.join(
  REPO,
  'site-studio/workspace/nashe-mesto-tyumen/booking.js',
);
const STANDARD = [
  'dom-otdyha-tyumen-grush',
  'villa-perevalovo',
  'river-home-terentievo',
  'belaya-bereza-tyumen',
  'dobrynya-tobolsk',
  'dom-za-zoryami',
  'novosibirsk-gostevoy-dom',
  'ozero-kaldy-sary',
  'u-kremlya-tobolsk',
  'volgograd-kottedzh',
];

const body = fs.readFileSync(SRC, 'utf8');
for (const slug of STANDARD) {
  const p = path.join(REPO, slug, 'booking.js');
  if (!fs.existsSync(path.join(REPO, slug))) continue;
  fs.writeFileSync(p, body, 'utf8');
  console.log('booking.js', slug);
}

// Тау Алтай — форма с выбором домика; только адрес и проверка мессенджеров
const tauPath = path.join(REPO, 'tau-altay-cheremshanka/booking.js');
if (fs.existsSync(tauPath)) {
  let tau = fs.readFileSync(tauPath, 'utf8');
  if (!tau.includes('STUDIO_CONTACTS')) {
    tau = tau.replace(
      '  var messengers = window.STUDIO_MESSENGERS || {};\n  var telegram = messengers.tg ||',
      '  var messengers = window.STUDIO_MESSENGERS || {};\n  var contacts = window.STUDIO_CONTACTS || {};\n  var telegram = messengers.tg ||',
    );
  }
  if (tau.includes("'Домик: ' + cabins,") && !tau.includes('contacts.addressLine')) {
    tau = tau.replace(
      "      'Телефон: ' + phone,\n      'Домик: ' + cabins,",
      "      'Телефон: ' + phone,\n      ...(contacts.addressLine ? ['Объект: ' + contacts.addressLine] : []),\n      'Домик: ' + cabins,",
    );
  }
  const submitBlock = /error\.textContent = '';\n\n    var lines = \[/;
  if (submitBlock.test(tau) && !tau.includes('Не настроены WhatsApp')) {
    tau = tau.replace(
      "    error.textContent = '';\n\n    var lines = [",
      `    error.textContent = '';

    var telegram = messengers.tg || '';
    var whatsapp = String(messengers.wa || '').replace(/\\D/g, '');
    if (!telegram || !whatsapp) {
      error.textContent = 'Не настроены WhatsApp/Telegram — позвоните по телефону в шапке сайта.';
      if (send) send.hidden = true;
      return;
    }

    var lines = [`,
    );
    tau = tau.replace(
      /  var telegram = messengers\.tg \|\| '[^']+';\n  var whatsapp = String\(messengers\.wa \|\| '[^']+'\)\.replace\(\/\\D\/g, ''\);\n/,
      '',
    );
  }
  fs.writeFileSync(tauPath, tau, 'utf8');
  console.log('booking.js tau-altay-cheremshanka (patched)');
}