import {test,expect} from '@playwright/test';
test('Prácticas · seguimiento discreto, marca manual y conservación independiente',async({page})=>{
 await page.goto('/laboratorios/linux-real/');await page.selectOption('#exercise-select-class','1');
 const tracker=page.locator('.practice-progress');await expect(tracker).not.toContainText('Sin intentar');await expect(tracker).not.toContainText('Sin intentos');
 expect(await tracker.evaluate(n=>parseFloat(getComputedStyle(n).borderTopWidth))).toBe(0);
 const id=await page.locator('#exercise-select').inputValue();await tracker.getByRole('button',{name:'Marcar realizada',exact:true}).click();
 await expect(tracker.locator('strong')).toHaveText('• Realizada');await expect(page.locator('#exercise-select option:checked')).toContainText('• ');
 await page.reload();await page.selectOption('#exercise-select-class','1');await page.selectOption('#exercise-select',id);await expect(tracker.locator('strong')).toHaveText('• Realizada');
 await tracker.getByRole('button',{name:'Desmarcar',exact:true}).click();await expect(tracker.locator('strong')).toBeHidden();
 await tracker.getByRole('button',{name:'Marcar realizada',exact:true}).click();
 await page.goto('/laboratorios/docker-real/');await page.selectOption('#exercise-class','1');await expect(page.locator('.practice-progress strong')).toBeHidden();
 await page.goto('/terminal.html');await expect(page.locator('[data-pick-mode]').first()).toHaveAttribute('data-pick-mode','lpic');await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/laboratorios\/lpic-1\/$/);
});
