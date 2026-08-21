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

const allHtml = await htmlFiles(root);
const missing = [];
const malformed = [];
const brokenLinks = [];
for (const htmlPath of allHtml) {
  const html = await readFile(htmlPath, 'utf8');
  for (const match of html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)) {
    const src = match[1];
    if (/^(?:https?:|data:)/i.test(src)) continue;
    const clean = src.split(/[?#]/, 1)[0];
    const target = clean.startsWith('/') ? join(root, clean.slice(1)) : resolve(dirname(htmlPath), clean);
    try { await access(target); }
    catch { missing.push(`${relative(root, htmlPath)} -> ${src}`); }
  }
  if (/https:\/\/youtu\.be\/ejemplo/i.test(html)) malformed.push(`${relative(root, htmlPath)} -> placeholder video URL`);
  if (/<img\b[^>]*alt=["'][^"']*["']["'][^>]*>/i.test(html)) malformed.push(`${relative(root, htmlPath)} -> duplicated quote in image`);
  if (/<img\b[^>]*\sw\s*>/i.test(html)) malformed.push(`${relative(root, htmlPath)} -> incomplete image attribute`);
  if (/<img\b(?:(?!>).)*$\s*<p\b/im.test(html)) malformed.push(`${relative(root, htmlPath)} -> unclosed image tag`);
  if (/<a\b[^>]*target=["']_blank["'](?![^>]*\brel=["'][^"']*noopener)/i.test(html)) malformed.push(`${relative(root, htmlPath)} -> target=_blank without rel=noopener`);

  const isLessonFragment = /^(?:rhcsa|lpic|docker)[\\/]/.test(relative(root, htmlPath));
  if (isLessonFragment) {
    const opens = tag => (html.match(new RegExp(`<${tag}\\b`, 'gi')) || []).length;
    const closes = tag => (html.match(new RegExp(`</${tag}>`, 'gi')) || []).length;
    for (const tag of ['div', 'section']) if (opens(tag) !== closes(tag)) malformed.push(`${relative(root, htmlPath)} -> unbalanced ${tag} tags`);
    const ids = [...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicateIds.length) malformed.push(`${relative(root, htmlPath)} -> duplicate ids: ${[...new Set(duplicateIds)].join(', ')}`);
    if (/<\/?(?:html|head|body)\b/i.test(html)) malformed.push(`${relative(root, htmlPath)} -> document tag inside lesson fragment`);
    if (/javascript:void\(0\)|openReader\s*\(/i.test(html)) malformed.push(`${relative(root, htmlPath)} -> inert lesson action`);
    for (const match of html.matchAll(/<img\b[^>]*>/gi)) if (!/\balt=["'][^"']*["']/i.test(match[0])) malformed.push(`${relative(root, htmlPath)} -> image without alt text`);
  }

  for (const match of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    const href = match[1];
    if (/^(?:https?:|mailto:|tel:|#|javascript:)/i.test(href) || /\{\{/.test(href)) continue;
    const clean = href.split(/[?#]/, 1)[0];
    if (!clean) continue;
    const target = clean === '/' ? join(root, 'index.html') : clean.startsWith('/') ? join(root, clean.slice(1)) : resolve(dirname(htmlPath), clean);
    try { await access(target); }
    catch { brokenLinks.push(`${relative(root, htmlPath)} -> ${href}`); }
  }
}

assert.deepEqual(missing, [], `Broken local images:\n${missing.join('\n')}`);
assert.deepEqual(malformed, [], `Malformed lesson markup:\n${malformed.join('\n')}`);
assert.deepEqual(brokenLinks, [], `Broken local links:\n${brokenLinks.join('\n')}`);

const shellPages = [
  'index.html', 'cursos.html', 'curso.html', 'leccion.html', 'terminal.html',
  'proyectos.html', 'sobre.html', 'proyecto-kubernetes.html', 'proyecto-proxmox.html',
];
const shellCss = await readFile(join(root, 'site-shell.css'), 'utf8');
assert.ok(/\.site-nav\s*\{[^}]*flex-wrap:\s*nowrap/im.test(shellCss), 'Shared mobile header must stay on one line');
assert.ok(/@media\s*\(max-width:\s*640px\)/i.test(shellCss), 'Shared mobile header breakpoint is missing');
for (const path of shellPages) {
  const html = await readFile(join(root, path), 'utf8');
  assert.ok(html.includes('href="./site-shell.css"'), `Missing shared shell stylesheet: ${path}`);
  assert.ok(html.includes('class="site-header-inner"'), `Missing shared header wrapper: ${path}`);
  assert.ok(html.includes('class="site-nav"'), `Missing shared navigation class: ${path}`);
  assert.ok(html.includes('site-theme-toggle'), `Missing shared theme button class: ${path}`);
}
for (const path of shellPages.filter(path => path !== 'index.html')) {
  const html = await readFile(join(root, path), 'utf8');
  assert.ok(html.includes('site-page-shell'), `Missing shrink-safe page shell: ${path}`);
}

const serviceWorker = await readFile(join(root, 'sw.js'), 'utf8');
assert.ok(serviceWorker.includes("'site-shell.css'"), 'Shared shell stylesheet is missing from offline cache');
assert.ok(/req\.mode==='navigate'\s*\?\s*caches\.match\('index\.html'\)\s*:\s*Response\.error\(\)/.test(serviceWorker), 'Asset failures must not fall back to HTML');

const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
for (const expected of ['sobre.html', 'c=rhcsa&amp;m=10', 'c=docker&amp;m=0', 'c=docker&amp;m=1', 'c=docker&amp;m=2']) {
  assert.ok(sitemap.includes(expected), `Sitemap entry is missing: ${expected}`);
}

const dockerVideos = [
  ['docker/1/1.html', 'https://www.youtube.com/watch?v=BML40ZpS6zc'],
  ['docker/2/2.html', 'https://www.youtube.com/watch?v=15_TPrR1cSA'],
  ['docker/3/3.html', 'https://www.youtube.com/watch?v=OxdRl8Yiy5I'],
];
const courseData = await readFile(join(root, 'courses-data.js'), 'utf8');
for (const [path, url] of dockerVideos) {
  const html = await readFile(join(root, path), 'utf8');
  assert.ok(html.includes(`href="${url}"`) && html.includes('class="video-card"'), `Missing Docker video card: ${path}`);
  assert.ok(courseData.includes(`video: "${url}"`), `Missing Docker video metadata: ${url}`);
}

console.log('site assets: images, lesson markup, shared header and Docker videos are valid');
