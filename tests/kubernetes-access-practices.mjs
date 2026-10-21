import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {EJERCICIOS_ACCESO} from '../laboratorios/kubernetes-real/debian/ejercicios-acceso.mjs';
assert.deepEqual(EJERCICIOS_ACCESO.map(t=>t.id),['c13-a','c13-b','c13-cert','c14-a','c14-b']);
const q=text=>"'"+text.replaceAll("'","'\\''")+"'";
for(const task of EJERCICIOS_ACCESO){
 assert.ok(task.prepare.length&&task.negative&&task.cleanup&&task.solutionDisplay);
 assert.doesNotMatch(task.solution,/cluster-admin|system:masters|--insecure|-k /);
 const wrapped='/bin/sh -c '+q('printf "\\n__KUBE_CHECK_000000000000000000000000_0_START\\n"; if /bin/sh -c '+q('set -eu; '+task.check)+'; then rc=0; else rc=$?; fi; printf "\\n__KUBE_CHECK_000000000000000000000000_0=%s\\n" "$rc"');
 assert.ok(wrapped.length<3000,'El corrector excede el límite de la consola: '+task.id+' '+wrapped.length);
}
const group=EJERCICIOS_ACCESO.find(t=>t.id==='c13-b');assert.match(group.check,/--subresource=log/);assert.doesNotMatch(group.solution,/auth can-i get pods\/log/);
const token=EJERCICIOS_ACCESO.find(t=>t.id==='c14-b');assert.match(token.check,/system:serviceaccount:p14b:lectora/);assert.match(token.solution,/--cacert/);
const fixture=readFileSync(new URL('../fixtures/kubernetes-acceso-nativo.sh',import.meta.url),'utf8');
for(const task of EJERCICIOS_ACCESO){assert.ok(fixture.includes(task.check));assert.ok(fixture.includes(task.solution));}
const bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash';
const result=spawnSync(bash,['--noprofile','--norc','-n'],{input:fixture,encoding:'utf8'});assert.equal(result.status,0,result.stderr);
console.log('Acceso Kubernetes: cinco prácticas del curso, límites de consola y suite nativa sincronizados. Esta prueba no ejecuta el clúster.');
