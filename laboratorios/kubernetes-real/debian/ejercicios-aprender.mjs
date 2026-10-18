import {API,IMAGEN,aplicar,pod,contenedor,obtener,listo,crearPractica} from './herramientas-practicas.mjs';
import {exigirJSON} from './comprobaciones-json.mjs';
const tasks=[];
const add=(...args)=>tasks.push(crearPractica(...args));
const simple=(number,title,prompt,solution,check,cleanup,negative)=>tasks.push({id:'c'+String(number).padStart(2,'0')+'-inicio',classNumber:number,title,prompt,solution,solutionDisplay:solution,preflight:API,prepare:[API],check:exigirJSON(check),cleanup,negative});
simple(4,'Crear un Deployment sencillo','Crea el Deployment inicio-web en default con una réplica de '+IMAGEN+' y el comando sleep 3600. Consulta su estado.',
 'kubectl create deployment inicio-web --image='+IMAGEN+' -- sleep 3600\nkubectl rollout status deployment/inicio-web\nkubectl get deployments',
 obtener('default','deployment','inicio-web','.spec.replicas==1 and .status.readyReplicas==1 and .spec.template.spec.containers[0].image=="'+IMAGEN+'"'),
 'kubectl delete deployment inicio-web --ignore-not-found','kubectl scale deployment inicio-web --replicas=0');
simple(6,'Crear un namespace','Crea un namespace llamado aprendizaje y comprueba que aparece en el listado. No es necesario crear Pods todavía.',
 'kubectl create namespace aprendizaje\nkubectl get namespaces',obtener('default','namespace','aprendizaje','.status.phase=="Active"'),
 'kubectl delete namespace aprendizaje --ignore-not-found','kubectl delete namespace aprendizaje');
const resources={requests:{cpu:'50m',memory:'16Mi'},limits:{cpu:'200m',memory:'64Mi'}};
add(7,'inicio','Asignar recursos a un Pod','En p07inicio crea el Pod pequeno con '+IMAGEN+' y sleep 3600. Solicitará 50m de CPU y 16Mi de memoria, con límites de 200m y 64Mi.',
 aplicar(pod('p07inicio','pequeno',{containers:[contenedor(undefined,{resources})]}))+'\nkubectl -n p07inicio get pod pequeno',
 obtener('p07inicio','pod','pequeno',listo+' and .spec.containers[0].resources.requests.cpu=="50m" and .spec.containers[0].resources.requests.memory=="16Mi" and .spec.containers[0].resources.limits.cpu=="200m" and .spec.containers[0].resources.limits.memory=="64Mi"'),
 {negative:'kubectl -n p07inicio delete pod pequeno'});
add(8,'inicio','Crear una cuota de Pods','En p08inicio crea una ResourceQuota llamada dos-pods que permita un máximo de dos Pods. En este ejercicio solo crearás la cuota.',
 'kubectl -n p08inicio create quota dos-pods --hard=pods=2\nkubectl -n p08inicio describe quota dos-pods',obtener('p08inicio','resourcequota','dos-pods','.spec.hard.pods=="2"'),{negative:'kubectl -n p08inicio delete quota dos-pods'});
add(9,'inicio','Una comprobación de disponibilidad','En p09inicio crea el Pod listo con '+IMAGEN+'. Su comando creará /tmp/listo y después ejecutará sleep 3600. Añade una readinessProbe que compruebe que ese archivo existe.',
 aplicar(pod('p09inicio','listo',{containers:[contenedor(['sh','-c','touch /tmp/listo; sleep 3600'],{readinessProbe:{exec:{command:['test','-f','/tmp/listo']},periodSeconds:5}})]}))+'\nkubectl -n p09inicio get pod listo',
 obtener('p09inicio','pod','listo',listo+' and .spec.containers[0].readinessProbe.exec.command==["test","-f","/tmp/listo"]'),{negative:'kubectl -n p09inicio delete pod listo'});
add(10,'inicio','Guardar un dato en un ConfigMap','En p10inicio crea el ConfigMap primer-ajuste con la clave MODO y el valor curso. Consulta su contenido; todavía no hace falta conectarlo a un Pod.',
 'kubectl -n p10inicio create configmap primer-ajuste --from-literal=MODO=curso\nkubectl -n p10inicio get configmap primer-ajuste -o yaml',obtener('p10inicio','configmap','primer-ajuste','.data.MODO=="curso"'),{negative:'kubectl -n p10inicio delete configmap primer-ajuste'});
add(11,'inicio','Crear un Secret sencillo','En p11inicio crea el Secret Opaque primera-clave con CLAVE=practica. Son datos de ejemplo; no uses contraseñas personales.',
 'kubectl -n p11inicio create secret generic primera-clave --from-literal=CLAVE=practica\nkubectl -n p11inicio describe secret primera-clave',obtener('p11inicio','secret','primera-clave','.type=="Opaque" and (.data.CLAVE|@base64d)=="practica"'),{negative:'kubectl -n p11inicio delete secret primera-clave'});
export const EJERCICIOS_APRENDER=Object.freeze(tasks);
