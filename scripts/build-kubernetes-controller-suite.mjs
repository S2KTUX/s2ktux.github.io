import {writeFile} from 'node:fs/promises';
import {EJERCICIOS_CONTROLADORES} from '../laboratorios/kubernetes-real/debian/ejercicios-controladores.mjs';
import {EJERCICIOS_INGRESS} from '../laboratorios/kubernetes-real/debian/ejercicios-ingress.mjs';
import {ordenComprobarIngress} from '../laboratorios/kubernetes-real/debian/ingress-curso.mjs';
const tasks=[...EJERCICIOS_INGRESS,...EJERCICIOS_CONTROLADORES];
const lines=['#!/bin/sh','set -eu','echo PRUEBA_CONTROLADORES_REAL','case "${1:-all}" in all|c15-a|c15-b|c15-c|c16-a|c16-b|c17-a|c17-b|c18-a|c18-b) ;; *) exit 2;; esac'];
lines.push('case "${1:-all}" in all|c15-*) '+ordenComprobarIngress+' ;; esac');
for(const task of tasks){
 const solution=(task.nativeSolution||task.solution).split('\n');
 if(task.nativeWait){const at=solution.findIndex(line=>line.startsWith('curl '));solution.splice(at<0?solution.length:at,0,task.nativeWait);}
 lines.push('if test "${1:-all}" = all || test "${1:-all}" = '+task.id+'; then','echo INICIO_'+task.id,...task.prepare,...solution,task.check,'echo POSITIVO_'+task.id,task.negative,'kubectl get --raw=/readyz --request-timeout=20s','if (set -eu; '+task.check+'); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi','echo NEGATIVO_'+task.id,task.cleanup,'fi');
}
lines.push('echo SUITE_CONTROLADORES_OK','');
await writeFile(new URL('../fixtures/kubernetes-controladores-nativo.sh',import.meta.url),lines.join('\n'));
console.log('Suite generada: Ingress HTTP/TLS, DaemonSets, StatefulSets y Jobs/CronJobs. Los complementos se preparan por la interfaz antes de ejecutar sus casos.');
