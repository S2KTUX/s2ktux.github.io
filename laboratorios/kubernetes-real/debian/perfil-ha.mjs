// Identidad propia: un miembro HA nunca es un worker ni una fábrica v14.
// Las tres máquinas usan el mismo hardware comprobado en HA nativo v10.
export const miembrosHA=Object.freeze(['controlplane','worker1','worker2']);
export const perfilBaseHA=Object.freeze({
 os:'debian-admin-v3',components:'v7',engine:'jit8192-pic-only-v1',kernel:'highmem-net-v2',memoryMiB:1536,
 rootSha256:'9178e37b2784a7cd66b641d45d8a80d16f6745ba518cabe4f4cbe30a4bf33162',
 componentsSha256:'3fc89ed9b511bf8ac32b132295b1f3a887551e2eb008768aa670eae97a8e5345',
 engineSha256:'b31b2045a1ac53ce90e2ead888455b993a24a8c3433a5985ed21e95da47eddef',
 kernelSha256:'709c16f5901b0474056926e79eae1f1822c1fb154104cd80872f7d049d269891',
 apiSha256:'29197a58b1d43d810c29ef742de6eb167ffd73b516e50b18f19806241a9dcdd1',
 topology:'three-control-planes-v1',bootstrap:'haproxy-keepalived-raft1000-10000-runtime135-leader180-120-phases-v4',scheduler:'native-v1',tls:'classical'
});
export function perfilNodoHA(id){
 const index=miembrosHA.indexOf(id);if(index<0)throw Error('Miembro HA desconocido');
 return {...perfilBaseHA,role:'controlplane',name:'cka-cp'+(index+1),ip:'10.77.0.'+(10+index),mac:'02:00:00:77:01:0'+(index+1)};
}
export async function identidadNodoHA(id){
 const bytes=new TextEncoder().encode(JSON.stringify(perfilNodoHA(id)));
 return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),n=>n.toString(16).padStart(2,'0')).join('');
}
export function validarPerfilHA(options,member){
 if(member===null)return null;
 if(!['1','2','3'].includes(member)||options.factoryVersion!=='v14'||options.base!=='admin-v3'||options.components!=='v7'||!options.withKube||!options.clustered||!options.schedulingAPI||options.tlsMode!=='classical'||options.engineVariant!==perfilBaseHA.engine||options.kernelVariant!==perfilBaseHA.kernel||options.diskMode!=='dma'||options.sharedCode||options.warm||!options.threaded||options.worker!==null)throw Error('HA requiere su hardware y tres control planes propios; no admite workers ni capturas de estudio');
 return Object.freeze({memoryMiB:1536,stateLimitMiB:2048,member:Number(member)});
}
