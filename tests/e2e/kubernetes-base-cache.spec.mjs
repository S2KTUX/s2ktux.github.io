import {test,expect} from '@playwright/test';
test('Base preparada · conserva sus 69 partes sin expulsar los recursos de Linux y Docker',async({page})=>{
 await page.goto('/sobre.html');
 const result=await page.evaluate(async()=>{
  const {verifiedDownload}=await import('/laboratorios/verified-download.mjs');
  const data=new TextEncoder().encode('base limpia de prueba'),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),n=>n.toString(16).padStart(2,'0')).join(''),prefix='/qa-base-'+crypto.randomUUID();
  const common=await caches.open('lab-verified-downloads-v1'),base=await caches.open('lab-kubernetes-base-v1');
  const untouched=new URL(prefix+'-linux',location.href).href;await common.put(untouched,new Response('linux'));
  const original=fetch;let requests=0;globalThis.fetch=async()=>{requests++;return new Response(data);};
  try{
   for(let n=0;n<69;n++)await verifiedDownload(prefix+'-'+n,{bytes:data.length,hash,cacheGroup:'kubernetes-base'});
   const first=requests;
   for(let n=0;n<69;n++)await verifiedDownload(prefix+'-'+n,{bytes:data.length,hash,cacheGroup:'kubernetes-base'});
   const linux=await(await common.match(untouched)).text();
   const key=new URL(prefix+'-0',location.href).href;await base.put(key,new Response('alterado'));await verifiedDownload(key,{bytes:data.length,hash,cacheGroup:'kubernetes-base'});
   return {first,total:requests,linux};
  }finally{globalThis.fetch=original;for(const key of await base.keys())if(key.url.includes(prefix))await base.delete(key);await common.delete(untouched);}
 });
 expect(result).toEqual({first:69,total:70,linux:'linux'});
});
