import {test,expect} from '@playwright/test';

test('captura · reanuda todos los nodos antes de comprimir y conserva sus copias',async({page})=>{
 await page.goto('/sobre.html');
 const result=await page.evaluate(async()=>{
  const {capturarCluster}=await import('/laboratorios/kubernetes-real/debian/bases-limpias.mjs');const events=[],buffers=[];
  const ordered=['controlplane','worker1'].map((id,i)=>[id,{window:{kubeDebianSnapshot:{lock(){events.push('lock:'+id);return {terminalText:id};},async freeze(){events.push('freeze:'+id);},async state(){events.push('state:'+id);const data=new Uint8Array([i+1]);buffers.push(data);return data.buffer;},async release(){events.push('run:'+id);}}}}]);
  const saved=await capturarCluster({ordered,network:{pause(){events.push('pause');},resume(){events.push('network');}},pack:async(id,state)=>{events.push('pack:'+id);return {id,value:new Uint8Array(state)[0]};},write:async rows=>rows});
  return {events,saved};
 });
 expect(result.events.indexOf('pack:controlplane')).toBeGreaterThan(result.events.indexOf('run:worker1'));
 expect(result.events.indexOf('state:worker1')).toBeLessThan(result.events.indexOf('network'));
 expect(result.events.filter(e=>e==='run:controlplane')).toHaveLength(1);
 expect(result.saved).toEqual([{id:'controlplane',value:1},{id:'worker1',value:2}]);
});

test('Montaje · guardado v14 propio, sin convertir v6/v13 ni sobrescribir estudio',async({page})=>{
 await page.goto('/laboratorios/kubernetes-real/');
 const result=await page.evaluate(async()=>{
  const {SesionesClusterDebian}=await import('/laboratorios/kubernetes-real/debian/sesiones-cluster.mjs'),opts={workerComponents:'v7',progressive:true,level:'avanzado'};
  const study=new SesionesClusterDebian({...opts,factoryVersion:'v14'}),mount=new SesionesClusterDebian({...opts,factoryVersion:'v14',scenarioId:'montaje-cluster'}),old=new SesionesClusterDebian({...opts,factoryVersion:'v13'});
  const regular=await study.saveNodes([await study.packNode('controlplane',new Uint8Array([1,2,3]).buffer,'ESTUDIO14')]);
  const copy=await mount.saveNodes([await mount.packNode('controlplane',new Uint8Array([4,5,6]).buffer,'MONTAJE14')]);
  let wrongScene=false,wrongVersion=false;try{await mount.validateCluster(regular);}catch{wrongScene=true;}try{await old.validateCluster(regular);}catch{wrongVersion=true;}
  await mount.resetCluster(copy.sha256);
  return {separate:new Set([study.key,mount.key,old.key]).size===3,wrongScene,wrongVersion,study:(await study.getCluster()).nodes[0].terminalText,mountGone:!await mount.getRawCluster()};
 });
 expect(result).toEqual({separate:true,wrongScene:true,wrongVersion:true,study:'ESTUDIO14',mountGone:true});
});

test('Entrada rápida · admite el historial publicado y rechaza listas excesivas',async({page})=>{
 await page.goto('/laboratorios/kubernetes-real/');
 const result=await page.evaluate(async()=>{
  const {BasesLimpias}=await import('/laboratorios/kubernetes-real/debian/bases-limpias.mjs');
  const {revisionesCompatibles}=await import('/laboratorios/kubernetes-real/debian/bases-publicadas.mjs');
  const options={workerComponents:'v8',factoryVersion:'v6',progressive:true,level:'intermedio'};
  for(const [revision,compatibleRevisions] of Object.entries(revisionesCompatibles))new BasesLimpias(revision,{...options,compatibleRevisions});
  const references=Array.from({length:17},(_,index)=>index.toString(16).padStart(64,'0'));
  new BasesLimpias('a'.repeat(64),{...options,compatibleRevisions:references.slice(0,16)});
  let rejected=false;try{new BasesLimpias('a'.repeat(64),{...options,compatibleRevisions:references});}catch{rejected=true;}
  return rejected;
 });
 expect(result).toBe(true);
});

test('Escenarios · guardar y resetear la copia no modifica la sesión habitual',async({page})=>{
 await page.goto('/laboratorios/kubernetes-real/');
 const result=await page.evaluate(async()=>{
  const {SesionesClusterDebian}=await import('/laboratorios/kubernetes-real/debian/sesiones-cluster.mjs');
  const options={factoryVersion:'v13',workerComponents:'v7',progressive:true,level:'avanzado'};
  const study=new SesionesClusterDebian(options),copy=new SesionesClusterDebian({...options,scenarioId:'c28-b'}),repair=new SesionesClusterDebian({...options,scenarioId:'c33-c'});
  const regular=await study.saveNodes([await study.packNode('controlplane',new Uint8Array([1,2,3]).buffer,'ESTUDIO')]);
  const temporary=await copy.saveNodes([await copy.packNode('controlplane',new Uint8Array([4,5,6]).buffer,'COPIA')]);
  let mixed=false;try{await copy.validateCluster(regular);}catch{mixed=true;}
  await copy.resetCluster(temporary.sha256);
  let invalid=false;try{new SesionesClusterDebian({...options,scenarioId:'c28-b',factoryVersion:'v6'});}catch{invalid=true;}
  return {different:study.key!==copy.key&&copy.key!==repair.key&&study.key!==repair.key,mixed,invalid,study:(await study.getCluster()).nodes[0].terminalText,copyGone:!await copy.getRawCluster()};
 });
 expect(result).toEqual({different:true,mixed:true,invalid:true,study:'ESTUDIO',copyGone:true});
});

