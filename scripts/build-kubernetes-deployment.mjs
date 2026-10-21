import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base=new URL('../laboratorios/kubernetes-real/',import.meta.url),file=new URL('publicacion.json',base);
const manifest=JSON.parse(await readFile(file,'utf8'));
const readText=async path=>(await readFile(new URL(path,base),'utf8')).replaceAll('\r\n','\n');
const revision=async path=>createHash('sha256').update(await readText(path)).digest('hex').slice(0,16);
async function replaceRequired(path,pattern,replacement){
 const original=await readText(path);if(!pattern.test(original))throw Error('No se encuentra la referencia versionada en '+path);
 const updated=original.replace(pattern,replacement);if(updated!==original)await writeFile(new URL(path,base),updated);
}
// El HTML y la interfaz cambian juntos. Versionar la cadena de entrada evita
// reutilizar módulos de una revisión anterior en pestañas que ya estaban abiertas.
await replaceRequired('disco-kubernetes.mjs',/from '\.\/cache-bloques\.mjs(?:\?v=[a-f0-9]+)?'/,"from './cache-bloques.mjs?v="+await revision('cache-bloques.mjs')+"'");
await replaceRequired('debian/cliente.mjs',/from '\.\.\/disco-kubernetes\.mjs(?:\?v=[a-f0-9]+)?'/,"from '../disco-kubernetes.mjs?v="+await revision('disco-kubernetes.mjs')+"'");
await replaceRequired('debian/cliente.mjs',/from '\.\.\/serial-checks\.mjs(?:\?v=[a-z0-9-]+)?'/,"from '../serial-checks.mjs?v="+await revision('serial-checks.mjs')+"'");
await replaceRequired('debian/cliente.mjs',/from '\.\/comprobar-entorno-preparado\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './comprobar-entorno-preparado.mjs?v="+await revision('debian/comprobar-entorno-preparado.mjs')+"'");
await replaceRequired('debian/index.html',/src="cliente\.mjs(?:\?v=[a-z0-9-]+)?"/,'src="cliente.mjs?v='+await revision('debian/cliente.mjs')+'"');
await replaceRequired('debian/multinodo.mjs',/const nodeUIRevision='[a-f0-9]+'/,"const nodeUIRevision='"+await revision('debian/index.html')+"'");
await replaceRequired('debian/multinodo.mjs',/from '\.\/interfaz-niveles\.mjs(?:\?v=[a-f0-9]+)?'/,"from './interfaz-niveles.mjs?v="+await revision('debian/interfaz-niveles.mjs')+"'");
await replaceRequired('debian/entrada-laboratorio.mjs',/import\('\.\/multinodo\.mjs(?:\?v=[a-f0-9]+)?'\)/,"import('./multinodo.mjs?v="+await revision('debian/multinodo.mjs')+"')");
await replaceRequired('debian/multinodo.html',/src="entrada-laboratorio\.mjs(?:\?v=[a-f0-9]+)?"/,'src="entrada-laboratorio.mjs?v='+await revision('debian/entrada-laboratorio.mjs')+'"');
await replaceRequired('debian/multinodo.html',/href="niveles\.css(?:\?v=[a-f0-9]+)?"/,'href="niveles.css?v='+await revision('debian/niveles.css')+'"');
for(const path of ['cache-bloques.mjs','debian/disponibilidad-curso.mjs','debian/clases-curso.mjs','debian/ejercicios-iniciales.mjs','debian/ejercicios-aprender.mjs','debian/ejercicios-progresivos.mjs','debian/comprobaciones-json.mjs','debian/motor-practicas.mjs','debian/salud-inicial.mjs','debian/ejercicios-intermedios.mjs','debian/herramientas-practicas.mjs','debian/criterios-equivalentes.mjs']){
 if(!manifest.files.some(record=>record.path===path))manifest.files.push({path,bytes:0,sha256:''});
}
for(const record of manifest.files){
 if(!/^[a-zA-Z0-9_.\/-]+$/.test(record.path)||record.path.split('/').includes('..'))throw Error('Ruta fuera de la entrega');
 const path=new URL(record.path,base);let bytes=await readFile(path);
 // Git normaliza texto a LF en Linux/Pages. Fijar los hashes sobre esos
 // mismos bytes, sin alterar archivos comprimidos ni otros laboratorios.
 if(!record.path.endsWith('.gz')){const canonical=Buffer.from(bytes.toString('utf8').replaceAll('\r\n','\n'));if(!canonical.equals(bytes)){await writeFile(path,canonical);bytes=canonical;}}
 record.bytes=bytes.length;record.sha256=createHash('sha256').update(bytes).digest('hex');
}
await writeFile(file,JSON.stringify(manifest,null,2)+'\n');
console.log('Manifiesto Kubernetes beta actualizado; discos y motor permanecen fijados al commit de recursos.');
