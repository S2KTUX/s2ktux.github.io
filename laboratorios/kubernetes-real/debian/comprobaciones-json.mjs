// POSIX sh no garantiza pipefail. jq sin entrada puede devolver éxito.
// Obtener primero el JSON impide aprobar un recurso inexistente o un snapshot inválido.
export function exigirJSON(command){
 return command.replace(/((?:kubectl|etcdutl) [^|\n;&()]+?) \| jq /g,(_match,query)=>
  'object=$('+query+') && test -n "$object" && printf \'%s\\n\' "$object" | jq ');
}
