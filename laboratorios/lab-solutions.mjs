// Solo muestra texto: nunca ejecuta los comandos de una solución.
export function renderSolutions(root, solutions) {
 root.replaceChildren();
 if (!solutions.length) return;
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
