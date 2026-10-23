// Prueba conjunta opt-in: usa VMs reales en un perfil de navegador nuevo.
// Ejecutar después del build, con el servidor QA ya abierto. No forma parte
// de los tests rápidos ni se conecta al laboratorio abierto del alumno.
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {chromium} from '@playwright/test';
import {instalarExperimentoPIC} from './kubernetes-pic-experiment.mjs';
const origin=new URL(process.env.S2KTUX_NATIVE_ORIGIN||'http://127.0.0.1:4189');
if(origin.protocol!=='http:'||origin.hostname!=='127.0.0.1'||origin.pathname!=='/'||origin.search||origin.username||origin.password)throw Error('Solo se admite el servidor local de pruebas');
const output=process.env.S2KTUX_NATIVE_OUTPUT?resolve(process.env.S2KTUX_NATIVE_OUTPUT):await mkdtemp(join(tmpdir(),'s2ktux-kube-batch-'));
await mkdir(output,{recursive:true});
const profile=await mkdtemp(join(tmpdir(),'s2ktux-kube-browser-'));
const ids=process.env.S2KTUX_NATIVE_CASES?.split(',');
if(ids?.some(id=>!/^c(?:24|27|28|29|30|31|32|33|34)-[a-z]$/.test(id))||ids&&new Set(ids).size!==ids.length)throw Error('Casos no válidos');
const report={date:new Date().toISOString(),scope:'Prácticas candidatas compatibles con CP+worker. No acredita HA, init, join manual, upgrade, restore desechable ni cobertura completa del curso.',passed:false,checks:[],tasks:[],errors:[]};
const context=await chromium.launchPersistentContext(profile,{headless:true,viewport:{width:1280,height:900}}),page=await context.newPage();
const experiment=process.env.S2KTUX_NATIVE_ENGINE_EXPERIMENT;
if(experiment&&experiment!=='pic-only-v1')throw Error('Experimento de motor no válido');
if(experiment){report.engineExperiment=await instalarExperimentoPIC(context);report.scope+=' Experimento privado de compatibilidad v6/PIC: no acredita migración ni guardado con el nuevo motor.';}
page.on('pageerror',error=>report.errors.push(error.message));
const save=()=>writeFile(join(output,'resultado.json'),JSON.stringify(report,null,2));
let interrupted=false;
let platformFault=false;
async function hardware(){
 const failure=await page.evaluate(()=>{
  for(const[id,node]of globalThis.kubeDebianClusterNodes||[]){
   const text=node.window.kubeDebianTranscript?.replace(/\r/g,'').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,'')||'';
   const found=/(?:^|\n)\[\s*\d+(?:\.\d+)?\]\s*(?:I\/O error, dev|ata\d(?:\.\d+)?:.*(?:failed|error|resetting|disabled)|.*NETDEV WATCHDOG)/.exec(text);
   if(found)return{id,excerpt:text.slice(Math.max(0,found.index-1000),found.index+4000)};
  }return null;
 });
 if(failure){platformFault=true;report.hardwareFailure=failure;throw Error('Error del hardware emulado; no se ejecutarán más ejercicios sobre este clúster');}
}
const interrupt=()=>{interrupted=true;void context.close();};process.once('SIGINT',interrupt);process.once('SIGTERM',interrupt);
const step=value=>typeof value==='string'?{node:'controlplane',command:value}:value;
async function run(node,label,command,timeout=240000){
 const began=Date.now();
 try{
  const result=await page.evaluate(({node,label,command,timeout})=>kubeDebianClusterCheck(node,label,'set -eu; '+command,timeout),{node,label,command,timeout});
  report.checks.push({node,label,ok:result.ok,seconds:(Date.now()-began)/1000});await save();console.log(JSON.stringify(report.checks.at(-1)));return result;
 }catch(error){report.checks.push({node,label,ok:null,error:error.message,seconds:(Date.now()-began)/1000});await save();throw error;}
}
async function script(node,label,command){
 const commands=await page.evaluate(async text=>{const{comandosArchivoGzipWeb}=await import('./archivos-gzip-web.mjs');return comandosArchivoGzipWeb('/tmp/s2ktux-qa-paso.sh','#!/bin/sh\nset -eu\n'+text+'\n');},command);
 for(const command of commands)assert.ok((await run(node,'Enviar script de QA',command,60000)).ok);
 return run(node,label,'sh -e /tmp/s2ktux-qa-paso.sh',300000);
}
const diagnostic=()=>page.evaluate(()=>[...kubeDebianClusterNodes].map(([id,node])=>({id,errors:node.window.kubeDebianErrors,tail:node.window.kubeDebianTranscript.slice(-12000)})));
async function idle(){return page.evaluate(()=>[...kubeDebianClusterNodes.values()].every(node=>/(?:^|\n)\[root@cka-(?:cp1|w[12]) [^\n\]]*\]# $/.test(node.window.kubeDebianTranscript?.replace(/\r/g,'').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,''))));}
const timer=setInterval(async()=>{console.log(await page.evaluate(()=>({status:document.querySelector('#cluster-status').textContent})).catch(()=>({stopped:true})));},30000);
try{
 await page.goto(new URL('/laboratorios/kubernetes-real/debian/multinodo.html?mode=course&level=intermedio&factory=v6&tls=classical&persistent-network=1',origin).href);
 await page.waitForFunction(()=>document.querySelector('#enter-lab')?.onclick);await page.click('#enter-lab');
 await page.waitForFunction(()=>globalThis.kubeDebianClusterProfile);await page.click('#start-cluster');
 const began=Date.now();await page.waitForFunction(()=>globalThis.kubeDebianClusterReady||globalThis.kubeDebianClusterErrors?.length,null,{timeout:1200000});
 assert.deepEqual(await page.evaluate(()=>kubeDebianClusterErrors),[]);report.bootSeconds=(Date.now()-began)/1000;
 await hardware();
 if(experiment){
  assert.equal(await page.evaluate(()=>globalThis.kubeDebianCleanBaseUsed),true,'El experimento solo puede abrir la fábrica inmutable, no preparar/capturar otra con la identidad anterior');
  report.actualNodeEngines=await page.evaluate(()=>[...kubeDebianClusterNodes].map(([id,node])=>({id,engine:node.window.kubeDebianProfile.engineVariant})));
  assert.ok(report.actualNodeEngines.length===2&&report.actualNodeEngines.every(node=>node.engine==='jit8192-pic-v1'),'Ambos nodos deben usar la variante candidata validada');
  await page.evaluate(()=>{globalThis.kubeDebianClusterSave=()=>Promise.reject(Error('Guardar queda desactivado en el experimento de compatibilidad PIC'));});
 }
 const tasks=await page.evaluate(async()=>{
  const[{EJERCICIOS_AVANZADOS:a},{EJERCICIOS_ADMINISTRACION:b},{EJERCICIOS_CICLO_CLUSTER:c}]=await Promise.all([import('./ejercicios-avanzados.mjs'),import('./ejercicios-administracion.mjs'),import('./ejercicios-ciclo-cluster.mjs')]);return [...b,...c,...a];
 });
 if(ids)assert.ok(ids.every(id=>tasks.some(task=>task.id===id)),'Caso inexistente');
 const selected=tasks.filter(task=>ids?ids.includes(task.id):!task.environment);
 assert.ok(selected.length);
 for(const task of selected){
  await hardware();
  if(task.environment)throw Error(task.id+' requiere un escenario independiente; no se ejecutará sobre esta copia de aplicaciones');
  const item={id:task.id,passed:false};report.tasks.push(item);await save();
  try{
   // Ejecutar los mismos pasos y complementos del alumno. Conservar su
   // resultado individual, no un booleano inventado por el instrumento.
   const prepared=await page.evaluate(async task=>{
    const{prepararPractica}=await import('./motor-practicas.mjs');const checks=[];
    try{await prepararPractica(task,async(...args)=>{const result=await kubeDebianClusterCheck(...args);checks.push({node:args[0],label:args[1],ok:result.ok});return result;});return {ok:true,checks};}
    catch(error){return {ok:false,error:error.message,checks};}
   },task);
   item.preparation=prepared;assert.ok(prepared.ok,prepared.error);
   await hardware();
   assert.equal((await run('controlplane',task.id+' sin resolver',task.check)).ok,false);
   for(const value of task.solutionSteps||[task.solutionNative||task.solution]){const s=step(value);assert.ok((await script(s.node,task.id+' solución',s.command)).ok);}
   const wait=`deadline=$(($(date +%s)+180)); until (set -eu; ${task.check}); do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 3; done`;
   assert.ok((await script('controlplane',task.id+' resultado correcto',wait)).ok);
   if(task.equivalent){assert.ok((await script('controlplane',task.id+' equivalente',task.equivalent)).ok);assert.ok((await script('controlplane',task.id+' comprobar equivalente',wait)).ok);}
   for(const value of task.negativeSteps||[task.negative]){const s=step(value);assert.ok((await script(s.node,task.id+' estado incompleto',s.command)).ok);}
   assert.equal((await run('controlplane',task.id+' rechazar incompleto',task.check)).ok,false);item.passed=true;
  }catch(error){item.error=error.message;item.nodes=await diagnostic();await hardware();}
  finally{
   // Un timeout no autoriza a encadenar comandos sobre el proceso pendiente.
   // Detener la batería conserva el fallo sin reiniciar ni reparar la VM.
   if(platformFault)throw Error('Prueba detenida por el fallo de plataforma registrado');
   if(!await idle())throw Error('La consola no ha vuelto al prompt; se detiene el bloque sin ejecutar más prácticas');
   for(const value of task.cleanupSteps||[task.cleanup]){const s=step(value);if(!s.command.trim())continue;const result=await script(s.node,task.id+' limpieza de la práctica',s.command);if(!result.ok){item.passed=false;item.cleanupError='No se ha completado la limpieza';item.cleanupNodes=await diagnostic();}}
   await save();
  }
 }
 await hardware();
 assert.ok((await run('controlplane','Salud final real',`kubectl get --raw=/readyz --request-timeout=20s && nodes=$(kubectl get nodes -o json --request-timeout=20s) && test -n "$nodes" && printf '%s\\n' "$nodes" | jq -e '(.items|length)==2 and all(.items[]; any(.status.conditions[]; .type=="Ready" and .status=="True") and any(.status.conditions[]; .type=="MemoryPressure" and .status=="False"))'`)).ok);
 report.passed=report.tasks.every(task=>task.passed)&&!report.errors.length;
 await page.screenshot({path:join(output,'laboratorio.png'),fullPage:true});
}catch(error){report.error=error.message;report.interrupted=interrupted;report.nodes=await diagnostic().catch(()=>[]);}
finally{clearInterval(timer);await save();await context.close();process.removeListener('SIGINT',interrupt);process.removeListener('SIGTERM',interrupt);console.log(JSON.stringify({passed:report.passed,tasks:report.tasks.map(({id,passed,error})=>({id,passed,error})),output,error:report.error}));}
process.exitCode=report.passed?0:1;
