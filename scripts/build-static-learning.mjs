import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const site = 'https://s2ktux.github.io';
const lastmod = process.env.S2KTUX_LASTMOD || new Date().toISOString().slice(0, 10);
const source = await fs.readFile(path.join(root, 'courses-data.js'), 'utf8');
const visualCss = await fs.readFile(path.join(root, 'visual-system.css'));
const visualFingerprint = createHash('sha256').update(visualCss).digest('hex').slice(0, 12);
const context = { window: {} };
vm.createContext(context);
vm.runInContext(source, context, { filename: 'courses-data.js' });
const courses = context.window.S2KTUX_COURSES;

const config = {
  rhcsa: {
    folder: 'rhcsa-9', label: 'RHCSA 9', unit: 'Tema', exam: 'EX200',
    files: Array.from({ length: 11 }, (_, index) => `rhcsa/${index + 1}/${index + 1}.html`)
  },
  lpic1: {
    folder: 'lpic-1', label: 'LPIC-1', unit: 'Tema', exam: '101-500 / 102-500',
    files: ['lpic/101/1.html','lpic/102/2.html','lpic/103/3.html','lpic/104/4.html','lpic/105/5.html','lpic/106/106.html','lpic/107/7.html','lpic/108/8.html','lpic/109/9.html','lpic/110/10.html']
  },
  docker: {
    folder: 'docker', label: 'Docker', unit: 'Clase', exam: 'Ruta práctica',
    files: ['docker/1/1.html','docker/2/2.html','docker/3/3.html']
  },
  kubernetes: {
    folder: 'kubernetes-cka', label: 'Kubernetes / CKA', unit: 'Clase', exam: 'CKA',
    files: Array(11).fill('')
  }
};

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, (char) => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[char]));
const escapeJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
const slugify = (value) => String(value)
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 66);
const lessonSlug = (key, module, index) => {
  const cleaned = module.title.replace(/^Clase\s+\d+\s*[—-]\s*/i, '').replace(/^Tema\s+\d+\s*[—-]\s*/i, '');
  if (key === 'docker') return `clase-${index + 1}-${slugify(cleaned)}`;
  if (key === 'lpic1') return `tema-${module.n}-${slugify(cleaned)}`;
  return `tema-${index + 1}-${slugify(cleaned)}`;
};

const header = (active = 'Cursos') => `
<a class="skip-link" href="#main-content">Saltar al contenido</a>
<div class="site-header" role="banner">
  <div class="site-header-inner">
    <a class="site-logo" href="/">S2KTUX</a>
    <nav class="site-nav" aria-label="Navegación principal">
      <a class="navlink nav-home" href="/">Inicio</a>
      <a class="navlink" href="/cursos.html"${active === 'Cursos' ? ' aria-current="page"' : ''}>Cursos</a>
      <a class="navlink" href="/terminal.html">Terminal</a>
      <a class="navlink" href="/proyectos.html">Proyectos</a>
      <button type="button" class="site-theme-toggle" data-theme-toggle aria-label="Cambiar tema"><span data-theme-icon></span></button>
    </nav>
  </div>
</div>`;

const footer = `
<footer class="site-footer">
  <div class="site-footer-brand">S2KTUX</div>
  <div class="site-footer-tagline">Domina Linux. Sin límites.</div>
  <div class="site-footer-links"><a href="/sobre.html">Sobre</a><a href="https://www.youtube.com/@S2KTUX/featured" target="_blank" rel="noopener">YouTube</a><a href="https://www.linkedin.com/in/alai-molina-delgado-563b70184" target="_blank" rel="noopener">LinkedIn</a></div>
  <div class="site-footer-copy">© 2026 S2KTUX · Aprende Linux, gratis · Comunidad abierta</div>
</footer>`;

