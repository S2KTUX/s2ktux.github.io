import {test,expect} from '@playwright/test';
const root='/laboratorios/kubernetes-real/';
async function mockBoot(page){await page.addInitScript(()=>{const original=HTMLButtonElement.prototype.click;HTMLButtonElement.prototype.click=function(...args){if(this.id==='start-cluster'){globalThis.testStarts=(globalThis.testStarts||0)+1;return;}return original.apply(this,args);};});}
test('Kubernetes · la entrada nueva no reutiliza módulos antiguos sin versión',async({page})=>{
 const stale=[];const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.route(/\/(?:entrada-laboratorio|multinodo|interfaz-niveles)\.mjs$/,route=>{stale.push(route.request().url());return route.fulfill({status:200,contentType:'text/javascript',body:'throw Error("Módulo antiguo reutilizado");'});});
 await page.goto(root);await expect(page.locator('#lab-loading')).toBeHidden();await page.locator('#mode-practice').click();
 await expect(page.locator('[data-choose-stage]')).toHaveCount(3);expect(stale).toEqual([]);expect(errors).toEqual([]);
 await page.reload();await page.locator('#mode-exam').click();await page.locator('[data-exam-language=en]').click();
 await expect(page.locator('#exam-heading')).toHaveText('CKA mock exam');expect(stale).toEqual([]);
});
test('Kubernetes · primero modo y después exactamente tres laboratorios',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/terminal.html');await page.locator('a[href="'+root+'"]').click();
 await expect(page.locator('#lab-entry')).toBeVisible();await expect(page.locator('#lab-loading')).toBeHidden();
 await expect(page.locator('.site-nav .navlink')).toHaveText(['Inicio','Cursos','Terminal','Proyectos']);
 await expect(page.locator('#practice-configuration')).toBeHidden();await expect(page.locator('#exam-configuration')).toBeHidden();
 await page.locator('#mode-practice').click();await expect(page.locator('#practice-configuration')).toBeVisible();
 await expect(page.locator('[data-choose-stage]')).toHaveCount(3);await expect(page.locator('[data-class]')).toHaveCount(0);
 await expect(page.getByText('¿Cómo quieres practicar?',{exact:true})).toHaveCount(0);
 await expect(page.locator('#entry-class-outline')).toHaveCount(0);
 await expect(page.locator('[data-level-name]')).toHaveText(['Inicial','Intermedio','Avanzado']);await expect(page.locator('#entry-intro')).toBeHidden();
 await expect(page.locator('.level-range')).toHaveText(['Clases 00–06','Clases 07–23','Clases 24–34']);
 const levelStyle=await page.locator('[data-choose-stage]').evaluateAll(nodes=>nodes.map(node=>({background:getComputedStyle(node).backgroundColor,shadow:getComputedStyle(node).boxShadow})));
 expect(levelStyle[0].background).not.toBe(levelStyle[1].background);expect(levelStyle.every(item=>item.shadow!=='none')).toBe(true);
 await expect(page.locator('#lab-entry')).not.toContainText('14 preguntas disponibles');
 await expect(page.locator('.level-summary')).toHaveText(['Pods, réplicas y servicios.','Configuración, almacenamiento y redes.','Instalación, mantenimiento y diagnóstico.']);
 await page.locator('[data-choose-stage=intermedio]').click();await expect(page.locator('[data-choose-stage=intermedio]')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#entry-intro')).toBeHidden();await expect(page.locator('#lab-entry')).not.toContainText('Control plane y un worker');await expect(page.locator('#enter-lab')).toHaveText('Abrir laboratorio intermedio');
 await page.locator('[data-choose-stage=avanzado]').click();
 await expect(page.locator('#enter-lab')).toBeDisabled();await expect(page.locator('#entry-intro')).toContainText('Próximamente');
 await expect(page.locator('#nodes iframe')).toHaveCount(0);expect(errors).toEqual([]);
});
test('Kubernetes · clases y preguntas comparten el laboratorio sin volver a arrancarlo',async({page})=>{
 await mockBoot(page);await page.goto(root);await page.locator('#mode-practice').click();await page.locator('#enter-lab').click();
 await expect(page.locator('#exercise-class-select')).toHaveValue('0');await expect(page.locator('#exercise-class-select option')).toHaveCount(7);
 await expect(page.locator('#mode-stamp')).toContainText('Modo práctica · Inicial');
 await expect(page.locator('.exercise-field label')).toHaveText(['Clase','Pregunta']);
 const practiceGaps=await page.evaluate(()=>({prompt:document.querySelector('#exercise-prompt').getBoundingClientRect().top-document.querySelector('#exercise-title').getBoundingClientRect().bottom,padding:parseFloat(getComputedStyle(document.querySelector('#exercises')).paddingTop)}));
 expect(practiceGaps.prompt).toBeGreaterThanOrEqual(16);expect(practiceGaps.padding).toBeGreaterThanOrEqual(20);
 await expect(page.locator('#lab-course-note')).toHaveText('* Clases 00–06 · Un nodo · 14 preguntas disponibles.');
 expect(await page.locator('#lab-course-note').evaluate(node=>parseFloat(getComputedStyle(node).fontSize))).toBeLessThan(13);
 for(const number of ['1','2','3','4','5','6']){
  await page.selectOption('#exercise-class-select',number);await expect(page.locator('#exercise-select option')).toHaveCount(2);
  await page.selectOption('#exercise-select','1');await expect(page.locator('#exercise-count')).toHaveText('Práctica 2 / 2');expect(await page.evaluate(()=>testStarts)).toBe(1);
 }
 await page.locator('#change-lab').click();await expect(page.locator('#enter-lab')).toContainText('laboratorio inicial');
 await page.locator('[data-choose-stage=intermedio]').click();await page.locator('#enter-lab').click();
 await expect(page.locator('#exercise-class-select')).toHaveValue('7');await expect(page.locator('#exercise-class-select option')).toHaveCount(17);
 await expect(page.locator('#mode-stamp')).toContainText('Modo práctica · Intermedio');
 await expect(page.locator('#lab-course-note')).toHaveText('* Clases 07–23 · Control plane y un worker · 10 preguntas disponibles.');
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
 await expect(page.locator('#exam-language')).toHaveCount(0);
 await page.locator('[data-exam-language=en]').click();await expect(page.locator('[data-exam-language=en]')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#exam-heading')).toHaveText('CKA mock exam');await expect(page.locator('#exam-pending')).toContainText('Coming soon');
 await expect(page.locator('#exam-description')).toHaveText('Two hours to complete hands-on Kubernetes administration tasks. A score of at least 66/100 is required to pass. We recommend completing the mock exam using only the official Kubernetes documentation.');
 await expect(page.locator('#exam-configuration')).toHaveAttribute('lang','en');await page.locator('[data-exam-language=es]').click();await expect(page.locator('#exam-heading')).toHaveText('Simulacro CKA');
 const gaps=await page.evaluate(()=>({heading:document.querySelector('#exam-description').getBoundingClientRect().top-document.querySelector('#exam-heading').getBoundingClientRect().bottom,note:document.querySelector('#exam-language-note').getBoundingClientRect().top-document.querySelector('#start-exam').getBoundingClientRect().bottom}));
 expect(gaps.heading).toBeGreaterThanOrEqual(18);expect(gaps.note).toBeGreaterThanOrEqual(28);
 await expect(page.locator('.exam-fact')).toHaveCount(0);await expect(page.locator('.exam-mark')).toHaveCount(0);
 expect(await page.locator('#exam-heading').evaluate(node=>parseFloat(getComputedStyle(node).fontSize))).toBeLessThanOrEqual(16);
 await expect(page.locator('#exam-description')).toHaveText('Dos horas para resolver tareas prácticas de administración de Kubernetes. Para aprobar se necesita al menos 66/100. Se recomienda realizar el simulacro consultando únicamente la documentación oficial de Kubernetes.');
 await expect(page.locator('[data-exam-language]')).toHaveText(['ES','EN']);
 const languageStyles=await page.locator('[data-exam-language]').evaluateAll(nodes=>nodes.map(node=>getComputedStyle(node).backgroundColor));expect(languageStyles[0]).not.toBe(languageStyles[1]);
 const languagePosition=await page.evaluate(()=>({bottom:document.querySelector('.exam-languages').getBoundingClientRect().bottom,description:document.querySelector('#exam-description').getBoundingClientRect().top}));expect(languagePosition.bottom).toBeLessThan(languagePosition.description);
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
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.locator('#mode-exam').click();await page.locator('[data-exam-language=en]').click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.locator('[data-theme-toggle]').click();await expect(page.locator('html')).toHaveClass(/dark/);await expect(page.locator('.site-nav a[href="/proyectos.html"]')).toBeVisible();
});
