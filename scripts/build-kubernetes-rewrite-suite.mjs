import {writeFile} from 'node:fs/promises';
import {prepararRewrite} from '../laboratorios/kubernetes-real/debian/rewrite-curso.mjs';
import {prepararGateway} from '../laboratorios/kubernetes-real/debian/gateway-curso.mjs';
import {EJERCICIOS_INGRESS} from '../laboratorios/kubernetes-real/debian/ejercicios-ingress.mjs';
const lines=['#!/bin/sh','set -eu','echo INICIO_COMPLEMENTOS_BAJO_DEMANDA'];
const collect=async(fn,negative)=>{
 await fn(async(id,label,command)=>{if(id!=='controlplane')throw Error('Nodo no esperado');const ok=!negative.includes(label);lines.push('echo '+JSON.stringify(label),...(ok?[command]:['if ('+command+'); then echo ERROR_ESTADO_PREVIO; exit 1; fi']));return {ok};});
};
await collect(prepararGateway,['Consultar los CRDs del complemento']);
lines.push('echo GATEWAY_EXISTENTE_SIN_REINSTALAR_OK');
await collect(prepararRewrite,['Consultar el proveedor CRD existente']);
lines.push('echo REWRITE_ACTIVADO_OK');
const t=EJERCICIOS_INGRESS.find(t=>t.id==='c15-d'),solution=t.solution.split('\n'),at=solution.findIndex(line=>line.startsWith('curl '));solution.splice(at,0,t.nativeWait);
lines.push(...t.prepare,...solution,t.check,'echo POSITIVO_c15-d',t.negative,'if (set -eu; '+t.check+'); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi','echo NEGATIVO_c15-d',t.cleanup);
await collect(prepararGateway,['Consultar los CRDs del complemento']);
const certificate=EJERCICIOS_INGRESS.find(t=>t.id==='c15-c').prepare.find(c=>c.startsWith('openssl ')).replaceAll('/root/p15c.','/tmp/qa-ecdsa-perf.');
lines.push('test ! -e /tmp/qa-ecdsa-perf.key && test ! -e /tmp/qa-ecdsa-perf.crt','started=$(date +%s)',certificate,'echo CERTIFICADO_EC_SEGUNDOS=$(($(date +%s)-started))','rm /tmp/qa-ecdsa-perf.key /tmp/qa-ecdsa-perf.crt','kubectl get --raw=/readyz --request-timeout=20s',`kubectl get nodes -o json | jq -e '(.items|length)==2 and all(.items[]; any(.status.conditions[]; .type=="Ready" and .status=="True") and any(.status.conditions[]; .type=="MemoryPressure" and .status=="False"))'`,'echo REWRITE_GATEWAY_CERTIFICADO_OK','');
await writeFile(new URL('../fixtures/kubernetes-rewrite-nativo.sh',import.meta.url),lines.join('\n'));
