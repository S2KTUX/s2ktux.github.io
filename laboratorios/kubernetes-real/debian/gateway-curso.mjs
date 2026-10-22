import {prepararIngress,ordenComprobarIngress} from './ingress-curso.mjs?v=6ceb5bb8f0af85f7';
export const crdsGateway=['gatewayclasses','gateways','grpcroutes','httproutes','referencegrants'].map(name=>name+'.gateway.networking.k8s.io');
export const ordenComprobarGateway=ordenComprobarIngress+'; kubectl -n traefik get deployment traefik -o json | jq -e '+"'any(.spec.template.spec.containers[0].args[]; .==\"--providers.kubernetesgateway\" or .==\"--providers.kubernetesgateway=true\")'";
export async function prepararGateway(run){
 const execute=async(label,command,timeout=240000)=>{const result=await run('controlplane',label,'set -eu; '+command,timeout);if(result?.ok!==true)throw Error('No se ha preparado Gateway API: '+label);};
 await prepararIngress(run);
 const enabled=await run('controlplane','Consultar el proveedor Gateway existente','kubectl -n traefik get deployment traefik -o json | jq -e '+"'any(.spec.template.spec.containers[0].args[]; .==\"--providers.kubernetesgateway\" or .==\"--providers.kubernetesgateway=true\")'",60000);
 if(enabled?.ok!==true&&enabled?.ok!==false)throw Error('No se pudo consultar el proveedor Gateway');
 const objects=crdsGateway.map(name=>'customresourcedefinition/'+name).join(' ');
 // Nunca sobrescribir una instalación parcial ni CRDs editados por el alumno.
 const present=await run('controlplane','Consultar los CRDs de Gateway','test -z "$(kubectl get '+objects+' --ignore-not-found -o name)"',60000);
 if(present?.ok===true){
  const paths=crdsGateway.map((_,i)=>'/opt/curso/15-23/crds/0'+(i+1)+'.yaml');
  await execute('Instalar los CRDs originales de Gateway','kubectl create --validate=strict --request-timeout=120s '+paths.map(path=>'-f '+path).join(' '),300000);
 }else if(present?.ok!==false)throw Error('No se pudo consultar Gateway API');
 await execute('Comprobar los CRDs sin modificarlos','kubectl wait --for=condition=Established --timeout=120s '+objects);
 if(!enabled.ok){
  await execute('Activar Gateway conservando los valores de Traefik','helm upgrade traefik /opt/curso/15-23/traefik-37.1.1-lab1.tgz -n traefik --reuse-values --skip-crds --set providers.kubernetesGateway.enabled=true --set gateway.enabled=false --set gatewayClass.enabled=false && kubectl -n traefik rollout status deployment/traefik --timeout=240s',300000);
 }
 const existing=await run('controlplane','Consultar la GatewayClass','test -n "$(kubectl get gatewayclass traefik --ignore-not-found -o name)"',60000);
 if(existing?.ok===false)await execute('Crear la GatewayClass del laboratorio',`echo '{"apiVersion":"gateway.networking.k8s.io/v1","kind":"GatewayClass","metadata":{"name":"traefik"},"spec":{"controllerName":"traefik.io/gateway-controller"}}' | kubectl create -f -`);
 else if(existing?.ok!==true)throw Error('No se pudo consultar GatewayClass');
 await execute('Comprobar la GatewayClass existente',`kubectl get gatewayclass traefik -o json | jq -e '.spec.controllerName=="traefik.io/gateway-controller"'; kubectl wait --for=condition=Accepted --timeout=120s gatewayclass/traefik`);
 await execute('Comprobar el proveedor Gateway',ordenComprobarGateway);
}
