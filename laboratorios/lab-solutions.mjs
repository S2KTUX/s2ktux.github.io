// Solo muestra texto: nunca ejecuta los comandos de una solución.
export function renderSolutions(root, solutions, {copy=false}={}) {
 root.replaceChildren();
 if (!solutions.length) return;
 if(solutions.length===1&&solutions[0].steps){
  for(const [title,command] of solutions[0].steps){
   const label=document.createElement('p');
   label.textContent=title;
   root.append(label);
   renderSolutions(root.appendChild(document.createElement('div')),[{code:command}],{copy});
  }
  return;
 }
 if(copy){
  solutions.forEach((solution,index)=>{
   const section=document.createElement('div');
   section.dataset.solutionAlternative=String(index+1);
   const heading=document.createElement('p');heading.textContent='Solución '+(index+1)+(solution.title?' · '+solution.title:'');
   const pre=document.createElement('pre'),code=document.createElement('code');
   if(solution.explanation){const explanation=document.createElement('p');explanation.textContent=solution.explanation;section.append(heading,explanation);}
   else section.append(heading);
   code.textContent=solution.blocks?solution.blocks.map(block=>block.kind==='file'?'# Contenido de '+block.path+' (guarda y sal del editor):\n\n'+block.text:block.text).join('\n\n'):solution.code;
   if(!code.textContent.trim())return;
   pre.append(code);section.append(pre);root.append(section);
   addSolutionCopy(section,pre,code);
  });
  return;
 }
 const pre=document.createElement('pre'),code=document.createElement('code');
 solutions.forEach((solution,index)=>{
  if(index)code.append('\n\n');
  code.append('# Solución '+(index+1)+(solution.title?' · '+solution.title:'')+'\n\n');
  if(solution.explanation)code.append('# '+solution.explanation.replaceAll('\n','\n# ')+'\n\n');
  if(!solution.blocks){code.append(solution.code);return;}
  solution.blocks.forEach((block,i)=>{
   if(i)code.append('\n\n');
   if(block.kind==='file'){
    code.append('# Contenido de '+block.path+' (guarda y sal del editor):\n\n');
    const file=document.createElement('span');file.className='lab-file-content';file.textContent=block.text;code.append(file);
   }else code.append(block.text);
  });
 });
 pre.append(code);root.append(pre);

}

function addSolutionCopy(root,pre,code){
 const button=document.createElement('button');
 button.type='button';button.textContent='Copiar solución';
 const status=document.createElement('span');
 status.setAttribute('role','status');
 const controls=document.createElement('div');controls.className='controls';controls.append(button,status);root.append(controls);
 const select=()=>{
  const range=document.createRange();range.selectNodeContents(code);
  const selection=window.getSelection();selection.removeAllRanges();selection.addRange(range);
 };
 pre.addEventListener('click',event=>{if(event.detail===1&&window.getSelection().isCollapsed)select();});
 const copySelection=()=>{
  const field=document.createElement('textarea');field.value=code.textContent;field.readOnly=true;
  Object.assign(field.style,{position:'fixed',left:'0',top:'0',opacity:'0',fontSize:'16px'});
  root.append(field);
  try{
   field.focus({preventScroll:true});field.select();field.setSelectionRange(0,field.value.length);
   return document.execCommand('copy');
  }finally{field.remove();button.focus({preventScroll:true});}
 };
 button.addEventListener('click',async()=>{
  status.textContent='';
  let copied=false;
  try{
   const ua=navigator.userAgent;
   if(/iPad|iPhone|iPod/.test(ua)||/AppleWebKit/.test(ua)&&!/Chrome|Chromium|Edg/.test(ua)||!navigator.clipboard?.writeText)copied=copySelection();
   else{await navigator.clipboard.writeText(code.textContent);copied=true;}
  }catch{}
  if(!copied)select();
  status.textContent=copied?'Copiado':'Solución seleccionada. Usa el atajo de copiar.';
 });
}
