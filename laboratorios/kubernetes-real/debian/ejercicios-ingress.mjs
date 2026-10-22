import {IMAGEN,q,aplicar,contenedor,pod,http,obtener,crearPractica,esperarPod} from './herramientas-practicas.mjs?v=b995634347ea1c07';
const tasks=[],add=(...args)=>tasks.push(crearPractica(...args));
const service=ns=>({apiVersion:'v1',kind:'Service',metadata:{namespace:ns,name:'web'},spec:{selector:{app:'web'},ports:[{port:80,targetPort:8080}]}});
const backend=(ns,text)=>[aplicar(pod(ns,'web',{containers:[contenedor(http(text))]})),aplicar(service(ns)),esperarPod(ns,'web')];
const rule=(host,path='/')=>({host,http:{paths:[{path,pathType:'Prefix',backend:{service:{name:'web',port:{number:80}}}}]}});
const ingress=(ns,host,extra={})=>({apiVersion:'networking.k8s.io/v1',kind:'Ingress',metadata:{namespace:ns,name:'entrada'},spec:{ingressClassName:'traefik',rules:[rule(host)],...extra}});
const matches=host=>'.spec.ingressClassName=="traefik" and any(.spec.rules[]; .host=="'+host+'" and any(.http.paths[]; .path=="/" and .pathType=="Prefix" and .backend.service.name=="web" and (.backend.service.port.number==80 or .backend.service.port.name=="http")))';
const probe=(host,text,secure=false)=>`test "$(curl --fail --silent --show-error --max-time 20 ${secure?'--cacert /root/p15c.crt --resolve '+host+':30443:10.77.0.11 https://'+host+':30443/':'-H '+q('Host: '+host)+' http://10.77.0.11:30080/'})" = ${text}`;
const esperarRuta=(host,text,secure=false)=>'deadline=$(($(date +%s)+90)); until '+probe(host,text,secure)+'; do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 2; done';
add(15,'a','Publicar una aplicación · I',
 'En p15a está preparado el Service web:80. Crea el Ingress entrada, clase traefik, para que el host web.curso.test y la ruta / lleguen a ese Service. Por HTTP debe devolver INGRESS_OK. El controlador ya está preparado y se accede desde el nodo por 10.77.0.11:30080.',
 'kubectl -n p15a create ingress entrada --class=traefik --rule='+q('web.curso.test/*=web:80')+'\ncurl -H '+q('Host: web.curso.test')+' http://10.77.0.11:30080/',
 obtener('p15a','ingress','entrada',matches('web.curso.test'))+' && '+probe('web.curso.test','INGRESS_OK'),
 {requirements:['traefik'],prepare:backend('p15a','INGRESS_OK'),negative:'kubectl -n p15a delete ingress entrada',nativeWait:esperarRuta('web.curso.test','INGRESS_OK')});
const broken=ingress('p15b','tienda.curso.test');broken.spec.rules[0].http.paths[0].backend.service.port.number=8081;
add(15,'b','Corregir el destino · II',
 'En p15b, el Ingress entrada para tienda.curso.test no funciona. Su aplicación y el Service web:80 están bien. Corrige el puerto del backend sin borrar el Ingress ni modificar sus Pods, su host o su clase. Por 10.77.0.11:30080 debe responder TIENDA_OK.',
 'kubectl -n p15b describe ingress entrada\nkubectl -n p15b get service web\nkubectl -n p15b edit ingress entrada\n# En backend.service.port.number cambia 8081 por 80.\ncurl -H '+q('Host: tienda.curso.test')+' http://10.77.0.11:30080/',
 obtener('p15b','ingress','entrada',matches('tienda.curso.test')+' and .metadata.uid==$uid').replace('jq -e ','jq -e --arg uid "$(cat /tmp/c15-b.uid)" ')+' && '+probe('tienda.curso.test','TIENDA_OK'),
 {requirements:['traefik'],prepare:[...backend('p15b','TIENDA_OK'),aplicar(broken),"kubectl -n p15b get ingress entrada -o jsonpath='{.metadata.uid}' > /tmp/c15-b.uid"],nativeSolution:"kubectl -n p15b patch ingress entrada --type=json -p '[{\"op\":\"replace\",\"path\":\"/spec/rules/0/http/paths/0/backend/service/port/number\",\"value\":80}]'",negative:'kubectl -n p15b delete ingress entrada',nativeWait:esperarRuta('tienda.curso.test','TIENDA_OK'),cleanup:'rm -f /tmp/c15-b.uid'});
add(15,'c','Proteger la entrada con TLS · II',
 'En p15c, web:80 sirve TLS_OK y existe el Secret TLS web-tls para seguro.curso.test. Crea entrada con clase traefik, ruta / y ese Secret. Debe responder por HTTPS en 10.77.0.11:30443. El certificado de prácticas está en /root/p15c.crt.',
 aplicar(ingress('p15c','seguro.curso.test',{tls:[{hosts:['seguro.curso.test'],secretName:'web-tls'}]}))+'\ncurl --cacert /root/p15c.crt --resolve seguro.curso.test:30443:10.77.0.11 https://seguro.curso.test:30443/',
 obtener('p15c','ingress','entrada',matches('seguro.curso.test')+' and any(.spec.tls[]; .secretName=="web-tls" and (.hosts|index("seguro.curso.test"))!=null)')+' && '+probe('seguro.curso.test','TLS_OK',true),
 {requirements:['traefik'],prepare:[...backend('p15c','TLS_OK'),'test ! -e /root/p15c.crt && test ! -e /root/p15c.key','openssl req -x509 -nodes -days 30 -newkey rsa:2048 -keyout /root/p15c.key -out /root/p15c.crt -subj /CN=seguro.curso.test -addext subjectAltName=DNS:seguro.curso.test','kubectl -n p15c create secret tls web-tls --cert=/root/p15c.crt --key=/root/p15c.key'],negative:'kubectl -n p15c delete secret web-tls',nativeWait:esperarRuta('seguro.curso.test','TLS_OK',true),cleanup:'rm -f /root/p15c.crt /root/p15c.key'});
export const EJERCICIOS_INGRESS=Object.freeze(tasks);
