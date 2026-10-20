import {questions} from './questions.mjs?v=20261020-daypo1';
import {answerCorrect,shuffle,createExam,reportFor,EXAM_SECONDS} from './engine.mjs?v=20261020-daypo1';
import {renderDomains} from '../exam-report.mjs';
import {PRACTICE_KEY,LEGACY_KEY,practiceState,practiceStatus,hasAnswer} from './practice-state.mjs?v=20261020-daypo1';

const $=id=>document.getElementById(id);
const make=(tag,text)=>{const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;};
const byId=new Map(questions.map(q=>[q.id,q]));
const key='s2ktux-lpic-daypo-attempt-v1';
let selected=[],answers={},index=0,deadline,timer,phase='intro',durable=true;
let practice,practiceSessions={},view='practice';
const read=key=>{try{return JSON.parse(localStorage.getItem(key)||'null');}catch{return null;}};
const stored=read(PRACTICE_KEY);
if(stored&&typeof stored==='object'&&!Array.isArray(stored)){
 practiceSessions=stored.sessions&&typeof stored.sessions==='object'&&!Array.isArray(stored.sessions)?stored.sessions:{};
 if(['practice','exam'].includes(stored.view))view=stored.view;
 if(['101','102'].includes(stored.code))$('exam-code').value=stored.code;
}
const oldMarks=read(LEGACY_KEY);
const legacy=oldMarks&&typeof oldMarks==='object'&&!Array.isArray(oldMarks)?oldMarks:{};
const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{durable=false;}};
const save=()=>write(key,{ids:selected.map(q=>q.id),answers,index,deadline,phase});
function savePractice(){practiceSessions[$('exam-code').value]=practice;write(PRACTICE_KEY,{code:$('exam-code').value,view,sessions:practiceSessions});}
function current(){return byId.get(practice.ids[practice.index]);}
function correctText(question){return question.type==='written'?question.answers[0]:question.answers.map(i=>question.choices[i]).join(' · ');}
function questionImage(question){
 if(!question.image)return null;
 const image=make('img');image.className='quiz-source-image';image.src=question.image.src;image.alt=question.image.alt;image.loading='lazy';return image;
}
function correctionNote(root,question){
 if(!question.correction)return;
 const note=make('small');note.className='quiz-correction-note';
 note.append(document.createTextNode('Corrección del original: '+question.correction+' '));
 const link=make('a','Ver registro');link.href='/contenido/lpic-1-correcciones.md';note.append(link);root.append(note);
}

function questionView(root,question,answer,onChange){
 root.replaceChildren();root.dataset.questionId=question.id;
 const field=make('fieldset'),legend=make('legend',question.prompt);field.append(legend);
 const image=questionImage(question);if(image)field.append(image);
 if(question.type==='written'){
  const label=make('label','Respuesta escrita'),input=make('input');
  input.type='text';input.autocomplete='off';input.spellcheck=false;input.value=typeof answer==='string'?answer:'';
  label.append(input);field.append(label);input.oninput=()=>onChange(input.value);
 }else{
  const help=make('p',question.type==='multiple'?'Selecciona '+question.answers.length+' opciones.':'Selecciona una opción.');
  help.className='quiz-answer-instruction';field.append(help);
  for(const position of shuffle(question.choices.map((_,i)=>i))){
   const label=make('label');label.className='answer-choice';const input=make('input');
   input.type=question.type==='multiple'?'checkbox':'radio';input.name='respuesta-'+question.id;input.value=String(position);
   input.checked=Array.isArray(answer)?answer.includes(position):answer===position;
   label.append(input,make('span',question.choices[position]));field.append(label);
   input.onchange=()=>onChange(question.type==='multiple'?[...field.querySelectorAll('input:checked')].map(node=>Number(node.value)):Number(input.value));
  }
 }
 root.append(field);
}

function practiceFeedback(){
 const q=current(),state=practice.checks[q.id];
 $('feedback').dataset.result=state||'pending';
 if(!state){$('feedback').textContent='';return;}
 if(!hasAnswer(practice.answers[q.id])){
  $('feedback').textContent=state==='passed'?'✓ Última comprobación: correcta.':'× Última comprobación: incorrecta.';
  return;
 }
 $('feedback').textContent=(state==='passed'?'✓ Correcto. ':'× Incorrecto. La respuesta es: '+correctText(q)+'. ')+q.explanation;
 correctionNote($('feedback'),q);
}

