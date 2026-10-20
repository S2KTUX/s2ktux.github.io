const labels={passed:'Correcto',failed:'Por corregir',unverified:'Sin comprobar',pending:'Sin intentar'};
export function practiceProgress({mode,select,feedback,getId=()=>select.selectedOptions[0]?.dataset.exerciseId||select.value}){
 const key='s2ktux-practice-progress-v1:'+mode;let records={},durable=true;try{records=JSON.parse(localStorage.getItem(key)||'{}');if(!records||typeof records!=='object'||Array.isArray(records))records={};}catch{records={};durable=false;}
 const bar=document.createElement('div');bar.className='practice-progress';
 const badge=document.createElement('strong'),text=document.createElement('p'),clear=document.createElement('button');clear.type='button';clear.textContent='Borrar progreso';clear.className='lab-progress-clear';bar.append(badge,text,clear);select.closest('.exercise-nav')?.after(bar);
 const idFor=option=>option.dataset.exerciseId||option.value;
 function paint(){let correct=0,attempted=0;for(const option of select.options){if(!option.value)continue;option.dataset.baseLabel??=option.textContent.replace(/^[✓×·] /,'');const state=records[idFor(option)]?.state;option.textContent=(state==='passed'?'✓ ':state==='failed'?'× ':'· ')+option.dataset.baseLabel;if(state){attempted++;if(state==='passed')correct++;}}
  const count=Object.keys(records).length;clear.hidden=!count;text.textContent=(count?'Últimas comprobaciones: '+correct+' correctas de '+attempted+' intentadas en esta selección.':'Sin intentos guardados.')+(durable?' Se guardan en este navegador.':' No se pueden guardar al cerrar esta pestaña.');
  const state=records[getId()]?.state||'pending';bar.hidden=!getId();bar.dataset.result=state;badge.textContent=labels[state];
 }
 function record(value){const state=['passed','correct'].includes(value)?'passed':['failed','incorrect','incomplete'].includes(value)?'failed':null;if(!state||!getId())return;records[getId()]={state,at:Date.now()};try{localStorage.setItem(key,JSON.stringify(records));}catch{durable=false;}paint();}
 clear.onclick=()=>{if(!confirm('¿Borrar las marcas de prácticas de '+mode+'? No se borran las máquinas ni sus guardados.'))return;records={};try{localStorage.removeItem(key);}catch{}paint();};
 select.addEventListener('change',paint);new MutationObserver(paint).observe(select,{childList:true});
 if(feedback)new MutationObserver(()=>{const state=feedback.dataset.result;if(state&&state!=='pending'&&state!=='error'&&state!=='unverified')record(state);}).observe(feedback,{attributes:true,attributeFilter:['data-result']});
 paint();return {record,refresh:paint};
}
