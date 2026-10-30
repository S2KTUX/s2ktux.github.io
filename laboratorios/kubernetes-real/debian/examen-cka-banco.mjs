import {IMAGEN,aplicar,contenedor,deployment,pod,yaml,solucionLegible,q} from './herramientas-practicas.mjs?v=10519a9c2390f8e7';
import {exigirJSON} from './comprobaciones-json.mjs?v=68b19c6ff88596f5';
export const DOMINIOS_CKA=Object.freeze({architecture:25,workloads:15,networking:20,storage:10,troubleshooting:30});
export const DURACION_CKA=2*60*60*1000;
export const MINIMO_CKA=66;
const ns=n=>'examen-'+n;
const app=(n,extra={})=>{const obj=deployment(ns(n),'web',contenedor(['sh','-c','mkdir -p /www; echo EXAMEN_OK >/www/index.html; exec httpd -f -p 8080 -h /www']));Object.assign(obj.spec.template.spec,extra);obj.spec.template.spec.nodeSelector={'kubernetes.io/hostname':'cka-w1'};return obj;};
const svc=(n,selector='web')=>({apiVersion:'v1',kind:'Service',metadata:{name:'web',namespace:ns(n)},spec:{selector:{app:selector},ports:[{port:80,targetPort:8080}]}});
const resources={serviceaccount:['v1','serviceaccounts'],role:['rbac.authorization.k8s.io/v1','roles'],rolebinding:['rbac.authorization.k8s.io/v1','rolebindings'],deployment:['apps/v1','deployments'],service:['v1','services'],job:['batch/v1','jobs'],cronjob:['batch/v1','cronjobs'],networkpolicy:['networking.k8s.io/v1','networkpolicies'],gateway:['gateway.networking.k8s.io/v1','gateways'],httproute:['gateway.networking.k8s.io/v1','httproutes'],pvc:['v1','persistentvolumeclaims'],pod:['v1','pods'],pods:['v1','pods'],configmap:['v1','configmaps'],'backups.examen.s2ktux.dev':['examen.s2ktux.dev/v1','backups']};
// Consultar la misma API real sin arrancar otro cliente Go para cada campo.
// Un error del GET o del predicado termina esta comprobación, aunque después
// haya más órdenes en ella. Nunca aceptar un jq sin entrada.
const get=(n,kind,name,predicate)=>{
 const [api,plural]=resources[kind]||[];if(!api)throw Error('Recurso de examen desconocido');
 const path=(api==='v1'?'/api/':'/apis/')+api+'/namespaces/'+ns(n)+'/'+plural+(name?'/'+name:'');
 return `{ object=$(curl --fail --silent --show-error --max-time 20 --cacert /etc/kubernetes/pki/ca.crt --cert "$S2KTUX_CKA_CERT" --key "$S2KTUX_CKA_KEY" https://127.0.0.1:6443${path}) && test -n "$object" && printf '%s\\n' "$object" | jq -e ${q(predicate)}; } || exit 1`;
};
const imagePredicate='(.spec.template.spec.containers[0].image | ltrimstr("docker.io/") | ltrimstr("library/"))=="'+IMAGEN+'"';
const ready=(n,replicas=1,extra='true')=>get(n,'deployment','web','.status.observedGeneration==.metadata.generation and (.status.availableReplicas//0)==.spec.replicas and .spec.replicas=='+replicas+' and ('+imagePredicate+') and ('+extra+')');
const quantity='def quantity: if type=="number" then . else capture("^(?<n>[0-9]+(?:[.][0-9]+)?)(?<u>[a-zA-Z]*)$") | (.n|tonumber)*({"":1,"m":0.001,"Ki":1024,"Mi":1048576,"Gi":1073741824,"k":1000,"M":1000000,"G":1000000000}[.u] // error("unidad desconocida")) end; ';
const authChecks=`review(){
 payload=$(jq -nc --arg verb "$1" --arg ns "$2" '{apiVersion:"authorization.k8s.io/v1",kind:"SubjectAccessReview",spec:{user:"system:serviceaccount:examen-01:lector",groups:["system:serviceaccounts","system:serviceaccounts:examen-01","system:authenticated"],resourceAttributes:{namespace:$ns,verb:$verb,resource:"pods"}}}') || return 1
 object=$(curl --fail --silent --show-error --max-time 20 --cacert /etc/kubernetes/pki/ca.crt --cert "$S2KTUX_CKA_CERT" --key "$S2KTUX_CKA_KEY" -H 'Content-Type: application/json' --data "$payload" https://127.0.0.1:6443/apis/authorization.k8s.io/v1/subjectaccessreviews) || return 1
 test -n "$object" || return 1
 printf '%s\\n' "$object" | jq -e --argjson expected "$3" '.status.allowed==$expected'
}; review get examen-01 true || exit 1; review list examen-01 true || exit 1; review delete examen-01 false || exit 1; review get default false || exit 1; `
const tasks=[];
function add(id,domain,points,es,en,prepare,solution,conditions,options={}){
 tasks.push(Object.freeze({id,domain,points,prompt:{es,en},prepare:[`kubectl create namespace ${ns(id)}`,`kubectl -n ${ns(id)} wait --for=create serviceaccount/default --timeout=90s`,...prepare],solution:solucionLegible(solution),solutionNative:solution,conditions:conditions.map(([es,en,command])=>({label:{es,en},command:exigirJSON(command)})),...options}));
}
add('01','architecture',7,
 'En examen-01, crea la ServiceAccount lector y el Role consultar, que permita únicamente get y list sobre pods. Vincula ese Role a lector mediante un RoleBinding lectura. No concedas permisos de escritura ni permisos en otros namespaces.',
 'In examen-01, create ServiceAccount lector and Role consultar allowing only get and list on pods. Bind the Role to lector using RoleBinding lectura. Grant no write access or permissions in other namespaces.',[],
 'kubectl -n examen-01 create serviceaccount lector\nkubectl -n examen-01 create role consultar --verb=get,list --resource=pods\nkubectl -n examen-01 create rolebinding lectura --role=consultar --serviceaccount=examen-01:lector',[
 ['Cuenta y vínculo','Account and binding',get('01','serviceaccount','lector','.metadata.name=="lector"')+'; '+get('01','rolebinding','lectura','.roleRef.kind=="Role" and .roleRef.name=="consultar" and any(.subjects[]; .kind=="ServiceAccount" and .name=="lector" and .namespace=="examen-01")')],
 ['Permisos efectivos limitados','Limited effective permissions',authChecks+get('01','role','consultar','.rules | ([.[].verbs[]]|unique)==["get","list"] and all(.[]; (.apiGroups|unique)==[""] and (.resources|unique)==["pods"] and all(.verbs[]; .=="get" or .=="list"))')],
 ]);
