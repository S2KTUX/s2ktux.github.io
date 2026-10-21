import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {EJERCICIOS_ALMACENAMIENTO as tasks} from '../laboratorios/kubernetes-real/debian/ejercicios-almacenamiento.mjs';
import {almacenamientoHash} from '../laboratorios/kubernetes-real/debian/almacenamiento-paquete.mjs';
import {comandosAlmacenamiento} from '../laboratorios/kubernetes-real/debian/almacenamiento-curso.mjs';
import {prepararPractica} from '../laboratorios/kubernetes-real/debian/motor-practicas.mjs';
assert.deepEqual(tasks.map(t=>t.id),['c12-a','c12-b','c12-c']);
const q=text=>"'"+text.replaceAll("'","'\\''")+"'";
for(const task of tasks){
 const wrapped='/bin/sh -c '+q('printf "\\n__KUBE_CHECK_000000000000000000000000_0_START\\n"; if /bin/sh -c '+q('set -eu; '+task.check)+'; then rc=0; else rc=$?; fi; printf "\\n__KUBE_CHECK_000000000000000000000000_0=%s\\n" "$rc"');
 assert.ok(wrapped.length<3000,task.id+' excede el límite de la consola');assert.match(task.solutionDisplay,/<<'EOF'/);assert.doesNotMatch(task.solutionDisplay,/printf/);
 assert.ok(task.negative&&task.cleanup&&task.prepare.length);assert.equal(task.classNumber,12);
}
assert.match(tasks[1].check,/persistentVolumeReclaimPolicy/);assert.match(tasks[1].check,/volumeMounts/);assert.match(tasks[2].check,/pv.kubernetes.io\/provisioned-by/);
assert.equal(createHash('sha256').update(readFileSync(new URL('../laboratorios/kubernetes-real/recursos/almacenamiento-v1/local-path.yaml.gz',import.meta.url))).digest('hex'),almacenamientoHash);
const commands=await comandosAlmacenamiento('contenido de fixture');assert.match(commands.at(-1)[1],/test -z/);assert.match(commands.at(-1)[1],/validate=strict/);
let calls=0;await assert.rejects(()=>prepararPractica({requirements:['componente-no-autorizado']},async()=>{calls++;return{ok:true};}));assert.equal(calls,0);
const fixture=readFileSync(new URL('../fixtures/kubernetes-almacenamiento-nativo.sh',import.meta.url),'utf8');for(const task of tasks){assert.ok(fixture.includes(task.check));assert.ok(fixture.includes(task.solution));}
const bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash';const result=spawnSync(bash,['--noprofile','--norc','-n'],{input:fixture,encoding:'utf8'});assert.equal(result.status,0,result.stderr);
console.log('Almacenamiento: tres ejercicios coherentes, instalador acotado y manifiesto verificado. Falta la prueba nativa para abrirlos.');
