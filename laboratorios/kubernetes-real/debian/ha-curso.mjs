// Escenario independiente. Solo prepara máquinas nuevas: recuperar un guardado
// no invoca este constructor ni vuelve a configurar sus servicios o datos.
import {HA,configuracionHA} from './ha-configuracion.mjs?v=8d3e35d945d5f5a8';
import {perfilNodoHA,miembrosHA} from './perfil-ha.mjs?v=45527150f768d0ed';
import {configuracionInitHA,configuracionJoinHA} from './configuracion-admin-curso.mjs?v=c815e37848edde27';
import {parcheControlPlane} from './perfil-controlplane.mjs?v=3bdd05873244d47b';
import {unidadRutasHA} from './ha-rutas.mjs?v=cea7f05f3340abc0';
import {inicializarControlPlaneHA} from './inicializacion-ha.mjs?v=74b30ee8a8427627';
import {esperarFirmaHA} from './esperar-firma-ha.mjs?v=488ca2f524307838';
import {servirRuntimeHA,runtimeHA} from './archivo-http-local.mjs?v=eeb639357e340f4c';
import {incorporarControlPlaneHA} from './incorporacion-ha.mjs';
export const clienteHAQuery=index=>{
 if(!Number.isInteger(index)||index<1||index>3)throw Error('Miembro HA desconocido');
 return 'base=admin-v3&kube=1&components=v7&cluster=1&factory=v14&tls=classical&threaded=1&engine=jit8192-pic-only-v1&kernel=highmem-net-v2&use-scheduling-api=1&ha-member='+index;
};
export const etcdHA='etcdctl --endpoints=https://127.0.0.1:2379 --dial-timeout=15s --command-timeout=40s --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/healthcheck-client.crt --key=/etc/kubernetes/pki/etcd/healthcheck-client.key';
export function validarContextoHA(context){
 if(context?.scenario!=='ha-cluster'||context.fresh!==true||context.studentSession!==false||context.nodeCount!==0)throw Error('HA solo se prepara en una copia nueva independiente; no convierte ni borra estudio o guardados');
}
export async function prepararClusterHA({context,create,connect,run,upload,value,getNode,fetchText,wait=ms=>new Promise(resolve=>setTimeout(resolve,ms))}){
 validarContextoHA(context);
 for(const fn of [create,connect,run,upload,value,getNode,fetchText,wait])if(typeof fn!=='function')throw Error('Falta un acceso nativo del escenario HA');
 const execute=async(id,label,command,timeout=180000)=>{
  const result=await run(id,label,'export GODEBUG=tlsmlkem=0; set -eu; '+command,timeout);
  if(result?.ok!==true)throw Error('No se ha completado: '+label);return result;
 };
 const background=async(id,label,command,basename)=>{
  const log='/var/log/'+basename+'.log',exit='/run/'+basename+'.exit';
  await execute(id,label,`test ! -e ${exit}; (set +e; ${command}; rc=$?; echo "$rc" >${exit}) >${log} 2>&1 </dev/null &`);
  const deadline=Date.now()+1200000;let polls=0;
  while(Date.now()<deadline){
   for(const member of miembrosHA){const child=getNode(member);if(!child)continue;
    if(child.kubeDebianErrors?.length)throw Error('Un nodo HA tiene un error previo');
    const fault=child.kubeDebianTranscript?.replace(/\r/g,'').split('\n').find(line=>/^\[\s*\d+(?:\.\d+)?\].*(NETDEV WATCHDOG|I\/O error, dev|lost interrupt)/.test(line));
    if(fault)throw Error('Error nativo de hardware durante HA: '+fault);
   }
   const result=await value(id,`if test -r ${exit}; then cat ${exit}; else echo pendiente; fi`);
   if(result!=='pendiente'){
    if(result==='0')return;
    await execute(id,'Leer el fallo real de kubeadm','tail -80 '+log);throw Error(label+' ha fallado: '+result);
   }
   if(polls++%3===0)await execute(id,'Leer progreso real de kubeadm','tail -12 '+log,45000);
   await wait(10000);
  }
  await execute(id,'Leer la espera real de kubeadm','tail -80 '+log);throw Error(label+' no terminó dentro de su plazo');
 };
 const init=configuracionInitHA(await fetchText('materiales-ha/kubeadm.yaml'));
 const etcdPatch=(await fetchText('materiales-ha/etcd-strategic.yaml')).replace('- name: etcd','- name: etcd\n      resources:\n        requests:\n          cpu: 250m');
 const cniOriginal=JSON.parse(await fetchText('../componentes/root/10-kubernetes.conflist'));
 async function prepareMember(index){
  const id=miembrosHA[index-1],profile=perfilNodoHA(id),config=configuracionHA(index,{readyMembers:Math.max(1,index-1)});
  await create(id,clienteHAQuery(index));
  const child=getNode(id);
  if(child.kubeDebianSnapshot?.terminalOpened!==false||child.kubeDebianRestoreNode)throw Error('No se configura una consola abierta ni un guardado');
  await execute(id,'Comprobar Linux limpio y watchdog de red',`test ! -e /etc/kubernetes/admin.conf; test ! -e /etc/kubernetes/kubelet.conf; test "$(cat /sys/module/ne2k_pci/parameters/tx_watchdog_ms)" = 5000; test ! -L /usr/bin/kubeadm`);
  await upload(id,'/tmp/ha-network.conf',`[Match]\nName=eth0\n\n[Link]\nMACAddress=${profile.mac}\n\n[Network]\nAddress=${profile.ip}/24\nGateway=10.77.0.1\nDNS=1.1.1.1\n`);
  await execute(id,'Asignar identidad real a '+profile.name,`hostnamectl set-hostname ${profile.name}; install -m 644 /tmp/ha-network.conf /etc/systemd/network/10-eth0.network; ip link set eth0 down; ip link set eth0 address ${profile.mac}; ip link set eth0 up; networkctl reload; networkctl reconfigure eth0; deadline=$(($(date +%s)+90)); while test "$(date +%s)" -lt "$deadline"; do if ip -4 -o addr show eth0 | grep -q '${profile.ip}/24' && ! ip -4 -o addr show eth0 | grep -q '10.77.0.20/24'; then exit 0; fi; sleep 2; done; exit 1`,120000);
  await upload(id,'/tmp/ha-hosts','127.0.0.1 localhost\n'+HA.members.map(node=>node.ip+' '+node.name+'\n').join(''));
  await execute(id,'Conservar los nombres de los control planes','install -m 644 /tmp/ha-hosts /etc/hosts');
  await child.kubeDebianPromptHA(profile.name);
  // Unir al switch solo después de dejar de compartir la MAC/IP de la base.
  connect(id);
  for(const [path,text] of [['/tmp/ha-haproxy.conf',config.haproxy],['/tmp/ha-keepalived.conf',config.keepalived],['/tmp/ha-daemon-args',config.daemonArgs],['/tmp/ha-keepalived-unit.conf',config.keepalivedUnit]])await upload(id,path,text);
  await execute(id,'Activar HAProxy y Keepalived en '+profile.name,'install -m 644 /tmp/ha-haproxy.conf /etc/haproxy/haproxy.cfg; install -m 644 /tmp/ha-keepalived.conf /etc/keepalived/keepalived.conf; install -m 644 /tmp/ha-daemon-args /etc/default/keepalived; mkdir -p /etc/systemd/system/keepalived.service.d; install -m 644 /tmp/ha-keepalived-unit.conf /etc/systemd/system/keepalived.service.d/20-haproxy.conf; systemctl daemon-reload; haproxy -c -f /etc/haproxy/haproxy.cfg; keepalived --vrrp --config-test -f /etc/keepalived/keepalived.conf; systemctl enable --now haproxy keepalived; systemctl is-active --quiet haproxy keepalived');
  await execute(id,'Importar imágenes locales del control plane','gzip -dc /mnt/kube-client/images/pods.tar.gz | ctr -n k8s.io images import --no-unpack --platform=linux/386 -',300000);
  await execute(id,'Preparar las etiquetas de las imágenes 386',`for name in kube-apiserver kube-controller-manager kube-scheduler; do ctr -n k8s.io images tag docker.io/library/busybox:1.37.0-musl docker.io/s2ktux/$name:v1.35.9; done; ctr -n k8s.io images tag docker.io/library/busybox:1.37.0-musl docker.io/s2ktux/etcd:3.6.6-lab1; ctr -n k8s.io images tag docker.io/s2ktux/pause-lab:1 docker.io/s2ktux/pause:3.10.1; ctr -n k8s.io images check --snapshotter=overlayfs --quiet >/tmp/ha-images-ready; for name in kube-apiserver kube-controller-manager kube-scheduler; do grep -Fx "docker.io/s2ktux/$name:v1.35.9" /tmp/ha-images-ready; done`,180000);
  const runtimePath='/opt/kube-lab/api-runtime-1.35';
  const transfer=await servirRuntimeHA(child.kubeDebianVM.bus,id,{copyFrame:bytes=>new child.Uint8Array(bytes)});
  try{await execute(id,'Instalar el runtime verificado del API 1.35',`test ! -e ${runtimePath}; mkdir -p ${runtimePath}; curl --fail --show-error --max-time 150 ${transfer.url} -o ${runtimePath}/paquete.tar.gz; test "$(sha256sum ${runtimePath}/paquete.tar.gz | cut -d ' ' -f1)" = ${runtimeHA.archiveSha256}; tar -xzf ${runtimePath}/paquete.tar.gz --no-same-owner --no-same-permissions -C ${runtimePath}; (cd ${runtimePath} && sha256sum -c SHA256SUMS); test "$(sha256sum ${runtimePath}/kube-browser-shared | cut -d ' ' -f1)" = ${runtimeHA.binarySha256}; chmod 755 ${runtimePath}/kube-browser-shared; rm ${runtimePath}/paquete.tar.gz`,240000);}
  finally{transfer.close();}
  for(const component of ['kube-apiserver','kube-controller-manager','kube-scheduler']){
   const patch=component==='kube-apiserver'?JSON.stringify({spec:{containers:[{name:component,resources:{requests:{cpu:'250m'}},readinessProbe:{periodSeconds:10},volumeMounts:[{name:'api-runtime-browser',mountPath:'/usr/local/bin/kube-browser-shared',readOnly:true}]}],volumes:[{name:'api-runtime-browser',hostPath:{path:runtimePath+'/kube-browser-shared',type:'File'}}]}}):parcheControlPlane(component);
   await upload(id,'/etc/kubernetes/patches/'+component+'+strategic.yaml',patch);
  }
  await upload(id,'/etc/kubernetes/patches/etcd+strategic.yaml',etcdPatch);
  if(index>1){const epoch=await value('controlplane','date +%s');if(!/^[0-9]{10}$/.test(epoch))throw Error('Reloj HA inválido');await execute(id,'Sincronizar reloj antes de TLS','date -u -s @'+epoch);}
 }
 await prepareMember(1);
 await upload('controlplane','/tmp/ha-init.yaml',init);
 await execute('controlplane','Validar configuración HA','kubeadm config validate --config=/tmp/ha-init.yaml');
 await inicializarControlPlaneHA({fresh:context.fresh,background,execute});
 await execute('controlplane','Verificar API con el certificado del VIP',`kubectl get --raw=/readyz --request-timeout=30s; test "$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')" = https://${HA.vip}:${HA.port}`);
 const join=await value('controlplane','kubeadm token create --ttl=2h --print-join-command');
 const match=/^kubeadm join 10\.77\.0\.100:8443 --token ([a-z0-9]{6}\.[a-z0-9]{16})\s+--discovery-token-ca-cert-hash sha256:([a-f0-9]{64})\s*$/.exec(join);
 const certificateKey=await value('controlplane',"grep -E '^[a-f0-9]{64}$' /var/log/ha-init.log | tail -1");
 if(!match||!/^[a-f0-9]{64}$/.test(certificateKey))throw Error('La incorporación no pertenece al clúster HA');
 // No arrancar otras dos VMs hasta que el primer controlador haya firmado
 // de verdad el token. Evita gastar CPU y descargar recursos si aún no está listo.
 await esperarFirmaHA({tokenId:match[1].split('.')[0],
  read:tokenId=>value('controlplane',`if signature=$(kubectl --request-timeout=15s -n kube-public get cm cluster-info -o jsonpath='{.data.jws-kubeconfig-${tokenId}}'); then printf '%s' "$signature"; fi`),
  onPending:()=>execute('controlplane','Consultar el arranque real del firmante HA',"crictl --timeout=15s ps -a --name '^kube-controller-manager$'",45000),wait
 });
 for(const index of [2,3]){
  const id=miembrosHA[index-1];await prepareMember(index);
  await upload(id,'/tmp/ha-join.yaml',configuracionJoinHA(index,{token:match[1],hash:match[2],certificateKey}));
  await execute(id,'Validar incorporación del control plane','kubeadm config validate --config=/tmp/ha-join.yaml');
  await incorporarControlPlaneHA({id,fresh:context.fresh,background});
  // Solo balancear hacia miembros cuya incorporación nativa ha terminado.
  for(const member of miembrosHA.slice(0,index)){
   const memberIndex=miembrosHA.indexOf(member)+1;
   await upload(member,'/tmp/ha-haproxy-incorporados.conf',configuracionHA(memberIndex,{readyMembers:index}).haproxy);
   await execute(member,'Incorporar el API preparado al balanceador','haproxy -c -f /tmp/ha-haproxy-incorporados.conf; install -m 644 /tmp/ha-haproxy-incorporados.conf /etc/haproxy/haproxy.cfg; systemctl reload haproxy; systemctl is-active --quiet haproxy keepalived');
  }
 }
 const cidrs=[];
 for(const id of miembrosHA){
  const profile=perfilNodoHA(id),cidr=await value('controlplane',`kubectl get node ${profile.name} -o jsonpath='{.spec.podCIDR}'`);
  if(!/^10\.244\.(?:0|[1-9][0-9]{0,2})\.0\/24$/.test(cidr)||Number(cidr.split('.')[2])>255||cidrs.includes(cidr))throw Error('PodCIDR HA inválido o repetido');cidrs.push(cidr);
  const cni=structuredClone(cniOriginal);cni.plugins[0].ipam.ranges[0][0].subnet=cidr;
  await upload(id,'/tmp/ha-cni.json',JSON.stringify(cni));await execute(id,'Instalar CNI del control plane','install -m 644 /tmp/ha-cni.json /etc/cni/net.d/10-kubernetes.conflist');
  await execute(id,'Comprobar los componentes de '+profile.name,`kubectl -n kube-system wait --for=condition=Ready pod/kube-apiserver-${profile.name} pod/etcd-${profile.name} pod/kube-controller-manager-${profile.name} pod/kube-scheduler-${profile.name} --timeout=240s`,300000);
 }
 for(const [index,id] of miembrosHA.entries()){
  await upload(id,'/tmp/ha-pod-routes.service',unidadRutasHA(index+1,cidrs));
  await execute(id,'Conservar las rutas entre control planes','install -m 644 /tmp/ha-pod-routes.service /etc/systemd/system/ha-pod-routes.service; systemctl daemon-reload; systemctl enable --now ha-pod-routes.service; systemctl is-active --quiet ha-pod-routes.service');
 }
 await execute('controlplane','Verificar tres nodos Ready y quorum real',`test "$(kubectl get nodes -o name | wc -l)" = 3; kubectl wait --for=condition=Ready nodes --all --timeout=180s; ${etcdHA} member list -w json | jq -e '(.members|length)==3'; ${etcdHA} endpoint health --cluster`,300000);
 for(const id of miembrosHA)await execute(id,'Comprobar el ejecutable real del API',`container=$(crictl ps --name '^kube-apiserver$' -q | head -1); test -n "$container"; pid=$(crictl inspect "$container" | jq -r '.info.pid'); test "$(sha256sum /proc/$pid/exe | cut -d ' ' -f1)" = ${runtimeHA.binarySha256}`,180000);
 return {scenario:'ha-cluster',controlPlanes:3,endpoint:`https://${HA.vip}:${HA.port}`};
}
