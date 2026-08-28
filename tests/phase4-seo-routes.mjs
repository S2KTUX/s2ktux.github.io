import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const read=path=>readFile(join(root,path),'utf8');
const site='https://s2ktux.github.io';
const redirects={
  "rhcsa/1/1.html": "/cursos/rhcsa-9/tema-1-herramientas-esenciales/",
  "rhcsa/2/2.html": "/cursos/rhcsa-9/tema-2-administracion-del-software/",
  "rhcsa/3/3.html": "/cursos/rhcsa-9/tema-3-crear-scripts-de-shell-simples/",
  "rhcsa/4/4.html": "/cursos/rhcsa-9/tema-4-operar-sistemas-en-funcionamiento/",
  "rhcsa/5/5.html": "/cursos/rhcsa-9/tema-5-configuracion-del-almacenamiento-local/",
  "rhcsa/6/6.html": "/cursos/rhcsa-9/tema-6-crear-y-configurar-sistemas-de-archivos/",
  "rhcsa/7/7.html": "/cursos/rhcsa-9/tema-7-implementar-configurar-y-mantener-sistemas/",
  "rhcsa/8/8.html": "/cursos/rhcsa-9/tema-8-administrar-redes-basicas/",
  "rhcsa/9/9.html": "/cursos/rhcsa-9/tema-9-administrar-usuarios-y-grupos/",
  "rhcsa/10/10.html": "/cursos/rhcsa-9/tema-10-administrar-la-seguridad/",
  "rhcsa/11/11.html": "/cursos/rhcsa-9/tema-11-clase-extra/",
  "lpic/101/1.html": "/cursos/lpic-1/tema-101-arquitectura-del-sistema/",
  "lpic/102/2.html": "/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/",
  "lpic/103/3.html": "/cursos/lpic-1/tema-103-comandos-gnu-y-unix/",
  "lpic/104/4.html": "/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/",
  "lpic/105/5.html": "/cursos/lpic-1/tema-105-shells-y-scripts/",
  "lpic/106/106.html": "/cursos/lpic-1/tema-106-interfaces-graficas-y-accesibilidad/",
  "lpic/107/7.html": "/cursos/lpic-1/tema-107-tareas-administrativas/",
  "lpic/108/8.html": "/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/",
  "lpic/109/9.html": "/cursos/lpic-1/tema-109-fundamentos-de-redes/",
  "lpic/110/10.html": "/cursos/lpic-1/tema-110-seguridad-del-sistema/",
  "docker/1/1.html": "/cursos/docker/clase-1-fundamentos-de-docker/",
  "docker/2/2.html": "/cursos/docker/clase-2-docker-para-el-dia-a-dia/",
  "docker/3/3.html": "/cursos/docker/clase-3-docker-profesional/",
  "rhcsa/EXTRA/extra.html": "/cursos/rhcsa-9/tema-11-clase-extra/"
};
const sources=[
  "_rhcsa/1/1.inc",
  "_rhcsa/2/2.inc",
  "_rhcsa/3/3.inc",
  "_rhcsa/4/4.inc",
  "_rhcsa/5/5.inc",
  "_rhcsa/6/6.inc",
  "_rhcsa/7/7.inc",
  "_rhcsa/8/8.inc",
  "_rhcsa/9/9.inc",
  "_rhcsa/10/10.inc",
  "_rhcsa/11/11.inc",
  "_lpic/101/1.inc",
  "_lpic/102/2.inc",
  "_lpic/103/3.inc",
  "_lpic/104/4.inc",
  "_lpic/105/5.inc",
  "_lpic/106/106.inc",
  "_lpic/107/7.inc",
  "_lpic/108/8.inc",
  "_lpic/109/9.inc",
  "_lpic/110/10.inc",
  "_docker/1/1.inc",
  "_docker/2/2.inc",
  "_docker/3/3.inc"
];
const sitemap=await read('sitemap.xml');
const urls=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
assert.equal(urls.length,34);
assert.equal(new Set(urls).size,urls.length);
assert.doesNotMatch(sitemap,/changefreq|priority/);
for(const url of urls){
 const route=new URL(url).pathname;
 const path=route==='/'?'index.html':route.endsWith('/')?route.slice(1)+'index.html':route.slice(1);
 await access(join(root,path));
 const html=await read(path);
 assert.doesNotMatch(html,/name=["']robots["'][^>]*content=["'][^"']*noindex/i);
 assert.ok(html.includes(`rel="canonical" href="${url}"`),`canonical: ${path}`);
 assert.ok(html.includes(`property="og:url" content="${url}"`),`og:url: ${path}`);
}
const courses=await read('cursos.html');
const block=courses.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
const list=JSON.parse(block[1]);
assert.equal(list['@type'],'ItemList');
assert.deepEqual(list.itemListElement.map(x=>x.position),[1,2,3]);
assert.deepEqual(list.itemListElement.map(x=>x.item['@type']),['Course','Course','Course']);
assert.doesNotMatch(block[1],/kubernetes-cka/);
const types={'terminal.html':'SoftwareApplication','proyectos.html':'CollectionPage','proyecto-kubernetes.html':'TechArticle','proyecto-proxmox.html':'TechArticle','sobre.html':'AboutPage'};
for(const [path,type] of Object.entries(types)){
 const blocks=[...(await read(path)).matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
 assert.ok(blocks.some(x=>x['@type']===type),`${type}: ${path}`);
}
const rules=(await read('_redirects')).split(/\r?\n/).filter(x=>x&&!x.startsWith('#'));
assert.equal(rules.length,Object.keys(redirects).length);
for(const [oldPath,target] of Object.entries(redirects)){
 assert.ok(rules.includes(`/${oldPath} ${target} 301`));
 const html=await read(oldPath);
 assert.match(html,/name="robots" content="noindex,follow,noarchive"/);
 assert.ok(html.includes(`rel="canonical" href="${site}${target}"`));
 assert.ok(html.includes(`http-equiv="refresh" content="0;url=${target}"`));
}
for(const path of sources){
 const source=await read(path);
 assert.doesNotMatch(source,/<\/?(?:html|head|body)\b/i);
 assert.match(source,/class="[^"]*\bcourse-content\b[^"]*"/);
 assert.equal(urls.some(url=>url.includes(path)),false);
}
const headers=await read('_headers'),robots=await read('robots.txt');
for(const prefix of ['_rhcsa','_lpic','_docker']){
 assert.ok(headers.includes(`/${prefix}/*`));
 assert.ok(robots.includes(`Disallow: /${prefix}/`));
}
for(const path of ['curso.html','leccion.html']){
 const html=await read(path);
 assert.match(html,/name="robots" content="noindex,follow"/);
 assert.match(html,/learning-routes\.js[\s\S]*legacy-routes\.js/);
}
assert.match(robots,/Sitemap:\s+https:\/\/s2ktux\.github\.io\/sitemap\.xml/);
console.log('phase 4 SEO: canonicals, sitemap, structured data and legacy routes are coherent');
