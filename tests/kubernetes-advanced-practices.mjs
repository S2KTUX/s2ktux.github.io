import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {EJERCICIOS_AVANZADOS as tasks} from '../laboratorios/kubernetes-real/debian/ejercicios-avanzados.mjs';
import {pasoPractica,prepararPractica,comprobarPractica} from '../laboratorios/kubernetes-real/debian/motor-practicas.mjs';
assert.deepEqual([...new Set(tasks.map(task=>task.classNumber))],[29,30,31,32,33,34]);
assert.equal(new Set(tasks.map(task=>task.id)).size,tasks.length);
assert.equal(tasks.length,18);
const apiDown=tasks.find(task=>task.id==='c33-c');
assert.equal(apiDown.environment,'disposable-cluster');
assert.doesNotMatch(apiDown.preflight,/kubectl/,'Con el API caído, el diagnóstico empieza por consola');
assert.match(apiDown.solutionDisplay,/crictl logs/);
assert.doesNotMatch(apiDown.solutionDisplay,/kubeadm (?:init|reset)|renew/);
for(const command of [apiDown.prepare.at(-1),apiDown.cleanup]){
 assert.match(command,/curl --fail --silent --show-error --max-time 5/,'El sondeo de preparación no debe lanzar repetidamente clientes Go');
 assert.match(command,/--cacert \/etc\/kubernetes\/pki\/ca\.crt/,'Conservar verificación de la CA real');
 assert.match(command,/--cert \/etc\/kubernetes\/pki\/apiserver-kubelet-client\.crt/);
 assert.match(command,/https:\/\/127\.0\.0\.1:6443\/readyz/,'No aceptar solo un puerto abierto o livez');
 assert.doesNotMatch(command,/--insecure|(?:^|\s)-k(?:\s|$)|exclude=/);
}
assert.match(apiDown.check,/kubectl get --raw=\/readyz/,'El corrector final sigue usando el API de Kubernetes');
assert.match(apiDown.cleanup,/kubectl wait --for=condition=Ready nodes --all/);
let unsafeCalled=false;
await assert.rejects(prepararPractica(apiDown,async()=>{unsafeCalled=true;return {ok:true};}),/entorno independiente/);
assert.equal(unsafeCalled,false,'Una sesión de curso no puede preparar una caída del API');
for(const id of ['c32-a','c32-c','c32-d','c32-e','c32-f']){
 const task=tasks.find(task=>task.id===id);
 assert.doesNotMatch(task.solutionDisplay,/apiVersion:/,'La solución visible repara el campo necesario, no sustituye todo el Deployment');
 assert.ok(task.solutionNative,'Conservar un recorrido nativo ejecutable para contrastar el resultado');
}
assert.match(tasks.find(task=>task.id==='c32-c').solutionDisplay,/set image deployment\/web/);
assert.match(tasks.find(task=>task.id==='c32-e').solutionDisplay,/logs deployment\/web -c inicio/);
assert.ok(tasks.find(task=>task.id==='c30-a').cleanup.indexOf('helm uninstall')<tasks.find(task=>task.id==='c30-a').cleanup.indexOf('kubectl delete namespace'),'Desinstalar la release antes de borrar su namespace');
for(const task of tasks){const own='kubectl delete namespace p'+task.classNumber+task.id.at(-1);assert.ok(task.cleanup.split(own).length<=2,task.id+' no debe borrar dos veces su namespace');}
const shell=[];
const q=s=>"'"+s.replaceAll("'","'\\''")+"'";
for(const task of tasks){
 assert.ok(task.title.endsWith(' · I')||task.title.endsWith(' · II'));
 assert.equal(task.validation,'external-report');
 assert.ok(task.check&&task.prepare.length&&task.cleanup);
 assert.ok(task.negative||task.negativeSteps);
 assert.doesNotMatch(task.solutionDisplay,/runuser|printf/);
 assert.doesNotMatch(task.prompt,/jsonpath|jq |kubectl patch/);
 assert.doesNotMatch(task.solutionDisplay||task.solution,/deployment\/undefined/);
 if(task.id==='c29-a')assert.match(task.check,/object=\$\(kubectl get --raw=/,'Un error de la Metrics API no puede aprobar por jq sin entrada');
 for(const step of task.prepare)shell.push(pasoPractica(step).command);
 for(const key of ['check','solutionNative','negative','equivalent','cleanup'])if(task[key])shell.push(task[key]);
 if(!task.solutionSteps)shell.push(task.solutionNative||task.solution);
 for(const key of ['solutionSteps','negativeSteps','cleanupSteps'])for(const step of task[key]||[])shell.push(pasoPractica(step).command);
 const wrapped='/bin/sh -c '+q('printf "\\n__KUBE_CHECK_000000000000000000000000_0_START\\n"; if /bin/sh -c '+q('set -eu; '+task.check)+'; then rc=0; else rc=$?; fi; printf "\\n__KUBE_CHECK_000000000000000000000000_0=%s\\n" "$rc"');
 assert.ok(wrapped.length<3000,task.id+' supera el transporte serial');
}
const binary=process.platform==='win32'?'C:/Program Files/Git/bin/bash.exe':'bash';
const input=shell.map((source,index)=>'\n# Caso '+index+'\n(\n'+source+'\n)\n').join('');
const syntax=spawnSync(binary,['--noprofile','--norc','-n'],{input,encoding:'utf8'});assert.equal(syntax.status,0,syntax.stderr);
assert.throws(()=>pasoPractica({node:'host',command:'echo no'}),/no válido/);
assert.throws(()=>pasoPractica({node:'worker1',command:''}),/no válido/);
const steps=[];
await prepararPractica({id:'steps',title:'Pasos',prepare:['echo cp',{node:'worker1',command:'echo worker'}]},async(...args)=>{steps.push(args);return {ok:true};});
assert.deepEqual(steps.map(args=>args[0]),['controlplane','worker1']);
assert.deepEqual(steps.map(args=>args[2]),['set -eu; echo cp','set -eu; echo worker']);
for(const task of tasks){
 const positive=await comprobarPractica(task,async()=>({ok:true}));assert.equal(positive.state,'correct');
 const partial=await comprobarPractica(task,async(node,label)=>({ok:!label.startsWith('Comprobar '+task.title)&&!label.startsWith('Revisar '+task.title)}));assert.equal(partial.state,'incomplete');
 const failure=await comprobarPractica(task,async()=>{throw Error('UART sin respuesta');});assert.equal(failure.state,'unverified');
}
console.log('Banco conjunto 29–34: 18 candidatos, API caída solo en copia desechable, sintaxis shell, límites UART y resultados de transporte. No sustituye la aceptación nativa.');