add('02','architecture',10,
 'Instala la release portal en examen-02 usando /opt/curso/30/web-chart, con una réplica y message=PORTAL_LISTO. La aplicación debe estar disponible y responder PORTAL_LISTO mediante su Service.',
 'Install release portal in examen-02 using /opt/curso/30/web-chart, with one replica and message=PORTAL_LISTO. The application must be available and return PORTAL_LISTO through its Service.',[],
 'helm install portal /opt/curso/30/web-chart -n examen-02 --set replicaCount=1 --set message=PORTAL_LISTO\nkubectl -n examen-02 rollout status deployment/portal --timeout=180s',[
 ['Release y valores','Release and values',"releases=$(helm list -n examen-02 -o json); test -n \"$releases\"; echo \"$releases\" | jq -e 'any(.[]; .name==\"portal\" and .status==\"deployed\")'; values=$(helm get values portal -n examen-02 -o json); test -n \"$values\"; echo \"$values\" | jq -e '.replicaCount==1 and .message==\"PORTAL_LISTO\"'"],
 ['Aplicación disponible','Available application',"kubectl -n examen-02 rollout status deployment/portal --timeout=20s; test \"$(kubectl -n examen-02 exec deployment/portal -- wget -T 5 -qO- http://portal/)\" = PORTAL_LISTO"],
 ],{requirements:['course-materials']});
