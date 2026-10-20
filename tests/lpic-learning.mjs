import assert from 'node:assert/strict';
import {questions,weights,bankSources} from '../laboratorios/lpic-1/questions.mjs';
import {existsSync} from 'node:fs';
import {corrections} from '../scripts/data/lpic-daypo-corrections.mjs';
import {answerCorrect,createExam,reportFor,EXAM_SECONDS} from '../laboratorios/lpic-1/engine.mjs';
import {linuxExamPractice} from '../laboratorios/linux-exam-practice.mjs';
import {practiceState,practiceStatus,hasAnswer} from '../laboratorios/lpic-1/practice-state.mjs';
assert.equal(questions.length,240);assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
assert.equal(new Set(questions.map(q=>q.prompt)).size,questions.length);
assert.equal(EXAM_SECONDS,5400);assert.equal(linuxExamPractice.length,22);
assert.equal(bankSources.length,2);
for(const code of ['101','102']){const pool=questions.filter(q=>q.exam===code);assert.equal(pool.length,120);const source=bankSources.find(b=>b.exam===code);assert.equal(source.author,'Deza92');assert.equal(source.url,'https://www.daypo.com/lpic-'+code+'-500.html');assert.equal(source.count,120);assert.match(source.sourceSha256,/^[0-9a-f]{64}$/);assert.match(source.permission,/confirma disponer de permiso/);assert.deepEqual(pool.map(q=>q.sourceIndex),Array.from({length:120},(_,i)=>i+1));for(const q of pool){assert.equal(q.id,'daypo-'+code+'-'+String(q.sourceIndex).padStart(3,'0'));assert.equal(q.sourceUrl,source.url);assert.match(q.sourceSha256,/^[0-9a-f]{64}$/);assert.ok(weights[q.objective]);assert.equal(q.topic<105?'101':'102',code);}
 const exam=createExam(code);assert.equal(exam.length,60);assert.equal(new Set(exam.map(q=>q.id)).size,60);for(const [objective,weight]of Object.entries(weights)){if((Number(objective.split('.')[0])<105?'101':'102')!==code)continue;assert.equal(exam.filter(q=>q.objective===objective).length,weight,objective);assert.ok(pool.filter(q=>q.objective===objective).length>=weight,'Banco insuficiente para '+objective);}
 const samples=Array.from({length:8},()=>createExam(code).map(q=>q.id).sort().join(','));assert.ok(new Set(samples).size>1,'Deben variar las preguntas seleccionadas, no solo su orden.');
 // Los tres formatos existen en cada banco; un sorteo no garantiza una cuota por formato.
 for(const type of ['single','multiple','written'])assert.ok(pool.some(q=>q.type===type));
 const answers=Object.fromEntries(exam.map(q=>[q.id,q.type==='written'?q.answers[0]:q.answers]));assert.equal(reportFor(exam,answers).percent,100);assert.equal(reportFor(exam,{}).passed,false);assert.equal(reportFor(exam,{}).percent,0);assert.ok(reportFor(exam,answers).domains.every(item=>item.percent===100));
 for(const q of pool){assert.ok(q.explanation.length>20);assert.ok(q.prompt);assert.equal(answerCorrect(q,undefined),false);assert.equal(answerCorrect(q,q.type==='written'?q.answers[0]:q.answers),true);if(q.type==='written'){assert.ok(q.answers.every(a=>a.trim()));assert.equal(answerCorrect(q,' '+q.answers[0]+' '),true);}else{assert.ok(q.choices.length>=3);assert.equal(new Set(q.choices).size,q.choices.length);assert.ok(q.answers.every(index=>index>=0&&index<q.choices.length));if(q.type==='multiple'){assert.equal(answerCorrect(q,[q.answers[0]]),false);assert.equal(answerCorrect(q,[...q.answers,99]),false);assert.equal(answerCorrect(q,[...q.answers].reverse()),true);}}}
 const state=practiceState(code);assert.equal(state.ids.length,120);assert.equal(new Set(state.ids).size,120);assert.ok(state.ids.every(id=>pool.some(q=>q.id===id)));assert.notDeepEqual(state.ids,pool.map(q=>q.id));
 state.index=4;const active=pool.find(q=>q.id===state.ids[4]);state.answers[active.id]=active.type==='multiple'?active.answers:active.answers[0];state.checks[active.id]='passed';
 assert.equal(practiceStatus(state,state.ids[4]),'passed');const copy=practiceState(code,JSON.parse(JSON.stringify(state)));assert.deepEqual(copy,state);
 const fresh=practiceState(code,state,{}, {fresh:true});assert.notDeepEqual(fresh.ids,state.ids);assert.equal(fresh.index,0);assert.deepEqual(fresh.answers,state.answers);assert.deepEqual(fresh.checks,state.checks);
 const legacy=practiceState(code,undefined,{[pool[0].id]:{state:'failed'}});assert.equal(legacy.checks[pool[0].id],'failed');
 delete legacy.checks[pool[0].id];assert.equal(practiceState(code,legacy,{[pool[0].id]:{state:'passed'}}).checks[pool[0].id],undefined,'Una marca antigua no debe reaparecer tras editar o borrar una respuesta.');
 assert.equal(practiceState(code,{ids:['invalid'],index:200}).index,0);
}
assert.equal(questions.filter(q=>q.correction).length,Object.keys(corrections).length);
const question=id=>questions.find(q=>q.id===id);
assert.equal(question('daypo-101-095').choices[question('daypo-101-095').answers[0]],'SIGTSTP');
assert.equal(question('daypo-101-032').type,'multiple');assert.deepEqual(question('daypo-101-032').answers,[1,2]);
assert.deepEqual(question('daypo-102-103').answers,[2,4]);assert.deepEqual(question('daypo-102-105').answers,[1,4]);
assert.equal(questions.filter(q=>q.image).length,2);for(const q of questions.filter(q=>q.image)){assert.ok(existsSync(new URL('..'+q.image.src,import.meta.url)));assert.ok(q.image.alt.length>30);}
assert.equal(practiceState('101',undefined,{'101.1-1':{state:'passed'}}).checks['daypo-101-001'],undefined,'No reutilizar marcas de las preguntas originales retiradas.');
assert.throws(()=>createExam('999'),/desconocido/);
assert.equal(hasAnswer(0),true);assert.equal(hasAnswer([]),false);assert.equal(hasAnswer('   '),false);
console.log('LPIC-1: bancos autorizados Daypo 120+120, procedencia, correcciones, imágenes, selección de 60 y progreso comprobados.');
