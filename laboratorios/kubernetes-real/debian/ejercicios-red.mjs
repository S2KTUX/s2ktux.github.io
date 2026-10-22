import {IMAGEN,aplicar,pod,contenedor,obtener,listo,crearPractica,q} from './herramientas-practicas.mjs?v=b995634347ea1c07';
import {exigirJSON} from './comprobaciones-json.mjs';
const tasks=[],add=(...args)=>tasks.push(crearPractica(...args));
const server=ns=>pod(ns,'api',{containers:[contenedor(['sh','-c','mkdir -p /www; echo RED_OK > /www/index.html; httpd -p 80 -h /www; exec httpd -f -p 8080 -h /www'])]});
const client=(ns,name,label)=>({...pod(ns,name),metadata:{namespace:ns,name,labels:{app:label}}});
const service=ns=>({apiVersion:'v1',kind:'Service',metadata:{namespace:ns,name:'api'},spec:{selector:{app:'api'},ports:[{name:'http',port:8080,targetPort:8080},{name:'otro',port:80,targetPort:80}]}});
const policy=(ns,from)=>({apiVersion:'networking.k8s.io/v1',kind:'NetworkPolicy',metadata:{namespace:ns,name:'entrada-api'},spec:{podSelector:{matchLabels:{app:'api'}},policyTypes:['Ingress'],ingress:[{from,ports:[{protocol:'TCP',port:8080}]}]}});
const request=(ns,name,url)=>`kubectl -n ${ns} exec ${name} -- wget -T 3 -qO- ${url}`;
const allowed=(ns,name,url)=>`test "$(${request(ns,name,url)})" = RED_OK`;
const denied=(ns,name,url)=>`if ${request(ns,name,url)} >/dev/null 2>&1; then exit 1; fi`;
const url=(ns,port=8080)=>`http://api.${ns}.svc.cluster.local:${port}/`;
const ready=ns=>`kubectl -n ${ns} wait --for=condition=Ready pods --all --timeout=180s`;
const hasPolicy=ns=>obtener(ns,'networkpolicies','','any(.items[]; .spec.podSelector.matchLabels.app=="api" and (.spec.policyTypes|index("Ingress"))!=null)');
const sameNamespaceFrom=[{podSelector:{matchLabels:{app:'frontend'}}}];
add(21,'a','Permitir solo al frontend · I',
 'En p21a, api responde en TCP 8080 y 80. Permite que solo los Pods app=frontend de ese namespace entren a api por TCP 8080. El Pod intruso y el acceso al puerto 80 deben quedar bloqueados. No cambies los Pods ni el Service; crea una NetworkPolicy.',
 aplicar(policy('p21a',sameNamespaceFrom))+'\n'+request('p21a','frontend',url('p21a'))+'\n# Desde intruso debe fallar:\n'+request('p21a','intruso',url('p21a')),
 hasPolicy('p21a')+' && '+allowed('p21a','frontend',url('p21a'))+' && '+denied('p21a','intruso',url('p21a'))+' && '+denied('p21a','frontend',url('p21a',80)),
 {requirements:['network-policy'],prepare:[aplicar(server('p21a')),aplicar(service('p21a')),aplicar(client('p21a','frontend','frontend')),aplicar(client('p21a','intruso','intruso')),ready('p21a'),allowed('p21a','frontend',url('p21a')),allowed('p21a','intruso',url('p21a')),allowed('p21a','frontend',url('p21a',80))],nativeWait:'sleep 3',negative:'kubectl -n p21a delete networkpolicy entrada-api'});
