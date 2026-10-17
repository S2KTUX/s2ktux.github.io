// La complejidad aumenta sin arrancar máquinas que aún no se necesitan.
export function modoCurso(params){
 const mode=params.get('mode');
 if(mode!==null&&mode!=='course')throw Error('Modo de laboratorio desconocido');
 return mode==='course';
}
export function siguienteWorker(ids){
 const nodes=new Set(ids);
 if(!nodes.has('controlplane'))return null;
 if(!nodes.has('worker1'))return '1';
 if(!nodes.has('worker2'))return '2';
 return null;
}
export function textoWorker(ids){
 const next=siguienteWorker(ids);
 return next==='1'?'Añadir primer worker':next==='2'?'Añadir segundo worker':'Dos workers añadidos';
}
export const permitirAplicacionesIniciales=`set -eu; kubectl taint node cka-cp1 node-role.kubernetes.io/control-plane:NoSchedule-; kubectl wait --for=condition=Ready node/cka-cp1 --timeout=120s; kubectl get --raw=/readyz --request-timeout=15s`;
export const separarControlPlane=`set -eu; kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s; kubectl taint node cka-cp1 node-role.kubernetes.io/control-plane=:NoSchedule --overwrite`;
