import {exigirJSON} from './comprobaciones-json.mjs';
const image='busybox:1.37.0-musl';
const api='kubectl get --raw=/readyz --request-timeout=20s';
const quote=value=>"'"+value.replaceAll("'","'\\''")+"'";
const readableApplications=new Map();
function yaml(value,indent=0){
 const pad=' '.repeat(indent);
 if(Array.isArray(value))return value.map(item=>{
  if(item&&typeof item==='object'){if(!Object.keys(item).length)return pad+'- '+(Array.isArray(item)?'[]':'{}');const lines=yaml(item,indent+2).split('\n');lines[0]=pad+'- '+lines[0].trimStart();return lines.join('\n');}
  return pad+'- '+JSON.stringify(item);
 }).join('\n');
 return Object.entries(value).map(([key,item])=>item&&typeof item==='object'?pad+key+':'+(Object.keys(item).length?'\n'+yaml(item,indent+2):Array.isArray(item)?' []':' {}'):pad+key+': '+JSON.stringify(item)).join('\n');
}
const apply=object=>{
 const command="printf '%s\\n' "+quote(JSON.stringify(object))+" | kubectl apply -f -";
 readableApplications.set(command,"kubectl apply -f - <<'EOF'\n"+yaml(object)+'\nEOF');return command;
};
const container=command=>({name:'app',image,imagePullPolicy:'Never',command});
const http=text=>['sh','-c',"mkdir -p /www; printf '%s\\n' "+quote(text)+" >/www/index.html; exec httpd -f -p 8080 -h /www"];
const template=(name,command)=>({metadata:{labels:{app:name}},spec:{containers:[container(command)]}});
const deploy=(name,text,replicas=1)=>apply({apiVersion:'apps/v1',kind:'Deployment',metadata:{name,namespace:'default'},spec:{replicas,selector:{matchLabels:{app:name}},template:template(name,http(text))}});
const absent=(kind,name)=>'test -z "$(kubectl -n default get '+kind+' '+name+' --ignore-not-found -o name)"';
const rollout=name=>'kubectl -n default rollout status deployment/'+name+' --timeout=180s';
const serving=(name,text)=>'test "$(kubectl -n default exec deployment/'+name+' -- wget -T 5 -qO- http://127.0.0.1:8080/)" = '+quote(text);
const ready=name=>'kubectl -n default wait --for=condition=Ready pod/'+name+' --timeout=120s';
const cleanupResource=(kind,name)=>'kubectl -n default delete '+kind+' '+name+' --ignore-not-found --wait=true --timeout=90s';
const entries=[];
function add(classNumber,letter,title,prompt,solution,check,options={}){
 let solutionDisplay=solution;for(const [command,readable]of readableApplications)solutionDisplay=solutionDisplay.split(command).join(readable);
 entries.push(Object.freeze({id:'c'+String(classNumber).padStart(2,'0')+'-'+letter,classNumber,title,prompt,solution,solutionDisplay,preflight:api,cleanup:options.cleanup||'',negative:options.negative,validation:'external-report',...options,check:exigirJSON(check),prepare:Object.freeze([api,...options.prepare||[]])}));
}
add(0,'a','Reconocer los nodos',
 'Consulta los nodos del clúster y guarda el listado completo en /root/nodos-curso.txt. No cambies su configuración.',
 'kubectl get nodes\nkubectl get nodes > /root/nodos-curso.txt\ncat /root/nodos-curso.txt',
 'test -s /root/nodos-curso.txt && kubectl get nodes -o json | jq -e --rawfile answer /root/nodos-curso.txt \'[.items[].metadata.name] as $names | ($names|length)>0 and all($names[]; . as $name | $answer|split("\\n")|any(split(" ")|map(select(length>0))|.[0]==$name))\'',
 {cleanup:'rm -f /root/nodos-curso.txt',negative:"echo inexistente >/root/nodos-curso.txt"});
add(0,'b','Ver los componentes del clúster',
 'Consulta los Pods de kube-system. Guarda el listado completo en /root/control-plane.txt y localiza los nombres que empiezan por kube-apiserver, etcd, kube-scheduler y kube-controller-manager. No modifiques esos Pods.',
 'kubectl get pods -n kube-system\nkubectl get pods -n kube-system > /root/control-plane.txt\ncat /root/control-plane.txt',
 'test -s /root/control-plane.txt && for component in kube-apiserver etcd kube-scheduler kube-controller-manager; do grep -q "^$component-" /root/control-plane.txt || exit 1; done',
 {cleanup:'rm -f /root/control-plane.txt',negative:"echo coredns >/root/control-plane.txt"});
