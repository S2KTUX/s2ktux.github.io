import {loadEngine,engineHash} from '../perfil-motor.mjs';
import {Terminal} from '/laboratorios/docker-real/vendor/xterm.mjs';
import {ChunkDisk} from '../disco-kubernetes.mjs?v=24e556fdea9d7b1c';
import {createEthernetInternet} from '/laboratorios/docker-real/ethernet-internet.mjs';
import {attachTerminalClipboard} from '/laboratorios/docker-real/v86-clipboard.mjs';
import {createKubeChecks} from '../serial-checks.mjs?v=b4caa929394c3188';
import {EstadoConsola} from './estado-consola.mjs';
import {cargarFabricaDebian,perfilFabricaDebian} from './fabrica.mjs?v=20261020';
import {liberarEstadoInicial} from '../liberar-arranque.mjs';
import {KubeSessions} from '../kube-sessions.mjs?v=8c170f9003793741';
import {hashBytes} from '/laboratorios/docker-real/v86-sessions.mjs';
import {prepararWorkerDebian,perfilWorker} from './preparar-worker.mjs';
import {ThreadVM} from '../motor-hilo.mjs?v=e53ba023097977b2';
import {ordenPromptDinamico,promptConfirmado} from './prompt.mjs';
import {identidadNodoDebian} from './sesiones-cluster.mjs?v=d39e1beb6fdb94c6';
import {comandosTlsLaboratorio,comandosTlsApiServer,ordenEntornoTls,entornoTlsConfirmado} from './tls-laboratorio.mjs';
import {comandosMontajeComponentes} from './montaje-componentes.mjs';
import {PresentacionConsola} from './presentacion-consola.mjs';
import {prepararPerfilConsola,ordenCambiarConsola,consolaConfirmada,consolaCgroup} from './consola-scope.mjs';
import {prepararAdministracion} from './preparar-administracion.mjs';
import {comandosEntornoPreparado} from './comprobar-entorno-preparado.mjs?v=523c698a0ac25012';
import {panicDeArranque} from './panic-arranque.mjs';
import {kernelSha256} from './kernel-perfil.mjs';
import {recursoPesado} from '../recursos-publicados.mjs';
const status=document.querySelector('#status'),start=document.querySelector('#start'),save=document.querySelector('#save'),reset=document.querySelector('#reset');
const base=new URL(location.href).searchParams.get('base')||'v3';
const baseHashes={v1:'66d2cbe7fc76c5d1f618c2cad655ef4979d0e145885637e8ac8d61003cc47302',v2:'175e42905bb8f50cd0bffd3df47071740f098f875b11145fe31c7cf9c3fccff1',v3:'289150401015a0cac0bbb6ce60a602f0c519758527d2d14fc79c4a2984bb70fb',v4:'fcbd48d751b9ace0693783390a1491c8fb6c4e9ee6049660c657f36426a8a800',v5:'fd01e13c792d7ced1953f5d72184bb0fb6611b22fda859ef0e98fdf61b0d9dd1',v6:'b28ae1db29f350845de04ec03188d6d89fa7b86250e5788e45497478fd284716'};
baseHashes['admin-v1']='71bc2f098df5d02121bf813490808317e627e6e8f875d1eb1d00bc78d310db18';
baseHashes['admin-v2']='cd113483ac5af5fab4708f2dbcdc3e78a9d3bdb24dff000a23d24ed80a09bd83';
baseHashes['admin-v3']='9178e37b2784a7cd66b641d45d8a80d16f6745ba518cabe4f4cbe30a4bf33162';
if(!Object.hasOwn(baseHashes,base))throw Error('Base Debian no comprobada');
const administration=['admin-v1','admin-v2','admin-v3'].includes(base);
const diskMode=new URL(location.href).searchParams.get('disk-mode')||'dma';
if(!['dma','pio'].includes(diskMode))throw Error('Modo de disco desconocido');
const sharedCode=new URL(location.href).searchParams.get('shared-code')==='1';
const withKube=new URL(location.href).searchParams.get('kube')==='1';
const components=new URL(location.href).searchParams.get('components')||'v5';
const warm=new URL(location.href).searchParams.get('warm')==='1';
const clustered=new URL(location.href).searchParams.get('cluster')==='1';
const worker=new URL(location.href).searchParams.get('worker');
const threaded=new URL(location.href).searchParams.get('threaded')==='1';
const engineVariant=new URL(location.href).searchParams.get('engine')||'jit8192';engineHash(engineVariant);
const kernelVariant=new URL(location.href).searchParams.get('kernel')||'v1';kernelSha256(kernelVariant);
if(kernelVariant!=='v1'&&!(administration&&!warm&&!worker&&!clustered))throw Error('El kernel candidato solo admite administración fría: no capturas ni guardados anteriores');
if(diskMode==='pio'&&(!administration||warm||worker||clustered))throw Error('El ensayo PIO requiere administración fría aislada; no acepta guardados anteriores');
const schedulingAPI=new URL(location.href).searchParams.get('use-scheduling-api')==='1';
if(new URL(location.href).searchParams.has('use-scheduling-api')&&!schedulingAPI)throw Error('Planificador del motor desconocido');
const tlsMode=new URLSearchParams(location.search).get('tls');
const factoryVersion=new URLSearchParams(location.search).get('factory')||'v1';
if(engineVariant!=='jit8192'&&!((engineVariant==='jit8192-tsc-v1'&&administration&&!worker&&!clustered&&(!warm||(base==='admin-v3'&&factoryVersion==='v10'&&!threaded)))||(engineVariant==='jit8192-pic-v1'&&administration&&!warm&&!worker&&!clustered)))throw Error('El motor candidato requiere administración fría o su captura privada v10: no guardados anteriores');
const factoryHashes={v1:'dbc474623c439ed6a2dae501edf04b7d4db1bdd698fd7514f827e171375ec4e7',v2:'1f82f8ce8b0fde26190f87d50a94c90e0ca5ea2541b5ee2e90915d9f76af338e',v3:'5d1cb4caf4556c0e6e865faecdafa5547129f2b8cdbf063b5e40366a030ff77a',v4:'9132e7353df15cd56876a2aedc483810f367f74ee589387cda9c6ba2a1fd8ba7',v5:'a89a3e4916abc6355b29a6f817dc24eb6823cab9f0b8ddca1c4ec15ae77af200',v6:'978b8b5ba7828962bc5871161c82b4a40fb603865bb2ec21afba9c4d5bfb0851'};
factoryHashes.v7='cca924439589808f8267f7bb16f9815b6c30669fd20cd4c452307c439a43805c';
factoryHashes.v8='6e4f96f5c6157536e874d5c5c4ad1862d54d246134505b7e47fd096b2eb1b962';
factoryHashes.v10='e716b130f539300133e8d42fce48f8f603047e0f6b8c86191b4a5d2337afd285';
if(!Object.hasOwn(factoryHashes,factoryVersion))throw Error('Fábrica Debian no comprobada');
if(factoryVersion==='v7'&&(base!=='admin-v1'||!warm||threaded))throw Error('La captura de administración requiere su propia base y arranque preparado aislado');
if(factoryVersion==='v8'&&(base!=='admin-v2'||(worker?(warm||!threaded):(!warm||threaded))||!schedulingAPI))throw Error('La captura precargada requiere su base propia y Scheduler API');
if(base==='admin-v2'&&warm&&factoryVersion!=='v8')throw Error('La base precargada no acepta capturas anteriores');
if(factoryVersion==='v10'&&(base!=='admin-v3'||!warm||worker||clustered||threaded||!schedulingAPI||engineVariant!=='jit8192-tsc-v1'))throw Error('La captura privada v10 requiere su base, motor y planificador propios, aislados');
if(base==='admin-v3'&&(worker||clustered||(warm&&factoryVersion!=='v10')))throw Error('La base desempaquetada requiere su captura privada v10 o arranque frío aislado');
if(factoryVersion==='v2'&&(!warm||clustered||worker||tlsMode!=='classical'))throw Error('La fábrica v2 se prueba aislada, con TLS verificado');
if(['v3','v4','v5','v6'].includes(factoryVersion)&&(tlsMode!=='classical'||(!warm&&!(clustered&&worker))))throw Error('La fábrica candidata requiere TLS verificado y su perfil de nodo');
const factoryProfile=perfilFabricaDebian(factoryVersion);
if(tlsMode!==null&&tlsMode!=='classical')throw Error('Modo TLS del laboratorio desconocido');
if(tlsMode&&!(warm||worker||administration))throw Error('La opción TLS se prueba solo en los nodos preparados del clúster');
if(administration&&(!withKube||components!=='v7'||(warm&&factoryVersion!==(base==='admin-v3'?'v10':base==='admin-v2'?'v8':'v7'))||((worker||clustered)&&(base!=='admin-v2'||factoryVersion!=='v8'))||tlsMode!=='classical'))throw Error('La base de administración requiere su kit y una captura propia o arranque frío');
if(sharedCode&&(!administration||warm||worker||clustered))throw Error('El ensayo de código compartido requiere administración fría aislada');
if(threaded&&!worker&&!administration)throw Error('El hilo independiente se prueba únicamente en workers Debian o administración privada');
const factoryBase=factoryVersion==='v10'?'admin-v3':factoryVersion==='v8'?'admin-v2':factoryVersion==='v7'?'admin-v1':['v5','v6'].includes(factoryVersion)?'v6':factoryVersion==='v4'?'v5':'v4';
if(worker){perfilWorker(worker);if(warm||base!==factoryBase||!['v7','v8'].includes(components)||!withKube)throw Error('El worker Debian requiere su perfil de componentes comprobado');}
if(warm&&!(base===factoryBase&&components==='v7'&&withKube))throw Error('La base preparada requiere su disco Debian y componentes v7');
const componentHashes={v5:'6b9c0db45704b66e7c1bc7f9bf3bfa1d808ba5bad07c427b30f4c6b9c99d0009',v7:'3fc89ed9b511bf8ac32b132295b1f3a887551e2eb008768aa670eae97a8e5345',v8:'a61ca9605d665c0e65f66eb7643a5be707f24af305cfc020f303976df0d3ea0d',v9:'81fe6fbdda06b6a4184ebed2233dfda4744f14c7993e801ebbb1b7778c54e75a'};
if(!Object.hasOwn(componentHashes,components))throw Error('Componentes no admitidos');
const terminal=new Terminal({cols:100,rows:28,fontSize:15,fontFamily:'"Share Tech Mono",monospace',scrollback:5000,theme:{background:'#161009',foreground:'#e9ddc7'}});
terminal.open(document.querySelector('#terminal'));
const presentation=new PresentacionConsola(terminal);
globalThis.kubeDebianBootNotice=text=>status.textContent=String(text);
globalThis.kubeDebianOpenTerminal=options=>{if(!options?.diagnostic&&(busy||!consoleState.idle))throw Error('El shell todavía está ocupado');presentation.open(kubeDebianTranscript,options);};
globalThis.kubeDebianVisibleTerminal=()=>presentation.text;
let vm,internet,busy=false,preparing=false,timer,bytes=[],record,identity,sessionRead=false;
const sessions=new KubeSessions(),sessionKey='debian-cka-cp1-'+factoryBase+'-components-v7-factory-'+factoryVersion;
save.hidden=reset.hidden=!warm||clustered;
const consoleState=new EstadoConsola(),encoder=new TextEncoder();
const decoder=new TextDecoder();
globalThis.kubeDebianTranscript='';globalThis.kubeDebianErrors=[];globalThis.kubeDebianReady=false;
globalThis.kubeDebianProfile=Object.freeze({base,components,warm,worker,threaded,tlsMode,factoryVersion,diskMode,engineVariant,kernelVariant});
const prompt=()=>/(?:^|\n)\[[^\n@\]]+@[^\n\]]+ [^\n\]]*\][#$] $/.test(kubeDebianTranscript.replace(/\r/g,'').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,''));
function fail(error){kubeDebianReady=false;save.disabled=true;kubeDebianErrors.push(String(error.message||error));status.textContent='La prueba no pudo continuar: '+(error.message||error);checks.abort(error);}
function diskFailure(error){fail(Error('Error de disco: '+(error.message||error)));vm?.stop().catch(()=>{});}
const checks=createKubeChecks(command=>{consoleState.input(command);vm.serial0_send(command);},()=>!!vm&&consoleState.idle,text=>{consoleState.receive(text);presentation.finish(text);},{
 onPhase:label=>{if(!globalThis.kubeDebianReady)status.textContent=label+'…';},
 onOutput:text=>{if(!presentation.opened)terminal.write(text);},
});
async function separarConsola(){
 for(const command of prepararPerfilConsola()){
  const result=await checks.run({checks:[['Preparar sesión nativa de consola',command]]},60000);
  if(!result.ok)throw Error('No se pudo preparar la sesión de consola; no se sobrescribe una configuración distinta');
 }
 const existing=await checks.run({checks:[['Consultar el grupo de CPU de la sesión',`grep -q "${consolaCgroup}" /proc/$$/cgroup`]]},30000);
 if(!existing.ok){
  const nonce=Array.from(crypto.getRandomValues(new Uint8Array(12)),n=>n.toString(16).padStart(2,'0')).join('');
  const command=ordenCambiarConsola(nonce);consoleState.input(command);vm.serial0_send(command);
  const deadline=Date.now()+60000;
  while(!consolaConfirmada(kubeDebianTranscript,nonce)){
   if(Date.now()>deadline)throw Error('La nueva consola no devolvió su prompt nativo');
   await new Promise(resolve=>setTimeout(resolve,100));
  }
 }
 const verified=await checks.run({checks:[['Verificar sesión real y mismos privilegios',`test "$(id -u)" = 0 && test "$S2KTUX_CONSOLE_SCOPE" = 1 && grep -q "${consolaCgroup}" /proc/$$/cgroup && test "$(cat /sys/fs/cgroup/s2ktuxconsole.slice/cpu.weight)" = 20`]]},30000);
 if(!verified.ok)throw Error('La consola no confirmó su sesión nativa');
}
// Solo se usa automáticamente al preparar una VM nueva. Recuperar un
// guardado no mueve procesos ni reescribe el perfil del alumno.
globalThis.kubeDebianConsoleScope=async()=>{
 if(busy||!consoleState.idle)throw Error('Espera al prompt vacío');busy=true;
 try{await separarConsola();}finally{busy=false;}
};
globalThis.kubeDebianRun=async(label,command,timeout=180000)=>{
 if(!vm||busy||!consoleState.idle)throw Error('Espera al prompt vacío.');busy=true;
 try{return await checks.run({checks:[[label,command]]},timeout);}finally{busy=false;}
};
// Solo las máquinas frías privadas de HA cambian su identidad tras arrancar.
// Cambiar el PS1 del Bash real; nunca dibujar un nombre distinto en xterm.
globalThis.kubeDebianPromptHA=async name=>{
 if(!administration||busy||!consoleState.idle||!/^cka-cp[123]$/.test(name))throw Error('Prompt HA fuera de su escenario');
 busy=true;
 try{
  const actual=await checks.run({checks:[['Comprobar hostname nativo',`test "$(hostname -s)" = ${name}`]]},30000);if(!actual.ok)throw Error('El hostname no coincide');
  const nonce=Array.from(crypto.getRandomValues(new Uint8Array(12)),n=>n.toString(16).padStart(2,'0')).join(''),command=ordenPromptDinamico(nonce);
  consoleState.input(command);vm.serial0_send(command);const deadline=Date.now()+30000;
  while(!promptConfirmado(kubeDebianTranscript,nonce,name)){if(Date.now()>deadline)throw Error('El Bash no confirmó el prompt HA');await new Promise(resolve=>setTimeout(resolve,100));}
 }finally{busy=false;}
};
async function prepare(){
 if(preparing)return;preparing=true;busy=true;
 try{
  status.textContent='Comprobando Debian y sus servicios reales…';
  if(record){
   // Conservar también las averías del alumno: recuperar no es reparar.
   const result=await checks.run({checks:[['Recuperar solo la consola guardada','test -r /proc/version']]},90000);
   if(!result.ok)throw Error('No se ha recuperado la consola guardada');
   kubeDebianReady=true;save.disabled=false;status.textContent='Sesión Debian recuperada, sin reparar ni cambiar tus prácticas.';return;
  }
  const result=await checks.run({checks:[
   ['systemd es PID 1',`test "$(cat /proc/1/comm)" = systemd && test "$(dpkg --print-architecture)" = i386 && systemctl --version`],
   ['containerd responde a systemd',`deadline=$(($(date +%s)+90)); while test "$(date +%s)" -lt "$deadline"; do systemctl is-active --quiet containerd && test -S /run/containerd/containerd.sock && exit 0; sleep 2; done; journalctl -u containerd -n 30 --no-pager; exit 1`],
   ...(warm?[
    ['Repartir CPU nativa antes de consultar la fábrica limpia','systemctl set-property system.slice CPUWeight=10 && test "$(cat /sys/fs/cgroup/system.slice/cpu.weight)" = 10'],
    ['Comprobar API recuperada sin repararla',`${tlsMode==='classical'?'export GODEBUG=tlsmlkem=0; ':''}deadline=$(($(date +%s)+180)); while test "$(date +%s)" -lt "$deadline"; do kubectl get --raw=/readyz --request-timeout=10s && exit 0; sleep 3; done; exit 1`],
    ['Comprobar identidad y servicios del clúster recuperado',`${tlsMode==='classical'?'export GODEBUG=tlsmlkem=0; ':''}test "$(hostname)" = cka-cp1 && ip -4 -o address show dev eth0 | grep -q '10.77.0.10/24' && systemctl is-active --quiet kubelet && kubectl wait --for=condition=Ready node/cka-cp1 --timeout=120s`],
   ]:[]),
  ]},180000);
  if(!result.ok)throw Error('No se ha superado: '+result.results.filter(check=>!check.ok).map(check=>check.label).join('; '));
  if(administration&&!warm)await prepararAdministracion(async(label,command,timeout=180000)=>{const result=await checks.run({checks:[[label,command]]},timeout);if(!result.ok)throw Error(label+' falló');},{sharedCode});
  if(warm){for(const command of comandosMontajeComponentes()){const mounted=await checks.run({checks:[['Conservar componentes al reiniciar',command]]},180000);if(!mounted.ok)throw Error('El montaje persistente no ha pasado');}}
  if(worker){
   await prepararWorkerDebian(worker,async(label,command,timeout=180000)=>{const result=await checks.run({checks:[[label,command]]},timeout);if(!result.ok)throw Error(label+' falló');},{packaged:administration});
   // Bash conserva \h del login anterior a hostnamectl. Cambiar el prompt
   // real del shell principal y confirmar su salida, no dibujarlo en xterm.
   const nonce=Array.from(crypto.getRandomValues(new Uint8Array(12)),n=>n.toString(16).padStart(2,'0')).join(''),command=ordenPromptDinamico(nonce);
   consoleState.input(command);vm.serial0_send(command);const deadline=Date.now()+30000;
   while(!promptConfirmado(kubeDebianTranscript,nonce,perfilWorker(worker).name)){if(Date.now()>deadline)throw Error('No se ha confirmado el prompt del worker');await new Promise(r=>setTimeout(r,100));}
  }
  if(tlsMode==='classical'){
   // Las fábricas balanceadas ya contienen este entorno en kubelet y el CP.
   // Verificar los procesos reales; no reiniciar kubelet ni reescribir el API
   // al abrir una captura limpia que ya superó init y los controles TLS.
   const preparedApi=warm&&['v2','v6','v7','v8','v10'].some(version=>factoryHashes[version]&&globalThis.kubeDebianFactory?.sha256===factoryHashes[version]);
   if(preparedApi){
    const actual=await checks.run({checks:comandosEntornoPreparado().map((command,index)=>[['Comprobar entorno real de API Server sin reiniciarlo','Comprobar entorno real de kubelet sin reiniciarlo'][index],command])},180000);
    if(!actual.ok)throw Error('La fábrica no conserva el ajuste real de sus procesos');
   }else for(const command of comandosTlsLaboratorio()){const result=await checks.run({checks:[['Configurar TLS verificado para el laboratorio',command]]},180000);if(!result.ok)throw Error('La configuración TLS no ha pasado');}
   const nonce=Array.from(crypto.getRandomValues(new Uint8Array(12)),n=>n.toString(16).padStart(2,'0')).join(''),command=ordenEntornoTls(nonce);
   consoleState.input(command);vm.serial0_send(command);const deadline=Date.now()+30000;
   while(!entornoTlsConfirmado(kubeDebianTranscript,nonce)){if(Date.now()>deadline)throw Error('No se ha confirmado el entorno TLS');await new Promise(r=>setTimeout(r,100));}
   if(warm&&!preparedApi)for(const command of comandosTlsApiServer()){const result=await checks.run({checks:[['TLS verificado también en API Server y su cliente interno',command]]},240000);if(!result.ok)throw Error('API Server no ha confirmado el ajuste TLS');}
  }
  if((base==='v6'||administration)&&withKube)await separarConsola();
  kubeDebianReady=true;save.disabled=!warm;status.textContent=worker?perfilWorker(worker).name+' preparado para kubeadm join.':warm?'Control plane Debian recuperado. Prueba privada de un nodo.':'Base Debian disponible. El clúster aún no está preparado.';
 }catch(error){fail(error);}finally{busy=false;if(!clustered)presentation.open(kubeDebianTranscript,{diagnostic:!kubeDebianReady});}
}
function flush(){
 clearTimeout(timer);timer=undefined;if(!bytes.length)return;
 const text=decoder.decode(new Uint8Array(bytes),{stream:true});bytes=[];
 kubeDebianTranscript=(kubeDebianTranscript+text).slice(-300000);
 // Una línea asíncrona del kernel no significa que el usuario haya empezado
 // una orden. Solo el envío de entrada deja de estar en un prompt vacío.
 consoleState.receive(kubeDebianTranscript);
 if(!checks.receive(text)){if(!presentation.opened)terminal.write(text);else presentation.write(text);}
 if(panicDeArranque(kubeDebianTranscript,kubeDebianReady))fail(Error('El kernel no ha podido arrancar.'));
 if(prompt()&&!kubeDebianReady)prepare();
}
terminal.onData(text=>{if(vm&&!busy&&presentation.opened){consoleState.input(text);vm.serial0_send(Array.from(encoder.encode(text),byte=>String.fromCharCode(byte)).join(''));}});
attachTerminalClipboard(terminal,document.querySelector('#terminal'),{canPaste:()=>!!vm&&!busy&&presentation.opened,notify:text=>status.textContent=text});
start.onclick=async()=>{
 start.disabled=true;status.textContent='Cargando el nodo Debian…';
 try{
  const manifest=await fetch(`disco-${base}/disco-fragmentado.json`).then(r=>{if(!r.ok)throw Error('Base Debian no disponible');return r.json();});
  if(manifest.sha256!==baseHashes[base])throw Error('No coincide la base Debian comprobada');
  const disk=globalThis.kubeDebianDisk=new ChunkDisk(manifest,new URL(`./disco-${base}/`,import.meta.url),diskFailure);
  let componentDisk;
  if(withKube){
   const componentManifest=await fetch(`../componentes/disco-${components}/disco-fragmentado.json`).then(r=>{if(!r.ok)throw Error('Componentes no disponibles');return r.json();});
   if(componentManifest.sha256!==componentHashes[components])throw Error('Los componentes no coinciden con el candidato comprobado');
   componentDisk=globalThis.kubeDebianComponentDisk=new ChunkDisk(componentManifest,new URL(`../componentes/disco-${components}/`,import.meta.url),diskFailure,96);
  }
  const {V86,wasm_fn}=threaded?{}:await loadEngine(engineVariant,fail);
  let initial;
  if(clustered&&globalThis.kubeDebianRestoreNode){
   identity=await identidadNodoDebian(worker?'worker'+worker:'controlplane',{workerComponents:worker?components:'v7',factoryVersion});record=globalThis.kubeDebianRestoreNode;
   initial={buffer:await sessions.unpack(record,identity)};presentation.restore(record.terminalText);
  }else if(warm){
   identity=await hashBytes(encoder.encode(JSON.stringify({profile:factoryProfile,factorySha256:factoryHashes[factoryVersion]})));
   if(!clustered){record=await sessions.get(sessionKey);sessionRead=true;reset.disabled=false;}
   if(record){
    initial={buffer:await sessions.unpack(record,identity)};presentation.restore(record.terminalText);
   }else{
    const loaded=await cargarFabricaDebian(new URL('fabrica/'+factoryVersion+'/',import.meta.url),{...factoryProfile,rootSha256:manifest.sha256,componentsSha256:componentDisk.manifest.sha256},{notify:text=>status.textContent=text});
    if(loaded.factory.sha256!==factoryHashes[factoryVersion])throw Error('La captura no coincide con la base comprobada');
    initial={buffer:loaded.buffer};globalThis.kubeDebianFactory=loaded.factory;
   }
  }
  let bzimage={url:new URL('/laboratorios/docker-real/artefactos/vmlinuz-docker-v3',import.meta.url).href};
  if(['v3','v4','v5','v6'].includes(base)||administration){
   const response=await fetch(recursoPesado(new URL('kernel/'+kernelVariant+'/vmlinuz',import.meta.url)));if(!response.ok)throw Error('Kernel CKA no disponible');
   const buffer=await response.arrayBuffer();
   const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer)),byte=>byte.toString(16).padStart(2,'0')).join('');
   if(hash!==kernelSha256(kernelVariant))throw Error('Kernel CKA distinto del comprobado');
   bzimage={buffer};
  }
  const settings={memory_size:1024*1048576,wasm_fn,bios:{url:new URL('/laboratorios/docker-real/motor/seabios.bin',import.meta.url).href},vga_bios:{url:new URL('/laboratorios/docker-real/motor/vgabios.bin',import.meta.url).href},bzimage,initrd:{url:new URL('/laboratorios/docker-real/artefactos/initrd-v2',import.meta.url).href},...(initial?{initial_state:initial}:{}),hda:disk,...(componentDisk?{hdb:componentDisk}:{}),cmdline:'console=ttyS0,115200 root=/dev/sda rw rootfstype=ext4 net.ifnames=0 biosdevname=0 tsc=reliable nowatchdog systemd.unified_cgroup_hierarchy=1'+(diskMode==='pio'?' libata.force=nodma':'')+(kernelVariant==='v2'?' ne2k_pci.tx_watchdog_ms=5000':''),preserve_mac_from_state_image:true,autostart:false,disable_keyboard:true,disable_mouse:true,disable_speaker:true};
  if(threaded){
   const {hda,hdb,wasm_fn,...threadSettings}=settings;
   vm=new ThreadVM(threadSettings,{root:{manifest:disk.manifest,base:disk.base.href},components:{manifest:componentDisk.manifest,base:componentDisk.base.href},internet:true,engine:engineVariant,schedulingAPI,onError:fail});
   // Las escrituras pertenecen al hilo, no a los adaptadores de metadatos.
   globalThis.kubeDebianDisk={manifest:disk.manifest,settle:()=>vm.settle()};
   globalThis.kubeDebianComponentDisk={manifest:componentDisk.manifest,settle:()=>vm.settle()};
  }else vm=new V86(settings);
  globalThis.kubeDebianVM=vm;
  vm.add_listener('serial0-output-byte',byte=>{bytes.push(byte);if(bytes.length>=2048)flush();else if(timer===undefined)timer=setTimeout(flush,16);});
  vm.add_listener('emulator-loaded',async()=>{
   try{
    liberarEstadoInicial(settings);
    let actual;
    if(threaded)actual=await vm.configureJit(3);
    else{vm.v86.cpu.set_jit_config(1,3);actual={loopProtection:vm.v86.cpu.wm.exports.get_jit_config(2)};}
    if(actual.loopProtection!==1)throw Error('Protección del motor no disponible');
    if(!threaded)internet=globalThis.kubeDebianInternet=createEthernetInternet(vm.bus);
    await vm.run();if(initial)vm.serial0_send('\n');initial=undefined;
   }catch(error){fail(error);}
  });
 }catch(error){fail(error);internet?.destroy();await vm?.destroy();}
};
globalThis.kubeDebianSnapshot={
 lock(){
  if(!clustered||!vm||busy||!kubeDebianReady||!consoleState.idle)throw Error('Termina el comando o editor en cada nodo antes de guardar.');
  busy=true;return {terminalText:presentation.text};
 },
 async freeze(){await vm.stop();flush();await kubeDebianDisk.settle();await kubeDebianComponentDisk.settle();},
 state(){return vm.save_state();},
 async release(){try{await vm.run();}finally{busy=false;}},
};
save.onclick=async()=>{
 if(!warm||clustered||!vm||busy||!kubeDebianReady)return;
 if(!consoleState.idle){status.textContent='Vuelve al prompt antes de guardar: termina el comando o sal del editor.';return;}
 busy=true;save.disabled=reset.disabled=true;status.textContent='Guardando la sesión Debian en este navegador…';
 try{
  await vm.stop();await kubeDebianDisk.settle();await kubeDebianComponentDisk.settle();
  const state=await vm.save_state();record=await sessions.save(sessionKey,identity,state,presentation.text,record?.sha256||null);
  globalThis.kubeDebianSaved={bytes:record.bytes,packedBytes:record.packedBytes,sha256:record.sha256};status.textContent='Sesión guardada.';
 }catch(error){status.textContent='No se ha guardado: '+(error.message||error);}
 finally{try{await vm.run();}catch(error){fail(error);}busy=false;save.disabled=!kubeDebianReady;reset.disabled=!sessionRead;}
};
reset.onclick=async()=>{
 if(!warm||clustered||busy||!sessionRead)return;
 if(!confirm('¿Borrar la sesión Debian de este prototipo y volver a la base limpia? Los otros laboratorios no se modifican.'))return;
 busy=true;save.disabled=reset.disabled=true;
 try{await sessions.deleteUnchanged(sessionKey,record?.sha256||null);internet?.destroy();await vm?.destroy();location.reload();}
 catch(error){status.textContent='No se ha borrado: '+(error.message||error);busy=false;save.disabled=!kubeDebianReady;reset.disabled=false;}
};
window.addEventListener('pagehide',()=>{internet?.destroy();vm?.destroy();});
