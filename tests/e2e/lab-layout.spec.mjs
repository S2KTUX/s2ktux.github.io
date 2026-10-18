import {test,expect} from '@playwright/test';
const cases=[['Linux','/laboratorios/linux-real/v86-test.html','#exercise-select','archivo','[data-exercise-solution]','#exercise-solution'],['Docker','/laboratorios/docker-real/','#exercise','web','#solution-toggle','#solution'],['Kubernetes','/laboratorios/kubernetes-real/','#exercise-select','0','#exercise-solution-toggle','#exercise-solution']];
async function enter(page,name,path){await page.goto(path);if(name==='Kubernetes'){await page.locator('#mode-practice').click();await page.locator('#enter-lab').click();await expect(page.locator('#nodes iframe')).toHaveCount(0);}}
for(const [name,path,select,value,toggle,solution]of cases){
 test(name+' · estructura común y soluciones compactas sin iniciar máquina',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.addInitScript(()=>Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async text=>{globalThis.copiedLabText=text;}}}));
  await enter(page,name,path);await page.selectOption(select,value);
  await expect(page.locator('.lab-practice-actions button')).toHaveText(['Comprobar ejercicio','Ver solución']);
  await expect(page.locator('.lab-practice-actions button').first()).toBeDisabled();
  const main=await page.locator('.lab-machine-actions button:visible').allTextContents();expect(main).toEqual(['Iniciar laboratorio','Guardar sesión','Reset']);
  await expect(page.locator('.lab-practices')).not.toContainText('¿Qué quieres practicar?');
  const order=await page.evaluate(()=>{const nodes=['.lab-practices','.lab-machine-actions','.console'];return nodes.map(s=>document.querySelector(s).getBoundingClientRect().top);});expect(order[0]).toBeLessThan(order[1]);expect(order[1]).toBeLessThan(order[2]);
  await page.locator(toggle).click();
  await expect(page.locator(solution+' > pre')).toHaveCount(1);await expect(page.locator(solution+' button')).toHaveCount(0);
  await expect(page.locator(solution)).toContainText('# Solución 1');await expect(page.locator(solution)).toContainText('# Solución 2');
  expect(await page.evaluate(()=>!!globalThis.vm||!!globalThis.dockerVM||!!globalThis.kubeDebianClusterNodes?.size)).toBe(false);expect(errors).toEqual([]);
 });
}
test('Kubernetes · se consultan prácticas y soluciones mientras arranca',async({page})=>{
 await page.goto('/laboratorios/kubernetes-real/');await page.locator('#lab-entry').waitFor();
 await page.evaluate(async()=>{const {montarInterfazNiveles}=await import('/laboratorios/kubernetes-real/debian/interfaz-niveles.mjs');globalThis.uiState={busy:true,initialized:false,nodeCount:0,nodes:[]};globalThis.ui=montarInterfazNiveles({level:'inicial',getState:()=>uiState,run:async()=>{throw Error('No debe ejecutarse');},setBusy:()=>{},save:async()=>{},stop:async()=>{}});uiState.busy=false;ui.update();});
 await page.locator('#mode-practice').click();await page.locator('#enter-lab').click();await page.evaluate(()=>{uiState.busy=true;ui.update();});
 await expect(page.locator('#start-cluster')).toBeDisabled();await expect(page.locator('#exercise-check')).toBeDisabled();
 await page.selectOption('#exercise-class-select','5');await page.selectOption('#exercise-select','1');await page.locator('#exercise-solution-toggle').click();await expect(page.locator('#exercise-help')).toBeVisible();await expect(page.locator('#exercise-title')).not.toBeEmpty();await expect(page.locator('#nodes iframe')).toHaveCount(0);
});
test('Laboratorios · móvil sin desbordamiento @mobile',async({page})=>{for(const [name,path,select,value,toggle]of cases){await enter(page,name,path);await page.selectOption(select,value);await page.locator(toggle).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}});
