import {test,expect} from '@playwright/test';
test('examen · caché de dos nodos separada del estudio y sus guardados',async({page})=>{
 await page.goto('/sobre.html');
 const result=await page.evaluate(async()=>{
  const {BasesLimpiasExamen}=await import('/laboratorios/kubernetes-real/debian/examen-cache.mjs');
  const {BasesLimpiasCheckpointV15,SesionesCheckpointV15,manifiestosCheckpointV15}=await import('/laboratorios/kubernetes-real/debian/sesiones-checkpoint.mjs');
  const {empaquetarDiscoExterno}=await import('/laboratorios/kubernetes-real/checkpoint-discos.mjs');
  const options={factoryVersion:'v15',workerComponents:'v7',progressive:true,level:'avanzado'},exam=new BasesLimpiasExamen('e'.repeat(64));
  const disks=await Promise.all(Object.entries(manifiestosCheckpointV15()).map(async([id,m])=>({id,...await empaquetarDiscoExterno(m,[[]])})));
  const nodes=await Promise.all(['controlplane','worker1','worker2'].map((id,i)=>exam.packNode(id,{format:'s2ktux-external-disks-checkpoint-v1',state:new Uint8Array([i+1,2,3]).buffer,externalDisks:disks},'LIMPIA')));
  const study=new BasesLimpiasCheckpointV15('d'.repeat(64),options),student=new SesionesCheckpointV15(options);
  const oldStudy=await study.write(nodes),oldStudent=await student.saveNodes(nodes);await exam.write(nodes.slice(0,2));
  const rejects=async fn=>{try{await fn();return false;}catch{return true;}};
  return {two:(await exam.read()).nodes.length===2,separateKey:exam.key!==study.key,threeRejected:await rejects(()=>exam.write(nodes)),wrongWorkerRejected:await rejects(()=>exam.write([nodes[0],nodes[2]])),partialStudyRejected:await rejects(()=>study.write(nodes.slice(0,2))),studyPreserved:(await study.read()).sha256===oldStudy.sha256,studentPreserved:(await student.getCluster()).sha256===oldStudent.sha256};
 });
 expect(result).toEqual({two:true,separateKey:true,threeRejected:true,wrongWorkerRejected:true,partialStudyRejected:true,studyPreserved:true,studentPreserved:true});
});

test('examen · reutiliza únicamente la preparación publicada certificada',async({page})=>{
 await page.goto('/sobre.html');
 const result=await page.evaluate(async()=>{
  const {BasesLimpiasExamen,REVISION_EXAMEN,PREPARACIONES_EXAMEN_COMPATIBLES}=await import('/laboratorios/kubernetes-real/debian/examen-cache.mjs');
  const {manifiestosCheckpointV15}=await import('/laboratorios/kubernetes-real/debian/sesiones-checkpoint.mjs');
  const {empaquetarDiscoExterno}=await import('/laboratorios/kubernetes-real/checkpoint-discos.mjs');
  const previous=new BasesLimpiasExamen(PREPARACIONES_EXAMEN_COMPATIBLES[0]);
  const disks=await Promise.all(Object.entries(manifiestosCheckpointV15()).map(async([id,m])=>({id,...await empaquetarDiscoExterno(m,[[]])})));
  const nodes=await Promise.all(['controlplane','worker1'].map((id,i)=>previous.packNode(id,{format:'s2ktux-external-disks-checkpoint-v1',state:new Uint8Array([i+1,2,3]).buffer,externalDisks:disks},'')));
  const record=await previous.write(nodes),current=await new BasesLimpiasExamen().read();
  let arbitraryRejected=false;try{new BasesLimpiasExamen(REVISION_EXAMEN,{compatibleRevisions:['f'.repeat(64)]});}catch{arbitraryRejected=true;}
  return {same:current?.sha256===record.sha256,two:current?.nodes.length===2,arbitraryRejected};
 });
 expect(result).toEqual({same:true,two:true,arbitraryRejected:true});
});
