import {comandosArchivoSerie} from '../archivos-serie.mjs';
export function comandosMontajeComponentes(){
 const temporary='/tmp/kubelet-components-mount.conf',unit='[Unit]\nRequiresMountsFor=/mnt/kube-client\n';
 return [
  `set -eu; test -b /dev/sdb; test -r /mnt/kube-client/bin/kubelet; if grep -Eq '^[^#]*[[:space:]]/mnt/kube-client[[:space:]]' /etc/fstab; then awk '$2=="/mnt/kube-client" {if ($1!="/dev/sdb" || $3!="ext4" || $4 !~ /(^|,)ro(,|$)/) exit 1; found=1} END {if (!found) exit 1}' /etc/fstab; else printf '\\n/dev/sdb /mnt/kube-client ext4 ro,defaults 0 0\\n' >>/etc/fstab; fi`,
  ...comandosArchivoSerie(temporary,unit),
  `install -m 644 ${temporary} /etc/systemd/system/kubelet.service.d/30-lab-components.conf && systemctl daemon-reload && systemctl is-enabled kubelet`];
}