function paintIndex(){
 const labels={passed:'Correcta',failed:'Incorrecta',answered:'Respondida sin comprobar',pending:'Sin responder'};
 const focused=document.activeElement?.closest('#practice-grid button')?.dataset.questionId;
 const scroll=$('practice-grid').scrollTop;
 let correct=0,failed=0,responded=0;
 const fragment=document.createDocumentFragment();
 for(const [i,id] of practice.ids.entries()){
  const state=practiceStatus(practice,id),button=make('button');button.type='button';
  button.dataset.questionId=id;button.dataset.state=state;
  button.setAttribute('aria-label','Pregunta '+(i+1)+' · '+labels[state]);
  if(i===practice.index)button.setAttribute('aria-current','step');
  button.append(make('span','Pregunta '+(i+1)));
  const mark=make('span',state==='passed'?'✓':state==='failed'?'×':state==='answered'?'·':'');
  mark.className='quiz-index-mark';mark.setAttribute('aria-hidden','true');button.append(mark);
  button.onclick=()=>{practice.index=i;renderPractice();$('practice-grid').querySelector('[aria-current=step]')?.focus({preventScroll:true});if(matchMedia('(max-width:800px)').matches)$('practice-position').scrollIntoView({block:'nearest'});};
  fragment.append(button);
  if(state==='passed')correct++;if(state==='failed')failed++;if(state!=='pending')responded++;
 }
 $('practice-grid').replaceChildren(fragment);
 $('practice-grid').scrollTop=scroll;
 if(focused)$('practice-grid').querySelector('[data-question-id="'+focused+'"]')?.focus({preventScroll:true});
 $('practice-count').textContent=(correct+failed)+' / '+practice.ids.length+' comprobadas';
 $('practice-correct').textContent='Aciertos: '+correct;$('practice-failed').textContent='Fallos: '+failed;
 $('practice-summary').textContent=correct+(correct===1?' correcta · ':' correctas · ')+failed+(failed===1?' incorrecta · ':' incorrectas · ')+(practice.ids.length-correct-failed)+' sin comprobar.'+(durable?'':' No se puede guardar el progreso en este navegador.');
 $('practice-clear').disabled=!responded;
}

function renderPractice(){
 const question=current();
 $('practice-position').textContent='Pregunta '+(practice.index+1)+' de '+practice.ids.length;
 $('solution-body').hidden=true;$('solution').textContent='Ver solución';$('solution').setAttribute('aria-expanded','false');
 questionView($('practice-question'),question,practice.answers[question.id],answer=>{
  practice.answers[question.id]=answer;delete practice.checks[question.id];
  $('solution-body').hidden=true;$('solution').textContent='Ver solución';$('solution').setAttribute('aria-expanded','false');
  savePractice();practiceFeedback();paintIndex();
 });
 $('practice-previous').disabled=practice.index===0;$('practice-next').disabled=practice.index===practice.ids.length-1;
 savePractice();practiceFeedback();paintIndex();
 revealCurrent();
}

function revealCurrent(){
 const list=$('practice-grid'),active=list.querySelector('[aria-current=step]');if(!active||!list.clientHeight)return;
 const top=active.getBoundingClientRect().top-list.getBoundingClientRect().top+list.scrollTop,bottom=top+active.offsetHeight;
 if(top<list.scrollTop)list.scrollTop=top;else if(bottom>list.scrollTop+list.clientHeight)list.scrollTop=bottom-list.clientHeight;
}
function selectCode(){
 const code=$('exam-code').value;
 practice=practiceState(code,practiceSessions[code],legacy,{fresh:true});renderPractice();
}
function changeMode(value,{fresh=false}={}){
 if(phase==='running')return;
 view=value;savePractice();
 for(const name of ['practice','exam']){
  if(name===value)$('mode-'+name).setAttribute('aria-current','page');else $('mode-'+name).removeAttribute('aria-current');
 }
 $('configuration').hidden=false;$('practice-panel').hidden=value!=='practice';
 $('exam-description').hidden=value!=='exam';$('start-exam').hidden=value!=='exam';
 $('results').hidden=true;$('exam-workspace').hidden=true;
 if(value==='practice'&&fresh)selectCode();
}
$('mode-practice').onclick=()=>changeMode('practice',{fresh:true});$('mode-exam').onclick=()=>changeMode('exam');
$('exam-code').onchange=selectCode;
$('practice-previous').onclick=()=>{if(practice.index>0){practice.index--;renderPractice();}};
$('practice-next').onclick=()=>{if(practice.index<practice.ids.length-1){practice.index++;renderPractice();}};
$('practice-clear').onclick=()=>{
 if(!confirm('¿Borrar las respuestas y marcas de práctica del '+$('exam-code').value+'? El otro examen y los simulacros no se borran.'))return;
 const code=$('exam-code').value;practice.answers={};practice.checks={};
 // Evita importar de nuevo las marcas antiguas después de borrarlas.
 for(const id of practice.ids)delete legacy[id];
 try{localStorage.setItem(LEGACY_KEY,JSON.stringify(legacy));}catch{durable=false;}
 practiceSessions[code]=practice;renderPractice();
};
$('check').onclick=()=>{
 const question=current(),answer=practice.answers[question.id];
 if(!hasAnswer(answer)){$('feedback').textContent='Introduce una respuesta antes de comprobar.';return;}
 practice.checks[question.id]=answerCorrect(question,answer)?'passed':'failed';
 savePractice();practiceFeedback();paintIndex();
};
$('solution').onclick=()=>{
 const question=current(),open=$('solution-body').hidden;
 $('solution-body').hidden=!open;$('solution').setAttribute('aria-expanded',String(open));$('solution').textContent=open?'Ocultar solución':'Ver solución';
 $('solution-body').textContent=correctText(question)+'\n\n'+question.explanation;
 correctionNote($('solution-body'),question);
};

