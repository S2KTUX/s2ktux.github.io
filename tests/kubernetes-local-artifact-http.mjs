import assert from 'node:assert/strict';
import {servirArchivoRuntime,servirRuntimeHA,urlRuntimeHA} from '../laboratorios/kubernetes-real/debian/archivo-http-local.mjs';
import {checksum} from '../laboratorios/docker-real/ethernet-internet.mjs';
const listeners=new Map(),frames=[];
const bus={register(name,fn){assert.equal(name,'net0-send');listeners.set(name,fn);},unregister(name,fn){assert.equal(listeners.get(name),fn);listeners.delete(name);},send(name,frame){assert.equal(name,'net0-receive');frames.push(frame.slice());}};
const data=new TextEncoder().encode('ARCHIVO_LOCAL_REAL').buffer;
await assert.rejects(servirRuntimeHA(bus,'intruso'),/permitido/);
await assert.rejects(servirArchivoRuntime(bus,'worker1',new ArrayBuffer(0)),/permitido/);
const server=await servirArchivoRuntime(bus,'worker1',data);assert.equal(server.url,urlRuntimeHA);
const mac=[2,0,0,0,0,11],router=[2,66,0,0,254,2],src=[10,77,0,11],dst=[10,77,0,2];
const arp=new Uint8Array(42),view=new DataView(arp.buffer);
arp.set(new Uint8Array(6).fill(255));arp.set(mac,6);view.setUint16(12,0x806);view.setUint16(14,1);view.setUint16(16,0x800);arp[18]=6;arp[19]=4;view.setUint16(20,1);arp.set(mac,22);arp.set(src,28);arp.set(dst,38);
listeners.get('net0-send')(arp);assert.equal(frames.length,1);assert.deepEqual([...frames[0].slice(28,32)],dst);
function tcp(seq,ack,flags,text='',port=42001){
 const payload=new TextEncoder().encode(text),packet=new Uint8Array(54+payload.length),v=new DataView(packet.buffer);
 packet.set(router);packet.set(mac,6);v.setUint16(12,0x800);packet[14]=0x45;v.setUint16(16,40+payload.length);packet[22]=64;packet[23]=6;packet.set(src,26);packet.set(dst,30);v.setUint16(24,checksum(packet.subarray(14,34)));v.setUint16(34,port);v.setUint16(36,80);v.setUint32(38,seq);v.setUint32(42,ack);packet[46]=0x50;packet[47]=flags;v.setUint16(48,65535);packet.set(payload,54);
 const pseudo=new Uint8Array(12+20+payload.length);pseudo.set(src);pseudo.set(dst,4);pseudo[9]=6;new DataView(pseudo.buffer).setUint16(10,20+payload.length);pseudo.set(packet.subarray(34),12);v.setUint16(50,checksum(pseudo));return packet;
}
async function request(path,port){
 listeners.get('net0-send')(tcp(100,0,2,'',port));const synack=frames.at(-1),v=new DataView(synack.buffer);assert.equal(synack[47]&0x12,0x12);const seq=v.getUint32(38)+1;
 listeners.get('net0-send')(tcp(101,seq,0x10,'',port));const request='GET '+path+' HTTP/1.1\r\nHost: 10.77.0.2\r\nConnection: close\r\n\r\n';let cursor=frames.length;
 listeners.get('net0-send')(tcp(101,seq,0x18,request,port));
 // Actuar como un cliente TCP: confirmar los datos antes de esperar el
 // siguiente segmento. Un200 por sí solo no demuestra recibir el archivo.
 for(let round=0;round<8;round++){
  await new Promise(resolve=>setTimeout(resolve,10));
  while(cursor<frames.length){const frame=frames[cursor++],v=new DataView(frame.buffer);if(frame[23]!==6||v.getUint16(36)!==port)continue;
   const ip=(frame[14]&15)*4,tcpSize=(frame[14+ip+12]>>>4)*4,bytes=v.getUint16(16)-ip-tcpSize,fin=frame[14+ip+13]&1;
   if(bytes>0||fin)listeners.get('net0-send')(tcp(101+request.length,v.getUint32(14+ip+4)+bytes+fin,0x10,'',port));
  }
 }
}
await request('/lab/runtime-1.35.tar.gz',42001);assert.equal(server.stats.requests,1);
assert.ok(frames.some(frame=>new TextDecoder().decode(frame.subarray(54)).includes('HTTP/1.1 200')));
assert.ok(frames.some(frame=>new TextDecoder().decode(frame.subarray(54)).includes('ARCHIVO_LOCAL_REAL')));
await request('/otra-ruta',42002);assert.equal(server.stats.requests,1);assert.ok(frames.some(frame=>new TextDecoder().decode(frame.subarray(54)).includes('HTTP/1.1 404')));
const count=frames.length,foreign=arp.slice();foreign.set([10,77,0,10],28);listeners.get('net0-send')(foreign);assert.equal(frames.length,count);
server.close();assert.equal(listeners.size,0);
console.log('HTTP local: ARP/TCP y contenido real, segunda IP del escenario, ruta ajena404, tráfico de otro nodo ignorado y cierre. No acredita init/join ni el SHA del archivo distribuido.');
