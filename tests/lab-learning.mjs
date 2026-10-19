import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {learningLinux,nativeLearningLinux,simulatedLearningLinux} from '../laboratorios/learning-linux.mjs';
import {learningDocker,simulatedLearningDocker} from '../laboratorios/learning-docker.mjs';
import {EJERCICIOS_APRENDER} from '../laboratorios/kubernetes-real/debian/ejercicios-aprender.mjs';
import {ejerciciosClase} from '../laboratorios/kubernetes-real/debian/ejercicios-niveles.mjs';
import {exercises as linux} from '../laboratorios/linux-real/v86-exercises.mjs';
import {exercises as docker} from '../laboratorios/docker-real/docker-exercises.mjs';
import {solutionsFor} from '../laboratorios/solution-options.mjs';
import {examQuestions} from '../laboratorios/linux-real/v86-exam-data.mjs';
import {practiceClasses,courseGroups} from '../laboratorios/lab-groups.mjs';
assert.equal(nativeLearningLinux.length,11);assert.equal(simulatedLearningLinux({}).length,11);
for(let n=1;n<=11;n++)assert.ok(nativeLearningLinux.some(task=>task.classes.includes(n)),'Falta introducción al tema '+n);
for(const task of [...linux,...docker]){assert.ok(task.goal&&task.solution);assert.ok(practiceClasses(task.class?'docker':'linux',task).every(n=>Number.isInteger(n)));}
assert.equal(courseGroups.linux.length,11);assert.equal(courseGroups.docker.length,3);
assert.equal(learningDocker.length,2);assert.equal(simulatedLearningDocker({}).length,2);
assert.equal(EJERCICIOS_APRENDER.length,7);
for(const number of [4,6,7,8,9,10,11])assert.match(ejerciciosClase(number)[0].id,/inicio$/);
for(const number of [0,1])for(const task of ejerciciosClase(number)){assert.doesNotMatch(task.solution,/jsonpath|\bjq\b|runuser/);}
const caducidad=linux.find(task=>task.id==='caducidad-ii');assert.doesNotMatch(caducidad.solution,/umask|runuser/);assert.equal(caducidad.checks.length,1);
const fileNodes=new Map(),ctx={getNode:path=>fileNodes.get('/'+path.join('/')),state:{services:{},users:{},installed:new Set(['tar'])}};
const intro=simulatedLearningLinux(ctx).find(task=>task.id==='inicio-archivos');assert.equal(intro.check().ok,false);fileNodes.set('/root/inicio/saludo.txt',{type:'file',content:'Hola Linux\n'});assert.equal(intro.check().ok,true);fileNodes.get('/root/inicio/saludo.txt').content='Distinto';assert.equal(intro.check().ok,false);
const script=simulatedLearningLinux(ctx).find(task=>task.id==='inicio-script');
for(const code of ['echo "Hola Linux"',"echo 'Hola Linux'",'echo Hola Linux',"printf '%s\\n' 'Hola Linux'","printf 'Hola Linux\\n'"]){fileNodes.set('/root/hola.sh',{type:'file',mode:'rwx------',content:'#!/bin/bash\n'+code});assert.equal(script.check().ok,true,code);}
fileNodes.set('/root/hola.sh',{type:'file',mode:'rwx------',content:'echo Otra cosa'});assert.equal(script.check().ok,false);
const index=readFileSync(new URL('../laboratorios/linux-real/index.html',import.meta.url),'utf8');assert.doesNotMatch(index,/http-equiv="refresh"|location\.replace/);assert.match(index,/id="start"/);
const page=readFileSync(new URL('../terminal.html',import.meta.url),'utf8');assert.doesNotMatch(page,/CHEATSHEET|Versión preliminar|Probar Kubernetes/);
const bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash';
{
 let checked=0;const scripts=[];
 for(const [mode,tasks]of [['linux',[...linux,...examQuestions]],['docker',docker],['kubernetes',Array.from({length:12},(_,n)=>ejerciciosClase(n)).flat()]])for(const task of tasks)for(const solution of solutionsFor(mode,task)){
  scripts.push('# '+task.id+'\n__qa_'+checked+'() {\n'+solution.code+'\n}\n');checked++;
 }
 for(const task of [...linux,...docker])for(const [label,script]of task.checks)scripts.push('# '+task.id+' / '+label+'\n__qa_check_'+scripts.length+'() {\n'+script+'\n}\n');
 const result=spawnSync(bash,['--noprofile','--norc','-n'],{input:scripts.join('\n'),encoding:'utf8'});assert.equal(result.status,0,result.stderr);
 console.log('Sintaxis Bash comprobada: '+checked+' soluciones. No acredita ejecución nativa.');
}
console.log('Aprendizaje: introducciones por tema, orden, correctores de resultado y ausencia de redirección en Linux.');
