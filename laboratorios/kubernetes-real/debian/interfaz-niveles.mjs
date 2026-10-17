import {NIVELES,urlNivel,cambiarNivel} from './niveles.mjs';
import {clasesNivel,claseDesdeURL} from './clases-curso.mjs';
import {ejerciciosClase} from './ejercicios-niveles.mjs';
import {comprobarPractica,prepararPractica} from './motor-practicas.mjs';
import {claseDisponible,nivelDisponible} from './disponibilidad-curso.mjs';

export function montarInterfazNiveles({level,getState,run,setBusy,save,stop,start=()=>document.querySelector('#start-cluster').click(),navigate=href=>location.assign(href)}){
 const $=id=>document.getElementById(id),config=NIVELES[level];
 const currentURL=new URL(location.href),prepared=new Set();
 let activeClass=claseDesdeURL(currentURL.searchParams,level),preview=level,previewClass=activeClass;
 let switching=false,checking=false,entered=false,wasInitialized=false,learningMode=null;
 globalThis.kubeDebianLearningMode=null;
 const remembered=new Map([[level,activeClass]]);
 document.title='Kubernetes · '+config.title+' | S2KTUX';
 $('mode-stamp').textContent='Modo práctica · '+config.name;
 $('lab-course-note').textContent='* Clases '+config.classes+' del curso.';
 $('course-intro').hidden=true;$('course-progression').hidden=true;$('mode-topology').hidden=true;$('change-lab').hidden=false;
 $('exercise-class-select').replaceChildren(...clasesNivel(level).map(lesson=>{
  const option=document.createElement('option');option.value=String(lesson.number);option.disabled=!claseDisponible(lesson.number);option.textContent=lesson.id+' — '+lesson.title+(option.disabled?' · Próximamente':'');return option;
 }));
 $('exercises').hidden=false;
 function tasks(){return claseDisponible(activeClass)?ejerciciosClase(activeClass):[];}
 function task(){return tasks()[Number($('exercise-select').value)];}
 function buildIndex(){
  $('course-index').replaceChildren(...Object.entries(NIVELES).map(([key,item])=>{
   const button=document.createElement('button');button.type='button';button.className='stage-toggle';button.dataset.chooseStage=key;
   button.id='stage-'+key;
   button.textContent=item.name;button.onclick=()=>browse(key);return button;
  }));
 }
 function renderEntry(){
  const selected=NIVELES[preview],lessons=clasesNivel(preview),available=nivelDisponible(preview)&&claseDisponible(previewClass);
  $('lab-entry').dataset.preview=preview;document.querySelector('main').dataset.level=preview;
  for(const button of $('course-index').querySelectorAll('[data-choose-stage]')){
   button.setAttribute('aria-pressed',String(button.dataset.chooseStage===preview));
  }
  const count=lessons.reduce((total,lesson)=>total+ejerciciosClase(lesson.number).length,0);
  $('entry-intro').textContent=available?(selected.nodes===1?'Un nodo':'Control plane y un worker')+' · '+count+' preguntas disponibles.':'Próximamente. Este laboratorio o la clase solicitada todavía no está disponible.';
  update();
 }
 function browse(value){
  if(getState().busy||switching||checking||!Object.hasOwn(NIVELES,value))return;
  preview=value;const previous=remembered.get(value);previewClass=claseDisponible(previous)?previous:clasesNivel(value)[0].number;renderEntry();
 }
 function showEntry(){preview=level;previewClass=activeClass;remembered.set(level,activeClass);$('lab-entry').hidden=false;$('lab-workspace').hidden=true;renderEntry();}
 function showWorkspace(){
  entered=true;$('lab-entry').hidden=true;$('lab-workspace').hidden=false;document.querySelector('main').dataset.level=level;update();
 }
 function populateTasks(){
  $('exercise-class-select').value=String(activeClass);
  $('exercise-select').replaceChildren(...tasks().map((item,index)=>{const option=document.createElement('option');option.value=String(index);option.textContent=item.title;return option;}));
  render();
 }
 function render(){
  globalThis.kubeDebianExerciseResult=null;
  const current=task(),items=tasks();$('class-empty').hidden=!!current;
  $('exercise-title').hidden=$('exercise-prompt').hidden=$('exercise-help').hidden=!current;
  $('exercise-select').hidden=$('exercise-count').hidden=!current;
  $('exercise-title').textContent=current?.title||'';$('exercise-prompt').textContent=current?.prompt||'';
  $('exercise-solution').textContent=current?.solutionDisplay||current?.solution||'';
  $('exercise-count').textContent=current?'Práctica '+(Number($('exercise-select').value)+1)+' / '+items.length:'';
  $('exercise-help').open=false;$('exercise-result').textContent='';delete $('exercise-result').dataset.result;$('exercise-copy').textContent='Copiar comandos';update();
 }
 function update(){
  const state=getState(),blocked=state.busy||switching||checking,current=task();
  if(wasInitialized&&!state.initialized)prepared.clear();wasInitialized=state.initialized;
  $('enter-lab').disabled=blocked||learningMode!=='practice'||!nivelDisponible(preview)||!claseDisponible(previewClass);
  for(const button of $('course-index').querySelectorAll('button'))button.disabled=blocked;
  $('mode-practice').disabled=$('mode-exam').disabled=blocked;
  $('change-lab').disabled=$('return-lab').disabled=blocked;$('return-lab').hidden=!entered;
  $('enter-lab').textContent=!nivelDisponible(preview)||!claseDisponible(previewClass)?'Próximamente':(preview===level&&state.nodeCount>0?'Volver al laboratorio ':'Abrir laboratorio ')+NIVELES[preview].name.toLowerCase();
  $('exercise-class-select').disabled=$('exercise-select').disabled=blocked;
  $('exercise-check').hidden=!current;$('exercise-check').disabled=blocked||!state.initialized||!current;
  $('exercise-prepare').hidden=!current?.prepare?.length;$('exercise-prepare').disabled=blocked||!state.initialized||prepared.has(current?.id);
  $('start-cluster').hidden=state.busy||state.initialized||state.nodeCount>0;
  $('start-cluster').disabled=blocked||learningMode!=='practice'||!nivelDisponible(level)||!claseDisponible(activeClass)||state.nodeCount>0;
  $('nodes').hidden=state.busy&&!state.initialized;$('lab-idle').hidden=state.nodeCount>0||state.busy;
  document.querySelector('.lab-controls').setAttribute('aria-busy',String(state.busy));
 }
 async function enter(){
  if(learningMode!=='practice'||!nivelDisponible(preview)||!claseDisponible(previewClass)||getState().busy||switching||checking)return;
  if(preview!==level){const href=new URL(urlNivel(location.href,preview));href.searchParams.set('clase',String(previewClass));href.searchParams.set('enter','1');await requestChange(preview,href.href);return;}
  activeClass=previewClass;populateTasks();const href=new URL(location.href);href.searchParams.set('clase',String(activeClass));history.replaceState(history.state,'',href.href);
  showWorkspace();if(!getState().nodeCount&&!getState().initialized)start();update();
 }
 $('enter-lab').onclick=()=>enter();
 function selectLearningMode(value){
  if(getState().busy||switching||checking)return;
  learningMode=value;globalThis.kubeDebianLearningMode=value;$('mode-practice').setAttribute('aria-pressed',String(value==='practice'));$('mode-exam').setAttribute('aria-pressed',String(value==='exam'));
  $('practice-configuration').hidden=value!=='practice';$('exam-configuration').hidden=value!=='exam';update();
 }
 $('mode-practice').onclick=()=>selectLearningMode('practice');$('mode-exam').onclick=()=>selectLearningMode('exam');
 function selectExamLanguage(language){
  const english=language==='en';$('exam-configuration').lang=english?'en':'es';
  for(const button of document.querySelectorAll('[data-exam-language]'))button.setAttribute('aria-pressed',String(button.dataset.examLanguage===language));
  $('exam-heading').textContent=english?'CKA mock exam':'Simulacro CKA';
  $('exam-description').textContent=english?'Two hours, hands-on tasks across different topics and a pass mark of 66/100. No hints or solutions during the attempt.':'Dos horas, preguntas prácticas de distintos temas y aprobado desde 66/100. Sin pistas ni soluciones durante el intento.';
  $('exam-language-note').textContent=english?'* Spanish is a learning aid in this simulator, not an official CKA exam language.':'* El castellano es una ayuda de este simulacro; no es un idioma oficial del examen CKA.';
  $('exam-pending').textContent=english?'Coming soon. The mock exam is not available yet.':'Próximamente. El simulacro todavía no está disponible.';
  $('start-exam').textContent=english?'Start exam · Coming soon':'Iniciar examen · Próximamente';
 }
 for(const button of document.querySelectorAll('[data-exam-language]'))button.onclick=()=>selectExamLanguage(button.dataset.examLanguage);
 $('change-lab').onclick=()=>{showEntry();$('stage-'+level).focus();};
 $('return-lab').onclick=()=>{showWorkspace();$('change-lab').focus();};
 $('exercise-class-select').onchange=event=>{
  const value=Number(event.target.value);if(!claseDisponible(value)||getState().busy||switching||checking||!clasesNivel(level).some(lesson=>lesson.number===value))return;
  activeClass=value;remembered.set(level,value);const href=new URL(location.href);href.searchParams.set('clase',String(value));history.replaceState(history.state,'',href.href);populateTasks();
 };
 $('exercise-select').onchange=render;
 async function exercise(prepare){
  const current=task();if(!current||getState().busy||!getState().initialized||checking)return;
  checking=true;globalThis.kubeDebianExerciseResult=null;delete $('exercise-result').dataset.result;setBusy(true);update();$('exercise-result').textContent=prepare?'Preparando el ejercicio…':'Comprobando el resultado en Linux…';
  try{
   if(prepare){await prepararPractica(current,run);prepared.add(current.id);$('exercise-result').textContent='Ejercicio preparado. Ya puedes resolverlo.';}
   else{const result=await comprobarPractica(current,run);globalThis.kubeDebianExerciseResult=result;$('exercise-result').dataset.result=result.state;$('exercise-result').textContent=result.message;}
  }catch(error){$('exercise-result').dataset.result='unverified';$('exercise-result').textContent='No se ha completado la preparación: '+(error.message||error);}
  finally{checking=false;setBusy(false);update();}
 }
 $('exercise-check').onclick=()=>exercise(false);$('exercise-prepare').onclick=()=>exercise(true);
 $('exercise-copy').onclick=async()=>{if(!task())return;try{await navigator.clipboard.writeText(task().solutionDisplay||task().solution);$('exercise-copy').textContent='Copiado';}catch{$('exercise-copy').textContent='Selecciona los comandos para copiarlos';}};
 const dialog=$('switch-level-dialog');for(const button of dialog.querySelectorAll('[data-switch-action]'))button.onclick=()=>dialog.close(button.dataset.switchAction);
 async function choose(destination){
  $('switch-level-title').textContent=destination?'Entrar en la etapa '+NIVELES[destination].stage:'Salir del laboratorio';
  $('switch-level-description').textContent=destination?'Se detendrán las máquinas actuales. Cada etapa tiene su propio guardado; los cambios no se trasladan a la otra.':'Puedes guardar antes de salir. Se detendrán las máquinas; tu último guardado se conserva.';
  dialog.querySelector('[data-switch-action=save]').disabled=!getState().initialized;
  dialog.querySelector('[data-switch-action=save]').textContent=destination?'Guardar y entrar':'Guardar y salir';
  dialog.querySelector('[data-switch-action=discard]').textContent=destination?'Entrar sin guardar':'Salir sin guardar';
  dialog.returnValue='';const result=new Promise(resolve=>dialog.addEventListener('close',()=>resolve(dialog.returnValue||'cancel'),{once:true}));dialog.showModal();return result;
 }
 async function requestChange(destination,href){
  if(destination===level||getState().busy||switching)return;
  switching=true;update();$('switch-level-error').textContent='';
  try{
   let choice=getState().nodeCount?await choose(destination):'discard';
   while(choice!=='cancel'){
    try{await cambiarNivel({choice,save,stop,navigate:()=>navigate(href)});return;}
    catch(error){$('switch-level-error').textContent='No se ha cambiado de laboratorio: '+(error.message||error);choice=await choose(destination);}
   }
  }finally{switching=false;update();}
 }
 for(const anchor of document.querySelectorAll('.site-header a,.site-footer a'))anchor.onclick=event=>{
  if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();requestChange(null,anchor.href).catch(error=>{$('exercise-result').textContent='No se ha salido: '+(error.message||error);});
 };
 globalThis.kubeDebianSelectedLevel=level;globalThis.kubeDebianExerciseCheck=()=>exercise(false);globalThis.kubeDebianPracticePrepare=()=>exercise(true);
 buildIndex();populateTasks();showEntry();
 if(currentURL.searchParams.get('view')==='exam')selectLearningMode('exam');
 else if(currentURL.searchParams.get('view')==='practice'||currentURL.searchParams.has('clase')||currentURL.searchParams.get('enter')==='1')selectLearningMode('practice');
 const autoEnter=learningMode==='practice'&&currentURL.searchParams.get('enter')==='1';
 if(currentURL.searchParams.has('enter')){currentURL.searchParams.delete('enter');history.replaceState(history.state,'',currentURL.href);}
 if(autoEnter)queueMicrotask(()=>enter());
 return {update};
}
