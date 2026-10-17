import {comandosArchivoSerie} from '../archivos-serie.mjs';
// Extensión exclusiva del candidato Debian. No amplía las rutas admitidas
// por los instaladores Alpine ni permite escribir un destino arbitrario.
const paths=new Set(['/etc/systemd/system/kubelet.service','/etc/systemd/system/kubelet.service.d/10-kubeadm.conf','/etc/systemd/network/10-eth0.network']);
export function comandosArchivoDebian(path,text){
 if(!paths.has(path))return comandosArchivoSerie(path,text);
 const temporary='/tmp/systemd-kubelet-upload';
 return [...comandosArchivoSerie(temporary,text),`install -m 644 ${temporary} ${path}`];
}
