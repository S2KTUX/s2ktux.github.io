import {test,expect} from '@playwright/test';
async function command(page,text){
 await page.locator('#term-input').evaluate((input,value)=>{input.focus();input.value=value;input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,cancelable:true}));},text);
 await page.waitForFunction(()=>{const input=document.querySelector('#term-input');return input&&!input.readOnly&&!input.disabled&&input.value==='';});
}
for(const mode of ['linux','docker','kubernetes'])test(mode+' simulado · clase, pregunta y práctica libre',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{globalThis.__S2KTUX_TEST_FIXTURES__=true;});
 await page.goto('/terminal.html?mode='+mode+'&enter=1');await page.waitForFunction(()=>document.documentElement.dataset.terminalReady==='true');
 await expect(page.locator('#chal-select-class')).toHaveValue('free');await expect(page.locator('#chal-select').locator('..')).toBeHidden();
 await expect(page.locator('#term-solved')).toHaveCount(0);await expect(page.locator('#practice-panel')).toBeVisible();
 if(mode==='linux'){
  await page.evaluate(()=>globalThis.__s2ktuxTestSolve());await page.selectOption('#chal-select-class','1');
  await expect(page.locator('[data-practice-title]')).toHaveText('Redirecciones · I');await page.click('#chal-check');await expect(page.locator('#chal-result')).toContainText('TODAVÍA NO');
  await command(page,'echo Hola > /root/salida.txt');await page.click('#chal-check');await expect(page.locator('#chal-result')).toContainText('CONSEGUIDO');
  await command(page,'echo Distinto > /root/salida.txt');await page.click('#chal-check');await expect(page.locator('#chal-result')).toContainText('TODAVÍA NO');
  await page.selectOption('#chal-select-class','exam');await expect(page.locator('#chal-select option').first()).toHaveAttribute('data-source-id','repaso-usuarios');
  await expect(page.locator('#chal-body')).toContainText('Cuentas de un equipo');
 }
 if(mode==='docker'){
  await expect(page.locator('#chal-select-class option[value="1"]')).toHaveText('01 — Fundamentos de Docker');
  await page.selectOption('#chal-select-class','2');const option=page.locator('#chal-select option[data-source-id="inicio-volumen"]').first();
  await expect(option).toHaveCount(1);await page.selectOption('#chal-select',await option.getAttribute('value'));
  await expect(page.locator('[data-practice-title]')).toHaveText('Volúmenes · I');await command(page,'docker volume create primer-dato');await page.click('#chal-check');await expect(page.locator('#chal-result')).toContainText('CONSEGUIDO');
  await expect(page.locator('#chal-select-class option[value="exam"]')).toHaveCount(0);
 }
 if(mode==='kubernetes'){
  await expect(page.locator('#chal-select-class option[value="0"]')).toHaveCount(0);
  await page.selectOption('#chal-select-class','4');await expect(page.locator('[data-practice-title]')).toHaveText('Deployment · I');
  await command(page,'kubectl create deployment inicio-web --image=nginx');await page.click('#chal-check');await expect(page.locator('#chal-result')).toContainText('CONSEGUIDO');
  await page.selectOption('#chal-select-class','exam');await expect(page.locator('#chal-body')).toContainText('Una utilidad disponible');
  await page.selectOption('#chal-select-class','2');
  const podOption=page.locator('#chal-select option').filter({hasText:'Pods · II'});await page.selectOption('#chal-select',await podOption.getAttribute('value'));
  await page.click('#chal-check');await expect(page.locator('#chal-result')).toContainText('TODAVÍA NO');
  await command(page,'kubectl run herramientas --image=nginx');await page.waitForTimeout(1100);
  await command(page,"kubectl exec herramientas -- sh -c 'echo Aprendiendo > /tmp/mensaje'");await command(page,'kubectl get pods');await command(page,'kubectl exec herramientas -- cat /tmp/mensaje');await expect(page.locator('#term-body')).toContainText('Aprendiendo');await page.click('#chal-check');await expect(page.locator('#chal-result')).toContainText('CONSEGUIDO');
  await command(page,"kubectl exec herramientas -- sh -c 'echo Distinto > /tmp/mensaje'");await page.click('#chal-check');await expect(page.locator('#chal-result')).toContainText('TODAVÍA NO');
  await page.selectOption('#chal-select-class','13');await page.click('#chal-solution');await expect(page.locator('#chal-solution-body')).toContainText('kubectl config current-context');
 }
 await page.selectOption('#chal-select-class','free');await expect(page.locator('#chal-select').locator('..')).toBeHidden();await expect(page.locator('#chal-body')).toBeEmpty();await expect(page.locator('#chal-check')).toBeHidden();expect(errors).toEqual([]);
});
test('Linux · títulos del curso, parejas y referencia sin arrancar',async({page})=>{
 const navigations=[];page.on('framenavigated',frame=>{if(frame===page.mainFrame())navigations.push(frame.url());});await page.goto('/laboratorios/linux-real/');
 await expect(page.locator('#start')).toBeEnabled();expect(navigations).toHaveLength(1);
 await expect(page.locator('#exercise-select-class option[value="3"]')).toHaveText('03 — Crear scripts de shell simples');
 await page.selectOption('#exercise-select-class','9');await expect(page.locator('[data-exercise-title]')).toHaveText('Cuentas locales · I');
 await page.selectOption('#exercise-select','caducidad-ii');await page.click('[data-exercise-solution]');await expect(page.locator('#exercise-solution')).not.toContainText('runuser');await expect(page.locator('#exercise-solution')).not.toContainText('umask');
 await page.selectOption('#exercise-select-class','10');await expect(page.locator('#exercise-select option')).toContainText(['Firewall · I']);
 await page.locator('.lab-reference summary').click();await expect(page.locator('.lab-reference')).toContainText('su - USUARIO');expect(await page.evaluate(()=>!!globalThis.vm)).toBe(false);
 await page.selectOption('#exercise-select-class','free');await expect(page.locator('#exercise-select').locator('..')).toBeHidden();await expect(page.locator('[data-exercise-card]')).toBeHidden();
});
test('Kubernetes · selección inmediata sin descargar el motor',async({page})=>{
 const heavy=[];page.on('request',request=>{if(['multinodo.mjs','interfaz-niveles.mjs','red-local.mjs'].some(name=>new URL(request.url()).pathname.endsWith('/'+name)))heavy.push(request.url());});
 await page.goto('/laboratorios/kubernetes-real/');await expect(page.locator('#practice-configuration')).toBeVisible();await expect(page.locator('[data-choose-stage]')).toHaveCount(3);await expect(page.locator('#lab-loading')).toBeHidden();expect(heavy).toEqual([]);
 await page.click('#enter-lab');await expect(page.locator('#lab-workspace')).toBeVisible();await expect(page.locator('#exercise-class-select option[value="0"]')).toHaveCount(0);await page.click('#exercise-solution-toggle');await expect(page.locator('#exercise-solution')).not.toContainText('jsonpath');await expect(page.locator('#exercise-solution')).not.toContainText('jq');
 await page.selectOption('#exercise-class-select','exam');await expect(page.locator('#exercise-title')).toHaveText('Una utilidad disponible');await page.selectOption('#exercise-class-select','free');await expect(page.locator('#exercise-select').locator('..')).toBeHidden();await expect(page.locator('#exercise-check')).toBeHidden();await expect(page.locator('#nodes iframe')).toHaveCount(0);
});
test('Cursos · no hay seguimiento de páginas leídas',async({page})=>{
 await page.goto('/cursos/docker/clase-1-fundamentos-de-docker/');await expect(page.locator('[data-lesson-read],.lesson-read')).toHaveCount(0);await expect(page.locator('.lesson-navigation')).not.toContainText('leída');
});
