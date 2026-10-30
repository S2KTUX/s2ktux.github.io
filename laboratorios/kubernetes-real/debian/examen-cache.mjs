import {BasesLimpiasCheckpointV15} from './sesiones-checkpoint.mjs?v=6d85bedd96a81e62';
// Revisión propia: los componentes del examen no sustituyen la base de estudio.
export const REVISION_EXAMEN='a374b800a490aebea96548a4540ca8e52135bd9f1012e836ac9350221cef3a19';
export class BasesLimpiasExamen extends BasesLimpiasCheckpointV15{
 constructor(revision=REVISION_EXAMEN,options={}){
  if(options.compatibleRevisions?.length)throw Error('El examen no migra bases de otra preparación');
  super(revision,{...options,factoryVersion:'v15',workerComponents:'v7',progressive:true,level:'avanzado',scenarioId:'cka-exam',compatibleRevisions:[]});
  this.prefix='base-examen-v1:';this.key=this.prefix+revision;
 }
 get expectedNodeCount(){return 2;}
 async validate(nodes){
  if(!Array.isArray(nodes)||nodes.length!==2||!nodes.some(n=>n.id==='controlplane')||!nodes.some(n=>n.id==='worker1'))throw Error('Nodos de la base del examen incorrectos');
  return super.validate(nodes);
 }
 async write(nodes){
  if(!Array.isArray(nodes)||nodes.length!==2||!nodes.some(n=>n.id==='controlplane')||!nodes.some(n=>n.id==='worker1'))throw Error('La base del examen requiere control plane y un worker');
  return super.write(nodes);
 }
}
