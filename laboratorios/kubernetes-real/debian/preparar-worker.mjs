import {comandosArchivoDebian} from './archivos-systemd.mjs';
import {comandosMontajeComponentes} from './montaje-componentes.mjs';
import {ordenImagenSaludWorker} from './imagen-salud-worker.mjs';
export function perfilWorker(index){
 if(!['1','2'].includes(String(index)))throw Error('Worker desconocido');
 return {name:'cka-w'+index,ip:'10.77.0.'+(10+Number(index)),mac:'02:00:00:77:00:'+(10+Number(index))};
}
export async function prepararWorkerDebian(index,run,{packaged=false}={}){
 if(typeof packaged!=='boolean')throw Error('Perfil de paquetes del worker inválido');
 const {name,ip,mac}=perfilWorker(index);
 async function upload(path,source){for(const command of comandosArchivoDebian(path,source))await run('Preparar unidad nativa del worker',command);}
 if(packaged)await run('Conservar paquetes APT y kit ya montado en el worker',`set -eu; test ! -e /etc/kubernetes/kubelet.conf; mountpoint -q /mnt/kube-client; for name in kubeadm kubelet kubectl; do test -f /usr/bin/$name && test ! -L /usr/bin/$name; dpkg-query -W "$name"; done; test -x /opt/cni/bin/bridge; mkdir -p /etc/kubernetes/manifests /lib/modules`);
 else await run('Montar binarios y CNI reales del curso',`set -eu; test ! -e /etc/kubernetes/kubelet.conf; mkdir -p /mnt/kube-client /opt/cni/bin /etc/cni/net.d /etc/kubernetes/manifests /etc/systemd/system/kubelet.service.d; mount -t ext4 -o ro /dev/sdb /mnt/kube-client; for binary in /mnt/kube-client/bin/*; do test ! -e "/usr/bin/\${binary##*/}"; ln -s "$binary" "/usr/bin/\${binary##*/}"; done; for plugin in /mnt/kube-client/cni/*; do ln -s "$plugin" "/opt/cni/bin/\${plugin##*/}"; done; mkdir -p /lib/modules`);
 for(const [path,source] of [['/etc/systemd/system/kubelet.service','config/kubelet.service'],['/etc/systemd/system/kubelet.service.d/10-kubeadm.conf','config/10-kubeadm.conf']]){
  const response=await fetch(new URL(source,import.meta.url));if(!response.ok)throw Error('Unidad systemd no disponible');await upload(path,await response.text());
 }
 await run('Importar imágenes nativas y activar unidades del worker','gzip -dc /mnt/kube-client/images/pods.tar.gz | ctr -n k8s.io images import --no-unpack --platform=linux/386 - && ctr -n k8s.io images tag docker.io/library/busybox:1.37.0-musl docker.io/s2ktux/kube-proxy:v1.35.9 && systemctl daemon-reload && systemctl enable kubelet && modprobe overlay && modprobe br_netfilter && sysctl -w net.ipv4.ip_forward=1',300000);
 if(packaged)await run('Preparar imagen local del Job de salud en el worker APT',ordenImagenSaludWorker);
 for(const command of comandosMontajeComponentes())await run('Conservar herramientas y CNI después de reiniciar',command);
 await upload('/etc/systemd/network/10-eth0.network',`[Match]\nName=eth0\n\n[Link]\nMACAddress=${mac}\n\n[Network]\nAddress=${ip}/24\nGateway=10.77.0.1\nDNS=1.1.1.1\n`);
 await run('Identidad y red reales del worker',`set -eu; hostnamectl set-hostname ${name}; printf '127.0.0.1 localhost\\n${ip} ${name}\\n10.77.0.10 cka-cp1\\n' >/etc/hosts; ip link set eth0 down; ip link set eth0 address ${mac}; ip link set eth0 up; networkctl reload; networkctl reconfigure eth0; deadline=$(($(date +%s)+90)); while test "$(date +%s)" -lt "$deadline"; do if ip -4 -o address show dev eth0 | grep -q '${ip}/24' && ! ip -4 -o address show dev eth0 | grep -q '10.77.0.20/24'; then test "$(hostname)" = ${name} && crictl version && exit 0; fi; sleep 2; done; exit 1`,120000);
}
