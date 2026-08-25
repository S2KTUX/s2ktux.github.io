import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=file=>readFileSync(resolve(root,file),'utf8');
const pages=['index.html','cursos.html','curso.html','leccion.html','proyectos.html','proyecto-proxmox.html','proyecto-kubernetes.html','sobre.html'];

assert.equal(existsSync(resolve(root,'support.js')),false,'El runtime de plantillas retirado no debe volver al sitio');
for(const page of pages){
  const html=read(page);
  assert.doesNotMatch(html,/support\.js|<\/?x-dc>|<sc-(?:if|for)\b|data-dc-script|\{\{\s*[^{}]+\s*\}\}/i,page+' debe ser HTML nativo');
  assert.match(html,/<main\b/i,page+' debe exponer contenido semántico sin renderizado cliente');
}

for(const page of ['curso.html','leccion.html']){
  const html=read(page);
  assert.match(html,/learning-routes\.js/);
  assert.match(html,/legacy-routes\.js/);
  assert.match(html,/noindex,follow/);
  assert.doesNotMatch(html,/courses-data\.js|setInterval|setTimeout/);
}

const redirect=read('legacy-routes.js');
assert.match(redirect,/location\.replace/);
assert.match(redirect,/routes\.courses/);
assert.match(redirect,/routes\.lessons/);
assert.doesNotMatch(redirect,/setInterval|setTimeout/);

console.log('native runtime: 8 páginas HTML; support.js retirado y rutas legacy acotadas');