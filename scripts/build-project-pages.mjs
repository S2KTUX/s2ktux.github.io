import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validarHistorialProyecto} from './project-versions.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(await readFile(resolve(root,'contenido/proyecto.json'),'utf8'));
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
validarHistorialProyecto(data);
const ids=data.pendientes.map(item=>item.id);
if(new Set(ids).size!==ids.length)throw Error('Hay mejoras pendientes duplicadas');
const pending=data.pendientes.map(item=>`<li><span>${escape(item.tema)}.</span> ${escape(item.texto)}</li>`).join('\n');
const versionDate=item=>`<time datetime="${escape(item.fecha)}">${escape(item.fecha.split('-').reverse().join('/'))}</time>`;
const versions=data.versiones.map(item=>`<article class="about-version" id="version-${escape(item.version)}"><h3>v${escape(item.version)} ${versionDate(item)}</h3><p>${escape(item.resumen)}</p><a class="about-version-link" href="versiones/${escape(item.fecha)}.html">Notas completas de la nueva versión de la página →</a></article>`).join('\n');
const htmlPath=resolve(root,'sobre.html');let html=await readFile(htmlPath,'utf8');
for(const [name,content] of [['pendientes',pending],['versiones',versions],['version',escape(data.version)]]){
 const pattern=new RegExp(`(<!-- proyecto:${name} -->)[\\s\\S]*?(<!-- /proyecto:${name} -->)`);
 if(!pattern.test(html))throw Error('Falta el marcador '+name+' en Sobre');
 html=html.replace(pattern,(_,start,end)=>start+content+end);
}
await writeFile(htmlPath,html);
// Las notas comparten la cabecera, el pie y los estilos de Sobre. El registro
// sigue siendo la única fuente, para no mantener dos historiales distintos.
await mkdir(resolve(root,'versiones'),{recursive:true});
function renderReleasePage({title,description,url,content}){
 return html.replace(/<main id="main-content">[\s\S]*?<\/main>/,content)
  .replace(/<title>[\s\S]*?<\/title>/,`<title>${escape(title)}</title>`)
  .replace(/(<meta (?:name="(?:description|twitter:description)"|property="og:description") content=")[^"]*"/g,(_,start)=>start+escape(description)+'"')
  .replace(/(<meta (?:name="twitter:title"|property="og:title") content=")[^"]*"/g,(_,start)=>start+escape(title)+'"')
  .replaceAll('https://s2ktux.github.io/sobre.html',url)
  .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,'')
  .replace(/\b(href|src)="(?![a-z][a-z0-9+.-]*:|\/|#)([^"]+)"/gi,(_,attr,path)=>`${attr}="../${path.replace(/^\.\//,'')}"`)
  .replace("register('sw.js')","register('../sw.js')");
}
for(const item of data.versiones){
 const title=`Novedades de la versión ${item.version} · S2KTUX`;
 const description=item.resumen;
 const url=`https://s2ktux.github.io/versiones/${item.fecha}.html`;
 const content=`<main id="main-content"><section class="about-page about-release">
<a href="sobre.html#version-${escape(item.version)}">← Volver al historial</a>
<h1>Versión ${escape(item.version)}</h1>
<p class="about-small">${versionDate(item)}</p>
<p>${escape(item.resumen)}</p>
<h2>Qué ha cambiado</h2>
${item.cambios.map(text=>`<p>${escape(text)}</p>`).join('\n')}
</section></main>`;
 const page=renderReleasePage({title,description,url,content});
 await writeFile(resolve(root,`versiones/${item.fecha}.html`),page);
}
// Keep old bookmarks working, but do not list them as separate releases.
for(const [previous,target]of Object.entries(data.versionesAgrupadas||{})){
 const release=data.versiones.find(item=>item.fecha===target);
 const description='Los cambios de este día están reunidos en la versión '+release.version+'.';
 const content=`<main id="main-content"><section class="about-page about-release"><h1>Notas agrupadas</h1><p>${escape(description)}</p><a href="versiones/${escape(target)}.html">Ver las notas completas →</a></section></main>`;
 const page=renderReleasePage({title:'Notas agrupadas · S2KTUX',description,url:`https://s2ktux.github.io/versiones/${target}.html`,content}).replace('</head>',`<meta http-equiv="refresh" content="0; url=${escape(target)}.html">\n</head>`);
 await writeFile(resolve(root,`versiones/${previous}.html`),page);
}
await writeFile(resolve(root,'contenido/pendientes.md'),'# Mejoras pendientes de S2KTUX\n\nEsta lista cambia con el proyecto. Las mejoras comprobadas salen de aquí y pasan al historial de Sobre.\n\n'+data.pendientes.map(item=>'- **'+item.tema+':** '+item.texto).join('\n')+'\n');
console.log('Sobre actualizado: v'+data.version+' · '+data.pendientes.length+' mejoras pendientes.');
// Mantener referencias coherentes al editar estilos compartidos. No añade
// estilos inline ni toca los binarios y manifiestos de las máquinas.
const fingerprints={};
for(const name of ['visual-system.css','site-shell.css','learning-pages.css'])fingerprints[name]=createHash('sha256').update((await readFile(resolve(root,name),'utf8')).replaceAll('\r\n','\n')).digest('hex').slice(0,12);
async function syncStyles(dir){for(const entry of await readdir(dir,{withFileTypes:true})){
 if(['.git','node_modules','_site','playwright-report','test-results'].includes(entry.name))continue;
 const path=resolve(dir,entry.name);
 if(entry.isDirectory()){await syncStyles(path);continue;}
 if(!/\.(html|inc)$/.test(entry.name))continue;
 const source=await readFile(path,'utf8');let updated=source;
 for(const [name,hash] of Object.entries(fingerprints))updated=updated.replace(new RegExp(name.replace('.', '\\.')+'\\?v=[^"\'\\s>]+','g'),name+'?v='+hash);
 if(source!==updated)await writeFile(path,updated);
}}
await syncStyles(root);
const swPath=resolve(root,'sw.js'),sw=await readFile(swPath,'utf8');let updatedSw=sw;
for(const [name,hash] of Object.entries(fingerprints))updatedSw=updatedSw.replace(new RegExp(name.replace('.', '\\.')+'\\?v=[^"\'\\s>]+','g'),name+'?v='+hash);
if(sw!==updatedSw)await writeFile(swPath,updatedSw);
