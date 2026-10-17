import {test,expect} from '@playwright/test';
test('Kubernetes preliminar · índice por fases y clases sin arrancar VMs',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/terminal.html');await page.locator('a[href="/laboratorios/kubernetes-real/"]').click();
 await expect(page).toHaveURL(/\/laboratorios\/kubernetes-real\/debian\/multinodo.html/);
 await expect(page.locator('#lab-entry')).toBeVisible();await expect(page.locator('#lab-loading')).toBeHidden();
 await expect(page.locator('.site-nav .navlink')).toHaveText(['Inicio','Cursos','Terminal','Proyectos']);
 await expect(page.locator('.mode-note').last()).toContainText('Versión preliminar');
 await expect(page.locator('[data-choose-stage]')).toHaveCount(3);await expect(page.locator('[data-class]')).toHaveCount(35);await expect(page.locator('#nodes iframe')).toHaveCount(0);
 await page.locator('[data-choose-stage=intermedio]').click();await expect(page.locator('#stage-body-intermedio [data-class]')).toHaveCount(17);
 await expect(page.locator('[data-class="19"]')).toBeDisabled();await expect(page.locator('[data-class="19"]')).toContainText('Próximamente');
 await page.locator('[data-class="7"]').click();await expect(page.locator('#entry-position')).toContainText('Clase 07');await expect(page.locator('#nodes iframe')).toHaveCount(0);
 await page.locator('[data-choose-stage=avanzado]').click();await expect(page.locator('#stage-body-avanzado [data-class]')).toHaveCount(11);
 await expect(page.locator('#enter-lab')).toBeDisabled();await expect(page.locator('#exam-pending')).toHaveText('Modo examen · Próximamente');expect(errors).toEqual([]);
});
test('Kubernetes preliminar · pendientes bloqueados también por enlace directo',async({page})=>{
 for(const [level,number] of [['intermedio',12],['intermedio',19],['avanzado',28],['avanzado',34]]){
  await page.goto('/laboratorios/kubernetes-real/debian/multinodo.html?mode=course&level='+level+'&clase='+number+'&enter=1&factory=v8&fast=1');
  await expect(page.locator('#lab-entry')).toBeVisible();await expect(page.locator('#entry-intro')).toContainText('Próximamente');
  await expect(page.locator('#enter-lab')).toBeDisabled();await expect(page.locator('#start-cluster')).toBeDisabled();
  await page.evaluate(async()=>{await document.querySelector('#enter-lab').onclick();await document.querySelector('#start-cluster').onclick();});
  await expect(page.locator('#nodes iframe')).toHaveCount(0);await expect(page.locator('#exercise-help')).toBeHidden();
  expect(await page.evaluate(()=>kubeDebianClusterProfile.factoryVersion)).toBe('v6');
  expect(await page.evaluate(()=>kubeDebianClusterProfile.progressive)).toBe(true);
 }
 await page.goto('/laboratorios/kubernetes-real/debian/multinodo.html');
 await expect(page.locator('#lab-entry')).toBeVisible();await expect(page.locator('[data-pending=true]')).toHaveCount(23);
 await expect(page.locator('#add-worker')).toBeHidden();await expect(page.locator('#nodes iframe')).toHaveCount(0);
});
test('Kubernetes preliminar · la clase seleccionada conserva la fase al entrar',async({page})=>{
 await page.addInitScript(()=>{const original=HTMLButtonElement.prototype.click;HTMLButtonElement.prototype.click=function(...args){if(this.id==='start-cluster'){globalThis.testStarts=(globalThis.testStarts||0)+1;return;}return original.apply(this,args);};});
 await page.goto('/laboratorios/kubernetes-real/');await expect(page.locator('#course-index')).toBeVisible();
 await page.locator('[data-class="2"]').click();await page.locator('#enter-lab').click();
 await expect(page.locator('#exercise-class-select')).toHaveValue('2');await expect(page.locator('#exercise-select option')).toHaveCount(2);
 await expect(page.locator('#mode-stamp')).toContainText('Etapa inicial');expect(await page.evaluate(()=>testStarts)).toBe(1);await expect(page.locator('#nodes iframe')).toHaveCount(0);
 await page.selectOption('#exercise-class-select','6');await expect(page.locator('#exercise-select option')).toHaveCount(2);
 await page.locator('#change-lab').click();await expect(page.locator('#entry-position')).toContainText('Clase 06');
 await page.locator('[data-choose-stage=intermedio]').click();await page.locator('[data-class="7"]').click();await page.locator('#enter-lab').click();
 await expect(page.locator('#exercise-class-select')).toHaveValue('7');await expect(page.locator('#exercise-select option')).toHaveCount(2);
 await expect(page.locator('#exercise-prompt')).toContainText('p07a');await expect(page.locator('#mode-stamp')).toContainText('Etapa intermedia');
 await page.selectOption('#exercise-class-select','11');await expect(page.locator('#exercise-select option')).toHaveCount(2);await expect(page.locator('#exercise-prompt')).toContainText('p11a');
});
test('Kubernetes preliminar · móvil y tema compartido @mobile',async({page})=>{
 await page.goto('/laboratorios/kubernetes-real/');await expect(page.locator('#lab-entry')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.locator('[data-theme-toggle]').click();await expect(page.locator('html')).toHaveClass(/dark/);
 await expect(page.locator('.site-nav a[href="/proyectos.html"]')).toBeVisible();
});
