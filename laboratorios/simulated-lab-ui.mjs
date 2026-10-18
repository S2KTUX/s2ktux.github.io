export function mountSimulatedLayout(mode){
 const main=document.querySelector('#main-content');if(!main||main.dataset.labLayout)return;
 main.dataset.labLayout='shared';main.classList.add('lab-page','simulated-lab-page');
 const name={linux:'Linux',docker:'Docker',kubernetes:'Kubernetes'}[mode];
 const stage=main.querySelector('.terminal-stage'),practice=main.querySelector('.terminal-practice-section');
 main.querySelector('#term-heading').textContent='Laboratorio '+name;
 main.querySelector('#term-eyebrow').hidden=main.querySelector('#term-description').hidden=true;
 const nav=document.createElement('nav');nav.className='lab-modes';nav.setAttribute('aria-label','Modo del laboratorio');
 const a=document.createElement('a');a.href=location.href;a.textContent='Modo práctica';a.setAttribute('aria-current','page');nav.append(a);
 if(mode!=='docker'){const exam=document.createElement('a');exam.textContent='Modo examen';exam.href=mode==='linux'?'/laboratorios/linux-real/examen.html':'/terminal.html?mode=kubernetes&exam=1&enter=1';nav.append(exam);}
 main.querySelector('.terminal-hero').after(nav);stage.before(practice);
 const panel=document.querySelector('#practice-panel');panel.className='lab-practices';panel.open=true;
 document.querySelector('#practice-title').textContent='Prácticas:';
 document.querySelector('#practice-title').onclick=event=>event.preventDefault();
 const actionRow=document.createElement('div');actionRow.className='lab-practice-actions';
 document.querySelector('#chal-body').after(actionRow);actionRow.append(document.querySelector('#chal-check'),document.querySelector('#chal-solution'));
 document.querySelector('#chal-solution-body').className='lab-solutions';
 document.querySelector('#chal-check').textContent='Comprobar ejercicio';
 const toolbar=main.querySelector('.terminal-stage-toolbar');toolbar.hidden=true;
 const actions=document.querySelector('#term-actions');actions.className='lab-machine-actions';
 stage.before(actions);document.querySelector('#term-reset').textContent='Reset';
 document.querySelector('#term-reboot').textContent='Reiniciar máquina (GRUB)';document.querySelector('#term-rebootm').textContent='Reiniciar máquina';
 document.querySelector('#term-solved').hidden=true;
 const machineExtras=document.createElement('div');machineExtras.className='lab-machine-actions';stage.after(machineExtras);machineExtras.append(document.querySelector('#term-reboot'),document.querySelector('#term-rebootm'));
 const chrome=document.querySelector('.terminal-chrome');chrome.classList.add('console-bar');
 const label=document.createElement('span');label.textContent='Terminal';chrome.prepend(label);
 const footer=document.querySelector('.site-footer');footer.innerHTML='<div class="site-footer-inner"><a class="site-footer-brand" href="/">S2KTUX</a><p>Aprender practicando</p></div>';
 const note=document.createElement('p');note.className='lab-information';
 const small=document.createElement('small');small.textContent='* Versión simulada antigua. Los comandos se interpretan en el navegador. ';const real=document.createElement('a');real.textContent='Usar el laboratorio real';real.href='/laboratorios/'+mode+'-real/';small.append(real);note.append(small);main.append(note);
 const course=document.createElement('p');course.className='lab-information';const courseSmall=document.createElement('small');courseSmall.append('* Tienes el ');const courseLink=document.createElement('a');courseLink.href='/cursos/'+({linux:'rhcsa-9',kubernetes:'kubernetes-cka'}[mode]||mode)+'/';courseLink.textContent='curso de '+name;courseSmall.append(courseLink,' disponible para seguir las prácticas.');course.append(courseSmall);main.append(course);
 if(mode==='linux'){
  const reference=document.createElement('details');reference.className='lab-reference';const summary=document.createElement('summary');summary.textContent='Referencia breve de comandos';reference.append(summary);main.append(reference);
  reference.addEventListener('toggle',async()=>{if(!reference.open||reference.dataset.loaded)return;reference.dataset.loaded='loading';try{const {mountCommandReference}=await import('./command-reference.mjs');const holder=document.createElement('div');mountCommandReference(holder);reference.append(...[...holder.firstElementChild.children].slice(1));reference.dataset.loaded='true';}catch{delete reference.dataset.loaded;const error=document.createElement('p');error.textContent='No se pudo cargar la referencia. Ciérrala y vuelve a abrirla.';reference.append(error);}});
 }
 if(new URLSearchParams(location.search).get('exam')==='1'){main.classList.add('simulated-exam');nav.querySelector('[aria-current]').removeAttribute('aria-current');nav.lastElementChild.setAttribute('aria-current','page');}
}
