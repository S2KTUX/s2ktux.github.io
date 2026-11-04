import {BasesLimpiasCheckpointV15} from './sesiones-checkpoint.mjs?v=b978ec0f4145b839';
// Revisión propia: los componentes del examen no sustituyen la base de estudio.
export const REVISION_EXAMEN='df31c15c0d2c5dc4f728730eff161a67d146a3368553e97392ec3238d600f7ff';
// Bases verificadas antes de las preguntas. Los controladores se ajustan en
// una copia nueva antes del cronómetro, nunca al reanudar un intento guardado.
export const PREPARACIONES_EXAMEN_COMPATIBLES=Object.freeze(["46b7c7a66dd973f3ead819ac44f9856aa8b8f99201fdd7441ea67dc8e0189c22",'9a655a7152ba5ade114c1512b1bb7acb250482d0634754a26fd2be9fd506efa4','11dd0b5dfa8f6b946014fe9f8cd482d37f7d04cab76706cb507be87ee27eb3af','a374b800a490aebea96548a4540ca8e52135bd9f1012e836ac9350221cef3a19']);
export class BasesLimpiasExamen extends BasesLimpiasCheckpointV15{
 constructor(revision=REVISION_EXAMEN,options={}){
  if(options.compatibleRevisions?.length)throw Error('El examen no migra bases de otra preparación');
  super(revision,{...options,factoryVersion:'v15',workerComponents:'v7',progressive:true,level:'avanzado',scenarioId:'cka-exam',compatibleRevisions:revision===REVISION_EXAMEN?PREPARACIONES_EXAMEN_COMPATIBLES.filter(value=>value!==revision):[]});
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
