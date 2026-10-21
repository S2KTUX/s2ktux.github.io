// «Resuelta» marca una práctica realizada, no un aprobado ni su estado actual.
export function practiceProgress({mode,select,feedback,getId=()=>select.selectedOptions[0]?.dataset.exerciseId||select.value}){
 const key='s2ktux-practice-progress-v1:'+mode;let records={},durable=true;
 try{records=JSON.parse(localStorage.getItem(key)||'{}');if(!records||typeof records!=='object'||Array.isArray(records))records={};}catch{durable=false;}
 const bar=document.createElement('div');bar.className='practice-progress';
 bar.title='Marcas de prácticas realizadas. No son una nota ni validan la máquina.';
 const mark=document.createElement('button'),clear=document.createElement('button');
 mark.type=clear.type='button';mark.className='lab-progress-mark';clear.className='lab-progress-clear';clear.textContent='Borrar marcas';bar.append(mark,clear);
 const panel=select.closest('.lab-practices')||select.closest('.exercise-nav')?.parentElement;
 if(panel)panel.append(bar);
 const idFor=option=>option.dataset.exerciseId||option.value;
 const completed=record=>['completed','passed','failed','reviewed'].includes(record?.state);
 function persist(){try{localStorage.setItem(key,JSON.stringify(records));}catch{durable=false;}}
 function paint(){
  for(const option of select.options){if(!option.value)continue;option.dataset.baseLabel??=option.textContent.replace(/^[✓×·↺•] /,'');const done=completed(records[idFor(option)]);
   option.dataset.progress=done?'completed':'pending';option.textContent=(done?'Resuelta · ':'')+option.dataset.baseLabel;
  }
  const done=completed(records[getId()]);bar.hidden=!getId();
  select.dataset.progress=done?'completed':'pending';
  mark.textContent=done?'Desmarcar':'Marcar resuelta';
  clear.hidden=!Object.keys(records).length;
  bar.title=durable?'Prácticas realizadas, no una nota. Las marcas se guardan en este navegador.':'Las marcas no se conservarán al cerrar esta página.';
 }
 function record(value){const result=['passed','correct'].includes(value)?'passed':['failed','incorrect','incomplete'].includes(value)?'failed':null;if(!result||!getId())return;records[getId()]={state:'completed',source:'check',result,at:Date.now()};persist();paint();}
 mark.onclick=()=>{const id=getId();if(!id)return;if(completed(records[id]))delete records[id];else records[id]={state:'completed',source:'manual',at:Date.now()};persist();paint();};
 clear.onclick=()=>{if(!confirm('¿Borrar las marcas de prácticas de '+mode+'? No se borran las máquinas ni sus guardados.'))return;records={};persist();paint();};
 select.addEventListener('change',paint);new MutationObserver(paint).observe(select,{childList:true});
 if(feedback)new MutationObserver(()=>{const state=feedback.dataset.result;if(state&&!['pending','error','unverified'].includes(state))record(state);}).observe(feedback,{attributes:true,attributeFilter:['data-result']});
 paint();return{record,refresh:paint};
}
