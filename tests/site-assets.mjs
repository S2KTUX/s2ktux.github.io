import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ignoredDirectories = new Set(['.git', 'node_modules']);

async function htmlFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await htmlFiles(path));
    else if (entry.isFile() && entry.name.endsWith('.html')) files.push(path);
  }
  return files;
}

async function siteFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (ignoredDirectories.has(entry.name)) continue;
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await siteFiles(path));
    else if (entry.isFile()) files.push(path);
  }
  return files;
}

const sitePath = path => relative(root, path).replaceAll('\\', '/');
const attr = (tag, name) => {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*["']([^"']*)["']`, 'i'));
  return match ? match[1] : null;
};
const isExternalReference = ref => /^(?:https?:|mailto:|tel:|data:)/i.test(ref);
function localReference(htmlPath, ref) {
  let clean = ref.split(/[?#]/, 1)[0];
  if (!clean) return null;
  try { clean = decodeURIComponent(clean); } catch {}
  const baseTarget = clean === '/'
    ? join(root, 'index.html')
    : clean.startsWith('/')
      ? join(root, clean.slice(1))
      : resolve(dirname(htmlPath), clean);
  const target = clean.endsWith('/') && clean !== '/' ? join(baseTarget, 'index.html') : baseTarget;
  return { target, path: sitePath(target) };
}

function assertWellFormedXml(xml, label) {
  assert.match(xml, /^<\?xml\s+version=["']1\.0["'][^?]*\?>/i, `${label}: missing XML declaration`);
  assert.doesNotMatch(xml, /&(?!amp;|lt;|gt;|apos;|quot;|#\d+;|#x[\da-f]+;)/i, `${label}: unescaped ampersand`);
  const source = xml.replace(/<\?xml[\s\S]*?\?>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  const stack = [];
  let roots = 0;
  let cursor = 0;
  for (const match of source.matchAll(/<([^>]+)>/g)) {
    assert.equal(source.slice(cursor, match.index).includes('<'), false, `${label}: malformed opening bracket`);
    cursor = match.index + match[0].length;
    const raw = match[1].trim();
    if (raw.startsWith('!') || raw.startsWith('?')) continue;
    if (raw.startsWith('/')) {
      const name = raw.slice(1).trim();
      assert.equal(stack.pop(), name, `${label}: mismatched closing tag </${name}>`);
      continue;
    }
    const name = raw.match(/^([A-Za-z_][\w:.-]*)/)?.[1];
    assert.ok(name, `${label}: malformed tag <${raw}>`);
    if (stack.length === 0) roots += 1;
    if (!/\/\s*$/.test(raw)) stack.push(name);
  }
  assert.equal(source.slice(cursor).includes('<'), false, `${label}: malformed trailing markup`);
  assert.equal(roots, 1, `${label}: expected exactly one root element`);
  assert.deepEqual(stack, [], `${label}: unclosed XML tags`);
}

const allHtml = await htmlFiles(root);
assert.ok(allHtml.every(path => !sitePath(path).startsWith('node_modules/')), 'La auditoría no debe inspeccionar HTML de dependencias');
const allSitePaths = new Set((await siteFiles(root)).map(sitePath));
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

const integrityIssues = [];
const nonTerminalHtml = allHtml.filter(path => !/^terminal(?:-[^/\\]+)?\.html$/i.test(sitePath(path)));
for (const htmlPath of nonTerminalHtml) {
  const html = await readFile(htmlPath, 'utf8');
  const rel = sitePath(htmlPath);
  const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/gi)].map(match => match[1]));

  for (const match of html.matchAll(/<(?:img|script)\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi)) {
    const ref = match[1];
    if (isExternalReference(ref) || /\{\{/.test(ref)) continue;
    const local = localReference(htmlPath, ref);
    if (local && (!allSitePaths.has(local.path) || local.path.startsWith('../'))) integrityIssues.push(`${rel} -> missing or case-mismatched asset: ${ref}`);
  }
  for (const match of html.matchAll(/<(?:a|link)\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    const ref = match[1];
    if (isExternalReference(ref) || ref.startsWith('#') || /\{\{/.test(ref)) continue;
    const local = localReference(htmlPath, ref);
    if (local && (!allSitePaths.has(local.path) || local.path.startsWith('../'))) integrityIssues.push(`${rel} -> missing or case-mismatched link: ${ref}`);
  }

  for (const match of html.matchAll(/<a\b[^>]*>/gi)) {
    const tag = match[0];
    const href = attr(tag, 'href');
    if (href === null) { integrityIssues.push(`${rel} -> anchor without href`); continue; }
    if (!href || href === '#' || /^javascript:/i.test(href)) integrityIssues.push(`${rel} -> inert anchor: ${href || '(empty)'}`);
    if (href.startsWith('#') && href.length > 1) {
      let id = href.slice(1);
      try { id = decodeURIComponent(id); } catch {}
      if (!ids.has(id)) integrityIssues.push(`${rel} -> missing hash target: ${href}`);
    }
    if (/^https?:/i.test(href)) {
      const relTokens = (attr(tag, 'rel') || '').toLowerCase().split(/\s+/);
      if (attr(tag, 'target') !== '_blank' || !relTokens.includes('noopener')) integrityIssues.push(`${rel} -> unsafe external link: ${href}`);
    }
  }
  for (const match of html.matchAll(/<button\b[^>]*>/gi)) {
    if (!/\btype=["'](?:button|submit|reset)["']/i.test(match[0])) integrityIssues.push(`${rel} -> button without explicit type`);
  }

  const isLessonFragment = /^(?:rhcsa|lpic|docker)\//.test(rel);
  if (!isLessonFragment) continue;
  const contentTags = [...html.matchAll(/<div\b[^>]*\bclass=["'][^"']*\bcourse-content\b[^"']*["'][^>]*>/gi)];
  if (contentTags.length !== 1) integrityIssues.push(`${rel} -> expected one course-content block`);
  else {
    const style = attr(contentTags[0][0], 'style') || '';
    if (!/min-width\s*:\s*0/i.test(style) || !/max-width\s*:\s*100%/i.test(style) || !/overflow-wrap\s*:\s*anywhere/i.test(style)) integrityIssues.push(`${rel} -> course-content is not shrink-safe at 320px`);
  }
  for (const match of html.matchAll(/<section\b[^>]*>/gi)) {
    if (!/\bclass=["'][^"']*\blesson-section\b/i.test(match[0])) integrityIssues.push(`${rel} -> section without lesson-section class`);
  }
  for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = match[0];
    if (!(attr(tag, 'alt') || '').trim()) integrityIssues.push(`${rel} -> image without useful alt text`);
    if (!/^\d+$/.test(attr(tag, 'width') || '') || Number(attr(tag, 'width')) < 1) integrityIssues.push(`${rel} -> image without intrinsic width`);
    if (!/^\d+$/.test(attr(tag, 'height') || '') || Number(attr(tag, 'height')) < 1) integrityIssues.push(`${rel} -> image without intrinsic height`);
    const style = attr(tag, 'style') || '';
    if (!/max-width\s*:\s*100%/i.test(style) || !/height\s*:\s*auto/i.test(style)) integrityIssues.push(`${rel} -> non-responsive lesson image`);
  }
  if (/&(?!#\d+;|#x[\da-f]+;|[a-z][a-z\d]+;)/i.test(html)) integrityIssues.push(`${rel} -> unescaped ampersand`);
  for (const tagName of ['pre', 'code']) {
    let depth = 0;
    for (const match of html.matchAll(new RegExp(`<\\/?${tagName}\\b[^>]*>`, 'gi'))) {
      if (/^<\//.test(match[0])) depth -= 1;
      else { if (depth > 0) integrityIssues.push(`${rel} -> nested <${tagName}> block`); depth += 1; }
      if (depth < 0) integrityIssues.push(`${rel} -> unmatched </${tagName}>`);
    }
    if (depth !== 0) integrityIssues.push(`${rel} -> unbalanced ${tagName} tags`);
  }
  const headingLevels = [...html.matchAll(/<h([1-6])\b/gi)].map(match => Number(match[1]));
  if (headingLevels.filter(level => level === 1).length !== 1 || !headingLevels.includes(2)) integrityIssues.push(`${rel} -> invalid lesson heading outline`);
  for (let index = 1; index < headingLevels.length; index += 1) {
    if (headingLevels[index] > headingLevels[index - 1] + 1) integrityIssues.push(`${rel} -> skipped heading level h${headingLevels[index - 1]} to h${headingLevels[index]}`);
  }
}
assert.deepEqual(integrityIssues, [], `Non-terminal page integrity failures:\n${integrityIssues.join('\n')}`);

const shellPages = [
  'index.html', 'cursos.html', 'curso.html', 'leccion.html', 'terminal.html',
  'proyectos.html', 'sobre.html', 'proyecto-kubernetes.html', 'proyecto-proxmox.html',
];
const shellCss = await readFile(join(root, 'site-shell.css'), 'utf8');
assert.ok(/grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/i.test(shellCss), 'Shared mobile navigation must use four balanced columns');
assert.ok(/\.site-theme-toggle\s*\{[^}]*position:\s*absolute/im.test(shellCss), 'Mobile theme toggle must remain visible beside the logo');
assert.ok(/@media\s*\(max-width:\s*640px\)/i.test(shellCss), 'Shared mobile header breakpoint is missing');
for (const path of shellPages) {
  const html = await readFile(join(root, path), 'utf8');
  assert.ok(html.includes('href="./site-shell.css?v=20260822-header4"'), `Missing versioned shared shell stylesheet: ${path}`);
  assert.ok(html.includes('class="site-header-inner"'), `Missing shared header wrapper: ${path}`);
  assert.ok(html.includes('class="site-nav"'), `Missing shared navigation class: ${path}`);
  assert.ok(html.includes('site-theme-toggle'), `Missing shared theme button class: ${path}`);
}
for (const path of shellPages) {
  const html = await readFile(join(root, path), 'utf8');
  assert.ok(html.includes('site-page-shell'), `Missing shrink-safe page shell: ${path}`);
  assert.ok(html.includes('role="navigation"'), `Missing navigation landmark: ${path}`);
  assert.ok(/<main\b[^>]*id=["']main-content["']/i.test(html), `Missing main landmark: ${path}`);
  assert.ok(html.includes('class="skip-link"'), `Missing keyboard skip link: ${path}`);
}

const principalPages = [
  'index.html', 'cursos.html', 'proyectos.html',
  'sobre.html', 'proyecto-kubernetes.html', 'proyecto-proxmox.html',
];
for (const path of principalPages) {
  const html = await readFile(join(root, path), 'utf8');
  assert.match(html, /<title>\s*[^<]+\s*<\/title>/i, `Missing title: ${path}`);
  assert.match(html, /<meta\b[^>]*name=["']description["'][^>]*content=["'][^"']+["'][^>]*>/i, `Missing meta description: ${path}`);
  assert.match(html, /<meta\b[^>]*name=["']robots["'][^>]*content=["']index,follow["'][^>]*>/i, `Missing index robots directive: ${path}`);
  assert.match(html, /<link\b[^>]*rel=["']canonical["'][^>]*href=["']https:\/\/s2ktux\.github\.io\/[^"']*["'][^>]*>/i, `Missing canonical URL: ${path}`);
  for (const property of ['og:url', 'og:title', 'og:description', 'og:image']) {
    assert.ok(new RegExp(`<meta\\b[^>]*property=["']${property.replace(':', '\\:')}["'][^>]*content=["'][^"']+["']`, 'i').test(html), `Missing ${property}: ${path}`);
  }
  for (const name of ['twitter:card', 'twitter:title', 'twitter:description', 'twitter:image']) {
    assert.ok(new RegExp(`<meta\\b[^>]*name=["']${name.replace(':', '\\:')}["'][^>]*content=["'][^"']+["']`, 'i').test(html), `Missing ${name}: ${path}`);
  }
  assert.equal((html.match(/<h1\b/gi) || []).length, 1, `Expected one primary heading: ${path}`);
  for (const block of html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    assert.doesNotThrow(() => JSON.parse(block[1].trim()), `Invalid JSON-LD: ${path}`);
  }
}
for (const path of ['curso.html', 'leccion.html']) {
  const html = await readFile(join(root, path), 'utf8');
  assert.match(html, /<meta\b[^>]*name=["']robots["'][^>]*content=["']noindex,follow["'][^>]*>/i, `Legacy redirect must remain noindex: ${path}`);
}
const notFound = await readFile(join(root, '404.html'), 'utf8');
assert.match(notFound, /<meta\b[^>]*name=["']description["'][^>]*content=["'][^"']+["'][^>]*>/i, '404 page needs a description');
assert.match(notFound, /<meta\b[^>]*name=["']robots["'][^>]*content=["']noindex,follow["'][^>]*>/i, '404 page must remain noindex');

const coursePage = await readFile(join(root, 'curso.html'), 'utf8');
assert.doesNotMatch(coursePage, /aws:'AWS|rhce:'RHCE'/, 'Unavailable courses must not receive canonical URLs');
for (const path of ['curso.html', 'leccion.html']) {
  const html = await readFile(join(root, path), 'utf8');
  assert.equal((html.match(/addEventListener\(['"]scroll['"],\s*upd/g) || []).length, 1, `Duplicate back-to-top scroll listener: ${path}`);
}
const lessonPage = await readFile(join(root, 'leccion.html'), 'utf8');
assert.match(lessonPage, /scroll-margin-top\s*:\s*80px/i, 'Lesson anchors must clear the sticky header');
assert.match(lessonPage, /#lesson h1,#lesson h2,#lesson h3,#lesson h4\{overflow-wrap:anywhere/i, 'Long lesson headings must wrap at 320px');
assert.match(lessonPage, /#lesson table\{display:block;max-width:100%;overflow-x:auto/i, 'Lesson tables need contained mobile scrolling');
assert.doesNotMatch(lessonPage, /set\('meta\[name="robots"\]'[^\n]+indexable\s*\?/, 'The legacy lesson runtime must not restore indexability');

const serviceWorker = await readFile(join(root, 'sw.js'), 'utf8');
assert.ok(serviceWorker.includes("'site-shell.css?v=20260822-header4'"), 'Shared shell stylesheet is missing from offline cache');
assert.ok(/req\.mode==='navigate'\s*\?\s*caches\.match\('index\.html'\)\s*:\s*Response\.error\(\)/.test(serviceWorker), 'Asset failures must not fall back to HTML');

const sitemap = await readFile(join(root, 'sitemap.xml'), 'utf8');
assertWellFormedXml(sitemap, 'sitemap.xml');
for (const expected of ['sobre.html', '/cursos/rhcsa-9/', '/cursos/lpic-1/', '/cursos/docker/', '/cursos/docker/clase-1-fundamentos-de-docker/', '/cursos/docker/clase-2-docker-para-el-dia-a-dia/', '/cursos/docker/clase-3-docker-profesional/']) {
  assert.ok(sitemap.includes(expected), `Sitemap entry is missing: ${expected}`);
}
assert.doesNotMatch(sitemap, /leccion\.html\?|curso\.html\?/, 'Legacy query routes must not be in the sitemap');
assert.doesNotMatch(sitemap, /https:\/\/s2ktux\.github\.io\/cursos\/kubernetes-cka\/<\/loc>/, 'The planned Kubernetes course must stay out of the sitemap until lessons exist');
assert.doesNotMatch(sitemap, /kubernetes-cka\/clase-/i, 'Placeholder Kubernetes lessons must not be in the sitemap');
const plannedKubernetes = await readFile(join(root, 'cursos/kubernetes-cka/index.html'), 'utf8');
assert.match(plannedKubernetes, /name="robots" content="noindex,follow"/, 'The planned Kubernetes route must be noindex');
assert.doesNotMatch(plannedKubernetes, /CKA · CKA/, 'Kubernetes kicker must not repeat CKA');

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
