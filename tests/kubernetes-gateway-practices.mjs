import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {EJERCICIOS_GATEWAY} from '../laboratorios/kubernetes-real/debian/ejercicios-gateway.mjs';
import {prepararGateway,ordenComprobarCRDsGateway} from '../laboratorios/kubernetes-real/debian/gateway-curso.mjs';
const fixture=readFileSync(new URL('../fixtures/kubernetes-gateway-nativo.sh',import.meta.url),'utf8'),bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash';
assert.deepEqual(EJERCICIOS_GATEWAY.map(t=>t.id),['c23-a','c23-b','c23-c']);
const q=s=>"'"+s.replaceAll("'","'\\''")+"'";
for(const t of EJERCICIOS_GATEWAY){
 assert.ok(t.prepare.length&&t.negative&&t.nativeWait&&t.cleanup&&t.diagnostics.length);
 assert.ok(fixture.includes(t.check));assert.doesNotMatch(t.solutionDisplay,/printf|runuser/);
 assert.match(t.check,/observedGeneration==\$generation/);assert.match(t.check,/ResolvedRefs/);assert.match(t.check,/Programmed/);
 const wrapped='/bin/sh -c '+q('printf "\\n__KUBE_CHECK_000000000000000000000000_0_START\\n"; if /bin/sh -c '+q('set -eu; '+t.check)+'; then rc=0; else rc=$?; fi; printf "\\n__KUBE_CHECK_000000000000000000000000_0=%s\\n" "$rc"');assert.ok(wrapped.length<3000,t.id+' supera la consola');
}
assert.match(EJERCICIOS_GATEWAY[2].check,/--cacert/);assert.doesNotMatch(fixture,/--insecure|curl -k/);
assert.match(fixture,/EQUIVALENCIA_PARENTREF_EXPLICITA_OK/);
assert.equal(spawnSync(bash,['--noprofile','--norc','-n'],{input:fixture,encoding:'utf8'}).status,0);
const ingress=readFileSync(new URL('../laboratorios/kubernetes-real/debian/ingress-curso.mjs',import.meta.url),'utf8');
assert.match(ingress,/providers.kubernetesCRD.enabled=false/);assert.doesNotMatch(ingress,/kubectl create.*crds\//);
const calls=[];
await prepararGateway(async(id,label,command)=>{calls.push({label,command});return {ok:!['Consultar el proveedor Gateway existente','Consultar la GatewayClass'].includes(label)};});
assert.ok(calls.some(c=>c.command.includes('--reuse-values')));assert.ok(calls.some(c=>c.label==='Crear la GatewayClass del laboratorio'));
assert.ok(!calls.some(c=>/ports.web.port=80|NET_BIND_SERVICE/.test(c.command)));
const existing=[];await prepararGateway(async(id,label,command)=>{existing.push(command);return {ok:label!=='Consultar los CRDs del complemento'};});
assert.ok(!existing.some(c=>/helm upgrade|kubectl create/.test(c)),'Una instalación existente se comprueba sin repararla');
assert.match(ordenComprobarCRDsGateway,/test -n "\$crds"/);assert.match(ordenComprobarCRDsGateway,/length==5/);
console.log('Gateway: tres ejercicios y correctores con condiciones actuales y tráfico HTTP/TLS; instalación bajo demanda. Falta su ejecución nativa para abrirlos.');
