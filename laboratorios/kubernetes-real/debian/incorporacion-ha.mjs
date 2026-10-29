// Solo prepara una incorporación nueva; nunca se invoca al recuperar sesiones.
export function ordenReintentarEtcdHA(){
 return `(attempt=1; while test "$attempt" -le 3; do if kubeadm join phase etcd-join --config=/tmp/ha-join.yaml --v=5 >/var/log/ha-etcd-intento.log 2>&1; then cat /var/log/ha-etcd-intento.log; exit 0; else rc=$?; cat /var/log/ha-etcd-intento.log; fi; if ! grep -Eq 'context deadline exceeded|rpc error: code = Unavailable|transport is closing|connection refused' /var/log/ha-etcd-intento.log; then exit "$rc"; fi; test "$attempt" -lt 3 || exit "$rc"; echo "La conexión nativa con etcd agotó su plazo; reintento $attempt de 3"; sleep 15; attempt=$((attempt+1)); done; exit 1)`;
}
export async function incorporarControlPlaneHA({id,fresh,background}){
 if(fresh!==true||!['worker1','worker2'].includes(id)||typeof background!=='function')throw Error('La incorporación por fases requiere un miembro HA nuevo');
 const config='--config=/tmp/ha-join.yaml';
 await background(id,'Preparar la incorporación del control plane','kubeadm join phase preflight '+config+' --ignore-preflight-errors=NumCPU,Mem && kubeadm join phase control-plane-prepare all '+config+' && kubeadm join phase kubelet-start '+config,'ha-join-preparacion');
 // kubeadm usa una conexión interna de2s que no amplía etcdAPICall.
 // El alta del miembro comprueba su peerURL antes de añadirlo, por lo que
 // esta fase nativa admite reintento sin duplicar miembros ni omitir TLS.
 await background(id,'Incorporar el miembro real de etcd',ordenReintentarEtcdHA(),'ha-etcd-join');
 await background(id,'Completar incorporación y comprobar el control plane','kubeadm join '+config+' --skip-phases=preflight,control-plane-prepare,kubelet-start,etcd-join --ignore-preflight-errors=NumCPU,Mem --v=2','ha-join');
}
