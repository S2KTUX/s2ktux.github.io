// Candidato privado. La RAM sigue usando el formato v86 original; los bloques
// modificados se comprimen por separado, sin crear un ArrayBuffer gigante.
import {hashBlob,hashBytes} from '/laboratorios/docker-real/v86-sessions.mjs?v=3852a1206e14ad3b';
const FORMAT='s2ktux-external-disk-v1',CHECKPOINT='s2ktux-external-disks-checkpoint-v1';
const digest=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const header=record=>({format:record.format,manifestSha256:record.manifestSha256,diskBytes:record.diskBytes,chunkSize:record.chunkSize,parts:record.parts.map(({index,bytes,rawSha256,packedBytes,sha256})=>({index,bytes,rawSha256,packedBytes,sha256}))});
const hashHeader=record=>hashBytes(new TextEncoder().encode(JSON.stringify(header(record))));
function validateManifest(manifest){
 if(!manifest||!digest(manifest.sha256)||manifest.chunkSize!==1048576||!Number.isSafeInteger(manifest.bytes)||manifest.bytes<1||!Array.isArray(manifest.parts)||manifest.parts.length!==Math.ceil(manifest.bytes/manifest.chunkSize))throw Error('Manifiesto de disco inválido');
}
function bytesAt(manifest,index){
 if(!Number.isSafeInteger(index)||index<0||index>=manifest.parts.length)throw Error('Índice de disco inválido');
 const expected=Math.min(manifest.chunkSize,manifest.bytes-index*manifest.chunkSize);
 if(manifest.parts[index]?.bytes!==expected)throw Error('Tamaño de bloque base inválido');return expected;
}
export async function empaquetarDiscoExterno(manifest,state){
 validateManifest(manifest);
 if(!Array.isArray(state)||state.length!==1||!Array.isArray(state[0]))throw Error('Estado de disco inválido');
 const entries=[...state[0]].sort((a,b)=>a[0]-b[0]),parts=[];let previous=-1;
 for(const entry of entries){
  if(!Array.isArray(entry)||entry.length!==2)throw Error('Bloque de disco inválido');
  const [index,data]=entry,bytes=bytesAt(manifest,index);
  if(index<=previous||!(data instanceof Uint8Array)||data.byteLength!==bytes)throw Error('Bloque repetido o incompleto');previous=index;
  const rawSha256=await hashBytes(data),packed=await new Response(new Blob([data]).stream().pipeThrough(new CompressionStream('gzip'))).blob();
  if(packed.size<1||packed.size>bytes+65536)throw Error('Bloque comprimido fuera de límite');
  parts.push({index,bytes,rawSha256,packedBytes:packed.size,sha256:await hashBlob(packed),packed});
 }
 const record={format:FORMAT,manifestSha256:manifest.sha256,diskBytes:manifest.bytes,chunkSize:manifest.chunkSize,parts};record.sha256=await hashHeader(record);return record;
}
export async function validarDiscoExterno(record,manifest){
 validateManifest(manifest);
 if(!record||record.format!==FORMAT||record.manifestSha256!==manifest.sha256||record.diskBytes!==manifest.bytes||record.chunkSize!==manifest.chunkSize||!digest(record.sha256)||!Array.isArray(record.parts)||record.parts.length>manifest.parts.length)throw Error('Disco de otra base o incompleto');
 let previous=-1;
 for(const part of record.parts){
  const bytes=bytesAt(manifest,part?.index);
  if(part.index<=previous||part.bytes!==bytes||!digest(part.rawSha256)||!digest(part.sha256)||!Number.isSafeInteger(part.packedBytes)||part.packedBytes<1||part.packedBytes>bytes+65536||!(part.packed instanceof Blob)||part.packed.size!==part.packedBytes)throw Error('Bloque externo inválido');
  previous=part.index;if(await hashBlob(part.packed)!==part.sha256)throw Error('Bloque externo alterado');
 }
 if(await hashHeader(record)!==record.sha256)throw Error('Índice del disco externo alterado');return true;
}
export async function desempaquetarDiscoExterno(record,manifest){
 await validarDiscoExterno(record,manifest);const entries=[];
 for(const part of record.parts){
  const data=new Uint8Array(part.bytes),reader=part.packed.stream().pipeThrough(new DecompressionStream('gzip')).getReader();let offset=0;
  try{
   for(;;){const {value,done}=await reader.read();if(done)break;if(value.length>data.length-offset)throw Error('El bloque excede su tamaño declarado');data.set(value,offset);offset+=value.length;}
   if(offset!==part.bytes||await hashBytes(data)!==part.rawSha256)throw Error('Datos del disco externo incompletos o alterados');
  }finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
  entries.push([part.index,data]);
 }
 return [entries];
}
export async function capturarCheckpointExterno(vm,disks){
 if(typeof vm?.save_state!=='function'||typeof vm.is_running!=='function'||vm.is_running()!==false||!Array.isArray(disks)||disks.length!==2||new Set(disks.map(d=>d.id)).size!==2||!disks.some(d=>d.id==='root')||!disks.some(d=>d.id==='components'))throw Error('La máquina debe estar parada y tener sus dos discos');
 for(const {disk} of disks){if(!disk||typeof disk.get_state!=='function'||typeof disk.set_state!=='function'||disk.failure||disk.operations?.size||disk.pending?.size)throw Error('El disco tiene errores u operaciones pendientes');validateManifest(disk.manifest);}
 const diskStates=disks.map(({id,disk})=>({id,manifest:disk.manifest,state:disk.get_state()}));
 const originals=disks.map(({disk})=>({disk,descriptor:Object.getOwnPropertyDescriptor(disk,'get_state')}));let state;
 try{
  for(const {disk} of disks)Object.defineProperty(disk,'get_state',{value:()=>[[]],configurable:true,writable:true});
  state=await vm.save_state();if(!(state instanceof ArrayBuffer)||!state.byteLength||state.byteLength>=2147483648)throw Error('La memoria de la máquina supera el límite de Chromium');
 }finally{for(const {disk,descriptor} of originals){if(descriptor)Object.defineProperty(disk,'get_state',descriptor);else delete disk.get_state;}}
 // Capturar el reloj/CPU antes de comprimir: la compresión no debe sumarse
 // al tiempo que Linux cree haber estado ejecutándose en el estado guardado.
 const externalDisks=[];
 for(const {id,manifest,state:diskState} of diskStates)externalDisks.push({id,...await empaquetarDiscoExterno(manifest,diskState)});
 return {format:CHECKPOINT,state,externalDisks};
}
export async function prepararRestauracionDiscosExternos(records,disks){
 if(!Array.isArray(records)||records.length!==2||!Array.isArray(disks)||disks.length!==2||new Set(records.map(r=>r?.id)).size!==2||new Set(disks.map(d=>d?.id)).size!==2)throw Error('Faltan discos del checkpoint');
 const staged=[];
 for(const {id,disk} of disks){
  if(!['root','components'].includes(id)||!disk||typeof disk.set_state!=='function')throw Error('Destino de disco inválido');
  const record=records.find(r=>r.id===id);if(!record)throw Error('Disco externo no encontrado');
  staged.push({disk,state:await desempaquetarDiscoExterno(record,disk.manifest)});
 }
 // Descomprimir ANTES de crear/restaurar la CPU evita consumir sus tiempos
 // de espera mientras todavía se están leyendo los bloques del disco.
 let used=false;
 return ()=>{if(used)throw Error('Los discos del checkpoint ya se restauraron');used=true;for(const {disk,state} of staged)disk.set_state(state);};
}
export async function restaurarDiscosExternos(records,disks){
 const apply=await prepararRestauracionDiscosExternos(records,disks);apply();
}
