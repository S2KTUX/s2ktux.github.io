// Un archivo inmutable para el Linux invitado. No es un proxy: no acepta
// direcciones externas, datos del alumno ni rutas del equipo del visitante.
import {verifiedDownload} from '../../verified-download.mjs';
import {recursoPesado} from '../recursos-publicados.mjs?v=28e0db74abed5c76';
import {perfilNodoHA,miembrosHA} from './perfil-ha.mjs?v=60a21559ace773d9';
export const runtimeHA=Object.freeze({bytes:33549444,archiveSha256:'a0e056074373441e308f75df0cf6efc84b07dadf856e3898348748085d47ed2a',binarySha256:'29197a58b1d43d810c29ef742de6eb167ffd73b516e50b18f19806241a9dcdd1'});
export const urlRuntimeHA='http://10.77.0.2/lab/runtime-1.35.tar.gz';
let downloaded;
export async function servirRuntimeHA(bus,id,{copyFrame=bytes=>new Uint8Array(bytes)}={}){
 if(!miembrosHA.includes(id))throw Error('Miembro HA no permitido');
 const path='../componentes/runtime-135-v1/'+runtimeHA.archiveSha256+'.gz';
 // Reutilizar estos33 MiB entre los tres nodos de esta preparación. No son
 // una sesión ni una copia de memoria del alumno y no se guardan en su BD.
 if(!downloaded)downloaded=verifiedDownload(recursoPesado(new URL(path,import.meta.url)),{hash:runtimeHA.archiveSha256,bytes:runtimeHA.bytes}).catch(error=>{downloaded=null;throw error;});
 return servirArchivoRuntime(bus,id,await downloaded,{copyFrame});
}
export async function servirArchivoRuntime(bus,id,buffer,{copyFrame=bytes=>new Uint8Array(bytes)}={}){
 if(!miembrosHA.includes(id)||!(buffer instanceof ArrayBuffer)||buffer.byteLength<1||buffer.byteLength>runtimeHA.bytes)throw Error('Archivo local o nodo no permitido');
 let data=buffer;const size=data.byteLength,stats={requests:0,bytes:size};
 const {FetchNetworkAdapter}=await import('./vendor/fetch-network.mjs?v=b92bcd8e3b6d28d8');
 const address=[10,77,0,2],source=perfilNodoHA(id).ip.split('.').map(Number),callbacks=[],local=new Map();let active=true;
 const equal=(frame,offset,expected)=>expected.every((n,index)=>frame[offset+index]===n);
 const filtered={
  register(event,callback,context){
   if(event!=='net0-send'){local.set(event,[callback,context]);return;}
   const handler=frame=>{
    if(!active||!frame||frame.length<42)return;
    const type=frame[12]*256+frame[13];
    const arp=type===0x806&&frame[20]===0&&frame[21]===1&&equal(frame,28,source)&&equal(frame,38,address);
    const tcp=type===0x800&&(frame[14]>>>4)===4&&frame[23]===6&&equal(frame,26,source)&&equal(frame,30,address);
    if(arp||tcp)callback.call(context,frame);
   };
   callbacks.push([event,handler]);bus.register(event,handler);
  },
  send(event,frame){if(active&&event==='net0-receive')bus.send(event,copyFrame(frame));},
  pair:{send(event,value){const listener=local.get(event);if(active&&listener)listener[0].call(listener[1],value);}}
 };
 const adapter=new FetchNetworkAdapter(filtered,{router_ip:address.join('.'),router_mac:'02:42:00:00:fe:02',vm_ip:source.join('.'),masquerade:false,dns_method:'static'});
 adapter.fetch=async(url,options)=>{
  if(!active||url!==urlRuntimeHA||options?.method!=='GET')return new Response('No disponible',{status:404});
  stats.requests++;return new Response(data,{headers:{'Content-Type':'application/gzip','Content-Length':String(size)}});
 };
 return {url:urlRuntimeHA,stats,close(){active=false;for(const [event,handler] of callbacks)bus.unregister?.(event,handler);for(const connection of Object.values(adapter.tcp_conn))connection.close?.();local.clear();data=null;}};
}
