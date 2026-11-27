import fs from 'node:fs';
import path from 'node:path';
import simpleGit from 'simple-git';
import { REPO_ROOT, syncDraftToProd, prodDir, siteConfigPath } from '../lib/repo.mjs';
import { applySiteConfig } from '../lib/apply-river-home.mjs';
import { writeSiteConfig } from '../lib/import-site.mjs';

function bumpDeployVersion(filePath, slug) {
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const line = `deploy-trigger=${slug}-studio-${stamp}`;
  let body = '';
  if (fs.existsSync(filePath)) {
    body = fs.readFileSync(filePath, 'utf8');
    if (/^deploy-trigger=/m.test(body)) {
      body = body.replace(/^deploy-trigger=.*$/m, line);
    } else {
      body = `${body.trim()}\n${line}\n`;
    }
  } else {
    body = `site=${slug}\ndeploy=site-studio\n${line}\n`;
  }
  fs.writeFileSync(filePath, body, 'utf8');
}

const slugs = process.argv.slice(2);
if (!slugs.length) {
  console.error('Usage: node scripts/publish-tyumen-batch.mjs <slug> ...');
  process.exit(1);
}

for (const slug of slugs) {
  const cfgPath = siteConfigPath(slug);
  if (!fs.existsSync(cfgPath)) throw new Error(`No draft: ${slug}`);
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  if (!cfg.studio?.managed) throw new Error(`Not a studio draft: ${slug}`);
  applySiteConfig(cfg);
  writeSiteConfig(slug, cfg);
  syncDraftToProd(slug);
  bumpDeployVersion(path.join(prodDir(slug), 'deploy-version.txt'), slug);
  console.log('synced', slug);
}

bumpDeployVersion(path.join(REPO_ROOT, 'deploy-version.txt'), 'melissa-tech.ru');

const git = simpleGit(REPO_ROOT);
const paths = [...slugs, 'deploy-version.txt', 'site-studio'];
await git.add(paths);
const msg =
  process.env.COMMIT_MSG ||
  `deploy: ${slugs.join(' + ')} — Tyumen cottages (Site Studio)`;
const commit = await git.commit(msg);
if (!commit.commit) {
  console.log('Nothing to commit');
  process.exit(0);
}
await git.push();
console.log('pushed', commit.commit);
for (const slug of slugs) {
  console.log(`prod: https://melissa-tech.ru/${slug}/`);
}