import {test,expect} from '@playwright/test';
test('Base limpia · caché separada, revisión nueva y guardado del alumno intacto',async({page})=>{
 await page.goto('/laboratorios/kubernetes-real/');
 const result=await page.evaluate(async()=>{
  const {BasesLimpias}=await import('/laboratorios/kubernetes-real/debian/bases-limpias.mjs');
  const {SesionesClusterDebian}=await import('/laboratorios/kubernetes-real/debian/sesiones-cluster.mjs');
  const options={workerComponents:'v7',factoryVersion:'v6',progressive:true,level:'inicial'},user=new SesionesClusterDebian(options),a=new BasesLimpias('a'.repeat(64),options),b=new BasesLimpias('b'.repeat(64),options);
  const node=await a.packNode('controlplane',new Uint8Array(4096).buffer,'BASE_LIMPIA');
  const student=await user.packNode('controlplane',new Uint8Array([1,2,3,4]).buffer,'TRABAJO_ALUMNO');
  await user.saveNodes([student]);await a.write([node]);const old=await a.read(),before=await b.read();await b.write([node]);
  return {old:old.nodes[0].terminalText,before:!!before,removed:!!await a.getRawCluster(),current:(await b.read()).nodes[0].terminalText,user:(await user.getCluster()).nodes[0].terminalText};
 });
 expect(result).toEqual({old:'BASE_LIMPIA',before:false,removed:false,current:'BASE_LIMPIA',user:'TRABAJO_ALUMNO'});
});
test('Captura limpia · un fallo siempre libera consola y red',async({page})=>{
 await page.goto('/laboratorios/kubernetes-real/');
 const result=await page.evaluate(async()=>{
  const {capturarCluster}=await import('/laboratorios/kubernetes-real/debian/bases-limpias.mjs');const events=[];
  const node={window:{kubeDebianSnapshot:{lock:()=>{events.push('lock');return{terminalText:''};},freeze:async()=>events.push('freeze'),state:async()=>new ArrayBuffer(4),release:async()=>events.push('release')}}};
  let message;try{await capturarCluster({ordered:[['controlplane',node]],network:{pause:()=>events.push('pause'),resume:()=>events.push('resume')},pack:async()=>({}),write:async()=>{throw Error('Sin cuota');}});}catch(error){message=error.message;}
  node.window.kubeDebianSnapshot.release=async()=>{throw Error('Motor parado');};let fatal=false;
  try{await capturarCluster({ordered:[['controlplane',node]],network:{pause:()=>{},resume:()=>{}},pack:async()=>({}),write:async()=>{}});}catch(error){fatal=error.resumeFailed===true;}
  return {message,events,fatal};
 });
 expect(result.message).toBe('Sin cuota');expect(result.events).toEqual(['lock','pause','freeze','resume','release','lock','freeze']);expect(result.fatal).toBe(true);
});

test('Recuperación · valida una sola lectura sin fiarse de metadatos alterados',async({page})=>{
 await page.goto('/laboratorios/kubernetes-real/');
 const result=await page.evaluate(async()=>{
  const {SesionesClusterDebian}=await import('/laboratorios/kubernetes-real/debian/sesiones-cluster.mjs');
  const options={workerComponents:'v7',factoryVersion:'v6',progressive:true,level:'inicial'},session=new SesionesClusterDebian(options);
  const node=await session.packNode('controlplane',new Uint8Array(4096).buffer);
  const saved=await session.saveNodes([node]);let reads=0;
  const actual=session.getRawCluster.bind(session);session.getRawCluster=async()=>{reads++;return actual();};
  const raw=await session.getRawCluster(),checked=await session.validateCluster(raw);
  let rejected=false;try{await session.validateCluster({...raw,nodes:[{...raw.nodes[0],sha256:'0'.repeat(64)}]});}catch{rejected=true;}
  let changed=false;try{await session.saveNodes([node],'f'.repeat(64));}catch{changed=true;}
  const preserved=await session.getCluster();
  return {readsBeforeSecondRead:reads-1,same:checked===raw,rejected,changed,preserved:preserved.sha256===saved.sha256};
 });
 expect(result).toEqual({readsBeforeSecondRead:1,same:true,rejected:true,changed:true,preserved:true});
});