const remote='p21b-clientes';
add(21,'b','Namespace y etiqueta juntos · II',
 'En p21b, api solo debe recibir TCP 8080 desde Pods app=frontend de p21b-clientes. El Pod intruso de p21b-clientes, el Pod fuera de p21b y el acceso a TCP 80 deben quedar bloqueados. No limites la salida ni modifiques los Pods o Services.',
 aplicar(policy('p21b',[{namespaceSelector:{matchLabels:{'kubernetes.io/metadata.name':remote}},podSelector:{matchLabels:{app:'frontend'}}}]))+'\n'+request(remote,'frontend',url('p21b'))+'\n# Desde intruso y fuera debe fallar:\n'+request(remote,'intruso',url('p21b'))+'\n'+request('p21b','fuera',url('p21b')),
 hasPolicy('p21b')+' && '+allowed(remote,'frontend',url('p21b'))+' && '+denied(remote,'intruso',url('p21b'))+' && '+denied('p21b','fuera',url('p21b'))+' && '+denied(remote,'frontend',url('p21b',80)),
 {requirements:['network-policy'],prepare:[`test -z "$(kubectl get namespace ${remote} --ignore-not-found -o name)"`,`kubectl create namespace ${remote}`,`kubectl -n ${remote} wait --for=create serviceaccount/default --timeout=90s`,aplicar(server('p21b')),aplicar(service('p21b')),aplicar(client('p21b','fuera','frontend')),aplicar(client(remote,'frontend','frontend')),aplicar(client(remote,'intruso','intruso')),ready('p21b'),ready(remote),allowed(remote,'frontend',url('p21b')),allowed(remote,'intruso',url('p21b')),allowed('p21b','fuera',url('p21b')),allowed(remote,'frontend',url('p21b',80))],nativeWait:'sleep 3',negative:'kubectl -n p21b delete networkpolicy entrada-api',cleanup:`kubectl delete namespace ${remote} --ignore-not-found --wait=true --timeout=120s`});
const dnsPeer={namespaceSelector:{matchLabels:{'kubernetes.io/metadata.name':'kube-system'}},podSelector:{matchLabels:{'k8s-app':'kube-dns'}}};
const egress={apiVersion:'networking.k8s.io/v1',kind:'NetworkPolicy',metadata:{namespace:'p21c',name:'salida-cliente'},spec:{podSelector:{matchLabels:{app:'cliente'}},policyTypes:['Egress'],egress:[{to:[dnsPeer],ports:[{protocol:'UDP',port:53},{protocol:'TCP',port:53}]},{to:[{podSelector:{matchLabels:{app:'api'}}}],ports:[{protocol:'TCP',port:8080}]}]}};
const outsider={...server('p21c'),metadata:{namespace:'p21c',name:'ajeno',labels:{app:'ajeno'}}};
add(21,'c','Salida restringida con DNS · II',
 'En p21c, cliente tiene la salida bloqueada. Permite DNS hacia los Pods k8s-app=kube-dns de kube-system, por UDP y TCP 53, y HTTP hacia app=api de p21c por TCP 8080. La conexión a ajeno y el puerto 80 de api deben seguir bloqueados. Conserva la política de bloqueo existente.',
 aplicar(egress)+'\nkubectl -n p21c exec cliente -- nslookup api.p21c.svc.cluster.local\n'+request('p21c','cliente',url('p21c')),
 obtener('p21c','networkpolicy','bloqueo','.spec.podSelector.matchLabels.app=="cliente" and (.spec.egress // []|length)==0 and (.spec.policyTypes|index("Egress"))!=null')+' && kubectl -n p21c exec cliente -- nslookup api.p21c.svc.cluster.local >/dev/null && '+allowed('p21c','cliente',url('p21c'))+' && '+denied('p21c','cliente','http://$(kubectl -n p21c get pod ajeno -o jsonpath=\'{.status.podIP}\'):8080/')+' && '+denied('p21c','cliente',url('p21c',80)),
 {requirements:['network-policy'],prepare:[aplicar(server('p21c')),aplicar(outsider),aplicar(service('p21c')),aplicar(client('p21c','cliente','cliente')),ready('p21c'),allowed('p21c','cliente',url('p21c')),allowed('p21c','cliente','http://$(kubectl -n p21c get pod ajeno -o jsonpath=\'{.status.podIP}\'):8080/'),aplicar({apiVersion:'networking.k8s.io/v1',kind:'NetworkPolicy',metadata:{namespace:'p21c',name:'bloqueo'},spec:{podSelector:{matchLabels:{app:'cliente'}},policyTypes:['Egress'],egress:[]}})],nativeWait:'sleep 3',negative:'kubectl -n p21c delete networkpolicy salida-cliente'});
