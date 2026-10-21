import {IMAGEN,aplicar,pod,obtener,listo,crearPractica,esperarPod,q} from './herramientas-practicas.mjs';
const tasks=[],add=(...args)=>tasks.push(crearPractica(...args));
const can=(identity,verb,resource,ns,expected,group='')=>`test "$(kubectl auth can-i ${verb} ${resource} -n ${ns} --as=${identity}${group?' --as-group='+group:''})" = ${expected}`;

add(13,'a','RBAC · I',
 'En p13a crea el Role lector-pods con permisos get, list y watch sobre pods. Mediante el RoleBinding ana-lector, asígnalo a la usuaria ana. No le concedas permisos para borrar Pods ni para leerlos en default.',
 'kubectl -n p13a create role lector-pods --verb=get,list,watch --resource=pods\n'+
 'kubectl -n p13a create rolebinding ana-lector --role=lector-pods --user=ana\n'+
 'kubectl auth can-i list pods -n p13a --as=ana\n'+
 'kubectl auth can-i delete pods -n p13a --as=ana',
 obtener('p13a','role','lector-pods','(.rules|length)==1 and .rules[0].apiGroups==[""] and .rules[0].resources==["pods"] and (.rules[0].verbs|sort)==["get","list","watch"]')+' && '+
 obtener('p13a','rolebinding','ana-lector','.roleRef.kind=="Role" and .roleRef.name=="lector-pods" and any(.subjects[]; .kind=="User" and .name=="ana")')+' && '+
 can('ana','list','pods','p13a','yes')+' && '+can('ana','delete','pods','p13a','no')+' && '+can('ana','list','pods','default','no'),
 {negative:'kubectl -n p13a delete rolebinding ana-lector'});

add(13,'b','RBAC · II',
 'Crea el ClusterRole lector-logs-p13b con permiso get sobre pods/log. Concédelo al grupo lectores únicamente en p13b mediante el RoleBinding lectores-logs. Una usuaria del grupo debe poder consultar logs allí, pero no en default ni borrar Pods.',
 'kubectl create clusterrole lector-logs-p13b --verb=get --resource=pods/log\n'+
 'kubectl -n p13b create rolebinding lectores-logs --clusterrole=lector-logs-p13b --group=lectores\n'+
 'kubectl auth can-i get pods/log -n p13b --as=ana-grupo --as-group=lectores\n'+
 'kubectl auth can-i get pods/log -n default --as=ana-grupo --as-group=lectores',
 obtener('p13b','clusterrole','lector-logs-p13b','(.rules|length)==1 and .rules[0].apiGroups==[""] and .rules[0].resources==["pods/log"] and .rules[0].verbs==["get"]')+' && '+
 obtener('p13b','rolebinding','lectores-logs','.roleRef.kind=="ClusterRole" and .roleRef.name=="lector-logs-p13b" and any(.subjects[]; .kind=="Group" and .name=="lectores")')+' && '+
 can('ana-grupo','get','pods/log','p13b','yes','lectores')+' && '+can('ana-grupo','get','pods/log','default','no','lectores')+' && '+can('ana-grupo','delete','pods','p13b','no','lectores'),
 {prepare:['test -z "$(kubectl get clusterrole lector-logs-p13b --ignore-not-found -o name)"'],negative:'kubectl -n p13b delete rolebinding lectores-logs',cleanup:'kubectl delete clusterrole lector-logs-p13b --ignore-not-found'});

add(14,'a','ServiceAccount · I',
 'En p14a crea la ServiceAccount aplicacion. Crea el Pod cliente con '+IMAGEN+' y sleep 3600 usando esa cuenta. Debe quedar Ready. Comprueba que el token proyectado de la cuenta está disponible dentro del Pod.',
 'kubectl -n p14a create serviceaccount aplicacion\n'+
 aplicar(pod('p14a','cliente',{serviceAccountName:'aplicacion'}))+'\n'+esperarPod('p14a','cliente')+'\n'+
 'kubectl -n p14a exec cliente -- ls /var/run/secrets/kubernetes.io/serviceaccount',
 obtener('p14a','serviceaccount','aplicacion','.metadata.name=="aplicacion"')+' && '+
 obtener('p14a','pod','cliente',listo+' and .spec.serviceAccountName=="aplicacion" and any(.spec.volumes[]?; any(.projected.sources[]?; .serviceAccountToken!=null))')+' && '+
 'kubectl -n p14a exec cliente -- test -s /var/run/secrets/kubernetes.io/serviceaccount/token',
 {negative:'kubectl -n p14a delete pod cliente'});

add(14,'b','ServiceAccount · II',
 'En p14b crea la ServiceAccount lectora. El Role lector-pods y el RoleBinding lectora-pods le permitirán get y list sobre pods, solo en ese namespace. Crea un token temporal con kubectl y guárdalo en /root/p14b-token.txt. Utiliza ese token para consultar los Pods por HTTPS, validando la CA del clúster. No concedas permiso para borrar Pods.',
 'kubectl -n p14b create serviceaccount lectora\n'+
 'kubectl -n p14b create role lector-pods --verb=get,list --resource=pods\n'+
 'kubectl -n p14b create rolebinding lectora-pods --role=lector-pods --serviceaccount=p14b:lectora\n'+
 'kubectl -n p14b create token lectora --duration=1h > /root/p14b-token.txt\n'+
 'curl --fail --cacert /etc/kubernetes/pki/ca.crt -H "Authorization: Bearer $(cat /root/p14b-token.txt)" https://10.77.0.10:6443/api/v1/namespaces/p14b/pods',
 obtener('p14b','serviceaccount','lectora','.metadata.name=="lectora"')+' && '+
 obtener('p14b','rolebinding','lectora-pods','.roleRef.kind=="Role" and .roleRef.name=="lector-pods" and any(.subjects[]; .kind=="ServiceAccount" and .name=="lectora" and .namespace=="p14b")')+' && '+
 can('system:serviceaccount:p14b:lectora','list','pods','p14b','yes')+' && '+can('system:serviceaccount:p14b:lectora','delete','pods','p14b','no')+' && '+can('system:serviceaccount:p14b:lectora','list','pods','default','no')+' && '+
 'test -s /root/p14b-token.txt && test "$(jq -Rr '+q('split(".")[1]|gsub("-";"+")|gsub("_";"/")|@base64d|fromjson|.sub')+' </root/p14b-token.txt)" = system:serviceaccount:p14b:lectora && '+
 'response=$(curl -fsS --cacert /etc/kubernetes/pki/ca.crt -H "Authorization: Bearer $(cat /root/p14b-token.txt)" https://10.77.0.10:6443/api/v1/namespaces/p14b/pods) && test -n "$response" && echo "$response" | jq -e '+q('.kind=="PodList"'),
 {negative:'kubectl -n p14b delete rolebinding lectora-pods',cleanup:'rm -f /root/p14b-token.txt'});

export const EJERCICIOS_ACCESO=Object.freeze(tasks);
