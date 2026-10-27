import {etcdHA} from './ha-curso.mjs?v=24fe3922558b4b51';
const api='kubectl get --raw=/readyz --request-timeout=15s';
const vip=`kubectl config view --minify -o json | jq -e '.clusters[0].cluster.server=="https://10.77.0.100:8443" and (.clusters[0].cluster["insecure-skip-tls-verify"]//false)==false'`;
const healthy=`${etcdHA} member list -w json | jq -e '(.members|length)==3'; ${etcdHA} endpoint health --cluster`;
export const EJERCICIOS_HA=Object.freeze([Object.freeze({
 id:'c24-ha',classNumber:24,title:'Alta disponibilidad · II',environment:'ha-cluster',scenarioId:'ha-cluster',validation:'external-report',preflight:api,
 prompt:'En la copia HA hay tres control planes y un acceso común: 10.77.0.100:8443. Crea el ConfigMap prueba-ha con dato=conservado. Detén únicamente haproxy en cka-cp1 y deja ese servicio detenido. Comprueba desde cka-cp2 que el acceso común sigue permitiendo leer el ConfigMap y que los tres miembros de etcd están sanos. No borres Pods, certificados ni datos.',
 prepare:Object.freeze([api]),
 solution:`# En cka-cp1\nkubectl create configmap prueba-ha --from-literal=dato=conservado\nsystemctl stop haproxy\n\n# En cka-cp2\nip address show eth0\nkubectl get --raw=/readyz\nkubectl get configmap prueba-ha -o yaml\n${etcdHA} endpoint health --cluster\n\n# Al terminar la práctica, puedes recuperar el balanceador en cka-cp1:\n# systemctl start haproxy keepalived`,
 check:`${vip}; ${api}; test "$(kubectl get cm prueba-ha -o jsonpath='{.data.dato}')" = conservado; ${healthy}; test "$(systemctl is-active haproxy)" = inactive; test "$(systemctl is-active keepalived)" = inactive; if ip -4 -o addr show eth0 | grep -q '10.77.0.100/24'; then exit 1; fi`,
 checkSteps:Object.freeze(['worker1','worker2'].map(node=>({node,command:`systemctl is-active --quiet haproxy keepalived; ${vip}; ${api}; test "$(kubectl get cm prueba-ha -o jsonpath='{.data.dato}')" = conservado; ${healthy}`}))),
 diagnostics:Object.freeze([{check:'test "$(systemctl is-active haproxy)" = inactive',message:'El balanceador de cka-cp1 sigue activo. El enunciado pide dejarlo detenido y comprobar el acceso desde otro control plane.'}])
})]);
