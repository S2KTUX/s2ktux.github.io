// Consola de revisión visual para esta web propia. Todos los cambios de la VM
// pasan por las teclas, el portapapeles y los botones públicos de la página.
import {chromium} from '@playwright/test';
import readline from 'node:readline';
import {mkdir} from 'node:fs/promises';
const out=process.env.S2KTUX_QA_OUT||'test-results/linux-ui-session';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});const context=await browser.newContext({viewport:{width:1200,height:950}});
const url=process.env.S2KTUX_LINUX_URL||'http://127.0.0.1:4185/laboratorios/linux-real/?scenario=recovery';
await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:new URL(url).origin});
const page=await context.newPage();page.on('dialog',dialog=>dialog.accept());
await page.goto(url);await page.waitForFunction(()=>!document.querySelector('#start')?.disabled);await page.locator('#start').click();
console.log('SESION ABIERTA');
async function screen(){return page.evaluate(()=>{const t=globalThis.vmTerminal;if(!t)return document.body.innerText;const b=t.buffer.active;return Array.from({length:t.rows},(_,i)=>b.getLine(b.viewportY+i)?.translateToString()||'').join('\n');});}
for await(const line of readline.createInterface({input:process.stdin,crlfDelay:Infinity})){
 try{const a=JSON.parse(line);if(a.action==='close'){await browser.close();break;}
  if(a.action==='key'){await page.locator('#terminal').click();for(const key of a.keys||[a.key])await page.keyboard.press(key);}
  if(a.action==='type'){await page.locator('#terminal').click();await page.keyboard.type(a.text,{delay:5});if(a.enter)await page.keyboard.press('Enter');}
  if(a.action==='paste'){await page.evaluate(text=>navigator.clipboard.writeText(text),a.text);await page.locator('#terminal').click({button:'right'});await page.waitForTimeout(100);if(a.enter)await page.keyboard.press('Enter');}
  if(a.action==='click')await page.locator(a.selector).click();
  if(a.action==='select')await page.locator(a.selector).selectOption(a.value);
  if(a.action==='shot'){const path=out+'/'+(a.name||'pantalla')+'.png';if(a.full)await page.screenshot({path,fullPage:true});else await page.locator('#terminal').screenshot({path});console.log('IMAGEN '+path);}
  if(a.action==='ready')await page.waitForFunction(()=>['shell','failed'].includes(document.documentElement.dataset.vmState),null,{timeout:240000});
  if(a.action==='info')console.log(JSON.stringify(await page.evaluate(()=>({state:document.documentElement.dataset.vmState,status:document.querySelector('#status')?.textContent,save:document.querySelector('#session-status')?.textContent,feedback:document.querySelector('[data-exercise-feedback]')?.textContent}))));
  if(a.action==='wait'){const end=Date.now()+Math.min(a.ms||30000,60000);while(Date.now()<end){const s=await screen();if(s.includes(a.text)){console.log('ENCONTRADO '+a.text);break;}await page.waitForTimeout(50);}}
  await page.waitForTimeout(150);console.log(await screen());
 }catch(error){console.log('ERROR '+error.message);}
}
await browser.close();
process.stdin.pause();
