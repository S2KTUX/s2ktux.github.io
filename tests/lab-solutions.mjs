import assert from 'node:assert/strict';
import {exercises as linux} from '../laboratorios/linux-real/v86-exercises.mjs';
import {exercises as docker} from '../laboratorios/docker-real/docker-exercises.mjs';
import {ejerciciosClase} from '../laboratorios/kubernetes-real/debian/ejercicios-niveles.mjs';
import {solutionsFor,withHTTPWait} from '../laboratorios/solution-options.mjs';
const kubernetes=Array.from({length:12},(_,n)=>ejerciciosClase(n)).flat();
const totals=[];
for(const [mode,exercises,expected]of [['linux',linux,18],['docker',docker,18],['kubernetes',kubernetes,17]]){
 let alternatives=0;
 for(const e of exercises){const before=JSON.stringify(e),options=solutionsFor(mode,e);assert.equal(JSON.stringify(e),before);assert.ok(options.every(s=>s.code.trim()));assert.equal(new Set(options.map(s=>s.code)).size,options.length);if(options.length>1)alternatives++;if(e.id!=='sim-01'&&e.sourceId!=='sim-01')assert.equal(options[0].code,e.solutionDisplay||e.solution);}
 assert.ok(alternatives>0);totals.push(mode+': '+alternatives);
}
const named=solutionsFor('kubernetes',kubernetes.find(e=>e.id==='c09-a'))[1].code;assert.match(named,/containerPort/);
assert.match(docker.find(e=>e.id==='web').solution,/--retry-all-errors/);
const web=withHTTPWait('curl http://localhost:8080');assert.equal(withHTTPWait(web),web);assert.equal(withHTTPWait('curl --data dato https://ejemplo.test'),'curl --data dato https://ejemplo.test');
for(const id of ['c10-a','c10-b','c11-a','c11-b'])assert.doesNotMatch(solutionsFor('kubernetes',kubernetes.find(e=>e.id===id))[1].code,/delete pod/,'Una alternativa nueva no debe borrar un Pod que aún no existe');
console.log('Soluciones sin cambiar enunciados ni correctores: '+totals.join(' · ')+'.');
