// Perfil privado de emulación ya usado en HA: mismos parámetros Raft en
// todos los miembros. No cambia quorum, persistencia, TLS ni health checks.
// https://etcd.io/docs/v3.6/tuning/
export function configurarTiemposEtcd(original){
 if(typeof original!=='string'||/name: (heartbeat-interval|election-timeout)/.test(original))throw Error('Tiempos etcd ya definidos o configuración inválida');
 const quota='      - name: quota-backend-bytes\n        value: "134217728"';
 if(original.split(quota).length!==2)throw Error('Sección etcd ambigua');
 return original.replace(quota,quota+'\n      - name: heartbeat-interval\n        value: "1000"\n      - name: election-timeout\n        value: "10000"');
}
