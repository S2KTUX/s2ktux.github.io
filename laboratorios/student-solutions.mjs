// Cambia solo la presentación: los correctores siguen consultando el estado.
// Los bloques de archivo se pueden seleccionar sin copiar marcas de shell.
export function studentSolution(solution){
 let code=solution.code;
 code=code.replace(/printf '([^']+)' \| chpasswd/g,(original,format)=>{
  const users=format.replace(/\\n$/,'').split('\\n').map(line=>line.split(':'));
  if(!users.every(([name,password])=>/^[a-z_][a-z0-9_-]*$/.test(name)&&password))return original;
  return users.map(([name,password])=>'passwd '+name+'\n# Escribe '+password+' dos veces.').join('\n');
 });
 code=code.replace(/printf '([^']+)\\n' \| crontab -u ([a-z_][a-z0-9_-]*) -/g,(_,line,user)=>'crontab -u '+user+' -e\n# Añade esta línea:\n# '+line);
 code=code.replace(/printf 'UUID=%s ([^'\\]+)\\n' "\$\(blkid -s UUID -o value (.+)\)" >> \/etc\/fstab/g,(_,entry,device)=>'blkid '+device+'\nvi /etc/fstab\n# Añade: UUID=<UUID mostrado> '+entry);
 code=code.replace(/runuser -l ([a-z_][a-z0-9_-]*) -c true/g,(_,user)=>'su - '+user+'\nexit');
 code=code.replace(/printf (['"])([^\n]*?)\1 (>>?) ([^\n]+)(?=\n|$)/g,(original,quote,format,redirect,path)=>{
  if(/%|\\[^n]/.test(format.replaceAll('%%','')))return original;
  const lines=format.replaceAll('%%','%').replace(/\\n$/,'').split('\\n');
  if(lines.length>3)return original;
  return lines.map((line,i)=>'echo '+"'"+line.replaceAll("'","'\\''")+"'"+' '+(i?'>>':redirect)+' '+path).join('\n');
 });
 const blocks=[];
 const pattern=/cat > ([^\s]+) <<'?EOF'?\n([\s\S]*?)\nEOF|printf '([^\n]*\\n[^\n]*)' > ([^\n]+)/g;
 let start=0;
 for(const match of code.matchAll(pattern)){
  const path=match[1]||match[4],content=match[2]??match[3].replaceAll('\\n','\n').replace(/\n$/,'');
  if(!match[1]&&(/%|\\[^n]/.test(match[3])||content.split('\n').length<=3))continue;
  if(match.index>start)blocks.push({kind:'command',text:code.slice(start,match.index).trim()});
  blocks.push({kind:'command',text:'vi '+path},{kind:'file',path,text:content});start=match.index+match[0].length;
 }
 if(start){if(start<code.length)blocks.push({kind:'command',text:code.slice(start).trim()});}
 return {...solution,code,...(blocks.length?{blocks}: {})};
}
