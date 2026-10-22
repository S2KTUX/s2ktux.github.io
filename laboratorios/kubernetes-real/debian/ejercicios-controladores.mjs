import {IMAGEN,q,aplicar,contenedor,obtener,listo,crearPractica,esperarPod} from './herramientas-practicas.mjs?v=b995634347ea1c07';
import {equivalenciaJQ} from './criterios-equivalentes.mjs';
const tasks=[],add=(...args)=>tasks.push(crearPractica(...args));
const controller=(kind,ns,name,spec={})=>({apiVersion:'apps/v1',kind,metadata:{namespace:ns,name},spec:{selector:{matchLabels:{app:name}},template:{metadata:{labels:{app:name}},spec:{terminationGracePeriodSeconds:1,containers:[contenedor()]}},...spec}});
const rollout=(ns,kind,name)=>`kubectl -n ${ns} rollout status ${kind}/${name} --timeout=240s`;
const ds=(ns,extra={})=>controller('DaemonSet',ns,'agente',{template:{metadata:{labels:{app:'agente'}},spec:{terminationGracePeriodSeconds:1,containers:[contenedor()],...extra}}});
add(16,'a','Un agente por nodo · I',
 'En p16a crea el DaemonSet agente con '+IMAGEN+' y sleep 3600. No añadas tolerations ni selecciones un nodo concreto. Debe ejecutar un Pod listo en cada nodo que admita aplicaciones; en este laboratorio será cka-w1.',
 aplicar(ds('p16a'))+'\n'+rollout('p16a','ds','agente')+'\nkubectl -n p16a get pods -o wide',
 obtener('p16a','ds','agente','.status.observedGeneration==.metadata.generation and .status.desiredNumberScheduled==1 and .status.numberReady==1 and .spec.template.spec.containers[0].image=="'+IMAGEN+'"')+' && '+obtener('p16a','pods','-l app=agente','(.items|length)==1 and (.items[0]|.spec.nodeName=="cka-w1" and '+listo+')'),
 {negative:'kubectl -n p16a delete ds agente'});
const cpTolerance={key:'node-role.kubernetes.io/control-plane',operator:'Exists',effect:'NoSchedule'};
add(16,'b','Incluir el control plane · II',
 'En p16b crea el DaemonSet agente con '+IMAGEN+' y sleep 3600. Debe tener un Pod listo en cka-cp1 y otro en cka-w1. Conserva el taint del control plane: permite la entrada mediante una toleration en el DaemonSet.',
 aplicar(ds('p16b',{tolerations:[cpTolerance]}))+'\n'+rollout('p16b','ds','agente')+'\nkubectl -n p16b get pods -o wide',
 obtener('p16b','ds','agente','.status.observedGeneration==.metadata.generation and .status.desiredNumberScheduled==2 and .status.numberReady==2 and (.spec.template.spec.tolerations|length)>0')+' && '+obtener('p16b','pods','-l app=agente','(.items|length)==2 and ([.items[].spec.nodeName]|sort)==["cka-cp1","cka-w1"] and all(.items[]; '+listo+')')+' && '+obtener('default','node','cka-cp1','any(.spec.taints[]?; .key=="node-role.kubernetes.io/control-plane" and .effect=="NoSchedule")'),
 {negative:'kubectl -n p16b delete ds agente'});
const headless=ns=>({apiVersion:'v1',kind:'Service',metadata:{namespace:ns,name:'identidad'},spec:{clusterIP:'None',selector:{app:'web'},ports:[{name:'http',port:8080,targetPort:8080}]}});
const stateful=(ns,persistent=false)=>controller('StatefulSet',ns,'web',{serviceName:'identidad',replicas:2,template:{metadata:{labels:{app:'web'}},spec:{terminationGracePeriodSeconds:1,containers:[contenedor(['sh','-c','mkdir -p /www; hostname > /www/index.html; exec httpd -f -p 8080 -h /www'],persistent?{volumeMounts:[{name:'datos',mountPath:'/datos'}]}:{})]}},...(persistent?{volumeClaimTemplates:[{metadata:{name:'datos'},spec:{storageClassName:'local-path',accessModes:['ReadWriteOnce'],resources:{requests:{storage:'16Mi'}}}}]}:{})});
const readySts=ns=>obtener(ns,'sts','web','.spec.serviceName=="identidad" and .spec.replicas==2 and .status.readyReplicas==2 and .status.observedGeneration==.metadata.generation')+' && '+obtener(ns,'svc','identidad','.spec.clusterIP=="None" and .spec.selector.app=="web"')+' && '+obtener(ns,'pods','-l app=web','([.items[].metadata.name]|sort)==["web-0","web-1"] and all(.items[]; '+listo+')');
add(17,'a','Identidad estable · I',
 'En p17a crea un Service headless llamado identidad y un StatefulSet web con dos réplicas de '+IMAGEN+'. Cada Pod debe servir su propio nombre por HTTP en 8080. Deben llamarse web-0 y web-1. Comprueba el acceso de web-0 a web-1 usando web-1.identidad.p17a.svc.cluster.local.',
 aplicar(headless('p17a'))+'\n'+aplicar(stateful('p17a'))+'\n'+rollout('p17a','sts','web')+'\nkubectl -n p17a get pods\nkubectl -n p17a exec web-0 -- wget -qO- http://web-1.identidad.p17a.svc.cluster.local:8080/',
 readySts('p17a')+' && test "$(kubectl -n p17a exec web-0 -- wget -T 10 -qO- http://web-1.identidad.p17a.svc.cluster.local:8080/)" = web-1',
 {negative:'kubectl -n p17a scale sts web --replicas=1'});
