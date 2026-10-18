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
 test('Entrada alternativa · '+mode+' mantiene su simulador',async({page})=>{
  await page.goto('/terminal.html');await page.locator('[data-legacy-mode="'+mode+'"]').click();
  await page.waitForFunction(()=>document.documentElement.dataset.terminalReady==='true');
  await expect(page).toHaveURL(new RegExp('terminal.html\\?mode='+mode+'$'));
  await expect(page.locator('#terminal-shell')).toBeVisible();
  await expect(page.locator('#main-content')).not.toContainText('Probar Linux real');
 });
}

test('Entrada principal · Enter abre Linux real',async({page})=>{
 await page.goto('/terminal.html');await page.locator('[data-pick-mode="linux"]').focus();await page.keyboard.press('Enter');
 await expect(page).toHaveURL(/\/laboratorios\/linux-real\/v86-test\.html(?:\?|$)/);
});

test('Entrada alternativa · Enter respeta el enlace simulado',async({page})=>{
 await page.goto('/terminal.html');await page.locator('[data-legacy-mode="linux"]').focus();await page.keyboard.press('Enter');
 await page.waitForFunction(()=>document.documentElement.dataset.terminalReady==='true');await expect(page).toHaveURL(/terminal.html\?mode=linux$/);
});
