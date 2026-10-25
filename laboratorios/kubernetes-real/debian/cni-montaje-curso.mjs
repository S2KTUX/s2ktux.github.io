// Candidato para init/join manuales: CNI bridge/host-local auténtica.
// Solo se entrega en el escenario aislado de montaje, nunca en estudio.
// Pendiente de aceptación nativa; no sustituye Calico ni dice serlo.
const name='s2ktux-bridge';
export function manifiestoCniMontaje({endpoint='https://10.77.0.10:6443'}={}){
 if(!['https://10.77.0.10:6443','https://10.77.0.100:8443'].includes(endpoint))throw Error('Endpoint CNI ajeno al laboratorio');
 const config={cniVersion:'1.0.0',name:'kubernetes',plugins:[{type:'bridge',bridge:'cni0',isGateway:true,hairpinMode:true,ipMasq:false,ipam:{type:'host-local',ranges:[[{subnet:'__POD_CIDR__'}]],routes:[{dst:'0.0.0.0/0'}]}},{type:'portmap',capabilities:{portMappings:true}}]};
 const script=`#!/bin/sh
set -eu
sa=/var/run/secrets/kubernetes.io/serviceaccount
kctl() {
  /usr/local/bin/kubectl --server='${endpoint}' --certificate-authority="$sa/ca.crt" --token="$(cat "$sa/token")" --cache-dir=/tmp/kube-cache "$@"
}
# Solo enmascarar tráfico que sale de la red de Pods, no entre nodos.
iptables -t nat -C POSTROUTING -s 10.244.0.0/16 ! -d 10.244.0.0/16 -o eth0 -j MASQUERADE 2>/dev/null || iptables -t nat -A POSTROUTING -s 10.244.0.0/16 ! -d 10.244.0.0/16 -o eth0 -j MASQUERADE
while :; do
  # Watch real: no generar consultas continuas mientras no cambian nodos.
  GODEBUG=tlsmlkem=0 kctl get nodes --watch --no-headers -o 'custom-columns=NAME:.metadata.name,CIDR:.spec.podCIDR,IP:.status.addresses[?(@.type=="InternalIP")].address' |
  while read -r node cidr address; do
    case "$cidr" in 10.244.*.0/24) ;; *) continue;; esac
    case "$address" in 10.77.0.10|10.77.0.11|10.77.0.12) ;; *) continue;; esac
    if test "$node" = "$NODE_NAME"; then
      sed "s|__POD_CIDR__|$cidr|g" /config/conflist >/host/cni/10-kubernetes.conflist.tmp
      if cmp -s /host/cni/10-kubernetes.conflist.tmp /host/cni/10-kubernetes.conflist; then
        rm /host/cni/10-kubernetes.conflist.tmp
      else
        mv /host/cni/10-kubernetes.conflist.tmp /host/cni/10-kubernetes.conflist
      fi
    else
      ip route replace "$cidr" via "$address" dev eth0
    fi
  done
  sleep 5
done
`;
 const metadata={name,namespace:'kube-system'};
 const volumes=[{name:'config',configMap:{name}},{name:'cni',hostPath:{path:'/etc/cni/net.d',type:'DirectoryOrCreate'}},{name:'kubectl',hostPath:{path:'/usr/bin/kubectl',type:'File'}}];
 const mounts=[{name:'config',mountPath:'/config',readOnly:true},{name:'cni',mountPath:'/host/cni'},{name:'kubectl',mountPath:'/usr/local/bin/kubectl',readOnly:true}];
 // Misma vista de xtables/bibliotecas nativas que el kube-proxy ya probado.
 for(const [key,path]of [['herramientas-red','/usr/sbin'],['bibliotecas-red','/usr/lib'],['cargador-red','/lib'],['alternativas-red','/etc/alternatives']]){
  volumes.push({name:key,hostPath:{path,type:'Directory'}});mounts.push({name:key,mountPath:path,readOnly:true});
 }
 return {apiVersion:'v1',kind:'List',items:[
  {apiVersion:'v1',kind:'ServiceAccount',metadata:{...metadata}},
  {apiVersion:'rbac.authorization.k8s.io/v1',kind:'ClusterRole',metadata:{name},rules:[{apiGroups:[''],resources:['nodes'],verbs:['get','list','watch']}]},
  {apiVersion:'rbac.authorization.k8s.io/v1',kind:'ClusterRoleBinding',metadata:{name},roleRef:{apiGroup:'rbac.authorization.k8s.io',kind:'ClusterRole',name},subjects:[{kind:'ServiceAccount',name,namespace:'kube-system'}]},
  {apiVersion:'v1',kind:'ConfigMap',metadata:{...metadata},data:{'bridge.sh':script,conflist:JSON.stringify(config)}},
  {apiVersion:'apps/v1',kind:'DaemonSet',metadata:{...metadata},spec:{selector:{matchLabels:{app:name}},template:{metadata:{labels:{app:name}},spec:{serviceAccountName:name,hostNetwork:true,dnsPolicy:'Default',tolerations:[{operator:'Exists'}],containers:[{name:'bridge',image:'busybox:1.37.0-musl',imagePullPolicy:'Never',command:['/bin/sh','/config/bridge.sh'],env:[{name:'NODE_NAME',valueFrom:{fieldRef:{fieldPath:'spec.nodeName'}}}],securityContext:{runAsUser:0,allowPrivilegeEscalation:false,capabilities:{drop:['ALL'],add:['NET_ADMIN']}},resources:{requests:{cpu:'10m',memory:'24Mi'},limits:{memory:'160Mi'}},readinessProbe:{exec:{command:['test','-s','/host/cni/10-kubernetes.conflist']},periodSeconds:5},volumeMounts:mounts}],volumes}}}}
 ]};
}
