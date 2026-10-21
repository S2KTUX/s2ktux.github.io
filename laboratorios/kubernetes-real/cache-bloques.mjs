// Solo bloques base inmutables. Nunca se guardan aquí escrituras ni sesiones.
const CACHE='s2ktux-kubernetes-blocks-v1',LIMIT=128;
const sha=async data=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),b=>b.toString(16).padStart(2,'0')).join('');
let housekeeping=Promise.resolve();
export async function bloqueVerificado(url,{hash,bytes,download,storage=globalThis.caches,onCacheHit=()=>{}}){
 if(!/^[a-f0-9]{64}$/.test(hash)||!Number.isSafeInteger(bytes)||bytes<1||bytes>2*1048576||typeof download!=='function')throw Error('Identidad del bloque inválida');
 const key=String(url);let cache;
 try{cache=await storage?.open(CACHE);}catch{/* La falta de almacenamiento no impide arrancar. */}
 const valid=async data=>data.byteLength===bytes&&await sha(data)===hash;
 if(cache){
  try{const cached=await cache.match(key);if(cached){const data=await cached.arrayBuffer();if(await valid(data)){onCacheHit();return new Uint8Array(data);}await cache.delete(key);}}
  catch{/* Un error de caché no se confunde con datos verificados. */}
 }
 const data=await download();
 if(!await valid(data))throw Error('Hash o tamaño del fragmento comprimido incorrecto');
 if(cache){
  try{
   await cache.put(key,new Response(data,{headers:{'Content-Type':'application/octet-stream'}}));
   // Ordenar la limpieza evita que descargas paralelas borren entradas de más.
   housekeeping=housekeeping.catch(()=>{}).then(async()=>{const keys=await cache.keys();for(const old of keys.slice(0,Math.max(0,keys.length-LIMIT)))await cache.delete(old);});
   await housekeeping;
  }catch{/* Sin cuota se sigue con el bloque ya verificado en memoria. */}
 }
 return data instanceof Uint8Array?data:new Uint8Array(data);
}
