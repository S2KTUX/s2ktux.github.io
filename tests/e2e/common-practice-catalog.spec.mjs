import {test,expect} from '@playwright/test';
import {exercises as linux} from '../../laboratorios/linux-real/v86-exercises.mjs';
import {exercises as docker} from '../../laboratorios/docker-real/docker-exercises.mjs';
import {practiceClasses} from '../../laboratorios/lab-groups.mjs';
for(const [mode,bank,ids]of [
 ['linux',linux,['inicio-archivos','inicio-permisos','inicio-hostname','inicio-usuario','inicio-umask']],
 ['docker',docker,['primer','web','volumen','bind','limites']],
])test('Prácticas actuales compartidas · '+mode,async({page,context})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));const simulated=await context.newPage();simulated.on('pageerror',e=>errors.push(e.message));
 await simulated.goto('/terminal.html?mode='+mode+'&enter=1');await simulated.waitForFunction(()=>document.documentElement.dataset.terminalReady==='true');
 await page.goto('/laboratorios/'+mode+'-real/');const nativeSelect=mode==='linux'?'#exercise-select':'#exercise';
 for(const id of ids){
  const task=bank.find(task=>task.id===id&&!task.legacyOnly),number=String(practiceClasses(mode,task)[0]);
  await page.selectOption(nativeSelect+'-class',number);await page.selectOption(nativeSelect,id);
  await simulated.selectOption('#chal-select-class',number);const option=simulated.locator('#chal-select option[data-source-id="'+id+'"]').first();await expect(option).toHaveCount(1);
  await simulated.selectOption('#chal-select',await option.getAttribute('value'));await expect(simulated.locator('[data-practice-title]')).toHaveText(task.title);
  await expect(simulated.locator('[data-practice-goal]')).toHaveText(task.goal);await expect(page.locator(mode==='linux'?'[data-exercise-goal]':'#exercise-goal')).toHaveText(task.goal);
 }
 expect(await page.evaluate(()=>!!globalThis.vm||!!globalThis.dockerVM)).toBe(false);expect(errors).toEqual([]);await simulated.close();
});
