import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
import {readFile} from 'node:fs/promises';
import {comprimirEstado} from '../laboratorios/kubernetes-real/comprimir-estado.mjs';
const data=new Uint8Array(4*1024*1024);for(let i=0;i<data.length;i++)data[i]=i%251;
async function compare(record,expected){
 assert.equal(record.bytes,expected.byteLength);
 const restored=await new Response(record.packed.stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 assert.deepEqual(new Uint8Array(restored),expected);
}
const own=data.buffer.slice(0);await compare(await comprimirEstado(own),data);assert.equal(own.byteLength,data.byteLength,'No consumir un buffer sin cesión explícita');
const donated=data.buffer.slice(0);await compare(await comprimirEstado(donated,{consumir:true}),data);assert.equal(donated.byteLength,0);
const foreign=runInNewContext('new Uint8Array([1,2,3,4]).buffer');await compare(await comprimirEstado(foreign,{consumir:true}),new Uint8Array([1,2,3,4]));assert.equal(foreign.byteLength,0,'Los estados de otro iframe también se pueden ceder');
const descriptor=Object.getOwnPropertyDescriptor(ArrayBuffer.prototype,'transfer');
try{
 delete ArrayBuffer.prototype.transfer;const legacy=data.buffer.slice(0);await compare(await comprimirEstado(legacy,{consumir:true}),data);assert.equal(legacy.byteLength,data.byteLength,'Navegadores sin transfer conservan el recorrido anterior');
}finally{Object.defineProperty(ArrayBuffer.prototype,'transfer',descriptor);}
for(const bad of [new Uint8Array(10),new ArrayBuffer(0),{byteLength:4,[Symbol.toStringTag]:'ArrayBuffer'}])await assert.rejects(comprimirEstado(bad),/inválido/);
await assert.rejects(comprimirEstado(data.buffer,{consumir:'si'}),/inválida/);
assert.match(await readFile(new URL('../laboratorios/kubernetes-real/debian/bases-limpias.mjs',import.meta.url),'utf8'),/consumir:true/);
assert.match(await readFile(new URL('../laboratorios/kubernetes-real/debian/multinodo.mjs',import.meta.url),'utf8'),/return await capturarCluster/);
const build=await readFile(new URL('../scripts/build-kubernetes-deployment.mjs',import.meta.url),'utf8');
assert.ok(build.indexOf("await replaceRequired('debian/sesiones-cluster.mjs',")<build.indexOf("for(const parent of ['kube-sessions.mjs'"),'Versionar la compresión antes de calcular las referencias de sus padres');
console.log('Guardado: bytes íntegros, copia cedida liberada, compatibilidad entre iframes y alternativa sin transfer. No altera formatos ni identidades de las máquinas.');
