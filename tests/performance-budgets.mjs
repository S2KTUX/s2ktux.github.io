import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(root, file));
const text = (file) => read(file).toString('utf8');
const gzip = (file) => zlib.gzipSync(read(file), { level: 9 }).length;

const budgets = {
  'terminal-bootstrap.js': 3_500,
  'terminal-worker-client.js': 2_000,
  'terminal-simulation-worker.js': 3_500,
  'terminal-worker-protocol.js': 1_000,
  'terminal-virtual-fs.js': 2_500,
  'terminal-process-state.js': 1_500,
  'terminal-network-state.js': 1_500,
  'terminal-docker-state.js': 2_500,
  'terminal-kubernetes-state.js': 1_500,
  'learning-pages.js': 5_500,
  'learning-pages.css': 5_500,
  'visual-system.css': 4_000,
  'terminal-page.css': 6_000,
  'site-shell.js': 1_500,
  'terminal-xterm-renderer.js': 5_500,
  'vendor/xterm/xterm.mjs': 135_000
};
for (const [file, maxGzip] of Object.entries(budgets)) {
  const size = gzip(file);
  assert.ok(size <= maxGzip, `${file} ocupa ${size} B gzip; presupuesto ${maxGzip} B`);
}

for (const page of ['index.html','cursos.html','curso.html','leccion.html','terminal.html','proyectos.html','sobre.html']) {
  assert.doesNotMatch(text(page), /fonts\.googleapis\.com|fonts\.gstatic\.com/, `${page} no debe depender de Google Fonts`);
  assert.match(text(page), /fonts\.css/, `${page} debe usar fuentes locales`);
}

const bootstrap = text('terminal-bootstrap.js');
assert.match(bootstrap, /if \(!requested \|\| !allowed\.has\(requested\)\)/, 'El selector debe evitar cargar la terminal pesada');
assert.ok(bootstrap.search(/import\('\.\/terminal-xterm-renderer\.js(?:\?[^']+)?'\)/) > bootstrap.indexOf('startTerminal(engine, runtime)'), 'xterm solo debe cargarse después de elegir e iniciar una máquina');

const routes = JSON.parse(text('learning-routes.js').replace(/^window\.S2KTUX_LEARNING_ROUTES=/, '').replace(/;\s*$/, ''));
assert.equal(Object.keys(routes.lessons).length, 24, 'Deben existir 24 lecciones estáticas activas');
for (const route of Object.values(routes.lessons)) {
  const html = text(path.join(route.replace(/^\//, ''), 'index.html'));
  assert.match(html, /<link rel="canonical" href="https:\/\/s2ktux\.github\.io\/cursos\//);
  assert.match(html, /<div class="lesson-wrapper">/, `${route} debe incluir el contenido en el HTML inicial`);
  assert.doesNotMatch(html, /support\.js|fetch\(/, `${route} no debe necesitar renderizado cliente para mostrar la lección`);
}

for (const course of ['docker','kubernetes-cka','lpic-1','rhcsa-9']) {
  const html = text(path.join('cursos', course, 'index.html'));
  assert.match(html, /class="module-list"/, `${course} debe presentar los módulos como una lista`);
  assert.match(html, /class="module-row/, `${course} debe incluir filas de módulo`);
  assert.doesNotMatch(html, /class="module-grid"|class="module-card/, `${course} no debe volver al grid de tarjetas`);
}

console.log('Performance budgets and static learning pages: OK');
