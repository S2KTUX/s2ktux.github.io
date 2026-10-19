import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const data=JSON.parse(await readFile(resolve(root,'contenido/proyecto.json'),'utf8'));
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
if(!/^\d+\.\d+$/.test(data.version)||data.versiones[0]?.version!==data.version)throw Error('Versión de proyecto incoherente');
const ids=data.pendientes.map(item=>item.id);
if(new Set(ids).size!==ids.length)throw Error('Hay mejoras pendientes duplicadas');
const pending=data.pendientes.map(item=>`<li><span>${escape(item.tema)}.</span> ${escape(item.texto)}</li>`).join('\n');
const versions=data.versiones.map(item=>`<article class="about-version"><h3>v${escape(item.version)} <time datetime="${escape(item.fecha)}">${escape(item.fecha.split('-').reverse().join('/'))}</time></h3>${item.cambios.map(text=>`<p>${escape(text)}</p>`).join('')}</article>`).join('\n');
const htmlPath=resolve(root,'sobre.html');let html=await readFile(htmlPath,'utf8');
for(const [name,content] of [['pendientes',pending],['versiones',versions],['version',escape(data.version)]]){
 const pattern=new RegExp(`(<!-- proyecto:${name} -->)[\\s\\S]*?(<!-- /proyecto:${name} -->)`);
 if(!pattern.test(html))throw Error('Falta el marcador '+name+' en Sobre');
 html=html.replace(pattern,(_,start,end)=>start+content+end);
}
await writeFile(htmlPath,html);
await writeFile(resolve(root,'contenido/pendientes.md'),'# Mejoras pendientes de S2KTUX\n\nEsta lista cambia con el proyecto. Las mejoras comprobadas salen de aquí y pasan al historial de Sobre.\n\n'+data.pendientes.map(item=>'- **'+item.tema+':** '+item.texto).join('\n')+'\n');
console.log('Sobre actualizado: v'+data.version+' · '+data.pendientes.length+' mejoras pendientes.');
// Mantener referencias coherentes al editar estilos compartidos. No añade
// estilos inline ni toca los binarios y manifiestos de las máquinas.
const fingerprints={};
for(const name of ['visual-system.css','site-shell.css'])fingerprints[name]=createHash('sha256').update((await readFile(resolve(root,name),'utf8')).replaceAll('\r\n','\n')).digest('hex').slice(0,12);
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
