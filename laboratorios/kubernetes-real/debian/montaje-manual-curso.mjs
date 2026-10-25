// Candidato privado para las clases 25 y 26. Nunca se invoca sobre estudio
// ni sobre un guardado. El alumno ejecutará init, apply y join de verdad.
import {manifiestoCniMontaje} from './cni-montaje-curso.mjs?v=c464abab731e1c4b';
export const fabricaMontajeManual='0eefc8d6a447e171e050b7e91c6514fd15f52129ad69c459178c77514e14a882';
const runtime='/opt/kube-lab/api-runtime-1.35/kube-browser-shared';
const folder='/root/montaje-curso';
export function validarContextoMontajeManual(context){
 if(context?.scenario!=='montaje-cluster'||context.factoryVersion!=='v14'||context.factorySha256!==fabricaMontajeManual||context.freshFactory!==true||context.studentSession!==false||context.consoleOpened!==false||context.nodeCount!==1)throw Error('El montaje solo admite una copia nueva y cerrada de su fábrica; no se borra estudio ni una sesión guardada');
 return context;
}
export const parchesMontajeManual=Object.freeze({
 spec:{containers:[{name:'kube-apiserver',resources:{requests:{cpu:'250m'}},readinessProbe:{periodSeconds:10},volumeMounts:[{name:'api-runtime-browser',mountPath:'/usr/local/bin/kube-browser-shared',readOnly:true}]}],volumes:[{name:'api-runtime-browser',hostPath:{path:runtime,type:'File'}}]}
});
export async function prepararMontajeManual({run,upload,context}){
 validarContextoMontajeManual(context);
 if(typeof run!=='function'||typeof upload!=='function')throw Error('Falta la consola nativa del montaje');
 const execute=async(label,command,timeout=240000)=>{
  const result=await run(label,'set -eu; '+command,timeout);
  if(result?.ok!==true)throw Error('No se ha completado: '+label);
 };
 // Todas las barreras preceden a reset. Si falla una, no cambiar la VM.
 // Los bytes de esta fábrica exacta ya se verifican en el navegador ANTES
 // de cargarla. No repetir dentro del emulador el hash de116MB en cada entrada;
 // la aceptación nativa de la fábrica sí conserva el hash del proceso real.
 await execute('Comprobar la copia limpia antes del montaje',`test ! -e ${folder}; test ! -L ${folder}; test "$(kubeadm version -o short)" = v1.35.9; test "$(hostname)" = cka-cp1; test -x ${runtime}; test "$(stat -c %s ${runtime})" = 116641954; test -s /tmp/kubeadm-debian.yaml; test -s /tmp/kube-proxy-browser.json; test -s /tmp/coredns-browser.json; test "$(kubectl get nodes -o name | wc -l)" = 1; test "$(kubectl get pods,deployments,statefulsets,daemonsets,jobs,cronjobs -n default -o name | wc -l)" = 0; kubectl get --raw=/readyz`);
 await execute('Reservar los materiales de este montaje',`mkdir -m 700 ${folder}; cp /tmp/kubeadm-debian.yaml ${folder}/kubeadm.yaml; kubeadm config validate --config=${folder}/kubeadm.yaml`);
 await upload('/tmp/cni-montaje-curso.json',JSON.stringify(manifiestoCniMontaje()));
 // Listas generadas por kubeadm, con los binarios 386 del laboratorio. Las
 // credenciales nuevas las proyecta Kubernetes, no se copia la CA vieja.
 // Un vCPU: 250m sistema +650m CP +10m agente CNI +90m DNS =1000m.
 // Reservar 100m a DNS además del agente impediría que ambos se programasen.
 // Un segundo provoca falsos NotReady bajo emulación. Conservar la sonda
 // HTTP y sus errores503; permitir5s para recibir una respuesta auténtica.
 await execute('Preparar CNI, proxy y DNS para aplicarlos después de init',`jq -s '{apiVersion:"v1",kind:"List",items:[.[] | if .kind=="List" then .items[] else . end] | map(if .kind=="Deployment" and .metadata.name=="coredns" then (.spec.template.spec.containers[] | select(.name=="coredns").resources.requests.cpu)="90m" | (.spec.template.spec.containers[] | select(.name=="coredns").readinessProbe.timeoutSeconds)=5 else . end)}' /tmp/cni-montaje-curso.json /tmp/kube-proxy-browser.json /tmp/coredns-browser.json >${folder}/red.json; kubectl create --dry-run=client --validate=strict --request-timeout=150s -f ${folder}/red.json -o yaml >${folder}/red.yaml; test -s ${folder}/red.yaml; test ! -e ${folder}/preparado`);
 await upload('/etc/kubernetes/patches/kube-apiserver+strategic.yaml',JSON.stringify(parchesMontajeManual));
 await execute('Reiniciar solo el clúster de esta copia nueva',`kubeadm reset --force --cri-socket=unix:///run/containerd/containerd.sock; test ! -e /etc/kubernetes/admin.conf; test ! -e /etc/kubernetes/manifests/kube-apiserver.yaml; rm -f /etc/cni/net.d/10-kubernetes.conflist /root/.kube/config; if ip link show cni0 >/dev/null 2>&1; then ip link delete cni0; fi; test ! -e /etc/cni/net.d/10-kubernetes.conflist; test -s ${folder}/red.yaml; test -s /etc/kubernetes/patches/kube-apiserver+strategic.yaml`,300000);
 // reset es best-effort: puede devolver 0 aunque avise de un contenedor que
 // no ha terminado. No entregar al alumno puertos del clúster anterior.
 await execute('Comprobar que no quedan componentes anteriores',`running=$(crictl --timeout=30s ps -q); for id in $running; do crictl --timeout=30s stop --timeout=10 "$id"; done; test -z "$(crictl --timeout=30s ps -q)"; if ss -H -ltn | awk '{print $4}' | grep -Eq ':(2379|2380|6443|10250|10257|10259)$'; then exit 1; fi; echo montaje-cluster >${folder}/preparado`,240000);
 return {scenario:'montaje-cluster',classNumbers:[25,26],initialized:false,paths:{config:folder+'/kubeadm.yaml',network:folder+'/red.yaml'}};
}
