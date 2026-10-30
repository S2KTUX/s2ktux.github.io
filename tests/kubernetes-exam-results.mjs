import assert from 'node:assert/strict';
import {TAREAS_CKA,DOMINIOS_CKA,DURACION_CKA} from '../laboratorios/kubernetes-real/debian/examen-cka-banco.mjs';
import {nuevoIntento,informeCKA,corregirExamenCKA} from '../laboratorios/kubernetes-real/debian/examen-cka-motor.mjs';
assert.equal(TAREAS_CKA.length,12);
assert.equal(new Set(TAREAS_CKA.map(t=>t.id)).size,12);
for(const [id,points]of Object.entries(DOMINIOS_CKA))assert.equal(TAREAS_CKA.filter(t=>t.domain===id).reduce((n,t)=>n+t.points,0),points);
for(const task of TAREAS_CKA){assert.ok(task.prompt.es&&task.prompt.en&&task.solution);assert.ok(task.conditions.length>=2);assert.ok(task.prepare[0].startsWith('kubectl create namespace examen-'));}
const attempt=nuevoIntento(1000);assert.equal(attempt.endsAt,1000+DURACION_CKA);
const results=value=>TAREAS_CKA.map(t=>({id:t.id,conditions:t.conditions.map(()=>value)}));
const times={startedAt:1000,finishedAt:61000};
const perfect=informeCKA(results(true),times);assert.equal(perfect.score,100);assert.equal(perfect.passed,true);assert.ok(Object.values(perfect.domains).every(d=>d.percent===100));
const untouched=informeCKA(results(false),times);assert.equal(untouched.score,0);assert.equal(untouched.passed,false);
const partial=results(true);partial[0].conditions[0]=false;assert.equal(informeCKA(partial,times).score,96.5);
partial[0].conditions[0]=null;assert.equal(informeCKA(partial,times).passed,null);
assert.throws(()=>informeCKA([],times));assert.throws(()=>informeCKA(results(true),{startedAt:10,finishedAt:1}));
const incorrectOrder=results(false).reverse();assert.throws(()=>informeCKA(incorrectOrder,times));
// Un fallo de transporte no equivale a una respuesta incorrecta.
const unavailable=await corregirExamenCKA(async()=>{throw Error('VM no disponible');});assert.ok(unavailable.every(t=>t.conditions.every(v=>v===null)));
const empty=await corregirExamenCKA(async(_node,label)=>({ok:label==='Comprobar disponibilidad del clúster'}));assert.ok(empty.every(t=>t.conditions.every(v=>v===false)));
console.log('CKA: pesos, tiempo, nota parcial, intento vacío y fallo de infraestructura comprobados. No sustituye la prueba nativa.');
