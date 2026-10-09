// NAT del navegador sobre Ethernet real: solo respuestas a tráfico del invitado.
import {isPublicIPv4} from './v86-network.mjs?v=20261009-intuitive';
export const ETHERNET_RELAY='wss://relay.widgetry.org/';
const GATEWAY=[10,42,0,1],ROUTER_MAC=[2,66,0,0,0,1];
const ipKey=a=>Array.from(a).join('.');
const equal=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
export function checksum(b){let n=0;for(let i=0;i<b.length;i+=2)n+=(b[i]<<8)|(b[i+1]||0);while(n>>>16)n=(n&65535)+(n>>>16);return (~n)&65535;}
function ethernet(dest,source,type,payload){const b=new Uint8Array(14+payload.length);b.set(dest);b.set(source,6);new DataView(b.buffer).setUint16(12,type);b.set(payload,14);return b;}
function ipv4(proto,source,dest,payload){const b=new Uint8Array(20+payload.length),v=new DataView(b.buffer);b[0]=0x45;v.setUint16(2,b.length);b[8]=64;b[9]=proto;b.set(source,12);b.set(dest,16);v.setUint16(10,checksum(b.subarray(0,20)));b.set(payload,20);return b;}
function udp(sourcePort,destPort,payload){const b=new Uint8Array(8+payload.length),v=new DataView(b.buffer);v.setUint16(0,sourcePort);v.setUint16(2,destPort);v.setUint16(4,b.length);b.set(payload,8);return b;}
function arp(sourceMac,sourceIp,destMac,destIp,reply=false){const b=new Uint8Array(28),v=new DataView(b.buffer);v.setUint16(0,1);v.setUint16(2,0x800);b[4]=6;b[5]=4;v.setUint16(6,reply?2:1);b.set(sourceMac,8);b.set(sourceIp,14);if(reply)b.set(destMac,18);b.set(destIp,24);return ethernet(reply?destMac:new Uint8Array(6).fill(255),sourceMac,0x806,b);}
export function parseIPv4(frame){
 if(!(frame instanceof Uint8Array)||frame.length<34||new DataView(frame.buffer,frame.byteOffset,frame.byteLength).getUint16(12)!==0x800||frame[14]>>>4!==4)return null;
 const view=new DataView(frame.buffer,frame.byteOffset,frame.byteLength),h=(frame[14]&15)*4,size=view.getUint16(16),fragment=view.getUint16(20);
 if(h<20||size<h||14+size>frame.length||fragment&0x3fff||checksum(frame.subarray(14,14+h))!==0)return null;
 const offset=14+h,proto=frame[23],length=size-h;
 if(proto===6&&(length<20||(frame[offset+12]>>>4)*4<20||(frame[offset+12]>>>4)*4>length)||proto===17&&(length<8||view.getUint16(offset+4)!==length)||proto===1&&length<8)return null;
 return {proto,offset,size,h,source:frame.slice(26,30),dest:frame.slice(30,34),view};
}
export function rewriteIPv4(frame,source,dest){
 const p=parseIPv4(frame);if(!p)return null;const b=frame.slice(0,14+p.size),v=new DataView(b.buffer);b.set(source,26);b.set(dest,30);v.setUint16(24,0);v.setUint16(24,checksum(b.subarray(14,14+p.h)));
 if(p.proto===6||p.proto===17){const at=p.offset+(p.proto===6?16:6),zero=p.proto===17&&v.getUint16(at)===0;v.setUint16(at,0);if(!zero){const length=p.size-p.h,pseudo=new Uint8Array(12+length);pseudo.set(source);pseudo.set(dest,4);pseudo[9]=p.proto;new DataView(pseudo.buffer).setUint16(10,length);pseudo.set(b.subarray(p.offset),12);v.setUint16(at,checksum(pseudo)||65535);}}
 return b;
}
function flow(p,incoming=false){const v=p.view,o=p.offset,remote=ipKey(incoming?p.source:p.dest);if(p.proto===1)return remote+':1:'+v.getUint16(o+4)+':'+v.getUint16(o+6);if(p.proto===6||p.proto===17)return remote+':'+p.proto+':'+v.getUint16(o+(incoming?2:0))+':'+v.getUint16(o+(incoming?0:2));return null;}
export function createEthernetInternet(bus,{WebSocketClass=globalThis.WebSocket,now=Date.now,random=crypto.getRandomValues.bind(crypto),setTimer=setTimeout,clearTimer=clearTimeout}={}){
 const relayMac=random(new Uint8Array(6));relayMac[0]=2;let xid=random(new Uint8Array(4)),socket,assigned,gateway,gatewayMac,dns,guestMac,guestIp,retry,renew,setupRetry,destroyed=false;
 const flows=new Map(),state={status:'connecting',sent:0,received:0,blocked:0};
 const send=b=>{if(socket?.readyState===1){socket.send(b);return true;}return false;};
 function dhcp(kind=1){const options=[99,130,83,99,53,1,kind,55,3,1,3,6,...(kind===3?[50,4,...assigned,54,4,...gateway]:[]),255],boot=new Uint8Array(236+options.length);boot[0]=1;boot[1]=1;boot[2]=6;boot.set(xid,4);boot[10]=0x80;boot.set(relayMac,28);boot.set(options,236);send(ethernet(new Uint8Array(6).fill(255),relayMac,0x800,ipv4(17,[0,0,0,0],[255,255,255,255],udp(68,67,boot))));}
 function setup(){dhcp();clearTimer(setupRetry);setupRetry=setTimer(()=>{if(!destroyed&&state.status!=='ready')setup();},10000);}
 function receive(event){
  if(!(event.data instanceof ArrayBuffer))return;const b=new Uint8Array(event.data);if(b.length<14)return;const v=new DataView(b.buffer),type=v.getUint16(12);
  if(type===0x806&&b.length>=42&&assigned&&gateway){if(v.getUint16(20)===2&&equal(b.slice(28,32),gateway)&&equal(b.slice(38,42),assigned)&&equal(b.slice(32,38),relayMac)){gatewayMac=b.slice(22,28);state.status='ready';clearTimer(setupRetry);}else if(v.getUint16(20)===1&&equal(b.slice(28,32),gateway)&&equal(b.slice(38,42),assigned))send(arp(relayMac,assigned,b.slice(22,28),gateway,true));return;}
  const p=parseIPv4(b);if(!p)return;
  if(p.proto===17&&v.getUint16(p.offset)===67&&v.getUint16(p.offset+2)===68&&b.length>=p.offset+8+240){const boot=b.subarray(p.offset+8);if(!equal(boot.slice(4,8),xid)||!equal(boot.slice(28,34),relayMac))return;const options={};for(let i=240;i<boot.length;){const k=boot[i++];if(k===255)break;if(k===0)continue;const len=boot[i++];if(i+len>boot.length)return;options[k]=[...boot.slice(i,i+len)];i+=len;}if(options[53]?.[0]===2){assigned=[...boot.slice(16,20)];gateway=options[54]?.slice(0,4)||options[3]?.slice(0,4);dns=options[6]?.slice(0,4)||gateway;if(!gateway)return;dhcp(3);}if(options[53]?.[0]===5&&assigned&&gateway){clearTimer(renew);const lease=options[51]?.reduce((n,b)=>n*256+b,0)||900;renew=setTimer(()=>{xid=random(new Uint8Array(4));flows.clear();state.status='connecting';gatewayMac=null;setup();},Math.min(lease*500,400000));send(arp(relayMac,assigned,new Uint8Array(6),gateway));}return;}
  if(!assigned||!guestIp||!guestMac||!equal(p.dest,assigned)||!equal(b.slice(0,6),relayMac))return;
  const key=flow(p,true),match=key&&flows.get(key);if(!match||match.expires<now()||p.proto===1&&(b[p.offset]!==0||checksum(b.subarray(p.offset,14+p.size))!==0)){state.blocked++;return;}
  const restored=rewriteIPv4(b,match.dns?GATEWAY:p.source,match.guestIp);if(!restored)return;restored.set(match.guestMac);restored.set(ROUTER_MAC,6);state.received++;bus.send('net0-receive',restored);
 }
 function outbound(frame){
  if(destroyed||!(frame instanceof Uint8Array)||frame.length<14)return;const v=new DataView(frame.buffer,frame.byteOffset,frame.byteLength);
  if(v.getUint16(12)===0x806&&frame.length>=42&&v.getUint16(20)===1&&equal(frame.slice(38,42),GATEWAY)){if(state.status==='ready')bus.send('net0-receive',arp(ROUTER_MAC,GATEWAY,frame.slice(22,28),frame.slice(28,32),true));return;}
  const p=parseIPv4(frame);if(!p||!assigned||!gatewayMac||!equal(frame.slice(0,6),ROUTER_MAC)||!equal(p.source.slice(0,3),[10,42,0])||p.source[3]<2||p.source[3]>254)return;
  const isDns=p.proto===17&&equal(p.dest,GATEWAY)&&p.view.getUint16(p.offset+2)===53;
  if(!isDns&&!isPublicIPv4([...p.dest])||![1,6,17].includes(p.proto)||p.proto===1&&(frame[p.offset]!==8||checksum(frame.subarray(p.offset,14+p.size))!==0)){state.blocked++;return;}
  guestMac=frame.slice(6,12);guestIp=p.source;const translated=rewriteIPv4(frame,assigned,isDns?dns:p.dest);if(!translated)return;translated.set(gatewayMac);translated.set(relayMac,6);const mapped=parseIPv4(translated),key=flow(mapped);for(const [k,f]of flows)if(f.expires<now())flows.delete(k);if(flows.size>=4096&&!flows.has(key)){state.blocked++;return;}flows.set(key,{guestMac,guestIp,dns:isDns,expires:now()+180000});if(send(translated))state.sent++;
 }
 function connect(){if(destroyed)return;state.status='connecting';socket=new WebSocketClass(ETHERNET_RELAY);socket.binaryType='arraybuffer';socket.addEventListener('open',setup);socket.addEventListener('message',receive);socket.addEventListener('error',()=>{state.status='unavailable';});socket.addEventListener('close',()=>{state.status='unavailable';gatewayMac=null;flows.clear();clearTimer(setupRetry);clearTimer(renew);if(!destroyed)retry=setTimer(connect,10000);});}
 bus.register('net0-send',outbound);connect();
 return {state,destroy(){destroyed=true;clearTimer(retry);clearTimer(renew);clearTimer(setupRetry);flows.clear();socket?.close();bus.unregister?.('net0-send',outbound);}};
}
