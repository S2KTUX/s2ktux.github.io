import {comandosMontajeComponentes} from './montaje-componentes.mjs';
import {ordenCompartirEjecutableAdmin} from './compartir-ejecutable-admin.mjs';
// Solo para la base fría privada de administración. Los tres binarios de
// Kubernetes son paquetes APT reales: nunca sustituirlos por enlaces al kit.
export async function prepararAdministracion(run,{sharedCode=false}={}){
 if(typeof sharedCode!=='boolean')throw Error('Ensayo de código compartido inválido');
 await run('Conservar paquetes reales y montar el kit en lectura',`set -eu; test ! -e /etc/kubernetes/admin.conf; for name in kubeadm kubelet kubectl; do test -f /usr/bin/$name && test ! -L /usr/bin/$name; dpkg-query -W "$name"; done; mkdir -p /mnt/kube-client /opt/cni/bin /etc/cni/net.d /etc/kubernetes/patches /etc/systemd/system/kubelet.service.d; mount -t ext4 -o ro /dev/sdb /mnt/kube-client; for binary in /mnt/kube-client/bin/*; do name=\${binary##*/}; case "$name" in kubeadm|kubelet|kubectl) continue;; esac; test ! -e "/usr/bin/$name"; ln -s "$binary" "/usr/bin/$name"; done; for plugin in /mnt/kube-client/cni/*; do ln -s "$plugin" "/opt/cni/bin/\${plugin##*/}"; done; systemctl daemon-reload; systemctl enable kubelet; if ! grep -qw overlay /proc/filesystems; then modprobe overlay; fi; if test ! -e /proc/sys/net/bridge/bridge-nf-call-iptables; then modprobe br_netfilter; fi; grep -qw overlay /proc/filesystems; test -e /proc/sys/net/bridge/bridge-nf-call-iptables; sysctl -w net.ipv4.ip_forward=1; systemctl set-property system.slice CPUWeight=10`);
 for(const command of comandosMontajeComponentes())await run('Montaje persistente del kit auxiliar',command);
 // No activar por defecto una optimización que todavía no supera init.
 if(sharedCode)await run('Compartir páginas del ejecutable 1.35 sin sustituir el paquete APT',ordenCompartirEjecutableAdmin,180000);
}
