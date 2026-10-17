import {EJERCICIOS_INICIALES} from './ejercicios-iniciales.mjs';
import {EJERCICIOS_INTERMEDIOS} from './ejercicios-intermedios.mjs';
import {exigirJSON} from './comprobaciones-json.mjs';
import {API} from './herramientas-practicas.mjs';
import {claseDisponible} from './disponibilidad-curso.mjs';
const image='busybox:1.37.0-musl';
const http="sh -c 'mkdir -p /www; echo WEB_LISTA >/www/index.html; httpd -f -p 8080 -h /www'";
export const EJERCICIOS=Object.freeze({
 inicial:EJERCICIOS_INICIALES,
 intermedio:[
  ...EJERCICIOS_INTERMEDIOS,
  {id:'seleccion',title:'Elegir el nodo de una aplicación',prompt:`Etiqueta cka-w1 con zona=curso. Crea un Pod llamado seleccionado, con ${image} y sleep 3600, que seleccione los nodos con esa etiqueta. Debe quedar listo en cka-w1.`,solution:`kubectl label node cka-w1 zona=curso --overwrite\nkubectl run seleccionado --image=${image} --image-pull-policy=Never --overrides='{"spec":{"nodeSelector":{"zona":"curso"}}}' --command -- sleep 3600`,check:`test "$(kubectl get node cka-w1 -o jsonpath='{.metadata.labels.zona}')" = curso && kubectl get pod seleccionado -o json | jq -e '.spec.nodeSelector.zona=="curso" and .spec.nodeName=="cka-w1" and any(.status.conditions[]; .type=="Ready" and .status=="True")'`}
 ],
 avanzado:[
  {id:'servicio-roto',title:'Una aplicación que no responde',prompt:'Prepara este ejercicio. En el namespace diagnostico-red, la aplicación servidor escucha en el puerto 8080, pero su Service no permite acceder a ella. Corrige el Service sin modificar ni borrar el Pod. Al consultar http://servidor.diagnostico-red.svc.cluster.local/ debe devolver WEB_LISTA.',prepare:[`if kubectl get namespace diagnostico-red >/dev/null 2>&1; then echo 'El namespace ya existe; no se sobrescriben sus recursos.'; exit 1; fi; kubectl create namespace diagnostico-red; kubectl -n diagnostico-red wait --for=create serviceaccount/default --timeout=90s`,`kubectl -n diagnostico-red run servidor --image=${image} --image-pull-policy=Never --labels=app=servidor --command -- ${http}`,`kubectl -n diagnostico-red expose pod servidor --port=80 --target-port=8081`],solution:`kubectl -n diagnostico-red get service servidor -o yaml\nkubectl -n diagnostico-red describe pod servidor\nkubectl -n diagnostico-red patch service servidor --type=merge -p '{"spec":{"ports":[{"port":80,"targetPort":8080}]}}'\nkubectl -n diagnostico-red exec servidor -- wget -qO- http://servidor.diagnostico-red.svc.cluster.local/`,check:`test "$(kubectl -n diagnostico-red exec servidor -- wget -T 5 -qO- http://servidor.diagnostico-red.svc.cluster.local/)" = WEB_LISTA && kubectl -n diagnostico-red get service servidor -o json | jq -e 'any(.spec.ports[]; .port==80 and .targetPort==8080)'`},
  {id:'snapshot',title:'Guardar una copia de etcd',prompt:'Guarda una copia válida de etcd en /opt/etcd-backup.db. El servidor escucha en https://127.0.0.1:2379 y sus certificados están en /etc/kubernetes/pki/etcd/.',solution:'ETCDCTL_API=3 etcdctl --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/healthcheck-client.crt \\\n  --key=/etc/kubernetes/pki/etcd/healthcheck-client.key \\\n  snapshot save /opt/etcd-backup.db\netcdutl snapshot status /opt/etcd-backup.db -w table',check:'test -s /opt/etcd-backup.db && etcdutl snapshot status /opt/etcd-backup.db -w json | jq -e \' .revision>0 and .totalKey>0 \''}
 ]
});
const classForLegacy={seleccion:19,'servicio-roto':34,snapshot:28};
export function ejerciciosNivel(level){
 if(!Object.hasOwn(EJERCICIOS,level))throw Error('Prácticas de nivel desconocido');
 return level==='inicial'?EJERCICIOS_INICIALES:EJERCICIOS[level].map(task=>({...task,preflight:task.preflight||API,check:exigirJSON(task.check),classNumber:task.classNumber??classForLegacy[task.id]}));
}
export function ejerciciosClase(number){return claseDisponible(number)?['inicial','intermedio','avanzado'].flatMap(ejerciciosNivel).filter(task=>task.classNumber===number):[];}
