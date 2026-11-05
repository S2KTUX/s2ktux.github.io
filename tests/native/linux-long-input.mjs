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
 await page.evaluate(({quoted,marker})=>{const bytes=new TextEncoder().encode('/bin/sh -c '+quoted+'; rc=$?; printf "\\n'+marker+'=%s\\n" "$rc"\n');vm.serial0_send(String.fromCharCode(...bytes));},{quoted,marker});
 await page.waitForFunction(({marker,offset})=>new RegExp(marker+'=([0-9]+)\\r?\\n').test(vmTranscript.slice(offset)),{marker,offset},{timeout:90000});
 assert.equal(await page.evaluate(({marker,offset})=>new RegExp(marker+'=([0-9]+)').exec(vmTranscript.slice(offset))[1],{marker,offset}),'0',command);
}
async function check(label,fn){console.log(label);await fn();report.checks.push(label);}
async function prompt(){await page.waitForFunction(()=>/\[root@[^\r\n]+\]# $/.test(vmTranscript.replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,'')),null,{timeout:30000});}
async function type(command){await prompt();await page.evaluate(()=>vmTerminal.focus());await page.keyboard.type(command,{delay:2});await page.keyboard.press('Enter');await prompt();}
try{
 await page.goto(process.env.S2KTUX_LINUX_URL||'http://127.0.0.1:4173/laboratorios/linux-real/');
 await page.waitForFunction(()=>!document.querySelector('#start').disabled);await page.locator('#start').click();
 await page.waitForFunction(()=>['shell','failed'].includes(document.documentElement.dataset.vmState),null,{timeout:240000});
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.vmState),'shell');
 await check('El tamaño real coincide con el dibujo',async()=>{assert.equal(await page.evaluate(()=>vmTerminal.cols),80);await run('test "$(stty size)" = "28 80"; echo "ERROR 12" > /root/eventos-filtro.txt');});
 await check('Escritura que supera el ancho de la consola',async()=>{await page.evaluate(()=>vmTerminal.focus());await page.keyboard.type("grep -E '^ERROR [0-9]+$' /root/eventos-filtro.txt > /root/errores-filtrados.txt",{delay:10});await page.locator('#terminal').screenshot({path:out+'/linea-completa.png'});await page.keyboard.press('Enter');await run('test "$(cat /root/errores-filtrados.txt)" = "ERROR 12"');});
 await check('Pegado de más de 400 caracteres',async()=>{await page.evaluate(text=>vmTerminal.paste("echo '"+text+"' > /root/linea-larga.txt"),'Dato'.repeat(100)+'FIN');await page.keyboard.press('Enter');await run('test "$(wc -c < /root/linea-larga.txt)" = 404 && grep -q FIN /root/linea-larga.txt');});
 await check('Flechas y borrado no corrompen la línea',async()=>{await page.evaluate(()=>vmTerminal.focus());await page.keyboard.type('echo edicion > /root/edicion-incorrecta');await page.keyboard.press('ArrowLeft');await page.keyboard.press('ArrowRight');for(let i=0;i<10;i++)await page.keyboard.press('Backspace');await page.keyboard.type('correcta');await page.keyboard.press('Enter');await run('test "$(cat /root/edicion-correcta)" = edicion');});
 if(process.env.S2KTUX_LINUX_EXTENDED==='1'){
 await check('Escritura continua de más de 600 caracteres',async()=>{await type("echo '"+'texto'.repeat(120)+"FINAL' > /root/teclado-largo.txt");await run('test "$(wc -c < /root/teclado-largo.txt)" = 606 && grep -q FINAL /root/teclado-largo.txt');});
 await check('Inicio, Fin y Suprimir al editar',async()=>{await prompt();await page.keyboard.type('xxecho inicio-fin > /root/inicio-fin.txt');await page.keyboard.press('Home');await page.keyboard.press('Delete');await page.keyboard.press('Delete');await page.keyboard.press('End');await page.keyboard.press('Enter');await run('test "$(cat /root/inicio-fin.txt)" = inicio-fin');});
 await check('Ctrl+U y Ctrl+W permiten corregir el comando',async()=>{await prompt();await page.keyboard.type('una linea que debe desaparecer');await page.keyboard.press('Control+u');await page.keyboard.type('echo palabras descartar');await page.keyboard.press('Control+w');await page.keyboard.type('> /root/palabras.txt');await page.keyboard.press('Enter');await run('test "$(cat /root/palabras.txt)" = palabras');});
 await check('Historial con flecha arriba',async()=>{await run('rm -f /root/historial-prueba.txt');await type('echo repetido >> /root/historial-prueba.txt');await page.keyboard.press('ArrowUp');await page.keyboard.press('Enter');await run('test "$(wc -l < /root/historial-prueba.txt)" = 2');});
 await check('Autocompletar rutas con Tab',async()=>{await run('mkdir -p /root/autocompletado-prueba-unico');await prompt();await page.keyboard.type('echo completo > /root/autocompletado-pru');await page.keyboard.press('Tab');await page.keyboard.type('resultado.txt');await page.keyboard.press('Enter');await run('test "$(cat /root/autocompletado-prueba-unico/resultado.txt)" = completo');});
 await check('Acentos y eñes llegan completos al archivo',async()=>{await prompt();await page.keyboard.insertText("echo 'Información: configuración y español' > /root/acentos.txt");await page.keyboard.press('Enter');await run("test \"$(cat /root/acentos.txt)\" = 'Información: configuración y español'");});
 await check('Pegado de varias líneas',async()=>{await prompt();await page.evaluate(()=>vmTerminal.paste('echo primera > /root/multilinea.txt\necho segunda >> /root/multilinea.txt'));await page.keyboard.press('Enter');await run('test "$(wc -l < /root/multilinea.txt)" = 2 && grep -qx segunda /root/multilinea.txt');});
 await check('Ctrl+C interrumpe un proceso y devuelve la entrada',async()=>{await prompt();await page.keyboard.type('sleep 30');await page.keyboard.press('Enter');await page.waitForTimeout(300);await page.keyboard.press('Control+c');await prompt();await type('echo cancelado > /root/cancelado.txt');await run('test "$(cat /root/cancelado.txt)" = cancelado');});
 await check('Ctrl+Q recupera la salida tras Ctrl+S',async()=>{await prompt();await page.keyboard.press('Control+s');await page.keyboard.type('echo reanudado > /root/reanudado.txt');await page.keyboard.press('Enter');await page.waitForTimeout(200);await page.keyboard.press('Control+q');await prompt();await run('test "$(cat /root/reanudado.txt)" = reanudado');});
 await check('Editar un archivo con vi y volver al prompt',async()=>{await prompt();await page.keyboard.type('vi /root/editor-prueba.txt');await page.keyboard.press('Enter');await page.waitForFunction(()=>vmTranscript.includes('editor-prueba.txt'));await page.waitForTimeout(200);await page.keyboard.type('i');await page.keyboard.type('texto del editor');await page.keyboard.press('Escape');await page.keyboard.type(':wq');await page.keyboard.press('Enter');await prompt();await run('test "$(cat /root/editor-prueba.txt)" = "texto del editor"');});
 await check('Limpiar la pantalla no pierde la siguiente entrada',async()=>{await page.keyboard.press('Control+l');await type('echo pantalla > /root/pantalla.txt');await run('test "$(cat /root/pantalla.txt)" = pantalla');});
 await check('Guardar y recuperar conserva los archivos y la escritura',async()=>{await prompt();await page.evaluate(()=>vmSaveSession());await page.reload();await page.waitForFunction(()=>!document.querySelector('#start').disabled);await page.locator('#start').click();await page.waitForFunction(()=>document.documentElement.dataset.vmState==='shell',null,{timeout:240000});await run('test "$(stty size)" = "28 80" && test "$(cat /root/editor-prueba.txt)" = "texto del editor"');await type('echo recuperado > /root/recuperado.txt');await run('test "$(cat /root/recuperado.txt)" = recuperado');});
 }
 await check('Consola estrecha sin desbordar la página',async()=>{await page.setViewportSize({width:375,height:812});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));});
 report.passed=true;
}catch(error){report.error=error.stack;report.tail=await page.evaluate(()=>globalThis.vmTranscript?.slice(-1800)).catch(()=>null);process.exitCode=1;}
finally{await writeFile(out+'/resultado.json',JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report));}
