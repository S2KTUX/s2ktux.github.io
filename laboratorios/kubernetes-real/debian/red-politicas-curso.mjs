import {prepararRedPoliticasDebian,instalarPoliticasDebian} from './politicas-cluster.mjs';
import {persistirNamespacesDebian,scriptNamespacesDebian,unidadNamespacesDebian} from './red-persistente.mjs';
import {hashBytes} from '../../docker-real/v86-sessions.mjs';
export async function prepararPoliticasCurso(run,{workers=['worker1'],prepareMissingWorkers=false}={}){
 if(typeof prepareMissingWorkers!=='boolean'||!Array.isArray(workers)||!workers.length||new Set(workers).size!==workers.length||workers.some(id=>!['worker1','worker2'].includes(id)))throw Error('Workers de políticas no válidos');
 const execute=async(id,label,command,timeout=240000)=>{const result=await run(id,label,'set -eu; '+command,timeout);if(result?.ok!==true)throw Error('No se han preparado las políticas: '+label);return result;};
 await execute('controlplane','Comprobar la API antes de preparar las políticas','kubectl get --raw=/readyz --request-timeout=20s');
 const existing=await run('controlplane','Consultar el filtrado existente','test -n "$(kubectl -n kube-system get ds kube-network-policies --ignore-not-found -o name)"',60000);
 if(existing?.ok!==true&&existing?.ok!==false)throw Error('No se pudo consultar el filtrado de red');
 if(!existing.ok)await execute('controlplane','Evitar sobrescribir permisos de red existentes','for target in clusterrole/kube-network-policies clusterrolebinding/kube-network-policies; do test -z "$(kubectl get "$target" --ignore-not-found -o name)"; done; test -z "$(kubectl -n kube-system get serviceaccount kube-network-policies --ignore-not-found -o name)"');
 const scriptHash=await hashBytes(new TextEncoder().encode(scriptNamespacesDebian)),unitHash=await hashBytes(new TextEncoder().encode(unidadNamespacesDebian));
 for(const worker of workers){
  await execute(worker,'Comprobar el componente nativo de red','test -x /mnt/kube-client/bin/netpol && test -S /var/run/nri/nri.sock');
  const files=await run(worker,'Consultar la preparación persistente de red','test -e /etc/systemd/system/kube-lab-netns.service || test -e /usr/local/sbin/kube-lab-netns',45000);
  if(files?.ok===true){
   await execute(worker,'Conservar la preparación de red sin sobrescribirla',`echo '${scriptHash}  /usr/local/sbin/kube-lab-netns' | sha256sum -c -; echo '${unitHash}  /etc/systemd/system/kube-lab-netns.service' | sha256sum -c -; systemctl is-active --quiet kube-lab-netns.service; mountpoint -q /run/netns`);
  }else if(files?.ok===false){
   if(existing.ok&&!prepareMissingWorkers)throw Error('Falta la preparación de un worker; no se han reparado tus cambios.');
   await prepararRedPoliticasDebian(worker,execute);await persistirNamespacesDebian(worker,execute);
  }else throw Error('No se pudo consultar la preparación del worker');
 }
 if(existing.ok){await execute('controlplane','Comprobar el filtrado sin modificarlo','kubectl -n kube-system get ds kube-network-policies -o json | jq -e \'.spec.template.spec.containers[0].command==["/bin/netpol"] and .spec.template.spec.containers[0].image=="busybox:1.37.0-musl"\' && kubectl -n kube-system rollout status ds/kube-network-policies --timeout=180s');return;}
 await instalarPoliticasDebian(execute);
}
