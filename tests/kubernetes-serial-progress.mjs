import assert from 'node:assert/strict';
import {createKubeChecks} from '../laboratorios/kubernetes-real/serial-checks.mjs';

let input='',idle=true;const phases=[],output=[],finished=[];
const checks=createKubeChecks(text=>{input=text;idle=false;},()=>idle,text=>{finished.push(text);idle=true;},{onPhase:label=>phases.push(label),onOutput:text=>output.push(text)});
const pending=checks.run({checks:[['systemd responde','systemctl --version'],['API responde','kubectl get --raw=/readyz']]},2000);
const prefix=/__KUBE_CHECK_[a-f0-9]+_/.exec(input)[0];
checks.receive(input.replaceAll('\n','\r\n'));assert.equal(output.length,0,'El eco no se presenta como salida de Linux');
const stream='\r\n'+prefix+'0_START\r\nsystemd 252\r\n'+prefix+'0=0\r\n'+prefix+'1_START\r\nNo responde la API\r\n'+prefix+'1=1\r\n[root@cka-cp1 ~]# ';
// Fragmentar también los marcadores: UART no garantiza líneas completas.
for(let at=0;at<stream.length;at+=7)checks.receive(stream.slice(at,at+7));
const result=await pending;
assert.equal(result.ok,false);assert.deepEqual(result.results.map(c=>c.ok),[true,false]);
assert.deepEqual(phases,['systemd responde','systemd responde','API responde']);
assert.equal(output.join(''),'systemd 252\r\nNo responde la API\r\n');
assert.doesNotMatch(output.join(''),/__KUBE_CHECK|systemctl|kubectl/);
assert.match(finished.at(-1),/\[root@cka-cp1 ~\]# /);

const second=checks.run({checks:[['Esperar kubelet','true']]},1000);
const secondPrefix=/__KUBE_CHECK_[a-f0-9]+_/.exec(input)[0];
checks.receive('\n'+secondPrefix+'0_START\nkubelet sigue arrancando\n');
await assert.rejects(second,/No terminó a tiempo: Esperar kubelet/);
assert.ok(idle);assert.equal(checks.receive('salida posterior'),false);
await assert.rejects(checks.run({checks:[['Orden demasiado grande','x'.repeat(3100)]]}),/límite seguro/);
console.log('Kubernetes: fases reales, salida UART sin eco/protocolo, resultados fallidos y tiempos de espera diferenciados.');
