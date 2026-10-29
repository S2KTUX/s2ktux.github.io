import {test,expect} from '@playwright/test';
import {readFileSync} from 'node:fs';
// Solo política de interfaz. La topología HA real tiene su prueba nativa aparte.
test('HA · sesión fresca sin leer ni sobrescribir capturas antiguas',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/debian/ha-curso.mjs*',route=>route.fulfill({contentType:'text/javascript',body:`export const etcdHA='etcdctl';export const clienteHAQuery=()=>'';export async function prepararClusterHA({context}){if(!context.fresh||context.studentSession||context.nodeCount!==0)throw Error('No es una sesión nueva');globalThis.qaFreshHA=(globalThis.qaFreshHA||0)+1;return {uiOnly:true};}`}));
 const source=readFileSync(new URL('../../laboratorios/kubernetes-real/debian/sesiones-ha.mjs',import.meta.url),'utf8');
 await page.route('**/debian/sesiones-ha.mjs*',route=>route.fulfill({contentType:'text/javascript',body:source+`\nfor(const name of ['getRawCluster','saveNodes','resetCluster'])SesionesHA.prototype[name]=async function(){globalThis.qaHAPersistence=(globalThis.qaHAPersistence||0)+1;throw Error('No acceder a las capturas HA');};BasesLimpiasHA.prototype.read=async function(){globalThis.qaHAPersistence=(globalThis.qaHAPersistence||0)+1;throw Error('No leer caché HA');};`}));
 await page.goto('/laboratorios/kubernetes-real/debian/multinodo.html?mode=course&level=avanzado&clase=24&escenario=ha-cluster&enter=1');
 await expect(page.locator('#lab-workspace')).toBeVisible();await expect(page.locator('#start-cluster')).toBeEnabled();await expect(page.locator('#save-cluster')).toBeHidden();
 await page.evaluate(()=>document.querySelector('#start-cluster').onclick());
 expect(await page.evaluate(()=>qaFreshHA)).toBe(1);expect(await page.evaluate(()=>globalThis.qaHAPersistence||0)).toBe(0);
 await expect(page.locator('#lab-course-note')).toContainText('se prepara de nuevo');
 const error=await page.evaluate(async()=>{try{await kubeDebianClusterSave();return '';}catch(e){return e.message;}});expect(error).toContain('se prepara de nuevo');expect(error).toContain('HA');
 expect(await page.evaluate(()=>globalThis.qaHAPersistence||0)).toBe(0);expect(errors).toEqual([]);
});
