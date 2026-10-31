// Solo para fábricas nuevas, nunca para reparar/ocultar averías del alumno.
export function ordenSaludInicial(count){
 if(!Number.isInteger(count)||count<1||count>3)throw Error('Número de nodos inválido');
 // readyz ya comprueba los servicios internos de la API. No hace falta
 // repetir tres consultas sanas; comprobar además todos los nodos esperados.
 // Consultar con curl evita calentar dos procesos Go de kubectl por vuelta.
 // Los mismos certificados locales y la misma validación TLS; solo lectura.
 return 'set -eu; api(){ curl --fail --silent --show-error --max-time 10 --cacert /etc/kubernetes/pki/ca.crt --cert /etc/kubernetes/pki/apiserver-kubelet-client.crt --key /etc/kubernetes/pki/apiserver-kubelet-client.key "https://127.0.0.1:6443$1"; }; deadline=$(($(date +%s)+180)); while test "$(date +%s)" -lt "$deadline"; do if test "$(api /readyz 2>/dev/null)" = ok && nodes=$(api /api/v1/nodes) && test -n "$nodes" && printf \'%s\\n\' "$nodes" | jq -e '+"'(.items|length)=="+count+' and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True"))\''+'; then exit 0; fi; sleep 2; done; api /readyz?verbose; exit 1';
}
export const comprobarSaludInicial=ordenSaludInicial(1);
