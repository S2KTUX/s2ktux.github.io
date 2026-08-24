import { test, expect } from '@playwright/test';
import { SAFE_COMMANDS, RUNTIME_COMMANDS, invocationFor } from './command-matrix.mjs';

const MODES = ['linux','docker','kubernetes'];
const chunk = (items,size) => Array.from({length:Math.ceil(items.length/size)},(_,i)=>items.slice(i*size,(i+1)*size));

function captureRuntimeErrors(page){
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  return errors;
}

async function openMode(page,mode,{solved=mode==='linux'}={}){
  await page.goto('/terminal.html');
  await page.locator('[data-pick-mode="'+mode+'"]').click();
  await expect(page).toHaveURL(new RegExp('mode='+mode));
  await expect(page.locator('#terminal-shell')).toBeVisible();
  await expect(page.locator('#term-input')).toBeAttached();
  await page.waitForFunction(()=>document.querySelector('#term-input') && !document.querySelector('#term-input').disabled);
  if(solved){
    await page.locator('#term-solved').click();
    await page.waitForFunction(()=>/[@#$] ?$/.test(document.querySelector('#term-prompt')?.textContent||'') && !document.querySelector('#term-input')?.readOnly,null,{timeout:8000});
  }
}

async function submitRaw(page,command){
  const before=await page.locator('#term-body .term-out').count();
  await page.locator('#term-input').evaluate((input,value)=>{
    input.focus();
    input.value=value;
    input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',bubbles:true,cancelable:true}));
  },command);
  return before;
}

async function waitForShell(page,timeout=8000){
  await page.waitForFunction(()=>{
    const input=document.querySelector('#term-input');
    const prompt=document.querySelector('#term-prompt')?.textContent||'';
    return input && !input.readOnly && !input.disabled && !input.dataset.ttyKeys &&
      !document.querySelector('#term-editor,#term-pager') && input.value==='' && /[@#$] ?$/.test(prompt);
  },null,{timeout});
}

async function run(page,command,{timeout=8000}={}){
  const before=await submitRaw(page,command);
  await waitForShell(page,timeout);
  return page.locator('#term-body .term-out').evaluateAll((nodes,start)=>nodes.slice(Math.min(start,nodes.length)).map(node=>node.innerText).join('\n'),before);
}

async function focusXterm(page){
  const textarea=page.locator('.xterm-helper-textarea');
  await expect(textarea).toBeAttached();
  await textarea.focus();
}

for(const mode of MODES){
  const commands=mode==='kubernetes'?[...SAFE_COMMANDS,...RUNTIME_COMMANDS]:SAFE_COMMANDS;
  for(const [batchIndex,batch] of chunk(commands,25).entries()){
    test(mode+' · comandos '+(batchIndex*25+1)+'-'+(batchIndex*25+batch.length),async({page})=>{
      const errors=captureRuntimeErrors(page);
      await openMode(page,mode);
      for(const name of batch){
        await test.step(name,async()=>{
          const errorCount=errors.length;
          const command=invocationFor(name);
          try{
            await run(page,command,{timeout:12000});
          }catch(error){
            const screen=await page.locator('#term-body').innerText().catch(()=>'(terminal no disponible)');
            throw new Error('Bloqueo o ausencia de prompt tras: '+command+'\n\nPantalla final:\n'+screen+'\n\n'+error.message);
          }
          expect(errors.slice(errorCount),'Error JavaScript provocado por: '+command).toEqual([]);
        });
      }
      expect(errors,'Errores JavaScript durante el lote').toEqual([]);
    });
  }
}

test('Linux · recuperación RHCSA 9 completa mediante GRUB',async({page})=>{
  const errors=captureRuntimeErrors(page);
  await openMode(page,'linux',{solved:false});
  await page.locator('#term-reboot').click();
  await expect(page.locator('#term-body')).toContainText('GNU GRUB');
  await focusXterm(page);
  await page.keyboard.press('e');
  for(let i=0;i<8;i++) await page.keyboard.press('ArrowDown');
  await page.keyboard.type(' rd.break');
  await page.keyboard.press('Control+x');
  await expect(page.locator('#term-prompt')).toContainText('switch_root:/#');
  await run(page,'mount -o remount,rw /sysroot');
  await run(page,'chroot /sysroot');
  await submitRaw(page,'passwd');
  await expect(page.locator('#term-prompt')).toContainText('Nueva contraseña');
  await submitRaw(page,'RhCSA9!test');
  await expect(page.locator('#term-prompt')).toContainText('Vuelve a escribirla');
  await submitRaw(page,'RhCSA9!test');
  await expect(page.locator('#term-body')).toContainText('contraseña de root actualizada');
  await run(page,'touch /.autorelabel');
  await run(page,'exit');
  await submitRaw(page,'exit');
  await expect(page.locator('#term-prompt')).toContainText('login:');
  await submitRaw(page,'root');
  await expect(page.locator('#term-prompt')).toContainText('Password:');
  await submitRaw(page,'RhCSA9!test');
  await waitForShell(page);
  await expect(page.locator('#term-prompt')).toContainText('root@');
  expect(errors).toEqual([]);
});

test('TTY · man, nano y vi reciben teclado real y devuelven el prompt',async({page})=>{
  const errors=captureRuntimeErrors(page);
  await openMode(page,'docker');
  await focusXterm(page);
  await page.keyboard.type('man docker');
  await page.keyboard.press('Enter');
  await expect(page.locator('#term-pager')).toBeAttached();
  await expect(page.locator('#term-body')).toContainText('DOCKER(1)');
  await page.keyboard.press('q');
  await waitForShell(page);

  await focusXterm(page);
  await page.keyboard.type('nano /tmp/nano-e2e.txt');
  await page.keyboard.press('Enter');
  await expect(page.locator('#term-editor')).toBeAttached();
  await page.keyboard.type('abc');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('d');
  await page.keyboard.press('Control+o');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Control+x');
  await waitForShell(page);
  expect(await run(page,'cat /tmp/nano-e2e.txt')).toContain('abd');

  await focusXterm(page);
  await page.keyboard.type('vi /tmp/vi-e2e.txt');
  await page.keyboard.press('Enter');
  await expect(page.locator('#term-editor')).toBeAttached();
  await page.keyboard.press('i');
  await page.keyboard.type('terminal');
  await page.keyboard.press('Backspace');
  await page.keyboard.type('X');
  await page.keyboard.press('Escape');
  await page.keyboard.type(':wq');
  await page.keyboard.press('Enter');
  await waitForShell(page);
  expect(await run(page,'cat /tmp/vi-e2e.txt')).toContain('terminaX');
  expect(errors).toEqual([]);
});

test('TTY · paginadores, top, lectura, particionado y programas especiales salen sin bloquear',async({page})=>{
  const errors=captureRuntimeErrors(page);
  await openMode(page,'linux');
  for(const command of ['less /etc/os-release','more /etc/os-release','top']){
    await focusXterm(page);
    await page.keyboard.type(command);
    await page.keyboard.press('Enter');
    await expect(page.locator('#term-pager')).toBeAttached();
    await page.keyboard.press('q');
    await waitForShell(page);
  }
  expect(await run(page,'crontab -l')).toMatch(/no crontab|SHELL|crontab/i);
  expect(await run(page,'fdisk -l')).toMatch(/Disk|disco|dev\//i);
  expect(await run(page,'parted -l')).toMatch(/Model|modelo|Disk|disco|dev\//i);
  expect(await run(page,'ssh-keygen -t rsa -f /tmp/e2e-key -N ""')).toMatch(/fingerprint|identification|guardada|Generating/i);
  await submitRaw(page,'read E2E_VALUE');
  await expect(page.locator('#term-prompt')).toContainText('');
  await submitRaw(page,'respuesta');
  await waitForShell(page);
  expect(await run(page,'echo "$E2E_VALUE"')).toContain('respuesta');
  expect(errors).toEqual([]);
});

test('Shell · comillas, variables, comodines, tuberías, redirecciones, permisos y procesos',async({page})=>{
  const errors=captureRuntimeErrors(page);
  await openMode(page,'linux');
  expect(await run(page,"echo 'uno dos'")).toContain('uno dos');
  await run(page,'export CURSO=RHCSA9');
  expect(await run(page,'echo "$CURSO"')).toContain('RHCSA9');
  await run(page,'mkdir -p /tmp/e2e');
  await run(page,'touch /tmp/e2e/a.log /tmp/e2e/b.log');
  expect(await run(page,'ls /tmp/e2e/*.log')).toMatch(/a\.log[\s\S]*b\.log/);
  await run(page,"printf 'tres\\nuno\\ndos\\n' > /tmp/e2e/datos");
  expect(await run(page,'cat /tmp/e2e/datos | sort | head -n 1')).toContain('dos');
  await run(page,'echo error-test 2> /tmp/e2e/error');
  await run(page,'chmod 600 /tmp/e2e/datos');
  expect(await run(page,'stat /tmp/e2e/datos')).toMatch(/0600|rw-------/);
  await submitRaw(page,'sleep 30');
  await page.waitForTimeout(150);
  await focusXterm(page);
  await page.keyboard.press('Control+c');
  await waitForShell(page);
  expect(errors).toEqual([]);
});

test('Docker · motor listo, catálogo, pull por capas y ciclo de vida coherente',async({page})=>{
  const errors=captureRuntimeErrors(page);
  await openMode(page,'docker');
  expect(await run(page,'systemctl is-active docker')).toContain('active');
  expect(await run(page,'docker version')).toMatch(/Client|Server/);
  for(const image of ['alpine','nginx','httpd','debian','ubuntu','mariadb']){
    expect(await run(page,'docker search '+image)).toMatch(new RegExp(image,'i'));
  }
  const pull=await run(page,'docker pull mariadb',{timeout:20000});
  expect(pull).toContain('Pulling fs layer');
  expect(pull).toContain('Downloading');
  expect(pull).toContain('Extracting');
  expect(pull).toContain('Downloaded newer image');
  const launched=await run(page,'docker run -d --name web -p 8080:80 nginx',{timeout:20000});
  expect(launched).toMatch(/[a-f0-9]{12}/);
  expect(await run(page,'docker ps')).toMatch(/web[\s\S]*8080->80|8080->80[\s\S]*web/);
  expect(await run(page,'docker stop web')).toContain('web');
  expect(await run(page,'docker ps')).not.toMatch(/\bweb\b/);
  expect(await run(page,'docker ps -a')).toMatch(/web[\s\S]*Exited|Exited[\s\S]*web/);
  await run(page,'docker start web');
  expect(await run(page,'docker inspect web')).toMatch(/IPAddress|Running|HostConfig/);
  expect(errors).toEqual([]);
});

test('Docker · imágenes, save/load, Dockerfile, volúmenes, redes y Compose',async({page})=>{
  const errors=captureRuntimeErrors(page);
  await openMode(page,'docker');
  await run(page,'docker pull alpine',{timeout:20000});
  await run(page,'docker tag alpine s2ktux/alpine:curso');
  expect(await run(page,'docker images')).toContain('s2ktux/alpine');
  await run(page,'docker save -o /tmp/alpine.tar alpine');
  expect(await run(page,'ls -l /tmp/alpine.tar')).toContain('alpine.tar');
  await run(page,'docker rmi alpine');
  await run(page,'docker load -i /tmp/alpine.tar');
  expect(await run(page,'docker images')).toContain('alpine');

  await run(page,'mkdir -p /root/miweb');
  await run(page,"printf 'FROM alpine\\nRUN echo construido > /resultado\\nCMD [\"sh\"]\\n' > /root/miweb/Dockerfile");
  expect(await run(page,'docker build -t miweb:1 /root/miweb',{timeout:20000})).toMatch(/Successfully built|naming to|miweb:1/i);

  await run(page,'docker volume create datos');
  await run(page,'docker network create backend');
  await run(page,'docker run -d --name app --network backend -v datos:/var/lib/app miweb:1');
  expect(await run(page,'docker volume inspect datos')).toContain('datos');
  expect(await run(page,'docker network inspect backend')).toMatch(/backend[\s\S]*app|app[\s\S]*backend/);

  await run(page,'mkdir -p /root/stack');
  await run(page,"printf 'services:\\n  web:\\n    image: nginx\\n    ports:\\n      - \"8081:80\"\\n' > /root/stack/compose.yaml");
  await run(page,'cd /root/stack');
  expect(await run(page,'docker compose up -d',{timeout:20000})).toMatch(/Created|Started|Running/i);
  expect(await run(page,'docker compose ps')).toMatch(/web|nginx/i);
  await run(page,'docker compose down');
  expect(errors).toEqual([]);
});

test('Kubernetes · nodos, workloads, servicios, escalado, rollout y diagnóstico causal',async({page})=>{
  const errors=captureRuntimeErrors(page);
  await openMode(page,'kubernetes');
  expect(await run(page,'kubectl get nodes')).toMatch(/Ready/);
  await run(page,'kubectl create deployment web --image=nginx');
  expect(await run(page,'kubectl get deployments')).toMatch(/web[\s\S]*(?:0|1)\/1|(?:0|1)\/1[\s\S]*web/);
  await run(page,'kubectl rollout status deployment/web',{timeout:15000});
  expect(await run(page,'kubectl get deployments')).toMatch(/web[\s\S]*1\/1|1\/1[\s\S]*web/);
  await run(page,'kubectl expose deployment web --port=80 --target-port=80');
  expect(await run(page,'kubectl get services')).toMatch(/web[\s\S]*80/);
  await run(page,'kubectl scale deployment web --replicas=3');
  expect(await run(page,'kubectl get pods')).toMatch(/web/);
  await run(page,'kubectl set image deployment/web nginx=nginx:1.27');
  expect(await run(page,'kubectl rollout status deployment/web',{timeout:15000})).toMatch(/successfully rolled out|complete/i);
  await run(page,'kubectl rollout undo deployment/web');
  expect(await run(page,'kubectl describe deployment web')).toMatch(/Replicas|Image|Conditions/);
  expect(await run(page,'kubectl get events')).toMatch(/Normal|Scheduled|Scaling|Pulled/i);
  expect(errors).toEqual([]);
});

test('Kubernetes · YAML, configuración, storage, RBAC, logs y herramientas del nodo',async({page})=>{
  const errors=captureRuntimeErrors(page);
  await openMode(page,'kubernetes');
  await run(page,"printf 'apiVersion: v1\\nkind: Namespace\\nmetadata:\\n  name: laboratorio\\n' > /tmp/ns.yaml");
  expect(await run(page,'kubectl apply -f /tmp/ns.yaml')).toMatch(/created|configured/);
  expect(await run(page,'kubectl get namespace laboratorio')).toContain('laboratorio');
  await run(page,'kubectl create configmap app-config --from-literal=MODO=curso -n laboratorio');
  await run(page,'kubectl create secret generic app-secret --from-literal=CLAVE=demo -n laboratorio');
  expect(await run(page,'kubectl get configmap,secret -n laboratorio')).toMatch(/app-config[\s\S]*app-secret|app-secret[\s\S]*app-config/);
  expect(await run(page,'kubectl auth can-i get pods')).toMatch(/yes|no/);
  expect(await run(page,'kubelet --version')).toContain('Kubernetes');
  expect(await run(page,'crictl version')).toContain('RuntimeName');
  expect(await run(page,'kubeadm version')).toMatch(/kubeadm|GitVersion/);
  expect(await run(page,'etcdctl endpoint status')).toMatch(/healthy|started|leader|127\.0\.0\.1/i);
  expect(errors).toEqual([]);
});

test('Linux · passwd, su, at, nmtui y visudo conservan control del TTY',async({page})=>{
  const errors=captureRuntimeErrors(page);
  await openMode(page,'linux');
  expect(await run(page,'at now')).toMatch(/job 1|warning/);
  expect(await run(page,'atq')).toMatch(/root|job/i);

  await submitRaw(page,'passwd root');
  await expect(page.locator('#term-prompt')).toContainText('Nueva contraseña');
  await submitRaw(page,'Cambio9!');
  await expect(page.locator('#term-prompt')).toContainText('Vuelva a escribir');
  await submitRaw(page,'Cambio9!');
  await waitForShell(page);

  await run(page,'useradd operador');
  await run(page,'su - operador');
  await expect(page.locator('#term-prompt')).toContainText('operador@');
  await run(page,'exit');
  await expect(page.locator('#term-prompt')).toContainText('root@');

  await focusXterm(page);
  await page.keyboard.type('nmtui');
  await page.keyboard.press('Enter');
  await expect(page.locator('#term-body')).toContainText('NetworkManager TUI');
  await page.keyboard.press('Escape');
  await waitForShell(page);

  await focusXterm(page);
  await page.keyboard.type('visudo');
  await page.keyboard.press('Enter');
  await expect(page.locator('#term-editor')).toBeAttached();
  await page.keyboard.press('Escape');
  await page.keyboard.type(':q!');
  await page.keyboard.press('Enter');
  await waitForShell(page);
  expect(errors).toEqual([]);
});

for(const mode of MODES){
  for(const command of ['bash','sh','clear','reset','exit','logout','reboot','poweroff','shutdown']){
    test(mode+' · control de sesión: '+command,async({page})=>{
      const errors=captureRuntimeErrors(page);
      await openMode(page,mode);
      await submitRaw(page,command);
      if(mode==='linux' && ['reboot','poweroff','shutdown'].includes(command)){
        await expect(page.locator('#term-prompt')).toContainText('login:',{timeout:12000});
      }else{
        await waitForShell(page,12000);
      }
      expect(errors).toEqual([]);
    });
  }
}

for(const mode of MODES){
  test(mode+' · F5 destruye el laboratorio y devuelve al selector',async({page})=>{
    await openMode(page,mode);
    if(mode!=='linux') await run(page,'touch /tmp/no-debe-sobrevivir');
    await page.reload();
    await expect(page.locator('#mode-select')).toBeVisible();
    await page.locator('[data-pick-mode="'+mode+'"]').click();
    if(mode==='linux') await page.locator('#term-solved').click();
    await waitForShell(page);
    expect(await run(page,'test -e /tmp/no-debe-sobrevivir; echo $?')).toMatch(/1/);
  });
}

test('@mobile cabecera, selector, terminal y controles no desbordan',async({page})=>{
  await page.goto('/terminal.html');
  await expect(page.locator('#mode-select')).toBeVisible();
  const selectorFits=await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1);
  expect(selectorFits).toBeTruthy();
  await page.locator('[data-pick-mode="docker"]').click();
  await expect(page.locator('#terminal-shell')).toBeVisible();
  const metrics=await page.evaluate(()=>({
    viewport:window.innerWidth,
    document:document.documentElement.scrollWidth,
    actions:document.querySelector('#term-actions')?.getBoundingClientRect().toJSON(),
    terminal:document.querySelector('#term-xterm')?.getBoundingClientRect().toJSON()
  }));
  expect(metrics.document).toBeLessThanOrEqual(metrics.viewport+1);
  expect(metrics.actions.x).toBeGreaterThanOrEqual(0);
  expect(metrics.actions.right).toBeLessThanOrEqual(metrics.viewport+1);
  expect(metrics.terminal.x).toBeGreaterThanOrEqual(0);
  expect(metrics.terminal.right).toBeLessThanOrEqual(metrics.viewport+1);
});
