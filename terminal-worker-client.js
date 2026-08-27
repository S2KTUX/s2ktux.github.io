import { WORKER_OPERATIONS, createWorkerRequest, isWorkerEnvelope } from './terminal-worker-protocol.js';

const REQUEST_TIMEOUT=1500;

class TerminalSimulationClient{
  constructor(mode,options={}){this.mode=mode;this.kind='fallback';this.nextId=1;this.pending=new Map();this.worker=null;this.workerUrl=options.workerUrl||new URL('./terminal-simulation-worker.js?v=20260825-phase2',import.meta.url);}
  async connect(){
    if(typeof Worker!=='function')return this;
    try{
      const worker=new Worker(this.workerUrl,{type:'module',name:'s2ktux-simulation'});
      worker.addEventListener('message',event=>this.receive(event.data));worker.addEventListener('error',()=>this.disconnect());
      this.worker=worker;this.kind='worker';await this.request(WORKER_OPERATIONS.READY,{});
    }catch(error){this.disconnect();}
    return this;
  }
  disconnect(){
    if(this.worker)this.worker.terminate();this.worker=null;this.kind='fallback';
    for(const {reject,timer} of this.pending.values()){clearTimeout(timer);reject(new Error('Worker de simulación no disponible'));}
    this.pending.clear();
  }
  receive(message){
    if(!isWorkerEnvelope(message))return;const pending=this.pending.get(message.id);if(!pending)return;
    clearTimeout(pending.timer);this.pending.delete(message.id);
    if(message.ok)pending.resolve(message.result);else pending.reject(new Error(message.error||'Fallo del Worker'));
  }
  request(operation,payload){
    if(!this.worker)return Promise.reject(new Error('Worker no conectado'));const id=this.nextId++;
    return new Promise((resolve,reject)=>{
      const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error('Tiempo agotado en '+operation));},REQUEST_TIMEOUT);
      this.pending.set(id,{resolve,reject,timer});this.worker.postMessage(createWorkerRequest(id,operation,payload));
    });
  }
  async analyzeShellInput(source){
    if(this.worker){try{return await this.request(WORKER_OPERATIONS.SHELL_ANALYZE,{source});}catch(error){this.disconnect();}}
    const {analyzeShellInput}=await import('./terminal-shell-parser.js');return analyzeShellInput(source);
  }
}

export async function createTerminalSimulationClient(mode,options){return new TerminalSimulationClient(mode,options).connect();}
