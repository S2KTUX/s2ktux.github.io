import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
const availability=readFileSync(new URL('../../laboratorios/kubernetes-real/debian/disponibilidad-curso.mjs',import.meta.url),'utf8');
// UI-only candidate gate. No VM/API responses are mocked or claimed here.
async function mount(page,{scenarioId=null,saveFails=false,classNumber=28}={}){
 const errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
 await page.route('**/debian/disponibilidad-curso.mjs*',route=>route.fulfill({contentType:'text/javascript',body:availability.replace('avanzadoPublicado=false','avanzadoPublicado=true')}));
 await page.goto('/laboratorios/kubernetes-real/debian/multinodo.html?mode=course&level=avanzado&clase='+classNumber+'&factory=v13&enter=1'+(scenarioId?'&escenario='+scenarioId:''));
 await page.waitForFunction(()=>globalThis.kubeDebianClusterProfile||!document.querySelector('#lab-retry').hidden);
 expect(await page.evaluate(()=>!!globalThis.kubeDebianClusterProfile),errors.join('\n')).toBe(true);
 await page.evaluate(async({scenarioId,saveFails})=>{
  const {montarInterfazNiveles}=await import('/laboratorios/kubernetes-real/debian/interfaz-niveles.mjs');
  globalThis.qaSceneEvents=[];
  const state={busy:false,initialized:true,canSave:scenarioId!=='ha-cluster',level:'avanzado',factoryVersion:['montaje-cluster','ha-cluster'].includes(scenarioId)?'v14':'v13',nodeCount:3,scenarioId,scenarioIndependent:!!scenarioId,nodes:[]};
  montarInterfazNiveles({level:'avanzado',getState:()=>state,setBusy:value=>state.busy=value,
   run:async()=>{qaSceneEvents.push('run');return{ok:true};},
   save:async()=>{qaSceneEvents.push('save');if(saveFails)throw Error('Sin espacio de guardado');},
   stop:async()=>{qaSceneEvents.push('stop');},navigate:href=>qaSceneEvents.push({navigate:href})});
 },{scenarioId,saveFails});
 await page.locator('#enter-lab').click();
 if(!scenarioId)await page.selectOption('#exercise-select','1');
}
test('Escenarios · cancelar no guarda, detiene ni prepara una avería en la sesión de estudio',async({page})=>{
 await mount(page);await page.locator('#exercise-prepare').click();
 await expect(page.locator('#switch-level-dialog')).toBeVisible();
 await expect(page.locator('#switch-level-description')).toContainText('copia independiente');
 await page.locator('[data-switch-action=cancel]').click();
 expect(await page.evaluate(()=>qaSceneEvents)).toEqual([]);
});

test('Montaje · preparar solicita otra copia sin resetear estudio',async({page})=>{
 await mount(page,{classNumber:25});await page.locator('#exercise-prepare').click();
 await expect(page.locator('#switch-level-dialog')).toBeVisible();await page.locator('[data-switch-action=discard]').click();
 await expect.poll(()=>page.evaluate(()=>qaSceneEvents.length)).toBe(2);
 const events=await page.evaluate(()=>qaSceneEvents),url=new URL(events[1].navigate);expect(events[0]).toBe('stop');
 expect(url.searchParams.get('escenario')).toBe('montaje-cluster');expect(url.searchParams.get('factory')).toBe('v14');expect(events.includes('run')).toBe(false);
});
for(const mobile of [false,true])test('HA · selecciona su práctica, muestra tres control planes y conserva la salida a estudio'+(mobile?' @mobile':''),async({page})=>{
 await mount(page,{scenarioId:'ha-cluster',classNumber:24});
 await expect(page.locator('#exercise-title')).toHaveText('Alta disponibilidad · II');
 await expect(page.locator('#lab-course-note')).toContainText('Tres control planes');
 await expect(page.locator('#lab-course-note')).not.toContainText('workers');
 await expect(page.locator('#exercise-select')).toBeDisabled();
 await expect(page.locator('#return-study')).toBeVisible();
 await page.locator('#return-study').click();await expect(page.locator('[data-switch-action=save]')).toBeDisabled();await page.locator('[data-switch-action=cancel]').click();
 expect(await page.evaluate(()=>qaSceneEvents)).toEqual([]);
});
test('HA · las identidades y la caché limpia no se confunden con estudio ni con su sesión',async({page})=>{
 await page.goto('/laboratorios/kubernetes-real/debian/multinodo.html');
 const result=await page.evaluate(async()=>{
  const {SesionesHA,BasesLimpiasHA}=await import('/laboratorios/kubernetes-real/debian/sesiones-ha.mjs');
  const {SesionesClusterDebian,identidadNodoDebian}=await import('/laboratorios/kubernetes-real/debian/sesiones-cluster.mjs');
  const {identidadNodoHA,perfilNodoHA}=await import('/laboratorios/kubernetes-real/debian/perfil-ha.mjs');
  const ha=new SesionesHA(),clean=new BasesLimpiasHA('a'.repeat(64)),study=new SesionesClusterDebian({factoryVersion:'v14',workerComponents:'v7',level:'avanzado',progressive:true});
  const node=await ha.packNode('controlplane',new Uint8Array([1,2,3]).buffer),other=await ha.packNode('worker1',new Uint8Array([4,5,6]).buffer),last=await ha.packNode('worker2',new Uint8Array([7,8,9]).buffer);
  await ha.validate([node,other,last]);let rejects=0;
  for(const nodes of [[node,other],[{...node,profile:perfilNodoHA('worker1')},other,last],[node,other,{...last,packed:new Blob([new Uint8Array([99])])}]])try{await ha.validate(nodes);}catch{rejects++;}
  return {keys:[ha.key,clean.key,study.key],identities:[await identidadNodoHA('controlplane'),await identidadNodoHA('worker1'),await identidadNodoDebian('controlplane',{factoryVersion:'v14'})],rejects};
 });
 expect(new Set(result.keys).size).toBe(3);expect(new Set(result.identities).size).toBe(3);expect(result.rejects).toBe(3);
});

