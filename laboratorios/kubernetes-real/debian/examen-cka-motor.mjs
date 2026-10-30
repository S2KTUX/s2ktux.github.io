import {DOMINIOS_CKA,DURACION_CKA,MINIMO_CKA,TAREAS_CKA} from './examen-cka-banco.mjs?v=146843198f26771b';
import {prepararRuntimeExamen,comprobarRuntimeExamen} from './examen-runtime.mjs?v=2fe076165705ea9b';
export const CKA_CREDENTIAL_DIR='/run/s2ktux-cka-eval-'+crypto.randomUUID().replaceAll('-','');
export async function prepararCredencialExamen(run){
 const dir=CKA_CREDENTIAL_DIR;
 const command=`set -eu; umask 077; test ! -e ${dir}; mkdir -m 700 ${dir}; source=/etc/kubernetes/super-admin.conf; test -r "$source" || source=/etc/kubernetes/admin.conf; test "$(grep -c 'client-certificate-data:' "$source")" = 1; test "$(grep -c 'client-key-data:' "$source")" = 1; awk '/client-certificate-data:/{print $2}' "$source" | base64 -d > ${dir}/tls.crt; awk '/client-key-data:/{print $2}' "$source" | base64 -d > ${dir}/tls.key; test -s ${dir}/tls.crt; test -s ${dir}/tls.key; openssl verify -CAfile /etc/kubernetes/pki/ca.crt ${dir}/tls.crt >/dev/null; openssl pkey -in ${dir}/tls.key -noout >/dev/null`;
 const result=await run('controlplane','Preparar la lectura de los resultados del examen',command,60000);
 if(result?.ok!==true)throw Error('No se ha preparado la credencial de evaluación');
}
export function nuevoIntento(now=Date.now()){
 if(!Number.isSafeInteger(now)||now<0)throw Error('Hora de inicio inválida');
 return {format:'s2ktux-cka-attempt-v1',id:crypto.randomUUID(),startedAt:now,endsAt:now+DURACION_CKA,marked:[],finishedAt:null};
}
export function informeCKA(results,{startedAt,finishedAt}){
 if(!Array.isArray(results)||results.length!==TAREAS_CKA.length||!Number.isFinite(startedAt)||!Number.isFinite(finishedAt)||finishedAt<startedAt)throw Error('Informe incompleto');
 const domains=Object.fromEntries(Object.entries(DOMINIOS_CKA).map(([id,max])=>[id,{max,earned:0,percent:0}]));
 let unverified=false;
 const tasks=TAREAS_CKA.map((task,index)=>{
  const result=results[index];
  if(result?.id!==task.id||!Array.isArray(result.conditions)||result.conditions.length!==task.conditions.length||result.conditions.some(v=>v!==true&&v!==false&&v!==null))throw Error('Resultados de tarea inválidos');
  if(result.conditions.includes(null))unverified=true;
  const earned=task.points*result.conditions.filter(v=>v===true).length/result.conditions.length;
  domains[task.domain].earned+=earned;
  return {...result,earned,max:task.points};
 });
 for(const domain of Object.values(domains))domain.percent=Math.round(100*domain.earned/domain.max);
 const score=Math.round(tasks.reduce((sum,t)=>sum+t.earned,0)*100)/100;
 return {score,max:100,passed:unverified?null:score>=MINIMO_CKA,unverified,domains,tasks,elapsedMs:finishedAt-startedAt};
}
export async function prepararExamenCKA(run,context){
 if(context?.fresh!==true)throw Error('No se vuelve a preparar un intento guardado del examen');
 await prepararCredencialExamen(run);
 if(context.prepared===true){
  await comprobarRuntimeExamen(run);
  await prepararEjerciciosCKA(run,{fresh:true,prepared:true});
  return;
 }
 await prepararRuntimeExamen(run,{scenario:'cka-exam',fresh:true,studentSession:false});
 const {materialesAvanzados}=await import('./complementos-avanzados.mjs?v=fd02080d549d450f');
 const {prepararGateway}=await import('./gateway-curso.mjs?v=3d5f33f66174384c');
 const {prepararPoliticasCurso}=await import('./red-politicas-curso.mjs?v=f58312c9062cfb18');
 await materialesAvanzados(run);
 const ready=await run('controlplane','Esperar la API después de cargar los materiales',`set -eu; deadline=$(($(date +%s)+90)); until response=$(curl --fail --silent --show-error --max-time 10 --cacert /etc/kubernetes/pki/ca.crt --cert "$S2KTUX_CKA_CERT" --key "$S2KTUX_CKA_KEY" https://127.0.0.1:6443/readyz) && test "$response" = ok; do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 3; done`,120000);
 if(ready?.ok!==true)throw Error('La API no está disponible para preparar el simulacro');
 await prepararGateway(run);await prepararPoliticasCurso(run,{workers:['worker1'],prepareMissingWorkers:true});
 await prepararEjerciciosCKA(run,{fresh:true,beforeQuestions:context.capture});
}
export async function prepararEjerciciosCKA(run,context){
 if(context?.fresh!==true)throw Error('Las preguntas solo se preparan antes de comenzar un intento nuevo');
 const schema=await run('controlplane','Preparar la validación OpenAPI de los manifiestos',context.prepared===true?'test -s /var/lib/kube-lab/exam-runtime-v1/openapi-v2.pb':`set -eu; curl --fail --silent --show-error --max-time 180 --cacert /etc/kubernetes/pki/ca.crt --cert "$S2KTUX_CKA_CERT" --key "$S2KTUX_CKA_KEY" -H 'Accept: application/com.github.proto-openapi.spec.v2@v1.0+protobuf' -o /var/lib/kube-lab/exam-runtime-v1/openapi-v2.pb https://127.0.0.1:6443/openapi/v2; test -s /var/lib/kube-lab/exam-runtime-v1/openapi-v2.pb`,240000);
 if(schema?.ok!==true)throw Error('No se ha preparado el esquema OpenAPI del examen');
 let captured=false;
 if(context.beforeQuestions)try{await context.beforeQuestions(run);captured=true;}catch(error){
  if(error.resumeFailed)throw error;
  console.warn('No se ha guardado la entrada rápida del examen:',error.message);
 }
 if(captured){
  const resumed=await run('controlplane','Comprobar la API después de guardar la base',`set -eu; deadline=$(($(date +%s)+90)); until response=$(curl --fail --silent --show-error --max-time 10 --cacert /etc/kubernetes/pki/ca.crt --cert "$S2KTUX_CKA_CERT" --key "$S2KTUX_CKA_KEY" https://127.0.0.1:6443/readyz) && test "$response" = ok; do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 3; done`,120000);
  if(resumed?.ok!==true)throw Error('La API no está disponible después de guardar la base del examen');
 }
 // El servidor mantiene la validación estricta. Evitar que el cliente Go
 // descargue otra vez todo OpenAPI para construir una lista de namespaces.
 const names=TAREAS_CKA.map(task=>'examen-'+task.id).join(' ');
 const created=await run('controlplane','Crear los namespaces del simulacro',`set -eu; for name in ${names}; do curl --fail --silent --show-error --max-time 20 --cacert /etc/kubernetes/pki/ca.crt --cert "$S2KTUX_CKA_CERT" --key "$S2KTUX_CKA_KEY" -H 'Content-Type: application/json' --data '{"apiVersion":"v1","kind":"Namespace","metadata":{"name":"'"$name"'"}}' 'https://127.0.0.1:6443/api/v1/namespaces?fieldValidation=Strict' >/dev/null; done`,120000);
 if(created?.ok!==true)throw Error('No se han creado los namespaces del simulacro');
 const accounts=await run('controlplane','Esperar las cuentas de los namespaces',`deadline=$(($(date +%s)+60)); until object=$(curl --fail --silent --show-error --max-time 10 --cacert /etc/kubernetes/pki/ca.crt --cert "$S2KTUX_CKA_CERT" --key "$S2KTUX_CKA_KEY" https://127.0.0.1:6443/api/v1/serviceaccounts) && test -n "$object" && printf '%s\\n' "$object" | jq -e '[.items[] | select(.metadata.name=="default" and (.metadata.namespace|startswith("examen-")))] | length==12'; do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 1; done`,90000);
 if(accounts?.ok!==true)throw Error('No se han preparado las cuentas de los namespaces');
 // Los controladores reales crean las ServiceAccounts de estos namespaces.
 for(const task of TAREAS_CKA)for(const command of task.prepare.slice(2)){const r=await run('controlplane','Preparar el entorno del simulacro','set -eu; '+command,240000);if(r?.ok!==true)throw Error('No se ha completado la preparación del simulacro');}
}
export async function corregirExamenCKA(run){
 const results=[];
 const healthCommand='response=$(curl --fail --silent --show-error --max-time 15 --cacert /etc/kubernetes/pki/ca.crt --cert "$S2KTUX_CKA_CERT" --key "$S2KTUX_CKA_KEY" https://127.0.0.1:6443/readyz) && test "$response" = ok';
 const healthy=async()=>{const health=await run('controlplane','Comprobar disponibilidad del clúster',healthCommand,45000);return health?.ok===true;};
 for(const task of TAREAS_CKA){
  const conditions=[];
  // Una comprobación por tarea basta para empezar; si una condición falla,
  // volver a consultar salud antes de atribuir el fallo a la respuesta.
  let available=false;try{available=await healthy();}catch{}
  if(!available){results.push({id:task.id,conditions:task.conditions.map(()=>null)});continue;}
  for(const condition of task.conditions){
   try{
    const r=await run('controlplane','Evaluar la pregunta '+Number(task.id)+' de '+TAREAS_CKA.length,'set -eu; '+condition.command,120000);
    conditions.push(r?.ok===true?true:r?.ok===false&&await healthy()?false:null);
   }catch{conditions.push(null);}
  }
  results.push({id:task.id,conditions});
 }
 return results;
}
