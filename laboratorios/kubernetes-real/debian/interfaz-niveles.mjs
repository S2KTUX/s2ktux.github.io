import {NIVELES,urlNivel,cambiarNivel} from './niveles.mjs';
import {clasesNivel,claseDesdeURL} from './clases-curso.mjs';
import {ejerciciosClase,ejerciciosExamen} from './ejercicios-niveles.mjs?v=e47d726436d92b3d';
import {comprobarPractica,prepararPractica} from './motor-practicas.mjs?v=20260d0b4dadc45a';
import {claseDisponible,nivelDisponible} from './disponibilidad-curso.mjs?v=f0f8985c9d7fa136';
import {renderSolutions} from '../../lab-solutions.mjs?v=20261020-aprendizaje';
import {solutionsFor} from '../../solution-options.mjs?v=20261020-aprendizaje';
import {practiceProgress} from '../../practice-progress.mjs?v=20261021-resueltas';
import {urlEscenarioCurso,entornoEjercicio,clasePermitidaEscenario} from './escenarios-curso.mjs?v=0d0ce2113fc8bea0';

export function montarInterfazNiveles({level,getState,run,setBusy,save,stop,start=()=>document.querySelector('#start-cluster').click(),navigate=href=>location.assign(href)}){
 const $=id=>document.getElementById(id),config=NIVELES[level];
 const currentURL=new URL(location.href),prepared=new Set();
 let activeClass=claseDesdeURL(currentURL.searchParams,level),preview=level,previewClass=activeClass;
 let switching=false,checking=false,entered=false,wasInitialized=false,learningMode=null,freeMode=false,examPractice=false;
 globalThis.kubeDebianLearningMode=null;
 const remembered=new Map([[level,activeClass]]);
 document.title='Kubernetes · '+config.title+' | S2KTUX';
 $('mode-stamp').textContent='Modo práctica · '+config.name;
 if(getState().scenarioId){
  $('mode-stamp').textContent+=' · Copia independiente';
  const back=$('return-study')||document.createElement('button');back.id='return-study';back.type='button';back.className='lab-link';back.textContent='Volver a mis prácticas';
  $('change-lab').before(back);back.onclick=()=>requestScenario(null);
 }
 const levelQuestions=clasesNivel(level).reduce((total,lesson)=>total+ejerciciosClase(lesson.number).length,0);
 const levelNodes=config.nodes===1?'Un nodo':config.nodes===2?'Control plane y un worker':'Control plane y dos workers';
 $('lab-course-note').textContent=getState().scenarioId==='montaje-cluster'?'* Clases 25–26 · Una copia de montaje con control plane y dos workers.':getState().scenarioId==='ha-cluster'?'* Clase 24 · Tres control planes con balanceador redundante. Esta copia tiene su propio guardado.':'* Clases '+config.classes+' · '+levelNodes+' · '+levelQuestions+' preguntas disponibles.';
 $('course-intro').hidden=true;$('course-progression').hidden=true;$('mode-topology').hidden=true;$('change-lab').hidden=false;
 $('exercise-class-select').replaceChildren(...clasesNivel(level).map(lesson=>{
  const option=document.createElement('option');option.value=String(lesson.number);option.disabled=!claseDisponible(lesson.number)||!clasePermitidaEscenario(lesson.number,getState().scenarioId);option.textContent=lesson.id+' — '+lesson.title+(!claseDisponible(lesson.number)?' · Próximamente':'');return option;
 }));
 const free=document.createElement('option');free.value='free';free.textContent='Práctica libre';$('exercise-class-select').prepend(free);
 const examPracticeOption=document.createElement('option');examPracticeOption.value='exam';examPracticeOption.textContent='EXAMEN';examPracticeOption.disabled=!!getState().scenarioId;$('exercise-class-select').append(examPracticeOption);
 $('exercises').hidden=false;
 function tasks(){return examPractice?ejerciciosExamen(level):claseDisponible(activeClass)?ejerciciosClase(activeClass):[];}
 function task(){return freeMode?null:tasks()[Number($('exercise-select').value)];}
 function buildIndex(){
  const summaries={inicial:'Pods, réplicas y servicios.',intermedio:'Configuración, almacenamiento y redes.',avanzado:'Instalación, mantenimiento y diagnóstico.'};
  $('course-index').replaceChildren(...Object.entries(NIVELES).map(([key,item])=>{
   const button=document.createElement('button');button.type='button';button.className='stage-toggle';button.dataset.chooseStage=key;
   button.id='stage-'+key;button.dataset.step=item.number;
   const name=document.createElement('span');name.dataset.levelName='';name.className='level-name';name.textContent=item.name;
   const summary=document.createElement('span');summary.className='level-summary';summary.id='stage-summary-'+key;summary.textContent=summaries[key];
   const range=document.createElement('small');range.className='level-range';range.id='stage-range-'+key;range.textContent='Clases '+item.classes;
   button.setAttribute('aria-label',item.name);button.setAttribute('aria-describedby',summary.id+' '+range.id);button.append(name,summary,range);button.onclick=()=>browse(key);return button;
  }));
 }
 function renderEntry(){
  const available=nivelDisponible(preview)&&claseDisponible(previewClass);
  $('lab-entry').dataset.preview=preview;document.querySelector('main').dataset.level=preview;
  for(const button of $('course-index').querySelectorAll('[data-choose-stage]')){
   button.setAttribute('aria-pressed',String(button.dataset.chooseStage===preview));
  }
  $('entry-intro').textContent=available?'':'Próximamente. Este laboratorio o la clase solicitada todavía no está disponible.';
  $('entry-intro').hidden=available;
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
  freeMode=false;
  $('exercise-class-select').value=examPractice?'exam':String(activeClass);
  $('exercise-select').replaceChildren(...tasks().map((item,index)=>{const option=document.createElement('option');option.value=String(index);option.textContent=item.title;return option;}));
  const sceneIndex=tasks().findIndex(item=>item.id===getState().scenarioId||item.scenarioId===getState().scenarioId);if(sceneIndex>=0)$('exercise-select').value=String(sceneIndex);
  render();
 }
 function render(){
  globalThis.kubeDebianExerciseResult=null;
  const current=task(),items=tasks();$('class-empty').hidden=!!current;
  $('class-empty').textContent=freeMode?'Práctica libre: utiliza la terminal sin un ejercicio seleccionado.':'Próximamente. Esta clase todavía no está disponible en el laboratorio.';
  $('exercise-title').hidden=$('exercise-prompt').hidden=$('exercise-solution-toggle').hidden=!current;
  $('exercise-select').hidden=$('exercise-count').hidden=!current;
  $('exercise-select').closest('.exercise-field').hidden=!current;
  $('exercise-title').textContent=current?.title||'';$('exercise-prompt').textContent=current?.prompt||'';
  renderSolutions($('exercise-solution'),current?solutionsFor('kubernetes',current):[]);
  $('exercise-count').textContent=current?'Práctica '+(Number($('exercise-select').value)+1)+' / '+items.length:'';
  $('exercise-help').hidden=true;$('exercise-solution-toggle').textContent='Ver solución';$('exercise-solution-toggle').setAttribute('aria-expanded','false');$('exercise-result').textContent='';delete $('exercise-result').dataset.result;update();
 }
 function update(){
  const state=getState(),blocked=state.busy||switching||checking,current=task();
  if(wasInitialized&&!state.initialized)prepared.clear();wasInitialized=state.initialized;
  $('enter-lab').disabled=blocked||learningMode!=='practice'||!nivelDisponible(preview)||!claseDisponible(previewClass);
  for(const button of $('course-index').querySelectorAll('button'))button.disabled=blocked;
  $('mode-practice').disabled=$('mode-exam').disabled=blocked;
  $('change-lab').disabled=$('return-lab').disabled=blocked;$('return-lab').hidden=!entered;
  $('enter-lab').textContent=!nivelDisponible(preview)||!claseDisponible(previewClass)?'Próximamente':(preview===level&&state.nodeCount>0?'Volver al laboratorio ':'Abrir laboratorio ')+NIVELES[preview].name.toLowerCase();
  $('exercise-class-select').disabled=checking||switching||!!state.scenarioId&&state.scenarioId!=='montaje-cluster';
  $('exercise-select').disabled=checking||switching||!!state.scenarioId&&state.scenarioId!=='montaje-cluster';
  if($('return-study'))$('return-study').disabled=blocked;
  $('exercise-solution-toggle').disabled=checking;
  $('exercise-check').hidden=!current;$('exercise-check').disabled=blocked||!state.initialized||!current;
  const needsPreparation=['manual-cluster','ha-cluster'].includes(current?.environment)||!!current?.prepare?.some(command=>command!==current.preflight);
  $('exercise-setup').hidden=$('exercise-prepare').hidden=!needsPreparation;$('exercise-prepare').disabled=blocked||!state.initialized||prepared.has(current?.id);
  $('start-cluster').hidden=false;
  $('start-cluster').disabled=blocked||learningMode!=='practice'||!nivelDisponible(level)||!claseDisponible(activeClass)||state.nodeCount>0;
  $('nodes').hidden=false;$('lab-idle').hidden=$('nodes').childElementCount>0;
  $('node-controls').hidden=state.nodeCount===0;
  document.querySelector('.lab-controls').setAttribute('aria-busy',String(state.busy));
 }
 async function enter(){
  if(learningMode!=='practice'||!nivelDisponible(preview)||!claseDisponible(previewClass)||getState().busy||switching||checking)return;
  if(preview!==level){const href=new URL(urlNivel(location.href,preview));href.searchParams.set('clase',String(previewClass));href.searchParams.set('enter','1');await requestChange(preview,href.href);return;}
  activeClass=previewClass;populateTasks();const href=new URL(location.href);href.searchParams.set('clase',String(activeClass));history.replaceState(history.state,'',href.href);
  showWorkspace();update();
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
  $('exam-description').textContent=english?'Two hours to complete hands-on Kubernetes administration tasks. A score of at least 66/100 is required to pass. We recommend completing the mock exam using only the official Kubernetes documentation.':'Dos horas para resolver tareas prácticas de administración de Kubernetes. Para aprobar se necesita al menos 66/100. Se recomienda realizar el simulacro consultando únicamente la documentación oficial de Kubernetes.';
  $('exam-language-note').textContent=english?'* Spanish is a learning aid in this simulator, not an official CKA exam language.':'* El castellano es una ayuda de este simulacro; no es un idioma oficial del examen CKA.';
  $('exam-pending').textContent=english?'Coming soon. The mock exam is not available yet.':'Próximamente. El simulacro todavía no está disponible.';
  $('start-exam').textContent=english?'Start exam · Coming soon':'Iniciar examen · Próximamente';
 }
 for(const button of document.querySelectorAll('[data-exam-language]'))button.onclick=()=>selectExamLanguage(button.dataset.examLanguage);
 $('change-lab').onclick=()=>{showEntry();$('stage-'+level).focus();};
 $('return-lab').onclick=()=>{showWorkspace();$('change-lab').focus();};
 $('exercise-class-select').onchange=event=>{
  if(event.target.value==='free'){freeMode=true;examPractice=false;render();return;}
  if(event.target.value==='exam'){examPractice=true;populateTasks();return;}
  const value=Number(event.target.value);if(!claseDisponible(value)||!clasePermitidaEscenario(value,getState().scenarioId)||switching||checking||!clasesNivel(level).some(lesson=>lesson.number===value))return;
  freeMode=false;examPractice=false;
  activeClass=value;remembered.set(level,value);const href=new URL(location.href);href.searchParams.set('clase',String(value));history.replaceState(history.state,'',href.href);populateTasks();
 };
 $('exercise-select').onchange=render;
 async function exercise(prepare){
  const current=task();if(!current||getState().busy||!getState().initialized||checking)return;
  if(prepare&&current.environment==='disposable-cluster'&&entornoEjercicio(current,getState())!=='disposable-cluster'){await requestScenario(current.id);return;}
  if(prepare&&current.environment==='manual-cluster'&&entornoEjercicio(current,getState())!=='manual-cluster'){await requestScenario('montaje-cluster');return;}
  if(prepare&&current.environment==='ha-cluster'&&entornoEjercicio(current,getState())!=='ha-cluster'){await requestScenario('ha-cluster');return;}
  if(!prepare&&current.environment==='ha-cluster'&&entornoEjercicio(current,getState())!=='ha-cluster'){
   $('exercise-result').dataset.result='unverified';$('exercise-result').textContent='Abre primero la copia HA con Preparar ejercicio. Tus prácticas actuales se conservan.';return;
  }
  if(!prepare&&current.environment==='manual-cluster'&&entornoEjercicio(current,getState())!=='manual-cluster'){
   $('exercise-result').dataset.result='unverified';$('exercise-result').textContent='Abre primero la copia de montaje con Preparar ejercicio. Tus prácticas actuales se conservan.';return;
  }
  checking=true;globalThis.kubeDebianExerciseResult=null;delete $('exercise-result').dataset.result;setBusy(true);update();$('exercise-result').textContent=prepare?'Preparando el ejercicio…':'Comprobando el resultado en Linux…';
  try{
   if(prepare){
    // La topología real permite el drain con dos workers. Tener tres nodos
    // no convierte la sesión de estudio en una copia desechable de etcd/API.
    const environment=entornoEjercicio(current,getState());
    await prepararPractica(current,run,{environment});prepared.add(current.id);$('exercise-result').textContent='Ejercicio preparado. Ya puedes resolverlo.';
   }
   else{const result=await comprobarPractica(current,run);globalThis.kubeDebianExerciseResult=result;$('exercise-result').dataset.result=result.state;$('exercise-result').textContent=result.message;}
  }catch(error){$('exercise-result').dataset.result='unverified';$('exercise-result').textContent='No se ha completado la preparación: '+(error.message||error);}
  finally{checking=false;setBusy(false);update();}
 }
 $('exercise-check').onclick=()=>exercise(false);$('exercise-prepare').onclick=()=>exercise(true);
 practiceProgress({mode:'kubernetes-real',select:$('exercise-select'),feedback:$('exercise-result'),getId:()=>task()?.id});
 $('exercise-solution-toggle').onclick=()=>{const body=$('exercise-help');body.hidden=!body.hidden;$('exercise-solution-toggle').textContent=body.hidden?'Ver solución':'Ocultar solución';$('exercise-solution-toggle').setAttribute('aria-expanded',String(!body.hidden));};
 const dialog=$('switch-level-dialog');for(const button of dialog.querySelectorAll('[data-switch-action]'))button.onclick=()=>dialog.close(button.dataset.switchAction);
 async function choose(destination,sceneChange=false){
  $('switch-level-title').textContent=destination?'Entrar en la etapa '+NIVELES[destination].stage:'Salir del laboratorio';
  $('switch-level-description').textContent=destination?'Se detendrán las máquinas actuales. Cada etapa tiene su propio guardado; los cambios no se trasladan a la otra.':'Puedes guardar antes de salir. Se detendrán las máquinas; tu último guardado se conserva.';
  dialog.querySelector('[data-switch-action=save]').disabled=!getState().initialized;
  dialog.querySelector('[data-switch-action=save]').textContent=destination?'Guardar y entrar':'Guardar y salir';
  dialog.querySelector('[data-switch-action=discard]').textContent=destination?'Entrar sin guardar':'Salir sin guardar';
  if(sceneChange){$('switch-level-title').textContent='Cambiar de copia del laboratorio';$('switch-level-description').textContent='Este ejercicio usa una copia independiente. Puedes guardar antes de cambiar; la otra sesión no se borra ni se sobrescribe.';dialog.querySelector('[data-switch-action=save]').textContent='Guardar y continuar';dialog.querySelector('[data-switch-action=discard]').textContent='Continuar sin guardar';}
  dialog.returnValue='';const result=new Promise(resolve=>dialog.addEventListener('close',()=>resolve(dialog.returnValue||'cancel'),{once:true}));dialog.showModal();return result;
 }
 async function requestScenario(id){
  if(getState().busy||switching||checking)return;
  switching=true;update();$('switch-level-error').textContent='';
  try{
   let choice=getState().nodeCount?await choose(null,true):'discard';
   while(choice!=='cancel'){
    try{await cambiarNivel({choice,save,stop,navigate:()=>navigate(urlEscenarioCurso(location.href,id))});return;}
    catch(error){$('switch-level-error').textContent='No se ha cambiado de copia: '+(error.message||error);choice=await choose(null,true);}
   }
  }
  finally{switching=false;update();}
 }
 async function requestChange(destination,href){
  if(destination===level||getState().busy||switching)return;
  if(destination){const target=new URL(href);target.searchParams.delete('escenario');href=target.href;}
  switching=true;update();$('switch-level-error').textContent='';
  try{
   let choice=getState().nodeCount?await choose(destination):'discard';
   while(choice!=='cancel'){
    try{await cambiarNivel({choice,save,stop,navigate:()=>navigate(href)});return;}
    catch(error){$('switch-level-error').textContent='No se ha cambiado de laboratorio: '+(error.message||error);choice=await choose(destination);}
   }
  }finally{switching=false;update();}
 }
 for(const anchor of document.querySelectorAll('.site-header a,.site-footer a,main a'))anchor.onclick=event=>{
  if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();requestChange(null,anchor.href).catch(error=>{$('exercise-result').textContent='No se ha salido: '+(error.message||error);});
 };
 globalThis.kubeDebianSelectedLevel=level;globalThis.kubeDebianExerciseCheck=()=>exercise(false);globalThis.kubeDebianPracticePrepare=()=>exercise(true);
 buildIndex();populateTasks();showEntry();
 if(currentURL.searchParams.get('view')==='exam')selectLearningMode('exam');
 else selectLearningMode('practice');
 const autoEnter=learningMode==='practice'&&currentURL.searchParams.get('enter')==='1';
 if(currentURL.searchParams.has('enter')){currentURL.searchParams.delete('enter');history.replaceState(history.state,'',currentURL.href);}
 if(autoEnter)queueMicrotask(()=>enter());
 return {update};
}
