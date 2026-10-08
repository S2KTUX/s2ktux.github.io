import { test, expect } from '@playwright/test';

for (const size of ['desktop', 'mobile']) {
  test(`Kubernetes · clase 00 e índice ${size === 'mobile' ? '@mobile' : 'desktop'}`, async ({ page }) => {
    await page.goto('/cursos/kubernetes-cka/');
    const rows = page.locator('.module-row');
    await expect(rows).toHaveCount(35);
    await expect(rows.first().locator('.module-number')).toHaveText('CLASE 00');
    await expect(rows.last().locator('.module-number')).toHaveText('CLASE 34');
    await expect(rows.first().locator('.module-title')).toHaveText('Fundamentos de Kubernetes');
    await expect(rows.last().locator('.module-title')).toHaveText('Troubleshooting de red y almacenamiento');
    await expect(page.locator('a.module-row')).toHaveCount(1);
    await expect(page.locator('.module-description')).toHaveCount(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await rows.last().scrollIntoViewIfNeeded();
    await expect(rows.last()).toBeVisible();
    await page.goto('/cursos.html');
    const card = page.locator('.coursecard').filter({ has: page.locator('a[href="/cursos/kubernetes-cka/"]') });
    await expect(card).toContainText('35 clases');
    await page.goto('/cursos/kubernetes-cka/clase-00-fundamentos-de-kubernetes/');
    await expect(page.locator('.lesson-section')).toHaveCount(3);
    await expect(page.locator('.lesson-counter')).toHaveText('Clase 00 / 34');
    await expect(page.locator('.course-content ul, .course-content ol')).toHaveCount(0);
    const image = page.locator('.course-content img');
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
