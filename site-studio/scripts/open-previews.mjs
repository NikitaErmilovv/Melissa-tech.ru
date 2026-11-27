import { startPreview } from '../lib/preview.mjs';

const slugs = process.argv.slice(2);
if (!slugs.length) slugs.push('dom-otdyha-tyumen-grush', 'villa-perevalovo');

for (const slug of slugs) {
  const info = startPreview(slug);
  console.log(`${slug}: ${info.url}`);
}

console.log('Previews running. Ctrl+C to stop.');