add(17,'b','Un volumen para cada réplica · II',
 'En p17b crea identidad y web como en el ejercicio anterior, pero con un volumeClaimTemplate datos: 16Mi, ReadWriteOnce y StorageClass local-path. Monta el volumen de cada Pod en /datos. Guarda PRIMERO en /datos/estado de web-0 y SEGUNDO en el de web-1. Borra web-0 y comprueba que reaparece con sus datos y que ambos Pods tienen PVC distintos.',
 aplicar(headless('p17b'))+'\n'+aplicar(stateful('p17b',true))+'\n'+rollout('p17b','sts','web')+"\nkubectl -n p17b exec web-0 -- sh -c 'echo PRIMERO > /datos/estado'\nkubectl -n p17b exec web-1 -- sh -c 'echo SEGUNDO > /datos/estado'\nkubectl -n p17b delete pod web-0\nkubectl -n p17b wait --for=create pod/web-0 --timeout=180s\n"+esperarPod('p17b','web-0')+'\nkubectl -n p17b exec web-0 -- cat /datos/estado\nkubectl -n p17b get pvc',
 readySts('p17b')+' && '+obtener('p17b','pvc','',equivalenciaJQ+'(.items|length)==2 and all(.items[]; .status.phase=="Bound" and .spec.storageClassName=="local-path" and (.spec.accessModes|index("ReadWriteOnce"))!=null and (.spec.resources.requests.storage|equivale(16777216))) and ([.items[].spec.volumeName]|unique|length)==2')+' && test "$(kubectl -n p17b exec web-0 -- cat /datos/estado)" = PRIMERO && test "$(kubectl -n p17b exec web-1 -- cat /datos/estado)" = SEGUNDO',
 {requirements:['local-path'],negative:"kubectl -n p17b exec web-1 -- sh -c 'echo INCORRECTO > /datos/estado'"});
const jobSpec={backoffLimit:2,template:{spec:{restartPolicy:'Never',containers:[contenedor(['echo','JOB_OK'])]}}};
const job=(ns,name)=>({apiVersion:'batch/v1',kind:'Job',metadata:{namespace:ns,name},spec:jobSpec});
add(18,'a','Una tarea que termina · I',
 'En p18a crea el Job saludo con '+IMAGEN+'. Debe ejecutar echo JOB_OK una vez y terminar correctamente. Consulta sus logs.',
 aplicar(job('p18a','saludo'))+'\nkubectl -n p18a wait --for=condition=Complete job/saludo --timeout=180s\nkubectl -n p18a logs job/saludo',
 obtener('p18a','job','saludo','.status.succeeded==1 and any(.status.conditions[]?; .type=="Complete" and .status=="True") and .spec.template.spec.containers[0].image=="'+IMAGEN+'"')+' && test "$(kubectl -n p18a logs job/saludo)" = JOB_OK',
 {negative:'kubectl -n p18a delete job saludo'});
const cron={apiVersion:'batch/v1',kind:'CronJob',metadata:{namespace:'p18b',name:'programado'},spec:{schedule:'*/5 * * * *',concurrencyPolicy:'Forbid',suspend:false,jobTemplate:{spec:jobSpec}}};
add(18,'b','Programar y ejecutar una tarea · II',
 'En p18b crea el CronJob programado: cada cinco minutos, con '+IMAGEN+' y echo JOB_OK. Si la ejecución anterior no ha terminado, no debe empezar otra. Crea desde él un Job manual llamado prueba y comprueba que termina. Después suspende el CronJob sin borrarlo ni eliminar prueba.',
 aplicar(cron)+'\nkubectl -n p18b create job prueba --from=cronjob/programado\nkubectl -n p18b wait --for=condition=Complete job/prueba --timeout=180s\nkubectl -n p18b logs job/prueba\nkubectl -n p18b patch cronjob programado --type=merge -p '+q('{"spec":{"suspend":true}}'),
 obtener('p18b','cronjob','programado','.spec.schedule=="*/5 * * * *" and .spec.concurrencyPolicy=="Forbid" and .spec.suspend==true and .spec.jobTemplate.spec.template.spec.containers[0].image=="'+IMAGEN+'"')+' && '+obtener('p18b','job','prueba','.status.succeeded==1 and .metadata.annotations["cronjob.kubernetes.io/instantiate"]=="manual" and .spec.template.spec.containers[0].command==["echo","JOB_OK"]')+' && test "$(kubectl -n p18b logs job/prueba)" = JOB_OK',
 {negative:'kubectl -n p18b patch cronjob programado --type=merge -p '+q('{"spec":{"suspend":false}}')});
export const EJERCICIOS_CONTROLADORES=Object.freeze(tasks);
