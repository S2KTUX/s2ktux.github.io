import {API,IMAGEN,aplicar,contenedor,crearPractica,deployment,esperarDeployment,obtener} from './herramientas-practicas.mjs';
import {exigirJSON} from './comprobaciones-json.mjs';
const tls='--endpoints=https://127.0.0.1:2379 --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/server.crt --key=/etc/kubernetes/pki/etcd/server.key';
const notaActualizacion='Para actualizar este laboratorio, cambia v1.35 por v1.36 en /etc/apt/sources.list.d/kubernetes-lab.list. El paquete destino es 1.36.5-0.s2ktux1. En kubeadm upgrade apply v1.36.5 añade --patches=/etc/kubernetes/patches --ignore-preflight-errors=NumCPU,Mem. Las imágenes de actualización ya vienen incluidas en la base limpia.';
const running=(ns,count)=>obtener(ns,'deployment','web',`.spec.replicas==${count} and .status.observedGeneration==.metadata.generation and .status.availableReplicas==${count}`);
const workload=deployment('p27b','web',contenedor(['sleep','3600']),2);
workload.spec.template.spec.affinity={nodeAffinity:{requiredDuringSchedulingIgnoredDuringExecution:{nodeSelectorTerms:[{matchExpressions:[{key:'kubernetes.io/hostname',operator:'In',values:['cka-w1','cka-w2']}]}]}},podAntiAffinity:{preferredDuringSchedulingIgnoredDuringExecution:[{weight:100,podAffinityTerm:{labelSelector:{matchLabels:{app:'web'}},topologyKey:'kubernetes.io/hostname'}}]}};
const pdb={apiVersion:'policy/v1',kind:'PodDisruptionBudget',metadata:{name:'web',namespace:'p27b'},spec:{minAvailable:1,selector:{matchLabels:{app:'web'}}}};
export const EJERCICIOS_CICLO_CLUSTER=Object.freeze([
 crearPractica(27,'a','Cordon · I','En p27a hay un Deployment web disponible. Marca cka-w1 para que no acepte Pods nuevos, sin parar ni borrar los que ya tiene. Comprueba SchedulingDisabled. No drenes aún el nodo.',
  'kubectl get pods -n p27a -o wide\nkubectl cordon cka-w1\nkubectl get nodes',
  obtener('default','node','cka-w1','.spec.unschedulable==true')+' && '+running('p27a',1),
  {labNote:notaActualizacion,prepare:[aplicar(deployment('p27a','web',contenedor(['sleep','3600']))),esperarDeployment('p27a','web')],negative:'kubectl uncordon cka-w1',cleanup:'kubectl uncordon cka-w1'}),
 crearPractica(27,'b','Drain y disponibilidad · II','Prepara cka-w1 para mantenimiento. En p27b, web tiene 2 réplicas y un PDB que exige al menos una disponible. Drena cka-w1 respetando el PDB y los DaemonSets; sus réplicas deben quedar disponibles en cka-w2. Deja cka-w1 cordonado hasta comprobar el ejercicio. No borres el PDB ni uses --disable-eviction.',
  'kubectl -n p27b get pods -o wide\nkubectl -n p27b get pdb\nkubectl drain cka-w1 --ignore-daemonsets --delete-emptydir-data --timeout=180s\nkubectl -n p27b rollout status deployment/web --timeout=180s\nkubectl -n p27b get pods -o wide',
  obtener('default','node','cka-w1','.spec.unschedulable==true')+' && '+running('p27b',2)+' && '+obtener('p27b','pdb','web','.spec.minAvailable==1 and .spec.selector.matchLabels.app=="web"')+` && kubectl -n p27b get pods -l app=web -o json | jq -e '(.items|length)==2 and all(.items[]; .spec.nodeName=="cka-w2" and .metadata.deletionTimestamp==null)'`,
  {environment:'three-nodes',labNote:notaActualizacion,prepare:['kubectl wait --for=condition=Ready node/cka-w2 --timeout=120s',aplicar(workload),aplicar(pdb),esperarDeployment('p27b','web'),`kubectl -n p27b get pods -l app=web -o json | jq -e 'any(.items[]; .spec.nodeName=="cka-w1")'`],negative:'kubectl uncordon cka-w1',cleanup:'kubectl uncordon cka-w1'}),
 {id:'c28-a',classNumber:28,title:'Snapshot de etcd · I',preflight:API,validation:'external-report',
  prompt:'Guarda un snapshot válido de etcd en /opt/p28a-etcd.db. El endpoint es https://127.0.0.1:2379; los certificados ca.crt, server.crt y server.key están en /etc/kubernetes/pki/etcd/. Comprueba la integridad del snapshot con etcdutl.',
  prepare:[API,'test ! -e /opt/p28a-etcd.db'],
  solution:'ETCDCTL_API=3 etcdctl snapshot save /opt/p28a-etcd.db \\\n  --endpoints=https://127.0.0.1:2379 \\\n  --cacert=/etc/kubernetes/pki/etcd/ca.crt \\\n  --cert=/etc/kubernetes/pki/etcd/server.crt \\\n  --key=/etc/kubernetes/pki/etcd/server.key\netcdutl snapshot status /opt/p28a-etcd.db -w table',
  check:exigirJSON(`test -s /opt/p28a-etcd.db && etcdutl snapshot status /opt/p28a-etcd.db -w json | jq -e '.revision>0 and .totalKey>0'`),
  negative:'mv /opt/p28a-etcd.db /opt/p28a-etcd-retirado.db',cleanup:'rm -f /opt/p28a-etcd.db /opt/p28a-etcd-retirado.db'},
 {id:'c28-b',classNumber:28,title:'Restaurar etcd · II',preflight:API,validation:'external-report',environment:'disposable-cluster',
  prompt:'Solo en la copia desechable del clúster: restaura /opt/p28b-etcd.db en /var/lib/p28b-etcd y cambia el hostPath del volumen etcd-data. El ConfigMap p28b-testigo de default debe recuperar valor=ANTES, no DESPUES. Conserva el mountPath y el --data-dir internos. Espera la recuperación de etcd y del API antes de comprobar.',
  prepare:[API,'test ! -e /opt/p28b-etcd.db && test ! -e /var/lib/p28b-etcd && test ! -e /root/p28b-etcd-original.yaml',
   `test -z "$(kubectl get configmap p28b-testigo --ignore-not-found -o name)" && kubectl create configmap p28b-testigo --from-literal=valor=ANTES`,
   `ETCDCTL_API=3 etcdctl snapshot save /opt/p28b-etcd.db ${tls} && cp /etc/kubernetes/manifests/etcd.yaml /root/p28b-etcd-original.yaml`,
   `kubectl patch configmap p28b-testigo --type=merge -p '{"data":{"valor":"DESPUES"}}'`],
  solution:'etcdutl --data-dir=/var/lib/p28b-etcd snapshot restore /opt/p28b-etcd.db\nvi /etc/kubernetes/manifests/etcd.yaml\n\n# En el volumen etcd-data cambia solo hostPath.path:\n# path: /var/lib/p28b-etcd\n\nkubectl get nodes\nkubectl get pods -n kube-system',
  solutionNative:`etcdutl --data-dir=/var/lib/p28b-etcd snapshot restore /opt/p28b-etcd.db\ntest "$(grep -c '^[[:space:]]*path: /var/lib/etcd$' /etc/kubernetes/manifests/etcd.yaml)" = 1\nsed -i 's|^\\([[:space:]]*path: \\)/var/lib/etcd$|\\1/var/lib/p28b-etcd|' /etc/kubernetes/manifests/etcd.yaml`,
  // Sin API disponible, el alumno aún necesita la consola y el corrector.
  // No se confunde el nuevo directorio creado con un restore ya aplicado.
  check:exigirJSON(`test -s /var/lib/p28b-etcd/member/snap/db && test "$(kubectl get cm p28b-testigo --request-timeout=10s -o jsonpath='{.data.valor}')" = ANTES && id=$(crictl ps --name '^etcd$' -q | head -1) && test -n "$id" && mounted=$(crictl inspect "$id") && test -n "$mounted" && printf '%s\\n' "$mounted" | jq -e 'any(.info.runtimeSpec.mounts[]; .source=="/var/lib/p28b-etcd" and .destination=="/var/lib/etcd")' && kubectl get --raw=/readyz --request-timeout=10s && kubectl get nodes -o json --request-timeout=10s | jq -e '(.items|length)>0 and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True"))'`),
  negative:`kubectl patch cm p28b-testigo --type=merge -p '{"data":{"valor":"INCOMPLETO"}}'`,
  cleanup:'kubectl delete configmap p28b-testigo --ignore-not-found',
  note:'Este ejercicio restaura todo el estado del clúster, no solo su ConfigMap. No se prepara encima de una sesión de estudio: necesita una copia independiente.'}
]);
