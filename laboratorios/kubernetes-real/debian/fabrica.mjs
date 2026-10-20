import {recursoPesado} from '../recursos-publicados.mjs';
import {verifiedDownload} from '../../verified-download.mjs';
// Identidad exclusiva de Debian: no aceptar capturas Alpine ni guardados del alumno.
export const PERFIL_DEBIAN={
 rootSha256:'fcbd48d751b9ace0693783390a1491c8fb6c4e9ee6049660c657f36426a8a800',
 componentsSha256:'3fc89ed9b511bf8ac32b132295b1f3a887551e2eb008768aa670eae97a8e5345',
 kernelSha256:'7266ac03849dd287b8e672d8ae9e882d6eb3c1bcd5e88d951132c2614b56cd96',
 configurationSha256:'8246897f5186622884529f01efc240067efb410b48f9da0dc04f3a4ae5c324b8',
 setupSha256:'6463d29b7b852347e78f2c3eb0c26c838e284d76c1d32de219dc3775eb7e36a5',
 engineSha256:'5f752e916bef9d76889fe0d14f73bb0e611abe2a5d6abdedca8b50da480bf3ac',
 node:'cka-cp1',nodeIPv4:'10.77.0.10',podSubnet:'10.244.0.0/16',
};
// Captura limpia de init v13: TLS clásico en los componentes y reservas
// comprobadas mediante los mirror Pods. Sigue siendo un candidato privado.
export const PERFIL_DEBIAN_BALANCEADO={...PERFIL_DEBIAN,
 configurationSha256:'9df13542f1458810e1b958b9c06ba5aeb6dc961e0c624e98b5e45d64165664bf',
};
// Init v16 comprobado. Runtime OOM aún candidato hasta su prueba negativa.
export const PERFIL_DEBIAN_OOM={...PERFIL_DEBIAN_BALANCEADO,
 rootSha256:'fd01e13c792d7ced1953f5d72184bb0fb6611b22fda859ef0e98fdf61b0d9dd1',
};
export const PERFIL_DEBIAN_OOM_GRUPO={...PERFIL_DEBIAN_BALANCEADO,
 rootSha256:'b28ae1db29f350845de04ec03188d6d89fa7b86250e5788e45497478fd284716',
};
// Administración privada: mismos servicios/configuración comprobados, pero
// otro disco con paquetes APT reales. No aceptar capturas v6 en esta base.
export const PERFIL_DEBIAN_ADMIN={...PERFIL_DEBIAN_BALANCEADO,
 rootSha256:'71bc2f098df5d02121bf813490808317e627e6e8f875d1eb1d00bc78d310db18',
};
export const PERFIL_DEBIAN_ADMIN_PRECARGADO={...PERFIL_DEBIAN_BALANCEADO,
 rootSha256:'cd113483ac5af5fab4708f2dbcdc3e78a9d3bdb24dff000a23d24ed80a09bd83',
 configurationSha256:'190186df6d830b211257104e086659b563b520eb55e17777ae0d1d9a1108e636',
};
// Init v27: artefacto privado v10, reloj nuevo y capas OCI desempaquetadas.
// No es intercambiable con v8 ni con guardados del curso v6.
export const PERFIL_DEBIAN_ADMIN_RELOJ={...PERFIL_DEBIAN_BALANCEADO,
 rootSha256:'9178e37b2784a7cd66b641d45d8a80d16f6745ba518cabe4f4cbe30a4bf33162',
 configurationSha256:'00c48751e239d634550ea9e8763598980afe0acdf2101b00dd56e8b18ef398bd',
 engineSha256:'af9714105657e52b3a3b0046f3718f0d58c475060b4bdfd31973dfe3d9b1989f',
};
export function perfilFabricaDebian(version){
 if(['v1','v2'].includes(version))return PERFIL_DEBIAN;
 if(version==='v3')return PERFIL_DEBIAN_BALANCEADO;
 if(version==='v4')return PERFIL_DEBIAN_OOM;
 if(['v5','v6'].includes(version))return PERFIL_DEBIAN_OOM_GRUPO;
 if(version==='v7')return PERFIL_DEBIAN_ADMIN;
 if(version==='v8')return PERFIL_DEBIAN_ADMIN_PRECARGADO;
 if(version==='v10')return PERFIL_DEBIAN_ADMIN_RELOJ;
 throw Error('Fábrica Debian desconocida');
}
const digest=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const sha=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),byte=>byte.toString(16).padStart(2,'0')).join('');
export function validarFabricaDebian(factory,expected=PERFIL_DEBIAN){
 if(factory?.format!=='s2ktux-kubernetes-debian-factory-v1'||factory.scope!=='debian-controlplane'||factory.file!=='estado.gz'||factory.memoryMiB!==1024)throw Error('La captura no es una base Debian del curso');
 const known=[PERFIL_DEBIAN,PERFIL_DEBIAN_BALANCEADO,PERFIL_DEBIAN_OOM,PERFIL_DEBIAN_OOM_GRUPO,PERFIL_DEBIAN_ADMIN,PERFIL_DEBIAN_ADMIN_PRECARGADO,PERFIL_DEBIAN_ADMIN_RELOJ].some(profile=>Object.keys(profile).length===Object.keys(expected).length&&Object.entries(profile).every(([key,value])=>expected[key]===value));
 if(!known)throw Error('Perfil Debian desconocido');
 for(const [key] of Object.entries(expected)){
  if(factory[key]!==expected[key]||(key.endsWith('Sha256')&&!digest(factory[key])))throw Error('La captura no corresponde al perfil Debian comprobado: '+key);
 }
 if(!digest(factory.sha256)||!Number.isSafeInteger(factory.bytes)||factory.bytes<1||factory.bytes>1536*1048576||!Number.isSafeInteger(factory.packedBytes)||factory.packedBytes<1||factory.packedBytes>512*1048576)throw Error('Tamaño o checksum inválidos');
 return factory;
}
export function validarFragmentosDebian(factory,expected=PERFIL_DEBIAN){
 if(factory?.format!=='s2ktux-kubernetes-debian-factory-parts-v1')throw Error('Formato fragmentado incorrecto');
 validarFabricaDebian({...factory,format:'s2ktux-kubernetes-debian-factory-v1'},expected);
 if(!Array.isArray(factory.parts)||factory.parts.length<1||factory.parts.length>64)throw Error('Lista de fragmentos inválida');
 let end=0;
 for(const part of factory.parts){
  if(part.offset!==end||!Number.isSafeInteger(part.bytes)||part.bytes<1||part.bytes>8*1048576||!digest(part.sha256)||part.file!==part.sha256+'.part')throw Error('Fragmento inválido');
  end+=part.bytes;
 }
 if(end!==factory.packedBytes)throw Error('Captura fragmentada incompleta');
 return factory;
}
export async function cargarFabricaDebian(base,expected=PERFIL_DEBIAN,{notify=()=>{}}={}){
 const response=await fetch(new URL('estado-fragmentado.json',base));if(!response.ok)throw Error('Base preparada no disponible');
 const factory=validarFragmentosDebian(await response.json(),expected);
 const packed=new Uint8Array(factory.packedBytes),progress=new Map();let index=0,received=0;
 await Promise.all(Array.from({length:Math.min(3,factory.parts.length)},async()=>{
  for(;;){
   const part=factory.parts[index++];if(!part)return;
   const bytes=await verifiedDownload(recursoPesado(new URL('fragmentos/'+part.file,base)),{hash:part.sha256,bytes:part.bytes,notify:count=>{progress.set(part.file,count);notify(`Recuperando base Debian… ${Math.floor([...progress.values()].reduce((a,b)=>a+b,0)/factory.packedBytes*100)} %`);}});
   packed.set(new Uint8Array(bytes),part.offset);received+=part.bytes;notify(`Recuperando base Debian… ${Math.floor(received/factory.packedBytes*100)} %`);
  }
 }));
 if(await sha(packed)!==factory.sha256)throw Error('La base Debian está alterada');
 notify('Descomprimiendo la memoria del nodo…');
 const state=new Uint8Array(factory.bytes),reader=new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip')).getReader();let offset=0;
 try{
  for(;;){const {value,done}=await reader.read();if(done)break;if(value.length>state.length-offset)throw Error('La captura excede el tamaño declarado');state.set(value,offset);offset+=value.length;}
  if(offset!==state.length)throw Error('Estado descomprimido incompleto');return {factory,buffer:state.buffer};
 }finally{await reader.cancel().catch(()=>{});reader.releaseLock();}
}
