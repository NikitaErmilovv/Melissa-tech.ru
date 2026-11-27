import fs from 'node:fs';
import path from 'node:path';
import simpleGit from 'simple-git';
import { REPO_ROOT, loadTemplates, prodDir, assertStudioDraft, syncDraftToProd } from './repo.mjs';
import { applySiteConfig } from './apply-river-home.mjs';
import { writeSiteConfig } from './import-site.mjs';

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

export async function publishSite(slug, message, cfg) {
  assertStudioDraft(slug);
  applySiteConfig(cfg);
  writeSiteConfig(slug, cfg);
  syncDraftToProd(slug);

  const prod = prodDir(slug);
  bumpDeployVersion(path.join(prod, 'deploy-version.txt'), slug);
  bumpDeployVersion(path.join(REPO_ROOT, 'deploy-version.txt'), 'melissa-tech.ru');

  const git = simpleGit(REPO_ROOT);
  const sitePath = path.relative(REPO_ROOT, prod).replace(/\\/g, '/');
  await git.add([sitePath, 'deploy-version.txt']);

  const commitMsg = message || `deploy: ${slug} (site-studio)`;
  const commit = await git.commit(commitMsg);
  if (commit.commit) {
    await git.push();
  }

  const base = loadTemplates().prodBaseUrl || 'https://melissa-tech.ru';
  return {
    ok: true,
    commit: commit.commit,
    prodUrl: `${base.replace(/\/$/, '')}/${slug}/`,
    branch: (await git.branch()).current,
    note: 'На GitHub ушла только папка этого сайта в корне репозитория. Черновик остаётся в site-studio/workspace.',
  };
}

export async function gitInfo() {
  const git = simpleGit(REPO_ROOT);
  try {
    const status = await git.status();
    const branch = await git.branch();
    return {
      root: REPO_ROOT,
      branch: branch.current,
      isRepo: true,
      changed: status.files.length,
      ahead: status.ahead,
      behind: status.behind,
    };
  } catch {
    return { root: REPO_ROOT, isRepo: false };
  }
}