import { test, expect } from '@playwright/test';

test('Fase 3 · la portada conserva su composición visual completa', async ({ page }) => {
  await page.goto('/');
  const hero = page.locator('main section').first();
  await expect(page.getByRole('heading', { level: 1, name: /Domina Linux/i })).toBeVisible();
  await expect(hero).toHaveCSS('padding-top', '70px');
  await expect(hero).toHaveCSS('text-align', 'center');
  await expect(page.locator('.hero-badge')).toHaveCSS('display', 'inline-flex');
  await expect(page.getByRole('link', { name: /EMPEZAR GRATIS/i })).toHaveCSS('padding', '17px 28px');
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
