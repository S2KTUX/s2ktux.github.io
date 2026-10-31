import {descargarFragmentoBase} from './fabrica-cluster.mjs?v=979785ed16349130';
export const BASE_EXAMEN_PUBLICADA=Object.freeze({
 revision:'a374b800a490aebea96548a4540ca8e52135bd9f1012e836ac9350221cef3a19',
 sha256:'c09e61bf5ce47bd5a6764b521ea5a0764944c1329a15dad2ed4c421110307253',
 url:'https://raw.githubusercontent.com/S2KTUX/s2ktux.github.io/cab04c433cc57305b2889ec535defa2f75074c02/kubernetes/examen-v1/cluster.json'
});
const sha=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const hash=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');
export function validarBaseExamen(manifest,revision){
 if(manifest?.format!=='s2ktux-cka-clean-v1'||manifest.revision!==revision||!sha(revision)||!sha(manifest.sha256)||!Array.isArray(manifest.nodes)||manifest.nodes.length!==2)throw Error('Base de examen incompatible');
 for(const [i,node]of manifest.nodes.entries()){
  if(node.id!==['controlplane','worker1'][i]||node.format!=='s2ktux-v86-external-checkpoint-v1'||!sha(node.identity)||!sha(node.sha256)||!Number.isSafeInteger(node.bytes)||node.bytes<1||node.bytes>(i===0?2048:1536)*1048576||!Number.isSafeInteger(node.packedBytes)||node.packedBytes<1||node.packedBytes>node.bytes+1048576||!Array.isArray(node.parts)||node.parts.length<1||node.parts.length>256)throw Error('Estado publicado de examen inválido');
  let offset=0;for(const part of node.parts){if(part.offset!==offset||!Number.isSafeInteger(part.bytes)||part.bytes<1||part.bytes>8*1048576||!sha(part.sha256)||part.file!==part.sha256+'.part')throw Error('Fragmento de examen inválido');offset+=part.bytes;}if(offset!==node.packedBytes)throw Error('Estado publicado incompleto');
  if(!Array.isArray(node.externalDisks)||node.externalDisks.length!==2||new Set(node.externalDisks.map(d=>d.id)).size!==2)throw Error('Discos publicados incompletos');
  for(const disk of node.externalDisks){
   const size={root:3221225472,components:805306368}[disk.id];
   if(!size||disk.format!=='s2ktux-external-disk-v1'||disk.diskBytes!==size||disk.chunkSize!==1048576||!sha(disk.sha256)||!sha(disk.manifestSha256)||!Array.isArray(disk.parts)||disk.parts.length>size/1048576)throw Error('Disco publicado inválido');
   let previous=-1;for(const part of disk.parts){if(!Number.isSafeInteger(part.index)||part.index<=previous||part.index>=size/1048576||part.bytes!==1048576||!sha(part.rawSha256)||!sha(part.sha256)||!Number.isSafeInteger(part.packedBytes)||part.packedBytes<1||part.packedBytes>1048576+65536||part.file!==part.sha256+'.part')throw Error('Bloque publicado inválido');previous=part.index;}
  }
 }
 return manifest;
}
export async function cargarBaseExamen(config,{revision,compatibleRevisions=[],sessions,notify=()=>{},fetcher=fetch,download}={}){
 if(!sha(config?.sha256)||!sha(revision)||!Array.isArray(compatibleRevisions)||compatibleRevisions.length>4||compatibleRevisions.some(value=>!sha(value))||config.revision!==revision&&!compatibleRevisions.includes(config.revision))throw Error('Revisión de examen no autorizada');
 const url=new URL(config.url);
 if(url.origin!=='https://raw.githubusercontent.com'||!/^\/S2KTUX\/s2ktux\.github\.io\/[a-f0-9]{40}\/kubernetes\/examen-v1\/cluster\.json$/.test(url.pathname)||url.search||url.hash)throw Error('Origen del examen no autorizado');
 const response=await fetcher(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('Base de examen no disponible');
 const bytes=await response.arrayBuffer();if(bytes.byteLength>2*1048576||await hash(bytes)!==config.sha256)throw Error('Manifiesto del examen alterado');
 const manifest=validarBaseExamen(JSON.parse(new TextDecoder().decode(bytes)),config.revision),jobs=[];
 const nodes=manifest.nodes.map(node=>{const {parts,...metadata}=node;const buffers=new Array(parts.length),result={...metadata,packed:null,terminalText:'',externalDisks:node.externalDisks.map(d=>({...d,parts:d.parts.map(p=>({...p,packed:null}))}))};
  parts.forEach((part,i)=>jobs.push({part,bytes:part.bytes,put:value=>buffers[i]=value}));
  result.externalDisks.forEach(d=>d.parts.forEach(part=>jobs.push({part,bytes:part.packedBytes,put:value=>{part.packed=new Blob([value]);delete part.file;}})));
  return {result,buffers};
 });
 const total=jobs.reduce((n,j)=>n+j.bytes,0),progress=new Map();let next=0;
 await Promise.all(Array.from({length:Math.min(6,jobs.length)},async()=>{for(;;){const i=next++,job=jobs[i];if(!job)return;const value=await descargarFragmentoBase(new URL('fragmentos/'+job.part.file,url),{hash:job.part.sha256,bytes:job.bytes,cacheGroup:'kubernetes-base',notify:count=>{progress.set(i,count);notify('Descargando el examen preparado… '+Math.floor([...progress.values()].reduce((a,b)=>a+b,0)/total*100)+' %');}},download);job.put(value);}}));
 for(const node of nodes)node.result.packed=new Blob(node.buffers);
 const results=nodes.map(n=>n.result);notify('Verificando la base del examen…');const combined=await sessions.validate(results);if(combined!==manifest.sha256)throw Error('Las máquinas del examen no coinciden');return {nodes:results,sha256:combined};
}
