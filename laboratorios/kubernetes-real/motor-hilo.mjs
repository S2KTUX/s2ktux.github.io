// CPU, disco y red exterior se ejecutan en un Worker del navegador. No hay
// backend: los mensajes transportan las mismas instrucciones y bytes de v86.
export class ThreadVM {
 constructor(settings,{root,components,internet=false,engine='original',schedulingAPI=false,onError=()=>{}}){
  if(typeof schedulingAPI!=='boolean')throw Error('Planificación de motor inválida');
  this.listeners=new Map();this.pending=new Map();this.next=0;this.closed=false;this.onError=onError;
  const workerURL=new URL('./motor-worker.mjs?v=85e0144fef8c2e77',import.meta.url);
  if(schedulingAPI)workerURL.searchParams.set('use-scheduling-api','1');
  this.worker=new Worker(workerURL,{type:'module'});
  const handlers=new Map();
  this.bus={
   register(name,callback){if(!handlers.has(name))handlers.set(name,new Set());handlers.get(name).add(callback);},
   unregister(name,callback){handlers.get(name)?.delete(callback);},
   send:(name,frame)=>{if(name!=='net0-receive')throw Error('Evento Ethernet inválido');const copy=frame.slice();this.worker.postMessage({method:'ethernet',args:[copy]},[copy.buffer]);},
  };
  this.worker.onmessage=({data})=>{
   if(data.type==='result'){
    const request=this.pending.get(data.id);if(!request)return;this.pending.delete(data.id);
    data.error?request.reject(Error(data.error)):request.resolve(data.value);
   }else if(data.type==='event')this.emit(data.name);
   else if(data.type==='serial')for(const byte of data.bytes)this.emit('serial0-output-byte',byte);
   else if(data.type==='ethernet')for(const callback of handlers.get('net0-send')||[])callback(data.frame);
   else if(data.type==='fatal')this.fail(Error(data.message));
  };
  this.worker.onerror=event=>this.fail(Error(event.message||'El hilo del motor se ha detenido.'));
  const transfer=[];if(settings.initial_state?.buffer)transfer.push(settings.initial_state.buffer);if(components.buffer)transfer.push(components.buffer);
  this.call('init',[{settings,root,components,internet,engine}],transfer).catch(error=>this.fail(error));
 }
 emit(name,value){for(const callback of this.listeners.get(name)||[])callback(value);}
 add_listener(name,callback){if(!this.listeners.has(name))this.listeners.set(name,new Set());this.listeners.get(name).add(callback);}
 call(method,args=[],transfer=[]){
  if(this.closed)return Promise.reject(Error('El motor está cerrado.'));
  const id=++this.next;
  return new Promise((resolve,reject)=>{
   this.pending.set(id,{resolve,reject});
   try{this.worker.postMessage({id,method,args},transfer);}catch(error){this.pending.delete(id);reject(error);}
  });
 }
 fail(error){
  if(this.closed)return;
  this.closed=true;this.worker.terminate();
  for(const request of this.pending.values())request.reject(error);
  this.pending.clear();this.onError(error);
 }
 serial0_send(text){if(!this.closed)this.worker.postMessage({method:'serial',args:[text]});}
 configureJit(pages){return this.call('jit',[pages]);}
 run(){return this.call('run');}
 stop(){return this.call('stop');}
 settle(){return this.call('settle');}
 save_state(){return this.call('save');}
 stats(){return this.call('stats');}
 suspend(){return this.call('suspend');}
 resume(){return this.call('resume');}
 dispose(){
  if(this.closed)return;
  this.closed=true;this.worker.terminate();
  for(const request of this.pending.values())request.reject(Error('Motor cerrado'));
  this.pending.clear();
 }
 async destroy(){
  if(this.closed)return;
  try{await this.call('destroy');}finally{this.dispose();}
 }
}
