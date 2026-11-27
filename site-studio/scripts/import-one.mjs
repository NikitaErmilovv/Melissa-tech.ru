import { importSiteConfig, writeSiteConfig } from '../lib/import-site.mjs';
import { applySiteConfig } from '../lib/apply-river-home.mjs';

const slug = process.argv[2];
if (!slug) {
  console.error('Usage: node scripts/import-one.mjs <slug>');
  process.exit(1);
}

const cfg = importSiteConfig(slug);
writeSiteConfig(slug, cfg);
applySiteConfig(cfg);
writeSiteConfig(slug, cfg);
console.log('OK', slug, 'site.config.json');