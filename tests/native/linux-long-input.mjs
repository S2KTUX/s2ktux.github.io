// Prueba manual con Linux real. No usa las sesiones del navegador del alumno.
// S2KTUX_LINUX_URL puede apuntar a la candidata local o a la web publicada.
import assert from 'node:assert/strict';
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
const out=process.env.S2KTUX_QA_OUT||'test-results/linux-long-input';await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:1100,height:900}}),report={passed:false,checks:[]};
async function run(command){
 const marker='__LONG_INPUT_'+crypto.randomUUID().replaceAll('-',''),offset=await page.evaluate(()=>vmTranscript.length);
 const quoted="'"+('set -e; '+command).replaceAll("'","'\\''")+"'";
 await page.evaluate(({quoted,marker})=>vm.serial0_send('/bin/sh -c '+quoted+'; rc=$?; printf "\\n'+marker+'=%s\\n" "$rc"\n'),{quoted,marker});
 await page.waitForFunction(({marker,offset})=>new RegExp(marker+'=([0-9]+)\\r?\\n').test(vmTranscript.slice(offset)),{marker,offset},{timeout:90000});
 assert.equal(await page.evaluate(({marker,offset})=>new RegExp(marker+'=([0-9]+)').exec(vmTranscript.slice(offset))[1],{marker,offset}),'0',command);
}
async function check(label,fn){console.log(label);await fn();report.checks.push(label);}
try{
 await page.goto(process.env.S2KTUX_LINUX_URL||'http://127.0.0.1:4173/laboratorios/linux-real/');
 await page.waitForFunction(()=>!document.querySelector('#start').disabled);await page.locator('#start').click();
 await page.waitForFunction(()=>['shell','failed'].includes(document.documentElement.dataset.vmState),null,{timeout:240000});
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.vmState),'shell');
 await check('El tamaño real coincide con el dibujo',async()=>{assert.equal(await page.evaluate(()=>vmTerminal.cols),80);await run('test "$(stty size)" = "28 80"; echo "ERROR 12" > /root/eventos-filtro.txt');});
 await check('Escritura que supera el ancho de la consola',async()=>{await page.evaluate(()=>vmTerminal.focus());await page.keyboard.type("grep -E '^ERROR [0-9]+$' /root/eventos-filtro.txt > /root/errores-filtrados.txt",{delay:10});await page.locator('#terminal').screenshot({path:out+'/linea-completa.png'});await page.keyboard.press('Enter');await run('test "$(cat /root/errores-filtrados.txt)" = "ERROR 12"');});
 await check('Pegado de más de 400 caracteres',async()=>{await page.evaluate(text=>vmTerminal.paste("echo '"+text+"' > /root/linea-larga.txt"),'Dato'.repeat(100)+'FIN');await page.keyboard.press('Enter');await run('test "$(wc -c < /root/linea-larga.txt)" = 404 && grep -q FIN /root/linea-larga.txt');});
 await check('Flechas y borrado no corrompen la línea',async()=>{await page.evaluate(()=>vmTerminal.focus());await page.keyboard.type('echo edicion > /root/edicion-incorrecta');await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowRight');for(let i=0;i<10;i++)await page.keyboard.press('Backspace');await page.keyboard.type('correcta');await page.keyboard.press('Enter');await run('test "$(cat /root/edicion-correcta)" = edicion');});
 await check('Consola estrecha sin desbordar la página',async()=>{await page.setViewportSize({width:375,height:812});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));});
 report.passed=true;
}catch(error){report.error=error.stack;report.tail=await page.evaluate(()=>globalThis.vmTranscript?.slice(-1800)).catch(()=>null);process.exitCode=1;}
finally{await writeFile(out+'/resultado.json',JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report));}
