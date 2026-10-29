import {SesionesClusterDebian} from './sesiones-cluster.mjs?v=c7237db8c69c1abe';
import {BasesLimpias} from './bases-limpias.mjs?v=cc76958a7d5c485b';
import {perfilFabricaDebian} from './fabrica.mjs?v=f8890388a14d848d';
import {validarDiscoExterno} from '../checkpoint-discos.mjs?v=b5a6e4f42af60fab';
import {hashBytes} from '/laboratorios/docker-real/v86-sessions.mjs?v=3852a1206e14ad3b';
export const FORMATO_NODO_CHECKPOINT='s2ktux-v86-external-checkpoint-v1';
export function manifiestosCheckpointV15(){
 const base=perfilFabricaDebian('v15');
 const geometry=(sha256,bytes)=>({sha256,bytes,chunkSize:1048576,parts:Array.from({length:Math.ceil(bytes/1048576)},(_,i)=>({bytes:Math.min(1048576,bytes-i*1048576)}))});
 return {root:geometry(base.rootSha256,3221225472),components:geometry(base.componentsSha256,805306368)};
}
async function validateExternal(node){
 const manifests=manifiestosCheckpointV15(),records=node.externalDisks;
 if(!Array.isArray(records)||records.length!==2||new Set(records.map(r=>r?.id)).size!==2)throw Error('Checkpoint sin sus dos discos');
 for(const id of ['root','components']){const record=records.find(r=>r.id===id);if(!record)throw Error('Disco de checkpoint incorrecto');await validarDiscoExterno(record,manifests[id]);}
}
// Otro nombre de guardado: no modifica ni convierte los registros anteriores.
export class SesionesCheckpointV15 extends SesionesClusterDebian{
 constructor(options={}){
  if(options.factoryVersion!=='v15'||options.workerComponents&&options.workerComponents!=='v7')throw Error('El checkpoint separado está limitado al candidato v15');
  super(options);this.key+='-external-disks-v1';this.format='s2ktux-kubernetes-external-cluster-v1';
 }
 async packNode(id,checkpoint,terminalText='',options={}){
  if(checkpoint?.format!=='s2ktux-external-disks-checkpoint-v1'||!checkpoint.state?.byteLength)throw Error('Checkpoint de máquina inválido');
  const node=await super.packNode(id,checkpoint.state,terminalText,options);
  node.format=FORMATO_NODO_CHECKPOINT;
  if(!Array.isArray(checkpoint.externalDisks))throw Error('Faltan discos del checkpoint');
  // Los Blob pueden llegar de un iframe. Conservar sus bytes en este realm.
  node.externalDisks=checkpoint.externalDisks.map(record=>({...record,parts:record.parts.map(part=>{Blob.prototype.slice.call(part.packed,0,0);return {...part,packed:new Blob([part.packed])};})}));
  await validateExternal(node);return node;
 }
 async validate(nodes){
  if(!Array.isArray(nodes)||!nodes.length)throw Error('Clúster de checkpoint vacío');
  const formats=new Set(nodes.map(node=>node?.format));if(formats.size!==1)throw Error('No mezclar formatos de estado');
  if(formats.has('s2ktux-v86-session-v1'))return super.validate(nodes);
  if(!formats.has(FORMATO_NODO_CHECKPOINT))throw Error('Formato de checkpoint desconocido');
  // Se mantienen las mismas comprobaciones de perfiles, CPU, tamaños y hashes.
  const cpuHash=await super.validate(nodes.map(node=>({...node,format:'s2ktux-v86-session-v1'})));
  for(const node of nodes)await validateExternal(node);
  return hashBytes(new TextEncoder().encode(JSON.stringify({format:this.format,cpuHash,disks:nodes.map(node=>({id:node.id,externalDisks:node.externalDisks.map(({id,sha256})=>({id,sha256}))}))})));
 }
}

// La entrada rápida tiene su propia clave y nunca sustituye una sesión.
export class BasesLimpiasCheckpointV15 extends BasesLimpias{
 constructor(revision,options){
  if(options?.factoryVersion!=='v15')throw Error('La caché de discos separados requiere su base propia');
  super(revision,{...options,compatibleRevisions:[]});
  this.format='s2ktux-kubernetes-external-cluster-v1';
  this.prefix='base-checkpoint-v15:'+this.level+':';this.key=this.prefix+revision;
 }
 packNode(...args){return SesionesCheckpointV15.prototype.packNode.apply(this,args);}
 validate(...args){return SesionesCheckpointV15.prototype.validate.apply(this,args);}
}
