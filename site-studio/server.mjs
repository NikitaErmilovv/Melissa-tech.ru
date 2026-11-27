import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import open from 'open';
import {
  REPO_ROOT,
  STUDIO_ROOT,
  WORKSPACE_ROOT,
  assertStudioDraft,
  listMeta,
  siteDir,
  siteConfigPath,
} from './lib/repo.mjs';
import { applySiteConfig, deriveConfigFromBrand } from './lib/apply-river-home.mjs';
import {
  createDraftFromTemplate,
  ensureSiteConfig,
  importSiteConfig,
  writeSiteConfig,
} from './lib/import-site.mjs';
import { gitInfo, publishSite } from './lib/git-publish.mjs';
import { previewStatus, startPreview, stopPreview, stopAllPreviews } from './lib/preview.mjs';

const PORT = Number(process.env.SITE_STUDIO_PORT) || 3847;
const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 40 * 1024 * 1024 } });

app.use(express.json({ limit: '8mb' }));
app.use(express.static(path.join(STUDIO_ROOT, 'public')));

function normalizeSlug(s) {
  return String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

app.get('/api/meta', async (_req, res) => {
  const meta = listMeta();
  const git = await gitInfo();
  res.json({ ...meta, git });
});

app.post('/api/drafts/create', (req, res) => {
  try {
    const templateId = req.body.templateId;
    const slug = normalizeSlug(req.body.slug);
    if (!slug) throw new Error('Введите имя папки латиницей (slug)');
    const cfg = createDraftFromTemplate({ slug, templateId });
    res.json({ ok: true, slug, config: cfg });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/drafts/:slug', (req, res) => {
  try {
    const slug = req.params.slug;
    assertStudioDraft(slug);
    stopPreview(slug);
    fs.rmSync(siteDir(slug), { recursive: true, force: true });
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/sites/:slug/config', (req, res) => {
  try {
    assertStudioDraft(req.params.slug);
    res.json(ensureSiteConfig(req.params.slug));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/sites/:slug/config', (req, res) => {
  try {
    const slug = req.params.slug;
    assertStudioDraft(slug);
    const body = req.body;
    body.slug = slug;
    body.studio = body.studio || { managed: true };
    deriveConfigFromBrand(body);
    writeSiteConfig(slug, body);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/sites/:slug/import', (req, res) => {
  try {
    const slug = req.params.slug;
    assertStudioDraft(slug);
    const prev = ensureSiteConfig(slug);
    const cfg = importSiteConfig(slug);
    cfg.studio = prev.studio;
    cfg.templateId = prev.templateId;
    writeSiteConfig(slug, cfg);
    res.json(cfg);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/sites/:slug/apply', (req, res) => {
  try {
    const slug = req.params.slug;
    assertStudioDraft(slug);
    let cfg = req.body?.config;
    if (!cfg) cfg = JSON.parse(fs.readFileSync(siteConfigPath(slug), 'utf8'));
    cfg.slug = slug;
    const result = applySiteConfig(cfg);
    writeSiteConfig(slug, cfg);
    res.json({ ok: true, result, config: cfg });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/sites/:slug/preview/start', (req, res) => {
  try {
    assertStudioDraft(req.params.slug);
    res.json(startPreview(req.params.slug));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.post('/api/sites/:slug/preview/stop', (req, res) => {
  res.json(stopPreview(req.params.slug));
});

app.get('/api/sites/:slug/preview', (req, res) => {
  res.json(previewStatus(req.params.slug));
});

app.post('/api/sites/:slug/publish', async (req, res) => {
  try {
    const slug = req.params.slug;
    const cfg = JSON.parse(fs.readFileSync(siteConfigPath(slug), 'utf8'));
    assertStudioDraft(slug);
    const out = await publishSite(slug, req.body?.message, cfg);
    res.json(out);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/sites/:slug/photos', (req, res) => {
  const slug = req.params.slug;
  try {
    assertStudioDraft(slug);
  } catch (e) {
    return res.status(403).json({ error: e.message });
  }
  const rel = String(req.query.path || '').replace(/\\/g, '/');
  if (!rel || rel.includes('..')) return res.status(400).json({ error: 'bad path' });
  const full = path.join(siteDir(slug), rel);
  if (!fs.existsSync(full)) return res.status(404).end();
  res.sendFile(full);
});

app.post('/api/sites/:slug/photos', upload.single('file'), (req, res) => {
  try {
    const slug = req.params.slug;
    assertStudioDraft(slug);
    const relDir = String(req.body.folder || '').replace(/\\/g, '/');
    if (!req.file || !relDir || relDir.includes('..')) throw new Error('Нужны файл и folder');
    const dir = path.join(siteDir(slug), relDir);
    fs.mkdirSync(dir, { recursive: true });
    const safeName = req.file.originalname.replace(/[^\w.\-()\u0400-\u04FF ]+/g, '_');
    const full = path.join(dir, safeName);
    fs.writeFileSync(full, req.file.buffer);
    const relPath = `${relDir.replace(/\/$/, '')}/${safeName}`.replace(/\\/g, '/');
    res.json({ ok: true, path: relPath });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.delete('/api/sites/:slug/photos', (req, res) => {
  try {
    const slug = req.params.slug;
    assertStudioDraft(slug);
    const rel = String(req.body?.path || '').replace(/\\/g, '/');
    if (!rel || rel.includes('..')) throw new Error('bad path');
    const full = path.join(siteDir(slug), rel);
    if (fs.existsSync(full)) fs.unlinkSync(full);
    res.json({ ok: true });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

process.on('SIGINT', () => {
  stopAllPreviews();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`Site Studio: http://127.0.0.1:${PORT}`);
  console.log(`Черновики: ${WORKSPACE_ROOT}`);
  console.log(`Эталоны (только чтение): ${REPO_ROOT}`);
  if (process.env.SITE_STUDIO_OPEN !== '0') {
    open(`http://127.0.0.1:${PORT}`).catch(() => {});
  }
});