import assert from 'node:assert/strict';
import {allowInternetFrame,isPublicIPv4,restrictInternetAdapter,internetOptions} from '../laboratorios/linux-real/v86-network.mjs';
const packet=(proto,dest,port=443)=>{
  const b=new Uint8Array(74),v=new DataView(b.buffer);
  v.setUint16(12,0x800);b[14]=0x45;b[23]=proto;b.set(dest,30);v.setUint16(36,port);return b;
};
assert.equal(allowInternetFrame(packet(6,[93,184,215,14])),true);
for(const a of [[127,0,0,1],[10,42,0,11],[192,168,1,1],[172,16,0,1],[169,254,169,254],[100,64,0,1],[224,0,0,1],[0,0,0,0],[198,18,0,1]]){
  assert.equal(isPublicIPv4(a),false);assert.equal(allowInternetFrame(packet(6,a)),false);
}
for(const proto of [1,17,58])assert.equal(allowInternetFrame(packet(proto,[8,8,8,8])),false,'Sin ping/UDP/NTP ficticio');
assert.equal(allowInternetFrame(packet(17,[10,42,0,1],53)),true);
assert.equal(allowInternetFrame(packet(17,[10,42,0,11],53)),false,'DNS del vecino no interceptado');
const arp=new Uint8Array(42);const v=new DataView(arp.buffer);v.setUint16(12,0x806);v.setUint16(20,1);arp.set([10,42,0,1],38);
assert.equal(allowInternetFrame(arp),true);arp.set([10,42,0,11],38);assert.equal(allowInternetFrame(arp),false);
for(let n=0;n<34;n++)assert.equal(allowInternetFrame(new Uint8Array(n)),false);
const fragment=packet(6,[1,1,1,1]);new DataView(fragment.buffer).setUint16(20,0x2000);assert.equal(allowInternetFrame(fragment),false);
const sent=[];const adapter={send:b=>sent.push(b),wispws:{readyState:1}};restrictInternetAdapter(adapter);
adapter.send(packet(1,[8,8,8,8]));adapter.send(packet(6,[1,1,1,1]));assert.equal(sent.length,1);
adapter.wispws.readyState=3;adapter.send(packet(6,[1,1,1,1]));assert.equal(sent.length,1,'Puente caído sin éxito inventado ni excepción');
assert.throws(()=>restrictInternetAdapter({}));assert.match(internetOptions('1').relay_url,/^wisps:\/\//);
console.log('✓ Red: TCP público integrado, DNS real, sin ping/NTP fabricados ni interceptar a la otra VM.');