test('Entrada rápida · conserva una revisión compatible sin leer guardados del alumno',async({page})=>{
 await page.goto('/laboratorios/kubernetes-real/');
 const result=await page.evaluate(async()=>{
  const {BasesLimpias}=await import('/laboratorios/kubernetes-real/debian/bases-limpias.mjs');
  const {SesionesClusterDebian}=await import('/laboratorios/kubernetes-real/debian/sesiones-cluster.mjs');
  const options={workerComponents:'v7',factoryVersion:'v6',progressive:true,level:'inicial'};
  const old=new BasesLimpias('c'.repeat(64),options),user=new SesionesClusterDebian(options);
  const current=new BasesLimpias('d'.repeat(64),{...options,compatibleRevisions:['c'.repeat(64)]});
  const clean=await old.packNode('controlplane',new Uint8Array([3,4,5]).buffer,'SOLO_BASE_LIMPIA');
  const student=await user.packNode('controlplane',new Uint8Array([7,8,9]).buffer,'DATOS_ALUMNO');
  await old.write([clean]);await user.saveNodes([student]);const migrated=await current.read();
  const incompatible=new BasesLimpias('e'.repeat(64),options);
  const otherLevel=new BasesLimpias('d'.repeat(64),{...options,level:'intermedio',compatibleRevisions:['c'.repeat(64)]});
  const wrongProfile=new BasesLimpias('d'.repeat(64),{...options,factoryVersion:'v5'});
  const noUnknown=await incompatible.read(),noOtherLevel=await otherLevel.read(),noOtherProfile=await wrongProfile.read();
  let invalidList=false;try{new BasesLimpias('f'.repeat(64),{...options,compatibleRevisions:['f'.repeat(64)]});}catch{invalidList=true;}
  return {migrated:migrated?.nodes[0].terminalText,newKey:migrated?.key===current.key,oldRemoved:!await old.getRawCluster(),student:(await user.getCluster()).nodes[0].terminalText,noUnknown:!noUnknown,noOtherLevel:!noOtherLevel,noOtherProfile:!noOtherProfile,invalidList};
 });
 expect(result).toEqual({migrated:'SOLO_BASE_LIMPIA',newKey:true,oldRemoved:true,student:'DATOS_ALUMNO',noUnknown:true,noOtherLevel:true,noOtherProfile:true,invalidList:true});
});

test('Entrada rápida · una base compatible alterada no se migra ni se borra',async({page})=>{
 await page.goto('/laboratorios/kubernetes-real/');
 const result=await page.evaluate(async()=>{
  const {BasesLimpias}=await import('/laboratorios/kubernetes-real/debian/bases-limpias.mjs');
  const options={workerComponents:'v7',factoryVersion:'v6',progressive:true,level:'inicial'};
  const old=new BasesLimpias('a'.repeat(64),options),current=new BasesLimpias('b'.repeat(64),{...options,compatibleRevisions:['a'.repeat(64)]});
  const node=await old.packNode('controlplane',new Uint8Array(4096).buffer);await old.write([node]);
  const raw=await old.getRawCluster(),bytes=new Uint8Array(await raw.nodes[0].packed.arrayBuffer());bytes[bytes.length-1]^=1;
  const corrupt={...raw,nodes:[{...raw.nodes[0],packed:new Blob([bytes])}]};
  await old.access('readwrite',store=>store.put(corrupt));
  return {rejected:!await current.read(),noNew:!await current.getRawCluster(),preserved:!!await old.getRawCluster()};
 });
 expect(result).toEqual({rejected:true,noNew:true,preserved:true});
});
