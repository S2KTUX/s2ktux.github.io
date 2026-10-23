import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {EJERCICIOS_CICLO_CLUSTER as tasks} from '../laboratorios/kubernetes-real/debian/ejercicios-ciclo-cluster.mjs';
import {prepararPractica} from '../laboratorios/kubernetes-real/debian/motor-practicas.mjs';
assert.deepEqual(tasks.map(task=>task.id),['c27-a','c27-b','c28-a','c28-b']);
const binary=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash';
const shell=[];
for(const task of tasks){
 assert.equal(task.validation,'external-report');assert.ok(task.check&&task.negative&&task.cleanup);
 assert.doesNotMatch(task.solutionDisplay||task.solution,/--bump-revision|--mark-compacted|--disable-eviction|runuser|printf/);
 for(const input of [...task.prepare,task.check,task.negative,task.cleanup,task.solutionNative||task.solution]){
  if(input.includes('\nvi '))continue;
  shell.push(input);
 }
}
const input=shell.map((source,index)=>'\n# Caso '+index+'\n(\n'+source+'\n)\n').join('');
const syntax=spawnSync(binary,['--noprofile','--norc','-n'],{input,encoding:'utf8'});assert.equal(syntax.status,0,syntax.stderr);
const restore=tasks.find(task=>task.id==='c28-b');
let called=false;
await assert.rejects(()=>prepararPractica(restore,async()=>{called=true;return {ok:true};}),/entorno independiente/);
assert.equal(called,false,'El rechazo tiene que ocurrir antes de ejecutar un solo comando');
assert.match(restore.check,/runtimeSpec.mounts/);assert.match(restore.check,/valor.*ANTES/);
assert.doesNotMatch(restore.cleanup,/rm|rmdir|mv|etcd.yaml/,'Nunca borrar el directorio restaurado en uso');
assert.ok(tasks.find(task=>task.id==='c27-b').check.includes('cka-w2'));
console.log('Candidatos 27–28: cordon/drain, snapshot y restore real; el restore rechaza ejecutarse sobre la sesión de estudio.');
