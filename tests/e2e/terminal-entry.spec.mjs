import {test,expect} from '@playwright/test';

for(const mode of ['linux','docker']){
 test('Entrada principal · '+mode+' abre el laboratorio real',async({page})=>{
  await page.goto('/terminal.html');
  await expect(page.locator('#mode-select')).not.toContainText('Probar Linux real');
  await page.locator('[data-pick-mode="'+mode+'"]').click();
  await expect(page).toHaveURL(mode==='linux'?/\/laboratorios\/linux-real\/v86-test\.html(?:\?|$)/:/\/laboratorios\/docker-real\/$/);
  await expect(page.locator('#start')).toBeEnabled();
  expect(await page.evaluate(()=>typeof globalThis.vm)).toBe('undefined');
 });
 test('Entrada alternativa · '+mode+' ofrece su simulador dentro del laboratorio',async({page})=>{
  await page.goto(mode==='linux'?'/laboratorios/linux-real/v86-test.html':'/laboratorios/docker-real/');
  const pages=page.context().pages().length;
  await page.locator('a[href="/terminal.html?mode='+mode+'&enter=1"]').click();const alternative=page;
  await alternative.waitForFunction(()=>document.documentElement.dataset.terminalReady==='true');
  await expect(alternative).toHaveURL(new RegExp('terminal.html\\?mode='+mode+'$'));
  await expect(alternative.locator('#terminal-shell')).toBeVisible();
  await expect(alternative.locator('#main-content')).not.toContainText('Probar Linux real');expect(page.context().pages()).toHaveLength(pages);
 });
}

test('Entrada principal · Enter abre Linux real',async({page})=>{
 await page.goto('/terminal.html');await page.locator('[data-pick-mode="linux"]').focus();await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/\/laboratorios\/linux-real\/v86-test\.html(?:\?|$)/);
});

test('Entrada preliminar · Enter respeta el enlace de Kubernetes',async({page})=>{
 await page.goto('/terminal.html');await page.locator('#mode-select a[href="/laboratorios/kubernetes-real/"]').focus();await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/\/laboratorios\/kubernetes-real\/debian\/multinodo\.html\?/);
 expect(new URL(page.url()).searchParams.get('view')).toBe('presentacion');
});

test('Menú inicial · no ofrece alternativas simuladas de Linux ni Docker',async({page})=>{
 await page.goto('/terminal.html');const selector=page.locator('#mode-select');
 await expect(selector.locator('[data-pick-mode]')).toHaveCount(3);
 await expect(selector).not.toContainText('Versiones simuladas');
 await expect(selector.locator('a[href*="mode=linux"],a[href*="mode=docker"],[data-legacy-mode]')).toHaveCount(0);
});

test('Entrada principal · Kubernetes conserva la versión simulada',async({page})=>{
 await page.goto('/terminal.html');await page.locator('[data-pick-mode="kubernetes"]').click();
 await page.waitForFunction(()=>document.documentElement.dataset.terminalReady==='true');
 await expect(page).toHaveURL(/terminal.html\?mode=kubernetes$/);await expect(page.locator('#terminal-shell')).toBeVisible();
});
