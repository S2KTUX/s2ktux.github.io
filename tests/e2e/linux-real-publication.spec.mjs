import { test, expect } from '@playwright/test';

test('Linux real · acceso independiente, guía y soluciones sin ejecutar', async ({ page }) => {
  await page.goto('/terminal.html');
  await page.locator('#mode-select a[href="/laboratorios/linux-real/"]').click();
  await expect(page).toHaveURL(/\/laboratorios\/linux-real\/v86-test\.html/);
  await expect(page.locator('#start')).toBeEnabled();
  await expect(page.locator('.lead')).toContainText('Linux real');
  await expect(page.locator('#other-node')).toHaveAttribute('href', /node=2/);
  await expect(page.locator('.site-logo')).toHaveText('S2KTUX');
  await expect(page.locator('#recovery-link')).toHaveAttribute('href', /scenario=recovery/);
  await page.locator('[data-theme-toggle]').click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await page.locator('[data-practice-help]').click();
  await expect(page.locator('[data-exercise-check]')).toBeDisabled();
  await page.locator('[data-exercise-solution]').click();
  await expect(page.locator('#exercise-solution')).toBeVisible();
  expect(await page.evaluate(() => typeof globalThis.vm)).toBe('undefined');
  await page.goto('/laboratorios/linux-real/licencias/LEEME.html');
  await expect(page.locator('a[href*="fuentes-laboratorio-v3.tar.gz"]')).toHaveCount(1);
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
