import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {EJERCICIOS_CONTROLADORES} from '../laboratorios/kubernetes-real/debian/ejercicios-controladores.mjs';
import {EJERCICIOS_INGRESS} from '../laboratorios/kubernetes-real/debian/ejercicios-ingress.mjs';
import {ordenComprobarIngress} from '../laboratorios/kubernetes-real/debian/ingress-curso.mjs';
const tasks=[...EJERCICIOS_INGRESS,...EJERCICIOS_CONTROLADORES],fixture=readFileSync(new URL('../fixtures/kubernetes-controladores-nativo.sh',import.meta.url),'utf8');
const q=s=>"'"+s.replaceAll("'","'\\''")+"'";
assert.deepEqual(tasks.map(t=>t.id),['c15-a','c15-b','c15-c','c16-a','c16-b','c17-a','c17-b','c18-a','c18-b']);
for(const task of tasks){
 assert.ok(task.prepare.length&&task.negative&&task.cleanup);assert.ok(fixture.includes(task.check));assert.ok(fixture.includes(task.nativeSolution||task.solution));
 assert.doesNotMatch(task.solutionDisplay,/printf|runuser/);
 const wrapped='/bin/sh -c '+q('printf "\\n__KUBE_CHECK_000000000000000000000000_0_START\\n"; if /bin/sh -c '+q('set -eu; '+task.check)+'; then rc=0; else rc=$?; fi; printf "\\n__KUBE_CHECK_000000000000000000000000_0=%s\\n" "$rc"');assert.ok(wrapped.length<3000,task.id+' excede la consola');
}
assert.match(EJERCICIOS_INGRESS[2].check,/--cacert/);assert.doesNotMatch(EJERCICIOS_INGRESS[2].check,/--insecure|curl -k/);
assert.match(EJERCICIOS_CONTROLADORES[3].check,/unique/);assert.match(EJERCICIOS_CONTROLADORES[5].check,/suspend==true/);
assert.doesNotMatch(EJERCICIOS_CONTROLADORES[0].check,/\.type=="Ready" and \.items/,'Dentro de una condición de Pod, status es el estado de esa condición');
const bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash';const result=spawnSync(bash,['--noprofile','--norc','-n'],{input:fixture,encoding:'utf8'});assert.equal(result.status,0,result.stderr);
for(const [image,accepted]of [['s2ktux/traefik-lab:3.5.2',true],['docker.io/s2ktux/traefik-lab:3.5.2',true],['docker.io/otro/traefik:3.5.2',false],['s2ktux/traefik-lab:otra',false]]){
 const stub='kubectl(){ case "$*" in *"get deployment"*) echo "$S2KTUX_QA_IMAGE";; *"rollout status"*) return 0;; *) return 99;; esac; }; set -eu; '+ordenComprobarIngress;
 const checked=spawnSync(bash,['--noprofile','--norc','-c',stub],{env:{...process.env,S2KTUX_QA_IMAGE:image},encoding:'utf8'});assert.equal(checked.status===0,accepted,image+' '+checked.stderr);
}
console.log('Nueve prácticas de controladores coherentes con AFFiNE y suite nativa con casos incompletos. La sintaxis no sustituye su ejecución real.');
