import assert from 'node:assert/strict';
import { createReadStream, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

let chromium;
try {
  ({ chromium } = await import('playwright'));
} catch {
  const bundled = 'C:/Users/alaim/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
  if (!existsSync(bundled)) throw new Error('Playwright no está instalado. Ejecuta npm install.');
  ({ chromium } = await import(pathToFileURL(bundled).href));
}

const root = normalize(join(fileURLToPath(new URL('.', import.meta.url)), '..'));
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8', '.woff2':'font/woff2', '.png':'image/png' };
const server = createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
  const file = normalize(join(root, relative));
  if (!file.startsWith(root) || !existsSync(file)) { response.writeHead(404); response.end('Not found'); return; }
  response.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream', 'cache-control':'no-store' });
  createReadStream(file).pipe(response);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch({ headless:true });
const page = await browser.newPage({ viewport:{ width:1280, height:900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));

async function enter(mode) {
  await page.goto(`${origin}/terminal.html?mode=${mode}&enter=1`, { waitUntil:'networkidle' });
  await page.locator('#term-input').waitFor({ state:'attached' });
  await page.waitForFunction(() => !document.querySelector('#term-input')?.disabled);
}

async function run(command, wait = 80) {
  const before = await page.locator('#term-body .term-out').count();
  await page.locator('#term-input').evaluate((input, value) => {
    input.value = value;
    input.dispatchEvent(new KeyboardEvent('keydown', { key:'Enter', code:'Enter', keyCode:13, which:13, bubbles:true }));
  }, command);
  await page.waitForTimeout(wait);
  return (await page.locator('#term-body .term-out').evaluateAll((nodes, start) => nodes.slice(start).map(node => node.textContent).join('\n'), before)).trim();
}

try {
  await enter('docker');
  assert.match(await run('docker version'), /Server: Docker Engine/);
  assert.match(await run('docker ps --inventada'), /opción no reconocida/);
  assert.match(await run('docker run -d --name multi -p 8080:80 -p 8443:443 -v datos:\/var\/lib\/datos -e A=1 -e B=2 nginx', 150), /^[a-f0-9]{12}$/m);
  const dockerPs = await run('docker ps --all');
  assert.match(dockerPs, /8080:80/);
  assert.match(dockerPs, /8443:443/);
  await page.reload({ waitUntil:'networkidle' });
  assert.equal(await page.locator('#mode-select').isVisible(), true, 'F5 debe volver al selector');
  await enter('docker');
  assert.doesNotMatch(await run('docker ps --all'), /multi/, 'F5 debe borrar el estado de Docker');

  await enter('linux');
  assert.match(await page.locator('#term-prompt').textContent(), /login:$/);
  await page.locator('#term-solved').click();
  await page.waitForFunction(() => /root@/.test(document.querySelector('#term-prompt')?.textContent || ''), null, { timeout:6000 });
  assert.match(await run('ls --inventada'), /opción no reconocida/);
  await run('touch /tmp/reciente');
  assert.match(await run('find /tmp -mmin -1 -name reciente'), /\/tmp\/reciente/);
  await run('ln -s /etc/hostname /tmp/hostlink');
  assert.match(await run('ls -l /tmp'), /hostlink -> \/etc\/hostname/);
  assert.match(await run('cat /tmp/hostlink'), /nodo1\.lab\.local/);
  await run('firewall-cmd --add-service=cockpit --permanent');
  assert.match(await run('firewall-cmd --query-service=cockpit'), /^no$/m);
  assert.match(await run('firewall-cmd --permanent --query-service=cockpit'), /^yes$/m);
  await run('firewall-cmd --reload');
  assert.match(await run('firewall-cmd --query-service=cockpit'), /^yes$/m);
  await run('su - visitor');
  assert.match(await run('touch /root/sin-permiso'), /Permiso denegado|Permission denied/);
  await run('exit');

  await enter('kubernetes');
  assert.match(await run('kubectl get pods --inventada'), /unknown flag/);
  assert.match(await run('kubectl run web'), /image.*not set/);
  assert.match(await run('kubectl run web --image=nginx', 1100), /pod\/web created/);
  assert.match(await run('kubectl get pod web'), /web.*Running/s);

  assert.deepEqual(errors, [], `Errores JavaScript en navegador:\n${errors.join('\n')}`);
  console.log('terminal e2e: Linux, Docker, Kubernetes, F5 y estados causales validados');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
