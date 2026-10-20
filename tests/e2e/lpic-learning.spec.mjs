import {test,expect} from '@playwright/test';
const mark=(page,id)=>page.locator('#practice-grid button[data-question-id="'+id+'"]');
const first='daypo-101-001',second='daypo-102-002',attemptKey='s2ktux-lpic-daypo-attempt-v1';
async function goQuestion(page,id){await mark(page,id).click();await expect(page.locator('#practice-question')).toHaveAttribute('data-question-id',id);}
async function answerFirst(page){await goQuestion(page,first);await page.getByLabel('ext2',{exact:true}).check();await page.locator('#check').click();}

test('LPIC-1 · bancos Daypo, índice lateral y marcas guardadas',async({page})=>{
 const heavy=[],remote=[];page.on('request',r=>{if(/\.wasm|\.part|\.gzpart|disco-fragmentado/.test(r.url()))heavy.push(r.url());if(/daypo\.com/.test(r.url()))remote.push(r.url());});
 await page.goto('/terminal.html');await page.locator('[data-pick-mode=lpic]').click();
 await expect(page).toHaveURL(/laboratorios\/lpic-1\/$/);await expect(page.locator('body')).toHaveCSS('background-color','rgb(246, 236, 217)');
 await expect(page.locator('#topic,#question')).toHaveCount(0);await expect(page.locator('#practice-grid button')).toHaveCount(120);
 await expect(page.locator('#quiz-note')).toContainText('Deza92');await expect(page.locator('#quiz-note a[href="https://www.daypo.com/lpic-101-500.html"]')).toHaveCount(1);
 const placement=await page.evaluate(()=>{const main=document.querySelector('.quiz-practice-main').getBoundingClientRect(),side=document.querySelector('#practice-index').getBoundingClientRect(),list=document.querySelector('#practice-grid');return{side:side.left>=main.right,scroll:list.scrollHeight>list.clientHeight};});expect(placement).toEqual({side:true,scroll:true});
 await goQuestion(page,first);await expect(mark(page,first)).toHaveAttribute('data-state','pending');
 await page.getByLabel('XFS',{exact:true}).check();await expect(mark(page,first)).toHaveAttribute('data-state','answered');
 await page.locator('#check').click();await expect(page.locator('#feedback')).toContainText('Incorrecto');await expect(page.locator('#feedback')).toContainText('ext2');await expect(mark(page,first)).toHaveAttribute('data-state','failed');
 await expect(page.locator('#practice-failed')).toHaveText('Fallos: 1');await answerFirst(page);
 await expect(mark(page,first)).toHaveAttribute('data-state','passed');await expect(mark(page,first)).toContainText('✓');
 await expect(page.locator('#practice-correct')).toHaveText('Aciertos: 1');await expect(page.locator('#practice-failed')).toHaveText('Fallos: 0');
 await page.reload();await expect(mark(page,first)).toHaveAttribute('data-state','passed');await goQuestion(page,first);await expect(page.getByLabel('ext2',{exact:true})).toBeChecked();
 page.on('dialog',d=>d.accept());await page.getByRole('button',{name:'Borrar progreso',exact:true}).click();await expect(mark(page,first)).toHaveAttribute('data-state','pending');
 expect(heavy).toEqual([]);expect(remote).toEqual([]);
});

test('LPIC-1 · varias respuestas y respuesta escrita, con explicación',async({page})=>{
 await page.goto('/laboratorios/lpic-1/');await goQuestion(page,'daypo-101-010');
 await page.getByLabel('mount',{exact:true}).check();await page.locator('#check').click();await expect(page.locator('#feedback')).toContainText('Incorrecto');
 await page.getByLabel('cat /proc/self/mounts',{exact:true}).check();await page.locator('#check').click();await expect(page.locator('#feedback')).toContainText('Correcto');
 await goQuestion(page,'daypo-101-006');await page.getByRole('textbox').fill('updatedb');await page.locator('#check').click();await expect(page.locator('#feedback')).toContainText('Correcto');
 await page.locator('#solution').click();await expect(page.locator('#solution-body')).toBeVisible();await expect(page.locator('#solution')).toHaveText('Ocultar solución');
});