for(const mobile of [false,true])test('Montaje · las clases25/26 comparten copia y no ofrecen otras preguntas'+(mobile?' @mobile':''),async({page})=>{
 await mount(page,{scenarioId:'montaje-cluster',classNumber:25});
 await expect(page.locator('#exercise-class-select')).toBeEnabled();await expect(page.locator('#exercise-prepare')).toBeVisible();
 await page.selectOption('#exercise-class-select','26');await expect(page.locator('#exercise-title')).toHaveText('Incorporar el primer worker · I');
 await expect(page.locator('#exercise-class-select option[value="28"]')).toBeDisabled();await expect(page.locator('#exercise-class-select option[value="exam"]')).toBeDisabled();
 expect(await page.evaluate(()=>qaSceneEvents)).toEqual([]);
});
test('Escenarios · guardar termina antes de detener y entrar en la copia',async({page})=>{
 await mount(page);await page.locator('#exercise-prepare').click();await page.locator('[data-switch-action=save]').click();
 await expect.poll(()=>page.evaluate(()=>qaSceneEvents.length)).toBe(3);
 const events=await page.evaluate(()=>qaSceneEvents);expect(events.slice(0,2)).toEqual(['save','stop']);
 expect(new URL(events[2].navigate).searchParams.get('escenario')).toBe('c28-b');
});
test('Escenarios · si falla guardar no se detiene ni se cambia de sesión',async({page})=>{
 await mount(page,{saveFails:true});await page.locator('#exercise-prepare').click();await page.locator('[data-switch-action=save]').click();
 await expect(page.locator('#switch-level-error')).toContainText('Sin espacio');
 await expect(page.locator('#switch-level-error')).toBeVisible();
 expect(await page.evaluate(()=>qaSceneEvents)).toEqual(['save']);
 await page.locator('[data-switch-action=cancel]').click();
});
test('Escenarios · selecciona su ejercicio y permite volver al guardado de estudio',async({page})=>{
 await mount(page,{scenarioId:'c28-b'});
 await expect(page.locator('#exercise-title')).toContainText('Restaurar etcd');
 await expect(page.locator('#exercise-class-select')).toBeDisabled();await expect(page.locator('#exercise-select')).toBeDisabled();
 await expect(page.locator('#mode-stamp')).toContainText('Copia independiente');
 await page.locator('#return-study').click();await page.locator('[data-switch-action=discard]').click();
 await expect.poll(()=>page.evaluate(()=>qaSceneEvents.length)).toBe(2);
 const events=await page.evaluate(()=>qaSceneEvents);expect(events[0]).toBe('stop');
 expect(new URL(events[1].navigate).searchParams.has('escenario')).toBe(false);
});
