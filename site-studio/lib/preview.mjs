import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { siteDir } from './repo.mjs';

const running = new Map();

function pickPort(base) {
  return base + Math.floor(Math.random() * 200);
}

export function startPreview(slug) {
  stopPreview(slug);
  const dir = siteDir(slug);
  const port = pickPort(8100);
  const child = spawn('npx', ['--yes', 'serve', '-l', String(port), '.'], {
    cwd: dir,
    stdio: 'ignore',
    shell: true,
    windowsHide: true,
  });
  const url = `http://127.0.0.1:${port}/`;
  running.set(slug, { child, port, url });
  child.on('exit', () => {
    if (running.get(slug)?.child === child) running.delete(slug);
  });
  return { slug, port, url };
}

export function stopPreview(slug) {
  const entry = running.get(slug);
  if (!entry) return { stopped: false };
  try {
    entry.child.kill();
  } catch {
    /* ignore */
  }
  running.delete(slug);
  return { stopped: true };
}

export function previewStatus(slug) {
  const entry = running.get(slug);
  if (!entry) return { running: false };
  return { running: true, url: entry.url, port: entry.port };
}

export function stopAllPreviews() {
  for (const slug of [...running.keys()]) stopPreview(slug);
}