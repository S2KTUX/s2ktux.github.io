import assert from 'node:assert/strict';
import {exercises as linux,parseProbe} from '../laboratorios/linux-real/v86-exercises.mjs';
import {exercises as docker} from '../laboratorios/docker-real/docker-exercises.mjs';
import {practiceFeedback} from '../laboratorios/practice-feedback.mjs';
for(const task of [...linux,...docker].filter(task=>!task.legacyOnly)){
 for(const [label]of task.checks)assert.notEqual(label,'Resultado solicitado',task.id+' necesita un requisito comprensible');
}
const task=linux.find(task=>task.id==='salida-i'),nonce='a'.repeat(24),prefix='__LAB_'+nonce+'_';
assert.deepEqual(task.fileExpectation,{path:'/root/salida.txt',value:'Hola'});
assert.equal(task.checks.length,2);
for(const [codes,ok]of [[[1,1],false],[[0,1],false],[[0,0],true]]){
 const text=codes.map((code,index)=>prefix+index+'='+code+'\n').join('')+prefix+'END=0\n';
 assert.equal(parseProbe(task,nonce,text).ok,ok,'Existencia y contenido son requisitos distintos');
}
assert.match(practiceFeedback('linux',task,{},()=>null),/No existe el archivo \/root\/salida.txt/);
assert.match(practiceFeedback('linux',task,{},()=>({type:'dir'})),/debe ser un archivo/);
assert.match(practiceFeedback('linux',task,{},()=>({type:'file',content:'Distinto\n'})),/contenido.*no coincide.*Hola/);
assert.equal(practiceFeedback('linux',task,{},()=>({type:'file',content:'Hola\n'})),'');
assert.equal(task.checkFeedback[1].dependsOn,0,'No mostrar un fallo de contenido si falta el archivo');
assert.match(linux.find(task=>task.id==='salida-ii').checkFeedback[1].failed,/líneas, en este orden/);
assert.equal(task.goal,'Guarda Hola en /root/salida.txt y comprueba su contenido.');
console.log('Prácticas: requisitos legibles, archivo ausente/contenido incorrecto diferenciados y criterios de aprobado conservados.');
