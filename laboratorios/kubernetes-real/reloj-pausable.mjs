// Solo el reloj del hardware emulado: el cronómetro del examen usa Date.now.
export function relojPausable(read){
 let offset=0,stopped=null;
 return {now:()=> (stopped??read())-offset,
  pause(){if(stopped===null)stopped=read();},
  resume(){if(stopped!==null){offset+=read()-stopped;stopped=null;}}
 };
}
export function motorConRelojPausable(V86,wasmFn,lifecycle=globalThis.document){
 return class extends V86{
  constructor(settings){
   const clock=relojPausable(()=>performance.now()),instantiate=settings.wasm_fn||wasmFn;
   super({...settings,wasm_fn:env=>instantiate({...env,env:{...env.env,microtick:clock.now}})});
   this.add_listener('emulator-loaded',()=>{
    if(typeof this.v86.constructor.microtick!=='function')throw Error('Reloj del motor no disponible');
    this.v86.constructor.microtick=clock.now;
    const run=this.run.bind(this);this.run=(...args)=>{clock.resume();return run(...args);};
    this.add_listener('emulator-stopped',()=>clock.pause());
   });
   const freeze=()=>clock.pause(),resume=()=>clock.resume();
   lifecycle?.addEventListener('freeze',freeze);lifecycle?.addEventListener('resume',resume);
   const destroy=this.destroy.bind(this);this.destroy=(...args)=>{lifecycle?.removeEventListener('freeze',freeze);lifecycle?.removeEventListener('resume',resume);return destroy(...args);};
  }
 };
}
