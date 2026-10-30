import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {prepararEjerciciosCKA} from '../laboratorios/kubernetes-real/debian/examen-cka-motor.mjs';
const calls=[];await assert.rejects(prepararEjerciciosCKA(async()=>{throw Error('No ejecutar');},{fresh:false}));
let captured=false;
await prepararEjerciciosCKA(async(node,label,command)=>{if(label==='Crear los namespaces del simulacro')assert.equal(captured,true);calls.push({label,command});return {ok:true};},{fresh:true,beforeQuestions:async()=>{assert.equal(calls.length,1);assert.match(calls[0].command,/openapi\/v2/);captured=true;}});
const create=calls.find(call=>call.label==='Crear los namespaces del simulacro').command;
assert.match(create,/fieldValidation=Strict/);assert.doesNotMatch(create,/--validate=false/);
const bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash';
const shell=`export S2KTUX_CKA_CERT=/test/tls.crt S2KTUX_CKA_KEY=/test/tls.key
exec 3>&1
curl(){ while test "$#" -gt 0; do case "$1" in --data) printf '%s\\n' "$2" >&3; shift 2;; *) shift;; esac; done; }
${create}`;
const result=spawnSync(bash,['--noprofile','--norc','-c',shell],{encoding:'utf8'});assert.equal(result.status,0,result.stderr);
const objects=result.stdout.trim().split('\n').map(line=>JSON.parse(line));assert.equal(objects.length,12);
for(let n=0;n<12;n++)assert.deepEqual(objects[n],{apiVersion:'v1',kind:'Namespace',metadata:{name:'examen-'+String(n+1).padStart(2,'0')}});
assert.match(calls[0].command,/openapi\/v2/);assert.match(calls[0].command,/application\/com.github.proto-openapi.spec.v2/);
const interrupted=[];
await assert.rejects(prepararEjerciciosCKA(async(node,label)=>{interrupted.push(label);return {ok:true};},{fresh:true,beforeQuestions:async()=>{const error=Error('No reanudada');error.resumeFailed=true;throw error;}}),/No reanudada/);
assert.deepEqual(interrupted,['Preparar la validación OpenAPI de los manifiestos']);
assert.ok(calls.findIndex(c=>c.label==='Comprobar la API después de guardar la base')<calls.findIndex(c=>c.label==='Crear los namespaces del simulacro'));
console.log('Examen: JSON correcto en los doce namespaces, validación estricta del servidor y precarga OpenAPI sin desactivar la validación. Prueba de la preparación, no del clúster.');
