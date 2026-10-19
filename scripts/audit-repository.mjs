// Inventario de lectura: no borra archivos. Las rutas dinámicas y licencias
// necesitan revisión humana aunque no haya una referencia literal.
import {execFileSync} from 'node:child_process';
import {readFile,stat} from 'node:fs/promises';
import {dirname,resolve,basename} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const tracked=execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8'}).trim().split('\n'),files=[];
for(const path of tracked){try{await stat(resolve(root,path));files.push(path);}catch(error){if(error.code!=='ENOENT')throw error;}}
const texts=[];
for(const path of files)if(/\.(?:html|inc|m?js|css|jsonc?|md|txt|ya?ml)$/.test(path)){
 const size=(await stat(resolve(root,path))).size;
 if(size<1500000)texts.push([path,await readFile(resolve(root,path),'utf8')]);
}
const candidates=files.filter(path=>/^(?:images|uploads|screenshots)\//.test(path));
for(const path of candidates){
 const name=basename(path),refs=texts.filter(([other,text])=>other!==path&&text.includes(name)).map(([other])=>other);
 if(!refs.length)console.log('SIN_REFERENCIA_LITERAL '+path);
}
console.log('No interpretar este inventario como autorización de borrado automático.');
