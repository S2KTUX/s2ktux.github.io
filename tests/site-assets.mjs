import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === '.git') continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(path));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(path);
  }
  return files;
}

const missing = [];
for (const htmlPath of await htmlFiles(root)) {
  const html = await readFile(htmlPath, 'utf8');
  for (const match of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)) {
    const src = match[1];
    if (/^(?:https?:|data:)/i.test(src)) continue;
    const clean = src.split(/[?#]/, 1)[0];
    const target = clean.startsWith('/') ? join(root, clean.slice(1)) : resolve(dirname(htmlPath), clean);
    try { await access(target); }
    catch { missing.push(`${relative(root, htmlPath)} -> ${src}`); }
  }
}

assert.deepEqual(missing, [], `Broken local images:\n${missing.join('\n')}`);
console.log('site assets: all local images exist');
