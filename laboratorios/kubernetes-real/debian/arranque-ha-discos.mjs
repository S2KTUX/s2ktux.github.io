import {miembrosHA} from './perfil-ha.mjs?v=60a21559ace773d9';
const names=['kube-apiserver.yaml','kube-controller-manager.yaml','kube-scheduler.yaml'];
function directory(id,token){
 if(!miembrosHA.includes(id)||typeof token!=='string'||!/^[a-f0-9]{32}$/.test(token))throw Error('Arranque HA no válido');
 return '/var/lib/kube-lab/arranque-ha/'+token;
}
const owner=dir=>`test "$(cat ${dir}/.owner)" = s2ktux-ha-start-v1`;
async function checked(run,id,label,command,timeout=120000){const result=await run(id,label,command,timeout);if(result?.ok!==true)throw Error(label);}
export async function apartarManifiestosHA(id,token,run){
 const dir=directory(id,token);
 await checked(run,id,'Escalonar los componentes durante el arranque',`set -eu; test ! -e ${dir}; mkdir -p /var/lib/kube-lab/arranque-ha; mkdir -m 700 ${dir}; echo s2ktux-ha-start-v1 > ${dir}/.owner; for name in ${names.join(' ')}; do if test -e /etc/kubernetes/manifests/$name; then test -f /etc/kubernetes/manifests/$name; mv /etc/kubernetes/manifests/$name ${dir}/$name; fi; done; if timeout 15s crictl ps -o json > /tmp/ha-boot-${token}.json; then ids=$(jq -r '.containers[]? | select(.metadata.name=="kube-apiserver" or .metadata.name=="kube-controller-manager" or .metadata.name=="kube-scheduler") | .id' /tmp/ha-boot-${token}.json); test -z "$ids" || timeout 30s crictl stop --timeout 0 $ids || true; fi; rm -f /tmp/ha-boot-${token}.json`);
}
export async function restaurarManifiestosHA(id,token,run){
 const dir=directory(id,token);
 // Mover, nunca generar ni corregir: conservar también los errores guardados.
 // Si aparece otro archivo en el destino, dejar ambas copias para revisarlo.
 await checked(run,id,'Conservar los manifiestos originales al terminar el arranque',`set -eu; if test ! -e ${dir}; then exit 0; fi; ${owner(dir)}; for name in ${names.join(' ')}; do if test -e ${dir}/$name; then test ! -e /etc/kubernetes/manifests/$name; mv ${dir}/$name /etc/kubernetes/manifests/$name; fi; done; rm -f ${dir}/.owner; rmdir ${dir}`);
}
export async function arrancarAPIsHAEnOrden(token,run){
 let failure;
 try{
  // Recuperar primero el consenso, sin que las tres API compitan con etcd
  // durante la lectura del WAL. Consultar salud no cambia los datos guardados.
  for(const id of miembrosHA)await checked(run,id,'Esperar el consenso de etcd antes de arrancar las API',`set -eu; deadline=$(($(date +%s)+180)); until response=$(curl --fail --silent --show-error --max-time 10 --cacert /etc/kubernetes/pki/etcd/ca.crt --cert /etc/kubernetes/pki/etcd/healthcheck-client.crt --key /etc/kubernetes/pki/etcd/healthcheck-client.key https://127.0.0.1:2379/health) && echo "$response" | jq -e '.health=="true"'; do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 5; done`,240000);
  for(const id of miembrosHA){
   const dir=directory(id,token);
   await checked(run,id,'Iniciar la API con los mismos archivos guardados',`set -eu; ${owner(dir)}; if test -e ${dir}/kube-apiserver.yaml; then test ! -e /etc/kubernetes/manifests/kube-apiserver.yaml; mv ${dir}/kube-apiserver.yaml /etc/kubernetes/manifests/kube-apiserver.yaml; fi`);
   const result=await run(id,'Esperar la API local antes de iniciar la siguiente',`deadline=$(($(date +%s)+180)); until response=$(curl --fail --silent --show-error --max-time 10 --cacert /etc/kubernetes/pki/ca.crt --cert /etc/kubernetes/pki/apiserver-kubelet-client.crt --key /etc/kubernetes/pki/apiserver-kubelet-client.key https://127.0.0.1:6443/readyz) && test "$response" = ok; do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 5; done`,240000);
   if(result?.ok!==true&&result?.ok!==false)throw Error('No se recibió la salud de la API HA');
   // Una avería guardada no impide abrir los demás miembros para repararla.
  }
 }catch(error){failure=error;}
 finally{
  for(const id of miembrosHA)try{await restaurarManifiestosHA(id,token,run);}catch(error){failure||=error;}
 }
 if(failure)throw failure;
}
