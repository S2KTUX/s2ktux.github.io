import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {examQuestions,scoreQuestion,EXAM_TOTAL,EXAM_PASS,EXAM_SECONDS} from '../laboratorios/linux-real/v86-exam-data.mjs';
import {examSetupCommand} from '../laboratorios/linux-real/v86-exam-setup.mjs';
import {buildProbe,parseProbe} from '../laboratorios/linux-real/v86-exercises.mjs';
assert.equal(examQuestions.length,22);
assert.equal(new Set(examQuestions.map(q=>q.id)).size,22);
assert.equal(examQuestions.reduce((n,q)=>n+q.points,0),EXAM_TOTAL);
assert.equal(EXAM_TOTAL,300);assert.equal(EXAM_PASS,210);assert.equal(EXAM_SECONDS,10800);
for(const q of examQuestions){
  assert.ok(q.goal&&q.solution&&q.observations.length&&q.checks.length);
  assert.doesNotMatch(q.solution,/pulsa Comprobar ejercicio/,'El examen no tiene comprobación por ejercicio durante el intento');
  assert.ok([1,2].includes(q.node));assert.equal(q.checkUser,undefined);
  const outcomes=ok=>({results:q.checks.map(([label])=>({label,ok})),observations:[]});
  assert.equal(scoreQuestion(q,outcomes(true)).points,q.points);
  assert.equal(scoreQuestion(q,outcomes(false)).points,0);
  const partial=outcomes(false);partial.results[0].ok=true;
  assert.ok(scoreQuestion(q,partial).points>0);
  assert.throws(()=>scoreQuestion(q,{results:[]}));
}
const lv=examQuestions.find(q=>q.number===15),reduce=examQuestions.find(q=>q.number===17);
assert.match(examQuestions.find(q=>q.number===9).checks[0][1],/if x\.strip\(\) and not/,'Las líneas vacías de las tareas de red no deben invalidar la copia de hosts');
assert.doesNotMatch(lv.solution,/mklabel/);assert.match(lv.solution,/exam_disk/);assert.match(lv.solution,/2147483648/);
assert.doesNotMatch(reduce.solution,/mkfs|lvcreate/);assert.match(reduce.solution,/seedvg/);
for(const number of [20,21]){
  const podmanQuestion=examQuestions.find(q=>q.number===number);
  for(const check of podmanQuestion.checks.filter(c=>c[1].includes('runuser -u hermes'))){
    assert.match(check[1],/cd \/home\/hermes &&/,'Podman rootless no debe heredar el directorio /root del corrector');
  }
}
assert.throws(()=>examSetupCommand('bad; rm', '1'));
assert.throws(()=>examSetupCommand('a'.repeat(32), '3'));
assert.doesNotMatch(examSetupCommand('a'.repeat(32),'1'),/mklabel|pvcreate/);
assert.match(examSetupCommand('a'.repeat(32),'2'),/nfs-server|seedvg/);
const nonce='a'.repeat(24),q=examQuestions[0];
const output=q.checks.map((c,i)=>`__LAB_${nonce}_${i}=0\n`).join('')+`__LAB_${nonce}_OBS0=${Buffer.from('estado real á').toString('base64')}\n__LAB_${nonce}_END=0\n`;
assert.equal(parseProbe(q,nonce,output).observations[0].text,'estado real á');
assert.match(buildProbe(q,nonce),/base64 -w0/);
assert.throws(()=>parseProbe(q,nonce,output.replace(`__LAB_${nonce}_0=0`,`__LAB_${nonce}_0=124`)));
assert.throws(()=>parseProbe(q,nonce,output.replace(/__LAB_[a-f0-9]{24}_OBS0=[^\n]+\n/,'')));
const guest=readFileSync(new URL('../laboratorios/linux-real/v86-test.mjs',import.meta.url),'utf8');
assert.match(guest,/examMode\?':exam:'\+examAttempt/);
assert.match(guest,/if\(examMode\)throw Error\('El modo examen no tiene guardado/);
assert.match(guest,/savedRecord=examMode\?null:/);
console.log('✓ Examen Linux: dos nodos, 22 tareas, 300 puntos, parcial, observaciones reales y límites explícitos.');
