// Esperar respuestas reales, sin reiniciar servicios ni reparar sesiones.
// curl evita arrancar repetidamente clientes Go durante el calentamiento.
export function ordenSaludAPIHA(){
 return `set -eu; deadline=$(($(date +%s)+180)); while test "$(date +%s)" -lt "$deadline"; do healthy=1; for ip in 10.77.0.10 10.77.0.11 10.77.0.12; do if response=$(curl --fail --silent --show-error --max-time 10 --cacert /etc/kubernetes/pki/ca.crt --cert /etc/kubernetes/pki/apiserver-kubelet-client.crt --key /etc/kubernetes/pki/apiserver-kubelet-client.key "https://$ip:6443/readyz") && test "$response" = ok; then :; else healthy=0; break; fi; done; test "$healthy" = 1 && exit 0; sleep 10; done; exit 1`;
}
export async function esperarAPIsHARecuperadas(run){
 if(typeof run!=='function')throw Error('Falta la consulta nativa de HA');
 // Arrancar desde discos no reanuda procesos ya calientes. Dar tiempo a
 // sus APIs, sin reiniciarlas ni modificar los datos del alumno.
 for(let attempt=1;attempt<=3;attempt++){
  const result=await run('controlplane','Esperar las API después del arranque · '+attempt+'/3',ordenSaludAPIHA(),240000);
  if(result?.ok===true)return;
  if(result?.ok!==false)throw Error('No se ha recibido el estado de las API HA');
 }
 throw Error('Las API HA todavía no están disponibles; se conservan los discos y puedes revisar sus servicios.');
}
