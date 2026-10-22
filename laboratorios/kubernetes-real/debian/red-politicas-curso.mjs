import {prepararRedPoliticasDebian,instalarPoliticasDebian} from './politicas-cluster.mjs';
import {persistirNamespacesDebian} from './red-persistente.mjs';
export async function prepararPoliticasCurso(run){
 const execute=async(id,label,command,timeout=240000)=>{const result=await run(id,label,'set -eu; '+command,timeout);if(result?.ok!==true)throw Error('No se han preparado las políticas: '+label);return result;};
 await execute('controlplane','Comprobar la API antes de preparar las políticas','kubectl get --raw=/readyz --request-timeout=20s');
 const existing=await run('controlplane','Consultar el filtrado existente','test -n "$(kubectl -n kube-system get ds kube-network-policies --ignore-not-found -o name)"',60000);
 if(existing?.ok===true){
  await execute('controlplane','Comprobar el filtrado sin modificarlo','kubectl -n kube-system get ds kube-network-policies -o json | jq -e \'.spec.template.spec.containers[0].command==["/bin/netpol"] and .spec.template.spec.containers[0].image=="busybox:1.37.0-musl"\' && kubectl -n kube-system rollout status ds/kube-network-policies --timeout=180s');return;
 }
 if(existing?.ok!==false)throw Error('No se pudo consultar el filtrado de red');
 await execute('controlplane','Evitar sobrescribir permisos de red existentes','for target in clusterrole/kube-network-policies clusterrolebinding/kube-network-policies; do test -z "$(kubectl get "$target" --ignore-not-found -o name)"; done; test -z "$(kubectl -n kube-system get serviceaccount kube-network-policies --ignore-not-found -o name)"');
 await execute('worker1','Comprobar el componente nativo de red','test -x /mnt/kube-client/bin/netpol && test -S /var/run/nri/nri.sock && test ! -e /etc/systemd/system/kube-lab-netns.service && test ! -e /usr/local/sbin/kube-lab-netns');
 await prepararRedPoliticasDebian('worker1',execute);
 await persistirNamespacesDebian('worker1',execute);
 await instalarPoliticasDebian(execute);
}
