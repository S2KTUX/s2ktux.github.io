// Solo para fábricas nuevas, nunca para reparar/ocultar averías del alumno.
export function ordenSaludInicial(count){
 if(!Number.isInteger(count)||count<1||count>3)throw Error('Número de nodos inválido');
 // readyz ya comprueba los servicios internos de la API. No hace falta
 // repetir tres consultas sanas; comprobar además todos los nodos esperados.
 return 'set -eu; deadline=$(($(date +%s)+180)); while test "$(date +%s)" -lt "$deadline"; do if test "$(kubectl get --raw=/readyz --request-timeout=10s 2>/dev/null)" = ok && nodes=$(kubectl get nodes -o json --request-timeout=10s) && test -n "$nodes" && printf \'%s\\n\' "$nodes" | jq -e '+"'(.items|length)=="+count+' and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True"))\''+'; then exit 0; fi; sleep 2; done; kubectl get --raw=/readyz?verbose --request-timeout=10s; exit 1';
}
export const comprobarSaludInicial=ordenSaludInicial(1);
