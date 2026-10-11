import {test,expect} from '@playwright/test';
test('Docker real · entrada principal y prácticas sin soluciones visibles',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/terminal.html');await page.locator('[data-pick-mode="docker"]').click();await expect(page).toHaveURL(/\/laboratorios\/docker-real\/$/);
 await expect(page.locator('#start')).toBeVisible();await expect(page.locator('#save')).toBeDisabled();await expect(page.locator('#exercise option')).toHaveCount(16);await page.selectOption('#exercise','web');await expect(page.locator('#exercise-title')).toHaveText('Publica un servidor web');await expect(page.locator('#solution')).toBeHidden();await page.click('#solution-toggle');await expect(page.locator('#solution')).toContainText('s2ktux/nginx-lab:2');expect(errors).toEqual([]);
});
test('Docker real · tema compartido y móvil sin desbordamiento @mobile',async({page})=>{
 await page.goto('/laboratorios/docker-real/');await page.locator('[data-theme-toggle]').click();await expect(page.locator('html')).toHaveClass(/dark/);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
