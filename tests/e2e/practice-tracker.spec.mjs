import {test,expect} from '@playwright/test';
test('Prácticas · seguimiento discreto, marca manual y conservación independiente',async({page})=>{
 await page.goto('/laboratorios/linux-real/');await page.selectOption('#exercise-select-class','1');
 const tracker=page.locator('.practice-progress');await expect(tracker).not.toContainText('Sin intentar');await expect(tracker).not.toContainText('Sin intentos');
 expect(await tracker.evaluate(n=>parseFloat(getComputedStyle(n).borderTopWidth))).toBe(0);
 const id=await page.locator('#exercise-select').inputValue();await tracker.getByRole('button',{name:'Marcar resuelta',exact:true}).click();
 await expect(tracker.locator('strong')).toHaveCount(0);await expect(page.locator('#exercise-select option:checked')).toContainText('Resuelta · ');
 expect(await page.evaluate(id=>JSON.parse(localStorage.getItem('s2ktux-practice-progress-v1:linux-real'))[id].source,id)).toBe('manual');
 await page.reload();await page.selectOption('#exercise-select-class','1');await page.selectOption('#exercise-select',id);await expect(page.locator('#exercise-select')).toHaveAttribute('data-progress','completed');
 await tracker.getByRole('button',{name:'Desmarcar',exact:true}).click();await expect(page.locator('#exercise-select')).toHaveAttribute('data-progress','pending');
 await tracker.getByRole('button',{name:'Marcar resuelta',exact:true}).click();
 await page.goto('/laboratorios/docker-real/');await page.selectOption('#exercise-class','1');await expect(page.locator('#exercise')).toHaveAttribute('data-progress','pending');
 await page.goto('/terminal.html');await expect(page.locator('[data-pick-mode]').first()).toHaveAttribute('data-pick-mode','lpic');await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/laboratorios\/lpic-1\/$/);
});
