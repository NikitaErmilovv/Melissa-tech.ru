import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteDir } from '../lib/repo.mjs';

const slugs = process.argv.slice(2);
const BASE_PORT = Number(process.env.PREVIEW_BASE || 8110);

if (!slugs.length) {
  console.error('Usage: node scripts/start-previews-fixed.mjs <slug> ...');
  process.exit(1);
}

const manifest = [];
slugs.forEach((slug, i) => {
  const dir = siteDir(slug);
  if (!fs.existsSync(dir)) {
    console.error('skip (no draft):', slug);
    return;
  }
  const port = BASE_PORT + i;
  spawn('npx', ['--yes', 'serve', '-l', String(port), '.'], {
    cwd: dir,
    stdio: 'ignore',
    shell: true,
    windowsHide: true,
    detached: true,
  }).unref();
  const url = `http://127.0.0.1:${port}/`;
  manifest.push({ slug, port, url });
  console.log(`${slug}\t${url}`);
});

const portsFile = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'preview-ports.json');
fs.writeFileSync(portsFile, `${JSON.stringify({ at: new Date().toISOString(), sites: manifest }, null, 2)}\n`);

console.log(`\n${manifest.length} previews (base port ${BASE_PORT}). Ctrl+C does not stop background serve.`);