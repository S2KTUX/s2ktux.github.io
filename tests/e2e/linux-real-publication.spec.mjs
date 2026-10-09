import { test, expect } from '@playwright/test';

test('Linux real · acceso independiente, guía y soluciones sin ejecutar', async ({ page }) => {
  await page.goto('/terminal.html');
  await page.locator('#mode-select a[href="/laboratorios/linux-real/"]').click();
  await expect(page).toHaveURL(/\/laboratorios\/linux-real\/v86-test\.html/);
  await expect(page.locator('#start')).toBeEnabled();
  await expect(page.locator('#other-node')).toHaveAttribute('href', /node=2/);
  await expect(page.locator('.site-logo')).toHaveText('S2KTUX');
  await expect(page.locator('#recovery-link')).toHaveAttribute('href', /scenario=recovery/);
  await expect(page.locator('#session-status')).toBeHidden();
  await expect(page.locator('#clipboard-status')).toBeHidden();
  await expect(page.locator('.lab-modes')).toBeVisible();
  for(const selector of ['#lab-help','#more-options','#internet','a[href="CHULETA_LINUX_REAL.html"]'])await expect(page.locator(selector)).toHaveCount(0);
  await expect(page.locator('[data-exercise-card]')).toBeHidden();
  await expect(page.locator('#result')).toBeHidden();
  expect((await page.locator('.console').boundingBox()).y).toBeLessThan(500);
  await expect(page.locator('#reboot')).toBeVisible();
  await page.locator('[data-theme-toggle]').click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.locator('#exercise-select').selectOption('archivo');
  await expect(page.locator('[data-exercise-check]')).toBeDisabled();
  await page.locator('[data-exercise-solution]').click();
  await expect(page.locator('#exercise-solution')).toBeVisible();
  await expect(page.locator('a[href="examen.html"]')).toHaveText('Modo examen');
  await expect(page.locator('#exercise-select option')).toHaveCount(45);
  await expect(page.locator('#reboot')).toBeVisible();
  await expect(page.locator('#recovery-link')).toBeVisible();
  expect(await page.evaluate(() => typeof globalThis.vm)).toBe('undefined');
  await page.goto('/laboratorios/linux-real/licencias/LEEME.html');
  await expect(page.locator('a[href*="fuentes-laboratorio-v3.tar.gz"]')).toHaveCount(1);
});

test('Linux real · examen separado, sin ayudas y con errores de preparación visibles',async({page})=>{
  await page.goto('/laboratorios/linux-real/examen.html');
  await expect(page.locator('#exam-start')).toBeEnabled();
  await expect(page.locator('#exam-intro')).toContainText('300 puntos');
  await expect(page.locator('#exam-results')).toBeHidden();
  await page.route('**/disco-fragmentado.json',route=>route.fulfill({status:503,body:'Sin imagen'}));
  await page.locator('#exam-start').click();
  await expect(page.locator('.site-header')).toBeVisible();
  await expect(page.locator('#exam-intro')).toBeHidden();
  await expect(page.locator('#exam-status')).toContainText('Máquina 1:');
  await expect(page.locator('#exam-finish')).toBeEnabled();
  await expect(page.locator('#exam-questions article')).toHaveCount(1);
  await expect(page.locator('#exam-questions')).not.toContainText('puntos');
  await expect(page.frameLocator('iframe').locator('#exercise-panel')).toBeHidden();
  await page.locator('[data-exam-node="2"]').click();
  await page.locator('[data-exam-node="2"]').hover();
  const selectedColors=await page.locator('[data-exam-node="2"]').evaluate(e=>({background:getComputedStyle(e).backgroundColor,heading:getComputedStyle(document.querySelector('h1')).color}));
  expect(selectedColors.background).toBe(selectedColors.heading);
  await expect(page.locator('#exam-machine-start')).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(page.locator('#exam-questions')).not.toContainText('rd.break');
  await expect(page.locator('#exam-questions')).not.toContainText('init=');
  page.on('dialog',dialog=>dialog.accept());
  await page.locator('#exam-finish').click();
  await expect(page.locator('#exam-score')).toHaveText('0/300 puntos');
  await expect(page.locator('#exam-verdict')).toContainText('No aprobado');
  await expect(page.locator('#exam-report details')).toHaveCount(22);
  await expect(page.locator('#exam-report [data-result="unanswered"]')).toHaveCount(22);
  await page.locator('#exam-report details').first().locator('summary').click();
  await expect(page.locator('#exam-report details').first()).toContainText('Una solución válida');
});