const diagnostics={
 'c21-a':[
  {check:allowed('p21a','frontend',url('p21a')),message:'frontend no puede acceder a api por TCP 8080.'},
  {check:denied('p21a','intruso',url('p21a')),message:'intruso todavía puede acceder a api por TCP 8080.'},
  {check:denied('p21a','frontend',url('p21a',80)),message:'El puerto 80 de api sigue accesible desde frontend.'}
 ],
 'c21-b':[
  {check:allowed(remote,'frontend',url('p21b')),message:'El frontend de p21b-clientes no puede acceder a api por TCP 8080.'},
  {check:denied(remote,'intruso',url('p21b')),message:'El Pod intruso de p21b-clientes sigue teniendo acceso.'},
  {check:denied('p21b','fuera',url('p21b')),message:'El Pod fuera sigue teniendo acceso desde el namespace no permitido.'},
  {check:denied(remote,'frontend',url('p21b',80)),message:'El frontend sigue teniendo acceso al puerto 80 de api.'}
 ],
 'c21-c':[
  {check:'kubectl -n p21c exec cliente -- nslookup api.p21c.svc.cluster.local >/dev/null',message:'cliente no puede resolver el nombre del Service mediante DNS.'},
  {check:allowed('p21c','cliente',url('p21c')),message:'cliente no puede acceder a api por TCP 8080.'},
  {check:denied('p21c','cliente','http://$(kubectl -n p21c get pod ajeno -o jsonpath=\'{.status.podIP}\'):8080/'),message:'cliente todavía puede acceder al Pod ajeno.'},
  {check:denied('p21c','cliente',url('p21c',80)),message:'cliente todavía puede acceder al puerto 80 de api.'}
 ]
};
// Un fallo no demuestra filtrado si falta el cliente o el servidor ya no escucha.
const podsIntactos=(ns,labels)=>obtener(ns,'pods',Object.keys(labels).join(' '),'(.items|length)=='+Object.keys(labels).length+' and all(.items[]; '+listo+' and .spec.containers[0].image=="'+IMAGEN+'" and .metadata.labels.app==('+JSON.stringify(labels)+'[.metadata.name]))');
const serverIntacto=ns=>obtener(ns,'service','api','.spec.selector.app=="api" and ([.spec.ports[]|[.port,.targetPort]]|sort)==[[80,80],[8080,8080]]')+' && kubectl -n '+ns+' exec api -- sh -c '+q('test "$(wget -T 3 -qO- http://127.0.0.1:80/)" = RED_OK && test "$(wget -T 3 -qO- http://127.0.0.1:8080/)" = RED_OK');
export const guardasRed=Object.freeze({
 'c21-a':exigirJSON(podsIntactos('p21a',{api:'api',frontend:'frontend',intruso:'intruso'})+' && '+serverIntacto('p21a')),
 'c21-b':exigirJSON(podsIntactos('p21b',{api:'api',fuera:'frontend'})+' && '+podsIntactos(remote,{frontend:'frontend',intruso:'intruso'})+' && '+serverIntacto('p21b')),
 'c21-c':exigirJSON(podsIntactos('p21c',{api:'api',ajeno:'ajeno',cliente:'cliente'})+' && '+serverIntacto('p21c')+' && '+allowed('p21c','ajeno','http://127.0.0.1:8080/'))
});
export const EJERCICIOS_RED=Object.freeze(tasks.map(task=>Object.freeze({...task,check:guardasRed[task.id]+' && '+task.check,nativeSolution:task.solution.split('\n')[0],negative:task.negative+'; sleep 3',diagnostics:[{check:guardasRed[task.id],message:'El escenario ha cambiado: los Pods de prueba deben seguir listos y api debe conservar sus dos puertos y su Service.'},...diagnostics[task.id]]})));
