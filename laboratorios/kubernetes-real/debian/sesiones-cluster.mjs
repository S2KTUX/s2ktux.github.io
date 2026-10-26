import {KubeSessions} from '../kube-sessions.mjs?v=3a443641bb7b1ca4';
import {hashBytes,hashBlob} from '/laboratorios/docker-real/v86-sessions.mjs?v=3852a1206e14ad3b';
import {PERFIL_DEBIAN,perfilFabricaDebian} from './fabrica.mjs?v=57bc04e56ce5a955';
import {comprobarNivel} from './niveles.mjs';
import {comprimirEstado} from '../comprimir-estado.mjs?v=9428ef18ea7ec585';
import {escenarioCurso} from './escenarios-curso.mjs?v=0d0ce2113fc8bea0';
const ids=['controlplane','worker1','worker2'],digest=/^[a-f0-9]{64}$/;
function comprobarComponentesWorker(version){if(!['v7','v8'].includes(version))throw Error('Componentes de worker no comprobados');return version;}
function comprobarFabrica(version){if(!['v1','v3','v4','v5','v6','v8','v13','v14'].includes(version))throw Error('Fábrica multinodo no comprobada');return version;}
export function perfilNodoDebian(id,{workerComponents='v7',factoryVersion='v1'}={}){
 if(!ids.includes(id))throw Error('Nodo Debian desconocido');
 comprobarComponentesWorker(workerComponents);
 comprobarFabrica(factoryVersion);
 if(factoryVersion==='v8'&&workerComponents!=='v7')throw Error('El perfil de administración requiere su kit v7');
 if(['v13','v14'].includes(factoryVersion)){
  if(workerComponents!=='v7')throw Error('Administración v13 requiere su kit v7');
  return {os:'debian-admin-v3',components:'v7',engine:'jit8192-pic-only-v1',role:id,bootstrap:'routes-v1',prompt:id==='controlplane'?'base-v1':'dynamic-v1',cpu:id==='controlplane'?'balanced650-gc100-scheduler-highmem-v1':'base-v1',factoryVersion,packages:'apt-s2ktux-v1',scheduler:'native-v1',kernel:id==='controlplane'?'highmem-v1':'v1',memoryMiB:id==='controlplane'?1536:1024};
 }
 return {os:factoryVersion==='v8'?'debian-admin-v2':['v5','v6'].includes(factoryVersion)?'debian-v6':factoryVersion==='v4'?'debian-v5':'debian-v4',components:id==='controlplane'?'v7':workerComponents,engine:'jit8192',role:id,bootstrap:'routes-v1',prompt:id==='controlplane'?'base-v1':'dynamic-v1',cpu:id==='controlplane'?(factoryVersion==='v8'?'balanced650-gc200-scheduler-v1':factoryVersion!=='v1'?'balanced650-readiness10-v1':'system-weight-10-v1'):'base-v1',...(factoryVersion!=='v1'?{factoryVersion}: {}),...(factoryVersion==='v8'?{packages:'apt-s2ktux-v1',scheduler:'native-v1'}:{})};
}
export async function identidadNodoDebian(id,options={}){
 const version=comprobarFabrica(options.factoryVersion||'v1');
 if(version==='v14')return hashBytes(new TextEncoder().encode(JSON.stringify({profile:perfilNodoDebian(id,options),base:perfilFabricaDebian(version),factorySha256:'0eefc8d6a447e171e050b7e91c6514fd15f52129ad69c459178c77514e14a882'})));
 if(version==='v13')return hashBytes(new TextEncoder().encode(JSON.stringify({profile:perfilNodoDebian(id,options),base:perfilFabricaDebian(version),factorySha256:'b99c8b829f3ad8d9f0f17fbcb3451eb2dc32b928a659b4e80640778c40f8db0e'})));
 const sha={v1:'dbc474623c439ed6a2dae501edf04b7d4db1bdd698fd7514f827e171375ec4e7',v3:'5d1cb4caf4556c0e6e865faecdafa5547129f2b8cdbf063b5e40366a030ff77a',v4:'9132e7353df15cd56876a2aedc483810f367f74ee589387cda9c6ba2a1fd8ba7',v5:'a89a3e4916abc6355b29a6f817dc24eb6823cab9f0b8ddca1c4ec15ae77af200',v6:'978b8b5ba7828962bc5871161c82b4a40fb603865bb2ec21afba9c4d5bfb0851',v8:'6e4f96f5c6157536e874d5c5c4ad1862d54d246134505b7e47fd096b2eb1b962'}[version];
 return hashBytes(new TextEncoder().encode(JSON.stringify({profile:perfilNodoDebian(id,options),base:version==='v1'?PERFIL_DEBIAN:perfilFabricaDebian(version),factorySha256:sha})));
}
export class SesionesClusterDebian extends KubeSessions{
 constructor({workerComponents='v7',factoryVersion='v1',progressive=false,level='inicial',scenarioId='study'}={}){
  super({stateLimitMiB:['v13','v14'].includes(factoryVersion)?2048:1536});if(typeof progressive!=='boolean')throw Error('Modo de curso inválido');this.progressive=progressive;this.level=comprobarNivel(level);if(!progressive&&level!=='inicial')throw Error('Los niveles requieren el modo de curso');this.workerComponents=comprobarComponentesWorker(workerComponents);this.factoryVersion=comprobarFabrica(factoryVersion);
  if(factoryVersion==='v8'&&workerComponents!=='v7')throw Error('Administración requiere componentes v7');
  this.key=(workerComponents==='v7'?'cluster-debian-v1':'cluster-debian-netpol386-v1')+(factoryVersion==='v6'?'-balanced650-oom-grupo-tls-v1':factoryVersion==='v5'?'-balanced650-oom-grupo-v2':factoryVersion==='v4'?'-balanced650-oom-v1':factoryVersion==='v3'?'-balanced650-v1':'')+(progressive?'-curso-progresivo-v1':'')+(level==='inicial'?'':'-nivel-'+level+'-v1')+(factoryVersion==='v8'?'-admin-v2-gc200-scheduler-v1':'');
  this.format='s2ktux-kubernetes-debian-cluster-v1';
  if(factoryVersion==='v13'){if(workerComponents!=='v7')throw Error('Administración requiere componentes v7');this.key+='-admin-v3-highmem-pic-gc100-v1';}
  if(factoryVersion==='v14'){if(workerComponents!=='v7')throw Error('Administración requiere componentes v7');this.key+='-admin-v3-highmem-pic-gc100-transporte135-v1';}
  const scene=escenarioCurso(scenarioId,{factoryVersion,level});
  if(scene){if(!progressive)throw Error('Los escenarios requieren el modo de curso');this.key+='-escenario-'+scene.id;}
 }
 async packNode(id,state,terminalText='',{consumir=false}={}){
  const options={workerComponents:this.workerComponents,factoryVersion:this.factoryVersion},profile=perfilNodoDebian(id,options),identity=await identidadNodoDebian(id,options);
  if(!state?.byteLength||state.byteLength>(['v13','v14'].includes(this.factoryVersion)&&id==='controlplane'?2048:1536)*1048576)throw Error('Estado de nodo inválido');
  const {bytes,packed}=await comprimirEstado(state,{consumir});
  return {id,profile,identity,format:'s2ktux-v86-session-v1',bytes,packedBytes:packed.size,sha256:await hashBlob(packed),packed,terminalText:terminalText.slice(-100000)};
 }
 async validate(nodes){
  if(!Array.isArray(nodes)||nodes.length<(this.progressive?1:2)||nodes.length>3||nodes.some((node,index)=>node?.id!==ids[index]))throw Error('El clúster debe contener CP y sus workers en orden');
  for(const node of nodes){
   const options={workerComponents:this.workerComponents,factoryVersion:this.factoryVersion};
   if(JSON.stringify(node.profile)!==JSON.stringify(perfilNodoDebian(node.id,options))||node.identity!==await identidadNodoDebian(node.id,options))throw Error('Perfil de nodo Debian incorrecto');
   const maxBytes=(['v13','v14'].includes(this.factoryVersion)&&node.id==='controlplane'?2048:1536)*1048576;
   if(node.format!=='s2ktux-v86-session-v1'||!digest.test(node.sha256)||!Number.isSafeInteger(node.bytes)||node.bytes<1||node.bytes>maxBytes||!Number.isSafeInteger(node.packedBytes)||node.packedBytes<1||node.packedBytes>maxBytes+1048576||!(node.packed instanceof Blob)||node.packed.size!==node.packedBytes||typeof node.terminalText!=='string'||node.terminalText.length>100000)throw Error('Nodo guardado incompleto');
   if(await hashBlob(node.packed)!==node.sha256)throw Error('Nodo guardado alterado');
  }
  return hashBytes(new TextEncoder().encode(JSON.stringify(nodes.map(({id,profile,identity,bytes,packedBytes,sha256})=>({id,profile,identity,bytes,packedBytes,sha256})))));
 }
 async saveNodes(nodes,expectedSha=null){
  const {key,format}=this,sha256=await this.validate(nodes),record={key,format,sha256,nodes,savedAt:new Date().toISOString()};
  const db=await this.open();
  try{await new Promise((resolve,reject)=>{
   const transaction=db.transaction('sessions','readwrite'),store=transaction.objectStore('sessions');let failure;
   const read=store.get(key);read.onsuccess=()=>{if((read.result?.sha256||null)!==expectedSha){failure=Error('Otra pestaña ha cambiado el clúster. No se ha sobrescrito');transaction.abort();}else store.put(record);};
   transaction.oncomplete=resolve;transaction.onerror=transaction.onabort=()=>reject(failure||transaction.error||Error('Guardado cancelado'));
  });}finally{db.close();}
  return record;
 }
 getRawCluster(){return this.get(this.key);}
 async getCluster(){
  const record=await this.getRawCluster();if(!record)return;
  return this.validateCluster(record);
 }
 async validateCluster(record){
  if(record.key!==this.key||record.format!==this.format||record.sha256!==await this.validate(record.nodes))throw Error('Clúster Debian incompleto o de otra versión; no se ha borrado');
  return record;
 }
 resetCluster(expectedSha){return this.deleteUnchanged(this.key,expectedSha);}
}
