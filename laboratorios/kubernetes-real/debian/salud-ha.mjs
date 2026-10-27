// Esperar respuestas reales, sin reiniciar servicios ni reparar sesiones.
// curl evita arrancar repetidamente clientes Go durante el calentamiento.
export function ordenSaludAPIHA(){
 return `set -eu; deadline=$(($(date +%s)+180)); while test "$(date +%s)" -lt "$deadline"; do healthy=1; for ip in 10.77.0.10 10.77.0.11 10.77.0.12; do if response=$(curl --fail --silent --show-error --max-time 10 --cacert /etc/kubernetes/pki/ca.crt --cert /etc/kubernetes/pki/apiserver-kubelet-client.crt --key /etc/kubernetes/pki/apiserver-kubelet-client.key "https://$ip:6443/readyz") && test "$response" = ok; then :; else healthy=0; break; fi; done; test "$healthy" = 1 && exit 0; sleep 10; done; exit 1`;
}
