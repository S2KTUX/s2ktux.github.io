import {Terminal} from './vendor/xterm.mjs';
import {ChunkDisk} from './v86-disk.mjs';
import {LocalSessions,hashBytes} from './v86-sessions.mjs';
import {mountExercisePanel} from './v86-exercise-panel.mjs?v=20261009-intuitive';
import {createCheckRunner,atShellPrompt,cleanSerial} from './v86-check-runner.mjs?v=20261009-intuitive';
import {examSetupCommand} from './v86-exam-setup.mjs?v=20261009-intuitive';
import {examQuestions} from './v86-exam-data.mjs?v=20261009-intuitive';
import {createEthernetInternet} from './v86-ethernet-internet.mjs?v=20261009-network';
import {restartMachine} from './v86-restart.mjs?v=20261009-intuitive';
import {attachTerminalClipboard} from './v86-clipboard.mjs?v=20261008-console';
import {consoleSetupCommand} from './v86-guest-console.mjs?v=20261009-hostname';
import {createSerialOutput,appendTranscript} from './v86-serial.mjs';
import {createExamConsole,examConsoleSetupCommand,createExamBootDetector} from './v86-exam-console.mjs?v=20261009-intuitive';
const terminal=new Terminal({cols:100,rows:28,scrollback:5000,fontSize:15,fontFamily:'"Share Tech Mono", monospace',theme:{background:'#161009',foreground:'#e9ddc7',cursor:'#e0a458',selectionBackground:'#6b543f'}});
terminal.open(document.querySelector('#terminal'));
const status=document.querySelector('#status');globalThis.vmTranscript='';globalThis.vmTerminal=terminal;
let emulator,identity,busy=false,savedRecord,activeSave,resetting=false,inputPending=false,serialOutput,displayTranscript='';
window.addEventListener('pagehide',()=>globalThis.labInternet?.destroy());
const sessions=new LocalSessions();
const params=new URL(location.href).searchParams;
const examAttempt=params.get('exam');
const examMode=/^[a-f0-9]{32}$/.test(examAttempt||'')&&params.get('embed')==='exam'&&parent!==window;
let examPrepared=false,examReadySent=false,examLocked=false,examConsole,examBootDetector;
if(examMode)document.documentElement.classList.add('exam-embed');
const recoveryScenario=params.get('scenario')==='recovery';
let recoveryBootPending=recoveryScenario;
let consolePrepared=false,consolePreparing=false;
const defaultFinal=!['boot','disk','estado','motor','extras'].some(name=>params.has(name));
const bootGrub=defaultFinal||params.get('boot')==='grub';
const requestedDisk=params.get('disk')||(defaultFinal?'final':null);
const diskProfile=requestedDisk==='final'?'grub-rhcsa-final':requestedDisk==='rhcsa'?'grub-rhcsa':requestedDisk==='curso'?'grub-curso':requestedDisk==='ampliado'?'grub-ampliado':requestedDisk==='completo'?'grub-completo':'grub';
const stateName=params.get('estado')||(defaultFinal?'grub-rhcsa-final':bootGrub?'frio':'persistente');
const motorName=new URL(location.href).searchParams.get('motor')==='original'?'original':['grub-ampliado','grub-curso','grub-rhcsa','grub-rhcsa-final'].includes(diskProfile)?'rhcsa':'reinicio';
const extras=new URL(location.href).searchParams.get('extras')==='yes';
const nodeName=new URL(location.href).searchParams.get('node')==='2'?'2':'1';
const supportsExercises=['grub-curso','grub-rhcsa','grub-rhcsa-final'].includes(diskProfile);
const exerciseRunner=createCheckRunner(text=>sendSerialText(text),()=>!!emulator&&!busy&&!inputPending&&atShellPrompt(globalThis.vmTranscript),examMode?300000:undefined);
const exercisePanel=mountExercisePanel(document.querySelector('#exercise-panel'),async exercise=>{
    if(busy||inputPending||!atShellPrompt(globalThis.vmTranscript))throw Error('Vuelve al prompt de Linux y deja la línea vacía antes de comprobar. No se interrumpen comandos ni editores.');
  const promise=exerciseRunner.run(exercise);
  busy=true;document.querySelector('#save').disabled=true;updateExerciseAvailability();
  try{return await promise;}
  finally{busy=false;document.querySelector('#save').disabled=!emulator;updateExerciseAvailability();}
});
function updateExerciseAvailability(){exercisePanel.setEnabled(supportsExercises&&!!emulator&&!busy&&!resetting&&!recoveryBootPending&&!inputPending&&atShellPrompt(globalThis.vmTranscript));document.querySelector('#reboot').disabled=!emulator||busy||resetting||recoveryBootPending;document.querySelector('#save').disabled=!emulator||busy||resetting||recoveryBootPending;}
const sessionKey='v86:'+stateName+':'+motorName+(bootGrub?':grub':'')+(diskProfile!=='grub'?':'+requestedDisk:'')+(extras?':extras':'')+(nodeName==='2'?':node2':'')+(recoveryScenario?':recovery':'')+(examMode?':exam:'+examAttempt:'');
const sessionStatus=document.querySelector('#session-status');
const otherNode=new URL(location.href);otherNode.searchParams.set('node',nodeName==='1'?'2':'1');
if(defaultFinal){otherNode.searchParams.set('boot','grub');otherNode.searchParams.set('disk','final');otherNode.searchParams.set('estado','grub-rhcsa-final');}
document.querySelector('#other-node').href=otherNode.href;
document.querySelector('#node-name').textContent='Máquina '+nodeName;
if(recoveryScenario){
 document.querySelector('h1').textContent='Recuperación de root';
 document.querySelector('#recovery-note').hidden=false;
 document.querySelector('#recovery-link').hidden=true;
 document.querySelector('#network-note').hidden=true;
}
const encoder=new TextEncoder();
function sendSerialText(text){const bytes=encoder.encode(text);for(let offset=0;offset<bytes.length;offset+=16384)emulator.serial0_send(String.fromCharCode(...bytes.subarray(offset,offset+16384)));}
terminal.onData(text=>{if(examLocked||busy||resetting||recoveryBootPending||!emulator)return;if(examMode)parent.postMessage({kind:'s2ktux-exam-activity',attempt:examAttempt},location.origin);inputPending=true;updateExerciseAvailability();sendSerialText(text);});
attachTerminalClipboard(terminal,document.querySelector('#terminal'),{
 canPaste:()=>!examLocked&&!!emulator&&!busy&&!resetting&&!recoveryBootPending,
 notify:text=>{document.querySelector('#clipboard-status').textContent=text;}
});
async function prepareConsole(){
 if(consolePrepared||consolePreparing||!emulator||busy||inputPending||!atShellPrompt(globalThis.vmTranscript))return;
 // Una sesión guardada en vi, passwd o login no se interrumpe. Esperar a root.
 const rootShell=/(?:^|\n)(?:V86TEST# |\[root@[^\n]+\]# )$/.test(cleanSerial(globalThis.vmTranscript.slice(-1500)));
 consolePreparing=true;
 status.textContent=recoveryScenario?'Preparando la práctica sin acceso automático a root…':'Preparando el prompt de Linux…';
 const password=Array.from(crypto.getRandomValues(new Uint8Array(24)),b=>b.toString(16).padStart(2,'0')).join('');
 try{
   const initialClock=!savedRecord?Math.floor(Date.now()/1000):undefined;
   const setup=rootShell?(examMode?examSetupCommand(examAttempt,nodeName)+' && '+examConsoleSetupCommand()+' && ':'')+consoleSetupCommand(recoveryScenario,password,initialClock,!savedRecord&&!examMode,examMode?undefined:nodeName==='2'?'s2ktux-lab-2':'s2ktux-lab'):"export PS1='[\\u@\\h \\W]\\$ '";
   const promise=exerciseRunner.run({checks:[]},setup);
   busy=true;document.querySelector('#save').disabled=true;updateExerciseAvailability();
   const result=await promise;
   if(examMode)await examConsole.wait();
   // Conservar los controles reales de Readline (incluido bracketed paste).
   // Ocultar los comandos de preparación no debe cambiar el protocolo de la TTY.
   const actualPrompt='\r\n'+result.serial.slice(result.serial.lastIndexOf('\n')+1);
   consolePrepared=true;
   if(examMode)examPrepared=true;
   if(recoveryScenario&&result.output.includes('\nRECOVERY_REBOOT_REQUIRED\n')){
     terminal.write((actualPrompt.match(/\x1b\[\?2004[hl]/g)||[]).join(''));
     document.documentElement.dataset.vmState='running';
     status.textContent='Reiniciando para recuperar root desde GRUB…';
     sendSerialText('reboot\n');
   }else{
     recoveryBootPending=false;
     terminal.write(actualPrompt);displayTranscript=appendTranscript(displayTranscript,actualPrompt,100000);
     document.documentElement.dataset.vmState='shell';status.textContent='Laboratorio disponible.';
     if(examMode&&!examReadySent){examReadySent=true;parent.postMessage({kind:'s2ktux-exam-ready',attempt:examAttempt},location.origin);}
   }
 }catch(error){status.textContent=error.message;document.documentElement.dataset.vmState='failed';if(examMode)parent.postMessage({kind:'s2ktux-exam-failed',attempt:examAttempt,error:error.message},location.origin);}
 finally{consolePreparing=false;busy=false;document.querySelector('#save').disabled=!emulator;updateExerciseAvailability();}
}
document.querySelector('#reset').onclick=async()=>{
  if(!confirm('¿Resetear esta máquina? Se borrará su sesión guardada y volverán a cero el sistema y el disco de prácticas. La otra máquina no cambia.'))return;
  resetting=true;busy=true;activeSave?.abort();
  updateExerciseAvailability();
  try{await sessions.delete(sessionKey);location.reload();}
  catch(error){resetting=false;busy=false;await emulator?.run();document.querySelector('#save').disabled=false;updateExerciseAvailability();sessionStatus.textContent='No se pudo borrar el guardado: '+error.message;}
};
document.querySelector('#reboot').onclick=async()=>{
 if(examLocked||!emulator||busy||resetting)return;
 if(!confirm('¿Reiniciar la máquina para entrar en GRUB? Es un reinicio forzado, como pulsar el botón de reinicio de un ordenador. No borra los discos, pero puede perder escrituras pendientes. Si tienes una shell abierta, es preferible usar reboot.'))return;
 document.documentElement.dataset.vmState='running';inputPending=true;busy=true;updateExerciseAvailability();
 status.textContent='Reiniciando la máquina desde el hardware virtual…';
 document.querySelector('#result').hidden=true;
 try{await restartMachine(emulator,[vmDisk,vmPracticeDisk]);terminal.focus();}
 catch(error){document.documentElement.dataset.vmState='failed';status.textContent='No se pudo reiniciar: '+error.message;document.querySelector('#result').textContent=status.textContent;document.querySelector('#result').hidden=false;}
 finally{busy=false;updateExerciseAvailability();}
};
globalThis.vmSaveSession=async()=>{
  if(examMode)throw Error('El modo examen no tiene guardado de sesión. La práctica libre no se modifica.');
  if(!emulator||busy||recoveryBootPending||!identity)throw Error('La máquina aún no está disponible para guardar.');
  busy=true;document.querySelector('#save').disabled=true;
  updateExerciseAvailability();
  const saveController=new AbortController();activeSave=saveController;
  sessionStatus.textContent='Guardando la máquina completa. No cierres esta pestaña…';
  try{
    await emulator.stop();serialOutput?.flush();await Promise.all([vmDisk.settle(),vmPracticeDisk.settle()]);
    const state=await emulator.save_state();
    savedRecord=await sessions.save(sessionKey,identity,state,displayTranscript,savedRecord?.sha256||null,saveController.signal);
    const protectedStorage=await navigator.storage?.persist?.().catch(()=>false);
    sessionStatus.textContent='Sesión guardada: '+new Date(savedRecord.savedAt).toLocaleString()+' · '+(savedRecord.packedBytes/1048576).toFixed(1)+' MiB.'+(protectedStorage?'':' El navegador puede eliminarla si necesita espacio.');
    return {savedAt:savedRecord.savedAt,bytes:savedRecord.bytes,packedBytes:savedRecord.packedBytes};
  }catch(error){if(!resetting)sessionStatus.textContent='No se pudo guardar; se conserva el guardado anterior: '+error.message;throw error;}
  finally{if(activeSave===saveController)activeSave=null;if(!resetting){await emulator.run();busy=false;document.querySelector('#save').disabled=false;document.querySelector('#reset').disabled=false;updateExerciseAvailability();terminal.focus();}}
};
document.querySelector('#save').onclick=()=>globalThis.vmSaveSession().catch(console.error);
document.querySelector('#start').onclick=async()=>{
  document.querySelector('#start').disabled=true;status.textContent='Cargando Linux real…';
  const internetEnabled=!examMode;
  const base=new URL('./assets/v86-test/',import.meta.url);
  const fail=error=>{document.documentElement.dataset.vmState='failed';status.textContent='Laboratorio detenido: '+error.message;document.querySelector('#result').hidden=false;document.querySelector('#result').textContent='Puedes usar Reset para empezar con la base limpia; perderás el guardado de esta máquina.';console.error(error);emulator?.stop();if(examMode)parent.postMessage({kind:'s2ktux-exam-failed',attempt:examAttempt,error:error.message},location.origin);};
  try{
    if(diskProfile!=='grub'&&!bootGrub)throw Error('La nueva imagen requiere arranque BIOS/GRUB.');
    const diskBase=bootGrub?new URL(diskProfile+'/',base):base;
    const response=await fetch(new URL('disco-fragmentado.json',diskBase));if(!response.ok)throw Error('La imagen de prueba aún no está preparada');
    const manifest=await response.json();
      // Ensayo acotado de caché: no altera la fábrica ni omite los hashes.
      const requestedCache=new URL(location.href).searchParams.get('cache');
      const cacheMiB=requestedCache===null?192:Number(requestedCache);
      if(![192,384,512].includes(cacheMiB))throw Error('Caché de ensayo inválida');
      const disk=new ChunkDisk(manifest,diskBase,fail,cacheMiB);
    const practiceMiB=['grub-ampliado','grub-curso','grub-rhcsa','grub-rhcsa-final'].includes(diskProfile)?2048:1024;
    const empty={format:'s2ktux-blocks-v1',chunkSize:1048576,bytes:practiceMiB*1048576,parts:Array.from({length:practiceMiB},(_,index)=>({index,bytes:1048576,zero:true}))};
    let practiceManifest=empty,practiceBase=base;
    if(extras){
      practiceBase=new URL('extras/',base);const response=await fetch(new URL('disco-fragmentado.json',practiceBase));
      if(!response.ok)throw Error('Disco privado de herramientas no disponible');practiceManifest=await response.json();
    }
    const practice=new ChunkDisk(practiceManifest,practiceBase,fail);
    globalThis.vmDisk=disk;globalThis.vmPracticeDisk=practice;
    const prepared=['preparado','administracion','etiquetado','dominios','selinux','persistente','grub','grub-final','grub-reinicio','grub-ampliado','grub-curso','grub-rhcsa','grub-rhcsa-final'].includes(stateName);
    if(stateName.startsWith('grub')&&!bootGrub)throw Error('El estado GRUB requiere el disco y arranque GRUB.');
    if(prepared&&diskProfile!==(['grub-ampliado','grub-curso','grub-rhcsa','grub-rhcsa-final'].includes(stateName)?stateName:'grub'))throw Error('El estado preparado no corresponde a este disco. Usa la entrada de su propia versión.');
    let metadata;
    if(prepared){
      const metadataResponse=await fetch(new URL('estado-'+stateName+'.json',base));
      if(!metadataResponse.ok)throw Error('No hay un estado preparado verificado');
      metadata=await metadataResponse.json();
      if(metadata.diskProfile&&metadata.diskProfile!==diskProfile)throw Error('Identidad de disco y estado diferentes.');
      if(diskProfile==='grub-rhcsa-final'&&metadata.imageSha256!==manifest.sha256)throw Error('El estado preparado pertenece a otra versión de la fábrica.');
    }
    identity=await hashBytes(encoder.encode(JSON.stringify({format:1,node:nodeName,manifest,practice:practiceManifest,motor:motorName,
      motorBuild:motorName==='rhcsa'?'c064c94714c4b8eeace32782a4013b6132a2331ba5c008abfd67274cc2d29caf':motorName==='reinicio'?'7d13ee9c2494306a6b786a5266d5f875c7fba9178ca00361f5e7c1a12d70c10c':'upstream-1e4f43c95',
      stateName,...(recoveryScenario?{scenario:'recovery-v1'}:{}),factory:metadata?.sha256||null,boot:bootGrub?'bios-grub-v1':'direct-kernel-v2-selinux-config'})));
    savedRecord=examMode?null:await sessions.get(sessionKey);
    let initialState;
    if(savedRecord){
      status.textContent='Recuperando tu sesión guardada…';
      initialState={buffer:await sessions.unpack(savedRecord,identity)};
      globalThis.vmLoadedLocalSession=true;
      recoveryBootPending=false;
      if(typeof savedRecord.terminalText==='string'){terminal.write(savedRecord.terminalText);globalThis.vmTranscript=savedRecord.terminalText;displayTranscript=savedRecord.terminalText;}
      sessionStatus.textContent='Recuperado el guardado del '+new Date(savedRecord.savedAt).toLocaleString()+'.';
    }else if(prepared){
      status.textContent='Recuperando una máquina Linux ya arrancada…';
      const digest=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
      const parts=metadata.parts||[{file:metadata.file,bytes:metadata.packedBytes,sha256:metadata.sha256}];
      if(!parts.length||parts.reduce((n,p)=>n+p.bytes,0)!==metadata.packedBytes)throw Error('Lista de estado incompleta');
      const blocks=new Array(parts.length);let next=0,downloaded=0;
      await Promise.all(Array.from({length:Math.min(4,parts.length)},async()=>{
        while(next<parts.length){const index=next++,part=parts[index];
          const response=await fetch(new URL(part.file,base));if(!response.ok)throw Error('No se pudo descargar el estado');
          const data=await response.arrayBuffer();if(data.byteLength!==part.bytes||await digest(data)!==part.sha256)throw Error('Fragmento del estado alterado');
          blocks[index]=data;downloaded+=data.byteLength;status.textContent='Recuperando Linux: '+Math.floor(downloaded/metadata.packedBytes*100)+' %';
        }
      }));
      const packedBlob=new Blob(blocks);
      if(await digest(await packedBlob.arrayBuffer())!==metadata.sha256)throw Error('Estado preparado alterado');
      const buffer=await new Response(packedBlob.stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
      if(buffer.byteLength!==metadata.bytes)throw Error('Estado preparado incompleto');
      initialState={buffer};
    }
    const Motor=motorName==='original'?globalThis.V86:(await import('./assets/v86-test/libv86-'+motorName+'.mjs')).V86;
    const machineOptions={wasm_path:new URL('v86.wasm',base).href,memory_size:768*1048576,
      bios:{url:new URL('seabios.bin',base).href},vga_bios:{url:new URL('vgabios.bin',base).href},
      ...(bootGrub?{}:{bzimage:{url:new URL('vmlinuz',base).href},initrd:{url:new URL('initrd.img',base).href},
        cmdline:'console=ttyS0,115200 root=/dev/sda rw net.ifnames=0 biosdevname=0 tsc=reliable nowatchdog security=selinux selinux=1'+(['selinux','persistente'].includes(stateName)?'':' enforcing=0')}),
      hda:disk,hdb:practice,
      initial_state:initialState,preserve_mac_from_state_image:true,autostart:!internetEnabled,disable_keyboard:true,disable_mouse:true,disable_speaker:true};
    emulator=globalThis.vm=new Motor(machineOptions);
    globalThis.labWire=new BroadcastChannel(examMode?'s2ktux-v86-exam-network:'+examAttempt:'s2ktux-v86-private-network-v1:'+diskProfile+':'+stateName+(recoveryScenario?':recovery':''));
    globalThis.labFrames={sent:0,received:0};
    labWire.onmessage=event=>{if(event.data instanceof Uint8Array){labFrames.received++;emulator.bus.send('net0-receive',event.data);}};
    emulator.add_listener('net0-send',frame=>{labFrames.sent++;labWire.postMessage(frame);});
    serialOutput=createSerialOutput(text=>{
      examBootDetector?.(text);
      globalThis.vmTranscript=appendTranscript(globalThis.vmTranscript,text);
      const visible=[];
      // Mantener la detección de los límites de cada comprobación, incluso
      // cuando un bloque contiene su prompt y después mensajes del kernel.
      for(const character of text)if(!exerciseRunner.receive(character))visible.push(character);
      if(visible.length&&!(prepared&&!savedRecord&&!consolePrepared)){const output=visible.join('');terminal.write(output);displayTranscript=appendTranscript(displayTranscript,output,100000);}
      if(recoveryBootPending&&/GNU GRUB|login:\s*$/.test(cleanSerial(globalThis.vmTranscript.slice(-3000))))recoveryBootPending=false;
      if(atShellPrompt(globalThis.vmTranscript))inputPending=false;
      if(atShellPrompt(globalThis.vmTranscript)&&consolePrepared&&!consolePreparing){document.documentElement.dataset.vmState='shell';status.textContent='Laboratorio disponible.';}
      if(!consolePrepared&&!consolePreparing)queueMicrotask(prepareConsole);
      if(recoveryScenario&&/login:\s*$/.test(cleanSerial(globalThis.vmTranscript.slice(-300))))status.textContent='Recupera root desde GRUB: la contraseña inicial no se proporciona.';
      updateExerciseAvailability();
      if(examMode&&examPrepared&&!examReadySent&&!recoveryBootPending){examReadySent=true;parent.postMessage({kind:'s2ktux-exam-ready',attempt:examAttempt},location.origin);}
    });
    emulator.add_listener('serial0-output-byte',byte=>serialOutput.push(byte));
    emulator.add_listener('emulator-ready',()=>{status.textContent=prepared?'Reanudando Linux…':'Arrancando el kernel y systemd…';});
    // Arrancar después de restaurar RAM/UART, no durante emulator-ready.
    emulator.add_listener('emulator-loaded',()=>{
      // Ya está restaurado: las opciones del motor no deben retener otra copia
      // de toda la RAM, especialmente al abrir las dos máquinas del examen.
      delete machineOptions.initial_state;initialState=undefined;
      if(examMode){examConsole=createExamConsole(emulator);examBootDetector=createExamBootDetector(()=>examConsole.invalidate());}
      if(internetEnabled){try{globalThis.labInternet=createEthernetInternet(emulator.bus);emulator.run();}catch(error){fail(error);}}
    });
    let started=false;
    emulator.add_listener('emulator-started',()=>{
      document.querySelector('#save').disabled=recoveryBootPending;
      if(!started){
        started=true;
        if(savedRecord){document.documentElement.dataset.vmState='running';status.textContent='Tu máquina Linux ha sido recuperada.';updateExerciseAvailability();queueMicrotask(prepareConsole);}
        else if(prepared)emulator.serial0_send('\n');
      }
    });
    setInterval(()=>{document.querySelector('#downloads').textContent='Disco descargado: '+(disk.stats.downloadedBytes/1048576).toFixed(1)+' MiB · '+disk.stats.requests+' fragmentos';},1000);
    terminal.focus();
  }catch(error){fail(error);}
};
// No aceptar el primer clic antes de cargar los módulos y conectar el botón.
document.querySelector('#start').disabled=false;
status.textContent='Listo para iniciar.';
if(examMode){
 window.addEventListener('message',async event=>{
   const data=event.data;
   if(event.origin!==location.origin||event.source!==parent||data?.kind!=='s2ktux-exam-request'||data.attempt!==examAttempt||typeof data.requestId!=='string')return;
   let result,error;
   try{
     if(data.action==='lock'){examLocked=true;document.querySelector('#reboot').disabled=true;result={locked:true,available:examConsole?await examConsole.reconnect():false};}
     else if(data.action==='stop'&&examLocked){await emulator.stop();globalThis.labWire.close();result={stopped:true};}
     else if(data.action==='check'&&examLocked){
       const exercise=examQuestions.find(q=>q.id===data.id&&String(q.node)===nodeName);
       if(!exercise)throw Error('Pregunta no autorizada en esta máquina.');
       if(!examPrepared)throw Error('La máquina no terminó su preparación.');
       await examConsole.wait();
       const task=examConsole.run(exercise);busy=true;
       try{result=await task;}finally{busy=false;}
     }else throw Error('Acción de examen no autorizada.');
   }catch(caught){error=caught.message;}
   parent.postMessage({kind:'s2ktux-exam-result',attempt:examAttempt,requestId:data.requestId,result,error},location.origin);
 });
 document.querySelector('#start').click();
}
if(examMode){
  // Evitar una segunda barra de desplazamiento dentro de la terminal.
  const resize=()=>parent.postMessage({kind:'s2ktux-exam-size',attempt:examAttempt,height:Math.ceil(document.querySelector('#main').scrollHeight)+24},location.origin);
  new ResizeObserver(resize).observe(document.querySelector('#main'));resize();
}
