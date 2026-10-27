// Entrega independiente: nunca admite una base v6, un worker ni una sesión.
import {verifiedDownload} from '../../verified-download.mjs';
import {descargarFragmentoBase} from './fabrica-cluster.mjs?v=979785ed16349130';
import {miembrosHA,perfilNodoHA,identidadNodoHA} from './perfil-ha.mjs?v=d3968d4117772965';
const sha=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const digest=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');
export async function validarBaseHA(manifest,config){
 if(manifest?.format!=='s2ktux-kubernetes-ha-clean-v1'||!sha(config?.sourceRevision)||manifest.sourceRevision!==config.sourceRevision||!sha(manifest.sha256)||!Array.isArray(manifest.nodes)||manifest.nodes.length!==3)throw Error('Base HA incompatible');
 for(const [index,node] of manifest.nodes.entries()){
  if(node?.id!==miembrosHA[index]||node.format!=='s2ktux-v86-session-v1'||JSON.stringify(node.profile)!==JSON.stringify(perfilNodoHA(node.id))||node.identity!==await identidadNodoHA(node.id)||!sha(node.sha256)||!Number.isSafeInteger(node.bytes)||node.bytes<1||node.bytes>2048*1048576||!Number.isSafeInteger(node.packedBytes)||node.packedBytes<1||node.packedBytes>1024*1048576||!Array.isArray(node.parts)||!node.parts.length||node.parts.length>128)throw Error('Miembro de base HA inválido');
  let offset=0;
  for(const part of node.parts){
   if(part.offset!==offset||!Number.isSafeInteger(part.bytes)||part.bytes<1||part.bytes>8*1048576||!sha(part.sha256)||part.file!==part.sha256+'.part')throw Error('Fragmento HA inválido');
   offset+=part.bytes;
  }
  if(offset!==node.packedBytes)throw Error('Base HA incompleta');
 }
 return manifest;
}
export async function cargarBaseHA(config,{revision,sessions,notify=()=>{},fetcher=fetch,download=verifiedDownload}={}){
 if(!sha(config?.sha256)||!sha(revision)||config.revision!==revision)throw Error('Revisión HA no autorizada');
 const url=new URL(config.url);
 if(url.origin!=='https://raw.githubusercontent.com'||!/^\/S2KTUX\/s2ktux\.github\.io\/[a-f0-9]{40}\/kubernetes\/ha-clean-v1\/cluster\.json$/.test(url.pathname)||url.search||url.hash)throw Error('Origen HA no autorizado');
 const response=await fetcher(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('Base HA no disponible');
 const bytes=await response.arrayBuffer();if(bytes.byteLength>1048576||await digest(bytes)!==config.sha256)throw Error('Manifiesto HA alterado');
 const manifest=await validarBaseHA(JSON.parse(new TextDecoder().decode(bytes)),config);
 const total=manifest.nodes.reduce((sum,node)=>sum+node.packedBytes,0),progress=new Map(),nodes=[];
 const jobs=manifest.nodes.flatMap((node,nodeIndex)=>node.parts.map((part,partIndex)=>({part,nodeIndex,partIndex}))),buffers=manifest.nodes.map(node=>new Array(node.parts.length));let next=0,failure;
 await Promise.all(Array.from({length:Math.min(4,jobs.length)},async()=>{
  try{while(!failure){const jobIndex=next++,job=jobs[jobIndex];if(!job)return;const {part,nodeIndex,partIndex}=job;
   buffers[nodeIndex][partIndex]=await descargarFragmentoBase(new URL('fragmentos/'+part.file,url),{hash:part.sha256,bytes:part.bytes,cacheGroup:'kubernetes-base',notify:count=>{progress.set(jobIndex,count);notify('Descargando base HA preparada… '+Math.floor([...progress.values()].reduce((a,b)=>a+b,0)/total*100)+' %');}},download);
  }}catch(error){failure??=error;}
 }));
 // No seguir descargando gigabytes ni arrancar otra preparación mientras
 // quedan peticiones de esta cola. Cada petición mantiene su plazo acotado.
 if(failure)throw failure;
 for(const [index,node] of manifest.nodes.entries()){
  const {parts:_,...metadata}=node;nodes.push({...metadata,packed:new Blob(buffers[index]),terminalText:''});buffers[index]=null;
 }
 notify('Verificando los tres control planes…');
 if(await sessions.validate(nodes)!==manifest.sha256)throw Error('El conjunto HA no coincide');
 return {nodes,sha256:manifest.sha256};
}
