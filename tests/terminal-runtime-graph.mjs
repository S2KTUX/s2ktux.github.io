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
const interactiveSharedPaths=['terminal-bootstrap.js','terminal-shell-parser.js','terminal-command-schema.js','terminal-virtual-fs.js','terminal-fidelity.js','terminal-process-state.js','terminal-network-state.js','terminal-docker-state.js','terminal-worker-client.js','terminal-worker-protocol.js','terminal-simulation-worker.js','terminal-xterm-renderer.js','vendor/xterm/xterm.mjs'];
const interactiveShared=Object.fromEntries(await Promise.all(interactiveSharedPaths.map(async path=>[path,await read(path)])));
const modeInteractivePaths={linux:[],docker:[],kubernetes:['terminal-kubernetes-state.js','terminal-kubernetes-command.js']};
const modeInteractive=Object.fromEntries(await Promise.all(names.map(async name=>[name,Object.fromEntries(await Promise.all(modeInteractivePaths[name].map(async path=>[path,await read(path)]))) ])));

for(const name of names){
  assert.match(bootstrap,new RegExp("import\\('\\./terminal-engine-"+name+"\\.js"),'Falta el cargador fuente del motor '+name);
  assert.match(bootstrap,new RegExp("import\\('\\./terminal-runtime-"+name+"\\.js"),'Falta el cargador fuente del runtime '+name);
}
assert.match(bootstrap,/__S2KTUX_PRODUCTION__/);
assert.ok(bootstrap.includes("importBuilt('./terminal-'+mode+'.min.js')"));
assert.match(bootstrap,/await Promise\.all/);
assert.doesNotMatch(core,/terminal-runtime-(?:linux|docker|kubernetes)/);
assert.doesNotMatch(core,/const (?:challenges|dockerChallenges|k8sChallenges)\s*=/);
assert.doesNotMatch(core,/kubectl controls the Kubernetes cluster manager|createDefaultKubernetesState/,'El nucleo conserva el motor kubectl o su estado inicial');
assert.match(sources.kubernetes,/createKubectlCommand|terminal-kubernetes-command\.js/,'El runtime Kubernetes debe cargar su comando aislado');
assert.doesNotMatch(modeInteractive.kubernetes['terminal-kubernetes-command.js'],/document\.|window\.|querySelector/,'El comando Kubernetes aislado no debe acceder al DOM');

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
assert.doesNotMatch(sources.docker,/NIVEL 1 · INSTALACIÓN|NIVEL 1 · DAEMON/);
assert.match(sources.docker,/NIVEL 1 · IMÁGENES/);
assert.match(sources.docker,/docker-ce-cli/);
assert.match(sources.kubernetes,/CKA · CONTEXTO/);

const output=[];
const io={out:value=>output.push(String(value)),outMany:values=>values.forEach(value=>output.push(String(value))),err:value=>output.push(String(value)),ok:value=>output.push(String(value))};
const k8sState={k8s:{pods:[],nodes:[{version:'v1.35.0'}],actions:[],upgraded:false,etcdSnapshot:false}};
const k8sCommands=modules.kubernetes.createCommands({state:k8sState,io,getNode:()=>null,system:{K8S_FULL:'v1.35.0',K8S_MAJOR:'1',K8S_MINOR:'35',K8S_UPGRADE:'v1.35.1',ARCH:'x86_64'},fs:{norm:path=>path.split('/').filter(Boolean),getParent:()=>({type:'dir',children:{}}),file:content=>({type:'file',content})},helpers:{kubernetes:{containerBaseFs:()=>({}),eventAdd(){},save(){},dispatch(){},runCommandSeq(){},editorEnter(){},enterContainerShell(){},executeContainerCommand(){},getCurrentUser:()=> 'root'}}});
assert.deepEqual(Object.keys(k8sCommands).sort(),['crictl','etcdctl','kubeadm','kubectl','kubelet']);
k8sCommands.kubelet({args:['--version']});
k8sCommands.kubeadm({args:['version']});
k8sCommands.etcdctl({args:['endpoint','health']});
assert.ok(output.some(line=>line.includes('Kubernetes v1.35.0')));
assert.ok(output.some(line=>line.includes('GitVersion:"v1.35.0"')));
assert.ok(output.some(line=>line.includes('is healthy')));

assert.equal(modules.docker.createCommands,undefined,'Docker no debe exponer un daemon instalable');

// Mide todos los recursos descargados hasta que xterm queda interactivo, no
// solo el archivo central. Así la modularización no puede ocultar un aumento.
const publishedCore=core.replace(/\r\n/g,'\n');
const coreRaw=Buffer.byteLength(publishedCore),coreGzip=gzipSync(publishedCore).byteLength;
assert.ok(coreRaw<463000,'El core volvió a absorber módulos ya extraídos');
assert.ok(coreGzip<143000,'El core comprimido volvió a crecer por encima del presupuesto');
const sharedInteractiveGzip=Object.values(interactiveShared).reduce((total,source)=>total+gzipSync(source.replace(/\r\n/g,'\n')).byteLength,0)+coreGzip;
const selectedGzipByMode={};
for(const name of names){
  const selectedGzip=sharedInteractiveGzip+Object.values(modeInteractive[name]).reduce((total,source)=>total+gzipSync(source.replace(/\r\n/g,'\n')).byteLength,0)+gzipSync(engines[name].replace(/\r\n/g,'\n')).byteLength+gzipSync(sources[name].replace(/\r\n/g,'\n')).byteLength;
  selectedGzipByMode[name]=selectedGzip;
  // El presupuesto obligatorio se aplica al artefacto empaquetado en production-build.mjs.
  // Aquí se conserva la medida fuente para detectar qué efecto tiene cada extracción.
}

console.log('terminal runtime graph (fuentes sin empaquetar): 3 runtimes aislados; core '+coreRaw+' B / '+coreGzip+' B gzip; carga interactiva compartida '+sharedInteractiveGzip+' B gzip; modos '+names.map(name=>name+' '+selectedGzipByMode[name]+' B').join(' · '));
