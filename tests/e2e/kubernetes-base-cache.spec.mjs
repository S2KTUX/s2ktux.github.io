import {test,expect} from '@playwright/test';
test('Base preparada · conserva sus 130 partes sin expulsar los recursos de Linux y Docker',async({page})=>{
 await page.goto('/sobre.html');
 const result=await page.evaluate(async()=>{
  const {verifiedDownload}=await import('/laboratorios/verified-download.mjs');
  const data=new TextEncoder().encode('base limpia de prueba'),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),n=>n.toString(16).padStart(2,'0')).join(''),prefix='/qa-base-'+crypto.randomUUID();
  const common=await caches.open('lab-verified-downloads-v1'),base=await caches.open('lab-kubernetes-base-v1');
  const untouched=new URL(prefix+'-linux',location.href).href;await common.put(untouched,new Response('linux'));
  const original=fetch;let requests=0;globalThis.fetch=async()=>{requests++;return new Response(data);};
  try{
   for(let n=0;n<130;n++)await verifiedDownload(prefix+'-'+n,{bytes:data.length,hash,cacheGroup:'kubernetes-base'});
   const first=requests;
   for(let n=0;n<130;n++)await verifiedDownload(prefix+'-'+n,{bytes:data.length,hash,cacheGroup:'kubernetes-base'});
   const linux=await(await common.match(untouched)).text();
   const key=new URL(prefix+'-0',location.href).href;await base.put(key,new Response('alterado'));await verifiedDownload(key,{bytes:data.length,hash,cacheGroup:'kubernetes-base'});
   let rejected=false;try{await verifiedDownload(prefix+'-otro',{bytes:data.length,hash,cacheGroup:'otro'});}catch{rejected=true;}
   return {first,total:requests,linux,rejected};
  }finally{globalThis.fetch=original;for(const key of await base.keys())if(key.url.includes(prefix))await base.delete(key);await common.delete(untouched);}
 });
 expect(result).toEqual({first:130,total:131,linux:'linux',rejected:true});
});
test('La descarga por bloques rechaza datos cortados o demasiado largos antes de guardarlos',async({page})=>{
 await page.goto('/sobre.html');
 const result=await page.evaluate(async()=>{
  const {verifiedDownload}=await import('/laboratorios/verified-download.mjs');const data=new Uint8Array([1,2,3,4]),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),n=>n.toString(16).padStart(2,'0')).join('');
  const original=fetch,prefix='/qa-stream-'+crypto.randomUUID(),out=[];
  try{for(const size of [3,5,4]){globalThis.fetch=async()=>new Response(new ReadableStream({start(c){c.enqueue(new Uint8Array([1,2]));c.enqueue(new Uint8Array(size===3?[3]:size===5?[3,4,5]:[3,4]));c.close();}}));try{const bytes=await verifiedDownload(prefix+size,{hash,bytes:4,cacheGroup:'kubernetes-base'});out.push(Array.from(new Uint8Array(bytes)));}catch{out.push('rejected');}}
   const cache=await caches.open('lab-kubernetes-base-v1');return {out,invalidCached:!!await cache.match(new URL(prefix+3,location.href))||!!await cache.match(new URL(prefix+5,location.href))};
  }finally{globalThis.fetch=original;const cache=await caches.open('lab-kubernetes-base-v1');for(const size of [3,4,5])await cache.delete(new URL(prefix+size,location.href));}
 });expect(result).toEqual({out:['rejected','rejected',[1,2,3,4]],invalidCached:false});
});
