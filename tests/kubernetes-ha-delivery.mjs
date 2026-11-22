import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {cargarBaseHA,validarBaseHA} from '../laboratorios/kubernetes-real/debian/fabrica-ha.mjs';
import {miembrosHA,perfilNodoHA,identidadNodoHA} from '../laboratorios/kubernetes-real/debian/perfil-ha.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex'),data=new Uint8Array([3,1,4,1,5]),revision='a'.repeat(64),sourceRevision='b'.repeat(64);
const nodes=await Promise.all(miembrosHA.map(async id=>({id,profile:perfilNodoHA(id),identity:await identidadNodoHA(id),format:'s2ktux-v86-session-v1',bytes:1024,packedBytes:data.length,sha256:hash(data),parts:[{offset:0,bytes:data.length,sha256:hash(data),file:hash(data)+'.part'}]})));
const manifest={format:'s2ktux-kubernetes-ha-clean-v1',sourceRevision,sha256:'c'.repeat(64),nodes},bytes=new TextEncoder().encode(JSON.stringify(manifest));
const config={revision,sourceRevision,sha256:hash(bytes),url:'https://raw.githubusercontent.com/S2KTUX/s2ktux.github.io/'+'d'.repeat(40)+'/kubernetes/ha-clean-v1/cluster.json'};
assert.equal(await validarBaseHA(manifest,config),manifest);
for(const change of [{format:'s2ktux-kubernetes-clean-cluster-v1'},{sourceRevision:'f'.repeat(64)},{nodes:nodes.slice(0,2)},{nodes:[nodes[1],nodes[0],nodes[2]]},{nodes:[{...nodes[0],profile:{...nodes[0].profile,role:'worker'}},...nodes.slice(1)]},{nodes:[{...nodes[0],identity:'0'.repeat(64)},...nodes.slice(1)]},{nodes:[{...nodes[0],parts:[{...nodes[0].parts[0],file:'../otro'}]},...nodes.slice(1)]},{nodes:[{...nodes[0],packedBytes:data.length+1},...nodes.slice(1)]}])await assert.rejects(validarBaseHA({...manifest,...change},config));
let downloads=0,validated=0;
const dependencies={revision,fetcher:async()=>new Response(bytes),download:async(url,options)=>{downloads++;assert.equal(options.hash,hash(data));assert.equal(options.bytes,data.length);assert.equal(url.pathname.split('/').at(-1),hash(data)+'.part');return data.buffer;},sessions:{validate:async records=>{validated++;assert.equal(records.length,3);for(const record of records){assert.equal(record.terminalText,'');assert.equal(hash(Buffer.from(await record.packed.arrayBuffer())),record.sha256);}return manifest.sha256;}}};
assert.equal((await cargarBaseHA(config,dependencies)).nodes.length,3);assert.equal(downloads,3);assert.equal(validated,1);
const cloudflare={...config,url:'https://s2ktux-recursos.pages.dev/kubernetes/ha/'+config.sha256+'/cluster.json'};
assert.equal((await cargarBaseHA(cloudflare,dependencies)).nodes.length,3);
await assert.rejects(cargarBaseHA({...cloudflare,url:cloudflare.url.replace(config.sha256,'a'.repeat(64))},dependencies),/Origen/);
await assert.rejects(cargarBaseHA({...cloudflare,url:cloudflare.url.replace('https://','https://otro@')},dependencies),/Origen/);
await assert.rejects(cargarBaseHA({...config,revision:'e'.repeat(64)},dependencies),/Revisión/);
await assert.rejects(cargarBaseHA({...config,url:'https://otro.example/cluster.json'},dependencies),/Origen/);
await assert.rejects(cargarBaseHA({...config,url:config.url+'?otra=1'},dependencies),/Origen/);
await assert.rejects(cargarBaseHA(config,{...dependencies,fetcher:async()=>new Response('alterado')}),/alterado/);
await assert.rejects(cargarBaseHA(config,{...dependencies,sessions:{validate:async()=> '0'.repeat(64)}}),/conjunto/);
const before=downloads,wrongBytes=new TextEncoder().encode(JSON.stringify({...manifest,nodes:[{...nodes[0],identity:'0'.repeat(64)},...nodes.slice(1)]}));
await assert.rejects(cargarBaseHA({...config,sha256:hash(wrongBytes)},{...dependencies,fetcher:async()=>new Response(wrongBytes)}));assert.equal(downloads,before,'No descargar estados con identidades incompatibles');
const repeated={...manifest,nodes:nodes.map(node=>({...node,packedBytes:data.length*2,parts:[node.parts[0],{...node.parts[0],offset:data.length}]}))},repeatedBytes=new TextEncoder().encode(JSON.stringify(repeated));let requested=0,active=0;
await assert.rejects(cargarBaseHA({...config,sha256:hash(repeatedBytes)},{...dependencies,fetcher:async()=>new Response(repeatedBytes),download:async()=>{requested++;if(requested===1)throw Error('Checksum incorrecto');active++;await new Promise(resolve=>setTimeout(resolve,10));active--;return data.buffer;}}),/Checksum/);
assert.ok(requested<=4,'Un fallo detiene la cola antes de descargar todos los estados');assert.equal(active,0,'Las peticiones en curso terminan antes de devolver el fallo');
// Las descargas pueden terminar fuera de orden. Cada Blob final debe contener
// exactamente los bytes concatenados de su nodo, sin depender del orden de red.
const chunks=Array.from({length:9},(_,i)=>new Uint8Array([i+1,0,255-i]));
const ordered={...manifest,nodes:nodes.map((node,n)=>{
 const values=chunks.slice(n*3,n*3+3),joined=Buffer.concat(values);
 return {...node,packedBytes:joined.length,sha256:hash(joined),parts:values.map((value,i)=>({offset:i*3,bytes:3,sha256:hash(value),file:hash(value)+'.part'}))};
})};
const orderedBytes=new TextEncoder().encode(JSON.stringify(ordered));
await cargarBaseHA({...config,sha256:hash(orderedBytes)},{revision,fetcher:async()=>new Response(orderedBytes),download:async(url,options)=>{
 const index=chunks.findIndex(value=>hash(value)===options.hash);
 await new Promise(resolve=>setTimeout(resolve,(9-index)%4));return chunks[index].slice().buffer;
},sessions:{validate:async records=>{
 for(const [n,record]of records.entries())assert.deepEqual(new Uint8Array(await record.packed.arrayBuffer()),new Uint8Array(Buffer.concat(chunks.slice(n*3,n*3+3))));
 return ordered.sha256;
}}});
console.log('Entrega HA: tres perfiles propios, origen inmutable, fragmentos y conjunto verificados; ningún worker ni captura parcial pasa. No acredita todavía los bytes de una base exportada.');
