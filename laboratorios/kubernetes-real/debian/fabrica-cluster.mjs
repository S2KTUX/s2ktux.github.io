import {verifiedDownload} from '../../verified-download.mjs';
const digest=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');
const sha=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
export function validarBasePublicada(manifest,config){
 const count={inicial:1,intermedio:2,avanzado:3}[config.level];
 if(!count||manifest?.format!=='s2ktux-kubernetes-clean-cluster-v1'||manifest.level!==config.level||manifest.factoryVersion!=='v6'||manifest.workerComponents!=='v8'||!sha(manifest.sourceRevision)||!sha(manifest.sha256)||!Array.isArray(manifest.nodes)||manifest.nodes.length!==count)throw Error('Base multinodo incompatible');
 for(const [index,node]of manifest.nodes.entries()){
  if(node.id!==['controlplane','worker1','worker2'][index]||!sha(node.sha256)||!Number.isSafeInteger(node.bytes)||node.bytes<1||node.bytes>1536*1048576||!Number.isSafeInteger(node.packedBytes)||node.packedBytes<1||node.packedBytes>512*1048576||!Array.isArray(node.parts)||!node.parts.length||node.parts.length>64)throw Error('Nodo publicado inválido');
  let offset=0;
  for(const part of node.parts){if(part.offset!==offset||!Number.isSafeInteger(part.bytes)||part.bytes<1||part.bytes>8*1048576||!sha(part.sha256)||part.file!==part.sha256+'.part')throw Error('Fragmento de base inválido');offset+=part.bytes;}
  if(offset!==node.packedBytes)throw Error('Base multinodo incompleta');
 }
 return manifest;
}
export async function cargarBasePublicada(config,{revision,sessions,notify=()=>{},fetcher=fetch,download=verifiedDownload}={}){
 if(!sha(config?.sha256)||config.revision!==revision||!sha(revision))throw Error('Revisión de base no autorizada');
 const url=new URL(config.url);
 if(url.origin!=='https://raw.githubusercontent.com'||!/^\/S2KTUX\/s2ktux\.github\.io\/[a-f0-9]{40}\/kubernetes\/clean-v1\/(inicial|intermedio|avanzado)\/cluster\.json$/.test(url.pathname)||url.search||url.hash)throw Error('Origen de base no autorizado');
 const response=await fetcher(url);if(!response.ok)throw Error('Base preparada no disponible');
 const bytes=await response.arrayBuffer();if(bytes.byteLength>1048576||await digest(bytes)!==config.sha256)throw Error('Manifiesto de base alterado');
 const manifest=validarBasePublicada(JSON.parse(new TextDecoder().decode(bytes)),config),nodes=[];
 const total=manifest.nodes.reduce((sum,node)=>sum+node.packedBytes,0);let done=0;
 for(const node of manifest.nodes){
  const parts=new Array(node.parts.length),progress=new Map();let next=0;
  await Promise.all(Array.from({length:Math.min(3,node.parts.length)},async()=>{
   for(;;){const index=next++,part=node.parts[index];if(!part)return;
    parts[index]=await download(new URL('fragmentos/'+part.file,url),{hash:part.sha256,bytes:part.bytes,notify:count=>{progress.set(index,count);notify('Descargando base preparada… '+Math.floor((done+[...progress.values()].reduce((a,b)=>a+b,0))/total*100)+' %');}});
   }
  }));
  const {parts:_,...metadata}=node;nodes.push({...metadata,packed:new Blob(parts),terminalText:''});done+=node.packedBytes;
 }
 notify('Verificando las máquinas preparadas…');
 const combined=await sessions.validate(nodes);if(combined!==manifest.sha256)throw Error('El conjunto de nodos no coincide');
 return {nodes,sha256:combined};
}
