// Solo presenta comandos: consultar o copiar una solución nunca la ejecuta.
export function renderSolutions(root,solutions){
 root.replaceChildren();
 const multiple=solutions.length>1;
 if(multiple){const note=document.createElement('p');note.textContent='Elige una de estas opciones; no hace falta ejecutar todas.';root.append(note);}
 solutions.forEach((solution,index)=>{
  const section=document.createElement('section');section.className='lab-solution';
  if(multiple){const heading=document.createElement('h3');heading.textContent='Opción '+(index+1)+(solution.title?' · '+solution.title:'');section.append(heading);}
  if(solution.explanation){const paragraph=document.createElement('p');paragraph.textContent=solution.explanation;section.append(paragraph);}
  const pre=document.createElement('pre'),code=document.createElement('code');code.textContent=solution.code;pre.append(code);
  const copy=document.createElement('button');copy.type='button';copy.className='lab-solution-copy';copy.textContent='Copiar comandos';
  const feedback=document.createElement('span');feedback.className='lab-copy-status';feedback.setAttribute('role','status');feedback.setAttribute('aria-live','polite');
  copy.onclick=async()=>{try{await navigator.clipboard.writeText(solution.code);feedback.textContent='Copiado.';}catch{feedback.textContent='No se pudo copiar. Selecciona el texto y cópialo manualmente.';}};
  section.append(pre,copy,feedback);root.append(section);
 });
}
