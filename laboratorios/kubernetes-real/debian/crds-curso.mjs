export function ordenConsultarCRDs(names,predicate){
 if(!names.length||names.some(name=>!/^[a-z][a-z0-9]*(?:\.[a-z][a-z0-9-]*)+$/.test(name)))throw Error('CRDs no válidos');
 return `crds=$(kubectl get crds -o json --request-timeout=20s) && test -n "$crds" && echo "$crds" | jq -e --argjson expected '${JSON.stringify(names)}' '[.items[] | select(.metadata.name as $name | $expected | index($name))] | ${predicate}'`;
}
export const ordenCRDsEstablecidos=names=>ordenConsultarCRDs(names,'length=='+names.length+' and all(.[]; any(.status.conditions[]?; .type=="Established" and .status=="True"))');
export async function prepararCRDsCurso(run,names,files,{allowInstall=true}={}){
 if(files.length!==names.length||files.some(path=>!/^\/opt\/curso\/15-23\/crds\/\d{2}\.yaml$/.test(path)))throw Error('Archivos CRD no válidos');
 const absent=await run('controlplane','Consultar los CRDs del complemento','set -eu; '+ordenConsultarCRDs(names,'length==0'),60000);
 if(absent?.ok===true){
  if(!allowInstall)throw Error('El proveedor estaba activado pero faltan sus CRDs. No se reparan cambios del alumno.');
  const result=await run('controlplane','Instalar los CRDs originales del complemento','set -eu; kubectl create --validate=strict --request-timeout=120s '+files.map(path=>'-f '+path).join(' '),300000);
  if(result?.ok!==true)throw Error('No se pudieron instalar los CRDs');
 }else if(absent?.ok!==false)throw Error('No se pudieron consultar los CRDs');
 const result=await run('controlplane','Comprobar los CRDs sin modificarlos','set -eu; deadline=$(($(date +%s)+120)); until ('+ordenCRDsEstablecidos(names)+'); do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 1; done',180000);
 if(result?.ok!==true)throw Error('Faltan CRDs o no están establecidos; no se sobrescribe una instalación parcial.');
}
