import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
const file='laboratorios/kubernetes-real/debian/fabrica-ha.mjs';
if(!process.argv.includes('--child')){
 const rows=[];
 for(const variant of ['anterior','candidata'])for(let rep=1;rep<=5;rep++){
  const row=JSON.parse(execFileSync(process.execPath,['--expose-gc',process.argv[1],'--child',variant],{encoding:'utf8'}));rows.push({...row,rep});console.log(rows.at(-1));
 }
 fs.writeFileSync('qa/evidencia/k8s-ha-memoria-descarga-20261121.json',JSON.stringify({scope:'Carga sintética de 192 MiB con el cargador real en Node; no mide RAM de VMs ni del navegador',rows},null,2));
}else{
 const variant=process.argv.at(-1),hash=data=>createHash('sha256').update(data).digest('hex');
 const {miembrosHA,perfilNodoHA,identidadNodoHA}=await import('../laboratorios/kubernetes-real/debian/perfil-ha.mjs');
 let source=variant==='anterior'?execFileSync('git',['show','933a2d818db9caed68f79d962d79fa780594402d:'+file],{encoding:'utf8'}):fs.readFileSync(file,'utf8');
 source=source.replace(/from '([^']+)'/g,(_,name)=>"from '"+new URL(name,pathToFileURL(resolve(file))).href+"'");
 const {cargarBaseHA}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
 const partBytes=8*1048576,parts=8,revision='a'.repeat(64),sourceRevision='b'.repeat(64);
 const example=new Uint8Array(partBytes);example.fill(7);const partHash=hash(example);
 const nodes=await Promise.all(miembrosHA.map(async id=>({id,profile:perfilNodoHA(id),identity:await identidadNodoHA(id),format:'s2ktux-v86-session-v1',bytes:512*1048576,packedBytes:parts*partBytes,sha256:'c'.repeat(64),parts:Array.from({length:parts},(_,i)=>({offset:i*partBytes,bytes:partBytes,sha256:partHash,file:partHash+'.part'}))})));
 const manifest={format:'s2ktux-kubernetes-ha-clean-v1',sourceRevision,sha256:'d'.repeat(64),nodes},bytes=new TextEncoder().encode(JSON.stringify(manifest));
 global.gc();const baseline=process.memoryUsage().external;let peak=baseline,requests=0;
 const started=performance.now();
 await cargarBaseHA({revision,sourceRevision,sha256:hash(bytes),url:'https://raw.githubusercontent.com/S2KTUX/s2ktux.github.io/'+'e'.repeat(40)+'/kubernetes/ha-clean-v1/cluster.json'},{revision,fetcher:async()=>new Response(bytes),download:async()=>{
  global.gc();peak=Math.max(peak,process.memoryUsage().external);requests++;const data=new Uint8Array(partBytes);data.fill(7);return data.buffer;
 },sessions:{validate:async records=>{
  global.gc();peak=Math.max(peak,process.memoryUsage().external);
  for(const node of records)if(node.packed.size!==partBytes*parts)throw Error('Tamaño distinto');return manifest.sha256;
 }}});
 console.log(JSON.stringify({variant,requests,totalBytes:3*parts*partBytes,retainedArrayBufferPeakBytes:peak-baseline,ms:Math.round(performance.now()-started)}));
}
