import {test,expect} from '@playwright/test';
test('Kubernetes preliminar · entrada, navegación y configuración sin arrancar VMs',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/terminal.html');await page.locator('a[href="/laboratorios/kubernetes-real/"]').click();
 await expect(page).toHaveURL(/\/laboratorios\/kubernetes-real\/debian\/multinodo.html/);
 await expect(page.locator('#lab-entry')).toBeVisible();await expect(page.locator('#lab-loading')).toBeHidden();
 await expect(page.locator('.site-nav .navlink')).toHaveText(['Inicio','Cursos','Terminal','Proyectos']);
 await expect(page.locator('.mode-note').last()).toContainText('Versión preliminar');
 await expect(page.locator('#environment-select option')).toHaveCount(3);await expect(page.locator('#nodes iframe')).toHaveCount(0);
 await page.selectOption('#environment-select','intermedio');await expect(page.locator('#entry-nodes tr')).toHaveCount(2);await expect(page.locator('#nodes iframe')).toHaveCount(0);
 await page.selectOption('#environment-select','avanzado');await expect(page.locator('#entry-nodes tr')).toHaveCount(3);
 await expect(page.locator('#enter-lab')).toBeEnabled();expect(errors).toEqual([]);
});
test('Kubernetes preliminar · móvil y tema compartido @mobile',async({page})=>{
 await page.goto('/laboratorios/kubernetes-real/');await expect(page.locator('#lab-entry')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.locator('[data-theme-toggle]').click();await expect(page.locator('html')).toHaveClass(/dark/);
 await expect(page.locator('.site-nav a[href="/proyectos.html"]')).toBeVisible();
});
