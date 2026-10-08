import { test, expect } from '@playwright/test';

test('Linux real · acceso independiente, guía y soluciones sin ejecutar', async ({ page }) => {
  await page.goto('/terminal.html');
  await page.locator('#mode-select a[href="/laboratorios/linux-real/"]').click();
  await expect(page).toHaveURL(/\/laboratorios\/linux-real\/v86-test\.html/);
  await expect(page.locator('#start')).toBeEnabled();
  await expect(page.locator('.lead')).toContainText('Linux real');
  await expect(page.locator('#other-node')).toHaveAttribute('href', /node=2/);
  await page.locator('[data-practice-help]').click();
  await expect(page.locator('[data-exercise-check]')).toBeDisabled();
  await page.locator('[data-exercise-solution]').click();
  await expect(page.locator('#exercise-solution')).toBeVisible();
  expect(await page.evaluate(() => typeof globalThis.vm)).toBe('undefined');
  await page.goto('/laboratorios/linux-real/licencias/LEEME.html');
  await expect(page.locator('a[href*="fuentes-laboratorio-v3.tar.gz"]')).toHaveCount(1);
});
