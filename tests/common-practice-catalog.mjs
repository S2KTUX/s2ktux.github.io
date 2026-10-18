import assert from 'node:assert/strict';
import {commonPractices,commonPractice} from '../practice-common.mjs';
import linux from '../terminal-runtime-linux.js';
import docker from '../terminal-runtime-docker.js';
import {exercises as realLinux} from '../laboratorios/linux-real/v86-exercises.mjs';
import {exercises as realDocker} from '../laboratorios/docker-real/docker-exercises.mjs';
import {examQuestions} from '../laboratorios/linux-real/v86-exam-data.mjs';

for(const [mode,runtime,real] of [['linux',linux,realLinux],['docker',docker,realDocker]]){
 const simulated=runtime.createChallenges({state:{},getNode:()=>null});
 const ids=new Set(),indexes=new Set();
 for(const definition of commonPractices[mode]){
  assert.ok(!ids.has(definition.id));ids.add(definition.id);
  assert.ok(!indexes.has(definition.index));indexes.add(definition.index);
  const native=real.find(item=>item.id===definition.id),virtual=simulated[definition.index];
  assert.ok(native&&virtual);
  assert.equal(native.title,virtual.title);
  assert.equal(native.goal,virtual.goal);
  assert.equal(native.commonId,virtual.commonId);
  assert.equal(typeof virtual.check,'function');
  assert.ok(Array.isArray(native.checks));
 }
 assert.equal(simulated.length,mode==='linux'?21:15);
 assert.equal(real.length,mode==='linux'?55:32);
}
assert.equal(commonPractices.linux.length,10);
assert.equal(commonPractices.docker.length,11);
assert.equal(examQuestions.length,22);
const untouched={id:'solo-en-este-laboratorio',title:'Propia',goal:'Sin cambios'};
assert.equal(commonPractice('linux',untouched),untouched);
const checker=()=>({ok:false}),checks=[['Original','test -f /archivo']];
const original={id:'sim-01',title:'Anterior',goal:'Anterior',check:checker,checks,solution:'original',note:'original'};
const copy=commonPractice('linux',original);
assert.equal(original.title,'Anterior');assert.equal(copy.check,checker);assert.equal(copy.checks,checks);assert.equal(copy.solution,'original');assert.equal(copy.note,'original');
for(const id of ['sim-02','sim-03','sim-07','sim-10','sim-11','sim-15','sim-16','sim-17','sim-18','sim-20','sim-21'])assert.equal(realLinux.find(item=>item.id===id).commonId,undefined,'Conservar variante específica '+id);
for(const id of ['alpine','build','compose','multistage','entorno','salud'])assert.equal(realDocker.find(item=>item.id===id).commonId,undefined,'Conservar variante específica '+id);
console.log('Enunciados idénticos: 10 Linux y 11 Docker; se mantienen 21/44 y 15/30 prácticas, sus correctores propios y el examen de 22 tareas.');
