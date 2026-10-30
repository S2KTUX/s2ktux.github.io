import {SesionesHA} from './sesiones-ha.mjs?v=0ca5abaa216f6e3a';
import {miembrosHA,perfilNodoHA,perfilBaseHA,identidadNodoHA} from './perfil-ha.mjs?v=60a21559ace773d9';
import {validarDiscoExterno} from '../checkpoint-discos.mjs?v=b410b9411a1ecd95';
import {hashBytes} from '/laboratorios/docker-real/v86-sessions.mjs';
export class SesionesDiscosHA extends SesionesHA{
 constructor(){super();this.key='cluster-debian-ha-persistent-disks-v1';this.format='s2ktux-ha-persistent-cluster-v1';}
 async packNode(id,capture,terminalText=''){
  if(capture?.format!=='s2ktux-persistent-disks-v1')throw Error('Faltan los discos persistentes HA');
  const externalDisks=capture.externalDisks.map(d=>({...d,parts:d.parts.map(p=>({...p,packed:new Blob([p.packed])}))}));
  const node={id,profile:perfilNodoHA(id),identity:await identidadNodoHA(id),format:'s2ktux-ha-persistent-node-v1',externalDisks,terminalText:terminalText.slice(-100000)};
  node.bytes=externalDisks.reduce((sum,d)=>sum+d.parts.reduce((n,p)=>n+p.bytes,0),0);
  node.packedBytes=externalDisks.reduce((sum,d)=>sum+d.parts.reduce((n,p)=>n+p.packedBytes,0),0);
  return node;
 }
 async validate(nodes){
  if(!Array.isArray(nodes)||nodes.length!==3||nodes.some((n,i)=>n?.id!==miembrosHA[i]))throw Error('Faltan los tres discos de los miembros HA');
  const geometry=(sha256,bytes)=>({sha256,bytes,chunkSize:1048576,parts:Array.from({length:Math.ceil(bytes/1048576)},(_,i)=>({bytes:Math.min(1048576,bytes-i*1048576)}))});
  const manifests={root:geometry(perfilBaseHA.rootSha256,3221225472),components:geometry(perfilBaseHA.componentsSha256,805306368)};
  for(const node of nodes){
   if(node.format!=='s2ktux-ha-persistent-node-v1'||JSON.stringify(node.profile)!==JSON.stringify(perfilNodoHA(node.id))||node.identity!==await identidadNodoHA(node.id)||typeof node.terminalText!=='string'||node.terminalText.length>100000)throw Error('Identidad HA persistente incorrecta');
   if(!Array.isArray(node.externalDisks)||node.externalDisks.length!==2||new Set(node.externalDisks.map(d=>d?.id)).size!==2)throw Error('Faltan los dos discos de un miembro HA');
   for(const id of ['root','components'])await validarDiscoExterno(node.externalDisks.find(d=>d.id===id),manifests[id]);
   const bytes=node.externalDisks.reduce((n,d)=>n+d.parts.reduce((s,p)=>s+p.bytes,0),0),packed=node.externalDisks.reduce((n,d)=>n+d.parts.reduce((s,p)=>s+p.packedBytes,0),0);
   if(node.bytes!==bytes||node.packedBytes!==packed)throw Error('Tamaño de discos HA incorrecto');
  }
  return hashBytes(new TextEncoder().encode(JSON.stringify(nodes.map(n=>({id:n.id,identity:n.identity,disks:n.externalDisks.map(d=>({id:d.id,sha256:d.sha256}))})))));
 }
}