add(1,'a','Comprobar el laboratorio',
 'Comprueba que los nodos están Ready. Guarda su listado completo en /root/laboratorio-nodos.txt y la respuesta de salud de la API en /root/laboratorio-api.txt.',
 'kubectl get nodes > /root/laboratorio-nodos.txt\nkubectl get --raw=/readyz > /root/laboratorio-api.txt\ncat /root/laboratorio-nodos.txt\ncat /root/laboratorio-api.txt',
 'test "$(cat /root/laboratorio-api.txt)" = ok && test "$('+api+')" = ok && kubectl get nodes -o json | jq -e --rawfile answer /root/laboratorio-nodos.txt \'(.items|length)>0 and all(.items[]; any(.status.conditions[]; .type=="Ready" and .status=="True")) and all(.items[].metadata.name; . as $name | $answer|split("\\n")|any(split(" ")|map(select(length>0))|.[0]==$name))\'',
 {cleanup:'rm -f /root/laboratorio-nodos.txt /root/laboratorio-api.txt',negative:"echo error >/root/laboratorio-api.txt"});
add(1,'b','Comprobar los servicios de Linux',
 'En cka-cp1 consulta kubelet y containerd. Guarda sus dos estados en /root/servicios-laboratorio.txt. Ambos deben estar activos.',
 'systemctl is-active kubelet containerd\nsystemctl is-active kubelet containerd > /root/servicios-laboratorio.txt\ncat /root/servicios-laboratorio.txt',
 'systemctl is-active --quiet kubelet && systemctl is-active --quiet containerd && test "$(cat /root/servicios-laboratorio.txt)" = "$(printf \'active\\nactive\\n\')"',
 {cleanup:'rm -f /root/servicios-laboratorio.txt',negative:"printf '%s\\n' inactive active >/root/servicios-laboratorio.txt"});
add(2,'a','Tu primer Pod',
 'En default crea el Pod saludo con '+image+'. Debe escribir Hola Kubernetes una sola vez y terminar correctamente, sin reiniciarse.',
 'kubectl -n default run saludo --image='+image+' --image-pull-policy=Never --restart=Never --command -- sh -c \'echo Hola Kubernetes\'\nkubectl -n default wait --for=jsonpath=\'{.status.phase}\'=Succeeded pod/saludo --timeout=120s',
 'kubectl -n default get pod saludo -o json | jq -e \'.spec.restartPolicy=="Never" and .spec.containers[0].image=="'+image+'" and .status.phase=="Succeeded" and .status.containerStatuses[0].state.terminated.exitCode==0\' && test "$(kubectl -n default logs saludo)" = \'Hola Kubernetes\'',
 {prepare:[absent('pod','saludo')],cleanup:cleanupResource('pod','saludo'),negative:cleanupResource('pod','saludo')});
add(2,'b','Trabajar dentro del contenedor',
 'En default crea el Pod utilidades con '+image+' y sleep 3600. Dentro de su contenedor crea /tmp/mensaje.txt con el contenido PRACTICA_PODS.',
 'kubectl -n default run utilidades --image='+image+' --image-pull-policy=Never --command -- sleep 3600\n'+ready('utilidades')+'\nkubectl -n default exec utilidades -- sh -c \'echo PRACTICA_PODS >/tmp/mensaje.txt\'',
 'kubectl -n default get pod utilidades -o json | jq -e \'.spec.containers[0].image=="'+image+'" and any(.status.conditions[]?; .type=="Ready" and .status=="True")\' && test "$(kubectl -n default exec utilidades -- cat /tmp/mensaje.txt)" = PRACTICA_PODS',
 {prepare:[absent('pod','utilidades')],cleanup:cleanupResource('pod','utilidades'),negative:"kubectl -n default exec utilidades -- sh -c 'echo ERRONEO >/tmp/mensaje.txt'"});
