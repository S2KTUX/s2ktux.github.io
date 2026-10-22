import {writeFile} from 'node:fs/promises';
import {EJERCICIOS_ADMINISTRACION} from '../laboratorios/kubernetes-real/debian/ejercicios-administracion.mjs';
const lines=['#!/bin/sh','set -eu','echo PRUEBA_STATIC_PODS_REAL',"case \"${1:-all}\" in all|c24-a|c24-b) ;; *) exit 2;; esac"];
for(const task of EJERCICIOS_ADMINISTRACION){
 lines.push('if test "${1:-all}" = all || test "${1:-all}" = '+task.id+'; then','echo INICIO_'+task.id,...task.prepare,
  'if (set -eu; '+task.check+'); then echo ERROR_ACEPTO_SIN_RESOLVER; exit 1; fi',task.solution,
  'deadline=$(($(date +%s)+180)); until (set -eu; '+task.check+'); do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 2; done','echo POSITIVO_'+task.id);
 if(task.equivalent)lines.push(task.equivalent,'deadline=$(($(date +%s)+180)); until (set -eu; '+task.check+'); do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 2; done','echo EQUIVALENTE_'+task.id);
 if(task.id==='c24-b')lines.push(`old=$(kubectl -n p24b get pod curso-static-b-cka-cp1 -o jsonpath='{.metadata.uid}')`,
  'kubectl -n p24b delete pod curso-static-b-cka-cp1 --wait=false',
  `deadline=$(($(date +%s)+120)); while :; do current=$(kubectl -n p24b get pod curso-static-b-cka-cp1 -o jsonpath='{.metadata.uid}' 2>/dev/null || true); if test -n "$current" && test "$current" != "$old"; then break; fi; test "$(date +%s)" -lt "$deadline" || exit 1; sleep 2; done`,
  'kubectl -n p24b wait --for=condition=Ready pod/curso-static-b-cka-cp1 --timeout=120s',task.check,'echo MIRROR_RECREADO_c24-b');
 lines.push(task.negative,'if (set -eu; '+task.check+'); then echo ERROR_ACEPTO_SIN_MANIFIESTO; exit 1; fi','echo NEGATIVO_'+task.id,task.cleanup,'fi');
}
lines.push('kubectl get --raw=/readyz --request-timeout=20s','echo SUITE_STATIC_PODS_OK','');
await writeFile(new URL('../fixtures/kubernetes-static-nativo.sh',import.meta.url),lines.join('\n'));
console.log('Suite candidata de Static Pods: crear, reparar, equivalencia y ausencia del manifiesto. No acredita HA.');
