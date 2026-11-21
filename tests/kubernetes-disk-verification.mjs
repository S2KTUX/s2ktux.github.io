import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {pathToFileURL} from 'node:url';
const url=new URL('../laboratorios/kubernetes-real/disco-kubernetes.mjs',import.meta.url);
const root=new URL('../',import.meta.url);
const source=fs.readFileSync(url,'utf8').replace(/from '([^']+)'/g,(_,name)=>"from '"+(name.startsWith('/')?new URL('.'+name,root):new URL(name,url)).href+"'");
const {ChunkDisk}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const hash=data=>createHash('sha256').update(data).digest('hex'),raw=new Uint8Array(1048576).fill(7),packed=gzipSync(raw);
const manifest={format:'s2ktux-blocks-v1',bytes:raw.length,chunkSize:raw.length,parts:[{index:0,offset:0,bytes:raw.length,packedBytes:packed.length,packedSha256:hash(packed),file:hash(packed)+'.gz',sha256:hash(raw)}]};
const originalFetch=globalThis.fetch,originalDigest=crypto.subtle.digest;
let downloads=0,hashes=0;
try{
 crypto.subtle.digest=function(...args){hashes++;return originalDigest.apply(this,args);};
 globalThis.fetch=async()=>{downloads++;return new Response(packed);};
 const disk=new ChunkDisk(manifest,new URL('https://example.org/disk/'));
 const [a,b]=await Promise.all([disk.chunk(0),disk.chunk(0)]);
 assert.deepEqual(a,raw);assert.equal(a,b);assert.equal(downloads,1);
 assert.equal(hashes,2,'Una verificación comprimida y otra descomprimida, sin repetir hashes');
 await disk.chunk(0);assert.equal(hashes,2,'La copia RAM ya comprobada se reutiliza');
 globalThis.fetch=async()=>new Response(new Uint8Array(packed.length));
 await assert.rejects(new ChunkDisk(manifest,new URL('https://example.org/disk/')).chunk(0),/Hash o tamaño/);
 globalThis.fetch=async()=>new Response(packed);
 const wrong={...manifest,parts:[{...manifest.parts[0],sha256:'0'.repeat(64)}]};
 await assert.rejects(new ChunkDisk(wrong,new URL('https://example.org/disk/')).chunk(0),/Fragmento alterado/);
}finally{globalThis.fetch=originalFetch;crypto.subtle.digest=originalDigest;}
console.log('Disco Kubernetes: ambos hashes conservados, corrupción rechazada y lecturas concurrentes sin duplicar trabajo.');
