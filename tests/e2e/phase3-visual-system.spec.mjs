import { test, expect } from '@playwright/test';

test('Fase 3 · la portada conserva su composición visual completa', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('main section').first();
  await expect(page.getByRole('heading', { level: 1, name: /Aprende Linux/i })).toBeVisible();
  await expect(hero).toHaveCSS('max-width', '1180px');
  await expect(hero).toHaveCSS('padding-top', '70px');
  await expect(hero).toHaveCSS('text-align', 'center');
  await expect(page.locator('.hero-badge')).toHaveCSS('display', 'inline-flex');
  await expect(page.getByRole('link', { name: /EMPEZAR GRATIS/i })).toHaveCSS('padding', '17px 28px');
  await expect(page.locator('main > section').nth(1)).toHaveCSS('max-width', '1000px');
  await expect(page.locator('main > section').nth(2)).toHaveCSS('max-width', '1180px');
});

test('Fase 3 · cabecera y tema compartidos funcionan sin solaparse en móvil', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto('/index.html');
  const logo = await page.locator('.site-logo').boundingBox();
  const toggle = await page.locator('.site-theme-toggle').boundingBox();
  const nav = await page.locator('.site-nav').boundingBox();
  expect(logo).toBeTruthy();
  expect(toggle).toBeTruthy();
  expect(nav).toBeTruthy();
  expect(logo.x + logo.width).toBeLessThan(toggle.x);
  expect(nav.width).toBeLessThanOrEqual(360);
  await expect(page.locator('body')).toHaveCSS('font-family', /Space Mono/);
  await page.locator('.site-theme-toggle').click();
  await expect(page.locator('html')).toHaveClass(/dark/);
  expect(await page.evaluate(() => localStorage.getItem('s2ktux-theme'))).toBe('dark');
});

test('Fase 3 · curso y terminal conservan lectura y ancho móvil', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of ['/cursos/docker/','/cursos/docker/clase-1-fundamentos-de-docker/','/terminal.html']) {
    await page.goto(path);
    await expect(page.locator('main')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, `${path} no debe desbordar horizontalmente`).toBeLessThanOrEqual(1);
  }
  await expect(page.locator('.site-header')).toBeVisible();
});

test('Fase 3 · terminal y paneles respetan su ancho de escritorio', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  for (const mode of ['linux', 'docker', 'kubernetes']) {
    await page.goto(`/terminal.html?mode=${mode}&enter=1`);
    await page.waitForFunction(() => document.documentElement.dataset.terminalReady === 'true');

    const layout = await page.evaluate(() => {
      const viewportCenter = window.innerWidth / 2;
      const measure = (selector) => {
        const rect = document.querySelector(selector).getBoundingClientRect();
        return { width: rect.width, center: rect.left + rect.width / 2, viewportCenter };
      };
      return {
        stage: measure('.terminal-stage'),
        cheatsheet: measure('.terminal-panel-section'),
        practices: measure('.terminal-practice-section')
      };
    });

    for (const [name, box] of Object.entries(layout)) {
      expect(box.width, `${mode}: ${name} no debe superar el ancho de diseño`).toBeLessThanOrEqual(1200);
      expect(Math.abs(box.center - box.viewportCenter), `${mode}: ${name} debe quedar centrado`).toBeLessThanOrEqual(1);
    }
  }
});

test('Referencia breve · Linux real y simulado comparten los comandos, sin la antigua cheatsheet',async({page})=>{
 for(const path of ['/laboratorios/linux-real/','/terminal.html?mode=linux&enter=1']){
  await page.goto(path);await page.locator('.lab-reference summary').click();await expect(page.locator('.lab-reference')).toContainText('chage -M 90');await expect(page.locator('.lab-reference')).toContainText('su - USUARIO');await expect(page.locator('#cheatsheet-title')).toHaveCount(0);
 }
});
