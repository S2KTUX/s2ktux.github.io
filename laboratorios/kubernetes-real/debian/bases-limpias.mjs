import {SesionesClusterDebian} from './sesiones-cluster.mjs?v=e1883881db6e84f4';
// Distinto de los guardados del alumno: aquí solo entra la primera base,
// antes de habilitar su consola y nunca después de recuperar una sesión.
export class BasesLimpias extends SesionesClusterDebian{
 constructor(revision,options){
  const {compatibleRevisions=[],...profile}=options||{};
  super(profile);if(!/^[a-f0-9]{64}$/.test(revision))throw Error('Revisión de base limpia inválida');
  if(!Array.isArray(compatibleRevisions)||compatibleRevisions.length>8||compatibleRevisions.some(value=>!/^[a-f0-9]{64}$/.test(value)||value===revision)||new Set(compatibleRevisions).size!==compatibleRevisions.length)throw Error('Compatibilidad de base limpia inválida');
  this.compatibleRevisions=[...compatibleRevisions];this.compatibleProfile=profile;
  this.prefix='base:'+this.level+':';this.key=this.prefix+revision;
 }
 open(){return new Promise((resolve,reject)=>{
  const request=indexedDB.open('s2ktux-kubernetes-clean-start-v1',1);
  request.onupgradeneeded=()=>request.result.createObjectStore('sessions',{keyPath:'key'});
  request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
  request.onblocked=()=>reject(Error('La caché de entrada rápida está ocupada'));
 });}
 async read(){try{
  const record=await this.getCluster();
  if(record){if(record.nodes.length!==({inicial:1,intermedio:2,avanzado:3})[this.level])throw Error('Base limpia incompleta');return record;}
  // Solo revisiones declaradas equivalentes. Cada registro conserva su
  // validación completa de perfil, identidad, tamaño y sumas antes de migrar.
  for(const revision of this.compatibleRevisions){
   const previous=await new BasesLimpias(revision,this.compatibleProfile).read();
   if(previous)return await this.write(previous.nodes);
  }
  return null;
 }catch(error){console.warn('Base limpia no reutilizada:',error.message);return null;}}
 async write(nodes){
  if(nodes.length!==({inicial:1,intermedio:2,avanzado:3})[this.level])throw Error('No se guarda una base limpia parcial');
  const current=await this.getRawCluster(),record=await this.saveNodes(nodes,current?.sha256||null);
  // Conservar una sola revisión por nivel; no se abre la BD de sesiones.
  const db=await this.open();
  try{await new Promise((resolve,reject)=>{
   const tx=db.transaction('sessions','readwrite'),store=tx.objectStore('sessions'),keys=store.getAllKeys();
   keys.onsuccess=()=>{for(const key of keys.result)if(typeof key==='string'&&key.startsWith(this.prefix)&&key!==this.key)store.delete(key);};
   tx.oncomplete=resolve;tx.onerror=tx.onabort=()=>reject(tx.error||Error('No se pudo limitar la caché'));
  });}finally{db.close();}
  return record;
 }
}

export async function capturarCluster({ordered,network,pack,write}){
 const held=[];
 try{
  for(const [id,node]of ordered){const access=node.window.kubeDebianSnapshot,info=access.lock();held.push({id,access,info});}
  network.pause();
  const stopped=await Promise.allSettled(held.map(node=>node.access.freeze()));
  const rejected=stopped.find(result=>result.status==='rejected');if(rejected)throw rejected.reason;
  const captures=[];
  for(const node of held)captures.push(await pack(node.id,await node.access.state(),node.info.terminalText,{consumir:true}));
  return await write(captures);
 }finally{
  let networkError;try{network.resume();}catch(error){networkError=error;}
  const released=await Promise.allSettled(held.map(node=>node.access.release()));
  const rejected=released.find(result=>result.status==='rejected');
  if(rejected||networkError){const error=Error('No se pudieron reanudar todas las máquinas tras la captura',{cause:rejected?.reason||networkError});error.resumeFailed=true;throw error;}
 }
}
