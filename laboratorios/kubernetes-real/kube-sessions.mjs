import {LocalSessions,hashBlob} from '/laboratorios/docker-real/v86-sessions.mjs?v=3852a1206e14ad3b';
const DATABASE='s2ktux-kubernetes-real-private-v1';
const STORE='sessions';
// Una base propia: no abrir ni borrar los guardados de Linux o Docker.
export class KubeSessions extends LocalSessions {
 constructor({stateLimitMiB=1536,allowExternal=false}={}){super();if(![1536,2048].includes(stateLimitMiB))throw Error('Límite de sesión no admitido');this.maxStateBytes=stateLimitMiB*1048576;if(typeof allowExternal!=='boolean')throw Error('Formato de sesión inválido');this.allowExternal=allowExternal;}
 async open(){
  return new Promise((resolve,reject)=>{
   const request=indexedDB.open(DATABASE,1);
   request.onupgradeneeded=()=>request.result.createObjectStore(STORE,{keyPath:'key'});
   request.onsuccess=()=>resolve(request.result);
   request.onerror=()=>reject(request.error);
   request.onblocked=()=>reject(Error('Cierra las otras pestañas de Kubernetes para acceder al guardado.'));
  });
 }
 async save(key,identity,state,...rest){
  if(state.byteLength>this.maxStateBytes)throw Error('La sesión es demasiado grande para guardarla con seguridad. El guardado anterior se conserva.');
  return super.save(key,identity,state,...rest);
 }
 async unpack(record,identity){
  if(record?.format==='s2ktux-v86-external-checkpoint-v1'){
   if(!this.allowExternal)throw Error('El formato de discos separados requiere su perfil propio');
   return this.unpack({...record,format:'s2ktux-v86-session-v1'},identity);
  }
  if(!Number.isSafeInteger(record?.bytes)||record.bytes<1||record.bytes>this.maxStateBytes||!Number.isSafeInteger(record.packedBytes)||record.packedBytes<1||record.packedBytes>this.maxStateBytes+1048576)throw Error('Tamaño de sesión inválido. El guardado no se ha borrado.');
  if(record.format!=='s2ktux-v86-session-v1'||record.identity!==identity)throw Error('La sesión corresponde a otra versión del laboratorio. No se ha borrado.');
  if(!(record.packed instanceof Blob)||record.packed.size!==record.packedBytes||await hashBlob(record.packed)!==record.sha256)throw Error('La sesión guardada está incompleta o alterada. No se ha borrado.');
  // Limitar durante la descompresión, no después de crear otro buffer gigante.
  const state=new Uint8Array(record.bytes),reader=record.packed.stream().pipeThrough(new DecompressionStream('gzip')).getReader();
  let offset=0;
  try{
   for(;;){
    const {value,done}=await reader.read();if(done)break;
    if(value.length>state.length-offset)throw Error('La sesión supera su tamaño declarado. No se ha borrado.');
    state.set(value,offset);offset+=value.length;
   }
   if(offset!==state.length)throw Error('La sesión recuperada está incompleta.');
   return state.buffer;
  }finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
 }
 async deleteUnchanged(key,expectedSha){
  const db=await this.open();
  try{return await new Promise((resolve,reject)=>{
   const transaction=db.transaction(STORE,'readwrite'),store=transaction.objectStore(STORE);
   const read=store.get(key);let failure;
   read.onsuccess=()=>{
    if((read.result?.sha256||null)!==expectedSha){failure=Error('Otra pestaña ha cambiado el guardado. No se ha borrado; vuelve a abrir esta sesión.');transaction.abort();}
    else store.delete(key);
   };
   transaction.oncomplete=()=>resolve();
   transaction.onerror=transaction.onabort=()=>reject(failure||transaction.error||Error('Reset cancelado.'));
  });}finally{db.close();}
 }
}
