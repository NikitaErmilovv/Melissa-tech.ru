import fs from 'node:fs';
import path from 'node:path';
import { applySiteConfig } from '../lib/apply-river-home.mjs';
import { siteConfigPath, siteDir } from '../lib/repo.mjs';

const slugs = process.argv.slice(2);
if (!slugs.length) {
  console.error('Usage: node scripts/apply-drafts-reviews.mjs <slug> ...');
  process.exit(1);
}

for (const slug of slugs) {
  const p = siteConfigPath(slug);
  if (!fs.existsSync(p)) {
    console.error('skip', slug);
    continue;
  }
  const cfg = JSON.parse(fs.readFileSync(p, 'utf8'));
  const n = cfg.reviews?.items?.length || 0;
  const fid = cfg.reviews?.meta?.firmId || cfg.contacts?.firmId;
  if (!n) {
    console.error('skip (no reviews)', slug);
    continue;
  }
  applySiteConfig(cfg);
  fs.writeFileSync(p, `${JSON.stringify(cfg, null, 2)}\n`, 'utf8');

  const rc = String(cfg.stats?.reviewsCount ?? cfg.reviews?.meta?.ratingsCount ?? '');
  const rt = String(cfg.stats?.rating ?? cfg.reviews?.meta?.rating ?? '');
  const indexPath = path.join(siteDir(slug), 'index.html');
  if (fs.existsSync(indexPath) && (rc || rt)) {
    let html = fs.readFileSync(indexPath, 'utf8');
    if (rc) html = html.replace(/(id="stat-reviews">)[^<]*/g, `$1${rc}`);
    if (rt) html = html.replace(/(id="stat-rating">)[^<]*/g, `$1${rt}`);
    fs.writeFileSync(indexPath, html, 'utf8');
  }

  console.log('applied', slug, 'reviews=', n, 'firm=', fid);
}