import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {exercises} from '../laboratorios/docker-real/docker-exercises.mjs';
const lab=new URL('../laboratorios/docker-real/',import.meta.url),read=p=>readFile(new URL(p,lab),'utf8'),hash=b=>createHash('sha256').update(b).digest('hex');
const app=await read('docker.mjs'),html=await read('index.html'),hub=await readFile(new URL('../terminal.html',import.meta.url),'utf8');
assert.equal(exercises.length,32);assert.equal(new Set(exercises.map(e=>e.id)).size,32);assert.deepEqual([...new Set(exercises.map(e=>e.class))].sort(),[1,2,3]);
for(const e of exercises){assert.ok(e.goal.length>30);assert.ok(e.solution.trim());assert.ok(e.checks.every(([label,command])=>label&&command));}
assert.match(app,/new V86\(/);assert.match(app,/createEthernetInternet\(vm.bus\)/);assert.match(app,/date -u -s @/);assert.match(app,/await sessions.delete\(sessionKey\)/);assert.doesNotMatch(app,/sessions\.delete\(['"]s2ktux-(?:linux|kubernetes)/);
assert.match(html,/id="solution"[^>]* hidden/);assert.match(html,/Guardar sesión/);assert.match(hub,/data-pick-mode'\)==='docker'[^\n]+laboratorios\/docker-real/);assert.doesNotMatch(hub,/data-legacy-mode=/);assert.match(html,/href="\/terminal.html\?mode=docker&amp;enter=1"/);
const manifest=JSON.parse(await read('artefactos/disco-v4/disco-fragmentado.json'));assert.equal(manifest.format,'s2ktux-blocks-v1');assert.equal(manifest.parts.length,manifest.bytes/manifest.chunkSize);
const zero=Buffer.alloc(manifest.chunkSize),whole=createHash('sha256');
for(const [i,p] of manifest.parts.entries()){
 assert.equal(p.index,i);assert.equal(p.offset,i*manifest.chunkSize);let data=zero;
 if(p.file){assert.match(p.file,/^[a-f0-9]{64}\.gz$/);const packed=await readFile(new URL('artefactos/disco-v4/fragmentos/'+p.file,lab));assert.equal(packed.length,p.packedBytes);assert.equal(hash(packed),p.packedSha256);data=gunzipSync(packed);}else assert.equal(p.zero,true);
 assert.equal(data.length,p.bytes);assert.equal(hash(data),p.sha256);whole.update(data);
}
assert.equal(whole.digest('hex'),manifest.sha256);
assert.equal(hash(await readFile(new URL('artefactos/vmlinuz-docker-v3',lab))),'65632160583cddbf3f1fbd3749468b3af526d5db75a99c7109e8b4672e23b762');
console.log('✓ Docker real: 32 prácticas, máquina y kernel íntegros, red integrada y guardado separado.');
