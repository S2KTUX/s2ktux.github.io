import {examQuestions,EXAM_SECONDS,EXAM_TOTAL,EXAM_PASS,scoreQuestion} from './v86-exam-data.mjs?v=20261010-exam';
import {examNode2Information} from './v86-exam-fixtures.mjs?v=20261010-exam';
const $=s=>document.querySelector(s),make=(tag,text)=>{const e=document.createElement(tag);e.textContent=text;return e;};
const attempt=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
const machines=new Map(),pending=new Map(),indices=new Map([['1',0],['2',0]]);
let phase='intro',selected='1',startedAt,deadline,clock,remaining=EXAM_SECONDS;
const label=q=>q.number==='root'?'Recuperar root':`Pregunta ${q.number}`;
const questions=()=>examQuestions.filter(q=>String(q.node)===selected);
const timeText=s=>[Math.floor(s/3600),Math.floor(s%3600/60),s%60].map(v=>String(v).padStart(2,'0')).join(':');
function renderQuestions(){
 const list=questions(),i=indices.get(selected),q=list[i],root=$('#exam-questions');
 root.replaceChildren();const item=make('article','');item.className='exam-question';
 if(selected==='2'){const info=make('p',examNode2Information);info.className='exam-machine-info';root.append(info);}
 item.append(make('h2',q.title));for(const paragraph of q.goal.split('\n\n'))item.append(make('p',paragraph));if(q.note)item.append(make('p',q.note));root.append(item);
 const select=$('#question-select');select.replaceChildren();
 list.forEach((q,i)=>{const o=make('option',`${label(q)} · ${q.title}`);o.value=i;select.append(o);});
 select.value=i;$('#question-prev').disabled=i===0;$('#question-next').disabled=i===list.length-1;
}
function selectQuestion(i){indices.set(selected,i);renderQuestions();}
$('#question-select').onchange=e=>selectQuestion(Number(e.target.value));
$('#question-prev').onclick=()=>selectQuestion(Math.max(0,indices.get(selected)-1));
$('#question-next').onclick=()=>selectQuestion(Math.min(questions().length-1,indices.get(selected)+1));
function selectNode(node){
 selected=node;for(const [name,m] of machines)m.frame.hidden=name!==node;
 for(const b of document.querySelectorAll('[data-exam-node]'))b.setAttribute('aria-pressed',String(b.dataset.examNode===node));
 $('#exam-machine-placeholder').hidden=machines.has(node);
 $('#exam-machine-start').disabled=phase==='preparing'||phase==='grading';
 $('#exam-machine-start').textContent=phase==='preparing'?'Espera a la máquina 1…':'Iniciar máquina 2';
 $('#exam-machine-description').textContent='La máquina 2 está apagada. Iníciala para trabajar en ella. Tras su arranque normal estarán disponibles los servicios de la red del examen. El cronómetro se pausa solo durante su preparación inicial.';
 renderQuestions();
}
for(const b of document.querySelectorAll('[data-exam-node]'))b.onclick=()=>selectNode(b.dataset.examNode);
function request(node,action,id){
 const m=machines.get(String(node)),requestId=crypto.randomUUID();if(!m)return Promise.reject(Error('Máquina no iniciada.'));
 return new Promise((resolve,reject)=>{
  const timeout=setTimeout(()=>{pending.delete(requestId);reject(Error('La máquina no respondió a tiempo.'));},action==='check'?330000:10000);
  pending.set(requestId,{node:String(node),resolve,reject,timeout});
  m.frame.contentWindow.postMessage({kind:'s2ktux-exam-request',attempt,requestId,action,id},location.origin);
 });
}
window.addEventListener('message',event=>{
 if(event.origin!==location.origin||event.data?.attempt!==attempt)return;
 const entry=[...machines].find(([,m])=>m.frame.contentWindow===event.source);if(!entry)return;
 const [node,m]=entry,data=event.data;
 if(data.kind==='s2ktux-exam-ready'){m.ready=true;m.resolve();}
 else if(data.kind==='s2ktux-exam-activity')m.touched=true;
 else if(data.kind==='s2ktux-exam-size'&&Number.isFinite(data.height))m.frame.style.height=Math.min(1800,Math.max(450,data.height))+'px';
 else if(data.kind==='s2ktux-exam-failed'){m.error=data.error;m.reject(Error(`Máquina ${node}: ${data.error}`));}
 else if(data.kind==='s2ktux-exam-result'){
  const job=pending.get(data.requestId);if(!job||job.node!==node)return;
  pending.delete(data.requestId);clearTimeout(job.timeout);if(data.error)job.reject(Error(data.error));else job.resolve(data.result);
 }
});
async function createMachine(node){
 const frame=document.createElement('iframe');frame.title=`Terminal de la máquina ${node}`;frame.allow='clipboard-read; clipboard-write';frame.hidden=node!==selected;
 const ready=new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error(`La máquina ${node} no pudo prepararse.`)),900000);
  machines.set(node,{frame,ready:false,touched:false,timer,resolve:()=>{clearTimeout(timer);resolve();},reject:e=>{clearTimeout(timer);reject(e);}});
 });
 const url=new URL('v86-test.html',location.href);url.searchParams.set('exam',attempt);url.searchParams.set('node',node);url.searchParams.set('embed','exam');
 if(node==='2')url.searchParams.set('scenario','recovery');frame.src=url.href;$('#exam-machines').append(frame);selectNode(selected);await ready;
}
function tick(){remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));$('#exam-time').textContent=timeText(remaining);if(!remaining&&phase==='running')finish(true);}
async function startMachine(node){
 if(machines.has(node)||['grading','finished'].includes(phase)||phase==='preparing'&&machines.size)return;
 if(clock){remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));clearInterval(clock);clock=undefined;}
 phase='preparing';$('#exam-machine-start').disabled=true;$('#exam-status').textContent=`Preparando máquina ${node}… Cronómetro pausado durante la preparación.`;
 try{
  await createMachine(node);if(phase!=='preparing')return;startedAt??=Date.now();
  phase='running';selectNode(selected);deadline=Date.now()+remaining*1000;tick();clock=setInterval(tick,1000);
  $('#exam-status').textContent=`Máquina ${node} disponible. Puedes cambiar de pregunta o finalizar cuando quieras.`;
 }catch(error){if(phase!=='preparing')return;phase='failed';selectNode(selected);$('#exam-status').textContent=error.message+' Puedes finalizar este intento o empezar uno nuevo.';}
}
$('#exam-machine-start').onclick=()=>startMachine('2');
$('#exam-start').onclick=()=>{
 if(phase!=='intro')return;$('#exam-start').disabled=true;$('#exam-intro').hidden=true;$('#exam-workspace').hidden=false;
 document.documentElement.classList.add('exam-running');selectNode('1');startMachine('1');
};
const unanswered=q=>({id:q.id,points:0,max:q.points,unanswered:true,criteria:q.checks.map(([label])=>({label,ok:false})),observations:[]});
async function finish(expired=false){
 if(!['preparing','running','failed'].includes(phase))return;
 if(!expired&&!confirm('¿Finalizar el examen y ver los resultados? Este intento quedará cerrado.'))return;
 phase='grading';clearInterval(clock);$('#exam-finish').disabled=true;$('#exam-machine-start').disabled=true;
 const unavailable=new Map();
 await Promise.all([...machines].map(async([node,m])=>{if(!m.ready||!m.touched)return;try{const r=await request(node,'lock');if(!r.available)unavailable.set(node,'Linux no está disponible para consultar su estado. La máquina está apagada, bloqueada o aún en recuperación.');}catch(e){unavailable.set(node,e.message);}}));
 const reports=[];
 for(const q of examQuestions){
  const m=machines.get(String(q.node));if(!m?.ready||!m.touched){reports.push(unanswered(q));continue;}
  $('#exam-status').textContent=`Comprobando máquina ${q.node}: ${q.title}…`;
  try{
   if(unavailable.has(String(q.node)))throw Error(unavailable.get(String(q.node)));
   reports.push(scoreQuestion(q,await request(q.node,'check',q.id)));
  }catch(e){reports.push({id:q.id,error:e.message,max:q.points});}
 }
 phase='finished';$('#exam-workspace').hidden=true;$('#exam-results').hidden=false;document.documentElement.classList.remove('exam-running');
 const incomplete=reports.some(r=>r.error),score=reports.reduce((n,r)=>n+(r.points||0),0);
 $('#exam-score').textContent=`${score}/${EXAM_TOTAL} puntos`;
 $('#exam-verdict').textContent=incomplete?'Corrección incompleta: hay preguntas que no se han podido consultar. No se emite un aprobado con comprobaciones pendientes.':score>=EXAM_PASS?'Aprobado.':'No aprobado. Necesitas 210 puntos.';
 $('#exam-status').textContent=expired?'Tiempo agotado. Intento finalizado.':'Intento finalizado.';
 const root=$('#exam-report');root.replaceChildren();
 for(const q of examQuestions){
  const r=reports.find(r=>r.id===q.id),item=make('details','');
  const state=r.error?'No se pudo comprobar':r.unanswered?'Sin responder':r.points===q.points?'Correcta':r.points>0?'Parcialmente correcta':'No correcta';
  item.append(make('summary',`Máquina ${q.node} · ${label(q)} · ${q.title} — ${state}`),make('p',q.goal));
  item.dataset.result=r.error?'error':r.unanswered?'unanswered':r.points===q.points?'correct':r.points>0?'partial':'incorrect';
  item.append(make('h3','Tu resultado'));
  if(r.error)item.append(make('p',r.error));else if(r.unanswered)item.append(make('p','No has trabajado en esta máquina.'));
  else{
   for(const c of r.criteria)item.append(make('p',`${c.ok?'Cumplido':'No cumplido'} · ${c.label}`));
   for(const o of r.observations)item.append(make('h4',o.label),make('pre',o.text||'(sin salida)'));
  }
  item.append(make('h3','Una solución válida'),make('pre',q.solution));root.append(item);
 }
 globalThis.examReport={startedAt,finishedAt:Date.now(),score,total:EXAM_TOTAL,incomplete,reports};
 for(const m of machines.values())clearTimeout(m.timer);
 for(const job of pending.values()){clearTimeout(job.timeout);job.reject(Error('Intento finalizado.'));}pending.clear();
 $('#exam-machines').replaceChildren();machines.clear();$('#exam-results').scrollIntoView({behavior:'smooth',block:'start'});
}
$('#exam-finish').onclick=()=>finish();$('#exam-retry').onclick=()=>location.reload();
window.addEventListener('beforeunload',e=>{if(['preparing','running','grading'].includes(phase)){e.preventDefault();e.returnValue='';}});
$('#exam-start').disabled=false;
