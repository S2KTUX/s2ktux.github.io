// Solo el prototipo Kubernetes: no modifica el comprobador de Docker publicado.
export const limpiarSalidaSerie=text=>text.replace(/\r/g,'').replace(/\x1b\[[0-?]*[ -/]*[@-~]/g,'');
const clean=limpiarSalidaSerie;
const quote=text=>"'"+text.replaceAll("'","'\\''")+"'";
export function createKubeChecks(send,idle,onFinish){
 let pending;
 return {
  abort(error=Error('El motor se ha detenido.')){
   if(!pending)return false;const task=pending;pending=undefined;clearTimeout(task.timer);onFinish(task.output);task.reject(error);return true;
  },
  run(exercise,timeoutMs=90000){
   if(pending||!idle())return Promise.reject(Error('Espera al prompt vacío antes de continuar.'));
   if(!exercise?.checks?.length)return Promise.reject(Error('No hay comprobaciones.'));
   if(!Number.isSafeInteger(timeoutMs)||timeoutMs<1000||timeoutMs>300000)return Promise.reject(Error('Tiempo inválido'));
   const nonce=Array.from(crypto.getRandomValues(new Uint8Array(12)),n=>n.toString(16).padStart(2,'0')).join(''),prefix='__KUBE_CHECK_'+nonce+'_';
   const script=exercise.checks.map(([,command],i)=>`if /bin/sh -c ${quote(command)}; then rc=0; else rc=$?; fi; printf '\\n${prefix}${i}=%s\\n' "$rc"`).join('; ');
   const input=`/bin/sh -c ${quote(script)}\n`;
   if(input.length>3000)return Promise.reject(Error('La orden excede el límite seguro de la consola. Divídela en bloques.'));
   return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{const task=pending;pending=undefined;onFinish(task?.output||'');reject(Error('La fase no terminó a tiempo; no se considera aprobada.'));},timeoutMs);
    pending={exercise,prefix,output:'',timer,resolve,reject};
    try{send(input);}catch(error){clearTimeout(timer);pending=undefined;onFinish('');reject(error);}
   });
  },
  receive(text){
   if(!pending)return false;
   pending.output+=text;
   const output=clean(pending.output),lines=output.split('\n'),positions=[];
   const results=pending.exercise.checks.map(([label],i)=>{const key=pending.prefix+i+'=';const at=lines.findIndex(l=>l.startsWith(key)&&/^[0-9]+$/.test(l.slice(key.length)));positions.push(at);return {label,ok:lines[at]===key+'0',found:at!==-1};});
   if(results.every(r=>r.found)){
    // Exigir un prompt NUEVO, posterior a todos los resultados. Los avisos
    // asíncronos del kernel pueden seguirlo en el mismo bloque de UART.
    // No aceptar el eco de una orden después del prompt como shell vacío.
    const after=lines.slice(Math.max(...positions)+1).join('\n');
    const prompt=/(?:^|\n)(\[[^\n@\]]+@[^\n\]]+ [^\n\]]*\][#$] )(?=$|\n|\[\s*\d+(?:\.\d+)?\])/.exec(after);
    if(prompt){const task=pending;clearTimeout(task.timer);pending=undefined;onFinish('\r\n'+prompt[1]);task.resolve({ok:results.every(r=>r.ok),results});}
   }
   return true;
  },
 };
}
