import {test,expect} from '@playwright/test';

test('Licencias Linux · documento sencillo sin el diseño del prototipo',async({page})=>{
 await page.goto('/sobre.html');await page.locator('#licencias summary').click();
 await page.locator('a[href="laboratorios/linux-real/licencias/LEEME.html"]').click();
 await expect(page.locator('h1')).toHaveText('Procedencia del laboratorio');
 await expect(page.locator('link[rel=stylesheet],style,script')).toHaveCount(0);
 await expect(page.locator('body')).toHaveCSS('color','rgb(0, 0, 0)');
 await expect(page.locator('body')).toContainText('/usr/share/common-licenses');
 await expect(page.getByRole('link',{name:'Versión Markdown'})).toHaveAttribute('href','LEEME.md');
});
test('Sobre · pendientes y versiones discretos, licencias y descarga',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('/sobre.html');
 await expect(page.locator('h1')).toHaveText('Sobre S2KTUX');await expect(page.locator('#pendientes')).not.toHaveAttribute('open','');
 await page.locator('#pendientes summary').click();await expect(page.locator('#pendientes')).toContainText('LPIC-1');await expect(page.locator('#pendientes')).toContainText('Helm y Gateway API');
 const response=await page.request.get('/contenido/pendientes.md');expect(response.ok()).toBe(true);expect(await response.text()).toContain('dos horas');
 await page.locator('#versiones summary').click();await expect(page.locator('#versiones')).toContainText('v1.0');await expect(page.locator('#versiones')).not.toContainText('v1.1');await expect(page.locator('#versiones')).not.toContainText('v1.2');
 const dates=await page.locator('.about-version time').evaluateAll(nodes=>nodes.map(node=>node.dateTime));expect(new Set(dates).size).toBe(dates.length);
 await page.locator('#licencias summary').click();await expect(page.locator('#licencias')).toContainText('MIT');await expect(page.locator('#licencias')).toContainText('CC BY-NC-SA');expect(errors).toEqual([]);
});

test('Versiones · los enlaces antiguos llevan a las notas agrupadas del mismo día',async({page})=>{
 await page.goto('/versiones/2.8.html');await expect(page).toHaveURL(/\/versiones\/2026-10-22\.html$/);
 await expect(page.locator('h1')).toHaveText('Versión 2.2');
 await expect(page.locator('.site-nav').getByRole('link',{name:'Proyectos',exact:true})).toBeVisible();
});

test('Versiones · un número reutilizado no cambia el destino del enlace antiguo',async({page})=>{
 await page.goto('/versiones/2.3.html');await expect(page).toHaveURL(/\/versiones\/2026-10-21\.html$/);
 await expect(page.locator('h1')).toHaveText('Versión 2.1');
 await page.goto('/sobre.html');await page.locator('#versiones summary').click();
 const current=page.locator('#version-2\\.3');await expect(current.locator('h3')).toContainText('v2.3');
 await current.getByRole('link').click();await expect(page).toHaveURL(/\/versiones\/2026-10-24\.html$/);
 await expect(page.locator('h1')).toHaveText('Versión 2.3');
});

test('Versiones · una frase y enlace a las notas con el mismo diseño',async({page},testInfo)=>{
 await page.goto('/sobre.html');await page.locator('#versiones summary').click();
 const version=page.locator('.about-version').first();
 await expect(version.locator('p')).toHaveCount(1);
 const versionNumber=(await version.locator('h3').innerText()).match(/v(\d+\.\d+)/)[1];
 const date=await version.locator('time').getAttribute('datetime');
 await version.scrollIntoViewIfNeeded();
 await page.screenshot({path:testInfo.outputPath('historial-resumido.png')});
 await version.getByRole('link',{name:'Notas completas de la nueva versión de la página'}).click();
 await expect(page).toHaveURL(new RegExp(`/versiones/${date}.html$`));
 await expect(page.locator('h1')).toHaveText('Versión '+versionNumber);
 await expect(page.locator('.site-nav').getByRole('link',{name:'Proyectos',exact:true})).toHaveAttribute('href','../proyectos.html');
 await expect(page.locator('.about-release p')).not.toHaveCount(1);
 await expect(page.locator('body')).toHaveCSS('background-color','rgb(246, 236, 217)');
 await page.screenshot({path:testInfo.outputPath('notas-completas.png')});
 await page.getByRole('link',{name:'← Volver al historial'}).click();
 await expect(page).toHaveURL(new RegExp(`/sobre.html#version-${versionNumber.replace('.','\\.')}$`));
});

