import {NIVELES,urlNivel,cambiarNivel} from './niveles.mjs';
import {ejerciciosNivel} from './ejercicios-niveles.mjs';

export function montarInterfazNiveles({level,getState,run,setBusy,save,stop,start=()=>document.querySelector('#start-cluster').click(),navigate=href=>location.assign(href)}){
 const $=id=>document.getElementById(id),config=NIVELES[level],tasks=ejerciciosNivel(level);
 let switching=false,checking=false,entered=false,preview=level;
 const prepared=new Set();
 document.title=`Kubernetes · ${config.title} | S2KTUX`;
 $('mode-stamp').textContent=`${config.title} · Clases ${config.classes}`;
 $('course-intro').hidden=true;
 $('course-progression').textContent=config.note;$('course-progression').hidden=!config.note;
 $('mode-topology').replaceChildren(...config.topology.map(label=>{const span=document.createElement('span');span.textContent=label;return span;}));
 $('mode-topology').hidden=true;
 $('change-lab').hidden=false;
 $('exercise-select').replaceChildren();
 for(const [index,task] of tasks.entries()){
  const option=document.createElement('option');option.value=String(index);option.textContent=task.title;$('exercise-select').append(option);
 }
 $('exercises').hidden=false;

 function renderEntry(){
  const selected=NIVELES[preview];
  $('lab-entry').dataset.preview=preview;document.querySelector('main').dataset.level=preview;
  $('environment-select').value=preview;
  $('entry-position').textContent=`Clases ${selected.classes}`;
  $('entry-intro').textContent=selected.intro;
  $('entry-note').textContent=selected.note;$('entry-note').hidden=!selected.note;
  const sessions=preview===level?(getState().nodes||[]):[];
  const names=[...selected.topology];for(const session of sessions)if(!names.includes(session.name))names.push(session.name);
  $('entry-nodes').replaceChildren(...names.map((name,index)=>{
   const session=sessions.find(node=>node.name===name),row=document.createElement('tr');
   for(const text of [name,index===0?(names.length===1?'Control plane y aplicaciones':'Control plane'):'Worker',session?(session.error?'Error de arranque':session.consoleReady?'Terminal disponible':'Preparando'):'Sin iniciar']){const cell=document.createElement('td');cell.textContent=text;row.append(cell);}
   return row;
  }));
  update();
 }
 function showEntry(){
  preview=level;$('lab-entry').hidden=false;$('lab-workspace').hidden=true;renderEntry();
 }
 function showWorkspace(){
  entered=true;$('lab-entry').hidden=true;$('lab-workspace').hidden=false;document.querySelector('main').dataset.level=level;update();
 }
 function browse(value){
  if(getState().busy||switching)return;
  if(!Object.hasOwn(NIVELES,value))return;
  preview=value;renderEntry();
 }
 function task(){return tasks[Number($('exercise-select').value)];}
 function render(){
  const current=task();$('exercise-title').textContent=current.title;$('exercise-prompt').textContent=current.prompt;
  $('exercise-solution').textContent=current.solution;$('exercise-count').textContent=`Práctica ${Number($('exercise-select').value)+1} / ${tasks.length}`;
  $('exercise-help').open=false;$('exercise-result').textContent='';delete $('exercise-result').dataset.result;$('exercise-copy').textContent='Copiar comandos';update();
 }
 function update(){
  const state=getState(),blocked=state.busy||switching||checking;
  $('environment-select').disabled=$('enter-lab').disabled=blocked;
  $('change-lab').disabled=$('return-lab').disabled=blocked;
  $('return-lab').hidden=!entered;
  $('enter-lab').textContent=preview===level&&state.nodeCount>0?'Volver al laboratorio':'Iniciar laboratorio';
  $('exercise-select').disabled=blocked;$('exercise-check').disabled=blocked||!state.initialized;
  $('exercise-prepare').hidden=!task().prepare;$('exercise-prepare').disabled=blocked||!state.initialized||prepared.has(task().id);
  $('start-cluster').hidden=state.busy||state.initialized||state.nodeCount>0;
  $('nodes').hidden=state.busy&&!state.initialized;
  $('lab-idle').hidden=state.nodeCount>0||state.busy;document.querySelector('.lab-controls').setAttribute('aria-busy',String(state.busy));
 }
 async function enter(){
  if(getState().busy||switching||checking)return;
  if(preview!==level){
   const href=new URL(urlNivel(location.href,preview));href.searchParams.set('enter','1');
   await requestChange(preview,href.href);return;
  }
  showWorkspace();
  if(!getState().nodeCount&&!getState().initialized)start();
  update();
 }
 $('environment-select').onchange=event=>browse(event.target.value);
 $('enter-lab').onclick=()=>enter();
 $('change-lab').onclick=()=>{showEntry();$('enter-lab').focus();};
 $('return-lab').onclick=()=>{showWorkspace();$('change-lab').focus();};
 $('exercise-select').onchange=render;

 async function exercise(prepare){
  if(getState().busy||!getState().initialized||checking)return;
  checking=true;setBusy(true);update();const current=task();$('exercise-result').textContent=prepare?'Preparando el ejercicio…':'Comprobando el resultado en Linux…';
  try{
   if(prepare){for(const command of current.prepare)await run('controlplane','Preparar '+current.title,'set -eu; '+command,180000);prepared.add(current.id);$('exercise-result').textContent='Ejercicio preparado. Puedes investigar desde la terminal.';}
   else{const result=await run('controlplane','Comprobar '+current.title,'set -eu; '+current.check,180000);globalThis.kubeDebianExerciseResult={id:current.id,passed:result.ok};$('exercise-result').dataset.result=result.ok?'pass':'fail';$('exercise-result').textContent=result.ok?'Objetivo conseguido.':'El resultado todavía no cumple el enunciado. Revisa el estado y vuelve a comprobar.';}
  }catch(error){globalThis.kubeDebianExerciseResult={id:current.id,passed:false,error:String(error.message||error)};$('exercise-result').dataset.result='fail';$('exercise-result').textContent=prepare?'No se ha completado la preparación: '+(error.message||error):'El objetivo no se ha podido confirmar. Revisa los mensajes de la terminal.';}
  finally{checking=false;setBusy(false);update();}
 }
 $('exercise-check').onclick=()=>exercise(false);$('exercise-prepare').onclick=()=>exercise(true);
 $('exercise-copy').onclick=async()=>{try{await navigator.clipboard.writeText(task().solution);$('exercise-copy').textContent='Copiado';}catch{$('exercise-copy').textContent='Selecciona los comandos para copiarlos';}};
 const dialog=$('switch-level-dialog');for(const button of dialog.querySelectorAll('[data-switch-action]'))button.onclick=()=>dialog.close(button.dataset.switchAction);
 async function choose(destination){
  $('switch-level-title').textContent=destination?`Entrar en ${NIVELES[destination].title}`:'Salir del laboratorio';
  $('switch-level-description').textContent=destination?'Se detendrán las máquinas actuales. El otro laboratorio tiene sus propios recursos y guardado; tus cambios no se trasladan.':'Puedes guardar antes de salir. Se detendrán las máquinas del laboratorio; tu último guardado se conserva.';
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
 globalThis.kubeDebianSelectedLevel=level;globalThis.kubeDebianExerciseCheck=()=>exercise(false);
 render();showEntry();
 const currentURL=new URL(location.href),autoEnter=currentURL.searchParams.get('enter')==='1';
 if(currentURL.searchParams.has('enter')){currentURL.searchParams.delete('enter');history.replaceState(history.state,'',currentURL.href);}
 if(autoEnter)queueMicrotask(()=>enter());
 return {update};
}
