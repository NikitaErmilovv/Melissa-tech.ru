import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const STUDIO_ROOT = path.resolve(__dirname, '..');
export const REPO_ROOT = path.resolve(STUDIO_ROOT, '..');
export const WORKSPACE_ROOT = path.join(STUDIO_ROOT, 'workspace');
export const CONFIG_NAME = 'site.config.json';

export function ensureWorkspace() {
  fs.mkdirSync(WORKSPACE_ROOT, { recursive: true });
}

/** Рабочая копия сайта — только здесь редактируем */
export function siteDir(slug) {
  return path.join(WORKSPACE_ROOT, slug);
}

export function starterDir(templateId) {
  const doc = loadTemplates();
  const tpl = doc.templates.find((t) => t.id === templateId);
  if (!tpl?.starterDir) throw new Error(`Нет стартера для ${templateId}`);
  return path.join(REPO_ROOT, tpl.starterDir);
}

export function prodDir(slug) {
  return path.join(REPO_ROOT, slug);
}

export function siteConfigPath(slug) {
  return path.join(siteDir(slug), CONFIG_NAME);
}

export function loadTemplates() {
  const raw = fs.readFileSync(path.join(STUDIO_ROOT, 'config', 'templates.json'), 'utf8');
  return JSON.parse(raw);
}

export function templateForSlug(slug, templatesDoc, templateIdHint) {
  if (templateIdHint) {
    const t = templatesDoc.templates.find((x) => x.id === templateIdHint);
    if (t) return t;
  }
  const cfgPath = siteConfigPath(slug);
  if (fs.existsSync(cfgPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
      if (cfg.templateId) {
        const t = templatesDoc.templates.find((x) => x.id === cfg.templateId);
        if (t) return t;
      }
    } catch {
      /* ignore */
    }
  }
  return templatesDoc.templates[0] || null;
}

export function assertStudioDraft(slug) {
  const cfgPath = siteConfigPath(slug);
  if (!fs.existsSync(cfgPath)) throw new Error('Это не черновик студии');
  const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
  if (!cfg.studio?.managed) throw new Error('Редактировать можно только черновики, созданные в Site Studio');
  return cfg;
}

export function listDrafts() {
  ensureWorkspace();
  const out = [];
  for (const ent of fs.readdirSync(WORKSPACE_ROOT, { withFileTypes: true })) {
    if (!ent.isDirectory()) continue;
    const slug = ent.name;
    const cfgPath = path.join(WORKSPACE_ROOT, slug, CONFIG_NAME);
    if (!fs.existsSync(cfgPath)) continue;
    try {
      const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
      out.push({
        slug,
        templateId: cfg.templateId || '?',
        title: cfg.brand?.displayPlain || cfg.brand?.kino || slug,
        updatedAt: cfg.meta?.lastAppliedAt || cfg.meta?.importedAt || null,
      });
    } catch {
      out.push({ slug, templateId: '?', title: slug, updatedAt: null });
    }
  }
  out.sort((a, b) => a.slug.localeCompare(b.slug, 'ru'));
  return out;
}

export function listMeta() {
  const doc = loadTemplates();
  ensureWorkspace();
  return {
    repoRoot: REPO_ROOT,
    workspaceRoot: WORKSPACE_ROOT,
    templates: doc.templates.map((t) => ({
      id: t.id,
      name: t.name,
      starterDir: t.starterDir,
      description: t.description || '',
    })),
    prodBaseUrl: doc.prodBaseUrl,
    drafts: listDrafts(),
  };
}

export function syncDraftToProd(slug) {
  const src = siteDir(slug);
  const dest = prodDir(slug);
  if (!fs.existsSync(src)) throw new Error('Черновик не найден');
  fs.mkdirSync(dest, { recursive: true });
  fs.cpSync(src, dest, {
    recursive: true,
    filter: (p) => {
      const base = path.basename(p);
      if (base === 'node_modules' || base === '.git') return false;
      if (base === CONFIG_NAME) return false;
      return true;
    },
  });
}