function answered(question){return hasAnswer(answers[question.id]);}
function examOptions(){
 $('exam-question').replaceChildren(...selected.map((question,i)=>{const option=make('option',(answered(question)?'● ':'○ ')+'Pregunta '+(i+1));option.value=String(i);return option;}));
 $('exam-question').value=String(index);$('answered-count').textContent=selected.filter(answered).length+' de '+selected.length+' respondidas.';
}
function renderExam(){
 const question=selected[index];examOptions();
 questionView($('exam-question-body'),question,answers[question.id],answer=>{answers[question.id]=answer;examOptions();save();});
 $('previous').disabled=index===0;$('next').disabled=index===selected.length-1;save();
}
$('exam-question').onchange=()=>{index=Number($('exam-question').value);renderExam();};
$('previous').onclick=()=>{if(index>0){index--;renderExam();}};
$('next').onclick=()=>{if(index<selected.length-1){index++;renderExam();}};
function tick(){
 const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));
 $('time').textContent=[Math.floor(left/3600),Math.floor(left%3600/60),left%60].map(v=>String(v).padStart(2,'0')).join(':');
 if(!left)finish();
}
function enterExam(){
 view='exam';savePractice();phase='running';changeExamTab();$('configuration').hidden=$('practice-panel').hidden=$('results').hidden=true;
 $('exam-workspace').hidden=false;document.documentElement.classList.add('quiz-exam-running');
 renderExam();timer=setInterval(tick,1000);tick();
}
function changeExamTab(){ $('mode-exam').setAttribute('aria-current','page');$('mode-practice').removeAttribute('aria-current'); }
$('start-exam').onclick=()=>{selected=createExam($('exam-code').value);answers={};index=0;deadline=Date.now()+EXAM_SECONDS*1000;enterExam();};
function finish(){
 if(phase==='finished')return;
 clearInterval(timer);phase='finished';save();changeExamTab();document.documentElement.classList.remove('quiz-exam-running');
 $('exam-workspace').hidden=true;$('results').hidden=false;$('configuration').hidden=true;
 const report=reportFor(selected,answers);
 $('score').textContent=report.percent+' % global';$('verdict').dataset.result=report.passed?'passed':'failed';
 $('verdict').textContent=report.passed?'Aprobado en este simulacro.':'No aprobado en este simulacro. Se necesita un 70 %.';
 renderDomains($('domains'),report.domains);$('question-report').replaceChildren();
 for(const [i,q] of selected.entries()){
  const ok=answerCorrect(q,answers[q.id]),details=make('details');
  details.dataset.result=!answered(q)?'pending':ok?'passed':'failed';
  details.append(make('summary','Pregunta '+(i+1)+' · '+(!answered(q)?'Sin responder':ok?'✓ Correcta':'× Incorrecta')),make('p',q.prompt));
  const image=questionImage(q);if(image)details.append(image);
  const value=answers[q.id],response=q.type==='written'?value:Array.isArray(value)?value.map(n=>q.choices[n]).join(' · '):q.choices[value];
  details.append(make('p','Tu respuesta: '+(response||'Sin responder')),make('p','Respuesta válida: '+correctText(q)),make('p',q.explanation));
  correctionNote(details,q);
  $('question-report').append(details);
 }
 $('results').scrollIntoView({block:'start'});
}
$('finish-exam').onclick=()=>{if(confirm('¿Finalizar el examen y ver el resultado?'))finish();};
$('new-exam').onclick=()=>{try{localStorage.removeItem(key);}catch{}phase='intro';selected=[];answers={};$('review').open=false;changeMode('exam');};

selectCode();changeMode(view);
try{
 const previous=read(key);
 if(previous&&['running','finished'].includes(previous.phase)&&(previous.phase==='running'||view==='exam')&&Array.isArray(previous.ids)&&previous.ids.length===60&&new Set(previous.ids).size===60&&previous.ids.every(id=>byId.has(id))&&Number.isFinite(previous.deadline)){
  selected=previous.ids.map(id=>byId.get(id));
  if(!selected.every(q=>q.exam===selected[0].exam))throw Error('Intento inválido');
  answers=previous.answers&&typeof previous.answers==='object'?previous.answers:{};
  index=Number.isInteger(previous.index)?Math.max(0,Math.min(59,previous.index)):0;deadline=previous.deadline;
  $('exam-code').value=selected[0].exam;selectCode();
  if(previous.phase==='finished'){phase='running';finish();}else enterExam();
 }
}catch{}
