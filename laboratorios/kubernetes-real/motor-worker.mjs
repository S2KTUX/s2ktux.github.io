import {capturarCheckpointExterno,prepararRestauracionDiscosExternos} from './checkpoint-discos.mjs?v=b5a6e4f42af60fab';
import {loadEngine} from './perfil-motor.mjs?v=aea979eebc04b75d';
import {ChunkDisk} from './disco-kubernetes.mjs?v=0576afa02b3f1762';
import {createEthernetInternet} from '/laboratorios/docker-real/ethernet-internet.mjs';
import {instrumentEngine} from './estadisticas-motor.mjs';
import {liberarEstadoInicial} from './liberar-arranque.mjs';
import {readInterruptState} from './interrupciones-motor.mjs';
let checkpointAllowed=false;
let vm,root,components,internet,engineStats,networkEnabled=false,bytes=[],timer;
function flush(){clearTimeout(timer);timer=undefined;if(!bytes.length)return;const block=new Uint8Array(bytes);bytes=[];postMessage({type:'serial',bytes:block},[block.buffer]);}
async function init(options){
 checkpointAllowed=options.checkpointAllowed===true;
 if(options.externalDisks&&!checkpointAllowed||checkpointAllowed&&options.engine!=='jit8192-pic-v1')throw Error('Checkpoint externo fuera del candidato');
 if(checkpointAllowed&&options.settings.autostart!==false)throw Error('No ejecutar la CPU antes de restaurar el checkpoint');
 networkEnabled=options.internet;
 const failure=error=>postMessage({type:'fatal',message:error.message||String(error)});
 const diskFailure=error=>{failure(Error('Error de disco: '+(error.message||error)));vm?.stop().catch(()=>{});};
 const {V86,wasm_fn}=await loadEngine(options.engine,failure);
 root=new ChunkDisk(options.root.manifest,new URL(options.root.base),diskFailure);
 components=options.components.manifest?new ChunkDisk(options.components.manifest,new URL(options.components.base),diskFailure,192):{buffer:options.components.buffer};
 const applyExternalDisks=options.externalDisks?await prepararRestauracionDiscosExternos(options.externalDisks,[{id:'root',disk:root},{id:'components',disk:components}]):null;
 vm=new V86({...options.settings,...(wasm_fn?{wasm_fn}:{}),hda:root,hdb:components});
 vm.add_listener('serial0-output-byte',byte=>{bytes.push(byte);if(bytes.length>=2048)flush();else if(timer===undefined)timer=setTimeout(flush,16);});
 vm.add_listener('emulator-loaded',async()=>{
  try{
  liberarEstadoInicial(options.settings);
  if(applyExternalDisks)applyExternalDisks();
  engineStats=instrumentEngine(vm);
  if(networkEnabled)internet=createEthernetInternet(vm.bus);
  vm.bus.register('net0-send',frame=>{const copy=frame.slice();postMessage({type:'ethernet',frame:copy},[copy.buffer]);});
  postMessage({type:'event',name:'emulator-loaded'});
  }catch(error){failure(error);await vm.destroy().catch(()=>{});}
 });
}
async function operation(data){
 const {id,method,args=[]}=data;
 try{
  let value;
  switch(method){
   case 'init': await init(args[0]);break;
   case 'serial': vm.serial0_send(args[0]);return;
   case 'ethernet':vm.bus.send('net0-receive',args[0]);return;
   case 'jit':{
    vm.v86.cpu.set_jit_config(1,args[0]);
    value={pages:vm.v86.cpu.wm.exports.get_jit_config(1),loopProtection:vm.v86.cpu.wm.exports.get_jit_config(2)};break;
   }
   case 'run':await vm.run();break;
   case 'stop':await vm.stop();flush();break;
   case 'settle':await root.settle();await components.settle?.();break;
   case 'save':value=await vm.save_state();break;
   case 'checkpoint':if(!checkpointAllowed)throw Error('Checkpoint no permitido');value=await capturarCheckpointExterno(vm,[{id:'root',disk:root},{id:'components',disk:components}]);break;
   case 'stats':value={running:vm.is_running(),root:root.stats,components:components.stats,internet:internet?.state,engine:engineStats,interrupts:readInterruptState(vm),scheduling:{supported:typeof globalThis.scheduler?.postTask==='function',selected:vm.v86.yield.toString().includes('postTask'),legacyWorker:!!vm.v86.worker}};break;
   case 'suspend':await vm.stop();internet?.destroy();internet=undefined;flush();break;
   case 'resume':if(networkEnabled&&!internet)internet=createEthernetInternet(vm.bus);await vm.run();break;
   case 'destroy':internet?.destroy();clearTimeout(timer);await vm?.destroy();break;
   default:throw Error('Operación de motor inválida');
  }
  const transfer=value instanceof ArrayBuffer?[value]:value?.format==='s2ktux-external-disks-checkpoint-v1'?[value.state]:[];
  postMessage({type:'result',id,value},transfer);
 }catch(error){postMessage({type:'result',id,error:error.message||String(error)});}
}
let control=Promise.resolve();
self.onmessage=({data})=>{
 // La consola y Ethernet deben seguir recibiendo bytes. Las operaciones de
 // control sí se ordenan: volver a una página no puede adelantarse a su pausa.
 if(data.method==='serial'||data.method==='ethernet')operation(data);
 else control=control.then(()=>operation(data)).catch(error=>postMessage({type:'fatal',message:error.message||String(error)}));
};
