import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
const root=process.cwd(),modulePath='/laboratorios/kubernetes-real/debian/fabrica-ha.mjs';
const before=execFileSync('git',['show','933a2d818db9caed68f79d962d79fa780594402d:'+modulePath.slice(1)],{encoding:'utf8'}),rows=[];
const server=http.createServer((req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');if(url.pathname==='/'){res.writeHead(200,{'content-type':'text/html'});return res.end('<title>Medición aislada HA, sin máquinas</title>');}
  const file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root+path.sep))throw Error('Ruta');
  const data=url.pathname===modulePath&&url.searchParams.get('qa')==='anterior'?before:fs.readFileSync(file);
  res.writeHead(200,{'content-type':file.endsWith('.mjs')?'text/javascript':'application/octet-stream'});res.end(data);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
try{
 for(const variant of ['anterior','candidata'])for(let rep=1;rep<=5;rep++){
  const browser=await chromium.launch();
  try{
   const p=await browser.newPage(),cdp=await p.context().newCDPSession(p);
   await p.goto('http://127.0.0.1:'+server.address().port);
   let peak=0,baseline;
   await p.exposeFunction('sampleMemory',async()=>{await cdp.send('HeapProfiler.collectGarbage');const usage=await cdp.send('Runtime.getHeapUsage');baseline??=usage.backingStorageSize;peak=Math.max(peak,usage.backingStorageSize);});
   const result=await p.evaluate(async({variant,modulePath})=>{
    const {cargarBaseHA}=await import(modulePath+'?qa='+variant);
    const {miembrosHA,perfilNodoHA,identidadNodoHA}=await import('/laboratorios/kubernetes-real/debian/perfil-ha.mjs');
    const hash=async data=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),b=>b.toString(16).padStart(2,'0')).join('');
    const size=8*1048576,count=8,revision='a'.repeat(64),sourceRevision='b'.repeat(64),example=new Uint8Array(size);example.fill(7);
    const sha=await hash(example),nodeSha=await hash(new Uint8Array(size*count).fill(7));
    const nodes=await Promise.all(miembrosHA.map(async id=>({id,profile:perfilNodoHA(id),identity:await identidadNodoHA(id),format:'s2ktux-v86-session-v1',bytes:512*1048576,packedBytes:size*count,sha256:nodeSha,parts:Array.from({length:count},(_,i)=>({offset:i*size,bytes:size,sha256:sha,file:sha+'.part'}))})));
    const manifest={format:'s2ktux-kubernetes-ha-clean-v1',sourceRevision,sha256:'d'.repeat(64),nodes},bytes=new TextEncoder().encode(JSON.stringify(manifest));
    await window.sampleMemory();let requests=0;
    const start=performance.now();
    await cargarBaseHA({revision,sourceRevision,sha256:await hash(bytes),url:'https://raw.githubusercontent.com/S2KTUX/s2ktux.github.io/'+'e'.repeat(40)+'/kubernetes/ha-clean-v1/cluster.json'},{revision,fetcher:async()=>new Response(bytes),download:async()=>{
     await window.sampleMemory();requests++;return new Uint8Array(size).fill(7).buffer;
    },sessions:{validate:async records=>{
     await window.sampleMemory();for(const record of records)if(await hash(await record.packed.arrayBuffer())!==nodeSha)throw Error('Bytes distintos');return manifest.sha256;
    }}});
    return {requests,totalBytes:3*size*count,ms:Math.round(performance.now()-start),bytesVerified:true};
   },{variant,modulePath});
   rows.push({variant,rep,browser:browser.version(),backingStoragePeakDelta:peak-baseline,...result});console.log(rows.at(-1));
  }finally{await browser.close();}
 }
 fs.writeFileSync('qa/evidencia/k8s-ha-memoria-chromium-20261121.json',JSON.stringify({scope:'Chromium, cargador real con 192 MiB sintéticos; backingStorageSize tras GC, no memoria total ni VMs',rows},null,2));
}finally{await new Promise(resolve=>server.close(resolve));}
