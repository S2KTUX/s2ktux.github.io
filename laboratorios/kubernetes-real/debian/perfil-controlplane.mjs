// Reservas CPU nativas, no CPU extra ni respuestas simuladas. Suma 650m;
// deja 100m para CoreDNS dentro de los 750m allocatable del nodo.
// Mantiene límites de CPU/memoria y todas las comprobaciones de salud.
export const reservasCPU=Object.freeze({'kube-apiserver':'250m',etcd:'250m','kube-controller-manager':'100m','kube-scheduler':'50m'});
export function parcheControlPlane(component){
 if(!Object.hasOwn(reservasCPU,component))throw Error('Componente no permitido');
 const readiness=['kube-apiserver','kube-scheduler'].includes(component)?'      readinessProbe:\n        periodSeconds: 10\n':'';
 return `spec:\n  containers:\n    - name: ${component}\n      resources:\n        requests:\n          cpu: ${reservasCPU[component]}\n${readiness}`;
}
