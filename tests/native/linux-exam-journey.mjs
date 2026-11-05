// Intentos privados del simulacro real, manejados con sus botones y la TTY.
import {chromium} from '@playwright/test';
import {mkdir,writeFile} from 'node:fs/promises';
import {examQuestions} from '../../laboratorios/linux-real/v86-exam-data.mjs';
import {solutionsFor} from '../../laboratorios/solution-options.mjs';
import {cleanSerial,atShellPrompt} from '../../laboratorios/linux-real/v86-check-runner.mjs';
const out=process.env.S2KTUX_QA_OUT||'test-results/linux-exam-journey';await mkdir(out,{recursive:true});
const url=process.env.S2KTUX_EXAM_URL||'http://127.0.0.1:4185/laboratorios/linux-real/examen.html';
const browser=await chromium.launch({headless:true}),context=await browser.newContext({viewport:{width:1300,height:1050}});
await context.grantPermissions(['clipboard-read','clipboard-write'],{origin:new URL(url).origin});
const page=await context.newPage(),report={started:new Date().toISOString(),attempts:[],steps:[],errors:[]};
let observing=false,lastStatus='';const observer=setInterval(async()=>{if(observing)return;observing=true;try{const s=await page.locator('#exam-status').innerText({timeout:1000});if(s!==lastStatus){console.log('ESTADO '+s);lastStatus=s;for(const f of page.frames().filter(f=>f.url().includes('node=')))console.log('CONSOLA '+JSON.stringify(await f.evaluate(()=>({status:document.querySelector('#status')?.textContent,state:document.documentElement.dataset.vmState,tail:(globalThis.vmTranscript||'').slice(-2500)}))));await page.screenshot({path:out+'/estado.png',fullPage:true});}}catch{}finally{observing=false;}},10000);observer.unref();
page.on('dialog',dialog=>dialog.accept());page.on('pageerror',e=>report.errors.push(e.message));
const pause=ms=>page.waitForTimeout(ms);
async function wait(predicate,timeout=180000){const end=Date.now()+timeout;while(Date.now()<end){for(const f of page.frames().filter(f=>f.url().includes('node='))){const failure=await f.evaluate(()=>document.documentElement.dataset.vmState==='failed'?document.querySelector('#status')?.textContent:null);if(failure)throw Error('La máquina comunica: '+failure);}if(await predicate())return;await pause(120);}throw Error('No se alcanzó la pantalla esperada');}
class Console{
 constructor(frame){this.f=frame;}
 text(){return this.f.evaluate(()=>globalThis.vmTranscript||'');}
 screen(){return this.f.evaluate(()=>{const t=globalThis.vmTerminal;if(!t)return '';const b=t.buffer.active;return Array.from({length:t.rows},(_,i)=>b.getLine(b.viewportY+i)?.translateToString()||'').join('\n');});}
 async prompt(rescue=false){await wait(async()=>{const t=await this.text();return atShellPrompt(t)||rescue&&/(?:switch_root:\/#|root@[^\r\n]*:\/#)\s*$/.test(cleanSerial(t));});}
 async keys(...keys){await this.f.locator('#terminal').click();for(const key of keys)await page.keyboard.press(key);}
 async type(s,enter=true){await this.f.locator('#terminal').click();await page.keyboard.type(s,{delay:3});if(enter)await page.keyboard.press('Enter');}
 async paste(s,enter=true){await page.bringToFront();await this.f.locator('#terminal').click();await this.f.evaluate(s=>navigator.clipboard.writeText(s),s);await this.f.locator('#terminal').click({button:'right'});await pause(150);if(enter)await page.keyboard.press('Enter');}
 async cmd(s,rescue=false){if(!s.trim())return;await this.prompt(rescue);const n=(await this.text()).length;await this.paste(s);let last='';
  await wait(async()=>{const t=cleanSerial((await this.text()).slice(n));if(atShellPrompt(t)||rescue&&/(?:switch_root:\/#|root@[^\r\n]*:\/#)\s*$/.test(t))return true;
   const screen=await this.screen();if(screen.includes('(END)')){await page.keyboard.press('q');return false;}
   if(/(?:Is this ok|Do you want to continue|Do you really want)[^\r\n]*[?:]\s*$/i.test(t)&&t!==last){last=t;await page.keyboard.type('y');await page.keyboard.press('Enter');}return false;},240000);
 }
 async edit(path,value){await this.prompt();await this.type('vi '+path);await pause(300);await page.keyboard.press('Escape');await page.keyboard.type('ggdGi');await this.paste(value,false);await page.keyboard.press('Escape');await page.keyboard.type(':wq');await page.keyboard.press('Enter');await this.prompt();}
 async password(user,value,rescue=false){await this.prompt(rescue);await this.type('passwd '+user);await wait(async()=>/New password:\s*$/i.test(cleanSerial((await this.text()).slice(-400))));await this.type(value);await wait(async()=>/(Retype|Re-type) new password:\s*$/i.test(cleanSerial((await this.text()).slice(-400))));await this.type(value);await this.prompt(rescue);}
 async ssh(value='cambiame1'){await this.prompt();const n=(await this.text()).length;await this.type('ssh hermes@localhost');let sent=false;
  await wait(async()=>{const t=cleanSerial((await this.text()).slice(n));if(/continue connecting.*\?\s*$/i.test(t))await this.type('yes');else if(/password:\s*$/i.test(t)&&!sent){sent=true;await this.type(value);}else if(atShellPrompt(t))return true;return false;});}
 async cron(){await this.prompt();await this.type('crontab -u natasha -e');await pause(500);await this.keys('Control+End','Enter');await this.paste('* * * * * /usr/bin/logger "EX200 testing"\n',false);await this.keys('Control+o','Enter','Control+x');await this.prompt();await this.cmd('systemctl enable --now cron');}
 async recover(){
  await wait(async()=>(await this.screen()).includes('GNU GRUB'),900000);await this.keys('e');await pause(200);
  await this.keys(...Array(20).fill('Control+n'),...Array(3).fill('Control+p'),'Control+e');await this.type(' init=/bin/bash',false);await this.keys('Control+x');
  await wait(async()=>(await this.screen()).includes('root@(none):/#'),180000);await this.cmd('mount -o remount,rw /',true);await this.password('root','titanio7',true);await this.cmd('touch /.autorelabel\nsync',true);await this.type('exec /sbin/init');
  await wait(async()=>/login:\s*$/.test(await this.screen()),900000);await this.type('root');await wait(async()=>/Password:\s*$/.test(await this.screen()));await this.type('titanio7');await this.prompt();
  await this.cmd('getenforce\nps -p 1 -o comm=\ntest ! -e /.autorelabel && echo REETIQUETADO_COMPLETO');
 }
 async solve(q){const solution=solutionsFor('linux',q)[0];if(solution.blocks){for(let i=0;i<solution.blocks.length;i++){const b=solution.blocks[i],next=solution.blocks[i+1];if(b.kind==='command'&&next?.kind==='file'){await this.edit(next.path,next.text);i++;}else if(b.kind==='command')await this.cmd(b.text);}}else await this.cmd(solution.code);}
}
async function start(){await page.goto(url);await page.waitForFunction(()=>!document.querySelector('#exam-start').disabled);await page.locator('#exam-start').click();await wait(async()=>(await page.locator('#exam-status').innerText()).includes('Máquina 1 disponible'),900000);const frame=page.frames().find(f=>new URL(f.url()).searchParams.get('node')==='1');return new Console(frame);}
async function finish(name){await page.locator('#exam-finish').click();await page.locator('#exam-results').waitFor({state:'visible',timeout:1200000});const result=await page.evaluate(()=>globalThis.examReport);result.name=name;report.attempts.push(result);await page.screenshot({path:out+'/'+name+'.png',fullPage:true});await writeFile(out+'/resultado.json',JSON.stringify(report,null,2));return result;}
try{
 if(process.env.S2KTUX_EXAM_MODE!=='full'){
  await start();let result=await finish('sin-respuestas');if(result.score!==0||result.incomplete)throw Error('El intento vacío no finaliza correctamente');console.log('PASSED examen sin respuestas 0/300');
  const d=await start();await d.solve(examQuestions.find(q=>q.id==='exam-2'));await d.type('vi /root/nota-sin-guardar');await pause(300);await page.keyboard.type('iTexto sin guardar');
  result=await finish('parcial-editor-abierto');const expected=examQuestions.find(q=>q.id==='exam-2').points;if(result.score!==expected||result.incomplete)throw Error('La corrección parcial no coincide: '+result.score+' esperado '+expected);console.log('PASSED examen parcial con editor abierto '+expected+'/300');
 }else{
  const drivers=new Map([['1',await start()]]);await page.locator('[data-exam-node="2"]').click();await page.locator('#exam-machine-start').click();await wait(()=>page.frames().some(f=>f.url().includes('node=2')));const d2=new Console(page.frames().find(f=>f.url().includes('node=2')));drivers.set('2',d2);console.log('RECUPERANDO raíz de máquina 2');await d2.recover();report.steps.push({id:'exam-root',done:true});
  for(const q of examQuestions){if(q.id==='exam-root')continue;console.log('INICIO '+q.id);await page.locator('[data-exam-node="'+q.node+'"]').click();const d=drivers.get(String(q.node));
   const index=examQuestions.filter(x=>x.node===q.node).findIndex(x=>x.id===q.id);await page.locator('#question-select').selectOption(String(index));
   if(q.id==='exam-4'){await d.cmd('groupadd sysadmin\nuseradd -m -G sysadmin harry\nuseradd -m -G sysadmin natasha\nuseradd -s /usr/sbin/nologin sara');for(const u of ['harry','natasha','sara'])await d.password(u,'password');await d.cmd("echo '%sysadmin ALL=(ALL) /usr/sbin/useradd' > /etc/sudoers.d/examen\necho 'harry ALL=(ALL) NOPASSWD: /usr/bin/passwd' >> /etc/sudoers.d/examen\nchmod 440 /etc/sudoers.d/examen\nvisudo -cf /etc/sudoers");}
   else if(q.id==='exam-6')await d.cron();
   else if(q.id==='exam-13'){await d.cmd('useradd -m -u 4120 apolo');await d.password('apolo','orquidea3');}
   else if(q.id==='exam-20'){await d.ssh();await d.cmd('mkdir -p ~/imagen-examen\ncd ~/imagen-examen\ncurl -f -o Containerfile http://10.42.0.11:8080/Containerfile\npodman build -t localhost/curso-examen:1 .',false);await d.cmd('exit');}
   else if(q.id==='exam-21'){await d.cmd("mkdir -p /opt/file /opt/process\nchown hermes:hermes /opt/file /opt/process\nsemanage fcontext -a -t container_file_t '/opt/(file|process)(/.*)?'\nrestorecon -RF /opt/file /opt/process\nloginctl enable-linger hermes");await d.ssh();await d.cmd('podman run -d --name mycontainer -v /opt/file:/opt/incoming:Z -v /opt/process:/opt/output:Z localhost/curso-examen:1\npodman generate systemd --name mycontainer --files --new\npodman rm -f mycontainer\nmkdir -p ~/.config/systemd/user\nmv container-mycontainer.service ~/.config/systemd/user/\nrestorecon -RF ~/.config/systemd\nsystemctl --user daemon-reload\nsystemctl --user enable --now container-mycontainer.service');await d.cmd('exit');await d.cmd('sync');await d.f.locator('#reboot').click();await wait(async()=>/login:\s*$/.test(await d.screen()),900000);await d.type('root');await wait(async()=>/Password:\s*$/.test(await d.screen()));await d.type('titanio7');await d.prompt();}
   else await d.solve(q);
   report.steps.push({id:q.id,done:true,at:new Date().toISOString()});await writeFile(out+'/resultado.json',JSON.stringify(report,null,2));console.log('RESUELTA '+q.id);
  }
  const r=await finish('completo');if(r.incomplete||r.score!==300)throw Error('El intento completo obtuvo '+r.score+'/300'+(r.incomplete?' con consultas pendientes':''));console.log('PASSED examen completo 300/300');
 }
 report.passed=true;
}catch(error){report.error=error.stack;report.status=await page.locator('#exam-status').innerText().catch(()=>null);await page.screenshot({path:out+'/fallo.png',fullPage:true}).catch(()=>{});}
finally{clearInterval(observer);report.finished=new Date().toISOString();await writeFile(out+'/resultado.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,error:report.error,status:report.status}));await browser.close();}
