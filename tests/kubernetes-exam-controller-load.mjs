import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {prepararCargaControladoresExamen} from '../laboratorios/kubernetes-real/debian/examen-runtime.mjs';
let calls=0;const run=async()=>{calls++;return {ok:true};};
for(const context of [undefined,{}, {scenario:'study',fresh:true,studentSession:false},{scenario:'cka-exam',fresh:false,studentSession:true},{scenario:'cka-exam',fresh:true,studentSession:true}])await assert.rejects(prepararCargaControladoresExamen(run,context));assert.equal(calls,0,'No cambiar intentos guardados ni máquinas de estudio');
await assert.rejects(prepararCargaControladoresExamen(async()=>({ok:false}),{scenario:'cka-exam',fresh:true,studentSession:false}),/No se ha confirmado/);
await prepararCargaControladoresExamen(run,{scenario:'cka-exam',fresh:true,studentSession:false});assert.equal(calls,1);
await prepararCargaControladoresExamen(async(node,label,command)=>{const parsed=spawnSync('bash',['-n'],{input:command,encoding:'utf8'});assert.equal(parsed.status,0,parsed.stderr);return {ok:true};},{scenario:'cka-exam',fresh:true,studentSession:false});
console.log('Controladores del examen: preparación solo de copias nuevas; fallo explícito cuando no se verifica la configuración.');
