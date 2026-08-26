import { test, expect } from '@playwright/test';

async function openTerminal(page, mode='docker') {
  await page.goto('/terminal.html?mode='+mode+'&enter=1');
  await page.waitForFunction(() => document.documentElement.dataset.terminalReady === 'true');
  await expect(page.locator('.xterm-helper-textarea')).toBeAttached();
}

test('Fase 5 · un único árbol accesible y entrada xterm etiquetada', async ({ page }) => {
  await openTerminal(page);
  await expect(page.locator('#term-body')).toHaveAttribute('aria-hidden','true');
  await expect(page.locator('.xterm-helper-textarea')).toHaveAttribute('aria-label','Entrada de la terminal S2KTUX');
  await expect(page.locator('.xterm-helper-textarea')).toHaveAttribute('aria-describedby','terminal-keyboard-help');
  await expect(page.locator('.xterm-accessibility')).toHaveCount(1);
});

test('Fase 5 · la terminal móvil no abre el teclado hasta que el usuario la toca @mobile', async ({ page }) => {
  await openTerminal(page);
  const focusedBefore = await page.evaluate(() => document.activeElement?.classList.contains('xterm-helper-textarea'));
  expect(focusedBefore).toBe(false);
  await page.locator('#term-xterm').tap();
  await expect(page.locator('.xterm-helper-textarea')).toBeFocused();
});
