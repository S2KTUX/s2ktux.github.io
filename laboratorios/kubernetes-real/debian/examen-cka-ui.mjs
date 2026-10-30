import {TAREAS_CKA} from './examen-cka-banco.mjs?v=146843198f26771b';
import {nuevoIntento,informeCKA,prepararExamenCKA,corregirExamenCKA,CKA_CREDENTIAL_DIR} from './examen-cka-motor.mjs?v=bddf4e44711d2882';
const $=id=>document.getElementById(id),english=new URL(location.href).searchParams.get('lang')==='en',lang=english?'en':'es';
const say=(es,en)=>english?en:es;
document.title=say('Simulacro CKA','CKA mock exam')+' · S2KTUX';document.querySelector('h1').textContent=say('Simulacro CKA','CKA mock exam');
document.querySelector('label[for="exam-question"]').textContent=say('Pregunta','Task');
const url=new URL(location.href);for(const [key,value]of Object.entries({mode:'course',level:'avanzado',factory:'v15',tls:'classical','persistent-network':'1','use-scheduling-api':'1',escenario:'cka-exam',clase:'24'}))url.searchParams.set(key,value);
history.replaceState(history.state,'',url.href);document.documentElement.lang=lang;
let attempt=null,finishing=false,interval=null;
const run=(node,label,command,timeout)=>globalThis.kubeDebianClusterCheck(node,label,'export S2KTUX_CKA_CERT='+CKA_CREDENTIAL_DIR+'/tls.crt S2KTUX_CKA_KEY='+CKA_CREDENTIAL_DIR+'/tls.key; '+command,timeout);
globalThis.kubeDebianExamRun=run;
$('exam-intro-text').textContent=say('Dos horas, 100 puntos y aprobado desde 66. La preparación de las máquinas queda fuera del tiempo. Podrás finalizar cuando quieras.','Two hours, 100 points, passing score 66. Machine preparation is not timed. You can finish at any time.');
$('exam-session-note').textContent=say('* El intento no se conserva si cierras o recargas la página.','* Closing or reloading the page loses this attempt.');
$('begin-exam').textContent=say('Preparar e iniciar','Prepare and start');$('finish-exam').textContent=say('Finalizar examen','Finish exam');$('exam-mark-label').textContent=say('Marcar para revisar','Flag for review');
function renderQuestion(){
 const index=Number($('exam-question').value),task=TAREAS_CKA[index];
 $('exam-task-title').textContent=say('Pregunta ','Task ')+(index+1);$('exam-task-prompt').textContent=task.prompt[lang];$('exam-mark').checked=attempt?.marked.includes(task.id)||false;
}
function renderIndex(){
 const previous=$('exam-question').value;
 $('exam-question').replaceChildren(...TAREAS_CKA.map((task,i)=>{const option=document.createElement('option');option.value=String(i);option.textContent=say('Pregunta ','Task ')+(i+1)+(attempt?.marked.includes(task.id)?' · ★':'');return option;}));
 if(previous)$('exam-question').value=previous;renderQuestion();
}
$('exam-question').onchange=renderQuestion;
$('exam-mark').onchange=()=>{if(!attempt||finishing)return;const id=TAREAS_CKA[Number($('exam-question').value)].id;attempt.marked=attempt.marked.filter(value=>value!==id);if($('exam-mark').checked)attempt.marked.push(id);renderIndex();};
function clock(){
 const left=Math.max(0,attempt.endsAt-Date.now()),seconds=Math.ceil(left/1000);
 $('exam-clock').textContent=[Math.floor(seconds/3600),Math.floor(seconds%3600/60),seconds%60].map(n=>String(n).padStart(2,'0')).join(':');
 if(!left&&!finishing)finish();
}
function el(tag,text){const item=document.createElement(tag);if(text!==undefined)item.textContent=text;return item;}
function showResults(report){
 const section=$('exam-results');section.replaceChildren();
 section.append(el('h2',report.unverified?say('Evaluación incompleta','Incomplete assessment'):report.passed?say('Aprobado','Passed'):say('No aprobado','Not passed')));
 section.append(el('p',`${report.score}/100 · ${Math.round(report.elapsedMs/60000)} min`));
 if(report.unverified)section.append(el('p',say('Algunas comprobaciones no han podido ejecutarse. No se presenta un aprobado ni un suspenso definitivo.','Some checks could not run. No final pass or fail is reported.')));
 const names={architecture:say('Arquitectura y configuración','Architecture and configuration'),workloads:say('Workloads y scheduling','Workloads and scheduling'),networking:say('Servicios y redes','Services and networking'),storage:say('Almacenamiento','Storage'),troubleshooting:say('Resolución de problemas','Troubleshooting')};
 const table=el('table'),body=el('tbody');for(const [id,domain]of Object.entries(report.domains)){const row=el('tr');row.append(el('th',names[id]),el('td',domain.percent+' %'));body.append(row);}table.append(body);section.append(table);
 const details=el('details');details.append(el('summary',say('Revisar las preguntas y sus soluciones','Review tasks and solutions')));
 for(const [i,result]of report.tasks.entries()){
  const task=TAREAS_CKA[i],item=el('details'),summary=el('summary',say('Pregunta ','Task ')+(i+1)+` · ${result.earned}/${result.max}`);summary.dataset.result=result.conditions.includes(null)?'unverified':result.earned===result.max?'correct':result.earned>0?'incomplete':'incorrect';item.append(summary);item.append(el('p',task.prompt[lang]));
  const list=el('ul');for(const [n,value]of result.conditions.entries()){const condition=el('li',(value===true?'✓ ':value===false?'✗ ':'? ')+task.conditions[n].label[lang]);condition.dataset.result=value===true?'correct':value===false?'incorrect':'unverified';list.append(condition);}item.append(list);
  item.append(el('h3',say('Solución de referencia','Reference solution')),el('pre',task.solution));details.append(item);
 }
 section.append(details);section.hidden=false;
}
async function finish(){
 if(!attempt||finishing)return;finishing=true;clearInterval(interval);attempt.finishedAt=Date.now();$('finish-exam').disabled=true;
 $('exam-attempt').hidden=true;$('cluster-status').textContent=say('Evaluando el resultado de las tareas…','Evaluating task results…');
 // La evaluación consulta el estado real; no compara el historial de comandos.
 const results=await corregirExamenCKA(run);showResults(informeCKA(results,attempt));
 $('cluster-status').textContent=say('Evaluación finalizada.','Assessment complete.');
}
$('finish-exam').onclick=()=>finish();
$('begin-exam').onclick=async()=>{
 $('begin-exam').disabled=true;$('exam-error').textContent='';
 try{
  await import('./multinodo.mjs?v=a212fa8846fe9700');
  document.querySelector('h1').textContent=say('Simulacro CKA','CKA mock exam');
  await $('start-cluster').onclick();
  if(!globalThis.kubeDebianClusterReady||globalThis.kubeDebianClusterErrors?.length)throw Error(say('El clúster no está disponible. No ha comenzado el tiempo.','The cluster is not ready. The timer has not started.'));
  // Una base limpia, nunca un intento anterior. El simulacro tiene su propia
  // identidad de sesión y no reutiliza el guardado de las prácticas.
  await prepararExamenCKA(run,{fresh:globalThis.kubeDebianClusterRecovered!==true,prepared:globalThis.kubeDebianExamBaseUsed===true,capture:globalThis.kubeDebianExamCacheSave});
  globalThis.kubeDebianExamOpenTerminals();
  await globalThis.kubeDebianClusterNodes.get('controlplane').window.kubeDebianExamShortcuts();
  attempt=nuevoIntento();$('exam-intro').hidden=true;$('exam-attempt').hidden=false;renderIndex();clock();interval=setInterval(clock,1000);
  globalThis.ckaExam={get attempt(){return attempt;},finish,get tasks(){return TAREAS_CKA;}};
 }catch(error){$('exam-error').textContent=String(error.message||error);}
};
window.addEventListener('beforeunload',event=>{if(attempt&&!attempt.finishedAt){event.preventDefault();event.returnValue='';}});
// El acceso se habilita en la portada después de la aceptación nativa.
document.querySelector('#save-cluster').style.display='none';document.querySelector('#reset-cluster').style.display='none';
renderIndex();
