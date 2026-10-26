import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {EJERCICIOS_ADMINISTRACION} from '../laboratorios/kubernetes-real/debian/ejercicios-administracion.mjs';
import {EJERCICIOS_MONTAJE} from '../laboratorios/kubernetes-real/debian/ejercicios-montaje.mjs';
import {EJERCICIOS_HA} from '../laboratorios/kubernetes-real/debian/ejercicios-ha.mjs';
import {EJERCICIOS_CICLO_CLUSTER} from '../laboratorios/kubernetes-real/debian/ejercicios-ciclo-cluster.mjs';
import {EJERCICIOS_AVANZADOS} from '../laboratorios/kubernetes-real/debian/ejercicios-avanzados.mjs';
import {ejerciciosNivel,ejerciciosClase} from '../laboratorios/kubernetes-real/debian/ejercicios-niveles.mjs';
import {prepararPractica} from '../laboratorios/kubernetes-real/debian/motor-practicas.mjs';
const tasks=ejerciciosNivel('avanzado'),source=[...EJERCICIOS_ADMINISTRACION,...EJERCICIOS_HA,...EJERCICIOS_MONTAJE,...EJERCICIOS_CICLO_CLUSTER,...EJERCICIOS_AVANZADOS];
assert.equal(tasks.length,29);assert.equal(new Set(tasks.map(t=>t.id)).size,tasks.length);
assert.deepEqual(tasks,source);
for(const task of source){assert.deepEqual(tasks.find(t=>t.id===task.id),task);assert.equal(task.validation,'external-report');assert.ok(task.classNumber>=24&&task.classNumber<=34);}
assert.equal(tasks.find(t=>t.id==='c33-c').preflight,source.find(t=>t.id==='c33-c').preflight);
for(const task of tasks.filter(t=>['disposable-cluster','manual-cluster','ha-cluster'].includes(t.environment))){
 let called=false;await assert.rejects(prepararPractica(task,async()=>{called=true;return{ok:true};}),/entorno independiente/);assert.equal(called,false);
}
for(let number=24;number<=34;number++)assert.deepEqual(ejerciciosClase(number),[],'El banco candidato no abre el avanzado');
const ui=readFileSync(new URL('../laboratorios/kubernetes-real/debian/interfaz-niveles.mjs',import.meta.url),'utf8');
assert.match(ui,/const environment=entornoEjercicio\(current,getState\(\)\)/);
assert.doesNotMatch(ui,/environment\s*=\s*current.environment(?:;|\s*\|\|)/,'No acreditar un entorno por el mero hecho de pedirlo la pregunta');
assert.deepEqual(ejerciciosClase(0),[]);
console.log('Banco avanzado conectado: 29 candidatos íntegros; HA, montaje y averías destructivas separados de estudio. Avanzado cerrado hasta aceptación nativa de la entrega.');
