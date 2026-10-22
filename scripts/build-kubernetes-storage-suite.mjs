import {writeFile} from 'node:fs/promises';
import {EJERCICIOS_ALMACENAMIENTO} from '../laboratorios/kubernetes-real/debian/ejercicios-almacenamiento.mjs';
const suite=['#!/bin/sh','set -eu','echo PRUEBA_ALMACENAMIENTO_REAL'];
suite.push('case "${1:-all}" in all|c12-a|c12-b|c12-c) ;; *) exit 2;; esac');
suite.push('# Preparar el componente desde la interfaz: importa la imagen en cka-w1, no en el control plane.','if test "${1:-all}" = all || test "${1:-all}" = c12-c; then','kubectl -n local-path-storage rollout status deployment/local-path-provisioner --timeout=180s','fi');
for(const task of EJERCICIOS_ALMACENAMIENTO)suite.push('if test "${1:-all}" = all || test "${1:-all}" = '+task.id+'; then','echo INICIO_'+task.id,...task.prepare,task.solution,task.check,'echo POSITIVO_'+task.id,task.negative,'kubectl get --raw=/readyz --request-timeout=20s','if (set -eu; '+task.check+'); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi','echo NEGATIVO_'+task.id,task.cleanup,'fi');
suite.push('echo SUITE_ALMACENAMIENTO_OK','');await writeFile(new URL('../fixtures/kubernetes-almacenamiento-nativo.sh',import.meta.url),suite.join('\n'));
console.log('Suite nativa de almacenamiento generada; preparar el complemento desde la interfaz antes de ejecutarla.');
