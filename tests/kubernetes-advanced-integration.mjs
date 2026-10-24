import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {EJERCICIOS_ADMINISTRACION} from '../laboratorios/kubernetes-real/debian/ejercicios-administracion.mjs';
import {EJERCICIOS_CICLO_CLUSTER} from '../laboratorios/kubernetes-real/debian/ejercicios-ciclo-cluster.mjs';
import {EJERCICIOS_AVANZADOS} from '../laboratorios/kubernetes-real/debian/ejercicios-avanzados.mjs';
import {ejerciciosNivel,ejerciciosClase} from '../laboratorios/kubernetes-real/debian/ejercicios-niveles.mjs';
import {prepararPractica} from '../laboratorios/kubernetes-real/debian/motor-practicas.mjs';
const tasks=ejerciciosNivel('avanzado'),source=[...EJERCICIOS_ADMINISTRACION,...EJERCICIOS_CICLO_CLUSTER,...EJERCICIOS_AVANZADOS];
assert.equal(tasks.length,24);assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length);
assert.deepEqual(tasks,source);
for(const task of source){assert.deepEqual(tasks.find(t=>t.id===task.id),task);assert.equal(task.validation,'external-report');assert.ok(task.classNumber>=24&&task.classNumber<=34);}
assert.equal(tasks.find(t=>t.id==='c33-c').preflight,source.find(t=>t.id==='c33-c').preflight);
for(const task of tasks.filter(t=>t.environment==='disposable-cluster')){
 let called=false;await assert.rejects(prepararPractica(task,async()=>{called=true;return{ok:true};}),/entorno independiente/);assert.equal(called,false);
}
for(let number=24;number<=34;number++)assert.deepEqual(ejerciciosClase(number),[],'El banco candidato no abre el avanzado');
const ui=readFileSync(new URL('../laboratorios/kubernetes-real/debian/interfaz-niveles.mjs',import.meta.url),'utf8');
assert.match(ui,/current.environment==='three-nodes'&&getState\(\).nodeCount===3\?'three-nodes':'course'/);
assert.doesNotMatch(ui,/environment\s*=\s*current.environment(?:;|\s*\|\|)/,'No acreditar un entorno por el mero hecho de pedirlo la pregunta');
assert.deepEqual(ejerciciosClase(0),[]);
console.log('Banco avanzado conectado: 24 candidatos íntegros, sin duplicar correctores ni preflights y sin habilitar escenas destructivas en la sesión de estudio.');
