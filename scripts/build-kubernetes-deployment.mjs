import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {revisionPreparacion} from './kubernetes-preparation-revision.mjs';
import {claseDisponible} from '../laboratorios/kubernetes-real/debian/disponibilidad-curso.mjs';
const base=new URL('../laboratorios/kubernetes-real/',import.meta.url),file=new URL('publicacion.json',base);
const manifest=JSON.parse(await readFile(file,'utf8'));
for(const path of ['debian/ejercicios-almacenamiento.mjs','debian/almacenamiento-curso.mjs','debian/almacenamiento-paquete.mjs','recursos/almacenamiento-v1/local-path.yaml.gz','recursos/almacenamiento-v1/local-path-original.yaml'])if(!manifest.files.some(record=>record.path===path))manifest.files.push({path,bytes:0,sha256:''});
const readText=async path=>(await readFile(new URL(path,base),'utf8')).replaceAll('\r\n','\n');
const revision=async path=>createHash('sha256').update(await readText(path)).digest('hex').slice(0,16);
async function replaceRequired(path,pattern,replacement){
 const original=await readText(path);if(!pattern.test(original))throw Error('No se encuentra la referencia versionada en '+path);
 const updated=original.replace(pattern,replacement);if(updated!==original)await writeFile(new URL(path,base),updated);
}
// El HTML y la interfaz cambian juntos. Versionar la cadena de entrada evita
// reutilizar módulos de una revisión anterior en pestañas que ya estaban abiertas.
for(const path of ['debian/entrada-laboratorio.mjs','debian/multinodo.mjs','debian/interfaz-niveles.mjs','debian/ejercicios-niveles.mjs'])await replaceRequired(path,/from '\.\/disponibilidad-curso\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './disponibilidad-curso.mjs?v="+await revision('debian/disponibilidad-curso.mjs')+"'");
await replaceRequired('debian/ejercicios-niveles.mjs',/from '\.\/ejercicios-acceso\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './ejercicios-acceso.mjs?v="+await revision('debian/ejercicios-acceso.mjs')+"'");
await replaceRequired('debian/ejercicios-niveles.mjs',/from '\.\/ejercicios-almacenamiento\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './ejercicios-almacenamiento.mjs?v="+await revision('debian/ejercicios-almacenamiento.mjs')+"'");
await replaceRequired('debian/ejercicios-almacenamiento.mjs',/from '\.\/herramientas-practicas\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './herramientas-practicas.mjs?v="+await revision('debian/herramientas-practicas.mjs')+"'");
await replaceRequired('debian/fabrica-cluster.mjs',/from '\.\.\/\.\.\/verified-download\.mjs(?:\?v=[a-z0-9-]+)?'/,"from '../../verified-download.mjs?v="+await revision('../verified-download.mjs')+"'");
await replaceRequired('debian/almacenamiento-curso.mjs',/from '\.\/almacenamiento-paquete\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './almacenamiento-paquete.mjs?v="+await revision('debian/almacenamiento-paquete.mjs')+"'");
await replaceRequired('debian/motor-practicas.mjs',/import\('\.\/almacenamiento-curso\.mjs(?:\?v=[a-z0-9-]+)?'\)/,"import('./almacenamiento-curso.mjs?v="+await revision('debian/almacenamiento-curso.mjs')+"')");
await replaceRequired('debian/interfaz-niveles.mjs',/from '\.\/motor-practicas\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './motor-practicas.mjs?v="+await revision('debian/motor-practicas.mjs')+"'");
await replaceRequired('debian/interfaz-niveles.mjs',/from '\.\/ejercicios-niveles\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './ejercicios-niveles.mjs?v="+await revision('debian/ejercicios-niveles.mjs')+"'");
await replaceRequired('disco-kubernetes.mjs',/from '\.\/cache-bloques\.mjs(?:\?v=[a-f0-9]+)?'/,"from './cache-bloques.mjs?v="+await revision('cache-bloques.mjs')+"'");
await replaceRequired('motor-worker.mjs',/from '\.\/disco-kubernetes\.mjs(?:\?v=[a-f0-9]+)?'/,"from './disco-kubernetes.mjs?v="+await revision('disco-kubernetes.mjs')+"'");
await replaceRequired('motor-hilo.mjs',/new URL\('\.\/motor-worker\.mjs(?:\?v=[a-f0-9]+)?',import\.meta\.url\)/,"new URL('./motor-worker.mjs?v="+await revision('motor-worker.mjs')+"',import.meta.url)");
await replaceRequired('debian/cliente.mjs',/from '\.\.\/motor-hilo\.mjs(?:\?v=[a-f0-9]+)?'/,"from '../motor-hilo.mjs?v="+await revision('motor-hilo.mjs')+"'");
await replaceRequired('debian/cliente.mjs',/from '\.\.\/disco-kubernetes\.mjs(?:\?v=[a-f0-9]+)?'/,"from '../disco-kubernetes.mjs?v="+await revision('disco-kubernetes.mjs')+"'");
await replaceRequired('debian/cliente.mjs',/from '\.\.\/serial-checks\.mjs(?:\?v=[a-z0-9-]+)?'/,"from '../serial-checks.mjs?v="+await revision('serial-checks.mjs')+"'");
await replaceRequired('debian/cliente.mjs',/from '\.\/comprobar-entorno-preparado\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './comprobar-entorno-preparado.mjs?v="+await revision('debian/comprobar-entorno-preparado.mjs')+"'");
await replaceRequired('debian/index.html',/src="cliente\.mjs(?:\?v=[a-z0-9-]+)?"/,'src="cliente.mjs?v='+await revision('debian/cliente.mjs')+'"');
await replaceRequired('debian/multinodo.mjs',/const nodeUIRevision='[a-f0-9]+'/,"const nodeUIRevision='"+await revision('debian/index.html')+"'");
await replaceRequired('debian/multinodo.mjs',/from '\.\/interfaz-niveles\.mjs(?:\?v=[a-f0-9]+)?'/,"from './interfaz-niveles.mjs?v="+await revision('debian/interfaz-niveles.mjs')+"'");
await replaceRequired('debian/multinodo.mjs',/from '\.\/bases-limpias\.mjs(?:\?v=[a-f0-9]+)?'/,"from './bases-limpias.mjs?v="+await revision('debian/bases-limpias.mjs')+"'");
for(const path of ['debian/bases-publicadas.mjs','debian/fabrica-cluster.mjs']){
 if(!manifest.files.some(record=>record.path===path))manifest.files.push({path,bytes:0,sha256:''});
 await replaceRequired('debian/multinodo.mjs',new RegExp("from '\\./"+path.split('/').at(-1).replaceAll('.','\\.')+"(?:\\?v=[a-f0-9]+)?'"),"from './"+path.split('/').at(-1)+'?v='+await revision(path)+"'");
}
const nativeFiles=[...new Set([...manifest.files.map(record=>record.path),'debian/bases-limpias.mjs','debian/ejercicios-acceso.mjs'])].filter(path=>path.endsWith('.mjs')&&path!=='debian/entrada-laboratorio.mjs').sort();
const preparation=[];
for(const path of nativeFiles)preparation.push({path,source:await readText(path)});
await replaceRequired('debian/multinodo.mjs',/const cleanRevision='[a-f0-9]+'/,"const cleanRevision='"+revisionPreparacion(preparation,{policies:claseDisponible(21),materials:claseDisponible(15)})+"'");
await replaceRequired('debian/entrada-laboratorio.mjs',/import\('\.\/multinodo\.mjs(?:\?v=[a-f0-9]+)?'\)/,"import('./multinodo.mjs?v="+await revision('debian/multinodo.mjs')+"')");
await replaceRequired('debian/multinodo.html',/src="entrada-laboratorio\.mjs(?:\?v=[a-f0-9]+)?"/,'src="entrada-laboratorio.mjs?v='+await revision('debian/entrada-laboratorio.mjs')+'"');
await replaceRequired('debian/multinodo.html',/href="niveles\.css(?:\?v=[a-f0-9]+)?"/,'href="niveles.css?v='+await revision('debian/niveles.css')+'"');
for(const path of ['debian/bases-limpias.mjs','debian/ejercicios-acceso.mjs','cache-bloques.mjs','debian/disponibilidad-curso.mjs','debian/clases-curso.mjs','debian/ejercicios-iniciales.mjs','debian/ejercicios-aprender.mjs','debian/ejercicios-progresivos.mjs','debian/comprobaciones-json.mjs','debian/motor-practicas.mjs','debian/salud-inicial.mjs','debian/ejercicios-intermedios.mjs','debian/herramientas-practicas.mjs','debian/criterios-equivalentes.mjs']){
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
