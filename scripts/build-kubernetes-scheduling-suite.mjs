import {writeFile} from 'node:fs/promises';
import {EJERCICIOS_SCHEDULING,discosRequeridosJQ} from '../laboratorios/kubernetes-real/debian/ejercicios-scheduling.mjs';
import {EJERCICIOS_RED,guardasRed} from '../laboratorios/kubernetes-real/debian/ejercicios-red.mjs';
import {EJERCICIOS_DNS} from '../laboratorios/kubernetes-real/debian/ejercicios-dns.mjs';
const tasks=[...EJERCICIOS_SCHEDULING,...EJERCICIOS_RED,...EJERCICIOS_DNS];
const lines=['#!/bin/sh','set -eu','echo PRUEBA_SCHEDULING_RED_REAL','case "${1:-all}" in all|equivalencias|'+tasks.map(t=>t.id).join('|')+') ;; *) exit 2;; esac'];
for(const task of tasks){
 lines.push('if test "${1:-all}" = all || test "${1:-all}" = '+task.id+'; then','echo INICIO_'+task.id,...task.prepare,...(task.nativeSolution||task.solution).split('\n'),task.nativeWait||'true',task.check,'echo POSITIVO_'+task.id,task.negative,'kubectl get --raw=/readyz --request-timeout=20s','if (set -eu; '+task.check+'); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi','echo NEGATIVO_'+task.id);
 if(guardasRed[task.id]){
  const breakScenario=task.id==='c21-a'?'kubectl -n p21a delete pod intruso':task.id==='c21-b'?`kubectl -n p21b patch service api --type=json -p '[{"op":"remove","path":"/spec/ports/1"}]'`:'kubectl -n p21c delete pod ajeno';
  lines.push(guardasRed[task.id],breakScenario,'if (set -eu; '+guardasRed[task.id]+'); then echo ERROR_ACEPTO_ESCENARIO_ROTO; exit 1; fi','echo GUARDA_ESCENARIO_'+task.id);
 }
 lines.push(task.cleanup,'fi');
}
lines.push('if test "${1:-all}" = all || test "${1:-all}" = equivalencias; then');
const expression=values=>({key:'p19b.s2ktux.local/disco',operator:'In',values});
for(const [terms,accepted]of [
 [[{matchExpressions:[expression(['ssd','nvme'])]}],true],
 [[{matchExpressions:[expression(['ssd'])]},{matchExpressions:[expression(['nvme'])]}],true],
 [[{matchExpressions:[expression(['ssd','nvme','hdd'])]}],false],
 [[{matchExpressions:[expression(['ssd'])]}],false],
 [[{matchExpressions:[expression(['ssd','nvme'])]},{matchExpressions:[{key:'otra',operator:'Exists'}]}],false]
]){
 const object={spec:{affinity:{nodeAffinity:{requiredDuringSchedulingIgnoredDuringExecution:{nodeSelectorTerms:terms}}}}};
 const command="echo '"+JSON.stringify(object)+"' | jq -e '"+discosRequeridosJQ+"'";
 lines.push(accepted?command:'if '+command+'; then echo ERROR_AFINIDAD_PERMISIVA; exit 1; fi');
}
lines.push('echo EQUIVALENCIAS_AFINIDAD_OK','fi');
lines.push('echo SUITE_SCHEDULING_RED_OK','');
await writeFile(new URL('../fixtures/kubernetes-scheduling-red-nativo.sh',import.meta.url),lines.join('\n'));
console.log('Diez prácticas: scheduling, tolerations, filtrado real de red y DNS. El controlador de políticas se prepara antes desde la interfaz.');
