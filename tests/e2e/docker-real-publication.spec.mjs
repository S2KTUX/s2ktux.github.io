import {test,expect} from '@playwright/test';
import {adaptLegacyPracticeSelection} from './legacy-practice-selection.mjs';
test.beforeEach(async({page})=>{await adaptLegacyPracticeSelection(page);});
test('Docker real · entrada principal y prácticas sin soluciones visibles',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/terminal.html');await page.locator('[data-pick-mode="docker"]').click();await expect(page).toHaveURL(/\/laboratorios\/docker-real\/$/);
 await expect(page.locator('#start')).toBeVisible();await expect(page.locator('#save')).toBeDisabled();await expect(page.locator('#exercise option')).toHaveCount(1);await page.selectOption('#exercise','web');await expect(page.locator('#exercise-title')).toHaveText('Publicar una aplicación · I');await expect(page.locator('#solution')).toBeHidden();await page.click('#solution-toggle');await expect(page.locator('#solution')).toContainText('s2ktux/nginx-lab:2');expect(errors).toEqual([]);
});

test('Docker real · nuevas prácticas por clase, solución aparte y sin cambiar el diseño',async({page})=>{
 await page.goto('/laboratorios/docker-real/');
 await expect(page.locator('#exercise-class option')).toHaveCount(4);
 for(const [id,title] of [['entorno','Variables de entorno · II'],['registro','Registro local · II'],['salud','Healthcheck · II']]){
  await page.selectOption('#exercise',id);await expect(page.locator('#exercise-title')).toHaveText(title);
  await expect(page.locator('#solution')).toBeHidden();await expect(page.locator('#check')).toBeVisible();
  await page.click('#solution-toggle');await expect(page.locator('#solution')).toBeVisible();
 }
 await page.selectOption('#exercise-class','free');await expect(page.locator('#exercise-card')).toBeHidden();await expect(page.locator('#exercise-actions')).toBeHidden();
});
test('Docker real · tema compartido y móvil sin desbordamiento @mobile',async({page})=>{
 await page.goto('/laboratorios/docker-real/');await page.locator('[data-theme-toggle]').click();await expect(page.locator('html')).toHaveClass(/dark/);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

for(const path of ['/laboratorios/docker-real/','/laboratorios/docker-real/informacion.html']){
 test(`Docker real · colores reales de la web en ambos temas ${path}`,async({page})=>{
  const palette=()=>({background:getComputedStyle(document.body).backgroundColor,text:getComputedStyle(document.body).color,header:getComputedStyle(document.querySelector('.site-header')).backgroundColor,border:getComputedStyle(document.querySelector('.site-header')).borderBottomColor,logo:getComputedStyle(document.querySelector('.site-logo')).color});
  await page.goto('/');
  const light=await page.evaluate(palette);
  await page.locator('[data-theme-toggle]').click();
  await expect(page.locator('body')).toHaveCSS('background-color','rgb(30, 24, 17)');
  const dark=await page.evaluate(palette);
  await page.goto(path);
  await expect(page.locator('body')).toHaveCSS('background-color',dark.background);
  expect(await page.evaluate(palette)).toEqual(dark);
  await page.locator('[data-theme-toggle]').click();
  await expect(page.locator('body')).toHaveCSS('background-color',light.background);
  expect(await page.evaluate(palette)).toEqual(light);
  await expect(page.locator('.site-logo')).toHaveCSS('text-decoration-line','none');
  await expect(page.locator('body')).toHaveCSS('margin','0px');
 });
 test(`Docker real · navegación completa ${path}`,async({page})=>{
  await page.goto(path);
  await expect(page.locator('.site-nav .navlink')).toHaveText(['Inicio','Cursos','Terminal','Proyectos']);
  await expect(page.locator('.site-nav [aria-current="page"]')).toHaveText('Terminal');
  await expect(page.locator('.site-nav a[href="/proyectos.html"]')).toBeVisible();
  await page.locator('[data-theme-toggle]').click();await expect(page.locator('html')).toHaveClass(/dark/);
  await page.locator('.site-nav a[href="/proyectos.html"]').click();await expect(page).toHaveURL(/\/proyectos.html$/);
 });
 test(`Docker real · encabezado sin desbordamiento ${path} @mobile`,async({page})=>{
  await page.goto(path);await expect(page.locator('.site-nav a[href="/proyectos.html"]')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 });
}
test('Docker real · notas breves sin bloque de explicación técnica',async({page})=>{
 await page.goto('/laboratorios/docker-real/');
 await expect(page.locator('.lab-information p')).toHaveCount(5);
 await expect(page.locator('main a[href="informacion.html"]')).toHaveCount(0);
 await expect(page.locator('.lab-information')).not.toContainText('Alpine');
 await expect(page.locator('.lab-information')).not.toContainText('puente público');
 expect(await page.locator('.lab-information').evaluate(e=>getComputedStyle(e).fontSize)).toBe('12px');
 await page.goto('/laboratorios/docker-real/informacion.html');
 await expect(page.locator('h1')).toHaveText('Software del laboratorio');
 expect((await page.locator('main').innerText()).length).toBeLessThan(550);
 await expect(page.locator('a[href*="fuentes-docker-real-2026-10-11.tar.gz"]')).toHaveCount(1);
});
