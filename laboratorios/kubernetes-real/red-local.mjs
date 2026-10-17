// Switch Ethernet local del alumno. Solo conecta tarjetas de sus VMs dentro
// del navegador: no usa WebSocket, red del portátil, WSL ni un servidor.
export function createLocalSwitch({maxPorts=3,now=Date.now,onError=()=>{}}={}){
 if(!Number.isInteger(maxPorts)||maxPorts<2||maxPorts>8)throw Error('Número de nodos inválido');
 const ports=new Map(),addresses=new Map();let destroyed=false,paused=false;
 const stats={frames:0,forwarded:0,blocked:0,duplicateMac:0,pausedFrames:0};
 const mac=bytes=>Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join(':');
 function receive(id,frame){
  if(destroyed||!ports.has(id))return;
  if(paused){stats.pausedFrames++;return;}
  // Las VMs pueden estar en ventanas distintas: instanceof no acepta un
  // Uint8Array de otra ventana aunque sus bytes sean perfectamente válidos.
  if(!ArrayBuffer.isView(frame)||Object.prototype.toString.call(frame)!=='[object Uint8Array]'||frame.length<14||frame.length>65536||frame[6]&1||frame.subarray(6,12).every(byte=>byte===0)){stats.blocked++;return;}
  frame=new Uint8Array(frame.buffer,frame.byteOffset,frame.byteLength);
  const at=now();for(const [key,record] of addresses)if(at-record.seen>300000)addresses.delete(key);
  const source=mac(frame.subarray(6,12)),destination=mac(frame.subarray(0,6)),prior=addresses.get(source);
  if(prior&&prior.port!==id){stats.duplicateMac++;stats.blocked++;onError(Error('Dos nodos tienen la misma dirección MAC. Deben prepararse con tarjetas distintas.'));return;}
  addresses.set(source,{port:id,seen:at});stats.frames++;
  const target=frame[0]&1?null:addresses.get(destination)?.port;
  for(const [peer,{bus,copyFrame}] of ports){
   if(peer===id||target&&peer!==target)continue;
   bus.send('net0-receive',copyFrame(frame));stats.forwarded++;
  }
 }
 function remove(id){
  const port=ports.get(id);if(!port)return;
  port.bus.unregister('net0-send',port.listener);ports.delete(id);
  for(const [key,record] of addresses)if(record.port===id)addresses.delete(key);
 }
 return {
  stats,
  pause(){if(destroyed)throw Error('La red local está cerrada');paused=true;},
  resume(){if(destroyed)throw Error('La red local está cerrada');paused=false;},
  add(id,bus,{copyFrame=frame=>frame.slice()}={}){
   if(destroyed)throw Error('La red local está cerrada');
   if(typeof id!=='string'||!id||ports.has(id)||ports.size>=maxPorts||typeof bus?.register!=='function'||typeof bus?.unregister!=='function'||typeof bus?.send!=='function'||typeof copyFrame!=='function')throw Error('Nodo de red inválido');
   const listener=frame=>receive(id,frame);ports.set(id,{bus,listener,copyFrame});bus.register('net0-send',listener);
   return ()=>remove(id);
  },
  destroy(){if(destroyed)return;destroyed=true;for(const id of [...ports.keys()])remove(id);addresses.clear();},
 };
}