const crd={apiVersion:'apiextensions.k8s.io/v1',kind:'CustomResourceDefinition',metadata:{name:'backups.examen.s2ktux.dev'},spec:{group:'examen.s2ktux.dev',scope:'Namespaced',names:{plural:'backups',singular:'backup',kind:'Backup'},versions:[{name:'v1',served:true,storage:true,schema:{openAPIV3Schema:{type:'object',properties:{spec:{type:'object',properties:{retention:{type:'integer',minimum:1}}}}}}}]}};
const backup={apiVersion:'examen.s2ktux.dev/v1',kind:'Backup',metadata:{namespace:ns('03'),name:'diario'},spec:{retention:7}};
add('03','architecture',8,
 'Instala el CRD entregado en /root/examen-backups.yaml y crea Backup diario en examen-03 con apiVersion examen.s2ktux.dev/v1 y spec.retention=7. Conserva el esquema del archivo.',
 'Install the CRD provided at /root/examen-backups.yaml and create Backup diario in examen-03 with apiVersion examen.s2ktux.dev/v1 and spec.retention=7. Preserve the provided schema.',["cat > /root/examen-backups.yaml <<'EOF'\n"+yaml(crd)+'\nEOF'],
 'kubectl apply -f /root/examen-backups.yaml\nkubectl wait --for=condition=Established crd/backups.examen.s2ktux.dev --timeout=90s\n'+aplicar(backup),[
 ['CRD establecido','Established CRD',"kubectl get crd backups.examen.s2ktux.dev -o json | jq -e '.spec.scope==\"Namespaced\" and any(.status.conditions[]; .type==\"Established\" and .status==\"True\") and any(.spec.versions[]; .name==\"v1\" and .served and .storage and .schema.openAPIV3Schema.properties.spec.properties.retention.minimum==1)'"],
 ['Recurso personalizado','Custom resource',get('03','backups.examen.s2ktux.dev','diario','.spec.retention==7')],
 ]);
add('04','workloads',7,
 `En examen-04, crea Deployment web con imagen ${IMAGEN}, dos réplicas y comando sleep 3600. El contenedor app debe solicitar 10m de CPU y 8Mi de memoria, con límites 100m y 32Mi. Las dos réplicas deben quedar disponibles.`,
 `In examen-04, create Deployment web using ${IMAGEN}, two replicas and command sleep 3600. Container app must request 10m CPU and 8Mi memory, with limits of 100m and 32Mi. Both replicas must be available.`,[],
 aplicar(deployment(ns('04'),'web',contenedor(['sleep','3600'],{resources:{requests:{cpu:'10m',memory:'8Mi'},limits:{cpu:'100m',memory:'32Mi'}}}),2))+'\nkubectl -n examen-04 rollout status deployment/web --timeout=180s',[
 ['Réplicas e imagen','Replicas and image',get('04','deployment','web',`.spec.replicas==2 and (${imagePredicate}) and .spec.template.spec.containers[0].command==["sleep","3600"]`)],
 ['Recursos y disponibilidad','Resources and availability',get('04','deployment','web',quantity+'.spec.template.spec.containers[0].resources | (.requests.cpu|quantity)==0.01 and (.requests.memory|quantity)==8388608 and (.limits.cpu|quantity)==0.1 and (.limits.memory|quantity)==33554432')+'; '+ready('04',2)],
 ]);
const cron={apiVersion:'batch/v1',kind:'CronJob',metadata:{name:'informe',namespace:ns('05')},spec:{schedule:'*/5 * * * *',concurrencyPolicy:'Forbid',successfulJobsHistoryLimit:30,jobTemplate:{spec:{template:{spec:{restartPolicy:'Never',containers:[contenedor(['echo','INFORME_LISTO'])]}}}}}};
add('05','workloads',8,
 `Crea CronJob informe en examen-05. Debe ejecutarse cada cinco minutos, impedir ejecuciones simultáneas, conservar las últimas 30 ejecuciones correctas y usar ${IMAGEN} para escribir INFORME_LISTO en su salida. Crea también un Job manual llamado informe-ahora a partir del CronJob y espera a que termine correctamente.`,
 `Create CronJob informe in examen-05. Run it every five minutes, forbid concurrent runs, retain the last 30 successful Jobs and use ${IMAGEN} to print INFORME_LISTO. Also create manual Job informe-ahora from the CronJob and wait for successful completion.`,[],
 aplicar(cron)+'\nkubectl -n examen-05 create job informe-ahora --from=cronjob/informe\nkubectl -n examen-05 wait --for=condition=Complete job/informe-ahora --timeout=180s',[
 ['Programación, concurrencia e historial','Schedule, concurrency and history',get('05','cronjob','informe',`.spec.schedule=="*/5 * * * *" and .spec.concurrencyPolicy=="Forbid" and .spec.successfulJobsHistoryLimit==30 and ((.spec.jobTemplate.spec.template.spec.containers[0].image | ltrimstr("docker.io/") | ltrimstr("library/"))=="${IMAGEN}")`)],
 ['Job finalizado y salida','Completed job and output',get('05','job','informe-ahora','(.status.succeeded//0)>0')+'; test "$(kubectl -n examen-05 logs job/informe-ahora)" = INFORME_LISTO'],
 ]);
