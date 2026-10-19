// Avisos locales: no transmiten información del dispositivo ni arrancan la VM.
export function mountLabNotices(root,status){
 const agent=navigator.userAgent,mobile=/Android|iPhone|iPad|iPod/i.test(agent)||(navigator.maxTouchPoints>1&&/Macintosh/.test(agent));
 const recommended=/Chrome|Chromium|Edg\//.test(agent)&&!mobile;
 if(!recommended&&!root.querySelector('[data-lab-compatibility]')){
  const note=document.createElement('p');note.className='lab-information';note.dataset.labCompatibility='';
  note.textContent=mobile?'* Las máquinas pueden ir lentas en móvil. Para practicar se recomienda un ordenador con Chrome o Edge actualizado.':'* Si notas lentitud, prueba con Chrome o Edge actualizado en un ordenador.';
  root.querySelector('h1')?.after(note);
 }
 if(status){
  status.classList.add('lab-machine-status');
  const update=()=>status.setAttribute('aria-busy',String(/cargando|arrancando|reiniciando|reanudando|preparando|recuperando|descargando/i.test(status.textContent)));
  new MutationObserver(update).observe(status,{childList:true,characterData:true,subtree:true});update();
 }
}
