import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');
const shellPages = ['index.html','cursos.html','proyectos.html','sobre.html','proyecto-proxmox.html','proyecto-kubernetes.html','terminal.html'];

for (const path of shellPages) {
  const html = await read(path);
  assert.match(html, /visual-system\.css\?v=20260826-phase3/, `${path} debe cargar el sistema visual compartido`);
  assert.match(html, /class="site-page-shell site-app-shell"/, `${path} debe usar el contenedor común`);
  assert.match(html, /class="site-header"/, `${path} debe usar el encabezado común`);
  assert.match(html, /class="site-footer"/, `${path} debe usar el pie común`);
  assert.doesNotMatch(html, /class="site-(?:header|footer)"[^>]*style=/, `${path} no debe incrustar la maquetación común`);
}

for (const path of shellPages.filter((path) => path !== 'terminal.html')) {
  const html = await read(path);
  assert.match(html, /site-shell\.js\?v=20260826-phase3/, `${path} debe compartir el controlador de tema`);
  assert.doesNotMatch(html, /updateIcons|setTimeout\(updateIcons/, `${path} no debe sincronizar el tema mediante temporizadores`);
}

const visual = await read('visual-system.css');
assert.match(visual, /html body\s*\{[^}]*font-family:\s*"Space Mono"/s, 'El cuerpo debe usar Space Mono');
assert.match(visual, /\.site-logo,[\s\S]*"Press Start 2P"/, 'La marca debe reservar Press Start 2P');
assert.match(visual, /@media \(max-width: 640px\)[\s\S]*\.site-footer/, 'El sistema debe incluir composición móvil');
assert.ok(gzipSync(visual).length < 4_000, 'El sistema visual común debe permanecer ligero');

const learning = await read('learning-pages.css');
assert.doesNotMatch(learning, /VT323/, 'Los textos educativos no deben usar VT323');
assert.match(learning, /\.lesson-wrapper p[^}]*"Space Mono"/s, 'Los párrafos educativos deben usar Space Mono');

const terminal = await read('terminal.html');
assert.doesNotMatch(terminal, /<style>/, 'Los estilos de la terminal deben estar fuera del HTML');
assert.match(terminal, /terminal-page\.css\?v=20260826-phase3/, 'La terminal debe cargar su hoja propia');

const generator = await read('scripts/build-static-learning.mjs');
assert.match(generator, /class="site-header"/, 'El generador debe producir el encabezado común');
assert.match(generator, /class="site-footer"/, 'El generador debe producir el pie común');
assert.match(generator, /visual-system\.css\?v=20260826-phase3/, 'El generador debe enlazar el sistema visual');

console.log('phase 3 visual system: shared components, readable type and responsive structure');
