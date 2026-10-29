import {SesionesClusterDebian} from './sesiones-cluster.mjs?v=c7237db8c69c1abe';
import {hashBytes,hashBlob} from '/laboratorios/docker-real/v86-sessions.mjs';
import {comprimirEstado} from '../comprimir-estado.mjs';
import {miembrosHA,perfilNodoHA,identidadNodoHA} from './perfil-ha.mjs?v=60a21559ace773d9';
// Reutiliza las transacciones con control de otra pestaña, no sus identidades.
export class SesionesHA extends SesionesClusterDebian{
 constructor(){
  super({workerComponents:'v7',factoryVersion:'v14',progressive:true,level:'avanzado',scenarioId:'study'});
  this.key='cluster-debian-curso-ha-tres-controlplanes-net-v2-v1';this.format='s2ktux-kubernetes-ha-cluster-v1';
 }
 async packNode(id,state,terminalText='',{consumir=false}={}){
  const profile=perfilNodoHA(id),identity=await identidadNodoHA(id);
  if(!state?.byteLength||state.byteLength>2048*1048576)throw Error('Estado HA inválido');
  const {bytes,packed}=await comprimirEstado(state,{consumir});
  return {id,profile,identity,format:'s2ktux-v86-session-v1',bytes,packedBytes:packed.size,sha256:await hashBlob(packed),packed,terminalText:terminalText.slice(-100000)};
 }
 async validate(nodes){
  if(!Array.isArray(nodes)||nodes.length!==3||nodes.some((node,index)=>node?.id!==miembrosHA[index]))throw Error('El guardado HA necesita sus tres control planes en orden');
  for(const node of nodes){
   const max=2048*1048576;
   if(JSON.stringify(node.profile)!==JSON.stringify(perfilNodoHA(node.id))||node.identity!==await identidadNodoHA(node.id))throw Error('El guardado no pertenece a este miembro HA');
   if(node.format!=='s2ktux-v86-session-v1'||!/^[a-f0-9]{64}$/.test(node.sha256)||!Number.isSafeInteger(node.bytes)||node.bytes<1||node.bytes>max||!Number.isSafeInteger(node.packedBytes)||node.packedBytes<1||node.packedBytes>max+1048576||!(node.packed instanceof Blob)||node.packed.size!==node.packedBytes||typeof node.terminalText!=='string'||node.terminalText.length>100000)throw Error('Miembro HA guardado incompleto');
   if(await hashBlob(node.packed)!==node.sha256)throw Error('Miembro HA guardado alterado');
  }
  return hashBytes(new TextEncoder().encode(JSON.stringify(nodes.map(({id,profile,identity,bytes,packedBytes,sha256})=>({id,profile,identity,bytes,packedBytes,sha256})))));
 }
}
// Otra BD: recuperar prácticas nunca sustituye esta entrada rápida limpia.
export class BasesLimpiasHA extends SesionesHA{
 constructor(revision){super();if(!/^[a-f0-9]{64}$/.test(revision))throw Error('Revisión HA inválida');this.key='base-ha:'+revision;}
 open(){return new Promise((resolve,reject)=>{
  const request=indexedDB.open('s2ktux-kubernetes-ha-clean-start-v1',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('sessions',{keyPath:'key'});
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
  request.onblocked=()=>reject(Error('La caché HA está ocupada'));
 });}
 async read(){try{return await this.getCluster();}catch(error){console.warn('Base HA no reutilizada:',error.message);return null;}}
 async write(nodes){const current=await this.getRawCluster();return this.saveNodes(nodes,current?.sha256||null);}
}
