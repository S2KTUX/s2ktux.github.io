import {writeFile} from 'node:fs/promises';
import {EJERCICIOS_GATEWAY} from '../laboratorios/kubernetes-real/debian/ejercicios-gateway.mjs';
const lines=['#!/bin/sh','set -eu','case "${1:-all}" in all|c23-a|c23-b|c23-c) ;; *) exit 2;; esac'];
for(const t of EJERCICIOS_GATEWAY){
 const solution=t.solution.split('\n'),at=solution.findIndex(line=>line.startsWith('curl '));solution.splice(at,0,t.nativeWait);
 lines.push('if test "${1:-all}" = all || test "${1:-all}" = '+t.id+'; then','echo INICIO_'+t.id,...t.prepare,...solution,t.check,'echo POSITIVO_'+t.id);
 if(t.id==='c23-a')lines.push('kubectl -n p23a expose pod web --name=web-alias --port=80 --target-port=8080',`kubectl -n p23a patch httproute web --type=json -p '[{"op":"replace","path":"/spec/rules/0/backendRefs/0/name","value":"web-alias"}]'`,`generation=$(kubectl -n p23a get httproute web -o jsonpath='{.metadata.generation}'); kubectl -n p23a wait --for=jsonpath='{.status.parents[0].conditions[0].observedGeneration}'="$generation" --timeout=90s httproute/web`,t.nativeProbe,'if (set -eu; '+t.check+'); then echo ERROR_ACEPTO_SERVICE_DISTINTO; exit 1; fi','echo SERVICE_DISTINTO_RECHAZADO_OK',`kubectl -n p23a patch httproute web --type=json -p '[{"op":"replace","path":"/spec/rules/0/backendRefs/0/name","value":"web"},{"op":"replace","path":"/spec/rules/0/matches/0/path/type","value":"Exact"}]'`,`kubectl -n p23a patch httproute web --type=merge -p '{"spec":{"parentRefs":[{"name":"entrada","namespace":"p23a","group":"gateway.networking.k8s.io","kind":"Gateway","sectionName":"http"}]}}'`,t.nativeWait,t.check,'echo EQUIVALENCIA_PARENTREF_EXPLICITA_OK');
 lines.push(t.negative,'sleep 5','kubectl get --raw=/readyz --request-timeout=20s','if (set -eu; '+t.check+'); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi','echo NEGATIVO_'+t.id,t.cleanup,'fi');
}
lines.push('echo SUITE_GATEWAY_OK','');
await writeFile(new URL('../fixtures/kubernetes-gateway-nativo.sh',import.meta.url),lines.join('\n'));
