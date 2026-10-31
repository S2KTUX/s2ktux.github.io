import {test,expect} from '@playwright/test';

test('examen · máquinas, reloj y marcas atómicos; rechaza corrupción y otra pestaña',async({page})=>{
 await page.goto('/sobre.html');
 const result=await page.evaluate(async()=>{
  const {SesionesExamen}=await import('/laboratorios/kubernetes-real/debian/sesiones-examen.mjs');
  const {nuevoIntento}=await import('/laboratorios/kubernetes-real/debian/examen-cka-motor.mjs');
  const {manifiestosCheckpointV15}=await import('/laboratorios/kubernetes-real/debian/sesiones-checkpoint.mjs');
  const {empaquetarDiscoExterno}=await import('/laboratorios/kubernetes-real/checkpoint-discos.mjs');
  const sessions=new SesionesExamen(),externalDisks=await Promise.all(Object.entries(manifiestosCheckpointV15()).map(async([id,m])=>({id,...await empaquetarDiscoExterno(m,[[]])})));
  const nodes=await Promise.all(['controlplane','worker1'].map((id,i)=>sessions.packNode(id,{format:'s2ktux-external-disks-checkpoint-v1',state:new Uint8Array([i+1,2,3]).buffer,externalDisks},'RESPUESTAS_DEL_ALUMNO')));
  const attempt=nuevoIntento(Date.now()-600000);attempt.marked=['01','05'];
  const metadata={attempt,question:4,results:null},first=await sessions.saveAttempt(nodes,metadata);
  const recovered=await new SesionesExamen().getCluster();
  const rejects=async fn=>{try{await fn();return false;}catch{return true;}};
  const wrongClock=structuredClone(metadata);wrongClock.attempt.endsAt+=60000;
  const badClock=await rejects(()=>sessions.saveAttempt(nodes,wrongClock,first.sha256));
  const updated=structuredClone(metadata);updated.question=5;
  const second=await sessions.saveAttempt(nodes,updated,first.sha256);
  const stale=await rejects(()=>sessions.saveAttempt(nodes,metadata,first.sha256));
  const corrupt=structuredClone(second);corrupt.metadata.question=0;
  const tampered=await rejects(()=>sessions.validateCluster(corrupt));
  return {metadata:JSON.stringify(recovered.metadata)===JSON.stringify(metadata),clock:recovered.metadata.attempt.endsAt===attempt.endsAt,nodes:recovered.nodes.length===2&&recovered.nodes.every(n=>n.terminalText==='RESPUESTAS_DEL_ALUMNO'),badClock,stale,tampered,stillCurrent:(await sessions.getCluster()).sha256===second.sha256,independent:sessions.key==='intento-cka-v1'};
 });
 expect(result).toEqual({metadata:true,clock:true,nodes:true,badClock:true,stale:true,tampered:true,stillCurrent:true,independent:true});
});

test('examen · reanudar conserva reloj y selección sin preparar preguntas otra vez',async({page})=>{
 const startedAt=Date.now()-600000;
 await page.route('**/sesiones-examen.mjs*',route=>route.fulfill({contentType:'text/javascript',body:`export class SesionesExamen{async getRawCluster(){return {metadata:{attempt:{startedAt:${startedAt}}}};}}`}));
 await page.route('**/examen-cka-motor.mjs*',async route=>{
  if(route.request().url().includes('qa-resume-logic=1'))return route.continue();
  await route.fulfill({contentType:'text/javascript',body:`export {nuevoIntento,informeCKA,corregirExamenCKA,CKA_CREDENTIAL_DIR} from './examen-cka-motor.mjs?qa-resume-logic=1';export async function prepararCredencialExamen(){}export async function prepararExamenCKA(){throw Error('No preparar respuestas al reanudar');}`});
 });
 await page.route('**/multinodo.mjs*',route=>route.fulfill({contentType:'text/javascript',body:`globalThis.kubeDebianClusterNodes=new Map([['controlplane',{window:{kubeDebianExamShortcuts:async()=>{}}}]]);globalThis.kubeDebianClusterErrors=[];globalThis.kubeDebianClusterReady=true;globalThis.kubeDebianClusterRecovered=true;globalThis.kubeDebianExamSavedMetadata={attempt:{format:'s2ktux-cka-attempt-v1',id:'saved',startedAt:${startedAt},endsAt:${startedAt+7200000},marked:['05'],finishedAt:null},question:4,results:null};globalThis.kubeDebianClusterSave=async()=>({savedAt:new Date().toISOString()});globalThis.kubeDebianExamOpenTerminals=()=>{};document.querySelector('#start-cluster').onclick=async()=>{};`}));
 await page.goto('/laboratorios/kubernetes-real/debian/examen.html');await expect(page.locator('#resume-exam')).toBeVisible();await page.locator('#resume-exam').click();
 await expect(page.locator('#exam-attempt')).toBeVisible();await expect(page.locator('#exam-question')).toHaveValue('4');await expect(page.locator('#exam-mark')).toBeChecked();
 expect(await page.evaluate(()=>ckaExam.attempt.startedAt)).toBe(startedAt);await expect(page.locator('#exam-clock')).toHaveText(/01:49:/);await expect(page.locator('#exam-error')).toBeEmpty();
});
