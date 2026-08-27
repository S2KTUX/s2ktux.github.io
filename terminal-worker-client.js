import { WORKER_OPERATIONS, createWorkerRequest, isWorkerEnvelope, isWorkerEvent } from './terminal-worker-protocol.js';

const REQUEST_TIMEOUT=5000;
const HEALTHCHECK_INTERVAL=750;
const HEALTHCHECK_TIMEOUT=1500;
const RESTART_DELAYS=Object.freeze([500,1500,3000]);

class TerminalSimulationClient{
  constructor(mode,options={}){this.mode=mode;this.kind='fallback';this.nextId=1;this.pending=new Map();this.listeners=new Map();this.worker=null;this.healthTimer=null;this.healthPending=false;this.restartTimer=null;this.restartAttempt=0;this.restartInFlight=false;this.everConnected=false;this.workerUrl=options.workerUrl||new URL('./terminal-simulation-worker.js?v=20260827-block2-kubernetes-worker',import.meta.url);}
  async connect(){
    if(typeof Worker!=='function')return this;
    let operational=false;try{
      const worker=new Worker(this.workerUrl,{type:'module',name:'s2ktux-simulation'});
      worker.addEventListener('message',event=>this.receive(event.data));worker.addEventListener('error',event=>this.disconnect({reason:'error',message:event.message||'Excepción no controlada en el Worker',recover:operational,notify:operational}));
      this.worker=worker;this.kind='worker';await this.request(WORKER_OPERATIONS.READY,{});operational=true;this.everConnected=true;this.startHealthcheck();
    }catch(error){this.disconnect({reason:'startup',message:error.message,recover:false,notify:false});}
    return this;
  }
  // Un cierre intencionado navega o destruye el contexto; cualquier cierre manual futuro debe usar una ruta silenciosa y no llamar a disconnect().
  disconnect(details={}){
    const wasConnected=Boolean(this.worker);this.stopHealthcheck();if(this.worker)this.worker.terminate();this.worker=null;this.kind='fallback';
    for(const {reject,timer} of this.pending.values()){clearTimeout(timer);reject(new Error('Worker de simulación no disponible'));}
    this.pending.clear();
    if(wasConnected&&details.notify!==false)this.emit('runtime.disconnected',details);
    if(wasConnected&&details.recover!==false&&this.everConnected&&this.mode==='kubernetes')this.scheduleRestart();
  }
  receive(message){
    if(isWorkerEvent(message)){for(const listener of this.listeners.get(message.event)||[])listener(message.payload);return;}
    if(!isWorkerEnvelope(message))return;const pending=this.pending.get(message.id);if(!pending)return;
    clearTimeout(pending.timer);this.pending.delete(message.id);
    if(message.ok)pending.resolve(message.result);else pending.reject(new Error(message.error||'Fallo del Worker'));
  }
  request(operation,payload,timeoutMs=REQUEST_TIMEOUT){
    if(!this.worker)return Promise.reject(new Error('Worker no conectado'));const id=this.nextId++;
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('Tiempo agotado en '+operation));},timeoutMs);
      this.pending.set(id,{resolve,reject,timer});this.worker.postMessage(createWorkerRequest(id,operation,payload));
    });
  }
  startHealthcheck(){this.stopHealthcheck();this.healthTimer=setInterval(async()=>{if(!this.worker||this.healthPending)return;this.healthPending=true;try{await this.request(WORKER_OPERATIONS.READY,{},HEALTHCHECK_TIMEOUT);}catch(error){this.disconnect({reason:'unresponsive',message:error.message});}finally{this.healthPending=false;}},HEALTHCHECK_INTERVAL);}
  stopHealthcheck(){if(this.healthTimer)clearInterval(this.healthTimer);this.healthTimer=null;this.healthPending=false;}
  scheduleRestart(){if(this.worker||this.restartTimer||this.restartInFlight)return;const max=RESTART_DELAYS.length;if(this.restartAttempt>=max){this.emit('runtime.restart-exhausted',{attempts:max});return;}const attempt=++this.restartAttempt,delay=RESTART_DELAYS[attempt-1];this.emit('runtime.restart-scheduled',{attempt,max,delay});this.restartTimer=setTimeout(()=>{this.restartTimer=null;void this.attemptRestart(attempt);},delay);}
  async attemptRestart(attempt){this.restartInFlight=true;this.emit('runtime.restarting',{attempt,max:RESTART_DELAYS.length});await this.connect();this.restartInFlight=false;if(this.kind==='worker'){this.restartAttempt=0;this.emit('runtime.restarted',{attempt,stateSynchronized:false});}else this.scheduleRestart();}
  stopRestart(){if(this.restartTimer)clearTimeout(this.restartTimer);this.restartTimer=null;this.restartAttempt=0;this.restartInFlight=false;}
  emit(event,payload){for(const listener of this.listeners.get(event)||[])listener(payload);}
  on(event,listener){if(!this.listeners.has(event))this.listeners.set(event,new Set());this.listeners.get(event).add(listener);return()=>this.listeners.get(event)?.delete(listener);}
  async analyzeShellInput(source){
    if(this.worker){try{return await this.request(WORKER_OPERATIONS.SHELL_ANALYZE,{source});}catch(error){this.disconnect();}}
    const {analyzeShellInput}=await import('./terminal-shell-parser.js');return analyzeShellInput(source);
  }
  initializeKubernetes(payload){return this.request(WORKER_OPERATIONS.KUBERNETES_INIT,payload);}
  executeKubernetes(payload){return this.request(WORKER_OPERATIONS.KUBERNETES_EXECUTE,payload);}
  rebootKubernetes(){return this.request(WORKER_OPERATIONS.KUBERNETES_REBOOT,{});}
  recoverKubernetesKubelet(node){return this.request(WORKER_OPERATIONS.KUBERNETES_KUBELET_RECOVER,{node});}
}

export async function createTerminalSimulationClient(mode,options){return new TerminalSimulationClient(mode,options).connect();}
