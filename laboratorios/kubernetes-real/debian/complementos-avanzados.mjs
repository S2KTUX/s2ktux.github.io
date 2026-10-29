import {prepararMaterialesCurso} from './materiales-curso.mjs?v=6deece2f71879ea3';
// Preparación bajo demanda. Nunca se ejecuta al recuperar una sesión.
export async function materialesAvanzados(run){
 const existing=await run('controlplane','Consultar los materiales de las clases','test -d /opt/curso',60000);
 if(existing?.ok===false)return prepararMaterialesCurso(run);
 if(existing?.ok!==true)throw Error('No se pudieron consultar los materiales');
 const checked=await run('controlplane','Verificar los materiales sin sobrescribirlos','cd /opt/curso && sha256sum -c SHA256SUMS',90000);
 if(checked?.ok!==true)throw Error('Los materiales están incompletos o modificados; no se sustituyen los archivos del alumno');
}
export async function prepararMetricas(run,{install=true}={}){
 const execute=async(node,label,command,timeout=180000)=>{const result=await run(node,label,'set -eu; '+command,timeout);if(result?.ok!==true)throw Error(label);};
 await materialesAvanzados(run);
 await execute('worker1','Importar la imagen nativa de Metrics Server','if ! ctr -n k8s.io images ls -q | grep -Fxq docker.io/s2ktux/metrics-server-lab:0.8.0-2; then gzip -dc /mnt/kube-client/images/curso.tar.gz | ctr -n k8s.io images import --no-unpack --platform=linux/386 -; fi',300000);
 // La copia original conserva su checksum y la variante de tres nodos.
 // El ejercicio puede ensayarse también con CP+worker, sin arrancar otra VM.
 await execute('controlplane','Preparar una copia del manifiesto para este worker',`test -f /opt/curso/29/metrics-server.yaml; if test -e /opt/curso/29/metrics-server-practica.yaml; then sed 's/cka-w2/cka-w1/g' /opt/curso/29/metrics-server.yaml | cmp -s /opt/curso/29/metrics-server-practica.yaml -; else sed 's/cka-w2/cka-w1/g' /opt/curso/29/metrics-server.yaml > /opt/curso/29/metrics-server-practica.yaml; fi`);
 if(!install)return;
 const present=await run('controlplane','Consultar Metrics Server existente','test -n "$(kubectl -n kube-system get deployment metrics-server --ignore-not-found -o name)"',60000);
 if(present?.ok===false){
  await execute('controlplane','No sobrescribir una instalación parcial de métricas',`for target in apiservice/v1beta1.metrics.k8s.io clusterrole/system:metrics-server clusterrolebinding/system:metrics-server clusterrolebinding/metrics-server:system:auth-delegator; do test -z "$(kubectl get "$target" --ignore-not-found -o name)"; done; test -z "$(kubectl -n kube-system get service metrics-server --ignore-not-found -o name)"`);
  await execute('controlplane','Instalar las métricas necesarias para HPA','kubectl create --validate=strict -f /opt/curso/29/metrics-server-practica.yaml');
 }else if(present?.ok!==true)throw Error('No se pudo consultar Metrics Server');
 await execute('controlplane','Comprobar Metrics Server sin repararlo',`kubectl -n kube-system get deployment metrics-server -o json | jq -e '.spec.template.spec.containers[0].image=="s2ktux/metrics-server-lab:0.8.0-2"'; kubectl -n kube-system rollout status deployment/metrics-server --timeout=180s; kubectl wait --for=condition=Available apiservice/v1beta1.metrics.k8s.io --timeout=90s`,300000);
}
