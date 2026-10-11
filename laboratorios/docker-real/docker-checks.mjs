const clean=text=>text.replace(/\r/g,'').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,'');
const quote=text=>"'"+text.replaceAll("'","'\\''")+"'";
export function createDockerChecks(send,idle,onFinish){
 let pending;
 return {
  run(exercise){
   if(pending||!idle())return Promise.reject(Error('Termina el comando o editor y vuelve al prompt vacío antes de comprobar.'));
   if(!exercise?.checks?.length)return Promise.reject(Error('Esta práctica se consulta directamente en la terminal.'));
   const nonce=Array.from(crypto.getRandomValues(new Uint8Array(12)),n=>n.toString(16).padStart(2,'0')).join(''),prefix='__DOCKER_CHECK_'+nonce+'_';
   const script=exercise.checks.map(([,command],i)=>`if /bin/sh -c ${quote(command)} >/dev/null 2>&1; then rc=0; else rc=$?; fi; printf '\\n${prefix}${i}=%s\\n' "$rc"`).join('; ');
   return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{const task=pending;pending=undefined;onFinish(task?.output||'');reject(Error('La consulta no terminó. No se considera aprobada; vuelve al prompt o usa Reset.'));},90000);
    pending={exercise,prefix,output:'',timer,resolve,reject};
    try{send(`/bin/sh -c ${quote(script)}\n`);}catch(e){clearTimeout(timer);pending=undefined;onFinish('');reject(e);}
   });
  },
  receive(text){
   if(!pending)return false;
   pending.output+=text;
   const output=clean(pending.output),prompt=/(?:^|\n)(\[[^\n@\]]+@[^\n\]]+ [^\n\]]*\][#$] )$/.exec(output);
   if(prompt){
    const lines=output.split('\n'),results=pending.exercise.checks.map(([label],i)=>{const key=pending.prefix+i+'=';const line=lines.find(l=>l.startsWith(key)&&/^[0-9]+$/.test(l.slice(key.length)));return {label,ok:line===key+'0',found:!!line};});
    if(results.every(r=>r.found)){const task=pending;clearTimeout(task.timer);pending=undefined;onFinish('\r\n'+prompt[1]);task.resolve({ok:results.every(r=>r.ok),results});}
   }
   return true;
  },
 };
}