add('06','networking',7,
 'El Service web de examen-06 no llega al Deployment web. Corrige su configuración conservando ambos recursos: debe exponer el puerto 80 y llegar al HTTP del contenedor en 8080. La petición desde el propio Deployment a http://web/ debe devolver EXAMEN_OK.',
 'Service web in examen-06 cannot reach Deployment web. Fix its configuration without replacing either resource: expose port 80 and forward to container HTTP port 8080. A request from the Deployment to http://web/ must return EXAMEN_OK.',[aplicar(app('06')),aplicar(svc('06','equivocado'))],
 'kubectl -n examen-06 set selector service/web app=web\nkubectl -n examen-06 exec deployment/web -- wget -qO- http://web/',[
 ['Puertos y selección','Ports and selection',get('06','service','web','.spec.selector.app=="web" and any(.spec.ports[]; .port==80 and .targetPort==8080)')],
 ['Tráfico real','Real traffic','test "$(kubectl -n examen-06 exec deployment/web -- wget -T 5 -qO- http://web/)" = EXAMEN_OK'],
 ]);
const policy={apiVersion:'networking.k8s.io/v1',kind:'NetworkPolicy',metadata:{name:'entrada-web',namespace:ns('07')},spec:{podSelector:{matchLabels:{app:'web'}},policyTypes:['Ingress'],ingress:[{from:[{podSelector:{matchLabels:{acceso:'permitido'}}}],ports:[{protocol:'TCP',port:8080}]}]}};
add('07','networking',7,
 'En examen-07, permite al Pod cliente-si acceder a web por TCP 8080 y bloquea a cliente-no. Crea NetworkPolicy entrada-web seleccionando app=web; el acceso debe depender de la etiqueta acceso=permitido del origen. Conserva los Pods y sus etiquetas.',
 'In examen-07, allow Pod cliente-si to reach web on TCP 8080 and block cliente-no. Create NetworkPolicy entrada-web selecting app=web; access must depend on source label acceso=permitido. Preserve the Pods and their labels.',[aplicar(app('07')),aplicar(svc('07')),...[['cliente-si','permitido'],['cliente-no','denegado']].map(([name,label])=>aplicar({...pod(ns('07'),name,{nodeSelector:{'kubernetes.io/hostname':'cka-w1'}}),metadata:{namespace:ns('07'),name,labels:{acceso:label}}}))],
 aplicar(policy),[
 ['Política y Pods conservados','Policy and preserved Pods',get('07','networkpolicy','entrada-web','.spec.podSelector.matchLabels.app=="web" and any(.spec.ingress[]; any(.from[]?; .podSelector.matchLabels.acceso=="permitido"))')+`; kubectl -n examen-07 wait --for=condition=Ready pod/cliente-si pod/cliente-no --timeout=30s; kubectl -n examen-07 get pod cliente-si -o json | jq -e '.metadata.labels.acceso=="permitido"'; kubectl -n examen-07 get pod cliente-no -o json | jq -e '.metadata.labels.acceso=="denegado"'`],
 ['Permitir y bloquear tráfico','Allow and block traffic','test "$(kubectl -n examen-07 exec cliente-si -- wget -T 5 -qO- http://web/)" = EXAMEN_OK; if kubectl -n examen-07 exec cliente-no -- wget -T 3 -qO- http://web/; then exit 1; fi'],
 ],{requirements:['network-policy']});