const rs=(name,replicas)=>({apiVersion:'apps/v1',kind:'ReplicaSet',metadata:{name,namespace:'default'},spec:{replicas,selector:{matchLabels:{app:name}},template:template(name,['sleep','3600'])}});
add(3,'a','Mantener dos réplicas',
 'En default crea el ReplicaSet replicas con dos Pods Ready de '+image+' y sleep 3600. Su selector debe coincidir con la etiqueta app=replicas de los Pods.',
 apply(rs('replicas',2))+'\nkubectl -n default wait --for=jsonpath=\'{.status.readyReplicas}\'=2 rs/replicas --timeout=180s',
 'kubectl -n default get rs replicas -o json | jq -e \'.spec.replicas==2 and .status.readyReplicas==2 and .spec.selector.matchLabels.app=="replicas" and .spec.template.metadata.labels.app=="replicas" and .spec.template.spec.containers[0].image=="'+image+'"\'',
 {prepare:[absent('rs','replicas')],cleanup:cleanupResource('rs','replicas'),negative:'kubectl -n default scale rs replicas --replicas=1'});
add(3,'b','Escalar sin sustituir el controlador',
 'El ReplicaSet taller de default tiene una réplica. Déjalo con tres réplicas Ready, conservando su identidad, selector e imagen.',
 'kubectl -n default scale rs taller --replicas=3\nkubectl -n default wait --for=jsonpath=\'{.status.readyReplicas}\'=3 rs/taller --timeout=180s',
 'kubectl -n default get rs taller -o json | jq -e --arg uid "$(cat /tmp/practica-c03-b.uid)" \'.metadata.uid==$uid and .spec.replicas==3 and .status.readyReplicas==3 and .spec.selector.matchLabels.app=="taller" and .spec.template.spec.containers[0].image=="'+image+'"\'',
 {prepare:[absent('rs','taller'),apply(rs('taller',1)),'kubectl -n default get rs taller -o jsonpath=\'{.metadata.uid}\' >/tmp/practica-c03-b.uid'],cleanup:cleanupResource('rs','taller'),negative:'kubectl -n default scale rs taller --replicas=2'});
add(4,'a','Desplegar una aplicación',
 'En default crea el Deployment web con dos réplicas Ready de '+image+'. Cada réplica debe servir WEB_LISTA por HTTP en TCP 8080 desde /www.',
 deploy('web','WEB_LISTA',2)+'\n'+rollout('web'),
 'kubectl -n default get deployment web -o json | jq -e \'.spec.replicas==2 and .status.readyReplicas==2 and .status.observedGeneration==.metadata.generation and .spec.template.spec.containers[0].image=="'+image+'"\' && '+serving('web','WEB_LISTA'),
 {prepare:[absent('deployment','web')],cleanup:cleanupResource('deployment','web'),negative:'kubectl -n default scale deployment web --replicas=1'});
add(4,'b','Actualizar y volver a la revisión anterior',
 'El Deployment versiones de default sirve VERSION_UNO. Actualiza su plantilla para servir VERSION_DOS y guarda esa respuesta en /root/version-dos.txt. Después vuelve a la revisión anterior. Debe conservar su identidad, dos réplicas Ready y servir VERSION_UNO.',
 deploy('versiones','VERSION_DOS',2)+'\n'+rollout('versiones')+'\nkubectl -n default exec deployment/versiones -- wget -T 5 -qO- http://127.0.0.1:8080/ >/root/version-dos.txt\nkubectl -n default rollout undo deployment/versiones\n'+rollout('versiones'),
 'test "$(cat /root/version-dos.txt)" = VERSION_DOS && kubectl -n default get deployment versiones -o json | jq -e --arg uid "$(cat /tmp/practica-c04-b.uid)" \'.metadata.uid==$uid and .spec.replicas==2 and .status.readyReplicas==2 and .status.observedGeneration==.metadata.generation\' && '+serving('versiones','VERSION_UNO'),
 {prepare:[absent('deployment','versiones'),deploy('versiones','VERSION_UNO',2),rollout('versiones'),'kubectl -n default get deployment versiones -o jsonpath=\'{.metadata.uid}\' >/tmp/practica-c04-b.uid'],cleanup:cleanupResource('deployment','versiones')+'; rm -f /root/version-dos.txt',negative:"printf '%s\\n' VERSION_UNO >/root/version-dos.txt"});
const backend=(name,text)=>[absent('deployment',name),absent('service',name),deploy(name,text),rollout(name)];
add(5,'a','Acceder mediante un Service',
 'En default ya existe web-servicio: sus Pods llevan app=web-servicio y sirven WEB_LISTA en TCP 8080. Crea el Service ClusterIP web-servicio, con puerto 80 y destino 8080. Debe responder por web-servicio.default.svc.cluster.local.',
 'kubectl -n default expose deployment web-servicio --port=80 --target-port=8080\nkubectl -n default exec deployment/web-servicio -- wget -T 5 -qO- http://web-servicio.default.svc.cluster.local/',
 'kubectl -n default get service web-servicio -o json | jq -e \'.spec.type=="ClusterIP" and any(.spec.ports[]; .port==80)\' && test "$(kubectl -n default exec deployment/web-servicio -- wget -T 5 -qO- http://web-servicio.default.svc.cluster.local/)" = WEB_LISTA',
 {prepare:backend('web-servicio','WEB_LISTA'),cleanup:cleanupResource('deployment,service','web-servicio'),negative:'kubectl -n default patch service web-servicio --type=merge -p \'{"spec":{"ports":[{"port":80,"targetPort":8081}]}}\''});
