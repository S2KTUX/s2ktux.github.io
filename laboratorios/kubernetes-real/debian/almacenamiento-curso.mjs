import {almacenamientoHash} from './almacenamiento-paquete.mjs?v=d4811b221ba9e60a';
import {comandosArchivoGzipWeb} from './archivos-gzip-web.mjs';
const sha=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),v=>v.toString(16).padStart(2,'0')).join('');
export async function comandosAlmacenamiento(yaml){
 return [
  ['Importar la imagen real del aprovisionador en el worker','if ! ctr -n k8s.io images ls -q | grep -qx docker.io/s2ktux/local-path-lab:0.0.34; then gzip -dc /mnt/kube-client/images/curso.tar.gz | ctr -n k8s.io images import --no-unpack --platform=linux/386 -; fi',300000,'worker1'],
  ...(await comandosArchivoGzipWeb('/tmp/curso-local-path.yaml',yaml)).map(command=>['Enviar el manifiesto verificado de almacenamiento',command,60000]),
  ['Activar el aprovisionador local','ns=$(kubectl get namespace local-path-storage --ignore-not-found -o name); test -z "$ns"; for target in clusterrole/local-path-provisioner-role clusterrolebinding/local-path-provisioner-bind storageclass/local-path; do existing=$(kubectl get "$target" --ignore-not-found -o name); test -z "$existing"; done; kubectl apply --validate=strict --request-timeout=120s -f /tmp/curso-local-path.yaml && kubectl -n local-path-storage rollout status deployment/local-path-provisioner --timeout=240s',300000]
 ];
}
export async function prepararAlmacenamiento(run){
 const execute=async(label,command,timeout=240000,node='controlplane')=>{const result=await run(node,label,'set -eu; '+command,timeout);if(result?.ok!==true)throw Error('No se ha preparado el almacenamiento: '+label);};
 const existing=await run('controlplane','Consultar el aprovisionador existente','test -n "$(kubectl get namespace local-path-storage --ignore-not-found -o name)"',60000);
 if(existing?.ok===true){
  // No reinstalar ni reparar un complemento editado por el alumno.
  await execute('Comprobar el almacenamiento sin modificarlo','test "$(kubectl -n local-path-storage get deployment local-path-provisioner -o jsonpath=\'{.spec.template.spec.containers[0].image}\')" = s2ktux/local-path-lab:0.0.34 && kubectl -n local-path-storage rollout status deployment/local-path-provisioner --timeout=120s');return;
 }
 if(existing?.ok!==false)throw Error('No se pudo consultar el almacenamiento');
 const resource=new URL('../recursos/almacenamiento-v1/local-path.yaml.gz',import.meta.url);resource.searchParams.set('v',almacenamientoHash);
 const response=await fetch(resource);if(!response.ok)throw Error('No está disponible el manifiesto de almacenamiento');
 const packed=await response.arrayBuffer();if(packed.byteLength>65536||await sha(packed)!==almacenamientoHash)throw Error('Manifiesto de almacenamiento alterado');
 const yaml=await new Response(new Blob([packed]).stream().pipeThrough(new DecompressionStream('gzip'))).text();if(yaml.length>65536)throw Error('Manifiesto excesivo');
 for(const [label,command,timeout,node]of await comandosAlmacenamiento(yaml))await execute(label,command,timeout,node);
}
