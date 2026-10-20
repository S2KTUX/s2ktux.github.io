// Historial de estudio, no validación continua del estado de la máquina.
export function practiceProgress({mode,select,feedback,getId=()=>select.selectedOptions[0]?.dataset.exerciseId||select.value}){
 const key='s2ktux-practice-progress-v1:'+mode;let records={},durable=true;
 try{records=JSON.parse(localStorage.getItem(key)||'{}');if(!records||typeof records!=='object'||Array.isArray(records))records={};}catch{durable=false;}
 const bar=document.createElement('div');bar.className='practice-progress';
 bar.title='Marcas de estudio guardadas en este navegador. No comprueban automáticamente la máquina.';
 const badge=document.createElement('strong'),mark=document.createElement('button'),clear=document.createElement('button');
 mark.type=clear.type='button';mark.className='lab-progress-mark';clear.className='lab-progress-clear';clear.textContent='Borrar marcas';bar.append(badge,mark,clear);
 const panel=select.closest('.lab-practices')||select.closest('.exercise-nav')?.parentElement;
 if(panel)panel.append(bar);
 const idFor=option=>option.dataset.exerciseId||option.value;
 function persist(){try{localStorage.setItem(key,JSON.stringify(records));}catch{durable=false;}}
 function paint(){
  for(const option of select.options){if(!option.value)continue;option.dataset.baseLabel??=option.textContent.replace(/^[✓×·↺•] /,'');const state=records[idFor(option)]?.state;
   option.dataset.progress=state||'pending';option.textContent=(state==='passed'?'✓ ':state==='failed'?'↺ ':state==='reviewed'?'• ':'')+option.dataset.baseLabel;
  }
  const state=records[getId()]?.state;bar.hidden=!getId();badge.hidden=!state;
  badge.dataset.progress=state||'pending';badge.textContent=state==='passed'?'✓ Comprobada':state==='failed'?'↺ Para revisar':state==='reviewed'?'• Realizada':'';
  mark.textContent=state==='reviewed'||state==='passed'?'Desmarcar':'Marcar realizada';
  clear.hidden=!Object.keys(records).length;
  bar.title=durable?'Marcas de estudio guardadas en este navegador. No comprueban automáticamente la máquina.':'Las marcas no se conservarán al cerrar esta página.';
 }
 function record(value){const state=['passed','correct'].includes(value)?'passed':['failed','incorrect','incomplete'].includes(value)?'failed':null;if(!state||!getId())return;records[getId()]={state,at:Date.now()};persist();paint();}
 mark.onclick=()=>{const id=getId();if(!id)return;const state=records[id]?.state;if(state==='reviewed'||state==='passed')delete records[id];else records[id]={state:'reviewed',at:Date.now()};persist();paint();};
 clear.onclick=()=>{if(!confirm('¿Borrar las marcas de prácticas de '+mode+'? No se borran las máquinas ni sus guardados.'))return;records={};persist();paint();};
 select.addEventListener('change',paint);new MutationObserver(paint).observe(select,{childList:true});
 if(feedback)new MutationObserver(()=>{const state=feedback.dataset.result;if(state&&!['pending','error','unverified'].includes(state))record(state);}).observe(feedback,{attributes:true,attributeFilter:['data-result']});
 paint();return{record,refresh:paint};
}
