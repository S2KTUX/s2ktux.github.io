import {test,expect} from '@playwright/test';
test('v15 · reutiliza solo bases compatibles validando también los discos externos',async({page})=>{
 await page.goto('/sobre.html');
 const result=await page.evaluate(async()=>{
  const {SesionesCheckpointV15,BasesLimpiasCheckpointV15,manifiestosCheckpointV15}=await import('/laboratorios/kubernetes-real/debian/sesiones-checkpoint.mjs');
  const {empaquetarDiscoExterno}=await import('/laboratorios/kubernetes-real/checkpoint-discos.mjs');
  const options={workerComponents:'v7',factoryVersion:'v15',progressive:true,level:'avanzado'};
  const ordinary=new SesionesCheckpointV15(options),old=new BasesLimpiasCheckpointV15('a'.repeat(64),options);
  const manifests=manifiestosCheckpointV15(),externalDisks=[];
  for(const [id,manifest]of Object.entries(manifests))externalDisks.push({id,...await empaquetarDiscoExterno(manifest,[id==='root'?[[0,new Uint8Array(1048576).fill(7)]]:[]])});
  const nodes=await Promise.all(['controlplane','worker1','worker2'].map((id,i)=>old.packNode(id,{format:'s2ktux-external-disks-checkpoint-v1',state:new Uint8Array([i+1,2,3]).buffer,externalDisks},'BASE_LIMPIA')));
  await old.write(nodes);const student=await ordinary.saveNodes(nodes.map(node=>({...node,terminalText:'SESION_ALUMNO'})));
  const next=new BasesLimpiasCheckpointV15('b'.repeat(64),{...options,compatibleRevisions:['a'.repeat(64)]}),migrated=await next.read();
  const corrupt=new BasesLimpiasCheckpointV15('c'.repeat(64),options);await corrupt.write(nodes);
  const raw=await corrupt.getRawCluster();raw.nodes[0].externalDisks[0].manifestSha256='9'.repeat(64);
  const db=await corrupt.open();await new Promise((resolve,reject)=>{const tx=db.transaction('sessions','readwrite');tx.objectStore('sessions').put(raw);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});db.close();
  const rejected=await new BasesLimpiasCheckpointV15('d'.repeat(64),{...options,compatibleRevisions:['c'.repeat(64)]}).read();
  const untouched=await ordinary.getCluster();
  return {migrated:!!migrated&&migrated.nodes.length===3,external:migrated?.nodes.every(n=>n.format==='s2ktux-v86-external-checkpoint-v1'&&n.externalDisks.length===2),corruptRejected:rejected===null,studentPreserved:untouched.sha256===student.sha256&&untouched.nodes.every(n=>n.terminalText==='SESION_ALUMNO')};
 });
 expect(result).toEqual({migrated:true,external:true,corruptRejected:true,studentPreserved:true});
});
