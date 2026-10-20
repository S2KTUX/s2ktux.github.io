import assert from 'node:assert/strict';
import {questions,weights} from '../laboratorios/lpic-1/questions.mjs';
import {answerCorrect,createExam,reportFor,EXAM_SECONDS} from '../laboratorios/lpic-1/engine.mjs';
import {linuxExamPractice} from '../laboratorios/linux-exam-practice.mjs';
assert.equal(questions.length,120);assert.equal(new Set(questions.map(q=>q.id)).size,questions.length);
assert.equal(EXAM_SECONDS,5400);assert.equal(linuxExamPractice.length,22);
for(const code of ['101','102']){const exam=createExam(code);assert.equal(exam.length,60);assert.equal(new Set(exam.map(q=>q.id)).size,60);for(const [objective,weight]of Object.entries(weights)){if((Number(objective.split('.')[0])<105?'101':'102')!==code)continue;assert.equal(exam.filter(q=>q.objective===objective).length,weight,objective);}
 for(const type of ['single','multiple','written'])assert.ok(exam.some(q=>q.type===type));
 const answers=Object.fromEntries(exam.map(q=>[q.id,q.type==='written'?q.answers[0]:q.answers]));assert.equal(reportFor(exam,answers).percent,100);assert.equal(reportFor(exam,{}).passed,false);assert.equal(reportFor(exam,{}).percent,0);assert.ok(reportFor(exam,answers).domains.every(item=>item.percent===100));
 for(const q of exam){assert.ok(q.explanation.length>20);assert.ok(q.prompt);assert.equal(answerCorrect(q,undefined),false);if(q.type==='written'){assert.ok(q.answers.every(a=>a.trim()));assert.equal(answerCorrect(q,' '+q.answers[0]+' '),true);}else{assert.ok(q.choices.length>=3);assert.equal(new Set(q.choices).size,q.choices.length);assert.ok(q.answers.every(index=>index>=0&&index<q.choices.length));if(q.type==='multiple'){assert.equal(answerCorrect(q,[q.answers[0]]),false);assert.equal(answerCorrect(q,[...q.answers,99]),false);assert.equal(answerCorrect(q,[...q.answers].reverse()),true);}}}
}
console.log('LPIC-1: 120 preguntas originales, pesos de los objetivos, formatos, 60/90, corrección por conjuntos y resultado por temas comprobados.');
