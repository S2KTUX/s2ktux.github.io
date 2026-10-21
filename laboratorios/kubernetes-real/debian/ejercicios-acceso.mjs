import {IMAGEN,aplicar,pod,obtener,listo,crearPractica,esperarPod,q} from './herramientas-practicas.mjs';
const tasks=[],add=(...args)=>tasks.push(crearPractica(...args));
const can=(identity,verb,resource,ns,expected,group='')=>`test "$(kubectl auth can-i ${verb} ${resource.replace('/',' --subresource=')} -n ${ns} --as=${identity}${group?' --as-group='+group+' --as-group=system:authenticated':''})" = ${expected}`;

add(13,'a','RBAC · I',
 'En p13a crea el Role lector-pods con permisos get, list y watch sobre pods. Mediante el RoleBinding ana-lector, asígnalo a la usuaria ana. No le concedas permisos para borrar Pods ni para leerlos en default.',
 'kubectl -n p13a create role lector-pods --verb=get,list,watch --resource=pods\n'+
 'kubectl -n p13a create rolebinding ana-lector --role=lector-pods --user=ana\n'+
 'kubectl auth can-i list pods -n p13a --as=ana\n'+
 'kubectl -n p13a get role,rolebinding',
 obtener('p13a','role','lector-pods','(.rules|length)==1 and .rules[0].apiGroups==[""] and .rules[0].resources==["pods"] and (.rules[0].verbs|sort)==["get","list","watch"]')+' && '+
 obtener('p13a','rolebinding','ana-lector','.roleRef.kind=="Role" and .roleRef.name=="lector-pods" and any(.subjects[]; .kind=="User" and .name=="ana")')+' && '+
 can('ana','list','pods','p13a','yes')+' && '+can('ana','delete','pods','p13a','no')+' && '+can('ana','list','pods','default','no'),
 {negative:'kubectl -n p13a delete rolebinding ana-lector'});

add(13,'b','RBAC · II',
 'Crea el ClusterRole lector-logs-p13b con permiso get sobre pods/log. Concédelo al grupo lectores únicamente en p13b mediante el RoleBinding lectores-logs. Una usuaria del grupo debe poder consultar logs allí, pero no en default ni borrar Pods.',
 'kubectl create clusterrole lector-logs-p13b --verb=get --resource=pods/log\n'+
 'kubectl -n p13b create rolebinding lectores-logs --clusterrole=lector-logs-p13b --group=lectores\n'+
 'kubectl auth can-i get pods --subresource=log -n p13b --as=ana-grupo --as-group=lectores --as-group=system:authenticated\n'+
 'kubectl -n p13b get rolebinding lectores-logs',
 obtener('p13b','clusterrole','lector-logs-p13b','(.rules|length)==1 and .rules[0].apiGroups==[""] and .rules[0].resources==["pods/log"] and .rules[0].verbs==["get"]')+' && '+
 obtener('p13b','rolebinding','lectores-logs','.roleRef.kind=="ClusterRole" and .roleRef.name=="lector-logs-p13b" and any(.subjects[]; .kind=="Group" and .name=="lectores")')+' && '+
 can('ana-grupo','get','pods/log','p13b','yes','lectores')+' && '+can('ana-grupo','get','pods/log','default','no','lectores')+' && '+can('ana-grupo','delete','pods','p13b','no','lectores'),
 {prepare:['test -z "$(kubectl get clusterrole lector-logs-p13b --ignore-not-found -o name)"'],negative:'kubectl -n p13b delete rolebinding lectores-logs',cleanup:'kubectl delete clusterrole lector-logs-p13b --ignore-not-found'});

const certSolution=`openssl genrsa -out /root/p13cert.key 2048
openssl req -new -key /root/p13cert.key -out /root/p13cert.csr -subj '/CN=ana-cert'
kubectl apply -f - <<EOF
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: ana-cert
spec:
  request: $(base64 -w 0 /root/p13cert.csr)
  signerName: kubernetes.io/kube-apiserver-client
  expirationSeconds: 86400
  usages:
    - client auth
EOF
kubectl certificate approve ana-cert
kubectl wait --for=jsonpath='{.status.certificate}' csr/ana-cert --timeout=90s
kubectl get csr ana-cert -o jsonpath='{.status.certificate}' | base64 -d > /root/p13cert.crt
kubectl -n p13cert create role lector-pods --verb=get,list --resource=pods
kubectl -n p13cert create rolebinding ana-lector --role=lector-pods --user=ana-cert
kubectl config set-cluster laboratorio --server=https://10.77.0.10:6443 --certificate-authority=/etc/kubernetes/pki/ca.crt --embed-certs=true --kubeconfig=/root/p13cert.kubeconfig
kubectl config set-credentials ana-cert --client-certificate=/root/p13cert.crt --client-key=/root/p13cert.key --embed-certs=true --kubeconfig=/root/p13cert.kubeconfig
kubectl config set-context ana-cert --cluster=laboratorio --user=ana-cert --namespace=p13cert --kubeconfig=/root/p13cert.kubeconfig
kubectl config use-context ana-cert --kubeconfig=/root/p13cert.kubeconfig
kubectl --kubeconfig=/root/p13cert.kubeconfig get pods`;
add(13,'cert','Usuario con certificado · II',
 'Crea un certificado de cliente para ana-cert a través de una CSR llamada ana-cert y del firmante kubernetes.io/kube-apiserver-client. Guarda su kubeconfig en /root/p13cert.kubeconfig, sin sustituir el de administrador. Concédele únicamente get y list de Pods en p13cert; comprueba el acceso con su propio kubeconfig.',
 certSolution,
 obtener('p13cert','csr','ana-cert','.spec.signerName=="kubernetes.io/kube-apiserver-client" and (.status.certificate|length)>0 and any(.status.conditions[]; .type=="Approved" and .status=="True")')+' && '+
 'test -s /root/p13cert.kubeconfig && who=$(kubectl --kubeconfig=/root/p13cert.kubeconfig auth whoami -o json) && echo "$who" | jq -e '+q('.status.userInfo.username=="ana-cert"')+' && '+
 'test "$(kubectl --kubeconfig=/root/p13cert.kubeconfig auth can-i list pods -n p13cert)" = yes && test "$(kubectl --kubeconfig=/root/p13cert.kubeconfig auth can-i delete pods -n p13cert)" = no && test "$(kubectl --kubeconfig=/root/p13cert.kubeconfig auth can-i list pods -n default)" = no',
 {prepare:['test -z "$(kubectl get csr ana-cert --ignore-not-found -o name)" && test ! -e /root/p13cert.kubeconfig'],negative:'kubectl -n p13cert delete rolebinding ana-lector',cleanup:'kubectl delete csr ana-cert --ignore-not-found\nrm -f /root/p13cert.key /root/p13cert.csr /root/p13cert.crt /root/p13cert.kubeconfig'});

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
