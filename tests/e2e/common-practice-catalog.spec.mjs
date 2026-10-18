import {test,expect} from '@playwright/test';
import {commonPractices} from '../../practice-common.mjs';

for(const mode of ['linux','docker']){
 test('Enunciados comunes · '+mode+' muestra el mismo texto en ambos laboratorios',async({page,context})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const simulated=await context.newPage();simulated.on('pageerror',error=>errors.push(error.message));
  await simulated.goto('/terminal.html?mode='+mode+'&enter=1');
  await simulated.waitForFunction(()=>document.documentElement.dataset.terminalReady==='true');
  await simulated.locator('#practice-panel>summary').click();
  await page.goto(mode==='linux'?'/laboratorios/linux-real/v86-test.html':'/laboratorios/docker-real/');
  for(const item of commonPractices[mode]){
   await simulated.selectOption('#chal-select',String(item.index));
   await page.selectOption(mode==='linux'?'#exercise-select':'#exercise',item.id);
   await expect(simulated.locator('[data-practice-title]')).toHaveText(item.title);
   await expect(simulated.locator('[data-practice-goal]')).toHaveText(item.goal);
   await expect(page.locator(mode==='linux'?'[data-exercise-title]':'#exercise-title')).toHaveText(item.title);
   await expect(page.locator(mode==='linux'?'[data-exercise-goal]':'#exercise-goal')).toHaveText(item.goal);
  }
  expect(await page.evaluate(()=>typeof globalThis.vm)).toBe('undefined');
  expect(errors).toEqual([]);await simulated.close();
 });
}
