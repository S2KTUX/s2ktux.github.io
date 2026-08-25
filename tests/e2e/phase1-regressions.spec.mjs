import { test, expect } from '@playwright/test';

async function enter(page, mode) {
  await page.goto(`/terminal.html?mode=${mode}&enter=1`);
  await page.locator('#term-input').waitFor({ state:'attached' });
  await page.waitForFunction(() => document.documentElement.dataset.terminalReady === 'true');
}

async function run(page, command, timeout = 8_000) {
  const before = await page.locator('#term-body .term-out').count();
  await page.locator('#term-input').evaluate((input, value) => {
    input.value = value;
    input.dispatchEvent(new KeyboardEvent('keydown', { key:'Enter', code:'Enter', bubbles:true }));
  }, command);
  await page.waitForFunction(() => {
    const input = document.querySelector('#term-input');
    return input && !input.disabled && !input.readOnly && input.value === '' && !document.querySelector('#term-editor,#term-pager');
  }, null, { timeout });
  return page.locator('#term-body .term-out').evaluateAll((nodes, start) => nodes.slice(start).map(node => node.textContent).join('\n'), before);
}

test('Fase 1 · Docker conserva opciones repetidas y F5 destruye el estado', async ({ page }) => {
  await enter(page, 'docker');
  await run(page, 'docker pull nginx', 15_000);
  await run(page, 'docker run -d --name multi -p 8080:80 -p 8443:443 -v datos:/data -v cache:/cache -e A=1 -e B=2 nginx');
  const listing = await run(page, 'docker ps --all');
  expect(listing).toContain('8080');
  expect(listing).toContain('8443');
  await page.reload();
  await expect(page.locator('#mode-select')).toBeVisible();
  await page.locator('[data-pick-mode="docker"]').click();
  await page.waitForFunction(() => document.documentElement.dataset.terminalReady === 'true');
  await expect(await run(page, 'docker ps --all')).not.toContain('multi');
});

test('Fase 1 · Linux separa firewalld y modela enlaces y fechas', async ({ page }) => {
  await enter(page, 'linux');
  await page.locator('#term-solved').click();
  await page.waitForFunction(() => /root@/.test(document.querySelector('#term-prompt')?.textContent || ''));
  await run(page, 'touch /tmp/reciente');
  expect(await run(page, 'find /tmp -mmin -1 -name reciente')).toContain('/tmp/reciente');
  await run(page, 'ln -s /etc/hostname /tmp/hostlink');
  expect(await run(page, 'ls -l /tmp')).toContain('hostlink -> /etc/hostname');
  await run(page, 'firewall-cmd --add-service=cockpit --permanent');
  expect(await run(page, 'firewall-cmd --query-service=cockpit')).toMatch(/no/);
  expect(await run(page, 'firewall-cmd --permanent --query-service=cockpit')).toMatch(/yes/);
  await run(page, 'firewall-cmd --reload');
  expect(await run(page, 'firewall-cmd --query-service=cockpit')).toMatch(/yes/);
});

test('Fase 1 · Kubernetes rechaza opciones desconocidas y requisitos ausentes', async ({ page }) => {
  await enter(page, 'kubernetes');
  expect(await run(page, 'kubectl get pods --inventada')).toContain('unknown flag');
  expect(await run(page, 'kubectl run web')).toMatch(/image.*not set/);
});
