import {IMAGEN,yaml,obtener,listo,API} from './herramientas-practicas.mjs';
import {exigirJSON} from './comprobaciones-json.mjs';
// Candidatos de la clase 24. No abren el nivel avanzado: HA requiere su
// escenario independiente, y nunca se convierten los workers del alumno.
const directory='/etc/kubernetes/manifests';
const manifest=(letter,command=['sleep','3600'])=>({apiVersion:'v1',kind:'Pod',metadata:{name:'curso-static-'+letter,namespace:'p24'+letter},spec:{terminationGracePeriodSeconds:1,containers:[{name:'app',image:IMAGEN,imagePullPolicy:'Never',command}]}});
const path=letter=>directory+'/curso-static-'+letter+'.yaml';
const write=(letter,object)=>"cat > "+path(letter)+" <<'EOF'\n"+yaml(object)+'\nEOF';
const display=(letter,object)=>'vi '+path(letter)+'\n\n# Contenido del archivo:\n'+yaml(object);
const mirror=letter=>'curso-static-'+letter+'-cka-cp1';
const wait=letter=>`kubectl -n p24${letter} wait --for=create pod/${mirror(letter)} --timeout=120s\nkubectl -n p24${letter} wait --for=condition=Ready pod/${mirror(letter)} --timeout=180s`;
const definition=letter=>`test -f ${path(letter)} && definition=$(kubectl create --dry-run=client -f ${path(letter)} -o json) && test -n "$definition" && printf '%s\\n' "$definition" | jq -e '.apiVersion=="v1" and .kind=="Pod" and .metadata.name=="curso-static-${letter}" and .metadata.namespace=="p24${letter}" and (.spec.containers|length)==1 and .spec.containers[0].image=="${IMAGEN}"'`;
const projection='map({name,image,command:(.command//[]),args:(.args//[])})';
const check=letter=>exigirJSON(definition(letter)+' && '+obtener('p24'+letter,'pod',mirror(letter),'.metadata.annotations["kubernetes.io/config.source"]=="file" and (.metadata.annotations["kubernetes.io/config.mirror"]|type=="string" and length>0) and .spec.nodeName=="cka-cp1" and .status.phase=="Running" and '+listo+' and (.spec.containers|'+projection+')==($definition.spec.containers|'+projection+')').replace('jq -e ', 'jq --argjson definition "$definition" -e '));
const create=(letter,extra={})=>Object.freeze({
 id:'c24-'+letter,classNumber:24,preflight:API,validation:'external-report',...extra,
 prepare:Object.freeze([API,`grep -Eq '^staticPodPath: *${directory} *$' /var/lib/kubelet/config.yaml`,`test ! -e ${path(letter)} && test -z "$(kubectl get namespace p24${letter} --ignore-not-found -o name)"`,`kubectl create namespace p24${letter}`,...extra.prepare||[]]),
 check:check(letter),negative:'rm '+path(letter),
 cleanup:`rm -f ${path(letter)}\nkubectl -n p24${letter} wait --for=delete pod/${mirror(letter)} --timeout=120s\nkubectl delete namespace p24${letter} --wait=true --timeout=120s`,
 diagnostics:[{check:definition(letter),message:'Falta el manifiesto del Static Pod en el nodo o no tiene el nombre, namespace o imagen pedidos.'},{check:check(letter),message:'El mirror Pod todavía no está listo en cka-cp1 o no coincide con el manifiesto del nodo.'}]
});
const a=manifest('a'),b=manifest('b');
export const EJERCICIOS_ADMINISTRACION=Object.freeze([
 create('a',{
  title:'Crear un Static Pod · I',
  prompt:`En cka-cp1 crea ${path('a')} para ejecutar el Static Pod curso-static-a, en p24a, con ${IMAGEN}. Debe permanecer en ejecución. Comprueba su mirror Pod y el contenedor con crictl. No modifiques los componentes del control plane.`,
  solution:write('a',a)+'\n'+wait('a')+'\nkubectl -n p24a get pods -o wide\ncrictl ps',
  solutionDisplay:display('a',a)+'\n\n'+wait('a')+'\nkubectl -n p24a get pods -o wide\ncrictl ps',
  equivalent:write('a',{...a,metadata:{...a.metadata,labels:{practica:'estatica'}},spec:{...a.spec,containers:[{...a.spec.containers[0],command:['sh','-c','exec sleep 3600']}]}})+'\n'+wait('a')
 }),
 create('b',{
  title:'Reparar un Static Pod · II',
  prompt:`El Static Pod curso-static-b de p24b falla al iniciar. Revisa su manifiesto ${path('b')}, los logs y el estado del kubelet. Corrige el problema para que el contenedor de ${IMAGEN} permanezca en ejecución. Después borra solo su mirror Pod y comprueba que vuelve a aparecer. No reinicies el nodo ni cambies otros manifiestos.`,
  prepare:[write('b',manifest('b',['sh','-c','exit 1'])),`kubectl -n p24b wait --for=create pod/${mirror('b')} --timeout=120s`,`kubectl -n p24b wait --for=jsonpath='{.status.containerStatuses[0].lastState.terminated.exitCode}'=1 pod/${mirror('b')} --timeout=180s`],
  solution:`kubectl -n p24b logs ${mirror('b')} --previous\njournalctl -u kubelet -n 20 --no-pager\n`+write('b',b)+'\n'+wait('b')+`\nkubectl -n p24b delete pod ${mirror('b')} --wait=false\n`+wait('b'),
  solutionDisplay:`kubectl -n p24b logs ${mirror('b')} --previous\njournalctl -u kubelet -n 20 --no-pager\n`+display('b',b)+'\n\n'+wait('b')+`\nkubectl -n p24b delete pod ${mirror('b')} --wait=false\n`+wait('b')
 })
]);
