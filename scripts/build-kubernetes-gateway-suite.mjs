import {writeFile} from 'node:fs/promises';
import {EJERCICIOS_GATEWAY} from '../laboratorios/kubernetes-real/debian/ejercicios-gateway.mjs';
const lines=['#!/bin/sh','set -eu','case "${1:-all}" in all|c23-a|c23-b|c23-c) ;; *) exit 2;; esac'];
for(const t of EJERCICIOS_GATEWAY){
 const solution=t.solution.split('\n'),at=solution.findIndex(line=>line.startsWith('curl '));solution.splice(at,0,t.nativeWait);
 lines.push('if test "${1:-all}" = all || test "${1:-all}" = '+t.id+'; then','echo INICIO_'+t.id,...t.prepare,...solution,t.check,'echo POSITIVO_'+t.id,t.negative,'sleep 5','kubectl get --raw=/readyz --request-timeout=20s','if (set -eu; '+t.check+'); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi','echo NEGATIVO_'+t.id,t.cleanup,'fi');
}
lines.push('echo SUITE_GATEWAY_OK','');
await writeFile(new URL('../fixtures/kubernetes-gateway-nativo.sh',import.meta.url),lines.join('\n'));
