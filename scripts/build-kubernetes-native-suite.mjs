import {writeFile} from 'node:fs/promises';
import {EJERCICIOS_ACCESO} from '../laboratorios/kubernetes-real/debian/ejercicios-acceso.mjs';
// Banco propio; no contiene credenciales reales ni modifica servicios del host.
// Ejecutar únicamente en una máquina desechable del laboratorio Kubernetes.
const suite=['#!/bin/sh','set -eu','echo "S2KTUX: prueba nativa de permisos y ServiceAccounts"'];
suite.push('case "${1:-all}" in all|'+EJERCICIOS_ACCESO.map(task=>task.id).join('|')+') ;; *) echo "Caso desconocido"; exit 2 ;; esac');
for(const task of EJERCICIOS_ACCESO){
 suite.push('if test "${1:-all}" = all || test "${1:-all}" = '+task.id+'; then',
  'echo "INICIO '+task.id+'"',...task.prepare,task.solution,'echo "VALIDAR '+task.id+'"',task.check,'echo "POSITIVO '+task.id+'"',task.negative,'kubectl get --raw=/readyz --request-timeout=20s',
  'if (set -eu; '+task.check+'); then echo "ERROR: aceptó el caso incompleto '+task.id+'"; exit 1; fi','echo "NEGATIVO '+task.id+'"',task.cleanup,'fi');
}
suite.push('echo "SUITE_ACCESO_OK"','');
await writeFile(new URL('../fixtures/kubernetes-acceso-nativo.sh',import.meta.url),suite.join('\n'));
console.log('Suite nativa generada desde las mismas soluciones y correctores del laboratorio. No se ha ejecutado la VM.');
