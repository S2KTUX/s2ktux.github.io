// Estos cuatro candidatos comparten UNA copia independiente. No se ejecuta
// kubeadm reset desde Preparar ejercicio ni se cambia el clúster de estudio.
const materials='test -f /root/montaje-curso/preparado; test -s /root/montaje-curso/kubeadm.yaml; test -s /root/montaje-curso/red.yaml';
const api='kubectl get --raw=/readyz --request-timeout=15s';
const node=name=>`kubectl get node ${name} -o json | jq -e '.metadata.name=="${name}" and any(.status.conditions[]; .type=="Ready" and .status=="True")'`;
// El nombre de users[] es un alias local (por ejemplo default-auth), no la
// identidad autenticada. Esta se comprueba en el CN del certificado real.
const certificadoWorker=index=>`test -s /etc/kubernetes/kubelet.conf; test ! -e /etc/kubernetes/admin.conf; openssl x509 -in /var/lib/kubelet/pki/kubelet-client-current.pem -noout -subject | grep -F system:node:cka-w${index}; kubectl config view --kubeconfig=/etc/kubernetes/kubelet.conf --minify -o json | jq -e '(.users[0].name|type=="string" and length>0) and .contexts[0].context.user==.users[0].name and .clusters[0].cluster.server=="https://10.77.0.10:6443" and (.clusters[0].cluster["insecure-skip-tls-verify"]//false)==false'`;
const joinSolution=index=>`# En cka-cp1\nkubeadm token create --ttl=2h --print-join-command\n\n# En cka-w${index}: copia el comando anterior y añade los parámetros del laboratorio\nkubeadm join 10.77.0.10:6443 --token TOKEN --discovery-token-ca-cert-hash sha256:HASH --node-name cka-w${index} --cri-socket=unix:///run/containerd/containerd.sock --ignore-preflight-errors=NumCPU,Mem\n\n# En cka-cp1\nkubectl get nodes`;
const task=(id,classNumber,title,prompt,solution,check,extra={})=>Object.freeze({
 id,classNumber,title,prompt,solution,solutionDisplay:solution,check,
 scenarioId:'montaje-cluster',environment:'manual-cluster',validation:'external-report',
 preflight:materials,prepare:Object.freeze([materials]),...extra
});
export const EJERCICIOS_MONTAJE=Object.freeze([
 task('c25-a',25,'Iniciar el control plane · I',
  'En la copia de montaje, inicializa cka-cp1 con /root/montaje-curso/kubeadm.yaml y configura kubectl para root. Comprueba los componentes del control plane. Todavía no instales la red de Pods. En este laboratorio de un vCPU se ignoran únicamente las comprobaciones NumCPU y Mem.',
  'kubeadm init --config=/root/montaje-curso/kubeadm.yaml --ignore-preflight-errors=NumCPU,Mem\nmkdir -p /root/.kube\ncp /etc/kubernetes/admin.conf /root/.kube/config\nchmod 600 /root/.kube/config\nkubectl get nodes\nkubectl get pods -n kube-system\ncrictl ps',
  `${api}; test -s /etc/kubernetes/admin.conf; test -s /root/.kube/config; for name in kube-apiserver etcd kube-scheduler kube-controller-manager; do test -s /etc/kubernetes/manifests/$name.yaml; done; kubectl get node cka-cp1 -o name`,
  {diagnostics:[{check:api,message:'El control plane todavía no responde. Revisa la salida de kubeadm y sus componentes.'}]}
 ),
 task('c25-b',25,'Instalar la red de Pods · II',
  'Continúa en la misma copia después de init. Instala la red entregada en /root/montaje-curso/red.yaml. Deja cka-cp1 Ready y CoreDNS en ejecución. El archivo incluye el CNI bridge del laboratorio, kube-proxy y CoreDNS; no es Calico ni permite practicar NetworkPolicies.',
  'kubectl apply -f /root/montaje-curso/red.yaml\nkubectl get nodes\nkubectl get pods -n kube-system\nkubectl -n kube-system rollout status daemonset/s2ktux-bridge\nkubectl -n kube-system rollout status deployment/coredns',
  `${api}; ${node('cka-cp1')}; kubectl -n kube-system get ds s2ktux-bridge kube-proxy -o json | jq -e '(.items|length)==2 and all(.items[]; .status.desiredNumberScheduled>0 and .status.numberReady==.status.desiredNumberScheduled)'; kubectl -n kube-system get deployment coredns -o json | jq -e '.status.availableReplicas>=1'`
 ),
 task('c26-a',26,'Incorporar el primer worker · I',
  'Con el control plane y la red ya preparados, genera un token de incorporación válido. Usa el comando de kubeadm en cka-w1 para incorporarlo al clúster. Deja el nodo Ready; no copies admin.conf al worker.',
  joinSolution(1),`${api}; ${node('cka-w1')}`,
  {checkSteps:Object.freeze([{node:'worker1',command:certificadoWorker(1)}])}
 ),
 task('c26-b',26,'Segundo worker y certificado · II',
  'Incorpora también cka-w2 y deja los tres nodos Ready. En cka-w2 comprueba el certificado cliente del kubelet y su identidad system:node:cka-w2. El worker debe funcionar sin recibir el kubeconfig del administrador.',
  joinSolution(2)+'\n\n# En cka-w2\nopenssl x509 -in /var/lib/kubelet/pki/kubelet-client-current.pem -noout -subject',
  `${api}; ${node('cka-cp1')}; ${node('cka-w1')}; ${node('cka-w2')}`,
  {checkSteps:Object.freeze([{node:'worker2',command:certificadoWorker(2)}])}
 )
]);
