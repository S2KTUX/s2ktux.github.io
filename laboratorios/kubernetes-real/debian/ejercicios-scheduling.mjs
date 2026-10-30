import {IMAGEN,aplicar,pod,obtener,listo,crearPractica,esperarPod,q} from './herramientas-practicas.mjs?v=10519a9c2390f8e7';
const tasks=[],add=(...args)=>tasks.push(crearPractica(...args));
const label19='p19a.s2ktux.local/disco',labelAffinity='p19b.s2ktux.local/disco';
const nodeLabel=(key,value)=>`kubectl label node cka-w1 ${key}=${value}`;
const labelAbsent=key=>`test -z "$(kubectl get node cka-w1 -o json | jq -r ${q('.metadata.labels["'+key+'"] // ""')})"`;
const placed=(ns,name,extra='true')=>obtener(ns,'pod',name,listo+' and .spec.nodeName=="cka-w1" and .spec.containers[0].image=="'+IMAGEN+'" and ('+extra+')');
add(19,'a','nodeSelector · I',
 `Etiqueta cka-w1 con ${label19}=ssd. En p19a crea el Pod seleccionado con ${IMAGEN} y sleep 3600. Su nodeSelector debe usar esa etiqueta y el Pod debe quedar listo en el worker.`,
 nodeLabel(label19,'ssd')+'\n'+aplicar(pod('p19a','seleccionado',{nodeSelector:{[label19]:'ssd'}}))+'\n'+esperarPod('p19a','seleccionado')+'\nkubectl -n p19a get pods -o wide',
 obtener('default','node','cka-w1','.metadata.labels["'+label19+'"]=="ssd"')+' && '+placed('p19a','seleccionado','.spec.nodeSelector["'+label19+'"]=="ssd"'),
 {prepare:[labelAbsent(label19)],negative:'kubectl -n p19a delete pod seleccionado',cleanup:`kubectl label node cka-w1 ${label19}-`});
const expression={key:labelAffinity,operator:'In',values:['ssd','nvme']};
// Una lista In y dos términos OR equivalentes aceptan los mismos discos.
export const discosRequeridosJQ='(.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms // []) as $terms | ($terms|length)>0 and all($terms[]; (.matchFields // []|length)==0 and (.matchExpressions|length)==1 and .matchExpressions[0].key=="'+labelAffinity+'" and .matchExpressions[0].operator=="In" and (.matchExpressions[0].values|length)>0) and ([$terms[].matchExpressions[0].values[]]|unique)==["nvme","ssd"]';
add(19,'b','Node Affinity · II',
 `Etiqueta cka-w1 con ${labelAffinity}=ssd. En p19b crea flexible con ${IMAGEN} y sleep 3600. Utiliza Node Affinity obligatoria para admitir nodos cuya etiqueta ${labelAffinity} sea ssd o nvme. No uses nodeSelector ni nodeName para sustituir esa regla. Debe quedar listo.`,
 nodeLabel(labelAffinity,'ssd')+'\n'+aplicar(pod('p19b','flexible',{affinity:{nodeAffinity:{requiredDuringSchedulingIgnoredDuringExecution:{nodeSelectorTerms:[{matchExpressions:[expression]}]}}}}))+'\n'+esperarPod('p19b','flexible')+'\nkubectl -n p19b get pods -o wide',
 placed('p19b','flexible',discosRequeridosJQ),
 {prepare:[labelAbsent(labelAffinity)],negative:'kubectl -n p19b delete pod flexible',cleanup:`kubectl label node cka-w1 ${labelAffinity}-`});
add(19,'c','Asignación manual · I',
 `En p19c crea manual con ${IMAGEN} y sleep 3600. Asígnalo directamente a cka-w1 mediante nodeName, sin nodeSelector ni affinity. Comprueba en qué nodo se ejecuta.`,
 aplicar(pod('p19c','manual',{nodeName:'cka-w1'}))+'\n'+esperarPod('p19c','manual')+'\nkubectl -n p19c get pods -o wide',
 placed('p19c','manual','(.spec.nodeSelector // {}|length)==0 and (.spec.affinity // {}|length)==0 and (.spec.schedulerName // "default-scheduler")=="default-scheduler"'),
 {negative:'kubectl -n p19c delete pod manual'});