add(5,'b','Acceder por el puerto del nodo',
 'En default la aplicación externa lleva app=externa y sirve EXTERNA en TCP 8080. Publícala con el Service NodePort externa: puerto 80, destino 8080 y NodePort 30081. Debe responder desde la IP del nodo.',
 'kubectl -n default expose deployment externa --type=NodePort --port=80 --target-port=8080\nkubectl -n default patch service externa --type=merge -p \'{"spec":{"ports":[{"port":80,"targetPort":8080,"nodePort":30081}]}}\'\nnodeip=$(kubectl get node cka-cp1 -o jsonpath=\'{.status.addresses[?(@.type=="InternalIP")].address}\')\ncurl --max-time 10 "http://$nodeip:30081/"',
 'kubectl -n default get service externa -o json | jq -e \'.spec.type=="NodePort" and any(.spec.ports[]; .port==80 and .nodePort==30081)\' && nodeip=$(kubectl get node cka-cp1 -o jsonpath=\'{.status.addresses[?(@.type=="InternalIP")].address}\') && test "$(curl -fsS --max-time 10 "http://$nodeip:30081/")" = EXTERNA',
 {prepare:backend('externa','EXTERNA'),cleanup:cleanupResource('deployment,service','externa'),negative:'kubectl -n default patch service externa --type=merge -p \'{"spec":{"ports":[{"port":80,"targetPort":8081,"nodePort":30081}]}}\''});
add(6,'a','Separar recursos por namespace',
 'Crea equipo y dentro el Pod utilidades con '+image+', sleep 3600 y app=utilidades. Debe quedar Ready.',
 'kubectl create namespace equipo\nkubectl -n equipo wait --for=create serviceaccount/default --timeout=90s\nkubectl -n equipo run utilidades --image='+image+' --image-pull-policy=Never --labels=app=utilidades --command -- sleep 3600\nkubectl -n equipo wait --for=condition=Ready pod/utilidades --timeout=120s',
 'kubectl -n equipo get pod utilidades -o json | jq -e \'.metadata.labels.app=="utilidades" and .spec.containers[0].image=="'+image+'" and any(.status.conditions[]?; .type=="Ready" and .status=="True")\'',
 {prepare:['test -z "$(kubectl get ns equipo --ignore-not-found -o name)"'],cleanup:'kubectl delete namespace equipo --ignore-not-found --wait=true --timeout=120s',negative:'kubectl -n equipo label pod utilidades app=incorrecta --overwrite'});
add(6,'b','Dos Pods con el mismo nombre',
 'Crea desarrollo y pruebas. En cada namespace crea herramienta con '+image+' y sleep 3600. Ambos Pods deben estar Ready y llevar entorno con el nombre de su namespace.',
 'for ns in desarrollo pruebas; do\n  kubectl create namespace "$ns"\n  kubectl -n "$ns" wait --for=create serviceaccount/default --timeout=90s\n  kubectl -n "$ns" run herramienta --image='+image+' --image-pull-policy=Never --labels="entorno=$ns" --command -- sleep 3600\n  kubectl -n "$ns" wait --for=condition=Ready pod/herramienta --timeout=120s\ndone',
 'for ns in desarrollo pruebas; do kubectl -n "$ns" get pod herramienta -o json | jq -e --arg ns "$ns" \'.metadata.namespace==$ns and .metadata.labels.entorno==$ns and .spec.containers[0].image=="'+image+'" and any(.status.conditions[]?; .type=="Ready" and .status=="True")\' || exit 1; done',
 {prepare:['test -z "$(kubectl get ns desarrollo pruebas --ignore-not-found -o name)"'],cleanup:'kubectl delete namespace desarrollo pruebas --ignore-not-found --wait=true --timeout=120s',negative:'kubectl -n pruebas label pod herramienta entorno=desarrollo --overwrite'});
export const EJERCICIOS_INICIALES=Object.freeze(entries);
