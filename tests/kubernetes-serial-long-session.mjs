import assert from 'node:assert/strict';
import {createKubeChecks} from '../laboratorios/kubernetes-real/serial-checks.mjs';
import {EstadoConsola} from '../laboratorios/kubernetes-real/debian/estado-consola.mjs';

let input='',visible=0,diagnostic='';
const checker=createKubeChecks(text=>input=text,()=>true,text=>diagnostic=text,{onOutput:text=>visible+=text.length});
const exercise={checks:[['Primera condición','false'],['Segunda condición','true']]};
const pending=checker.run(exercise,30000),prefix=/__KUBE_CHECK_[a-f0-9]+_/.exec(input)[0];
checker.receive('\n'+prefix+'0_START\n'+prefix+'0=1\n'+prefix+'1_START\n');
const chunk='a'.repeat(8192);for(let i=0;i<256;i++)checker.receive(chunk);
checker.receive('\n'+prefix+'1=0\n');
// Un segundo resultado no puede sustituir el primer código de salida.
checker.receive(prefix+'0=0\n');
for(const char of '[root@cka-cp1 ~]# ')checker.receive(char);
const result=await pending;assert.equal(result.ok,false);assert.deepEqual(result.results.map(r=>r.ok),[false,true]);
assert.equal(visible,chunk.length*256+1,'Mostrar también una línea larga, sin guardar todo el historial');
assert.match(diagnostic,/root@cka-cp1/);

const aborted=checker.run({checks:[['Diagnóstico largo','true']]},30000);const rejected=assert.rejects(aborted,/Cancelado/);
for(let i=0;i<256;i++)checker.receive(chunk+'\n');
checker.receive('ULTIMA_SALIDA');assert.equal(checker.abort(Error('Cancelado')),true);await rejected;
assert.ok(diagnostic.length<=300000,'El diagnóstico tiene un límite independiente de lo mostrado');assert.ok(diagnostic.endsWith('ULTIMA_SALIDA'));
assert.equal(checker.receive('ya no hay comprobación'),false);
for(const ending of ['[root@cka-cp1 ~]# ','\x1b[?2004h[root@cka-cp1 ~]# ','[alumno@cka-cp1 /tmp]$ ']){
 const state=new EstadoConsola();state.receive(('registro\r\n').repeat(50000)+ending);assert.equal(state.idle,true);state.input('kubectl get pods\n');assert.equal(state.idle,false);state.receive('todavía ejecutando');assert.equal(state.idle,false);
}
const busy=new EstadoConsola();busy.receive('x'.repeat(300000)+'[root@cka-cp1 ~]# ');assert.equal(busy.idle,false,'No convertir el final de una línea de datos en un prompt');
for(const prefix of ['',('registro\r\n').repeat(30000),'x'.repeat(300000)])for(const tail of ['[root@cka-cp1 ~]# ','[alumno@cka-cp1 /tmp]$ ','\x1b[?2004h[root@cka-cp1 ~]# ','[root@cka-cp1 ~]# \r\n','registro incompleto']){const text=prefix+tail,state=new EstadoConsola();state.receive(text);const original=/(?:^|\n)\[[^\n@\]]+@[^\n\]]+ [^\n\]]*\][#$] $/.test(text.replace(/\r/g,'').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,''));assert.equal(state.idle,original);}
console.log('Sesiones largas: salida continua sin límite de historial acumulado; diagnóstico acotado, resultados retenidos y códigos fallidos no sobrescritos.');
