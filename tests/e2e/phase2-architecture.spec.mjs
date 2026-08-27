import { test, expect } from '@playwright/test';

const workerDisabled=process.env.S2KTUX_DISABLE_WORKER==='1';
const expectedEngineThread=workerDisabled?'fallback':'worker';

test('Fase 2 · el parser vive en un Worker y conserva PS2 sin degradar la carga',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/terminal.html');
  await page.locator('[data-pick-mode="docker"]').click();
  await page.waitForFunction(()=>document.documentElement.dataset.terminalReady==='true');
  expect(await page.evaluate(()=>document.documentElement.dataset.terminalEngineThread)).toBe(expectedEngineThread);
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
test('Bloque 2 · Kubernetes sincroniza reconciliación en Worker y F5 destruye el clúster',async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('/terminal.html');
  await page.locator('[data-pick-mode="kubernetes"]').click();
  await page.waitForFunction(()=>document.documentElement.dataset.terminalReady==='true');
  expect(await page.evaluate(()=>document.documentElement.dataset.terminalEngineThread)).toBe(expectedEngineThread);
  await page.evaluate(()=>{
    window.__kubernetesWorkerEvents=[];
    document.addEventListener('s2ktux-kubernetes-state',event=>window.__kubernetesWorkerEvents.push({reason:event.detail.reason,pods:event.detail.state.pods.map(pod=>({name:pod.name,status:pod.status}))}));
  });
  const input=page.locator('#term-input');
  const submit=value=>input.evaluate((element,command)=>{element.value=command;element.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,cancelable:true}));},value);
  await submit('kubectl run worker-sync --image=nginx');
  if(workerDisabled){
    await page.waitForTimeout(1200);
  }else{
    await page.waitForFunction(()=>window.__kubernetesWorkerEvents?.some(event=>event.pods.some(pod=>pod.name==='worker-sync'&&pod.status==='Running')),null,{timeout:8000});
  }
  await page.waitForFunction(()=>!document.querySelector('#term-input')?.readOnly&&/[@#$] ?$/.test(document.querySelector('#term-prompt')?.textContent||''));
  await submit('kubectl get pod worker-sync');
  await page.waitForFunction(()=>!document.querySelector('#term-input')?.readOnly&&document.querySelector('#term-body')?.innerText.includes('worker-sync'));
  await expect(page.locator('#term-body')).toContainText(/worker-sync[\s\S]*Running|Running[\s\S]*worker-sync/);

  await page.reload();
  await expect(page.locator('#mode-select')).toBeVisible();
  await page.locator('[data-pick-mode="kubernetes"]').click();
  await page.waitForFunction(()=>document.documentElement.dataset.terminalReady==='true');
  await submit('kubectl get pod worker-sync');
  await page.waitForFunction(()=>!document.querySelector('#term-input')?.readOnly);
  await expect(page.locator('#term-body')).toContainText(/NotFound|not found/);
  expect(errors).toEqual([]);
});

test('Bloque 2 · una excepción no controlada cierra el Worker Kubernetes a mitad de sesión',async({page})=>{
  test.skip(workerDisabled,'Esta prueba necesita un Worker real para provocar su excepción');
  await page.addInitScript(()=>{
    const BrowserWorker=window.Worker;
    window.Worker=class FaultingWorker extends BrowserWorker{
      constructor(url,options){const target=String(url);const source=`import ${JSON.stringify(target)};setTimeout(()=>{throw new Error('S2KTUX_TEST_UNCAUGHT_KUBERNETES_WORKER');},1500);`;super(URL.createObjectURL(new Blob([source],{type:'text/javascript'})),{...options,type:'module'});}
    };
  });
  await page.goto('/terminal.html');
  const workerStarted=page.waitForEvent('worker');
  await page.locator('[data-pick-mode="kubernetes"]').click();
  const worker=await workerStarted;
  await page.waitForFunction(()=>document.documentElement.dataset.terminalReady==='true');
  expect(worker.url()).toMatch(/^blob:/);
  const workerClosed=new Promise(resolve=>worker.once('close',resolve));
  const input=page.locator('#term-input');
  await input.evaluate(element=>{element.value='kubectl get pods --watch';element.dispatchEvent(new Event('input',{bubbles:true}));});
  await workerClosed;
  expect(page.isClosed()).toBeFalsy();
  await expect(page.locator('#term-body')).toContainText('El entorno Kubernetes se ha desconectado');
  expect(await input.inputValue()).toBe('kubectl get pods --watch');
  expect(await input.evaluate(element=>element.readOnly)).toBeFalsy();
});

test('Bloque 2 · Kubernetes recrea el Worker sin confundir reinicio con resincronización',async({page})=>{
  test.skip(workerDisabled,'Esta prueba necesita reiniciar un Worker real');
  await page.addInitScript(()=>{
    const BrowserWorker=window.Worker;let creations=0;
    window.Worker=class RecoverableWorker extends BrowserWorker{
      constructor(url,options){
        creations+=1;
        if(creations===1){const target=String(url),source=`import ${JSON.stringify(target)};setTimeout(()=>{throw new Error('S2KTUX_TEST_FIRST_WORKER_CRASH');},1500);`;super(URL.createObjectURL(new Blob([source],{type:'text/javascript'})),{...options,type:'module'});}
        else super(url,options);
      }
    };
  });
  const workers=[];page.on('worker',worker=>workers.push(worker));
  await page.goto('/terminal.html');
  await page.locator('[data-pick-mode="kubernetes"]').click();
  await page.waitForFunction(()=>document.documentElement.dataset.terminalReady==='true');
  await expect(page.locator('#term-body')).toContainText('El entorno Kubernetes se ha desconectado');
  await expect(page.locator('#term-body')).toContainText('Reinicio automático de Kubernetes · intento 1/3');
  await expect(page.locator('#term-body')).toContainText('Worker Kubernetes reiniciado');
  await expect.poll(()=>workers.length).toBeGreaterThanOrEqual(2);
  expect(await page.evaluate(()=>document.documentElement.dataset.terminalEngineThread)).toBe('worker');
  expect(await page.evaluate(()=>document.documentElement.dataset.terminalClusterSync)).toBe('pending');
  await expect(page).toHaveURL(/terminal\.html\?mode=kubernetes/);
  const input=page.locator('#term-input');
  await input.evaluate(element=>{element.value='kubectl get nodes';element.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,cancelable:true}));});
  await page.waitForFunction(()=>!document.querySelector('#term-input')?.readOnly);
  await expect(page.locator('#term-body')).toContainText('Kubernetes no está inicializado en el Worker');
});
