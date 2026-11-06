// Recorrido manual reproducible: botones de la página, portapapeles y terminal
// real. No ejecuta soluciones por el canal privado del emulador ni del corrector.
import {chromium} from '@playwright/test';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {exercises} from '../../laboratorios/linux-real/v86-exercises.mjs';
import {solutionsFor} from '../../laboratorios/solution-options.mjs';
import {cleanSerial,atShellPrompt} from '../../laboratorios/linux-real/v86-check-runner.mjs';
const out=process.env.S2KTUX_QA_OUT||'test-results/linux-course-journey';await mkdir(out,{recursive:true});
const base=process.env.S2KTUX_LINUX_URL||'http://127.0.0.1:4185/laboratorios/linux-real/';
const browser=await chromium.launchPersistentContext(out+'/perfil',{headless:true,viewport:{width:1200,height:950}});
await browser.grantPermissions(['clipboard-read','clipboard-write'],{origin:new URL(base).origin});
const page=browser.pages()[0]||await browser.newPage(),report={started:new Date().toISOString(),cases:[],errors:[]};
page.on('pageerror',error=>report.errors.push(error.message));
page.on('console',message=>{if(message.type()==='error')report.errors.push(message.text());});
page.on('dialog',dialog=>dialog.accept()); // Solo Reset de esta máquina privada de QA.
const text=()=>page.evaluate(()=>globalThis.vmTranscript||'');
const pause=ms=>page.waitForTimeout(ms);
async function prompt(timeout=120000){const end=Date.now()+timeout;while(Date.now()<end){if(atShellPrompt(await text()))return;await pause(100);}throw Error('No hay una línea de prompt vacía');}
async function paste(value){const n=(await text()).length;await page.evaluate(value=>navigator.clipboard.writeText(value),value);await page.locator('#terminal').click({button:'right'});await page.waitForFunction(n=>(globalThis.vmTranscript||'').length>n,n,{timeout:15000});}
async function command(value,timeout=120000){
 if(!value.trim())return '';
 await prompt();const start=(await text()).length;await paste(value);await page.keyboard.press('Enter');
 const until=Date.now()+timeout;let answered='';
 while(Date.now()<until){const t=cleanSerial((await text()).slice(start));
  if(atShellPrompt(t)){await pause(80);return cleanSerial((await text()).slice(start));}
  if(/(?:Is this ok|Do you want to continue|Do you really want|Remove logical volume)[^\r\n]*[?:]\s*$/i.test(t)&&t!==answered){answered=t;await page.keyboard.type('y');await page.keyboard.press('Enter');}
  await pause(120);
 }
 throw Error('No volvió al prompt: '+value.slice(0,100));
}
async function raw(value){await paste(value);await page.keyboard.press('Enter');}
async function edit(path,content,append=false,editor='vi'){
 await prompt();await raw(editor+' '+path);await pause(350);await page.keyboard.press('Escape');
 await page.keyboard.type(append?'Go':'ggdGi');await page.evaluate(value=>navigator.clipboard.writeText(value),content);
 await page.locator('#terminal').click({button:'right'});await pause(120);await page.keyboard.press('Escape');await page.keyboard.type(':wq');await page.keyboard.press('Enter');await prompt();
}
async function replace(path,expression){await raw('vi '+path);await pause(350);await page.keyboard.press('Escape');await page.keyboard.type(':'+expression);await page.keyboard.press('Enter');await page.keyboard.type(':wq');await page.keyboard.press('Enter');await prompt();}
async function auth(commandText,password='practica'){
 await prompt();const n=(await text()).length;await raw(commandText);
 for(let i=0;i<300;i++){const t=cleanSerial((await text()).slice(n));
  if(/continue connecting.*\?\s*$/i.test(t)){await page.keyboard.type('yes');await page.keyboard.press('Enter');}
  else if(/password:\s*$/i.test(t)){await page.keyboard.type(password);await page.keyboard.press('Enter');await pause(250);}
  else if(atShellPrompt(t))return;
  await pause(100);
 }throw Error('SSH no terminó la autenticación');
}
async function password(user){await raw('passwd '+user);for(const expression of [/New password:\s*$/i,/(?:Retype|Re-type) new password:\s*$/i]){const end=Date.now()+30000;while(!expression.test(cleanSerial((await text()).slice(-500)))){if(Date.now()>end)throw Error('No aparece el diálogo de passwd');await pause(100);}await page.keyboard.type('practica7');await page.keyboard.press('Enter');}await prompt();}
async function cron(line){await raw('crontab -e');await pause(500);await page.keyboard.press('Control+End');await page.keyboard.press('Enter');await page.evaluate(value=>navigator.clipboard.writeText(value),line+'\n');await page.locator('#terminal').click({button:'right'});await pause(150);await page.keyboard.press('Control+o');await page.keyboard.press('Enter');await page.keyboard.press('Control+x');await prompt();await command('crontab -l');}
async function recover(){
 const screen=await page.evaluate(()=>{const b=vmTerminal.buffer.active;return Array.from({length:vmTerminal.rows},(_,i)=>b.getLine(b.viewportY+i)?.translateToString()||'').join('\n');});
 if(screen.includes('GNU nano')){await page.keyboard.press('Control+x');await pause(150);await page.keyboard.type('n');}
 else {await page.keyboard.press('Escape');await page.keyboard.type(':q!');await page.keyboard.press('Enter');await page.keyboard.press('Control+c');}
 try{await prompt(5000);return true;}catch{return false;}
}
async function select(task){await page.locator('#exercise-select-class').selectOption(task.practiceExam?'exam':String(task.classes[0]));await page.locator('#exercise-select').selectOption(task.id);}
async function check(){
 const button=page.locator('[data-exercise-check]');await button.waitFor({state:'visible'});await page.waitForFunction(()=>!document.querySelector('[data-exercise-check]').disabled,null,{timeout:30000});
 await button.click();await page.waitForFunction(()=>!document.querySelector('#exercise-select').disabled,null,{timeout:240000});
 return {state:await page.locator('[data-exercise-feedback]').getAttribute('data-result'),text:await page.locator('[data-exercise-feedback]').innerText()};
}
async function save(){await prompt();await page.locator('#save').click();await page.waitForFunction(()=>/^(Sesión guardada:|No se pudo guardar)/.test(document.querySelector('#session-status').textContent),null,{timeout:240000});const s=await page.locator('#session-status').innerText();if(s.startsWith('No se pudo'))throw Error(s);}
async function boot(){await page.goto(base);await page.waitForFunction(()=>!document.querySelector('#start').disabled);await page.locator('#start').click();await page.waitForFunction(()=>['shell','failed'].includes(document.documentElement.dataset.vmState),null,{timeout:240000});await prompt();}
const overrides={
 'repaso-cron':()=>cron('20 18 * * 1-5 logger "Revision del laboratorio"'),
 'repaso-almacenamiento':async()=>{await command('lsblk /dev/sdb\npvcreate /dev/sdb\nvgcreate repaso /dev/sdb\nlvcreate -L 128M -n archivos repaso\nmkfs.ext4 /dev/repaso/archivos\nmkdir -p /mnt/repaso');const t=await command('blkid -s UUID -o value /dev/repaso/archivos');const uuid=t.match(/[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}/)?.[0];if(!uuid)throw Error('No se ha visto el UUID de repaso');await edit('/etc/fstab','UUID='+uuid+' /mnt/repaso ext4 defaults 0 2',true);await command('systemctl daemon-reload\nmount -a\nfindmnt /mnt/repaso');},
 'inicio-cron':()=>cron('*/5 * * * * logger "Practica cron"'),
 'cron-ii':()=>cron('15 23 * * * logger "Copia diaria"'),
 'su-i':async()=>{await command('su - practica-su');await command('whoami > ~/quien.txt');await command('exit');},
 'su-ii':async()=>{await command('su - sesion');await command('pwd > ~/directorio.txt');await command('exit');},
 'ssh-i':async()=>{await auth('ssh ssh-estudio@localhost');await command('whoami > ~/quien-ssh.txt');await command('exit');},
 'ssh-ii':()=>auth("ssh ssh-estudio@localhost 'pwd > ~/directorio-ssh.txt'"),
 'scp-i':()=>auth('scp /etc/hosts ssh-estudio@localhost:hosts-copia'),
 'scp-ii':async()=>{await command('mkdir -p /root/envio\necho Uno > /root/envio/uno.txt\necho Dos > /root/envio/dos.txt');await auth('scp -r /root/envio ssh-estudio@localhost:');},
 'vi-i':()=>edit('/root/nota-vi.txt','Mi primera nota'),
 'vi-ii':async()=>{await command("echo Servidor > /root/nota-editada.txt\necho 'Estado: pendiente' >> /root/nota-editada.txt");await replace('/root/nota-editada.txt','%s/pendiente/activo/');},
 'repos-ii':async()=>{await edit('/etc/yum.repos.d/otra-copia.repo','[lab-otra-copia]\nname=Copia local\nbaseurl=file:///srv/repos/lab-base\nenabled=0\ngpgcheck=1\ngpgkey=file:///srv/repos/RPM-GPG-KEY-lab');await command("rpm --import /srv/repos/RPM-GPG-KEY-lab\ndnf --disablerepo='*' --enablerepo=lab-otra-copia repolist");},
 'fstab-i':async()=>{await command('mkfs.ext4 /dev/aprendizaje/documentos\nmkdir -p /mnt/documentos');const t=await command('blkid -s UUID -o value /dev/aprendizaje/documentos');const uuid=t.match(/[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}/)?.[0];if(!uuid)throw Error('No se ha visto el UUID');await edit('/etc/fstab','UUID='+uuid+' /mnt/documentos ext4 defaults 0 2',true);await command('systemctl daemon-reload\nmount -a\nfindmnt /mnt/documentos');},
 'fstab-ii':async()=>{await command('e2label /dev/aprendizaje/documentos DOCUMENTOS');await replace('/etc/fstab','%s@^UUID=.* /mnt/documentos .*@LABEL=DOCUMENTOS /mnt/documentos ext4 defaults 0 2@');await command('systemctl daemon-reload\nmount -a\nfindmnt --verify');},
 'swap-ii':async()=>{const t=await command('blkid -s UUID -o value /dev/sdb3');const uuid=t.match(/[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}/)?.[0];if(!uuid)throw Error('No se ha visto el UUID de swap');await edit('/etc/fstab','UUID='+uuid+' none swap defaults 0 0',true);await command('swapon -a\nswapon --show');},
 'nfs-ii':async()=>{await edit('/etc/fstab','127.0.0.1:/srv/rhcsa-nfs /mnt/nfs-practica nfs ro,_netdev 0 0',true);await command('mkdir -p /mnt/nfs-practica\nsystemctl daemon-reload\nmount -a\ncat /mnt/nfs-practica/dato');},
 'autofs-i':async()=>{await edit('/etc/auto.master.d/practica.autofs','/mnt/auto-practica /etc/auto.practica');await edit('/etc/auto.practica','datos -fstype=nfs,ro 127.0.0.1:/srv/rhcsa-nfs');await command('systemctl enable --now autofs\nsystemctl restart autofs\ncat /mnt/auto-practica/datos/dato');},
 'autofs-ii':async()=>{await edit('/etc/auto.practica','copia -fstype=nfs,ro 127.0.0.1:/srv/rhcsa-nfs',true);await command('systemctl restart autofs\ncat /mnt/auto-practica/datos/dato\ncat /mnt/auto-practica/copia/dato');},
 'chrony-i':async()=>{await edit('/etc/chrony/chrony.conf','pool 2.debian.pool.ntp.org iburst');await command('systemctl enable --now chrony\nsystemctl restart chrony\nchronyc sources');},
 'chrony-ii':async()=>{await edit('/etc/chrony/chrony.conf','server time.cloudflare.com iburst prefer\nserver time.google.com iburst');await command('systemctl restart chrony\nchronyc sources');},
 'grub-ii':async()=>{await replace('/etc/default/grub','%s/^GRUB_TIMEOUT=.*/GRUB_TIMEOUT=5/');await command('update-grub');},
 'modo-selinux-ii':async()=>{await command('setenforce 1');await replace('/etc/selinux/config','%s/^SELINUX=.*/SELINUX=enforcing/');await command('sestatus');},
 'sudo-i':async()=>{await command('useradd -m operador');await edit('/etc/sudoers.d/operador','operador ALL=(root) NOPASSWD: /usr/bin/id',false,'EDITOR=vi visudo -f');await command('chmod 440 /etc/sudoers.d/operador\nvisudo -cf /etc/sudoers\nsudo -l -U operador');},
 'sudo-ii':async()=>{await command('groupadd auditores\nuseradd -m -G auditores auditor');await edit('/etc/sudoers.d/auditores','%auditores ALL=(root) NOPASSWD: /usr/bin/id',false,'EDITOR=vi visudo -f');await command('chmod 440 /etc/sudoers.d/auditores\nvisudo -cf /etc/sudoers\nsudo -l -U auditor');},
 'curso-ssh':async()=>{await command('useradd -m -U -s /bin/bash curso-ssh');await password('curso-ssh');const code=solutionsFor('linux',exercises.find(x=>x.id==='curso-ssh'))[0].code.split('passwd curso-ssh\n')[1];await command(code);},
 'rhcsa-11-sim-21-II':async()=>{await command('useradd -m -U -s /bin/bash hermes');await password('hermes');await command("mkdir -p /opt/entrada /opt/salida\nchown hermes:hermes /opt/entrada /opt/salida\nsemanage fcontext -a -t container_file_t '/opt/(entrada|salida)(/.*)?'\nrestorecon -RF /opt/entrada /opt/salida\nloginctl enable-linger hermes\nsystemctl start ssh");await auth('ssh hermes@localhost','practica7');await command('podman import /srv/curso-contenedor/imagen.tar localhost/curso-busybox:1\npodman run -d --name webapp -v /opt/entrada:/data/in:Z -v /opt/salida:/data/out:Z localhost/curso-busybox:1 /bin/busybox sleep 86400\npodman generate systemd --name webapp --files --new\npodman rm -f webapp\nmkdir -p ~/.config/systemd/user\nmv container-webapp.service ~/.config/systemd/user/\n/usr/sbin/restorecon -RF ~/.config/systemd\nsystemctl --user daemon-reload\nsystemctl --user enable --now container-webapp.service',240000);},
};
const separate=new Set(['rhcsa-4-sim-01-I','rhcsa-11-sim-01-I']);
const ids=process.env.S2KTUX_LINUX_CASES?.split(',');
const tasks=exercises.filter(x=>!x.legacyOnly&&(!ids? !x.practiceExam:ids.includes(x.id)));
try{
 await boot();let lastClass;
 for(const task of tasks){
  if(separate.has(task.id)){report.cases.push({id:task.id,status:'separate-interactive-run'});continue;}
  const result={id:task.id,title:task.title,started:new Date().toISOString()};console.log('INICIO '+task.id);
  try{
   await select(task);result.before=await check();
   if(task.prepare){await page.getByRole('button',{name:'Preparar ejercicio',exact:true}).click();await page.waitForFunction(()=>document.querySelector('[data-exercise-feedback]').textContent.includes('preparado.'),null,{timeout:180000});}
   if(overrides[task.id])await overrides[task.id]();
   else {const solution=solutionsFor('linux',task)[0];
    if(solution.blocks){for(let i=0;i<solution.blocks.length;i++){const b=solution.blocks[i],next=solution.blocks[i+1];if(b.kind==='command'&&next?.kind==='file'){await edit(next.path,next.text);i++;}else if(b.kind==='command')await command(b.text);}}
    else {if(/^(?:passwd|reboot|visudo|vi)\b/m.test(solution.code))throw Error('Requiere recorrido interactivo específico, no se ejecuta el texto a ciegas');await command(solution.code);}
   }
   if(task.id==='timer-i')await pause(12000); // OnActiveSec=10s: esperar su ejecución real.
   result.after=await check();result.status=result.after.state==='passed'?'passed':'failed';if(result.status==='failed'){result.tail=cleanSerial((await text()).slice(-6000));await page.screenshot({path:out+'/'+task.id+'.png',fullPage:true});}
   if(task.checkUser&&task.checkUser!=='root')await command('exit');
   if(task.fileExpectation&&result.status==='passed'){await command('echo Incorrecto > '+task.fileExpectation.path);result.incomplete=await check();if(result.incomplete.state==='passed'){result.status='failed';result.error='Acepta contenido incorrecto';}await edit(task.fileExpectation.path,task.fileExpectation.value);}
  }catch(error){result.status='failed';result.error=error.message;result.tail=cleanSerial((await text()).slice(-5000));await page.screenshot({path:out+'/'+task.id+'.png',fullPage:true});result.recovered=await recover();}
  result.finished=new Date().toISOString();report.cases.push(result);await writeFile(out+'/resultado.json',JSON.stringify(report,null,2));console.log(result.status.toUpperCase()+' '+task.id+(result.error?' '+result.error:''));
  if(result.recovered===false){report.fatal='El recorrido se detiene al perder el contexto de consola; las siguientes prácticas no se marcan como fallidas.';break;}
  lastClass=task.classes[0];
 }
 await command('echo auditoria > /root/auditoria-persistente.txt');await save();report.saved=true;
 if(process.env.S2KTUX_LINUX_RECOVER==='1'){
  await boot();const restored=await command('test "$(cat /root/auditoria-persistente.txt)" = auditoria && echo AUDITORIA_OK');
  if(!/^AUDITORIA_OK$/m.test(restored))throw Error('No se conserva el archivo tras recuperar');report.restored=true;
  if(process.env.S2KTUX_LINUX_REBOOT==='1'){
   await command('sync');const offset=(await text()).length;await page.locator('#reboot').click();
   await page.waitForFunction(offset=>(globalThis.vmTranscript||'').slice(offset).includes('Linux version'),offset,{timeout:180000});await prompt(240000);
   const persisted=await command('test "$(cat /root/auditoria-persistente.txt)" = auditoria && echo REINICIO_OK');if(!/^REINICIO_OK$/m.test(persisted))throw Error('No persiste el archivo tras reiniciar');report.rebooted=true;
  }
  const last=tasks.at(-1);if(last.checkUser)await auth('ssh '+last.checkUser+'@localhost','practica7');await select(last);report.finalCheck=await check();if(last.checkUser)await command('exit');
 }
}catch(error){report.fatal=error.stack;report.tail=cleanSerial((await text()).slice(-3000));report.status=await page.locator('#session-status').innerText().catch(()=>null);await page.screenshot({path:out+'/fallo-final.png',fullPage:true}).catch(()=>{});}
finally{report.finished=new Date().toISOString();await writeFile(out+'/resultado.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.cases.filter(x=>x.status==='passed').length,failed:report.cases.filter(x=>x.status==='failed').map(x=>x.id),fatal:report.fatal}));await browser.close();}
