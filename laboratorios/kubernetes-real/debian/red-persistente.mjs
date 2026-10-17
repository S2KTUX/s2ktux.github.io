import {comandosArchivoGzipWeb} from './archivos-gzip-web.mjs';
import {comandoNatDebian} from './red-cluster.mjs';
const ids=['controlplane','worker1','worker2'];
export function rutaPersistenteDebian(peer,{cidr,ip}){
 if(!ids.includes(peer)||!/^10\.244\.(?:[0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.0\/24$/.test(cidr)||ip!==({controlplane:'10.77.0.10',worker1:'10.77.0.11',worker2:'10.77.0.12'})[peer])throw Error('Ruta de clúster inválida');
 return {path:`/etc/systemd/network/10-eth0.network.d/90-kube-lab-${peer}.conf`,source:`# Red local del laboratorio\n[Route]\nDestination=${cidr}\nGateway=${ip}\n`};
}
async function install(id,path,source,mode,run,{onlyNew=false}={}){
 for(const command of await comandosArchivoGzipWeb('/tmp/kube-lab-red-upload',source))await run(id,'Guardar configuración nativa de red',command);
 const command=`install -m ${mode} /tmp/kube-lab-red-upload ${path}`;
 await run(id,'Instalar configuración nativa de red',onlyNew?`if test ! -e ${path}; then ${command}; fi`:command);
}
export async function persistirNatDebian(id,run,{preserveExisting=false}={}){
 if(!ids.includes(id))throw Error('Nodo desconocido');
 const source=`#!/bin/sh\nset -eu\n# Conservar una cadena existente; no borrar reglas editadas en la sesión.\nif iptables -t nat -L KUBE-LAB-MASQ -n >/dev/null 2>&1; then exit 0; fi\n${comandoNatDebian({preserveExisting})}\n`;
 const unit='[Unit]\nDescription=Red NAT del laboratorio Kubernetes\nAfter=systemd-networkd.service\nBefore=kubelet.service\n\n[Service]\nType=oneshot\nExecStart=/usr/local/sbin/kube-lab-nat\nRemainAfterExit=yes\n\n[Install]\nWantedBy=multi-user.target\n';
 await install(id,'/usr/local/sbin/kube-lab-nat',source,'755',run);
 await install(id,'/etc/systemd/system/kube-lab-nat.service',unit,'644',run);
 await run(id,'Activar NAT persistente sin reiniciar la red','systemctl daemon-reload && systemctl enable --now kube-lab-nat.service && systemctl is-active --quiet kube-lab-nat.service');
}
export async function persistirRutaDebian(id,peer,record,run){
 if(!ids.includes(id)||id===peer)throw Error('Nodo o destino inválido');
 const {path,source}=rutaPersistenteDebian(peer,record);
 await run(id,'Preparar rutas persistentes del nodo','mkdir -p /etc/systemd/network/10-eth0.network.d');
 await install(id,path,source,'644',run,{onlyNew:true});
 await run(id,'Leer rutas persistentes desde networkd','networkctl reload');
}
export async function persistirNamespacesDebian(id,run){
 if(!['worker1','worker2'].includes(id))throw Error('Worker desconocido');
 const source='#!/bin/sh\nset -eu\nmkdir -p /run/netns\nif ! mountpoint -q /run/netns; then mount --bind /run/netns /run/netns; fi\nmount --make-rshared /run/netns\n';
 const unit='[Unit]\nDescription=Namespaces de red del laboratorio Kubernetes\nAfter=local-fs.target\nBefore=containerd.service kubelet.service\n\n[Service]\nType=oneshot\nExecStart=/usr/local/sbin/kube-lab-netns\nRemainAfterExit=yes\n\n[Install]\nWantedBy=multi-user.target\n';
 await install(id,'/usr/local/sbin/kube-lab-netns',source,'755',run);
 await install(id,'/etc/systemd/system/kube-lab-netns.service',unit,'644',run);
 await run(id,'Mantener los namespaces disponibles después de reiniciar','systemctl daemon-reload && systemctl enable --now kube-lab-netns.service && systemctl is-active --quiet kube-lab-netns.service');
}
