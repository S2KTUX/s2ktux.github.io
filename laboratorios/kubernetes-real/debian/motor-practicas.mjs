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
   if(task.preflight){
    const health=await run('controlplane','Comprobar disponibilidad después de corregir','set -eu; '+task.preflight,45000);
    if(health?.ok!==true)return {id:task.id,state:'unverified',passed:null,message:'El clúster dejó de responder durante la comprobación. No se ha calificado el ejercicio.'};
   }
   return {id:task.id,state:'incomplete',passed:false,message:'El resultado todavía no cumple el enunciado.'};
  }
  throw Error('El comprobador no ha recibido un resultado válido');
 }catch(error){return {id:task.id,state:'unverified',passed:null,message:'No se ha podido comprobar el ejercicio: '+String(error.message||error)};}
}
export async function prepararPractica(task,run){
 for(const requirement of task.requirements||[]){
  if(requirement==='local-path'){
   const {prepararAlmacenamiento}=await import('./almacenamiento-curso.mjs?v=0bb85c4d4cb510a9');await prepararAlmacenamiento(run);
  }else if(requirement==='traefik'){
   const {prepararIngress}=await import('./ingress-curso.mjs?v=43674ff2cdeb5bc1');await prepararIngress(run);
  }else throw Error('Componente de práctica desconocido');
 }
 for(const command of task.prepare||[]){
  const result=await run('controlplane','Preparar '+task.title,'set -eu; '+command,240000);
  if(result?.ok!==true)throw Error('No se ha completado la preparación. No se considera preparado el ejercicio.');
 }
 return task.id;
}
