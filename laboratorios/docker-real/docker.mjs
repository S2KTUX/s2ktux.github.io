import {V86} from './motor/libv86-rhcsa.mjs';
import {Terminal} from './vendor/xterm.mjs';
import {ChunkDisk} from './v86-disk.mjs';
import {LocalSessions,hashBytes} from './v86-sessions.mjs';
import {createEthernetInternet} from './ethernet-internet.mjs';
import {attachTerminalClipboard} from './v86-clipboard.mjs';
import {exercises} from './docker-exercises.mjs?v=20261021-resueltas';
import {createDockerChecks} from './docker-checks.mjs?v=20261117-release';
import {renderSolutions} from '../lab-solutions.mjs?v=20261020-aprendizaje';
import {solutionsFor} from '../solution-options.mjs?v=20261020-aprendizaje';
import {mountGroups} from '../lab-groups.mjs?v=20261020-aprendizaje';
import {mountLabNotices} from '../lab-notices.mjs';
import {practiceProgress} from '../practice-progress.mjs?v=20261021-resueltas';
import {renderPracticeResult} from '../practice-feedback.mjs?v=20261021-resueltas';
const start=document.querySelector('#start'),save=document.querySelector('#save'),reset=document.querySelector('#reset'),status=document.querySelector('#status'),savedStatus=document.querySelector('#session-status');
mountLabNotices(document.querySelector('main'),status);
const terminal=new Terminal({cols:100,rows:28,scrollback:5000,fontSize:15,fontFamily:'"Share Tech Mono",monospace',theme:{background:'#161009',foreground:'#e9ddc7',cursor:'#e0a458',selectionBackground:'#6b543f'}});
terminal.open(document.querySelector('#terminal'));
const sessions=new LocalSessions(),sessionKey='s2ktux-docker-v86-v1';
let previousSessionSha=null;
let vm,disk,identity,record,internet,busy=false,typing=false,initializing=false,visibleTranscript='';
const decoder=new TextDecoder(),encoder=new TextEncoder();
const clean=text=>text.replace(/\r/g,'').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,'');
const promptVisible=()=>/(?:^|\n)\[[^\n@\]]+@[^\n\]]+ [^\n\]]*\][#$] $/.test(clean(dockerTranscript.slice(-1500)));
const atPrompt=()=>!typing&&promptVisible();
globalThis.dockerTranscript='';globalThis.dockerErrors=[];globalThis.dockerShellReady=false;
function fail(error){dockerErrors.push(error.message||String(error));status.textContent='No se pudo continuar: '+(error.message||error);vm?.stop();save.disabled=true;}
const display=text=>{visibleTranscript=(visibleTranscript+text).slice(-100000);terminal.write(text);};
const checker=createDockerChecks(command=>vm.serial0_send(command),()=>!!vm&&!busy&&atPrompt(),display);
function prepareSession(){
 if(initializing||dockerShellReady)return;initializing=true;
 const clock=record?`date -u -s @${Math.floor(Date.now()/1000)} >/dev/null; `:'';
 const defaultTag=record?'':'docker image inspect alpine:latest >/dev/null 2>&1 || docker tag alpine:3.23 alpine:latest; ';
 const result=checker.run({checks:[['Docker disponible',clock+'for n in $(seq 1 45); do test -S /var/run/docker.sock && docker version >/dev/null 2>&1 && { '+defaultTag+'exit 0; }; sleep 1; done; exit 1']]});
 busy=true;save.disabled=true;reset.disabled=true;status.textContent='Preparando Docker…';
 result.then(r=>{if(!r.ok)throw Error('Docker no ha terminado de arrancar.');globalThis.dockerShellReady=true;status.textContent=record?'Sesión recuperada.':'Laboratorio disponible.';}).catch(e=>{dockerErrors.push(e.message);status.textContent=e.message;}).finally(()=>{busy=false;save.disabled=false;reset.disabled=false;syncPractice();});
}
terminal.onData(text=>{if(vm&&!busy){if(!/^\x1b\[\d+;\d+R$/.test(text))typing=true;vm.serial0_send(Array.from(encoder.encode(text),n=>String.fromCharCode(n)).join(''));}});
attachTerminalClipboard(terminal,document.querySelector('#terminal'),{canPaste:()=>!!vm&&!busy,notify:text=>status.textContent=text});
async function get(path){const response=await fetch(new URL(path,import.meta.url));if(!response.ok)throw Error('No se pudo descargar '+path);return response;}
start.onclick=async()=>{
 if(vm||busy)return;busy=true;start.disabled=true;status.textContent='Cargando Docker…';
 try{
  const manifest=await (await get('artefactos/disco-v4/disco-fragmentado.json')).json();
  const factory=await (await get('factory.json?v=20261117-release')).json();
  identity=await hashBytes(new TextEncoder().encode(JSON.stringify({manifest,factory:factory.sha256,memory:1024,motor:'c064c94714c4b8eeace32782a4013b6132a2331ba5c008abfd67274cc2d29caf',wasm:'abd512988f39f5c81d4930f564bafa1a6e1e0d5210de9b20e2bdec13fbc318d9',kernel:'65632160583cddbf3f1fbd3749468b3af526d5db75a99c7109e8b4672e23b762',initrd:'7d5b72edc78cab2709ffbf8a67e958a8b34dc769b7b43bbb6eeed1c8ef817965',version:1})));
  disk=new ChunkDisk(manifest,new URL('artefactos/disco-v4/',import.meta.url),fail);
  record=await sessions.get(sessionKey);
  previousSessionSha=record?.sha256||null;
  if(record&&record.identity!==identity){
   savedStatus.textContent='La sesión anterior ya no se puede abrir con esta versión. Al guardar se sustituirá por la nueva.';
   record=null;
  }
  let initial=record?{buffer:await sessions.unpack(record,identity)}:undefined;
  if(!initial){
   const base=new URL(document.querySelector('meta[name=docker-assets-base]').content);
   const chunks=[];
   for(const part of factory.parts){
    const response=await fetch(new URL(part.file,base));
    if(!response.ok)throw Error('No se pudo descargar la base Docker: '+response.status);
    const chunk=await response.arrayBuffer();
    if(chunk.byteLength!==part.bytes||await hashBytes(chunk)!==part.sha256)throw Error('Fragmento Docker alterado');
    chunks.push(chunk);
   }
   const packed=new Blob(chunks);
   if(packed.size!==factory.packedBytes||await hashBytes(await packed.arrayBuffer())!==factory.sha256)throw Error('Base Docker alterada');
   const buffer=await new Response(packed.stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
   if(buffer.byteLength!==factory.bytes)throw Error('Base Docker incompleta');
   initial={buffer};
  }
  if(record){display(record.terminalText);dockerTranscript=record.terminalText;}
  vm=globalThis.dockerVM=new V86({wasm_path:new URL('motor/v86.wasm',import.meta.url).href,memory_size:1024*1048576,bios:{url:new URL('motor/seabios.bin',import.meta.url).href},vga_bios:{url:new URL('motor/vgabios.bin',import.meta.url).href},bzimage:{url:new URL('artefactos/vmlinuz-docker-v3',import.meta.url).href},initrd:{url:new URL('artefactos/initrd-v2',import.meta.url).href},cmdline:'console=ttyS0,115200 root=/dev/sda rw rootfstype=ext4 net.ifnames=0 biosdevname=0 tsc=reliable nowatchdog',hda:disk,initial_state:initial,preserve_mac_from_state_image:true,autostart:false,disable_keyboard:true,disable_mouse:true,disable_speaker:true});
  globalThis.dockerDisk=disk;
  vm.add_listener('serial0-output-byte',byte=>{const text=decoder.decode(new Uint8Array([byte]),{stream:true});if(!text)return;dockerTranscript=(dockerTranscript+text).slice(-300000);if(promptVisible())typing=false;if(checker.receive(text))return;display(text);if(/Kernel panic|Launching initramfs emergency/.test(dockerTranscript.slice(-1000)))fail(Error('Linux no ha podido arrancar.'));if(atPrompt()){if(!dockerShellReady)prepareSession();else if(!busy)status.textContent='Laboratorio disponible.';}});
  vm.add_listener('emulator-loaded',()=>{internet=createEthernetInternet(vm.bus);globalThis.dockerInternet=internet;vm.run();});
  vm.add_listener('emulator-started',()=>{busy=false;save.disabled=false;status.textContent=record?'Sesión recuperada.':'Arrancando Linux…';if(initial)vm.serial0_send('\n');});
  terminal.focus();
 }catch(error){busy=false;initializing=false;fail(error);await vm?.destroy();internet?.destroy();vm=globalThis.dockerVM=undefined;start.disabled=false;}
};
globalThis.dockerSave=async()=>{
 if(!vm||busy)throw Error('La máquina todavía no está disponible.');if(!atPrompt())throw Error('Termina el comando o editor y vuelve al prompt vacío antes de guardar.');busy=true;save.disabled=true;status.textContent='Guardando sesión…';
 try{await vm.stop();await disk.settle();const state=await vm.save_state();record=await sessions.save(sessionKey,identity,state,visibleTranscript,previousSessionSha);previousSessionSha=record.sha256;setTimeout(()=>{void navigator.storage?.persist?.().catch(()=>false);},0);savedStatus.textContent='Sesión guardada en este navegador.';return {bytes:record.bytes,packedBytes:record.packedBytes};}
 finally{try{await vm.run();}finally{busy=false;save.disabled=false;status.textContent='Laboratorio disponible.';}}
};
save.onclick=()=>dockerSave().catch(error=>{status.textContent=error.message;});
globalThis.dockerReset=async()=>{if(busy)throw Error('Espera a que termine la operación actual.');busy=true;reset.disabled=true;try{await vm?.stop();await sessions.delete(sessionKey);await vm?.destroy();internet?.destroy();location.reload();}catch(error){busy=false;reset.disabled=false;throw error;}};
reset.onclick=()=>{if(confirm('¿Resetear Docker? Se perderán los cambios y el guardado de este laboratorio.'))dockerReset().catch(error=>status.textContent=error.message);};
window.addEventListener('pagehide',()=>internet?.destroy());
window.addEventListener('pageshow',event=>{if(event.persisted&&vm){internet=createEthernetInternet(vm.bus);globalThis.dockerInternet=internet;}});

const choose=document.querySelector('#exercise'),card=document.querySelector('#exercise-card'),goal=document.querySelector('#exercise-goal'),title=document.querySelector('#exercise-title'),check=document.querySelector('#check'),toggle=document.querySelector('#solution-toggle'),solution=document.querySelector('#solution'),feedback=document.querySelector('#feedback');
for(const number of [1,2,3]){const group=document.createElement('optgroup');group.label='Clase '+number;for(const exercise of exercises.filter(e=>e.class===number)){const option=document.createElement('option');option.value=exercise.id;option.textContent=exercise.title;group.append(option);}choose.append(group);}
function selected(){return exercises.find(e=>e.id===choose.value);}
function syncPractice(){check.disabled=busy||!dockerShellReady;}
choose.onchange=()=>{const e=selected();card.hidden=!e;document.querySelector('#exercise-actions').hidden=!e;solution.hidden=true;toggle.textContent='Ver solución';toggle.setAttribute('aria-expanded','false');feedback.textContent='';if(e){title.textContent=e.title;goal.textContent=e.goal;renderSolutions(solution,solutionsFor('docker',e),{copy:true});check.hidden=!e.checks.length;}syncPractice();};
const classChoose=mountGroups({select:choose,mode:'docker',tasks:exercises,onChange:()=>choose.onchange()});
practiceProgress({mode:'docker-real',select:choose,feedback});
toggle.onclick=()=>{solution.hidden=!solution.hidden;toggle.textContent=solution.hidden?'Ver solución':'Ocultar solución';toggle.setAttribute('aria-expanded',String(!solution.hidden));};
globalThis.dockerCheck=async id=>{const e=exercises.find(e=>e.id===id);if(!e)throw Error('Ejercicio desconocido.');const promise=checker.run(e);busy=true;save.disabled=true;reset.disabled=true;choose.disabled=classChoose.disabled=true;check.disabled=true;toggle.disabled=true;try{return await promise;}finally{busy=false;save.disabled=!vm;reset.disabled=false;choose.disabled=classChoose.disabled=false;toggle.disabled=false;syncPractice();}};
check.onclick=async()=>{feedback.dataset.result='pending';feedback.textContent='Comprobando…';try{const exercise=selected(),result=await dockerCheck(exercise.id);renderPracticeResult(feedback,result,exercise);}catch(e){feedback.dataset.result='error';feedback.textContent=e.message;}};
