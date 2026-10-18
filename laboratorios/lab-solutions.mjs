// Solo muestra texto: nunca ejecuta los comandos de una solución.
export function renderSolutions(root, solutions) {
 root.replaceChildren();
 if (!solutions.length) return;
 const pre=document.createElement('pre'),code=document.createElement('code');
 code.textContent=solutions.map((solution,index)=>
  '# Solución '+(index+1)+(solution.title?' · '+solution.title:'')+'\n'+
  (solution.explanation?'# '+solution.explanation.replaceAll('\n','\n# ')+'\n':'')+solution.code
 ).join('\n\n');
 pre.append(code);root.append(pre);
}
