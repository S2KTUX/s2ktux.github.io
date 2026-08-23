import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const names=['linux','docker','kubernetes'];
const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const core=await read('terminal-core.js');
const bootstrap=await read('terminal-bootstrap.js');
const engines=Object.fromEntries(await Promise.all(names.map(async name=>[name,await read('terminal-engine-'+name+'.js')])));
const sources=Object.fromEntries(await Promise.all(names.map(async name=>[name,await read('terminal-runtime-'+name+'.js')])));
const modules={};

assert.match(bootstrap,/labelledImport\('motor de configuración', `\.\/terminal-engine-\$\{mode\}\.js`\)/);
assert.match(bootstrap,/labelledImport\('contenido del entorno', `\.\/terminal-runtime-\$\{mode\}\.js`\)/);
assert.match(bootstrap,/await Promise\.all/);
assert.doesNotMatch(bootstrap,/import\(['"]\.\/terminal-runtime-(?:linux|docker|kubernetes)\.js['"]\)/);
assert.doesNotMatch(core,/terminal-runtime-(?:linux|docker|kubernetes)/);
assert.doesNotMatch(core,/const (?:challenges|dockerChallenges|k8sChallenges)\s*=/);

for(const name of names){
  const source=sources[name];
  assert.doesNotMatch(source,/terminal-runtime-(?:linux|docker|kubernetes)\.js/,'Los runtimes no se encadenan: '+name);
  assert.doesNotMatch(source,/terminal-core\.js|terminal-engine-/,'El runtime no debe descargar el core ni motores: '+name);
  const mod=(await import(new URL('../terminal-runtime-'+name+'.js?graph=1',import.meta.url))).default;
  modules[name]=mod;
  assert.equal(mod.mode,name);
  assert.ok(Array.isArray(mod.profile.packages)&&mod.profile.packages.length>=20,'Perfil de paquetes incompleto: '+name);
  assert.ok(Object.keys(mod.manuals||{}).length>0,'Manuales no aislados: '+name);
  assert.ok(Object.keys(mod.completions||{}).length>0,'Completions no aisladas: '+name);
  const challenges=mod.createChallenges({state:{},getNode(){return null;}});
  assert.ok(challenges.length>=14,'Catálogo de prácticas incompleto: '+name);
  assert.ok(challenges.every(c=>c.badge&&c.title&&c.goal&&typeof c.check==='function'),'Contrato de práctica inválido: '+name);
  assert.ok(Buffer.byteLength(source)<30000,'Runtime demasiado grande: '+name);
}

assert.doesNotMatch(core,/NIVEL 1 · INSTALACIÓN|CKA · CONTEXTO|PREGUNTA 1 · RESCATE/);
assert.match(sources.linux,/PREGUNTA 1 · RESCATE/);
assert.match(sources.docker,/NIVEL 1 · INSTALACIÓN/);
assert.match(sources.kubernetes,/CKA · CONTEXTO/);

const output=[];
const io={out:value=>output.push(String(value)),outMany:values=>values.forEach(value=>output.push(String(value))),err:value=>output.push(String(value)),ok:value=>output.push(String(value))};
const k8sState={k8s:{pods:[],nodes:[{version:'v1.35.0'}],actions:[],upgraded:false,etcdSnapshot:false}};
const k8sCommands=modules.kubernetes.createCommands({state:k8sState,io,system:{K8S_FULL:'v1.35.0',K8S_MAJOR:'1',K8S_MINOR:'35',K8S_UPGRADE:'v1.35.1',ARCH:'x86_64'},fs:{norm:path=>path.split('/').filter(Boolean),getParent:()=>({type:'dir',children:{}}),file:content=>({type:'file',content})}});
assert.deepEqual(Object.keys(k8sCommands).sort(),['crictl','etcdctl','kubeadm','kubelet']);
k8sCommands.kubelet({args:['--version']});
k8sCommands.kubeadm({args:['version']});
k8sCommands.etcdctl({args:['endpoint','health']});
assert.ok(output.some(line=>line.includes('Kubernetes v1.35.0')));
assert.ok(output.some(line=>line.includes('GitVersion:"v1.35.0"')));
assert.ok(output.some(line=>line.includes('is healthy')));

output.length=0;
const dockerCommands=modules.docker.createCommands({io,helpers:{dockerConfigError:()=>''}});
assert.deepEqual(Object.keys(dockerCommands),['dockerd']);
dockerCommands.dockerd({args:['--validate']});
assert.deepEqual(output,['configuration OK']);

// Mide el recurso tal como se publica en GitHub, sin penalizar el checkout
// de Windows cuando convierte LF a CRLF localmente.
const publishedCore=core.replace(/\r\n/g,'\n');
const coreRaw=Buffer.byteLength(publishedCore), coreGzip=gzipSync(publishedCore).byteLength;
// El shell ganó PS2, control de trabajos y causalidad de contenedores sin
// volver a absorber los catálogos. El límite comprimido sigue siendo el gate
// de red; este margen en bruto solo cubre lógica ejecutable.
assert.ok(coreRaw<430000,'El core volvió a absorber catálogos de runtime');
assert.ok(coreGzip<134000,'El core comprimido volvió a crecer por encima del presupuesto');
for(const name of names){
  const selectedGzip=coreGzip+gzipSync(engines[name].replace(/\r\n/g,'\n')).byteLength+gzipSync(sources[name].replace(/\r\n/g,'\n')).byteLength;
  assert.ok(selectedGzip<143000,'Carga inicial del modo '+name+' supera el presupuesto comprimido');
}

console.log('terminal runtime graph: 3 runtimes aislados; core '+coreRaw+' B / '+coreGzip+' B gzip');
