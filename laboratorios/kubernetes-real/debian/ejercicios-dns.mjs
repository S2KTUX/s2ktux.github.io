import {IMAGEN,aplicar,pod,contenedor,obtener,listo,crearPractica,esperarPod} from './herramientas-practicas.mjs?v=10519a9c2390f8e7';
const tasks=[],add=(...args)=>tasks.push(crearPractica(...args));
add(22,'a','Consultar el DNS del clúster · I',
 `En p22a crea cliente con ${IMAGEN} y sleep 3600. Desde ese Pod consulta kubernetes.default.svc.cluster.local con nslookup. Revisa también /etc/resolv.conf del Pod y comprueba que CoreDNS está disponible en kube-system. No cambies la configuración DNS.`,
 aplicar(pod('p22a','cliente'))+'\n'+esperarPod('p22a','cliente')+'\nkubectl -n p22a exec cliente -- nslookup kubernetes.default.svc.cluster.local\nkubectl -n p22a exec cliente -- cat /etc/resolv.conf\nkubectl -n kube-system get pods -l k8s-app=kube-dns',
 obtener('p22a','pod','cliente',listo+' and .spec.dnsPolicy=="ClusterFirst"')+' && kubectl -n p22a exec cliente -- nslookup kubernetes.default.svc.cluster.local >/dev/null',
 {negative:'kubectl -n p22a delete pod cliente'});
const ns='p22b-servidor',server=pod(ns,'web',{containers:[contenedor(['sh','-c','mkdir -p /www; echo DNS_OK > /www/index.html; exec httpd -f -p 8080 -h /www'])]});
const svc={apiVersion:'v1',kind:'Service',metadata:{namespace:ns,name:'web'},spec:{selector:{app:'web'},ports:[{port:80,targetPort:8080}]}};
add(22,'b','Un Service de otro namespace · II',
 `El servidor web está preparado en p22b-servidor y escucha en 8080. Crea allí el Service web, con puerto 80 y destino 8080. En p22b crea cliente con ${IMAGEN} y sleep 3600. Desde cliente, resuelve el nombre completo del Service y consulta su web: debe responder DNS_OK. No muevas los Pods de namespace ni cambies CoreDNS.`,
 aplicar(svc)+'\n'+aplicar(pod('p22b','cliente'))+'\n'+esperarPod('p22b','cliente')+'\nkubectl -n p22b exec cliente -- nslookup web.p22b-servidor.svc.cluster.local\nkubectl -n p22b exec cliente -- wget -qO- http://web.p22b-servidor.svc.cluster.local/',
 obtener(ns,'service','web','.spec.selector.app=="web" and any(.spec.ports[]; .port==80 and .targetPort==8080)')+' && '+obtener('p22b','pod','cliente',listo)+' && kubectl -n p22b exec cliente -- nslookup web.p22b-servidor.svc.cluster.local >/dev/null && test "$(kubectl -n p22b exec cliente -- wget -T 5 -qO- http://web.p22b-servidor.svc.cluster.local/)" = DNS_OK',
 {prepare:[`test -z "$(kubectl get namespace ${ns} --ignore-not-found -o name)"`,`kubectl create namespace ${ns}`,`kubectl -n ${ns} wait --for=create serviceaccount/default --timeout=90s`,aplicar(server),esperarPod(ns,'web')],negative:`kubectl -n ${ns} delete service web`,cleanup:`kubectl delete namespace ${ns} --ignore-not-found --wait=true --timeout=120s`});
export const EJERCICIOS_DNS=Object.freeze(tasks.map(task=>Object.freeze({...task,diagnostics:[
 {check:obtener('p22'+(task.id.endsWith('a')?'a':'b'),'pod','cliente',listo),message:'El Pod cliente no existe o todavía no está listo.'},
 {check:task.check,message:task.id.endsWith('a')?'cliente no resuelve kubernetes.default.svc.cluster.local con el DNS del clúster.':'Revisa el Service web de p22b-servidor y el acceso a su nombre completo desde cliente.'}
]})));