test('Entrada rápida · identidades iguales a la base pública anterior, sin volver a descargarla',async({page})=>{
 await page.goto('/laboratorios/kubernetes-real/');
 const identities=await page.evaluate(async()=>{
  const {identidadNodoDebian}=await import('/laboratorios/kubernetes-real/debian/sesiones-cluster.mjs');
  return Promise.all(['controlplane','worker1'].map(id=>identidadNodoDebian(id,{workerComponents:'v8',factoryVersion:'v6'})));
 });
 // Pinned cluster.json at resources commit 91502ceb011e65b550c7c10875a60b83cb7c9ea0.
 expect(identities).toEqual(['6cb8081cc6033f34a3b42bb4bee4cd6e4a6e14ff6c93ede5723659fd8d8e0ad3','d2527704f0c948aa732483cac108670467ff4227a4f41fc2a425b4e1aa38b0f9']);
});

test('Administración · perfil HIGHMEM separado, sin convertir ni borrar guardados v6',async({page})=>{
 await page.goto('/laboratorios/kubernetes-real/');
 const result=await page.evaluate(async()=>{
  const {SesionesClusterDebian,perfilNodoDebian}=await import('/laboratorios/kubernetes-real/debian/sesiones-cluster.mjs');
  const {KubeSessions}=await import('/laboratorios/kubernetes-real/kube-sessions.mjs');
  const common={workerComponents:'v7',progressive:true,level:'avanzado'};
  const old=new SesionesClusterDebian({...common,factoryVersion:'v6'}),admin=new SesionesClusterDebian({...common,factoryVersion:'v13'});
  const oldNode=await old.packNode('controlplane',new Uint8Array([1,3,5]).buffer,'TRABAJO_V6');
  const original=await old.saveNodes([oldNode]);
  const adminNodes=await Promise.all(['controlplane','worker1','worker2'].map(id=>admin.packNode(id,new Uint8Array([2,4,6]).buffer,'COPIA_ADMIN')));
  const saved=await admin.saveNodes(adminNodes);
  let mixedRejected=false,ramRejected=false,kitRejected=false,unknownLimitRejected=false;
  try{await admin.validate([oldNode]);}catch{mixedRejected=true;}
  try{await admin.validate([{...adminNodes[0],profile:{...adminNodes[0].profile,memoryMiB:1024}}]);}catch{ramRejected=true;}
  try{new SesionesClusterDebian({...common,factoryVersion:'v13',workerComponents:'v8'});}catch{kitRejected=true;}
  try{new KubeSessions({stateLimitMiB:4096});}catch{unknownLimitRejected=true;}
  await admin.resetCluster(saved.sha256);
  return {separate:old.key!==admin.key,mixedRejected,ramRejected,kitRejected,unknownLimitRejected,
   oldLimit:new KubeSessions().maxStateBytes/1048576,adminLimit:admin.maxStateBytes/1048576,
   cp:perfilNodoDebian('controlplane',{factoryVersion:'v13'}),worker:perfilNodoDebian('worker1',{factoryVersion:'v13'}),
   oldPreserved:(await old.getCluster()).sha256===original.sha256,adminDeleted:!await admin.getCluster()};
 });
 expect(result.separate&&result.mixedRejected&&result.ramRejected&&result.kitRejected&&result.unknownLimitRejected).toBe(true);
 expect(result.oldLimit).toBe(1536);expect(result.adminLimit).toBe(2048);
 expect(result.cp).toMatchObject({os:'debian-admin-v3',engine:'jit8192-pic-only-v1',kernel:'highmem-v1',memoryMiB:1536});
 expect(result.worker).toMatchObject({kernel:'v1',memoryMiB:1024});
 expect(result.oldPreserved&&result.adminDeleted).toBe(true);
});
test('Guardado · ceder la copia temporal conserva bytes y formato entre iframes',async({page})=>{
 await page.goto('/laboratorios/kubernetes-real/');
 const result=await page.evaluate(async()=>{
  const {SesionesClusterDebian}=await import('/laboratorios/kubernetes-real/debian/sesiones-cluster.mjs');
  const session=new SesionesClusterDebian({workerComponents:'v7',factoryVersion:'v6',progressive:true,level:'inicial'});
  const frame=document.createElement('iframe');document.body.append(frame);
  const input=new frame.contentWindow.Uint8Array([3,1,4,1,5]).buffer;
  const node=await session.packNode('controlplane',input,'ESTADO_CEDIDO',{consumir:true});
  await session.saveNodes([node]);const saved=await session.getCluster(),stored=saved.nodes[0];
  const bytes=Array.from(new Uint8Array(await session.unpack(stored,stored.identity)));
  const ordinary=new Uint8Array([8,9]).buffer;await session.packNode('controlplane',ordinary);
  frame.remove();return {detached:input.byteLength===0,bytes,format:stored.format,declaredBytes:stored.bytes,originalPreserved:ordinary.byteLength===2};
 });
 expect(result).toEqual({detached:true,bytes:[3,1,4,1,5],format:'s2ktux-v86-session-v1',declaredBytes:5,originalPreserved:true});
});
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