const head = ({ title, description, canonical, jsonLd, type = 'article', robots = 'index,follow,max-image-preview:large' }) => `<!doctype html>
<html lang="es"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="${robots}">
<link rel="canonical" href="${canonical}"><meta name="theme-color" content="#f6ecd9">
<meta property="og:type" content="${type}"><meta property="og:site_name" content="S2KTUX"><meta property="og:locale" content="es_ES">
<meta property="og:title" content="${escapeHtml(title)}"><meta property="og:description" content="${escapeHtml(description)}"><meta property="og:url" content="${canonical}">
<meta property="og:image" content="${site}/assets/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(title)}"><meta name="twitter:description" content="${escapeHtml(description)}"><meta name="twitter:image" content="${site}/assets/og.png">
<link rel="icon" type="image/png" sizes="192x192" href="/assets/icon-192.png"><link rel="apple-touch-icon" href="/assets/icon-192.png"><link rel="manifest" href="/manifest.webmanifest">
<link rel="stylesheet" href="/fonts.css?v=20260822-local"><link rel="stylesheet" href="/site-shell.css?v=20260826-phase3"><link rel="stylesheet" href="/learning-pages.css?v=20260826-phase3"><link rel="stylesheet" href="/visual-system.css?v=${visualFingerprint}">
<script>try{if(localStorage.getItem('s2ktux-theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}</script>
<script type="application/ld+json">${escapeJson(jsonLd)}</script>
<script defer data-domain="s2ktux.github.io" src="https://plausible.io/js/script.js"></script>
<script defer src="/site-shell.js?v=20260826-phase3"></script>
<script type="module" src="/learning-pages.js?v=20260826-phase3"></script>
</head>`;

const routeData = { courses: {}, lessons: {} };
const sitemapUrls = ['/', '/cursos.html', '/terminal.html', '/proyectos.html', '/proyecto-kubernetes.html', '/proyecto-proxmox.html', '/sobre.html'];

