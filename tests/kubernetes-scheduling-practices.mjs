import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {EJERCICIOS_SCHEDULING} from '../laboratorios/kubernetes-real/debian/ejercicios-scheduling.mjs';
import {EJERCICIOS_RED} from '../laboratorios/kubernetes-real/debian/ejercicios-red.mjs';
import {EJERCICIOS_DNS} from '../laboratorios/kubernetes-real/debian/ejercicios-dns.mjs';
import {prepararPoliticasCurso} from '../laboratorios/kubernetes-real/debian/red-politicas-curso.mjs';
import {comprobarPractica} from '../laboratorios/kubernetes-real/debian/motor-practicas.mjs';
const tasks=[...EJERCICIOS_SCHEDULING,...EJERCICIOS_RED,...EJERCICIOS_DNS],read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
assert.deepEqual(tasks.map(t=>t.id),['c19-a','c19-b','c19-c','c20-a','c20-b','c21-a','c21-b','c21-c','c22-a','c22-b']);
const fixture=read('fixtures/kubernetes-scheduling-red-nativo.sh'),q=s=>"'"+s.replaceAll("'","'\\''")+"'";
for(const t of tasks){
 assert.ok(t.prepare.length&&t.negative&&t.cleanup&&fixture.includes(t.check));assert.doesNotMatch(t.solutionDisplay,/printf|runuser/);
 const commands=[...t.prepare,...(t.nativeSolution||t.solution).split('\n'),t.check,t.negative,...t.cleanup.split('\n'),...t.diagnostics.map(d=>d.check)];
 for(const command of commands){const wrapped='/bin/sh -c '+q('printf "START"; if /bin/sh -c '+q('set -eu; '+command)+'; then rc=0; else rc=$?; fi; printf "RESULT=%s" "$rc"');assert.ok(wrapped.length<3000,t.id+' excede la consola: '+wrapped.length);}
}
const bash=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash';
assert.equal(spawnSync(bash,['--noprofile','--norc','-n'],{input:fixture,encoding:'utf8'}).status,0);
assert.equal(spawnSync(bash,['--noprofile','--norc','-s','--','desconocida'],{input:fixture,encoding:'utf8'}).status,2);
assert.match(fixture,/EQUIVALENCIAS_AFINIDAD_OK/);
assert.match(fixture,/TCP_DNS_REQUERIDO_OK/);assert.match(EJERCICIOS_RED[2].check,/nc -w 3/);
for(const t of EJERCICIOS_RED)assert.ok(fixture.includes('GUARDA_ESCENARIO_'+t.id));
for(const t of EJERCICIOS_RED){assert.ok(t.prepare.some(c=>c.includes('wget -T 3')),'Probar los servidores antes de filtrar');assert.match(t.check,/if kubectl/);assert.doesNotMatch(t.check,/fi if/);}
assert.doesNotMatch(read('laboratorios/kubernetes-real/debian/multinodo.mjs'),/level!=='inicial'&&claseDisponible\(21\)/,'Abrir la clase 21 no instala componentes durante el arranque');
const calls=[];await prepararPoliticasCurso(async(id,label,command)=>{calls.push({id,label,command});return {ok:true};});
assert.equal(calls.length,6);assert.equal(calls.filter(x=>x.id==='worker1').length,3);assert.ok(calls.every(x=>!/(?:kubectl (?:apply|create)|mount --|systemctl (?:start|stop|restart|enable|daemon-reload)|install -m)/.test(x.command)),'Verificar archivos, montaje y servicio no repara ni reinstala el controlador existente');
await assert.rejects(()=>prepararPoliticasCurso(async()=>({ok:false})),/Comprobar la API/);
let step=0;const question={id:'qa',title:'Conexiones',check:'main',preflight:'health',diagnostics:[{check:'connection',message:'El cliente no llega al servicio.'}]};
const failed=await comprobarPractica(question,async()=>({ok:[true,false,false,true][step++]}));assert.equal(failed.message,'El cliente no llega al servicio.');assert.equal(failed.state,'incomplete');
step=0;assert.equal((await comprobarPractica(question,async()=>({ok:[true,false,false,false][step++]}))).state,'unverified','Un fallo de API no se presenta como respuesta incorrecta');
step=0;await comprobarPractica(question,async()=>{step++;return {ok:true};});assert.equal(step,2,'No añadir consultas de diagnóstico si ya se ha superado el ejercicio');
console.log('Diez prácticas de scheduling/red/DNS: sintaxis, límites de consola, pruebas negativas de conectividad e instalación bajo demanda. Pendiente ejecución nativa.');
