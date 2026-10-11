import assert from 'node:assert/strict';
import {createDockerChecks} from '../laboratorios/docker-real/docker-checks.mjs';

for(const code of [0,1,125]){
 let command,finished=0;
 const checker=createDockerChecks(text=>command=text,()=>true,()=>finished++);
 const promise=checker.run({checks:[['Resultado','true']]});
 const prefix=command.match(/__DOCKER_CHECK_[a-f0-9]{24}_/)[0];
 // La consola serie envuelve el comando escrito: no es el resultado real.
 checker.receive(`${prefix}0=%s\\n' \"$rc\"\r\n[root@docker-lab ~]# `);
 assert.equal(finished,0,'El eco de una línea larga no debe resolver la consulta');
 checker.receive(`\r\n${prefix}0=`);
 assert.equal(finished,0);
 checker.receive(`${code}\r\n[root@docker-lab ~]# `);
 const result=await promise;
 assert.equal(finished,1);assert.equal(result.ok,code===0);
 assert.deepEqual(result.results,[{label:'Resultado',ok:code===0,found:true}]);
 assert.equal(checker.receive('Salida normal'),false);
}

let sent=0;
const notReady=createDockerChecks(()=>sent++,()=>false,()=>{});
await assert.rejects(notReady.run({checks:[['Resultado','true']]}),/prompt vacío/);
const noChecks=createDockerChecks(()=>sent++,()=>true,()=>{});
await assert.rejects(noChecks.run({checks:[]}),/directamente en la terminal/);
assert.equal(sent,0);
console.log('✓ Comprobador Docker: ignora el eco envuelto, espera un código real y conserva los fallos.');
