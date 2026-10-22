// Un fallo de transporte no equivale a un ejercicio mal resuelto.
export async function comprobarPractica(task,run){
 if(!task?.id||typeof task.check!=='string'||!task.check.trim())throw Error('Práctica sin comprobador');
 try{
  if(task.preflight){
   const health=await run('controlplane','Comprobar disponibilidad antes de corregir','set -eu; '+task.preflight,45000);
   if(health?.ok!==true)return {id:task.id,state:'unverified',passed:null,message:'El clúster no responde correctamente. No se ha calificado el ejercicio.'};
  }
  const result=await run('controlplane','Comprobar '+task.title,'set -eu; '+task.check,180000);
  if(result?.ok===true)return {id:task.id,state:'correct',passed:true,message:'Objetivo conseguido.'};
  if(result?.ok===false){
   let message='El resultado todavía no cumple el enunciado.';
   for(const diagnostic of task.diagnostics||[]){
    if(!diagnostic.check?.trim()||!diagnostic.message?.trim())throw Error('Diagnóstico incompleto');
    if(diagnostic.check===task.check){message=diagnostic.message;break;}
    const detail=await run('controlplane','Revisar '+task.title,'set -eu; '+diagnostic.check,90000);
    if(detail?.ok===false){message=diagnostic.message;break;}
    if(detail?.ok!==true)throw Error('No se ha recibido el diagnóstico');
   }
   if(task.preflight){
    const health=await run('controlplane','Comprobar disponibilidad después de corregir','set -eu; '+task.preflight,45000);
    if(health?.ok!==true)return {id:task.id,state:'unverified',passed:null,message:'El clúster dejó de responder durante la comprobación. No se ha calificado el ejercicio.'};
   }
   return {id:task.id,state:'incomplete',passed:false,message};
  }
  throw Error('El comprobador no ha recibido un resultado válido');
 }catch(error){return {id:task.id,state:'unverified',passed:null,message:'No se ha podido comprobar el ejercicio: '+String(error.message||error)};}
}
export async function prepararPractica(task,run){
 for(const requirement of task.requirements||[]){
  if(requirement==='local-path'){
   const {prepararAlmacenamiento}=await import('./almacenamiento-curso.mjs?v=0bb85c4d4cb510a9');await prepararAlmacenamiento(run);
  }else if(requirement==='traefik'){
   const {prepararIngress}=await import('./ingress-curso.mjs?v=6ceb5bb8f0af85f7');await prepararIngress(run);
  }else if(requirement==='network-policy'){
   const {prepararPoliticasCurso}=await import('./red-politicas-curso.mjs?v=3c77baf60f84d25b');await prepararPoliticasCurso(run);
  }else if(requirement==='gateway'){
   const {prepararGateway}=await import('./gateway-curso.mjs?v=1149d7ba583d8b77');await prepararGateway(run);
  }else if(requirement==='traefik-rewrite'){
   const {prepararRewrite}=await import('./rewrite-curso.mjs?v=64272d462d55d2e7');await prepararRewrite(run);
  }else throw Error('Componente de práctica desconocido');
 }
 for(const command of task.prepare||[]){
  const result=await run('controlplane','Preparar '+task.title,'set -eu; '+command,240000);
  if(result?.ok!==true)throw Error('No se ha completado la preparación. No se considera preparado el ejercicio.');
 }
 return task.id;
}
