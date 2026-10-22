import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {hashBlob,LocalSessions} from '../laboratorios/docker-real/v86-sessions.mjs';
import * as linux from '../laboratorios/linux-real/v86-sessions.mjs';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
class CountedBlob extends Blob{
 reads=0;
 async arrayBuffer(){this.reads++;return super.arrayBuffer();}
}
const blob=new CountedBlob(['estado original']);
const first=hashBlob(blob),second=hashBlob(blob);
assert.equal(first,second,'Las llamadas simultáneas comparten una lectura, no dos buffers gigantes');
assert.equal(await first,hash('estado original'));
assert.equal(await hashBlob(blob),await first);
assert.equal(blob.reads,1);
const other=new CountedBlob(['estado alterado']);
assert.notEqual(await hashBlob(other),await first,'Un Blob nuevo siempre se comprueba, aunque tenga igual tamaño');
assert.equal(other.reads,1);
assert.throws(()=>hashBlob(new Uint8Array(1)),/Blob/,'No reutilizar sumas para buffers que sí pueden mutar');
class InterruptedBlob extends Blob{
 reads=0;
 async arrayBuffer(){if(++this.reads===1)throw Error('Lectura interrumpida');return super.arrayBuffer();}
}
const interrupted=new InterruptedBlob(['recuperado']);
await assert.rejects(hashBlob(interrupted),/interrumpida/);
assert.equal(await hashBlob(interrupted),hash('recuperado'));
assert.equal(interrupted.reads,2,'Una lectura fallida no se guarda como resultado válido');
const source=new TextEncoder().encode('sesión de prueba');
const packed=await new Response(new Blob([source]).stream().pipeThrough(new CompressionStream('gzip'))).blob();
const counted=new CountedBlob([packed]),sessions=new LocalSessions();
const record={format:'s2ktux-v86-session-v1',identity:'vm',bytes:source.length,packedBytes:counted.size,sha256:await hashBlob(counted),packed:counted};
assert.deepEqual(new Uint8Array(await sessions.unpack(record,'vm')),source);
assert.equal(counted.reads,1,'Guardar y recuperar el mismo Blob conserva la verificación sin repetir la lectura');
await assert.rejects(sessions.unpack({...record,sha256:'0'.repeat(64)},'vm'),/alterada/,'Los metadatos siguen validándose en cada operación');
await assert.rejects(sessions.unpack({...record,packed:new Blob(['alterado']),packedBytes:8},'vm'),/alterada/);
await assert.rejects(sessions.unpack(record,'otra-vm'),/otra versión/);
const linuxBlob=new CountedBlob([packed]),linuxRecord={...record,packed:linuxBlob,sha256:await linux.hashBlob(linuxBlob)};
assert.deepEqual(new Uint8Array(await new linux.LocalSessions().unpack(linuxRecord,'vm')),source);
assert.equal(linuxBlob.reads,1,'Linux conserva el mismo comportamiento y la misma integridad que Docker');
await assert.rejects(new linux.LocalSessions().unpack({...linuxRecord,sha256:'0'.repeat(64)},'vm'),/alterada/);
console.log('Sesiones: una lectura por Blob inmutable, datos nuevos verificados, errores reintentables y metadatos comprobados.');
