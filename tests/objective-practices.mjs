import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {exercises as linux} from '../laboratorios/linux-real/v86-exercises.mjs';
import {exercises as docker} from '../laboratorios/docker-real/docker-exercises.mjs';
import {courseGroups} from '../laboratorios/lab-groups.mjs';
import {ejerciciosClase,ejerciciosExamen} from '../laboratorios/kubernetes-real/debian/ejercicios-niveles.mjs';
import {simulatedLearningKubernetes} from '../laboratorios/learning-kubernetes-sim.mjs';
import {createDefaultKubernetesState,retainPodFiles} from '../terminal-kubernetes-state.js';
import {solutionsFor} from '../laboratorios/solution-options.mjs';
const window={};vm.runInNewContext(readFileSync(new URL('../courses-data.js',import.meta.url),'utf8'),{window});
assert.deepEqual(courseGroups.linux,Array.from(window.S2KTUX_COURSES.rhcsa.modules,module=>module.title));
for(const [mode,tasks]of [['linux',linux],['docker',docker]]){
 const visible=tasks.filter(task=>!task.legacyOnly&&!task.practiceExam);
 assert.equal(visible.length,mode==='linux'?126:56);
 assert.equal(new Set(tasks.map(task=>task.id)).size,tasks.length);
 for(const task of visible){assert.match(task.title,/ · (I|II)$/);assert.doesNotMatch(task.title,/^Curso/);assert.ok(task.checks.length||task.id==='diagnostico');assert.ok(task.solution);}
}
assert.equal(linux.filter(task=>task.practiceExam).length,8);
assert.equal(docker.filter(task=>task.practiceExam).length,0);
assert.equal(ejerciciosClase(0).length,0);
assert.equal(Array.from({length:11},(_,i)=>ejerciciosClase(i+1)).flat().length,34);
assert.equal(ejerciciosExamen('inicial').length+ejerciciosExamen('intermedio').length,4);
for(const number of [1,2,3,4,5,6,7,8,9,10,11])for(const task of ejerciciosClase(number))assert.match(task.title,/ · (I|II)$/);
assert.equal(solutionsFor('linux',linux.find(task=>task.sourceId==='sim-01'&&!task.legacyOnly)).length,2);
// El motor sustituye el estado completo después de cada comando. Los correctores
// deben consultar el estado actual, no una referencia capturada al cargar la clase.
const state={k8s:createDefaultKubernetesState('v1.35.0')},tasks=simulatedLearningKubernetes({state,getNode:()=>null});
const pod=tasks.find(task=>task.title==='Pods · II');assert.equal(pod.check().ok,false);
state.k8s={...state.k8s,pods:[{name:'herramientas',namespace:'default',status:'Running',fs:{'/tmp/mensaje':'Aprendiendo\n'}}]};assert.equal(pod.check().ok,true);
state.k8s.pods[0].fs['/tmp/mensaje']='Otro\n';assert.equal(pod.check().ok,false);
const replicas=tasks.find(task=>task.title==='Deployment · II');assert.equal(replicas.check().ok,false);
state.k8s={...state.k8s,deployments:[{name:'despliegue',namespace:'default',replicas:2}],pods:[{owner:'despliegue',status:'Running'},{owner:'despliegue',status:'Running'}]};assert.equal(replicas.check().ok,true);
state.k8s.pods.pop();assert.equal(replicas.check().ok,false);
const files={'/tmp/dato':'Conservar'},current={pods:[{name:'util',namespace:'default',createdAt:1,fs:files}]};
const refreshed=retainPodFiles(current,{pods:[{name:'util',namespace:'default',createdAt:1,status:'Running',fs:{}}]});assert.equal(refreshed.pods[0].fs,files);assert.equal(refreshed.pods[0].status,'Running');
const recreated=retainPodFiles(current,{pods:[{name:'util',namespace:'default',createdAt:2,fs:{}}]});assert.deepEqual(recreated.pods[0].fs,{});
console.log('Objetivos I/II, títulos del curso, práctica de examen separada y correctores sobre el estado actual comprobados.');
