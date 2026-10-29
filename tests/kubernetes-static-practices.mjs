import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {EJERCICIOS_ADMINISTRACION} from '../laboratorios/kubernetes-real/debian/ejercicios-administracion.mjs';
import {claseDisponible,nivelDisponible} from '../laboratorios/kubernetes-real/debian/disponibilidad-curso.mjs';
const fixture=readFileSync(new URL('../fixtures/kubernetes-static-nativo.sh',import.meta.url),'utf8');
assert.deepEqual(EJERCICIOS_ADMINISTRACION.map(t=>t.id),['c24-a','c24-b']);
assert.equal(claseDisponible(24),true);
assert.equal(nivelDisponible('avanzado'),true,'Entrega avanzada con aceptación nativa');
const q=s=>"'"+s.replaceAll("'","'\\''")+"'";
for(const task of EJERCICIOS_ADMINISTRACION){
 assert.equal(task.classNumber,24);assert.match(task.check,/test -f \/etc\/kubernetes\/manifests\/curso-static-/);
 assert.match(task.check,/kubernetes.io\/config.mirror/);assert.match(task.check,/argjson definition/);
 assert.match(task.check,/spec.nodeName=="cka-cp1"/);assert.match(task.check,/\.status.phase=="Running"/);
 assert.ok(fixture.includes(task.check));assert.ok(fixture.includes(task.solution));
 assert.doesNotMatch(task.solutionDisplay,/printf|runuser|kubectl apply/);
 assert.doesNotMatch(task.cleanup,/kube-apiserver|etcd.yaml|kube-scheduler|kube-controller-manager/);
 const wrapped="/bin/sh -c "+q('printf "\\n__KUBE_CHECK_000000000000000000000000_0_START\\n"; if /bin/sh -c '+q('set -eu; '+task.check)+'; then rc=0; else rc=$?; fi; printf "\\n__KUBE_CHECK_000000000000000000000000_0=%s\\n" "$rc"');
 assert.ok(wrapped.length<3000,task.id+' excede la consola');
}
const bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash';
const variant=EJERCICIOS_ADMINISTRACION[0].equivalent;
assert.match(variant,/--for=jsonpath='\{\.metadata\.labels\.practica\}'=estatica/);
assert.ok(variant.indexOf("--for=jsonpath='{.metadata.labels.practica}'=estatica")<variant.lastIndexOf('--for=condition=Ready'),'Esperar el mirror nuevo antes de aceptar su Ready');
const variantSyntax=spawnSync(bash,['--noprofile','--norc','-n'],{input:variant,encoding:'utf8'});assert.equal(variantSyntax.status,0,variantSyntax.stderr);
const syntax=spawnSync(bash,['--noprofile','--norc','-n'],{input:fixture,encoding:'utf8'});
assert.equal(syntax.status,0,syntax.stderr);
console.log('Static Pods: candidatos de clase 24 con manifiesto local, mirror real y casos negativos; HA y avanzado siguen cerrados.');
