import assert from 'node:assert/strict';
import {comprobarArranquePorFases} from '../laboratorios/kubernetes-real/debian/comprobar-entorno-preparado.mjs';
const phases=[['API','consultar-api'],['Nodo','consultar-nodo']],calls=[];
await comprobarArranquePorFases(async(exercise,timeout)=>{calls.push({exercise,timeout});return {ok:true};},phases);
assert.equal(calls.length,2);assert.ok(calls.every(c=>c.timeout===240000&&c.exercise.checks.length===1));assert.deepEqual(calls.map(c=>c.exercise.checks[0]),phases);
let consulted=0;await assert.rejects(comprobarArranquePorFases(async()=>{consulted++;return {ok:false};},phases),/API/);assert.equal(consulted,1,'No continuar ni reparar automáticamente tras un fallo real');
await assert.rejects(comprobarArranquePorFases(async()=>undefined,phases),/API/);
console.log('Arranque: plazos independientes por fase, fallo real detiene la secuencia y no hay aprobados sin respuesta.');
