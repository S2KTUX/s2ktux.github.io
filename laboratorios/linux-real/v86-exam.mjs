import {examQuestions,EXAM_SECONDS,EXAM_TOTAL,EXAM_PASS,scoreQuestion} from './v86-exam-data.mjs?v=20261009-exam';

const $=selector=>document.querySelector(selector);
const attempt=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
const machines=new Map(),pending=new Map();
let phase='intro',selected='1',startedAt,deadline,clock;
const make=(tag,text)=>{const el=document.createElement(tag);el.textContent=text;return el;};
function renderQuestions(){
  const root=$('#exam-questions');root.replaceChildren();
  for(const q of examQuestions.filter(q=>String(q.node)===selected)){
    const item=make('article','');item.className='exam-question';
    item.append(make('h3',`${q.number==='root'?'Recuperar root':`Pregunta ${q.number}`} · ${q.title} · ${q.points} puntos`),make('p',q.goal));
    if(q.note)item.append(make('p',q.note));root.append(item);
  }
}
function selectNode(node){
  selected=node;
  for(const [name,m] of machines)m.frame.hidden=name!==node;
  for(const button of document.querySelectorAll('[data-exam-node]'))button.setAttribute('aria-pressed',String(button.dataset.examNode===node));
  renderQuestions();
}
for(const button of document.querySelectorAll('[data-exam-node]'))button.onclick=()=>selectNode(button.dataset.examNode);
function request(node,action,id){
  const m=machines.get(String(node)),requestId=crypto.randomUUID();
  return new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>{pending.delete(requestId);reject(Error('La máquina no respondió a tiempo; la corrección no está completa.'));},action==='check'?330000:10000);
    pending.set(requestId,{node:String(node),resolve,reject,timeout});
    m.frame.contentWindow.postMessage({kind:'s2ktux-exam-request',attempt,requestId,action,id},location.origin);
  });
}
window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.data?.attempt!==attempt)return;
  const entry=[...machines].find(([,m])=>m.frame.contentWindow===event.source);
  if(!entry)return;
  const [node,m]=entry,data=event.data;
  if(data.kind==='s2ktux-exam-ready'){
    m.ready=true;m.resolve();
  }else if(data.kind==='s2ktux-exam-failed')m.reject(Error(`Máquina ${node}: ${data.error}`));
  else if(data.kind==='s2ktux-exam-result'){
    const job=pending.get(data.requestId);if(!job||job.node!==node)return;
    pending.delete(data.requestId);clearTimeout(job.timeout);
    if(data.error)job.reject(Error(data.error));else job.resolve(data.result);
  }
});
async function createMachine(node){
  const frame=document.createElement('iframe');frame.title=`Terminal de la máquina ${node}`;
  frame.allow='clipboard-read; clipboard-write';frame.hidden=node!==selected;
  const ready=new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>reject(Error(`La máquina ${node} no pudo prepararse. No se ha iniciado el cronómetro.`)),420000);
    machines.set(node,{frame,ready:false,resolve:()=>{clearTimeout(timer);resolve();},reject:error=>{clearTimeout(timer);reject(error);}});
  });
  const url=new URL('v86-test.html',location.href);url.searchParams.set('exam',attempt);url.searchParams.set('node',node);url.searchParams.set('embed','exam');
  if(node==='2')url.searchParams.set('scenario','recovery');
  frame.src=url.href;$('#exam-machines').append(frame);
  await ready;
}
const timeText=seconds=>[Math.floor(seconds/3600),Math.floor(seconds%3600/60),seconds%60].map(v=>String(v).padStart(2,'0')).join(':');
function tick(){
  const remaining=Math.max(0,Math.ceil((deadline-Date.now())/1000));$('#exam-time').textContent=timeText(remaining);
  if(!remaining&&phase==='running')finish(true);
}
$('#exam-start').onclick=async()=>{
  if(phase!=='intro')return;phase='preparing';$('#exam-start').disabled=true;$('#exam-intro').hidden=true;
  $('#exam-workspace').hidden=false;document.documentElement.classList.add('exam-running');renderQuestions();
  try{
    $('#exam-status').textContent='Preparando máquina 1…';await createMachine('1');
    $('#exam-status').textContent='Preparando máquina 2 y los datos del examen…';await createMachine('2');
    startedAt=Date.now();deadline=startedAt+EXAM_SECONDS*1000;phase='running';
    $('#exam-status').textContent='Examen iniciado.';$('#exam-finish').disabled=false;
    tick();clock=setInterval(tick,1000);
  }catch(error){
    phase='failed';$('#exam-status').textContent=error.message+' Recarga para volver a intentarlo.';
    document.documentElement.classList.remove('exam-running');
  }
};
async function finish(expired=false){
  if(phase!=='running')return;
  if(!expired&&!confirm('¿Finalizar y corregir el examen? Ya no podrás modificar este intento. Deja ambas máquinas en una línea de comandos de root vacía, sin editores ni órdenes en curso.'))return;
  phase='grading';clearInterval(clock);$('#exam-finish').disabled=true;
  const unavailable=new Map();
  await Promise.all([...machines.keys()].map(async node=>{try{await request(node,'lock');}catch(error){unavailable.set(node,error.message);}}));
  const reports=[];
  for(const q of examQuestions){
    $('#exam-status').textContent=`Corrigiendo máquina ${q.node}: ${q.title}…`;
    try{if(unavailable.has(String(q.node)))throw Error(unavailable.get(String(q.node)));reports.push(scoreQuestion(q,await request(q.node,'check',q.id)));}
    catch(error){reports.push({id:q.id,error:error.message,max:q.points});}
  }
  phase='finished';$('#exam-workspace').hidden=true;$('#exam-results').hidden=false;
  document.documentElement.classList.remove('exam-running');
  const incomplete=reports.some(r=>r.error),score=reports.reduce((n,r)=>n+(r.points||0),0);
  $('#exam-score').textContent=incomplete?`Corrección incompleta · ${score} puntos comprobados`:`${score}/${EXAM_TOTAL} puntos`;
  $('#exam-verdict').textContent=incomplete?'No se puede emitir un aprobado o suspenso fiable: hay preguntas que no se han podido comprobar. Abajo se indica el motivo.':score>=EXAM_PASS?'Aprobado.':'No aprobado. Necesitas 210 puntos.';
  $('#exam-status').textContent=expired?'Tiempo agotado. Intento finalizado.':'Intento finalizado.';
  const reportRoot=$('#exam-report');reportRoot.replaceChildren();
  for(const q of examQuestions){
    const r=reports.find(r=>r.id===q.id),item=make('details','');
    item.append(make('summary',`Máquina ${q.node} · ${q.title} · ${r.error?'Sin corregir':r.points}/${q.points}`),make('p',q.goal));
    if(r.error)item.append(make('p',r.error));
    else{
      for(const c of r.criteria)item.append(make('p',`${c.ok?'Correcto':'Pendiente'} · ${c.label} · ${c.ok?c.points:0}/${c.points}`));
      for(const o of r.observations){item.append(make('h3',`Estado observado · ${o.label}`),make('pre',o.text||'(sin salida)'));}
    }
    item.append(make('h3','Una solución válida'),make('pre',q.solution));reportRoot.append(item);
  }
  // Conservar el informe, no los discos del examen, en esta pestaña.
  globalThis.examReport={startedAt,finishedAt:Date.now(),score,total:EXAM_TOTAL,incomplete,reports};
  await Promise.all([...machines.keys()].map(node=>request(node,'stop').catch(()=>{})));
  $('#exam-machines').replaceChildren();machines.clear();
}
$('#exam-finish').onclick=()=>finish();
$('#exam-retry').onclick=()=>location.reload();
window.addEventListener('beforeunload',event=>{if(['preparing','running','grading'].includes(phase)){event.preventDefault();event.returnValue='';}});
$('#exam-start').disabled=false;
