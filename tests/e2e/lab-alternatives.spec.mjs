import {test,expect} from '@playwright/test';
import {adaptLegacyPracticeSelection} from './legacy-practice-selection.mjs';
test.beforeEach(async({page})=>{await adaptLegacyPracticeSelection(page);});
import docker from '../../terminal-runtime-docker.js';

async function submit(page,command){
 const before=await page.locator('#term-body .term-out').count();
 await page.locator('#term-input').evaluate((input,value)=>{input.focus();input.value=value;input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,cancelable:true}));},command);
 await page.waitForFunction(()=>{const input=document.querySelector('#term-input');return input&&!input.readOnly&&!input.disabled&&input.value===''&&/[@#$] ?$/.test(document.querySelector('#term-prompt')?.textContent||'');},null,{timeout:20000});
 return page.locator('#term-body .term-out').evaluateAll((nodes,start)=>nodes.slice(start).map(node=>node.innerText).join('\n'),before);
}
async function ready(page,mode){
 await page.goto('/terminal.html?mode='+mode+'&enter=1');
 await page.waitForFunction(()=>document.documentElement.dataset.terminalReady==='true');
 await expect(page.locator('#practice-panel')).toBeVisible();
}
function solutionCommands(text){
 const source=text.split('\n'),commands=[];
 for(let index=0;index<source.length;index++){
  const line=source[index];if(!line.trim()||line.trim().startsWith('#'))continue;
  const heredoc=line.match(/^cat\s*>\s*(\S+)\s*<<['"]?(\w+)['"]?$/);
  if(heredoc){const body=[];while(++index<source.length&&source[index]!==heredoc[2])body.push(source[index]);const format=(body.join('\n')+'\n').replaceAll('\\','\\\\').replaceAll('%','%%').replaceAll('\n','\\n').replaceAll("'","'\\''");commands.push("printf '"+format+"' > "+heredoc[1]);}
  else commands.push(line==='docker stats'?'docker stats --no-stream limitado':line);
 }
 return commands;
}

for(const [path,mode,count] of [['/laboratorios/docker-real/','docker',15],['/laboratorios/linux-real/v86-test.html','linux',21],['/laboratorios/linux-real/examen.html','linux',21]]){
 test('Alternativa ligera · enlace correcto y nota discreta '+path,async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(path);
  const link=page.locator('a[href="/terminal.html?mode='+mode+'&enter=1"]');
  await expect(link).toHaveCount(1);await expect(link).toBeVisible();
  expect(await link.evaluate(node=>parseFloat(getComputedStyle(node.closest('.lab-information')).fontSize))).toBeLessThanOrEqual(12);
  if(mode==='docker')await expect(page.locator('.lab-information')).toContainText('32 bits');
  expect(await link.getAttribute('target')).toBeNull();const pages=page.context().pages().length;
  await expect(page.locator('main')).not.toContainText('Los ejercicios comunes comparten enunciado');
  await link.click();const alternative=page;
  await alternative.waitForFunction(()=>document.documentElement.dataset.terminalReady==='true');
  await expect(alternative.locator('#chal-select option')).toHaveCount(1);await expect(alternative.locator('#chal-select-class')).toHaveValue('free');await expect(alternative.locator('#terminal-shell')).toBeVisible();
  if(mode==='docker')expect(await submit(alternative,'echo ALTERNATIVA_OK')).toContain('ALTERNATIVA_OK');
  else await expect(alternative.locator('#term-prompt')).toContainText('root@');
  await expect(page).toHaveURL(new RegExp('terminal.html\\?mode='+mode+'$'));expect(page.context().pages()).toHaveLength(pages);
  expect(errors).toEqual([]);
 });
}

test('Docker simulado · las quince soluciones llegan a sus correctores',async({page})=>{
 test.setTimeout(180000);const errors=[];page.on('pageerror',error=>errors.push(error.message));await ready(page,'docker');
 const challenges=docker.createChallenges({state:{},getNode:()=>null});
 for(let index=0;index<challenges.length;index++){
  await test.step(challenges[index].title,async()=>{
   await page.selectOption('#chal-select',String(index));await page.locator('#chal-check').click();await expect(page.locator('#chal-result')).toContainText('TODAVÍA NO');
   for(const command of solutionCommands(challenges[index].solution)){
    const output=await submit(page,command);
    if(command==='docker exec frontend wget -qO- http://backend/')expect(output).toContain('Welcome to nginx');
   }
   await page.locator('#chal-check').click();await expect(page.locator('#chal-result')).toContainText('CONSEGUIDO');
  });
 }
 expect(errors).toEqual([]);
});

test('Linux simulado · veintiún correctores y fixture resuelta coherentes',async({page})=>{
 const errors=[];page.on('pageerror',error=>errors.push(error.message));await ready(page,'linux');
 await page.evaluate(()=>globalThis.__s2ktuxTestSolve());await page.waitForFunction(()=>/root@/.test(document.querySelector('#term-prompt')?.textContent||''));
 for(let index=0;index<21;index++){await page.selectOption('#chal-select',String(index));await page.locator('#chal-check').click();await expect(page.locator('#chal-result')).toContainText('CONSEGUIDO');}
 await submit(page,"printf '# * * * * * logger \\\"Backup diario\\\"\\n' > /var/spool/cron/hera");
 await page.selectOption('#chal-select','6');await page.locator('#chal-check').click();await expect(page.locator('#chal-result')).toContainText('TODAVÍA NO');
 await submit(page,'tuned-adm profile powersave');await page.selectOption('#chal-select','17');await page.locator('#chal-check').click();await expect(page.locator('#chal-result')).toContainText('TODAVÍA NO');
 await submit(page,'tuned-adm profile virtual-host');await page.locator('#chal-check').click();await expect(page.locator('#chal-result')).toContainText('CONSEGUIDO');
 expect(errors).toEqual([]);
});

test('Alternativa ligera · notas sin desbordamiento @mobile',async({page})=>{
 for(const path of ['/laboratorios/docker-real/','/laboratorios/linux-real/v86-test.html','/laboratorios/linux-real/examen.html']){
  await page.goto(path);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
});

test('Linux simulado · SGID hereda grupo en archivos y subdirectorios',async({page})=>{
 await ready(page,'linux');await page.evaluate(()=>globalThis.__s2ktuxTestSolve());await expect(page.locator('#term-prompt')).toContainText('root@');
 for(const command of ['groupadd cooperacion','mkdir /tmp/sgid-nuevo','chown root:cooperacion /tmp/sgid-nuevo','chmod 2770 /tmp/sgid-nuevo','touch /tmp/sgid-nuevo/tocado',"printf 'dato' > /tmp/sgid-nuevo/redirigido",'mkdir /tmp/sgid-nuevo/sub','mkdir -p /tmp/sgid-nuevo/otra/anidada','touch /tmp/sgid-nuevo/otra/anidada/dato'])await submit(page,command);
 for(const path of ['tocado','redirigido','otra/anidada/dato'])expect(await submit(page,'ls -l /tmp/sgid-nuevo/'+path)).toMatch(/root\s+cooperacion/);
 for(const path of ['sub','otra','otra/anidada'])expect(await submit(page,'ls -ld /tmp/sgid-nuevo/'+path)).toMatch(/drwxr-sr-x.*root\s+cooperacion/);
});

test('Docker simulado · HTTP entre contenedores depende del estado real del modelo',async({page})=>{
 await ready(page,'docker');
 for(const command of ['docker network create labnet','docker run -d --name backend --network labnet nginx','docker run -d --name frontend --network labnet alpine sleep 3600'])await submit(page,command);
 const request='docker exec frontend wget -qO- http://backend/';
 expect(await submit(page,request)).toContain('Welcome to nginx');expect(await submit(page,'echo $?')).toMatch(/\n0(?:\n|$)/);
 await submit(page,'docker stop backend');expect(await submit(page,request)).toContain('connection refused');expect(await submit(page,'echo $?')).toMatch(/\n7(?:\n|$)/);
 await submit(page,'docker start backend');await submit(page,'docker network disconnect labnet frontend');expect(await submit(page,request)).toContain('could not resolve');
 await submit(page,'docker network connect labnet frontend');expect(await submit(page,'docker exec frontend curl http://backend/')).toContain('Welcome to nginx');
 await submit(page,'docker exec backend rm /usr/share/nginx/html/index.html');expect(await submit(page,request)).toContain('HTTP 404');expect(await submit(page,'echo $?')).toMatch(/\n22(?:\n|$)/);
 await page.selectOption('#chal-select','10');await submit(page,'docker network inspect labnet');await page.locator('#chal-check').click();await expect(page.locator('#chal-result')).toContainText('TODAVÍA NO');
});

test('Linux simulado · Podman rootless resuelto con comandos desde cero',async({page})=>{
 test.setTimeout(120000);const errors=[];page.on('pageerror',error=>errors.push(error.message));await ready(page,'linux');
 const raw=command=>page.locator('#term-input').evaluate((input,value)=>{input.focus();input.value=value;input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,cancelable:true}));},command);
 await page.locator('#term-reboot').click();await expect(page.locator('#term-body')).toContainText('GNU GRUB');await page.locator('.xterm-helper-textarea').focus();await page.keyboard.press('e');for(let i=0;i<8;i++)await page.keyboard.press('ArrowDown');await page.keyboard.type(' rd.break');await page.keyboard.press('Control+x');
 await expect(page.locator('#term-prompt')).toContainText('switch_root:/#');await submit(page,'mount -o remount,rw /sysroot');await submit(page,'chroot /sysroot');
 await raw('passwd');await expect(page.locator('#term-prompt')).toContainText('Nueva contraseña');await raw('titanio7');await expect(page.locator('#term-prompt')).toContainText('Vuelve a escribirla');await raw('titanio7');await submit(page,'touch /.autorelabel');await submit(page,'exit');await raw('exit');
 await expect(page.locator('#term-prompt')).toContainText('login:');await raw('root');await expect(page.locator('#term-prompt')).toContainText('Password:');await raw('titanio7');await expect(page.locator('#term-prompt')).toContainText('root@');
 await page.selectOption('#chal-select','20');await page.locator('#chal-check').click();await expect(page.locator('#chal-result')).toContainText('TODAVÍA NO');
 for(const command of ['useradd -m hermes','mkdir -p /opt/entrada /opt/salida','chmod 777 /opt/entrada /opt/salida','loginctl enable-linger hermes','systemctl enable --now sshd'])await submit(page,command);
 await raw('passwd hermes');await expect(page.locator('#term-prompt')).toContainText('Nueva contraseña');await raw('Hermes9!');await expect(page.locator('#term-prompt')).toContainText('Vuelva a escribir');await raw('Hermes9!');await expect(page.locator('#term-prompt')).toContainText('root@');
 await raw('ssh hermes@localhost');await expect(page.locator('#term-prompt')).toContainText('yes/no');await raw('yes');await expect(page.locator('#term-prompt')).toContainText("password:");await raw('Hermes9!');await expect(page.locator('#term-prompt')).toContainText('hermes@');
 for(const command of ['podman pull httpd','podman run -d --name webapp -v /opt/entrada:/data/in:Z -v /opt/salida:/data/out:Z httpd','mkdir -p ~/.config/systemd/user','cd ~/.config/systemd/user','podman generate systemd --name webapp --files','systemctl --user daemon-reload','systemctl --user enable container-webapp.service'])await submit(page,command);
 await page.locator('#chal-check').click();await expect(page.locator('#chal-result')).toContainText('TODAVÍA NO');
 await submit(page,'systemctl --user enable --now container-webapp.service');await page.locator('#chal-check').click();await expect(page.locator('#chal-result')).toContainText('CONSEGUIDO');
 expect(await submit(page,'cat container-webapp.service')).toContain('ExecStart=/usr/bin/podman start "webapp"');
 await submit(page,'exit');await expect(page.locator('#term-prompt')).toContainText('root@');await page.locator('#chal-check').click();await expect(page.locator('#chal-result')).toContainText('CONSEGUIDO');expect(errors).toEqual([]);
});
