import {test,expect} from '@playwright/test';
const root='/laboratorios/kubernetes-real/';
async function mockBoot(page){await page.addInitScript(()=>{const original=HTMLButtonElement.prototype.click;HTMLButtonElement.prototype.click=function(...args){if(this.id==='start-cluster'){globalThis.testStarts=(globalThis.testStarts||0)+1;return;}return original.apply(this,args);};});}
test('Kubernetes · primero modo y después exactamente tres laboratorios',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/terminal.html');await page.locator('a[href="'+root+'"]').click();
 await expect(page.locator('#lab-entry')).toBeVisible();await expect(page.locator('#lab-loading')).toBeHidden();
 await expect(page.locator('.site-nav .navlink')).toHaveText(['Inicio','Cursos','Terminal','Proyectos']);
 await expect(page.locator('#practice-configuration')).toBeHidden();await expect(page.locator('#exam-configuration')).toBeHidden();
 await page.locator('#mode-practice').click();await expect(page.locator('#practice-configuration')).toBeVisible();
 await expect(page.locator('[data-choose-stage]')).toHaveCount(3);await expect(page.locator('[data-class]')).toHaveCount(0);
 await expect(page.locator('#entry-position')).toContainText('Clases 00–06');await expect(page.locator('#entry-intro')).toContainText('14 preguntas');
 await page.locator('[data-choose-stage=intermedio]').click();await expect(page.locator('#entry-position')).toContainText('Clases 07–23');
 await expect(page.locator('#entry-intro')).toContainText('10 preguntas');await expect(page.locator('#enter-lab')).toHaveText('Abrir laboratorio intermedio');
 await expect(page.locator('#entry-class-list [data-lesson]')).toHaveCount(17);
 await page.locator('[data-choose-stage=avanzado]').click();await expect(page.locator('#entry-class-list [data-lesson]')).toHaveCount(11);
 await expect(page.locator('#enter-lab')).toBeDisabled();await expect(page.locator('#entry-intro')).toContainText('Próximamente');
 await expect(page.locator('#nodes iframe')).toHaveCount(0);expect(errors).toEqual([]);
});
test('Kubernetes · clases y preguntas comparten el laboratorio sin volver a arrancarlo',async({page})=>{
 await mockBoot(page);await page.goto(root);await page.locator('#mode-practice').click();await page.locator('#enter-lab').click();
 await expect(page.locator('#exercise-class-select')).toHaveValue('0');await expect(page.locator('#exercise-class-select option')).toHaveCount(7);
 await expect(page.locator('#mode-stamp')).toContainText('Modo práctica · Inicial');
 for(const number of ['1','2','3','4','5','6']){
  await page.selectOption('#exercise-class-select',number);await expect(page.locator('#exercise-select option')).toHaveCount(2);
  await page.selectOption('#exercise-select','1');await expect(page.locator('#exercise-count')).toHaveText('Práctica 2 / 2');expect(await page.evaluate(()=>testStarts)).toBe(1);
 }
 await page.locator('#change-lab').click();await expect(page.locator('#entry-position')).toContainText('Laboratorio inicial');
 await page.locator('[data-choose-stage=intermedio]').click();await page.locator('#enter-lab').click();
 await expect(page.locator('#exercise-class-select')).toHaveValue('7');await expect(page.locator('#exercise-class-select option')).toHaveCount(17);
 await expect(page.locator('#mode-stamp')).toContainText('Modo práctica · Intermedio');
 for(const number of ['8','9','10','11']){await page.selectOption('#exercise-class-select',number);await expect(page.locator('#exercise-select option')).toHaveCount(2);}
 expect(await page.evaluate(()=>testStarts)).toBe(1);await expect(page.locator('#exercise-class-select option[value="12"]')).toBeDisabled();await expect(page.locator('#add-worker')).toBeHidden();
});
test('Kubernetes · pendientes bloqueados incluso por enlaces y acciones directas',async({page})=>{
 for(const [level,number] of [['intermedio',12],['intermedio',19],['avanzado',28],['avanzado',34]]){
  await page.goto(root+'debian/multinodo.html?mode=course&level='+level+'&clase='+number+'&enter=1&factory=v8&fast=1');
  await expect(page.locator('#lab-entry')).toBeVisible();await expect(page.locator('#entry-intro')).toContainText('Próximamente');
  await expect(page.locator('#enter-lab')).toBeDisabled();await expect(page.locator('#start-cluster')).toBeDisabled();
  await page.evaluate(async()=>{await document.querySelector('#enter-lab').onclick();await document.querySelector('#start-cluster').onclick();});
  await expect(page.locator('#nodes iframe')).toHaveCount(0);await expect(page.locator('#exercise-help')).toBeHidden();expect(await page.evaluate(()=>kubeDebianClusterProfile.factoryVersion)).toBe('v6');
 }
});
test('Kubernetes · examen separado, español e inglés y sin un intento ficticio',async({page})=>{
 await page.goto(root);await page.locator('#mode-exam').click();await expect(page.locator('#practice-configuration')).toBeHidden();
 await expect(page.locator('#exam-configuration')).toBeVisible();await expect(page.locator('#start-exam')).toBeDisabled();await expect(page.locator('#exam-language-note')).toContainText('no es un idioma oficial');
 await page.selectOption('#exam-language','en');await expect(page.locator('#exam-heading')).toHaveText('CKA mock exam');await expect(page.locator('#exam-pending')).toContainText('Coming soon');
 await expect(page.locator('#exam-configuration')).toHaveAttribute('lang','en');await page.selectOption('#exam-language','es');await expect(page.locator('#exam-heading')).toHaveText('Simulacro CKA');
 await page.evaluate(async()=>{await document.querySelector('#start-cluster').onclick();await document.querySelector('#enter-lab').onclick();});await expect(page.locator('#nodes iframe')).toHaveCount(0);
 await page.goto(root+'debian/multinodo.html?mode=course&level=inicial&view=exam&enter=1');
 await expect(page.locator('#exam-configuration')).toBeVisible();await expect(page.locator('#lab-workspace')).toBeHidden();await expect(page.locator('#nodes iframe')).toHaveCount(0);
});
test('Kubernetes · consultar clases y modos conserva la sesión existente',async({page})=>{
 await page.goto(root+'debian/multinodo.html?level=inicial&view=practice');await page.locator('#lab-entry').waitFor();
 await page.evaluate(async()=>{
  const {montarInterfazNiveles}=await import('/laboratorios/kubernetes-real/debian/interfaz-niveles.mjs');
  globalThis.mockState={busy:false,initialized:true,nodeCount:1,nodes:[]};globalThis.boots=0;globalThis.stops=0;
  montarInterfazNiveles({level:'inicial',getState:()=>mockState,run:async()=>({ok:true}),setBusy:value=>mockState.busy=value,start:()=>boots++,save:async()=>{},stop:async()=>stops++});
 });
 await page.locator('#enter-lab').click();await page.selectOption('#exercise-class-select','5');await page.locator('#change-lab').click();
 await page.locator('#mode-exam').click();await page.locator('#mode-practice').click();await page.locator('#enter-lab').click();
 await expect(page.locator('#exercise-class-select')).toHaveValue('5');expect(await page.evaluate(()=>({boots,stops}))).toEqual({boots:0,stops:0});
});
test('Kubernetes · móvil conserva cabecera, modos y dificultades @mobile',async({page})=>{
 await page.goto(root);await page.locator('#lab-entry').waitFor();await page.locator('#mode-practice').click();await page.locator('[data-choose-stage=intermedio]').click();
 await page.locator('#entry-class-outline summary').click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.locator('#mode-exam').click();await page.selectOption('#exam-language','en');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.locator('[data-theme-toggle]').click();await expect(page.locator('html')).toHaveClass(/dark/);await expect(page.locator('.site-nav a[href="/proyectos.html"]')).toBeVisible();
});
