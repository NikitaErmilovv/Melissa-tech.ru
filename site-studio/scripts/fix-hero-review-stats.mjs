import fs from 'node:fs';
import path from 'node:path';
import { siteConfigPath, siteDir } from '../lib/repo.mjs';

const slugs = process.argv.slice(2);
if (!slugs.length) {
  console.error('Usage: node scripts/fix-hero-review-stats.mjs <slug> ...');
  process.exit(1);
}

for (const slug of slugs) {
  const cfgPath = siteConfigPath(slug);
  const indexPath = path.join(siteDir(slug), 'index.html');
  if (!fs.existsSync(cfgPath) || !fs.existsSync(indexPath)) continue;
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  const rc = String(cfg.stats?.reviewsCount ?? cfg.reviews?.meta?.ratingsCount ?? '');
  const rt = String(cfg.stats?.rating ?? cfg.reviews?.meta?.rating ?? '');
  let html = fs.readFileSync(indexPath, 'utf8');
  const before = html;
  if (rc) html = html.replace(/(id="stat-reviews">)[^<]*/g, `$1${rc}`);
  if (rt) html = html.replace(/(id="stat-rating">)[^<]*/g, `$1${rt}`);
  if (html !== before) {
    fs.writeFileSync(indexPath, html, 'utf8');
    console.log(slug, 'stats', rc, rt);
  }
}