const cpKey='node-role.kubernetes.io/control-plane';
add(20,'a','Tolerar el control plane · I',
 `En p20a crea permitido con ${IMAGEN} y sleep 3600. Debe ejecutarse en cka-cp1 con un nodeSelector y una toleration para ${cpKey}:NoSchedule. No quites ni cambies el taint del nodo.`,
 aplicar(pod('p20a','permitido',{nodeSelector:{'kubernetes.io/hostname':'cka-cp1'},tolerations:[{key:cpKey,operator:'Exists',effect:'NoSchedule'}]}))+'\n'+esperarPod('p20a','permitido')+'\nkubectl -n p20a get pods -o wide',
 obtener('default','node','cka-cp1','any(.spec.taints[]?; .key=="'+cpKey+'" and .effect=="NoSchedule")')+' && '+obtener('p20a','pod','permitido',listo+' and .spec.nodeName=="cka-cp1" and .spec.nodeSelector["kubernetes.io/hostname"]=="cka-cp1" and any(.spec.tolerations[]?; (.key=="'+cpKey+'" or ((.key // "")=="" and .operator=="Exists")) and ((.effect // "")=="" or .effect=="NoSchedule") and (.operator=="Exists" or ((.operator // "Equal")=="Equal" and (.value // "")=="")))'),
 {negative:'kubectl -n p20a delete pod permitido'});
const team='p20b.s2ktux.local/equipo';
add(20,'b','Toleration y selección · II',
 `Etiqueta cka-w1 con ${team}=curso y añade el taint ${team}=curso:NoSchedule. En p20b crea equipo con ${IMAGEN} y sleep 3600: un nodeSelector lo dirigirá al worker y una toleration le permitirá entrar. Cuando esté listo, quita únicamente ese taint de práctica para que no impida realizar otros ejercicios. Conserva el Pod y la etiqueta.`,
 nodeLabel(team,'curso')+`\nkubectl taint node cka-w1 ${team}=curso:NoSchedule\n`+aplicar(pod('p20b','equipo',{nodeSelector:{[team]:'curso'},tolerations:[{key:team,operator:'Equal',value:'curso',effect:'NoSchedule'}]}))+'\n'+esperarPod('p20b','equipo')+`\nkubectl taint node cka-w1 ${team}:NoSchedule-`,
 obtener('default','node','cka-w1','.metadata.labels["'+team+'"]=="curso" and all(.spec.taints[]?; .key!="'+team+'")')+' && '+placed('p20b','equipo','.spec.nodeSelector["'+team+'"]=="curso" and any(.spec.tolerations[]?; (.key=="'+team+'" or ((.key // "")=="" and .operator=="Exists")) and ((.effect // "")=="" or .effect=="NoSchedule") and (.operator=="Exists" or ((.operator // "Equal")=="Equal" and .value=="curso")))'),
 {prepare:[labelAbsent(team),obtener('default','node','cka-w1','all(.spec.taints[]?; .key!="'+team+'")')],negative:'kubectl -n p20b delete pod equipo',cleanup:`kubectl label node cka-w1 ${team}-`});
export const EJERCICIOS_SCHEDULING=Object.freeze(tasks.map(task=>Object.freeze({...task,diagnostics:[
 {check:task.check,message:({
  'c19-a':'seleccionado debe estar listo en cka-w1, con el nodeSelector y la etiqueta solicitados.',
  'c19-b':'flexible no cumple la afinidad obligatoria solicitada o todavía no está listo en cka-w1.',
  'c19-c':'manual debe estar listo en cka-w1, sin nodeSelector ni affinity.',
  'c20-a':'Revisa el Pod permitido y conserva el taint original del control plane.',
  'c20-b':'equipo debe estar listo con su selector y toleration; al terminar debe quedar retirada la restricción de práctica.'
 })[task.id]}
]})));