test('LPIC-1 · mezcla automática al entrar y progreso separado por examen',async({page})=>{
 await page.goto('/laboratorios/lpic-1/');const order=()=>page.locator('#practice-grid button').evaluateAll(nodes=>nodes.map(n=>n.dataset.questionId));
 const initial=await order();expect(new Set(initial).size).toBe(120);
 await expect(page.locator('#practice-mix')).toHaveCount(0);await expect(page.locator('#practice-index')).toBeVisible();
 await page.locator('#practice-next').click();await expect(page.locator('#practice-position')).toHaveText('Pregunta 2 de 120');
 await page.locator('#practice-previous').click();await expect(page.locator('#practice-position')).toHaveText('Pregunta 1 de 120');await answerFirst(page);
 await page.locator('#mode-exam').click();await page.locator('#mode-practice').click();expect(await order()).not.toEqual(initial);await expect(mark(page,first)).toHaveAttribute('data-state','passed');
 const mixed=await order();await page.reload();expect(await order()).not.toEqual(mixed);await expect(page.locator('#practice-position')).toHaveText('Pregunta 1 de 120');
 const reloaded=await order();await page.locator('#mode-practice').click();expect(await order()).not.toEqual(reloaded);await expect(mark(page,first)).toHaveAttribute('data-state','passed');
 await page.selectOption('#exam-code','102');await expect(page.locator('#practice-grid button')).toHaveCount(120);expect((await order()).every(id=>id.startsWith('daypo-102-'))).toBe(true);
 await goQuestion(page,second);await page.getByLabel('2001:db8:3241::1',{exact:true}).check();await page.locator('#check').click();await expect(mark(page,second)).toHaveAttribute('data-state','passed');
 await page.selectOption('#exam-code','101');await expect(mark(page,first)).toHaveAttribute('data-state','passed');
 page.on('dialog',d=>d.accept());await page.locator('#practice-clear').click();await expect(mark(page,first)).toHaveAttribute('data-state','pending');
 await page.selectOption('#exam-code','102');await expect(mark(page,second)).toHaveAttribute('data-state','passed');
});

test('LPIC-1 · examen de 60 sobre 120, sin pistas y con reanudación',async({page})=>{
 await page.goto('/laboratorios/lpic-1/');await page.locator('#mode-exam').click();await page.locator('#start-exam').click();
 await expect(page.locator('#exam-question option')).toHaveCount(60);await expect(page.locator('#check')).toBeHidden();await expect(page.locator('#solution')).toBeHidden();await expect(page.locator('#practice-index')).toBeHidden();await expect(page.locator('#exam-question-body .quiz-correction-note')).toHaveCount(0);
 await expect(page.locator('#time')).toHaveText(/01:2[89]:\d\d|01:30:00/);
 const ids=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).ids,attemptKey);expect(new Set(ids).size).toBe(60);expect(ids.every(id=>id.startsWith('daypo-101-'))).toBe(true);
 const input=page.locator('#exam-question-body input').first();if(await input.getAttribute('type')==='text')await input.fill('respuesta');else await input.check();
 await expect(page.locator('#answered-count')).toContainText('1 de 60');await page.reload();await expect(page.locator('#answered-count')).toContainText('1 de 60');expect(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).ids,attemptKey)).toEqual(ids);
 page.on('dialog',d=>d.accept());await page.locator('#finish-exam').click();await expect(page.locator('#domains .exam-domain')).toHaveCount(4);await expect(page.locator('#verdict')).toContainText('No aprobado');await expect(page.locator('#review')).not.toHaveAttribute('open','');await expect(page.locator('#question-report details')).toHaveCount(60);
 await page.locator('#new-exam').click();await page.locator('#start-exam').click();const next=await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).ids,attemptKey);expect([...next].sort()).not.toEqual([...ids].sort());
 await page.locator('#finish-exam').click();await page.locator('#mode-practice').click();await page.reload();await expect(page.locator('#practice-panel')).toBeVisible();await expect(page.locator('#results')).toBeHidden();
});