const gateway={apiVersion:'gateway.networking.k8s.io/v1',kind:'Gateway',metadata:{name:'entrada',namespace:ns('08')},spec:{gatewayClassName:'traefik',listeners:[{name:'http',protocol:'HTTP',port:8000}]}};
const route={apiVersion:'gateway.networking.k8s.io/v1',kind:'HTTPRoute',metadata:{name:'portal',namespace:ns('08')},spec:{parentRefs:[{name:'entrada'}],hostnames:['portal.examen.test'],rules:[{matches:[{path:{type:'PathPrefix',value:'/'}}],backendRefs:[{name:'web',port:80}]}]}};
add('08','networking',6,
 'En examen-08, publica el Service web:80 mediante Gateway entrada (clase traefik, HTTP 8000) y HTTPRoute portal para portal.examen.test y ruta /. La petición a 10.77.0.11:30080 con ese Host debe devolver EXAMEN_OK. No crees un Ingress.',
 'In examen-08, expose Service web:80 using Gateway entrada (class traefik, HTTP 8000) and HTTPRoute portal for portal.examen.test at /. A request to 10.77.0.11:30080 with that Host must return EXAMEN_OK. Do not create an Ingress.',[aplicar(app('08')),aplicar(svc('08'))],
 aplicar(gateway)+'\n'+aplicar(route),[
 ['Gateway y ruta aceptados','Accepted Gateway and route',get('08','gateway','entrada','.metadata.generation as $g | .spec.gatewayClassName=="traefik" and any(.status.conditions[]; .type=="Programmed" and .status=="True" and .observedGeneration==$g)')+'; '+get('08','httproute','portal','any(.spec.hostnames[]; .=="portal.examen.test") and any(.status.parents[]?.conditions[]?; .type=="Accepted" and .status=="True")')],
 ['Entrada HTTP real','Real HTTP entry','test "$(curl -fsS --max-time 10 -H \'Host: portal.examen.test\' http://10.77.0.11:30080/)" = EXAMEN_OK; test -z "$(kubectl -n examen-08 get ingress -o name)"'],
 ],{requirements:['gateway']});
const pv={apiVersion:'v1',kind:'PersistentVolume',metadata:{name:'examen-datos'},spec:{capacity:{storage:'64Mi'},accessModes:['ReadWriteOnce'],persistentVolumeReclaimPolicy:'Retain',storageClassName:'examen-manual',hostPath:{path:'/var/lib/examen-datos',type:'DirectoryOrCreate'},nodeAffinity:{required:{nodeSelectorTerms:[{matchExpressions:[{key:'kubernetes.io/hostname',operator:'In',values:['cka-w1']}]}]}}}};
const pvc={apiVersion:'v1',kind:'PersistentVolumeClaim',metadata:{namespace:ns('09'),name:'datos'},spec:{accessModes:['ReadWriteOnce'],storageClassName:'examen-manual',volumeName:'examen-datos',resources:{requests:{storage:'64Mi'}}}};
const stored=pod(ns('09'),'almacen',{nodeSelector:{'kubernetes.io/hostname':'cka-w1'},containers:[contenedor(['sleep','3600'],{volumeMounts:[{name:'datos',mountPath:'/datos'}]})],volumes:[{name:'datos',persistentVolumeClaim:{claimName:'datos'}}]});
add('09','storage',10,
 `El PV examen-datos ya existe. Crea PVC datos en examen-09: 64Mi, ReadWriteOnce, clase examen-manual, usando ese PV. Crea Pod almacen en cka-w1 con ${IMAGEN} y sleep 3600, montando el PVC en /datos. Guarda PERSISTENTE en /datos/prueba.txt.`,
 `PV examen-datos already exists. Create PVC datos in examen-09: 64Mi, ReadWriteOnce, class examen-manual, using that PV. Create Pod almacen on cka-w1 with ${IMAGEN} and sleep 3600, mounting the PVC at /datos. Write PERSISTENTE to /datos/prueba.txt.`,[aplicar(pv)],
 aplicar(pvc)+'\n'+aplicar(stored)+'\nkubectl -n examen-09 wait --for=condition=Ready pod/almacen --timeout=180s\nkubectl -n examen-09 exec almacen -- sh -c \'echo PERSISTENTE > /datos/prueba.txt\'',[
 ['PVC enlazado','Bound PVC',get('09','pvc','datos',quantity+'.status.phase=="Bound" and .spec.volumeName=="examen-datos" and (.spec.resources.requests.storage|quantity)==67108864 and .spec.storageClassName=="examen-manual"')],
 ['Montaje y datos','Mount and data',get('09','pod','almacen','[.spec.volumes[]|select(.persistentVolumeClaim.claimName=="datos")|.name] as $names | any(.spec.containers[].volumeMounts[]?; .mountPath=="/datos" and (.name as $n | $names|index($n)!=null))')+'; test "$(kubectl -n examen-09 exec almacen -- cat /datos/prueba.txt)" = PERSISTENTE'],
 ]);
