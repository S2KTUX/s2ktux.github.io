import {ChunkDisk as BaseDisk} from '/laboratorios/docker-real/v86-disk.mjs';
import {recursoPesado} from './recursos-publicados.mjs';
const digest=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),byte=>byte.toString(16).padStart(2,'0')).join('');
// Solo Kubernetes: los discos publicados de Linux/Docker no cambian.
// Reintentar transporte, nunca hashes incorrectos, rutas inexistentes ni
// datos corruptos. Cada lectura sigue terminando en bytes verificados.
export async function descargarBloque(url,{fetcher=globalThis.fetch,timeoutMs=8000,retries=2,pause=ms=>new Promise(resolve=>setTimeout(resolve,ms)),onRetry=()=>{}}={}){
 if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1||timeoutMs>8000||![0,1,2].includes(retries))throw Error('Política de lectura inválida');
 for(let attempt=0;;attempt++){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeoutMs);let error;
  try{
   const response=await fetcher(url,{signal:controller.signal});
   if(!response.ok){error=Error('Descarga incompleta: '+response.status);error.retryable=[408,429].includes(response.status)||response.status>=500;throw error;}
   return new Uint8Array(await response.arrayBuffer());
  }catch(caught){
   error=caught;
   const transient=error.retryable===true||error.name==='AbortError'||error instanceof TypeError;
   if(!transient||attempt>=retries)throw error;
  }finally{clearTimeout(timer);}
  onRetry(error);await pause(200*(attempt+1));
 }
}
async function unpack(packed,expected){
 const reader=new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip')).getReader(),data=new Uint8Array(expected);let offset=0;
 try{for(;;){const {value,done}=await reader.read();if(done)break;if(offset+value.length>expected)throw Error('El bloque descomprimido excede su tamaño');data.set(value,offset);offset+=value.length;}if(offset!==expected)throw Error('Bloque descomprimido incompleto');return data;}
 finally{await reader.cancel().catch(()=>{});}
}
export class ChunkDisk extends BaseDisk{
 constructor(...args){super(...args);this.stats.retries=0;}
 async chunk(index){
  if(this.dirty.has(index))return this.dirty.get(index);
  if(this.clean.has(index)){const data=this.clean.get(index);this.clean.delete(index);this.clean.set(index,data);return data;}
  if(!this.pending.has(index))this.pending.set(index,(async()=>{
   const part=this.manifest.parts[index];
   if(!part||part.index!==index||part.offset!==index*this.manifest.chunkSize||!Number.isSafeInteger(part.bytes)||part.bytes<1||part.bytes>this.manifest.chunkSize)throw Error('Metadatos de bloque inválidos');
   let data;
   if(part.zero)data=new Uint8Array(part.bytes);
   else{
    if(!/^[a-f0-9]{64}$/.test(part.packedSha256)||part.file!==part.packedSha256+'.gz')throw Error('Ruta de bloque inválida');
    const packed=await descargarBloque(recursoPesado(new URL('fragmentos/'+part.file,this.base)),{onRetry:()=>this.stats.retries++});
    this.stats.requests++;this.stats.downloadedBytes+=packed.length;
    if(packed.length!==part.packedBytes||await digest(packed)!==part.packedSha256)throw Error('Hash o tamaño del fragmento comprimido incorrecto');
    data=await unpack(packed,part.bytes);
   }
   if(await digest(data)!==part.sha256)throw Error('Fragmento alterado');
   this.clean.set(index,data);if(this.clean.size>this.capacity)this.clean.delete(this.clean.keys().next().value);return data;
  })().finally(()=>this.pending.delete(index)));
  const data=await this.pending.get(index);return this.dirty.get(index)||data;
 }
}
