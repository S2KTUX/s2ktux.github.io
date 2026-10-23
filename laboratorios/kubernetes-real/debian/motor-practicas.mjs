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
export async function prepararPractica(task,run,{environment='course'}={}){
 if(task.environment&&task.environment!==environment)throw Error('Esta práctica necesita un entorno independiente: '+task.environment+'. No se modifica la sesión actual.');
 for(const requirement of task.requirements||[]){
  if(requirement==='local-path'){
   const {prepararAlmacenamiento}=await import('./almacenamiento-curso.mjs?v=0bb85c4d4cb510a9');await prepararAlmacenamiento(run);
  }else if(requirement==='traefik'){
   const {prepararIngress}=await import('./ingress-curso.mjs?v=6ceb5bb8f0af85f7');await prepararIngress(run);
  }else if(requirement==='network-policy'){
   const {prepararPoliticasCurso}=await import('./red-politicas-curso.mjs?v=3c77baf60f84d25b');await prepararPoliticasCurso(run);
  }else if(requirement==='gateway'){
   const {prepararGateway}=await import('./gateway-curso.mjs?v=3d5f33f66174384c');await prepararGateway(run);
  }else if(requirement==='traefik-rewrite'){
   const {prepararRewrite}=await import('./rewrite-curso.mjs?v=9b9aeeac4b6500b5');await prepararRewrite(run);
  }else if(requirement==='course-materials'){
   const {materialesAvanzados}=await import('./complementos-avanzados.mjs?v=fd02080d549d450f');await materialesAvanzados(run);
  }else if(requirement==='metrics'||requirement==='metrics-files'){
   const {prepararMetricas}=await import('./complementos-avanzados.mjs?v=fd02080d549d450f');await prepararMetricas(run,{install:requirement==='metrics'});
  }else throw Error('Componente de práctica desconocido');
 }
 for(const step of task.prepare||[]){
  const {node,command}=pasoPractica(step);
  const result=await run(node,'Preparar '+task.title,'set -eu; '+command,240000);
  if(result?.ok!==true)throw Error('No se ha completado la preparación. No se considera preparado el ejercicio.');
 }
 return task.id;
}
export function pasoPractica(step){
 const value=typeof step==='string'?{node:'controlplane',command:step}:step;
 if(!value||!['controlplane','worker1','worker2'].includes(value.node)||typeof value.command!=='string'||!value.command.trim())throw Error('Paso de práctica no válido');
 return {node:value.node,command:value.command};
}
