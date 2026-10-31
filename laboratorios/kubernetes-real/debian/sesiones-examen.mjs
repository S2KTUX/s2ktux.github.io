import {SesionesCheckpointV15} from './sesiones-checkpoint.mjs?v=e3101f60c453dfff';
import {hashBytes} from '/laboratorios/docker-real/v86-sessions.mjs?v=3852a1206e14ad3b';
import {TAREAS_CKA,DURACION_CKA} from './examen-cka-banco.mjs?v=146843198f26771b';

// Un intento y sus dos máquinas se confirman en una sola transacción. No se
// usan las claves de las prácticas ni la caché que contiene la base limpia.
const FORMAT='s2ktux-cka-saved-attempt-v1';
const bank=TAREAS_CKA.map(({id,points,domain,conditions})=>({id,points,domain,conditions:conditions.map(c=>c.command)}));
const fingerprint=()=>hashBytes(new TextEncoder().encode(JSON.stringify(bank)));
export function validarIntentoGuardado(metadata){
 const a=metadata?.attempt;
 if(!a||a.format!=='s2ktux-cka-attempt-v1'||typeof a.id!=='string'||!a.id||!Number.isSafeInteger(a.startedAt)||a.startedAt<0||a.endsAt!==a.startedAt+DURACION_CKA||a.finishedAt!==null&&(!Number.isSafeInteger(a.finishedAt)||a.finishedAt<a.startedAt)||!Array.isArray(a.marked)||new Set(a.marked).size!==a.marked.length||a.marked.some(id=>!TAREAS_CKA.some(t=>t.id===id))||!Number.isSafeInteger(metadata.question)||metadata.question<0||metadata.question>=TAREAS_CKA.length)throw Error('El intento guardado está incompleto');
 if(metadata.results!==null&&(!a.finishedAt||!Array.isArray(metadata.results)||metadata.results.length!==TAREAS_CKA.length||metadata.results.some((r,i)=>r?.id!==TAREAS_CKA[i].id||!Array.isArray(r.conditions)||r.conditions.length!==TAREAS_CKA[i].conditions.length||r.conditions.some(v=>v!==true&&v!==false&&v!==null))))throw Error('Resultados guardados incompletos');
 return structuredClone(metadata);
}
export class SesionesExamen extends SesionesCheckpointV15{
 constructor(){
  super({factoryVersion:'v15',workerComponents:'v7',progressive:true,level:'avanzado',scenarioId:'cka-exam'});
  this.key='intento-cka-v1';this.format=FORMAT;
 }
 open(){return new Promise((resolve,reject)=>{
  const request=indexedDB.open('s2ktux-kubernetes-exam-attempt-v1',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('sessions',{keyPath:'key'});
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
  request.onblocked=()=>reject(Error('El guardado del examen está abierto en otra pestaña'));
 });}
 async validate(nodes){
  if(!Array.isArray(nodes)||nodes.length!==2||nodes[0]?.id!=='controlplane'||nodes[1]?.id!=='worker1')throw Error('El intento necesita sus dos máquinas');
  return super.validate(nodes);
 }
 async signature(nodes,metadata,bankRevision){
  return hashBytes(new TextEncoder().encode(JSON.stringify({nodes:await this.validate(nodes),metadata,bankRevision})));
 }
 async validateCluster(record){
  const metadata=validarIntentoGuardado(record?.metadata);
  if(record.key!==this.key||record.format!==FORMAT||record.bankRevision!==await fingerprint()||record.sha256!==await this.signature(record.nodes,metadata,record.bankRevision))throw Error('El intento no coincide con sus máquinas o con este examen; se conserva sin modificarlo');
  return record;
 }
 async saveAttempt(nodes,input,expectedSha=null){
  const metadata=validarIntentoGuardado(input),bankRevision=await fingerprint();
  const record={key:this.key,format:FORMAT,nodes,metadata,bankRevision,savedAt:new Date().toISOString(),sha256:await this.signature(nodes,metadata,bankRevision)};
  const db=await this.open();
  try{await new Promise((resolve,reject)=>{
   const tx=db.transaction('sessions','readwrite'),store=tx.objectStore('sessions');let failure;
   const read=store.get(this.key);read.onsuccess=()=>{if((read.result?.sha256||null)!==expectedSha){failure=Error('Otra pestaña ha cambiado el examen. No se ha sobrescrito');tx.abort();}else store.put(record);};
   tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(failure||tx.error||Error('No se ha guardado el examen'));
  });}finally{db.close();}
  return record;
 }
 // Obliga a acompañar siempre las máquinas de su reloj y sus preguntas.
 saveNodes(){throw Error('El examen se guarda junto con los datos del intento');}
}
