import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {revisionPreparacion} from './kubernetes-preparation-revision.mjs';
import {claseDisponible} from '../laboratorios/kubernetes-real/debian/disponibilidad-curso.mjs';
const base=new URL('../laboratorios/kubernetes-real/',import.meta.url),file=new URL('publicacion.json',base);
const manifest=JSON.parse(await readFile(file,'utf8'));
const haFiles=['perfil-ha','ha-configuracion','tiempos-etcd','configuracion-admin-curso','perfil-controlplane','ha-rutas','archivo-http-local','ha-curso','sesiones-ha','ejercicios-ha'];
for(const path of [...haFiles.map(name=>'debian/'+name+'.mjs'),'debian/materiales-ha/kubeadm.yaml','debian/materiales-ha/etcd-strategic.yaml','debian/vendor/fetch-network.mjs','debian/vendor/LICENSE-v86-network.txt'])if(!manifest.files.some(record=>record.path===path))manifest.files.push({path,bytes:0,sha256:''});
for(const path of ['debian/cni-montaje-curso.mjs','debian/montaje-manual-curso.mjs','debian/leer-join-curso.mjs','debian/esperar-nodo-curso.mjs','debian/ejercicios-montaje.mjs'])if(!manifest.files.some(record=>record.path===path))manifest.files.push({path,bytes:0,sha256:''});
if(!manifest.files.some(record=>record.path==='debian/perfil-administracion.mjs'))manifest.files.push({path:'debian/perfil-administracion.mjs',bytes:0,sha256:''});
if(!manifest.files.some(record=>record.path==='debian/escenarios-curso.mjs'))manifest.files.push({path:'debian/escenarios-curso.mjs',bytes:0,sha256:''});
for(const path of ['debian/ejercicios-ciclo-cluster.mjs','debian/ejercicios-avanzados.mjs','debian/complementos-avanzados.mjs','debian/ejercicios-administracion.mjs','debian/ejercicios-gateway.mjs','debian/gateway-curso.mjs','debian/rewrite-curso.mjs','debian/crds-curso.mjs','recursos/curso-debian-v1/materiales.tar.gz'])if(!manifest.files.some(record=>record.path===path))manifest.files.push({path,bytes:0,sha256:''});
for(const path of ['debian/ejercicios-almacenamiento.mjs','debian/almacenamiento-curso.mjs','debian/almacenamiento-paquete.mjs','recursos/almacenamiento-v1/local-path.yaml.gz','recursos/almacenamiento-v1/local-path-original.yaml','debian/ejercicios-controladores.mjs','debian/ejercicios-ingress.mjs','debian/ingress-curso.mjs','debian/ejercicios-scheduling.mjs','debian/ejercicios-red.mjs','debian/ejercicios-dns.mjs','debian/red-politicas-curso.mjs'])if(!manifest.files.some(record=>record.path===path))manifest.files.push({path,bytes:0,sha256:''});
const readText=async path=>(await readFile(new URL(path,base),'utf8')).replaceAll('\r\n','\n');
const revision=async path=>createHash('sha256').update(await readText(path)).digest('hex').slice(0,16);
async function replaceRequired(path,pattern,replacement){
 const original=await readText(path);if(!pattern.test(original))throw Error('No se encuentra la referencia versionada en '+path);
 const updated=original.replace(pattern,replacement);if(updated!==original)await writeFile(new URL(path,base),updated);
}
await replaceRequired('debian/archivo-http-local.mjs',/import\('\.\/vendor\/fetch-network\.mjs(?:\?v=[a-f0-9]+)?'\)/,"import('./vendor/fetch-network.mjs?v="+await revision('debian/vendor/fetch-network.mjs')+"')");
for(const parent of ['debian/sesiones-cluster.mjs','debian/multinodo.mjs','debian/interfaz-niveles.mjs'])await replaceRequired(parent,/from '\.\/escenarios-curso\.mjs(?:\?v=[a-f0-9]+)?'/,"from './escenarios-curso.mjs?v="+await revision('debian/escenarios-curso.mjs')+"'");
// Dependencias HA primero; ninguna captura de estudio se convierte al perfil HA.
for(const [parent,children] of [
 ['configuracion-admin-curso',['ha-configuracion','tiempos-etcd']],['ha-rutas',['ha-configuracion']],['archivo-http-local',['perfil-ha']],
 ['ha-curso',['ha-configuracion','perfil-ha','configuracion-admin-curso','perfil-controlplane','ha-rutas','archivo-http-local']],
 ['ejercicios-ha',['ha-curso']],['cliente',['perfil-ha']],['sesiones-ha',['perfil-ha']]
])for(const child of children)await replaceRequired('debian/'+parent+'.mjs',new RegExp("from '\\./"+child+"\\.mjs(?:\\?v=[a-f0-9]+)?'"),"from './"+child+".mjs?v="+await revision('debian/'+child+'.mjs')+"'");
await replaceRequired('debian/ejercicios-niveles.mjs',/from '\.\/ejercicios-ha\.mjs(?:\?v=[a-f0-9]+)?'/,"from './ejercicios-ha.mjs?v="+await revision('debian/ejercicios-ha.mjs')+"'");
for(const parent of ['debian/cliente.mjs','debian/sesiones-cluster.mjs'])await replaceRequired(parent,/from '\.\/fabrica\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './fabrica.mjs?v="+await revision('debian/fabrica.mjs')+"'");
await replaceRequired('debian/montaje-manual-curso.mjs',/from '\.\/cni-montaje-curso\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './cni-montaje-curso.mjs?v="+await revision('debian/cni-montaje-curso.mjs')+"'");
await replaceRequired('debian/multinodo.mjs',/from '\.\/montaje-manual-curso\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './montaje-manual-curso.mjs?v="+await revision('debian/montaje-manual-curso.mjs')+"'");
await replaceRequired('debian/ejercicios-niveles.mjs',/from '\.\/ejercicios-montaje\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './ejercicios-montaje.mjs?v="+await revision('debian/ejercicios-montaje.mjs')+"'");
// El HTML y la interfaz cambian juntos. Versionar la cadena de entrada evita
// reutilizar módulos de una revisión anterior en pestañas que ya estaban abiertas.
// Primero el hijo: sus referencias deben cambiar antes de calcular el hash
// de sesiones, cliente y páginas que lo importan.
if(!manifest.files.some(record=>record.path==='comprimir-estado.mjs'))manifest.files.push({path:'comprimir-estado.mjs',bytes:0,sha256:''});
await replaceRequired('debian/sesiones-cluster.mjs',/from '\.\.\/comprimir-estado\.mjs(?:\?v=[a-z0-9-]+)?'/,"from '../comprimir-estado.mjs?v="+await revision('comprimir-estado.mjs')+"'");
for(const parent of ['kube-sessions.mjs','debian/sesiones-cluster.mjs'])await replaceRequired(parent,/from '\/laboratorios\/docker-real\/v86-sessions\.mjs(?:\?v=[a-z0-9-]+)?'/,"from '/laboratorios/docker-real/v86-sessions.mjs?v="+await revision('../docker-real/v86-sessions.mjs')+"'");
for(const parent of ['debian/sesiones-cluster.mjs','debian/cliente.mjs'])await replaceRequired(parent,/from '\.\.\/kube-sessions\.mjs(?:\?v=[a-z0-9-]+)?'/,"from '../kube-sessions.mjs?v="+await revision('kube-sessions.mjs')+"'");
for(const parent of ['debian/bases-limpias.mjs','debian/multinodo.mjs','debian/cliente.mjs'])await replaceRequired(parent,/from '\.\/sesiones-cluster\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './sesiones-cluster.mjs?v="+await revision('debian/sesiones-cluster.mjs')+"'");
await replaceRequired('debian/sesiones-ha.mjs',/from '\.\/sesiones-cluster\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './sesiones-cluster.mjs?v="+await revision('debian/sesiones-cluster.mjs')+"'");
for(const child of ['sesiones-ha','perfil-ha','ha-curso'])await replaceRequired('debian/multinodo.mjs',new RegExp("from '\\./"+child+"\\.mjs(?:\\?v=[a-f0-9]+)?'"),"from './"+child+".mjs?v="+await revision('debian/'+child+'.mjs')+"'");
for(const path of ['debian/entrada-laboratorio.mjs','debian/multinodo.mjs','debian/interfaz-niveles.mjs','debian/ejercicios-niveles.mjs'])await replaceRequired(path,/from '\.\/disponibilidad-curso\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './disponibilidad-curso.mjs?v="+await revision('debian/disponibilidad-curso.mjs')+"'");
await replaceRequired('debian/ejercicios-niveles.mjs',/from '\.\/ejercicios-acceso\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './ejercicios-acceso.mjs?v="+await revision('debian/ejercicios-acceso.mjs')+"'");
await replaceRequired('debian/ejercicios-almacenamiento.mjs',/from '\.\/herramientas-practicas\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './herramientas-practicas.mjs?v="+await revision('debian/herramientas-practicas.mjs')+"'");
await replaceRequired('debian/ejercicios-niveles.mjs',/from '\.\/ejercicios-almacenamiento\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './ejercicios-almacenamiento.mjs?v="+await revision('debian/ejercicios-almacenamiento.mjs')+"'");
for(const child of ['ejercicios-controladores','ejercicios-ingress','ejercicios-scheduling','ejercicios-red','ejercicios-dns','ejercicios-gateway']){
 await replaceRequired('debian/'+child+'.mjs',/from '\.\/herramientas-practicas\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './herramientas-practicas.mjs?v="+await revision('debian/herramientas-practicas.mjs')+"'");
 await replaceRequired('debian/ejercicios-niveles.mjs',new RegExp("from '\\./"+child+"\\.mjs(?:\\?v=[a-z0-9-]+)?'"),"from './"+child+".mjs?v="+await revision('debian/'+child+'.mjs')+"'");
}
for(const child of ['ejercicios-administracion','ejercicios-ciclo-cluster','ejercicios-avanzados'])await replaceRequired('debian/ejercicios-niveles.mjs',new RegExp("from '\\./"+child+"\\.mjs(?:\\?v=[a-z0-9-]+)?'"),"from './"+child+".mjs?v="+await revision('debian/'+child+'.mjs')+"'");
await replaceRequired('debian/ingress-curso.mjs',/from '\.\/materiales-curso\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './materiales-curso.mjs?v="+await revision('debian/materiales-curso.mjs')+"'");
await replaceRequired('debian/complementos-avanzados.mjs',/from '\.\/materiales-curso\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './materiales-curso.mjs?v="+await revision('debian/materiales-curso.mjs')+"'");
await replaceRequired('debian/motor-practicas.mjs',/import\('\.\/complementos-avanzados\.mjs(?:\?v=[a-z0-9-]+)?'\)/g,"import('./complementos-avanzados.mjs?v="+await revision('debian/complementos-avanzados.mjs')+"')");
await replaceRequired('debian/gateway-curso.mjs',/from '\.\/ingress-curso\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './ingress-curso.mjs?v="+await revision('debian/ingress-curso.mjs')+"'");
await replaceRequired('debian/rewrite-curso.mjs',/from '\.\/ingress-curso\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './ingress-curso.mjs?v="+await revision('debian/ingress-curso.mjs')+"'");
for(const parent of ['gateway-curso','rewrite-curso'])await replaceRequired('debian/'+parent+'.mjs',/from '\.\/crds-curso\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './crds-curso.mjs?v="+await revision('debian/crds-curso.mjs')+"'");
await replaceRequired('debian/motor-practicas.mjs',/import\('\.\/rewrite-curso\.mjs(?:\?v=[a-z0-9-]+)?'\)/,"import('./rewrite-curso.mjs?v="+await revision('debian/rewrite-curso.mjs')+"')");
await replaceRequired('debian/motor-practicas.mjs',/import\('\.\/gateway-curso\.mjs(?:\?v=[a-z0-9-]+)?'\)/,"import('./gateway-curso.mjs?v="+await revision('debian/gateway-curso.mjs')+"')");
await replaceRequired('debian/motor-practicas.mjs',/import\('\.\/red-politicas-curso\.mjs(?:\?v=[a-z0-9-]+)?'\)/,"import('./red-politicas-curso.mjs?v="+await revision('debian/red-politicas-curso.mjs')+"')");
await replaceRequired('debian/motor-practicas.mjs',/import\('\.\/ingress-curso\.mjs(?:\?v=[a-z0-9-]+)?'\)/,"import('./ingress-curso.mjs?v="+await revision('debian/ingress-curso.mjs')+"')");
await replaceRequired('debian/fabrica-cluster.mjs',/from '\.\.\/\.\.\/verified-download\.mjs(?:\?v=[a-z0-9-]+)?'/,"from '../../verified-download.mjs?v="+await revision('../verified-download.mjs')+"'");
await replaceRequired('debian/almacenamiento-curso.mjs',/from '\.\/almacenamiento-paquete\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './almacenamiento-paquete.mjs?v="+await revision('debian/almacenamiento-paquete.mjs')+"'");
await replaceRequired('debian/motor-practicas.mjs',/import\('\.\/almacenamiento-curso\.mjs(?:\?v=[a-z0-9-]+)?'\)/,"import('./almacenamiento-curso.mjs?v="+await revision('debian/almacenamiento-curso.mjs')+"')");
await replaceRequired('debian/interfaz-niveles.mjs',/from '\.\/motor-practicas\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './motor-practicas.mjs?v="+await revision('debian/motor-practicas.mjs')+"'");
await replaceRequired('debian/interfaz-niveles.mjs',/from '\.\/ejercicios-niveles\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './ejercicios-niveles.mjs?v="+await revision('debian/ejercicios-niveles.mjs')+"'");
await replaceRequired('disco-kubernetes.mjs',/from '\.\/cache-bloques\.mjs(?:\?v=[a-f0-9]+)?'/,"from './cache-bloques.mjs?v="+await revision('cache-bloques.mjs')+"'");
for(const parent of ['debian/cliente.mjs','motor-worker.mjs'])await replaceRequired(parent,/from '\.\.\/perfil-motor\.mjs(?:\?v=[a-f0-9]+)?'|from '\.\/perfil-motor\.mjs(?:\?v=[a-f0-9]+)?'/,"from '"+(parent.startsWith('debian/')?'../':'./')+'perfil-motor.mjs?v='+await revision('perfil-motor.mjs')+"'");
await replaceRequired('motor-worker.mjs',/from '\.\/disco-kubernetes\.mjs(?:\?v=[a-f0-9]+)?'/,"from './disco-kubernetes.mjs?v="+await revision('disco-kubernetes.mjs')+"'");
await replaceRequired('motor-hilo.mjs',/new URL\('\.\/motor-worker\.mjs(?:\?v=[a-f0-9]+)?',import\.meta\.url\)/,"new URL('./motor-worker.mjs?v="+await revision('motor-worker.mjs')+"',import.meta.url)");
await replaceRequired('debian/cliente.mjs',/from '\.\.\/motor-hilo\.mjs(?:\?v=[a-f0-9]+)?'/,"from '../motor-hilo.mjs?v="+await revision('motor-hilo.mjs')+"'");
await replaceRequired('debian/cliente.mjs',/from '\.\.\/disco-kubernetes\.mjs(?:\?v=[a-f0-9]+)?'/,"from '../disco-kubernetes.mjs?v="+await revision('disco-kubernetes.mjs')+"'");
await replaceRequired('debian/cliente.mjs',/from '\.\.\/serial-checks\.mjs(?:\?v=[a-z0-9-]+)?'/,"from '../serial-checks.mjs?v="+await revision('serial-checks.mjs')+"'");
await replaceRequired('debian/cliente.mjs',/from '\.\/perfil-administracion\.mjs(?:\?v=[a-f0-9]+)?'/,"from './perfil-administracion.mjs?v="+await revision('debian/perfil-administracion.mjs')+"'");
await replaceRequired('debian/cliente.mjs',/from '\.\/kernel-perfil\.mjs(?:\?v=[a-f0-9]+)?'/,"from './kernel-perfil.mjs?v="+await revision('debian/kernel-perfil.mjs')+"'");
await replaceRequired('debian/cliente.mjs',/from '\.\/preparar-administracion\.mjs(?:\?v=[a-f0-9]+)?'/,"from './preparar-administracion.mjs?v="+await revision('debian/preparar-administracion.mjs')+"'");
await replaceRequired('debian/cliente.mjs',/from '\.\/comprobar-entorno-preparado\.mjs(?:\?v=[a-z0-9-]+)?'/,"from './comprobar-entorno-preparado.mjs?v="+await revision('debian/comprobar-entorno-preparado.mjs')+"'");
await replaceRequired('debian/index.html',/src="cliente\.mjs(?:\?v=[a-z0-9-]+)?"/,'src="cliente.mjs?v='+await revision('debian/cliente.mjs')+'"');
await replaceRequired('debian/multinodo.mjs',/const nodeUIRevision='[a-f0-9]+'/,"const nodeUIRevision='"+await revision('debian/index.html')+"'");
await replaceRequired('debian/multinodo.mjs',/from '\.\/interfaz-niveles\.mjs(?:\?v=[a-f0-9]+)?'/,"from './interfaz-niveles.mjs?v="+await revision('debian/interfaz-niveles.mjs')+"'");
await replaceRequired('debian/multinodo.mjs',/from '\.\/bases-limpias\.mjs(?:\?v=[a-f0-9]+)?'/,"from './bases-limpias.mjs?v="+await revision('debian/bases-limpias.mjs')+"'");
await replaceRequired('debian/multinodo.mjs',/from '\.\/salud-inicial\.mjs(?:\?v=[a-f0-9]+)?'/,"from './salud-inicial.mjs?v="+await revision('debian/salud-inicial.mjs')+"'");
for(const path of ['debian/bases-publicadas.mjs','debian/fabrica-cluster.mjs']){
 if(!manifest.files.some(record=>record.path===path))manifest.files.push({path,bytes:0,sha256:''});
 await replaceRequired('debian/multinodo.mjs',new RegExp("from '\\./"+path.split('/').at(-1).replaceAll('.','\\.')+"(?:\\?v=[a-f0-9]+)?'"),"from './"+path.split('/').at(-1)+'?v='+await revision(path)+"'");
}
for(const path of ['debian/politicas-cluster.mjs','debian/red-persistente.mjs','componentes/root/network-policies.yaml'])if(!manifest.files.some(record=>record.path===path))manifest.files.push({path,bytes:0,sha256:''});
const nativeFiles=[...new Set([...manifest.files.map(record=>record.path),'debian/bases-limpias.mjs','debian/ejercicios-acceso.mjs'])].filter(path=>path.endsWith('.mjs')&&path!=='debian/entrada-laboratorio.mjs').sort();
const preparation=[];
for(const path of nativeFiles)preparation.push({path,source:await readText(path)});
await replaceRequired('debian/multinodo.mjs',/const cleanRevision='[a-f0-9]+'/,"const cleanRevision='"+revisionPreparacion(preparation,{policies:false,materials:false})+"'");
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
