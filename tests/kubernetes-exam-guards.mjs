import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {TAREAS_CKA} from '../laboratorios/kubernetes-real/debian/examen-cka-banco.mjs';
const bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash';
let count=0;
const quote=text=>"'"+text.replaceAll("'","'\\''")+"'";
for(const task of TAREAS_CKA)for(const command of [...task.prepare,task.solutionNative,...task.conditions.map(c=>c.command)]){
 const parsed=spawnSync(bash,['--noprofile','--norc','-n','-c',command],{encoding:'utf8'});assert.equal(parsed.status,0,task.id+': '+parsed.stderr);
 const prefix='__KUBE_CHECK_'+'a'.repeat(24)+'_';
 const script=`printf '\\n${prefix}0_START\\n'; if /bin/sh -c ${quote('set -eu; '+command)}; then rc=0; else rc=$?; fi; printf '\\n${prefix}0=%s\\n' "$rc"`;
 assert.ok(('/bin/sh -c '+quote(script)+'\n').length<=3000,'La orden excede el límite de la consola: '+task.id);
}
for(const task of TAREAS_CKA)for(const condition of task.conditions){
 if(!condition.command.startsWith('{ object=$(curl '))continue;
 // Simular únicamente el fallo de la consulta: ninguna orden posterior
 // puede convertir un recurso inexistente en una condición conseguida.
 const script='set -eu; S2KTUX_CKA_CERT=/unused; S2KTUX_CKA_KEY=/unused; curl(){ return 22; }; jq(){ return 0; }; kubectl(){ return 0; };\n'+condition.command+'\necho NO_DEBE_APROBAR\n';
 const result=spawnSync(bash,['--noprofile','--norc','-c',script],{encoding:'utf8'});
 assert.equal(result.status,1,result.stderr);assert.doesNotMatch(result.stdout,/NO_DEBE_APROBAR/);count++;
}
assert.ok(count>=12);
console.log(`CKA: ${count} condiciones rechazan consultas fallidas aunque después haya órdenes correctas.`);
