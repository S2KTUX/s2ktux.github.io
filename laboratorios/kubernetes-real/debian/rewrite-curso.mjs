import {prepararIngress,ordenComprobarIngress} from './ingress-curso.mjs?v=6ceb5bb8f0af85f7';
import {prepararCRDsCurso} from './crds-curso.mjs?v=60ae2c3890fe4db2';
const names=['ingressroutes','ingressroutetcps','ingressrouteudps','middlewares','middlewaretcps','serverstransports','serverstransporttcps','tlsoptions','tlsstores','traefikservices'].map(name=>name+'.traefik.io');
export async function prepararRewrite(run){
 await prepararIngress(run);
 const provider=`kubectl -n traefik get deployment traefik -o json | jq -e 'any(.spec.template.spec.containers[0].args[]; .=="--providers.kubernetescrd" or .=="--providers.kubernetescrd=true")'`;
 const enabled=await run('controlplane','Consultar el proveedor CRD existente','set -eu; '+provider,60000);
 if(enabled?.ok!==true&&enabled?.ok!==false)throw Error('No se pudo consultar el proveedor CRD');
 await prepararCRDsCurso(run,names,names.map((_,i)=>'/opt/curso/15-23/crds/'+String(i+6).padStart(2,'0')+'.yaml'),{allowInstall:!enabled.ok});
 if(!enabled.ok){
  const result=await run('controlplane','Activar las extensiones de Traefik solo para rewrite','set -eu; helm upgrade traefik /opt/curso/15-23/traefik-37.1.1-lab1.tgz -n traefik --reuse-values --skip-crds --set providers.kubernetesCRD.enabled=true && kubectl -n traefik rollout status deployment/traefik --timeout=240s',300000);
  if(result?.ok!==true)throw Error('No se pudo activar rewrite');
 }
 const checked=await run('controlplane','Comprobar el controlador de rewrite','set -eu; '+ordenComprobarIngress+'; '+provider,240000);
 if(checked?.ok!==true)throw Error('El controlador de rewrite no está disponible');
}
