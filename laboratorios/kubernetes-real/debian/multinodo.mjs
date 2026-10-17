import {createLocalSwitch} from '../red-local.mjs';
import {comandosArchivoSerie} from '../archivos-serie.mjs';
import {perfilWorker} from './preparar-worker.mjs';
import {SesionesClusterDebian} from './sesiones-cluster.mjs';
import {ordenarNodosDebian,comandoNatDebian} from './red-cluster.mjs';
import {prepararRedPoliticasDebian,instalarPoliticasDebian} from './politicas-cluster.mjs';
import {persistirNatDebian,persistirRutaDebian,persistirNamespacesDebian} from './red-persistente.mjs';
import {modoCurso,siguienteWorker,textoWorker,permitirAplicacionesIniciales,separarControlPlane} from './progresion-curso.mjs';
import {NIVELES,nivelDesdeURL} from './niveles.mjs';
import {montarInterfazNiveles} from './interfaz-niveles.mjs';
import {comprobarSaludInicial} from './salud-inicial.mjs';
import {ordenEsperarFirmaJWS} from './esperar-firma-jws.mjs';
import {claseDisponible,nivelDisponible,limiteNodos} from './disponibilidad-curso.mjs';
const releaseAvailable=()=>{const requestedClass=new URLSearchParams(location.search).get('clase');return progressive&&nivelDisponible(level)&&(requestedClass===null||claseDisponible(Number(requestedClass)));};
const progressive=modoCurso(new URLSearchParams(location.search));
if(!progressive)document.querySelector('#lab-workspace').hidden=false;
const level=progressive?nivelDesdeURL(new URLSearchParams(location.search)):'inicial';
const experimentalFast=new URLSearchParams(location.search).get('fast')==='1';
const integratedPolicies=new URLSearchParams(location.search).has('policies')?new URLSearchParams(location.search).get('policies')==='1':progressive&&level!=='inicial';
if(progressive&&level==='inicial'&&integratedPolicies)throw Error('Las políticas se preparan en el modo intermedio, con workers.');
const persistentNetwork=new URLSearchParams(location.search).get('persistent-network')==='1';
const factoryVersion=new URLSearchParams(location.search).get('factory')||(progressive?'v6':'v1');
if(!['v1','v3','v4','v5','v6','v8'].includes(factoryVersion))throw Error('Fábrica multinodo no admitida');
const schedulingAPI=new URLSearchParams(location.search).get('use-scheduling-api')==='1';
if(factoryVersion==='v8'&&(!schedulingAPI||integratedPolicies||(progressive&&level!=='avanzado')))throw Error('Administración privada requiere Scheduler API, sin políticas integradas y nivel avanzado');
const classicalTls=new URLSearchParams(location.search).get('tls')==='classical'||factoryVersion!=='v1';
const workerComponents=factoryVersion==='v8'?'v7':new URLSearchParams(location.search).get('netpol')==='metrics386'||(progressive&&level!=='inicial')?'v8':'v7';
const nodes=new Map(),networks=new Map(),status=document.querySelector('#cluster-status'),start=document.querySelector('#start-cluster'),add=document.querySelector('#add-worker');
const network=createLocalSwitch({onError:error=>fail(error)}),sessions=new SesionesClusterDebian({workerComponents,factoryVersion,progressive,level}),save=document.querySelector('#save-cluster'),reset=document.querySelector('#reset-cluster');let busy=false,saved,readSaved=false,initialized=false,levelUI;
function updateControls(){save.disabled=busy||!initialized;reset.disabled=busy||!readSaved;add.disabled=true;add.hidden=true;start.disabled=busy||nodes.size>0||!releaseAvailable();levelUI?.update();}
if(progressive){document.querySelector('h1').textContent='Kubernetes';start.textContent='Iniciar laboratorio';add.textContent='Añadir primer worker';}
globalThis.kubeDebianClusterNodes=nodes;globalThis.kubeDebianClusterErrors=[];globalThis.kubeDebianClusterReady=false;globalThis.kubeDebianClusterStages=[];
globalThis.kubeDebianClusterProfile={level,factoryVersion,workerComponents,progressive};
function fail(error){kubeDebianClusterReady=false;kubeDebianClusterErrors.push(String(error.message||error));status.textContent='No se pudo completar la operación: '+(error.message||error)+'. Puedes usar Reset o cambiar de modo; tus guardados no se borran automáticamente.';}
async function phase(id,label,command,timeout=180000){
 status.textContent=label+'…';const began=performance.now(),result=await nodes.get(id).window.kubeDebianRun(label,command,timeout);
 kubeDebianClusterStages.push({node:id,label,seconds:(performance.now()-began)/1000,ok:result.ok});
 if(!result.ok)throw Error(label+' no ha pasado');return result;
}
async function upload(id,path,text){for(const command of comandosArchivoSerie(path,text))await phase(id,'Preparar configuración de red',command);}
async function value(id,command){
 const key='__DEBIAN_CLUSTER_'+Array.from(crypto.getRandomValues(new Uint8Array(8)),n=>n.toString(16).padStart(2,'0')).join('')+'__';
 await phase(id,'Leer configuración nativa',`value=$(${command}) && printf '${key}%s\\n' "$value"`);
 const line=nodes.get(id).window.kubeDebianTranscript.replace(/\r/g,'').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,'').split('\n').findLast(line=>line.startsWith(key));
 if(!line)throw Error('No se recibió el valor nativo');return line.slice(key.length);
}
async function createNode(id,query,restore){
 const frame=document.createElement('iframe');frame.className='node-frame';frame.title='Terminal '+id;frame.hidden=id!=='controlplane';frame.src='index.html?base='+(factoryVersion==='v8'?'admin-v2':['v5','v6'].includes(factoryVersion)?'v6':factoryVersion==='v4'?'v5':'v4')+'&kube=1&components='+(id==='controlplane'?'v7':workerComponents)+'&cluster=1&factory='+factoryVersion+'&'+query+(classicalTls?'&tls=classical':'')+(schedulingAPI?'&use-scheduling-api=1':'');
 const loaded=new Promise((resolve,reject)=>{frame.onload=resolve;frame.onerror=()=>reject(Error('No se cargó '+id));});document.querySelector('#nodes').append(frame);await loaded;
 const child=frame.contentWindow;nodes.set(id,{id,frame,window:child});levelUI?.update();
 const moduleDeadline=Date.now()+30000;while(!child.kubeDebianProfile){if(Date.now()>moduleDeadline)throw Error('No se inicializó '+id);await new Promise(r=>setTimeout(r,100));}
 const css=child.document.createElement('style');css.textContent='.site-header,.site-footer,main>h1,main>p,main>.controls{display:none}.docker-page{margin:0;padding:0}';child.document.head.append(css);
 if(restore)child.kubeDebianRestoreNode={...restore,packed:new child.Blob([restore.packed])};
 child.document.querySelector('#start').click();const began=performance.now();
 while(!child.kubeDebianReady){if(child.kubeDebianErrors.length)throw Error(id+': '+child.kubeDebianErrors.join('; '));if(performance.now()-began>600000)throw Error('No arrancó '+id+' a tiempo');await new Promise(r=>setTimeout(r,500));}
 kubeDebianClusterStages.push({node:id,label:'Arranque',seconds:(performance.now()-began)/1000,ok:true});
 network.add(id,child.kubeDebianVM.bus,{copyFrame:bytes=>new child.Uint8Array(bytes)});document.querySelector(`button[data-node="${id}"]`).hidden=false;
}
async function remember(id,name,ip){
 await phase('controlplane','Esperar Node y CIDR de '+name,`deadline=$(($(date +%s)+180)); while test "$(date +%s)" -lt "$deadline"; do if kubectl get node ${name} --request-timeout=5s >/dev/null 2>&1; then kubectl wait --for=jsonpath='{.spec.podCIDR}' node/${name} --timeout=120s && exit 0; fi; sleep 2; done; exit 1`,240000);
 const cidr=await value('controlplane',`kubectl get node ${name} -o jsonpath='{.spec.podCIDR}'`);
 if(!/^10\.244\.\d{1,3}\.0\/24$/.test(cidr)||[...networks.values()].some(node=>node.cidr===cidr))throw Error('CIDR repetido o fuera del curso');
 networks.set(id,{cidr,ip});
 const response=await fetch('../componentes/root/10-kubernetes.conflist');if(!response.ok)throw Error('CNI no disponible');
 const cni=await response.json();cni.plugins[0].ipMasq=false;cni.plugins[0].hairpinMode=true;cni.plugins[0].ipam.ranges[0][0].subnet=cidr;
 await upload(id,'/tmp/cni-multinodo.json',JSON.stringify(cni));
 await phase(id,'Configurar CNI y NAT externo del nodo','cp /tmp/cni-multinodo.json /etc/cni/net.d/10-kubernetes.conflist && '+comandoNatDebian({preserveExisting:experimentalFast||progressive}));
 if(persistentNetwork)await persistirNatDebian(id,phase,{preserveExisting:experimentalFast||progressive});
 for(const [peer,record] of networks)for(const node of nodes.keys())if(node!==peer){await phase(node,'Encaminar Pods hacia '+peer,`ip route replace ${record.cidr} via ${record.ip}`);if(persistentNetwork)await persistirRutaDebian(node,peer,record,phase);}
}
async function addWorker(index){
 const id='worker'+index,{name,ip}=perfilWorker(index);
 if(index==='2')await phase('controlplane','Comprobar el primer worker antes de ampliar el clúster','kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s',180000);
 if(nodes.has(id)){
  if(!experimentalFast||id!=='worker1'||networks.has(id))throw Error('Ese worker ya existe');
  await phase(id,'Comprobar worker preparado sin incorporar','test ! -e /etc/kubernetes/kubelet.conf && test ! -e /etc/kubernetes/admin.conf');
 }
 const join=await value('controlplane','kubeadm token create --ttl=2h --print-join-command');
 const match=/^kubeadm join 10\.77\.0\.10:6443 --token ([a-z0-9]{6}\.[a-z0-9]{16})\s+--discovery-token-ca-cert-hash sha256:([a-f0-9]{64})\s*$/.exec(join);if(!match)throw Error('Comando join fuera de este clúster');
 const [,token,hash]=match;
 await phase('controlplane','Esperar firma del token de descubrimiento',ordenEsperarFirmaJWS(token.split('.')[0],90),120000);
 if(!nodes.has(id)){status.textContent='Preparando '+name+'…';await createNode(id,'worker='+index+'&threaded=1');}
 if(integratedPolicies)await prepararRedPoliticasDebian(id,phase);
 if(persistentNetwork&&integratedPolicies)await persistirNamespacesDebian(id,phase);
 const epoch=await value('controlplane','date +%s');if(!/^[0-9]{10}$/.test(epoch))throw Error('Reloj del control plane inválido');
 await phase(id,'Sincronizar reloj y comprobar el control plane',`date -u -s @${epoch} >/dev/null && ping -c 1 -W 10 10.77.0.10`);
 await phase(id,'Incorporar '+name+' con kubeadm join',`kubeadm join 10.77.0.10:6443 --token ${token} --discovery-token-ca-cert-hash sha256:${hash} --node-name ${name} --cri-socket unix:///run/containerd/containerd.sock --ignore-preflight-errors=NumCPU,Mem --v=2`,300000);
 await remember(id,name,ip);
 await phase('controlplane','Comprobar '+name+' Ready',`kubectl wait --for=condition=Ready node/${name} --timeout=180s`,240000);
 await phase('controlplane','Comprobar proxy en todos los nodos','kubectl -n kube-system rollout status daemonset/kube-proxy --timeout=180s',240000);
}
globalThis.kubeDebianClusterRun=phase;
start.onclick=async()=>{
 if(busy||nodes.size||!releaseAvailable())return;busy=true;start.disabled=true;status.textContent='Recuperando cka-cp1…';updateControls();
 try{
  saved=await sessions.getRawCluster();readSaved=true;
  if(saved){
   saved=await sessions.getCluster();
   if(saved.nodes.length>limiteNodos(level))throw Error('Este guardado corresponde a una configuración todavía no publicada. Se conserva sin modificarlo.');
   for(const record of saved.nodes)await createNode(record.id,record.id==='controlplane'?'warm=1':'worker='+record.id.slice(-1)+'&threaded=1',record);
   // Recuperar los datos y averías, sin reescribir CNI, rutas ni unidades.
   initialized=true;globalThis.kubeDebianClusterRecovered=true;status.textContent='Clúster guardado recuperado. Tus cambios se conservan.';
   try{
    await phase('controlplane','Consultar la API recuperada sin esperar ni reparar nodos','kubectl get --raw=/readyz --request-timeout=15s',45000);
    const ready=await value('controlplane',`kubectl get nodes -o json --request-timeout=15s | jq -r '(.items|length)>0 and all(.items[]; any(.status.conditions[]; .type=="Ready" and .status=="True"))'`);
    if(!['true','false'].includes(ready))throw Error('No se recibió el estado real de los nodos');
    kubeDebianClusterReady=true;
    status.textContent=ready==='true'?'Clúster guardado recuperado. Tus cambios se conservan.':'Sesión recuperada con nodos no disponibles. Puedes revisarlos desde las terminales; no se han reparado tus cambios.';
   }
   catch{status.textContent='Sesión recuperada. Revisa el clúster desde sus terminales; no se han reparado tus cambios.';}
   return;
  }
  // La prueba v4 rechaza arrancar ambas CPUs a la vez: etcd pierde readiness.
  // Conservar la preparación secuencial; fast solo evita recrear CoreDNS.
  await createNode('controlplane','warm=1');
  await phase('controlplane','Repartir CPU nativa del sistema y del control plane','systemctl set-property --runtime system.slice CPUWeight=10 && test "$(cat /sys/fs/cgroup/system.slice/cpu.weight)" = 10');
  if(progressive){
   await phase('controlplane',level==='inicial'?'Preparar un único nodo para las primeras prácticas':'Preparar el control plane del modo '+level,permitirAplicacionesIniciales);
   if(level!=='inicial'){const {prepararMaterialesCurso}=await import('./materiales-curso.mjs');await prepararMaterialesCurso(phase);}
   await remember('controlplane','cka-cp1','10.77.0.10');
   if(NIVELES[level].nodes>=2){await addWorker('1');await phase('controlplane','Separar coordinación y aplicaciones',separarControlPlane);}
   if(NIVELES[level].nodes>=3)await addWorker('2');
   if(integratedPolicies)await instalarPoliticasDebian(phase);
   await phase('controlplane','Comprobar la API y los nodos antes de abrir el laboratorio',comprobarSaludInicial,240000);
   initialized=true;kubeDebianClusterReady=true;status.textContent=`Modo ${NIVELES[level].name.toLowerCase()} listo · ${nodes.size} ${nodes.size===1?'nodo':'nodos'}.`;
   return;
  }
  if(!experimentalFast)await phase('controlplane','Retirar temporalmente CoreDNS para cambiar su red','kubectl -n kube-system scale deployment coredns --replicas=0 && kubectl -n kube-system wait --for=delete pod -l k8s-app=kube-dns --timeout=120s',180000);
  await remember('controlplane','cka-cp1','10.77.0.10');await addWorker('1');
  await phase('controlplane',experimentalFast?'Comprobar CoreDNS sin recrearlo':'Restaurar CoreDNS en la red del curso',(experimentalFast?'':'kubectl -n kube-system scale deployment coredns --replicas=1 && ')+'kubectl -n kube-system rollout status deployment/coredns --timeout=180s',240000);
  if(integratedPolicies)await instalarPoliticasDebian(phase);
  initialized=true;kubeDebianClusterReady=true;status.textContent='Control plane y cka-w1 disponibles. Prueba privada.';
 }catch(error){fail(error);}finally{for(const node of nodes.values())try{node.window.kubeDebianOpenTerminal({diagnostic:!kubeDebianClusterReady});}catch(error){fail(error);}busy=false;updateControls();}
};
add.onclick=async()=>{
 const index=siguienteWorker(nodes.keys());if(!releaseAvailable()||nodes.size>=limiteNodos(level)||busy||!initialized||!index||(progressive&&level==='inicial'))return;busy=true;updateControls();
 try{await phase('controlplane','Comprobar la API antes de añadir un nodo','kubectl get --raw=/readyz --request-timeout=15s',45000);if(!networks.size){for(const [id,node] of nodes){const name=id==='controlplane'?'cka-cp1':perfilWorker(id.slice(-1)).name,ip=id==='controlplane'?'10.77.0.10':perfilWorker(id.slice(-1)).ip;const cidr=await value('controlplane',`kubectl get node ${name} -o jsonpath='{.spec.podCIDR}'`);if(!/^10\.244\.\d{1,3}\.0\/24$/.test(cidr))throw Error('CIDR recuperado inválido');networks.set(id,{cidr,ip});}}await addWorker(index);if(progressive&&index==='1')await phase('controlplane','Reservar el control plane para coordinar; conservar los Pods existentes',separarControlPlane);if(integratedPolicies)await phase('controlplane','Comprobar políticas en el nuevo worker','kubectl -n kube-system rollout status daemonset/kube-network-policies --timeout=180s',240000);kubeDebianClusterReady=true;status.textContent=index==='1'?'Primer worker disponible. Los Pods existentes se conservan; los nuevos sin toleración al control plane se programan en el worker.':'Control plane y dos workers disponibles. Prueba privada.';}catch(error){fail(error);}finally{for(const node of nodes.values())try{node.window.kubeDebianOpenTerminal({diagnostic:!kubeDebianClusterReady});}catch(error){fail(error);}busy=false;updateControls();}
};
globalThis.kubeDebianClusterSave=async()=>{
 if(busy||!initialized)throw Error('Espera a las terminales antes de guardar');busy=true;save.disabled=reset.disabled=add.disabled=true;const held=[];
 try{
  for(const [id,node] of ordenarNodosDebian(nodes,{progressive})){const access=node.window.kubeDebianSnapshot;const info=access.lock();held.push({id,access,info});}
  network.pause();status.textContent='Guardando todas las máquinas…';
  const stopped=await Promise.allSettled(held.map(node=>node.access.freeze())),failed=stopped.find(result=>result.status==='rejected');if(failed)throw failed.reason;
  const captures=[];for(const {id,access,info} of held)captures.push(await sessions.packNode(id,await access.state(),info.terminalText));
  saved=await sessions.saveNodes(captures,saved?.sha256||null);globalThis.kubeDebianClusterSaved={nodes:captures.length,bytes:captures.reduce((sum,node)=>sum+node.bytes,0),packedBytes:captures.reduce((sum,node)=>sum+node.packedBytes,0)};status.textContent='Clúster guardado.';return kubeDebianClusterSaved;
 }finally{
  network.resume();const released=await Promise.allSettled(held.map(node=>node.access.release()));busy=false;updateControls();
  const failed=released.find(result=>result.status==='rejected');if(failed)fail(failed.reason);
 }
};
save.onclick=()=>kubeDebianClusterSave().catch(error=>status.textContent='No se ha guardado: '+(error.message||error));
reset.onclick=async()=>{
 if(busy||!readSaved||!confirm(progressive?`¿Resetear el modo ${NIVELES[level].name.toLowerCase()}? Se borrarán su sesión guardada y sus cambios. Los demás niveles y laboratorios no cambian.`:'¿Borrar este clúster Debian guardado y volver a empezar? Los demás laboratorios no cambian.'))return;
 busy=true;save.disabled=reset.disabled=add.disabled=true;
 try{await sessions.resetCluster(saved?.sha256||null);network.destroy();await Promise.all([...nodes.values()].map(node=>node.window.kubeDebianVM.destroy()));location.reload();}
 catch(error){status.textContent='No se ha borrado: '+(error.message||error);busy=false;updateControls();}
};
for(const button of document.querySelectorAll('button[data-node]'))button.onclick=()=>{
 for(const [id,node] of nodes)node.frame.hidden=id!==button.dataset.node;
 for(const item of document.querySelectorAll('button[data-node]'))item.setAttribute('aria-pressed',String(item===button));
};
window.addEventListener('pagehide',()=>network.destroy());
async function stopForLevelChange(){
 if(busy)throw Error('Espera a que termine la operación actual');
 network.destroy();
 const results=await Promise.allSettled([...nodes.values()].map(node=>node.window.kubeDebianVM?.destroy()));
 if(results.some(result=>result.status==='rejected'))throw Error('No se han podido detener todas las máquinas; no se inicia otro modo');
 for(const node of nodes.values())node.frame.remove();nodes.clear();networks.clear();initialized=false;kubeDebianClusterReady=false;
}
async function runForPractice(id,label,command,timeout=180000){
 const node=nodes.get(id);if(!node)throw Error('No está disponible la terminal del nodo');
 status.textContent=label+'…';
 // Un exit code no cero es un resultado válido del corrector, no un fallo de transporte.
 return node.window.kubeDebianRun(label,command,timeout);
}
globalThis.kubeDebianClusterCheck=runForPractice;
if(progressive)levelUI=montarInterfazNiveles({level,getState:()=>({busy,initialized,nodeCount:nodes.size,nodes:[...nodes].map(([id,node])=>({name:id==='controlplane'?'cka-cp1':perfilWorker(id.slice(-1)).name,consoleReady:!!node.window.kubeDebianReady,error:!!node.window.kubeDebianErrors?.length}))}),run:runForPractice,setBusy:value=>{busy=value;updateControls();},save:()=>kubeDebianClusterSave(),stop:stopForLevelChange});
updateControls();
