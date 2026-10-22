const GROUPS=Object.freeze({common:{name:'lab-verified-downloads-v1',limit:64},'kubernetes-base':{name:'lab-kubernetes-base-v1',limit:96}});
const sha=async data=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),b=>b.toString(16).padStart(2,'0')).join('');
let housekeeping=Promise.resolve();
// Solo recursos inmutables cuya suma se ha comprobado; no sesiones ni datos del alumno.
export async function verifiedDownload(url,{hash,bytes,notify=()=>{},timeoutMs,cacheGroup='common'}={}){
 if(!Number.isSafeInteger(bytes)||bytes<1||!/^[a-f0-9]{64}$/.test(hash))throw Error('Identidad del recurso de arranque inválida');
 if(timeoutMs!==undefined&&(!Number.isSafeInteger(timeoutMs)||timeoutMs<1000||timeoutMs>60000))throw Error('Tiempo de descarga inválido');
 if(!Object.hasOwn(GROUPS,cacheGroup))throw Error('Grupo de caché inválido');
 const group=GROUPS[cacheGroup];let cache;try{if(bytes<=8*1048576)cache=await caches.open(group.name);}catch{}
 const key=new URL(url,location.href).href;
 const read=async response=>{const data=await response.arrayBuffer();if(data.byteLength!==bytes||await sha(data)!==hash)throw Error('Recurso de arranque alterado');return data;};
 if(cache){const cached=await cache.match(key);if(cached){try{const data=await read(cached);notify(bytes,true);return data;}catch{await cache.delete(key);}}}
 const response=await (timeoutMs===undefined?fetch(key):fetch(key,{signal:AbortSignal.timeout(timeoutMs)}));if(!response.ok){const error=Error('No se pudo descargar el recurso de arranque');error.retryable=[408,429].includes(response.status)||response.status>=500;throw error;}
 const reader=response.body?.getReader();let data;
 if(reader){const parts=[];let received=0;for(;;){const {done,value}=await reader.read();if(done)break;received+=value.byteLength;if(received>bytes){await reader.cancel();throw Error('Recurso de arranque demasiado grande');}parts.push(value);notify(received,false);}data=await new Blob(parts).arrayBuffer();}
 else data=await response.arrayBuffer();
 if(data.byteLength!==bytes||await sha(data)!==hash)throw Error('Recurso de arranque alterado');
 if(cache){try{await cache.put(key,new Response(data,{headers:{'Content-Type':'application/octet-stream'}}));housekeeping=housekeeping.catch(()=>{}).then(async()=>{const keys=await cache.keys();for(const old of keys.slice(0,Math.max(0,keys.length-group.limit)))await cache.delete(old);});await housekeeping;}catch{/* Falta de cuota: el arranque sigue sin caché. */}}
 return data;
}
