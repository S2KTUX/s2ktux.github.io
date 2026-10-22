import {EJERCICIOS_INICIALES} from './ejercicios-iniciales.mjs?v=20261020-aprendizaje';
import {EJERCICIOS_INTERMEDIOS} from './ejercicios-intermedios.mjs?v=20261020-aprendizaje';
import {EJERCICIOS_ACCESO} from './ejercicios-acceso.mjs?v=d5f8b79c9654a632';
import {EJERCICIOS_ALMACENAMIENTO} from './ejercicios-almacenamiento.mjs?v=9e73779cb79a1c9e';
import {EJERCICIOS_CONTROLADORES} from './ejercicios-controladores.mjs?v=7516c665c03377ac';
import {EJERCICIOS_INGRESS} from './ejercicios-ingress.mjs?v=c4e5afde8e57c7fa';
import {EJERCICIOS_SCHEDULING} from './ejercicios-scheduling.mjs?v=56508fb26c7d2b9e';
import {EJERCICIOS_RED} from './ejercicios-red.mjs?v=cbe7a2f928f48439';
import {EJERCICIOS_DNS} from './ejercicios-dns.mjs?v=e00ad26fa5ec3558';
import {exigirJSON} from './comprobaciones-json.mjs';
import {API} from './herramientas-practicas.mjs';
import {claseDisponible} from './disponibilidad-curso.mjs?v=f08c6af336f4f759';
import {EJERCICIOS_APRENDER} from './ejercicios-aprender.mjs';
import {EJERCICIOS_PROGRESIVOS,CKA_EXAM_PRACTICE} from './ejercicios-progresivos.mjs';
const image='busybox:1.37.0-musl';
const http="sh -c 'mkdir -p /www; echo WEB_LISTA >/www/index.html; httpd -f -p 8080 -h /www'";
export const EJERCICIOS=Object.freeze({
 inicial:EJERCICIOS_INICIALES,
 intermedio:[
  ...EJERCICIOS_INTERMEDIOS,
  ...EJERCICIOS_ACCESO,
  ...EJERCICIOS_ALMACENAMIENTO,
  ...EJERCICIOS_CONTROLADORES,
  ...EJERCICIOS_INGRESS,
  ...EJERCICIOS_SCHEDULING,
  ...EJERCICIOS_RED,
  ...EJERCICIOS_DNS
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
const topicById={'c01-a':'Laboratorio · I','c01-b':'Laboratorio · II','c02-a':'Pods · I','c02-b':'Pods · II','c03-a':'ReplicaSet · I','c03-b':'ReplicaSet · II','c04-inicio':'Deployment · I','c04-a':'Deployment · II','c04-b':'Actualizar un Deployment · II','c05-a':'Services · I','c05-b':'Services · II','c06-inicio':'Namespaces · I','c06-a':'Namespaces · II','c06-b':'Aislamiento por namespace · II','c07-inicio':'Requests y limits · I','c07-a':'Requests y limits · II','c07-b':'Corregir recursos · II','c08-inicio':'ResourceQuota · I','c08-a':'LimitRange · II','c08-b':'ResourceQuota · II','c09-inicio':'Readiness · I','c09-a':'Readiness · II','c09-b':'Liveness · II','c10-inicio':'ConfigMap · I','c10-a':'ConfigMap · II','c10-b':'ConfigMap como archivo · II','c11-inicio':'Secret · I','c11-a':'Secret · II','c11-b':'Secret como archivo · II'};
export function ejerciciosClase(number){return number!==0&&claseDisponible(number)?[...EJERCICIOS_APRENDER,...EJERCICIOS_PROGRESIVOS,...['inicial','intermedio','avanzado'].flatMap(ejerciciosNivel)].filter(task=>task.classNumber===number).map(task=>({...task,title:topicById[task.id]||task.title})):[];}
export function ejerciciosExamen(level){return CKA_EXAM_PRACTICE.filter(task=>task.level===level).map(task=>({...task,practiceExam:true,check:exigirJSON(task.check)}));}
