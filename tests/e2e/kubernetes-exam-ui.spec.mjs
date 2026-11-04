import {test,expect} from '@playwright/test';
import {fileURLToPath} from 'node:url';
for(const lang of ['es','en'])test('simulacro · interfaz '+lang+', finalizar vacío y móvil (sin VM)',async({page})=>{
 await page.setViewportSize({width:375,height:812});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/examen-cka-ui.mjs*',route=>route.fulfill({path:fileURLToPath(new URL('../../laboratorios/kubernetes-real/debian/examen-cka-ui.mjs',import.meta.url)),contentType:'text/javascript'}));
 await page.route('**/examen-cka-motor.mjs*',async route=>{
  if(route.request().url().includes('qa-ui-logic=1'))return route.continue();
  await route.fulfill({contentType:'text/javascript',body:"export {nuevoIntento,informeCKA,corregirExamenCKA,CKA_CREDENTIAL_DIR} from './examen-cka-motor.mjs?qa-ui-logic=1'; export async function prepararExamenCKA(){} export async function prepararCredencialExamen(){}"});
 });
 await page.route('**/multinodo.mjs*',route=>route.fulfill({contentType:'text/javascript',body:`globalThis.kubeDebianClusterNodes=new Map([['controlplane',{window:{kubeDebianExamShortcuts:async()=>{}}}]]);globalThis.kubeDebianClusterErrors=[];globalThis.kubeDebianClusterReady=true;globalThis.kubeDebianClusterCheck=async(node,label)=>({ok:label==='Comprobar disponibilidad del clúster'});globalThis.kubeDebianExamOpenTerminals=()=>{};document.querySelector('#start-cluster').onclick=async()=>{};`}));
 await page.addInitScript(()=>{globalThis.kubeDebianClusterSave=async()=>{document.querySelector('#cluster-status').textContent='Clúster guardado.';await new Promise(resolve=>setTimeout(resolve,20));return {savedAt:new Date().toISOString()};};});
 await page.goto('/laboratorios/kubernetes-real/debian/examen.html?lang='+lang);await page.locator('#begin-exam').click();await page.waitForFunction(()=>globalThis.ckaExam?.attempt);
 await expect(page.locator('#exam-results')).toBeHidden();await expect(page.locator('#exam-attempt pre')).toHaveCount(0);await page.locator('#exam-mark').check();await expect(page.locator('#exam-question option').first()).toContainText('★');
 await page.locator('#finish-exam').click();await expect(page.locator('#exam-results')).toBeVisible();await expect(page.locator('#exam-results')).toContainText('0/100');await expect(page.locator('#exam-results table tr')).toHaveCount(5);await expect(page.locator('#exam-results details details')).toHaveCount(12);
 await expect(page.locator('#cluster-status')).toHaveText(lang==='es'?'Evaluación finalizada.':'Assessment complete.');await expect(page.locator('#save-exam')).toBeEnabled();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
});
