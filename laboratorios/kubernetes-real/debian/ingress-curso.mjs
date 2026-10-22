import {prepararMaterialesCurso} from './materiales-curso.mjs?v=6deece2f71879ea3';
export const ordenComprobarIngress='image=$(kubectl -n traefik get deployment traefik -o jsonpath=\'{.spec.template.spec.containers[0].image}\'); case "$image" in s2ktux/traefik-lab:3.5.2|docker.io/s2ktux/traefik-lab:3.5.2) ;; *) exit 1;; esac; kubectl -n traefik rollout status deployment/traefik --timeout=180s';
// Solo al preparar una práctica de Ingress. No se instala al arrancar ni se
// repara un controlador que el alumno haya modificado.
export async function prepararIngress(run){
 const execute=async(id,label,command,timeout=240000)=>{const result=await run(id,label,'set -eu; '+command,timeout);if(result?.ok!==true)throw Error('No se ha preparado Ingress: '+label);};
 await execute('controlplane','Comprobar la API antes de preparar Ingress','kubectl get --raw=/readyz --request-timeout=20s');
 const existing=await run('controlplane','Consultar el controlador existente','test -n "$(kubectl get namespace traefik --ignore-not-found -o name)"',60000);
 if(existing?.ok===true){
  await execute('controlplane','Comprobar Traefik sin modificarlo',ordenComprobarIngress);return;
 }
 if(existing?.ok!==false)throw Error('No se pudo consultar Traefik');
 const materials=await run('controlplane','Consultar los materiales locales','test -d /opt/curso',60000);
 if(materials?.ok===true)await execute('controlplane','Verificar los materiales existentes','cd /opt/curso && sha256sum -c SHA256SUMS');
 else if(materials?.ok===false)await prepararMaterialesCurso(run);
 else throw Error('No se pudo consultar el material de Ingress');
 await execute('worker1','Importar Traefik real para la arquitectura del laboratorio','if ! ctr -n k8s.io images ls -q | grep -qx docker.io/s2ktux/traefik-lab:3.5.2; then gzip -dc /mnt/kube-client/images/curso.tar.gz | ctr -n k8s.io images import --no-unpack --platform=linux/386 -; fi',300000);
 await execute('controlplane','Evitar sobrescribir controladores ajenos','for target in clusterrole/traefik clusterrolebinding/traefik ingressclass/traefik; do test -z "$(kubectl get "$target" --ignore-not-found -o name)"; done');
 // Ingress es una API nativa. No necesita instalar quince CRDs ni activar
 // IngressRoute/Middleware, que no se usan en estas prácticas del curso.
 await execute('controlplane','Instalar el controlador Ingress del curso','helm install traefik /opt/curso/15-23/traefik-37.1.1-lab1.tgz --namespace traefik --create-namespace --skip-crds -f /opt/curso/15-23/values.yaml --set providers.kubernetesCRD.enabled=false && kubectl -n traefik rollout status deployment/traefik --timeout=240s',300000);
}
