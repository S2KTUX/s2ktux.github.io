import { test, expect } from '@playwright/test';

test('tema cambia por evento sin temporizadores visuales', async ({ page }) => {
  await page.goto('/terminal.html?choose=1');
  await page.evaluate(() => localStorage.setItem('s2ktux-theme', 'dark'));
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  await expect(page.locator('[data-theme-icon]').first()).toHaveText('☀');
  await page.evaluate(() => document.addEventListener('s2ktux:themechange', (event) => { window.__observedTheme = event.detail.theme; }, { once: true }));
  await page.locator('[data-theme-toggle]').first().evaluate((button) => button.click());
  await expect.poll(() => page.evaluate(() => window.__observedTheme)).toBe('light');
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('fachada YouTube no crea ni solicita el reproductor antes del clic', async ({ page }) => {
  const youtubeRequests = [];
  page.on('request', (request) => { if (/youtube|youtu\.be/.test(request.url())) youtubeRequests.push(request.url()); });
  await page.goto('/cursos/rhcsa-9/tema-1-herramientas-esenciales/');
  const facade = page.locator('.youtube-facade');
  await expect(facade).toBeVisible();
  await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0);
  expect(youtubeRequests).toEqual([]);
  await facade.click();
  await expect(page.locator('iframe[src^="https://www.youtube-nocookie.com/embed/"]')).toHaveCount(1);
});