test('LPIC-1 · no mezcla las marcas ni el intento del banco anterior',async({page})=>{
 await page.goto('/sobre.html');await page.evaluate(()=>{
  localStorage.setItem('s2ktux-practice-progress-v1:lpic-1',JSON.stringify({'101.1-1':{state:'passed'},'105.1-1':{state:'failed'}}));
  localStorage.setItem('s2ktux-lpic-practice-v2',JSON.stringify({code:'102',view:'exam'}));
  localStorage.setItem('s2ktux-lpic-attempt-v1',JSON.stringify({phase:'running',ids:['101.1-1'],deadline:Date.now()+100000}));
 });
 await page.goto('/laboratorios/lpic-1/');await expect(mark(page,first)).toHaveAttribute('data-state','pending');await expect(page.locator('#practice-panel')).toBeVisible();
 await answerFirst(page);await page.reload();await expect(mark(page,first)).toHaveAttribute('data-state','passed');
 page.on('dialog',d=>d.accept());await page.locator('#practice-clear').click();await page.reload();await expect(mark(page,first)).toHaveAttribute('data-state','pending');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('s2ktux-practice-progress-v1:lpic-1'))['101.1-1'].state)).toBe('passed');expect(await page.evaluate(()=>localStorage.getItem('s2ktux-lpic-attempt-v1'))).not.toBeNull();
});

test('LPIC-1 · imágenes locales y erratas documentadas',async({page})=>{
 await page.goto('/laboratorios/lpic-1/');await goQuestion(page,'daypo-101-095');await page.getByLabel('SIGTSTP',{exact:true}).check();await page.locator('#check').click();await expect(page.locator('#feedback')).toContainText('Correcto');await expect(page.locator('#feedback .quiz-correction-note')).toContainText('SIGTSTP, no SIGSTOP');
 const response=await page.request.get('/contenido/lpic-1-correcciones.md');expect(response.ok()).toBe(true);expect(await response.text()).toContain('101 · pregunta 95');await expect(page.locator('#feedback a')).toHaveAttribute('href','/contenido/lpic-1-correcciones.md');
 await page.selectOption('#exam-code','102');
 for(const [id,path]of [['daypo-102-093','lpic-daypo-102-093.jpg'],['daypo-102-100','lpic-daypo-102-100.jpg']]){
  await goQuestion(page,id);await expect(page.locator('#practice-question img')).toHaveAttribute('src','/images/'+path);await expect.poll(()=>page.locator('#practice-question img').evaluate(n=>n.complete&&n.naturalWidth>0)).toBe(true);
 }
});

test('LPIC-1 · índice móvil claro y oscuro, sin desbordamiento @mobile',async({page})=>{
 await page.setViewportSize({width:320,height:800});await page.goto('/laboratorios/lpic-1/');await answerFirst(page);
 const light=await mark(page,first).evaluate(n=>getComputedStyle(n).color);await page.locator('[data-theme-toggle]').click();const dark=await mark(page,first).evaluate(n=>getComputedStyle(n).color);expect(dark).not.toBe(light);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.selectOption('#exam-code','102');await goQuestion(page,'daypo-102-100');await expect.poll(()=>page.locator('#practice-question img').evaluate(n=>n.complete&&n.naturalWidth>0)).toBe(true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.locator('#mode-exam').click();await page.locator('#start-exam').click();page.on('dialog',d=>d.accept());await page.locator('#finish-exam').click();await expect(page.locator('#domains .exam-domain')).toHaveCount(6);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

test('Recursos de arranque · caché comprobada sin sustituir un archivo alterado',async({page})=>{
 await page.goto('/sobre.html');const result=await page.evaluate(async()=>{const {verifiedDownload}=await import('/laboratorios/verified-download.mjs');const data=new TextEncoder().encode('recurso de prueba'),hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',data)),b=>b.toString(16).padStart(2,'0')).join('');let requests=0;const original=fetch;globalThis.fetch=async()=>{requests++;return new Response(data);};try{const url=new URL('/qa-verificado-'+crypto.randomUUID(),location.href).href;await verifiedDownload(url,{hash,bytes:data.length});await verifiedDownload(url,{hash,bytes:data.length});const first=requests;const cache=await caches.open('lab-verified-downloads-v1');await cache.put(url,new Response('alterado'));await verifiedDownload(url,{hash,bytes:data.length});await cache.delete(url);return {first,total:requests};}finally{globalThis.fetch=original;}});expect(result).toEqual({first:1,total:2});
});