for (const [key, cfg] of Object.entries(config)) {
  const data = courses[key];
  if (!data) continue;
  const courseRoute = `/cursos/${cfg.folder}/`;
  routeData.courses[key] = courseRoute;
  const outDir = path.join(root, 'cursos', cfg.folder);
  await fs.rm(outDir, { recursive: true, force: true });
  await fs.mkdir(outDir, { recursive: true });
  const active = data.modules.map((module, index) => Boolean(cfg.files[index]));
  const availableCount = active.filter(Boolean).length;
  const isPlanned = availableCount === 0;
  if (!isPlanned) sitemapUrls.push(courseRoute);
  const moduleRoutes = data.modules.map((module, index) => active[index] ? `${courseRoute}${lessonSlug(key, module, index)}/` : '');
  moduleRoutes.forEach((route, index) => { if (route) routeData.lessons[`${key}:${index}`] = route; });

  const courseDescription = data.subtitle || data.note;
  const courseLd = {
    '@context':'https://schema.org', '@graph': [
      isPlanned
        ? { '@type':'WebPage', name:`Ruta prevista de ${data.title}`, description:courseDescription, url:`${site}${courseRoute}`, inLanguage:'es' }
        : { '@type':'Course', name:data.title, description:courseDescription, url:`${site}${courseRoute}`, inLanguage:'es', isAccessibleForFree:true, provider:{ '@type':'Organization', name:'S2KTUX', url:`${site}/` }, hasCourseInstance:{ '@type':'CourseInstance', courseMode:'online', courseWorkload:`${data.modules.length} módulos` } },
      { '@type':'BreadcrumbList', itemListElement:[
        { '@type':'ListItem', position:1, name:'Inicio', item:`${site}/` },
        { '@type':'ListItem', position:2, name:'Cursos', item:`${site}/cursos.html` },
        { '@type':'ListItem', position:3, name:data.title, item:`${site}${courseRoute}` }
      ]}
    ]
  };
  const modules = data.modules.map((module, index) => {
    const available = active[index];
    const tag = available ? 'a' : 'article';
    const href = available ? ` href="${moduleRoutes[index]}"` : '';
    return `<${tag}${href} class="module-row${available ? '' : ' coming'}">
      <span class="module-index" aria-hidden="true">${String(index + 1).padStart(2, '0')}</span>
      <span class="module-copy"><span class="module-number">${escapeHtml(cfg.unit.toUpperCase())} ${escapeHtml(module.n)}</span><span class="module-title">${escapeHtml(module.title)}</span><span class="module-description">${escapeHtml(module.desc)}</span><span class="module-topics">${module.topics.length} apartados · ${module.video ? 'vídeo incluido' : 'guía escrita'}</span></span>
      <span class="module-state">${available ? 'ABRIR →' : 'PRÓXIMAMENTE'}</span>
    </${tag}>`;
  }).join('\n');
  const courseTitle = `${data.title}: curso gratuito en español · S2KTUX`;
  const courseHtml = `${head({ title:courseTitle, description:courseDescription, canonical:`${site}${courseRoute}`, jsonLd:courseLd, type:'website', robots:isPlanned?'noindex,follow':'index,follow,max-image-preview:large' })}<body><div class="site-page-shell site-app-shell">${header()}
  <main id="main-content" class="learning-main"><nav class="learning-crumbs" aria-label="Migas de pan"><a href="/">Inicio</a><span>›</span><a href="/cursos.html">Cursos</a><span>›</span><span aria-current="page">${escapeHtml(data.title)}</span></nav>
  <div class="learning-shell"><header class="course-hero"><div class="course-kicker">${escapeHtml(data.badge === cfg.exam ? data.badge : `${data.badge} · ${cfg.exam}`)}</div><h1>${escapeHtml(data.title)}</h1><p>${escapeHtml(courseDescription)}</p><div class="course-stats">${isPlanned ? `<span class="course-stat">${data.modules.length} clases previstas</span><span class="course-stat">contenido en preparación</span>` : `<span class="course-stat">${data.modules.length} ${data.modules.length === 1 ? 'módulo' : 'módulos'}</span><span class="course-stat">${data.modules.reduce((sum, module) => sum + module.topics.length, 0)} objetivos</span>`}<span class="course-stat">gratis · sin registro</span></div></header><section class="module-list" aria-label="Contenido del curso">${modules}</section></div></main>${footer}</div></body></html>`;
  await fs.writeFile(path.join(outDir, 'index.html'), courseHtml, 'utf8');

  for (let index = 0; index < data.modules.length; index++) {
    if (!active[index]) continue;
    const module = data.modules[index];
    const lessonRoute = moduleRoutes[index];
    sitemapUrls.push(lessonRoute);
    const sourcePath = cfg.files[index].replace(/^([^/]+)/, '_$1').replace(/\.html$/, '.inc');
    const fragment = (await fs.readFile(path.join(root, sourcePath), 'utf8'))
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<link[^>]*>/gi, '')
      .replace(/\sstyle="max-width:100%;height:auto"/gi, '')
      .replace(/class="course-content"\s+style="min-width:0;max-width:100%;overflow-wrap:anywhere"/gi, 'class="course-content"');
    const lessonDir = path.join(root, lessonRoute.replace(/^\//, ''));
    await fs.mkdir(lessonDir, { recursive: true });
    const description = `${module.desc} Aprende ${module.topics.slice(0, 3).join(', ')} con ejemplos en español.`;
    const title = `${module.title} · ${cfg.label} · S2KTUX`;
    const itemListElement = [
      { '@type':'ListItem', position:1, name:'Inicio', item:`${site}/` },
      { '@type':'ListItem', position:2, name:'Cursos', item:`${site}/cursos.html` },
      { '@type':'ListItem', position:3, name:data.title, item:`${site}${courseRoute}` },
      { '@type':'ListItem', position:4, name:module.title, item:`${site}${lessonRoute}` }
    ];
    const lessonLd = { '@context':'https://schema.org', '@graph':[
      { '@type':'LearningResource', name:module.title, description:module.desc, url:`${site}${lessonRoute}`, inLanguage:'es', isAccessibleForFree:true, learningResourceType:'lesson', educationalLevel:key === 'rhcsa' ? 'RHCSA 9' : key === 'lpic1' ? 'LPIC-1' : 'Fundamentos a avanzado', teaches:module.topics, isPartOf:{ '@type':'Course', name:data.title, url:`${site}${courseRoute}` }, provider:{ '@type':'Organization', name:'S2KTUX', url:`${site}/` } },
      { '@type':'BreadcrumbList', itemListElement }
    ]};
    const prev = index > 0 && moduleRoutes[index - 1] ? `<a class="lesson-nav-card" href="${moduleRoutes[index - 1]}"><small>← ANTERIOR</small><strong>${escapeHtml(data.modules[index - 1].title)}</strong></a>` : '<span></span>';
    const next = index < data.modules.length - 1 && moduleRoutes[index + 1] ? `<a class="lesson-nav-card next" href="${moduleRoutes[index + 1]}"><small>SIGUIENTE →</small><strong>${escapeHtml(data.modules[index + 1].title)}</strong></a>` : '<span></span>';
    const lessonHtml = `${head({ title, description, canonical:`${site}${lessonRoute}`, jsonLd:lessonLd })}<body><div class="lesson-section-meter" aria-hidden="true"></div><div class="site-page-shell site-app-shell">${header()}
      <main id="main-content" class="learning-main"><nav class="learning-crumbs" aria-label="Migas de pan"><a href="/">Inicio</a><span>›</span><a href="/cursos.html">Cursos</a><span>›</span><a href="${courseRoute}">${escapeHtml(data.title)}</a><span>›</span><span aria-current="page">${escapeHtml(cfg.unit)} ${index + 1}</span></nav>
      <div class="learning-shell"><div class="lesson-topline"><span class="lesson-counter">${escapeHtml(cfg.unit)} ${index + 1} / ${data.modules.length}</span><span class="lesson-progress" aria-label="Progreso del curso: ${Math.round((index + 1) / data.modules.length * 100)}%"><span style="width:${(index + 1) / data.modules.length * 100}%"></span></span></div>
      ${fragment}
      <nav class="lesson-navigation" aria-label="Navegación entre lecciones">${prev}<button class="lesson-read" type="button" data-lesson-read="${key}:${index}">Marcar como leída</button>${next}</nav></div></main>${footer}</div><button type="button" id="backtop" aria-label="Volver arriba">↑</button></body></html>`;
    await fs.writeFile(path.join(lessonDir, 'index.html'), lessonHtml.replace(/[ \t]+$/gm, ''), 'utf8');
  }
}

await fs.writeFile(path.join(root, 'learning-routes.js'), `window.S2KTUX_LEARNING_ROUTES=${JSON.stringify(routeData)};\n`, 'utf8');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map((route) => `  <url><loc>${site}${route}</loc><lastmod>${lastmod}</lastmod></url>`).join('\n')}\n</urlset>\n`;
await fs.writeFile(path.join(root, 'sitemap.xml'), sitemap, 'utf8');
const topLevelPages = ['404.html','curso.html','cursos.html','index.html','leccion.html','proyecto-kubernetes.html','proyecto-proxmox.html','proyectos.html','sobre.html','terminal.html'];
for (const file of topLevelPages) {
  const target = path.join(root, file);
  let html = await fs.readFile(target, 'utf8');
  html = html.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">\s*/g, '')
    .replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin(?:="")?>\s*/g, '')
    .replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^\"]+" rel="stylesheet">/g, '<link rel="stylesheet" href="./fonts.css?v=20260822-local">');
  await fs.writeFile(target, html, 'utf8');
}
console.log(`Generadas ${sitemapUrls.length} URLs estáticas y ${Object.keys(routeData.lessons).length} lecciones.`);