test('Linux real · finalizar sin esperar al arranque',async({page})=>{
  await page.goto('/laboratorios/linux-real/examen.html');
  await page.route('**/disco-fragmentado.json',route=>new Promise(resolve=>setTimeout(()=>{route.abort().catch(()=>{});resolve();},3000)));
  page.on('dialog',dialog=>dialog.accept());
  await page.locator('#exam-start').click();
  await expect(page.locator('#exam-finish')).toBeEnabled();
  await page.locator('[data-exam-node="2"]').click();
  await expect(page.locator('#exam-machine-start')).toHaveText('Espera a la máquina 1…');
  await page.locator('#exam-finish').click();
  await expect(page.locator('#exam-score')).toHaveText('0/300 puntos');
  await expect(page.locator('#exam-report details')).toHaveCount(22);
  await expect(page.locator('iframe')).toHaveCount(0);
});

test('Linux real · recuperación con reinicio accesible y error de arranque visible', async ({page}) => {
  await page.goto('/laboratorios/linux-real/v86-test.html?scenario=recovery');
  await expect(page.locator('#start')).toBeEnabled();
  await expect(page.locator('h1')).toHaveText('Recuperación de root');
  await expect(page.locator('#recovery-note')).toBeVisible();
  await expect(page.locator('#reboot')).toBeVisible();
  await expect(page.locator('#recovery-link')).toBeHidden();
  await expect(page.locator('#network-note')).toBeHidden();
  await expect(page.locator('#exercise-panel')).not.toHaveAttribute('open');
  await page.route('**/disco-fragmentado.json', route => route.fulfill({status:503, body:'Sin imagen'}));
  await page.locator('#start').click();
  await expect(page.locator('#status')).toContainText('Laboratorio detenido');
  await expect(page.locator('#result')).toBeVisible();
  await expect(page.locator('#result')).toContainText('perderás el guardado');
});

test('Linux real · portapapeles bajo acción del usuario y errores visibles', async ({ page }) => {
  await page.goto('/laboratorios/linux-real/v86-test.html');
  await expect(page.locator('#start')).toBeEnabled();
  const results = await page.evaluate(async () => {
    const {attachTerminalClipboard}=await import('/laboratorios/linux-real/v86-clipboard.mjs');
    const container=document.createElement('div');document.body.append(container);
    const calls=[];let active=true;
    attachTerminalClipboard({getSelection:()=> 'texto seleccionado',focus:()=>calls.push('focus'),paste:text=>calls.push(text)},container,{
      canPaste:()=>active,notify:text=>calls.push(text),clipboard:{writeText:async text=>calls.push(text),readText:async()=> 'echo Hola'}
    });
    container.dispatchEvent(new MouseEvent('mousedown',{button:0}));document.dispatchEvent(new MouseEvent('mouseup'));await new Promise(resolve=>setTimeout(resolve,0));
    container.dispatchEvent(new MouseEvent('contextmenu',{cancelable:true}));await new Promise(resolve=>setTimeout(resolve,0));
    active=false;container.dispatchEvent(new MouseEvent('contextmenu',{cancelable:true}));
    const blocked=document.createElement('div');document.body.append(blocked);
    attachTerminalClipboard({getSelection:()=> 'otra selección',focus(){},paste(){}},blocked,{
      canPaste:()=>true,notify:text=>calls.push(text),clipboard:{writeText:async()=>{throw Error('Permiso denegado');},readText:async()=>{throw Error('Permiso denegado');}}
    });
    blocked.dispatchEvent(new MouseEvent('mousedown',{button:0}));document.dispatchEvent(new MouseEvent('mouseup'));
    blocked.dispatchEvent(new MouseEvent('contextmenu',{cancelable:true}));await new Promise(resolve=>setTimeout(resolve,0));
    return calls;
  });
  expect(results).toContain('texto seleccionado');expect(results).toContain('echo Hola');expect(results.filter(value=>value==='echo Hola')).toHaveLength(1);
  expect(results).toContain('Espera a que la terminal esté disponible para pegar.');
  expect(results.some(value=>value.includes('bloqueado la copia automática'))).toBe(true);
  expect(results.some(value=>value.includes('bloqueado el pegado'))).toBe(true);
});

test('Linux real · diseño integrado sin desbordamiento @mobile', async ({page})=>{
  await page.goto('/laboratorios/linux-real/v86-test.html');
  await expect(page.locator('.site-logo')).toHaveText('S2KTUX');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
