// Solo almacenamiento del navegador: ningún dato del alumno sale del dispositivo.
const DATABASE='s2ktux-v86-sessions-v1';
const STORE='sessions';
export const hashBytes=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
export class LocalSessions {
  async open(){
    return await new Promise((resolve,reject)=>{
      const request=indexedDB.open(DATABASE,1);
      request.onupgradeneeded=()=>request.result.createObjectStore(STORE,{keyPath:'key'});
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error);
      request.onblocked=()=>reject(Error('Cierra las otras pestañas del laboratorio para abrir el guardado.'));
    });
  }
  async access(mode,operation){
    const db=await this.open();
    try{return await new Promise((resolve,reject)=>{
      const transaction=db.transaction(STORE,mode),request=operation(transaction.objectStore(STORE));
      let result;request.onsuccess=()=>{result=request.result;};
      transaction.oncomplete=()=>resolve(result);
      transaction.onerror=()=>reject(transaction.error||request.error);
      transaction.onabort=()=>reject(transaction.error||request.error||Error('Guardado cancelado.'));
    });}finally{db.close();}
  }
  get(key){return this.access('readonly',store=>store.get(key));}
  delete(key){return this.access('readwrite',store=>store.delete(key));}
  async save(key,identity,state,terminalText='',expectedSha=null,signal=null){
    signal?.throwIfAborted();
    const packed=await new Response(new Blob([state]).stream().pipeThrough(new CompressionStream('gzip'))).blob();
    const record={key,format:'s2ktux-v86-session-v1',identity,savedAt:new Date().toISOString(),
      bytes:state.byteLength,packedBytes:packed.size,sha256:await hashBytes(await packed.arrayBuffer()),packed,terminalText:terminalText.slice(-100000)};
    // Una transacción fallida (por ejemplo sin espacio) conserva la sesión anterior.
    const db=await this.open();
    try{await new Promise((resolve,reject)=>{
      signal?.throwIfAborted();
      const transaction=db.transaction(STORE,'readwrite'),store=transaction.objectStore(STORE);
      const cancel=()=>{try{transaction.abort();}catch{}};
      signal?.addEventListener('abort',cancel,{once:true});
      let failure;const read=store.get(key);
      read.onsuccess=()=>{
        try{
          signal?.throwIfAborted();
          if((read.result?.sha256||null)!==expectedSha)throw Error('Otra pestaña ha cambiado el guardado. No se ha sobrescrito; vuelve a abrir esta sesión.');
          store.put(record);
        }catch(error){failure=error;transaction.abort();}
      };
      const cleanup=()=>signal?.removeEventListener('abort',cancel);
      transaction.oncomplete=()=>{cleanup();resolve();};
      transaction.onerror=transaction.onabort=()=>{cleanup();reject(failure||transaction.error||Error('Guardado cancelado.'));};
    });}finally{db.close();}
    return record;
  }
  async unpack(record,identity){
    if(record.format!=='s2ktux-v86-session-v1'||record.identity!==identity)throw Error('La sesión corresponde a otra versión del laboratorio. No se ha borrado.');
    if(!(record.packed instanceof Blob)||record.packed.size!==record.packedBytes||await hashBytes(await record.packed.arrayBuffer())!==record.sha256)throw Error('La sesión guardada está incompleta o alterada. No se ha borrado.');
    const state=await new Response(record.packed.stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
    if(state.byteLength!==record.bytes)throw Error('La sesión recuperada está incompleta.');
    return state;
  }
}
