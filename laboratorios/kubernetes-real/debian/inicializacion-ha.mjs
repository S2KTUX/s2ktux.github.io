// Preparación nueva exclusivamente; nunca se ejecuta al recuperar un guardado.
export async function inicializarControlPlaneHA({fresh,background,execute}){
 if(fresh!==true)throw Error('La preparación por fases requiere una máquina nueva');
 if(typeof background!=='function'||typeof execute!=='function')throw Error('Faltan accesos nativos');
 const config='--config=/tmp/ha-init.yaml';
 const phases=[
  'preflight '+config+' --ignore-preflight-errors=NumCPU,Mem',
  'certs all '+config,
  'kubeconfig all '+config,
  'etcd local '+config,
  'control-plane apiserver '+config,
  'kubelet-start '+config
 ];
 await background('controlplane','Preparar certificados, etcd y API del primer control plane',phases.map(phase=>'kubeadm init phase '+phase).join(' && '),'ha-init-preparacion');
 // El cliente de kubelet no puede consultar todos los recursos de la API.
 // Se usa la credencial de bootstrap que kubeadm acaba de generar y se
 // retira la copia temporal al terminar, incluso si la espera falla.
 const ready=`umask 077; dir=$(mktemp -d /run/ha-bootstrap.XXXXXX); trap 'rm -f "$dir/tls.crt" "$dir/tls.key"; rmdir "$dir"' EXIT; test "$(grep -c 'client-certificate-data:' /etc/kubernetes/super-admin.conf)" = 1; test "$(grep -c 'client-key-data:' /etc/kubernetes/super-admin.conf)" = 1; awk '/client-certificate-data:/{print $2}' /etc/kubernetes/super-admin.conf | base64 -d >"$dir/tls.crt"; awk '/client-key-data:/{print $2}' /etc/kubernetes/super-admin.conf | base64 -d >"$dir/tls.key"; openssl verify -CAfile /etc/kubernetes/pki/ca.crt "$dir/tls.crt"; deadline=$(($(date +%s)+240)); until curl --fail --silent --show-error --max-time 5 --cacert /etc/kubernetes/pki/ca.crt --cert "$dir/tls.crt" --key "$dir/tls.key" https://127.0.0.1:6443/readyz; do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 5; done`;
 await execute('controlplane','Esperar a que el API responda con TLS verificado',ready,300000);
 await background('controlplane','Iniciar los controladores después del API','kubeadm init phase control-plane controller-manager '+config+' && kubeadm init phase control-plane scheduler '+config,'ha-init-controladores');
 await background('controlplane','Completar la inicialización y los permisos del clúster','kubeadm init '+config+' --skip-phases=preflight,certs,kubeconfig,etcd,control-plane,kubelet-start --upload-certs --ignore-preflight-errors=NumCPU,Mem --v=2','ha-init');
}