const crash=app('10');crash.spec.template.spec.containers[0].command=['sh','-c','echo ERROR; exit 1'];
add('10','troubleshooting',10,
 'El Deployment web en examen-10 se reinicia. Conserva su nombre e imagen y corrige su arranque para que sirva EXAMEN_OK por HTTP en 8080. Debe quedar disponible y responder a través del Service web.',
 'Deployment web in examen-10 keeps restarting. Preserve its name and image, and fix startup to serve EXAMEN_OK over HTTP on 8080. It must become available and respond through Service web.',[aplicar(crash),aplicar(svc('10'))],
 'kubectl -n examen-10 logs deployment/web --previous\nkubectl -n examen-10 edit deployment web\n\n# command del contenedor:\n# ["sh", "-c", "mkdir -p /www; echo EXAMEN_OK >/www/index.html; exec httpd -f -p 8080 -h /www"]',[
 ['Aplicación recuperada','Recovered application',ready('10')],
 ['Respuesta HTTP','HTTP response','test "$(kubectl -n examen-10 exec deployment/web -- wget -T 5 -qO- http://web/)" = EXAMEN_OK'],
 ],{solutionNative:aplicar(app('10'))});
const pending=app('11');pending.spec.template.spec.nodeSelector={'kubernetes.io/hostname':'nodo-inexistente'};
add('11','troubleshooting',10,
 'El Deployment web en examen-11 permanece Pending. Diagnostica la asignación y corrige únicamente el selector del nodo para que ejecute en cka-w1. Conserva el número de réplicas, la imagen y el comando. No cambies los nodos.',
 'Deployment web in examen-11 remains Pending. Diagnose scheduling and fix only its node selector to run on cka-w1. Preserve replica count, image and command. Do not modify the nodes.',[aplicar(pending)],
 'kubectl -n examen-11 describe pods\nkubectl -n examen-11 patch deployment web --type=merge -p \'{"spec":{"template":{"spec":{"nodeSelector":{"kubernetes.io/hostname":"cka-w1"}}}}}\'',[
 ['Selector corregido','Corrected selector',get('11','deployment','web','.spec.template.spec.nodeSelector["kubernetes.io/hostname"]=="cka-w1"')],
 ['Pod disponible en el nodo','Available Pod on the node',ready('11',1,'.spec.template.spec.containers[0].command==["sh","-c","mkdir -p /www; echo EXAMEN_OK >/www/index.html; exec httpd -f -p 8080 -h /www"]')+'; '+get('11','pods','','(.items|length)>0 and any(.items[]; .spec.nodeName=="cka-w1" and any(.status.conditions[]?; .type=="Ready" and .status=="True"))')],
 ]);
const missing=app('12');missing.spec.template.spec.containers[0].env=[{name:'MODO',valueFrom:{configMapKeyRef:{name:'ajustes',key:'MODO'}}}];
add('12','troubleshooting',10,
 'El Deployment web de examen-12 no inicia por su configuración. Resuelve el problema conservando su referencia al ConfigMap ajustes y la clave MODO. El valor esperado es produccion. La aplicación debe quedar disponible y recibir ese valor en el contenedor.',
 'Deployment web in examen-12 cannot start because of its configuration. Fix the issue while preserving its reference to ConfigMap ajustes and key MODO. The expected value is produccion. The application must become available and receive that value inside the container.',[aplicar(missing)],
 'kubectl -n examen-12 describe pods\nkubectl -n examen-12 create configmap ajustes --from-literal=MODO=produccion\nkubectl -n examen-12 rollout restart deployment/web\nkubectl -n examen-12 rollout status deployment/web --timeout=180s',[
 ['Configuración','Configuration',get('12','configmap','ajustes','.data.MODO=="produccion"')],
 ['Aplicación y variable','Application and environment',ready('12',1,'any(.spec.template.spec.containers[0].env[]; .name=="MODO" and .valueFrom.configMapKeyRef.name=="ajustes" and .valueFrom.configMapKeyRef.key=="MODO")')+'; test "$(kubectl -n examen-12 exec deployment/web -- printenv MODO)" = produccion'],
 ]);
export const TAREAS_CKA=Object.freeze(tasks);