test('Versiones · notas completas legibles en móvil @mobile',async({page})=>{
 await page.goto('/sobre.html');await page.locator('#versiones summary').click();
 await page.locator('.about-version').first().getByRole('link').click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await expect(page.locator('h1')).toBeVisible();
});
test('Linux · archivo de repositorio legible y separación en las soluciones',async({page})=>{
 await page.goto('/laboratorios/linux-real/');await expect(page.locator('#start')).toBeEnabled();await page.selectOption('#exercise-select-class','2');await page.locator('[data-exercise-solution]').click();
 const solution=page.locator('#exercise-solution');await expect(solution).toContainText('# Solución 1\n\n');await expect(solution.locator('pre')).toHaveCount(1);await expect(solution).not.toContainText('# Solución 2');await expect(solution).not.toContainText('printf');
 await expect(solution.locator('.lab-file-content')).toContainText('[curso-base]\nname=Curso RPM local');
 await page.selectOption('#exercise-select-class','5');await page.selectOption('#exercise-select','fstab-i');await expect(page.getByRole('button',{name:'Preparar ejercicio',exact:true})).toBeHidden();
});
test('Linux · preparar dos ejercicios seguidos libera el panel',async({page})=>{
 await page.goto('/sobre.html');await page.setContent('<main><section id="panel"><select id="qa"></select><article data-exercise-card><h2 data-exercise-title></h2><p data-exercise-goal></p><p data-exercise-note></p><div><button data-exercise-check>Comprobar</button><button data-exercise-solution>Solución</button></div><div data-exercise-solution-body></div><div data-exercise-feedback></div></article></section></main>');
 await page.evaluate(async()=>{const {mountExercisePanel}=await import('/laboratorios/linux-real/v86-exercise-panel.mjs');globalThis.preparations=0;globalThis.qaPanel=mountExercisePanel(document.querySelector('#panel'),async()=>{qaPanel.setEnabled(false);await new Promise(resolve=>setTimeout(resolve,30));qaPanel.setEnabled(true);preparations++;return{ok:true,results:[]};});qaPanel.setEnabled(true);});
 await page.selectOption('#qa-class','6');await page.selectOption('#qa','nfs-i');await page.getByRole('button',{name:'Preparar ejercicio',exact:true}).click();await expect(page.locator('[data-exercise-feedback]')).toContainText('Servidor de apoyo preparado');
 await page.selectOption('#qa','autofs-i');await page.getByRole('button',{name:'Preparar ejercicio',exact:true}).click();await expect.poll(()=>page.evaluate(()=>preparations)).toBe(2);await expect(page.locator('#qa')).toBeEnabled();
});
test('Home y cursos · rejillas de una columna y Sobre legible @mobile',async({page})=>{
 await page.goto('/');await expect(page.locator('h1')).toContainText('Domina Linux.');await expect(page.locator('.hero-badge')).toContainText('RHEL y Debian');
 for(const selector of ['.home-terminal-grid','.home-whoami-grid'])expect(await page.locator(selector).evaluate(node=>getComputedStyle(node).gridTemplateColumns.trim().split(/\s+/).length)).toBe(1);
 await page.goto('/cursos.html');expect(await page.locator('.home-course-grid').evaluate(node=>getComputedStyle(node).gridTemplateColumns.trim().split(/\s+/).length)).toBe(1);
 await page.goto('/sobre.html');await page.locator('#pendientes summary').click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
