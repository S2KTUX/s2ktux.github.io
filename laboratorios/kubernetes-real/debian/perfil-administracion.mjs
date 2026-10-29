// El avanzado tiene una identidad distinta: nunca adaptar un guardado v6.
export function perfilAdministracion(options){
 if(!['v13','v14','v15'].includes(options.factoryVersion))return null;
 const worker=['1','2'].includes(options.worker);
 if(options.base!=='admin-v3'||options.components!=='v7'||options.withKube!==true||options.clustered!==true||options.schedulingAPI!==true||options.tlsMode!=='classical'||options.engineVariant!==(options.factoryVersion==='v15'?'jit8192-pic-v1':'jit8192-pic-only-v1')||options.diskMode!=='dma'||options.sharedCode===true||(!worker&&options.worker!==null)||
  (worker?(options.warm!==false||options.threaded!==true||options.kernelVariant!=='v1'):(options.warm!==true||options.threaded!==false||options.kernelVariant!=='highmem-v1')))throw Error('Administración requiere su base, motor, kernel y memoria propios; no convierte sesiones anteriores');
 return Object.freeze({memoryMiB:worker?1024:1536,stateLimitMiB:worker?1536:2048});
}
