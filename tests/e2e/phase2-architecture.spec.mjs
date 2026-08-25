import { test, expect } from '@playwright/test';

test('Fase 2 · el parser vive en un Worker y conserva PS2 sin degradar la carga',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/terminal.html');
  await page.locator('[data-pick-mode="docker"]').click();
  await page.waitForFunction(()=>document.documentElement.dataset.terminalReady==='true');
  expect(await page.evaluate(()=>document.documentElement.dataset.terminalEngineThread)).toBe('worker');
  const duration=await page.evaluate(()=>performance.getEntriesByName('s2ktux-time-to-terminal-interactive').at(-1)?.duration||0);
  expect(duration).toBeGreaterThan(0);
  expect(duration).toBeLessThan(5000);

  const input=page.locator('#term-input');
  const submit=value=>input.evaluate((element,command)=>{
    element.value=command;
    element.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,cancelable:true}));
  },value);
  await submit("echo 'línea");
  await expect(page.locator('#term-prompt')).toHaveText('>');
  await submit("completa'");
  await page.waitForFunction(()=>document.querySelector('#term-input')?.value===''&&!document.querySelector('#term-input')?.readOnly&&/[@#$] ?$/.test(document.querySelector('#term-prompt')?.textContent||''));
  await expect(page.locator('#term-body')).toContainText(/línea\s*completa/);
  expect(errors).toEqual([]);
});

test('Fase 2 · las páginas estáticas no descargan support.js',async({page})=>{
  const scripts=[];
  page.on('request',request=>{if(request.resourceType()==='script')scripts.push(new URL(request.url()).pathname);});
  await page.goto('/index.html');
  await expect(page.locator('main')).toBeVisible();
  expect(scripts.some(path=>path.endsWith('/support.js'))).toBeFalsy();
});
test('Fase 2 · las rutas antiguas redirigen al HTML estático',async({page})=>{
  await page.goto('/curso.html?c=docker');
  await expect(page).toHaveURL(/\/cursos\/docker\/$/);
  await expect(page.locator('main')).toBeVisible();
  await page.goto('/leccion.html?c=docker&m=2');
  await expect(page).toHaveURL(/\/cursos\/docker\/clase-3-docker-profesional\/$/);
  await expect(page.locator('main')).toBeVisible();
});