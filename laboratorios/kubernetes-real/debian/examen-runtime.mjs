// Plazos del entorno emulado; no cambia permisos, datos ni las respuestas.
// Se aplica únicamente a una copia nueva del examen, nunca al estudio guardado.
// Las órdenes canónicas de preparación llevan JSON ya generado por el banco.
// Crear esos recursos nuevos mediante la API evita arrancar Go por cada uno.
export function ordenPreparacionExamen(command){
 const prefix="printf '%s\\n' ",suffix=' | kubectl apply -f -';
 if(typeof command!=='string'||!command.startsWith(prefix)||!command.endsWith(suffix))return command;
 const quoted=command.slice(prefix.length,-suffix.length),quote=value=>"'"+value.replaceAll("'","'\\''")+"'";
 let object;try{object=JSON.parse(quoted.slice(1,-1).replaceAll("'\\''","'"));if(quote(JSON.stringify(object))!==quoted)return command;}catch{return command;}
 if(!object||typeof object!=='object'||Array.isArray(object))return command;
 const resource={'apps/v1:Deployment':['/apis/apps/v1','deployments',true],'v1:Service':['/api/v1','services',true],'v1:Pod':['/api/v1','pods',true],'v1:PersistentVolume':['/api/v1','persistentvolumes',false]}[object.apiVersion+':'+object.kind];
 if(!resource||!object.metadata||typeof object.metadata.name!=='string'||!/^[-a-z0-9]+$/.test(object.metadata.name)||resource[2]&&!/^examen-[0-9]{2}$/.test(object.metadata.namespace))return command;
 const path=resource[0]+(resource[2]?'/namespaces/'+object.metadata.namespace:'')+'/'+resource[1];
 return 'curl --fail --silent --show-error --max-time 30 --cacert /etc/kubernetes/pki/ca.crt --cert "$S2KTUX_CKA_CERT" --key "$S2KTUX_CKA_KEY" -H '+quote('Content-Type: application/json')+' --data '+quote(JSON.stringify(object))+' '+quote('https://127.0.0.1:6443'+path+'?fieldValidation=Strict')+' >/dev/null';
}
export function ordenRetirarWorkerExamen(){return `set -eu
umask 077
dir=$(mktemp -d /run/s2ktux-cka-start.XXXXXX)
trap 'rm -f "$dir/cert" "$dir/key" "$dir/response"; rmdir "$dir"' EXIT
config=/etc/kubernetes/super-admin.conf
test -r "$config" || config=/etc/kubernetes/admin.conf
test "$(grep -c 'client-certificate-data:' "$config")" = 1
test "$(grep -c 'client-key-data:' "$config")" = 1
awk '/client-certificate-data:/{print $2}' "$config" | base64 -d > "$dir/cert"
awk '/client-key-data:/{print $2}' "$config" | base64 -d > "$dir/key"
code=$(curl --silent --show-error --retry 2 --retry-all-errors --retry-delay 2 --retry-max-time 45 --max-time 20 --cacert /etc/kubernetes/pki/ca.crt --cert "$dir/cert" --key "$dir/key" -X DELETE -o "$dir/response" -w '%{http_code}' https://127.0.0.1:6443/api/v1/nodes/cka-w2)
case "$code" in
 200|202) jq -e '(.kind=="Node" and .metadata.name=="cka-w2") or (.kind=="Status" and .status=="Success")' "$dir/response" ;;
 404) jq -e '.kind=="Status" and .reason=="NotFound" and .details.name=="cka-w2"' "$dir/response" ;;
 *) cat "$dir/response"; exit 1 ;;
esac`;}
export async function comprobarRuntimeExamen(run){
 const dir='/var/lib/kube-lab/exam-runtime-v1';
 const result=await run('controlplane','Comprobar la preparación del examen recuperado',`set -eu; test "$(cat ${dir}/complete)" = prepared; test -s ${dir}/openapi-v2.pb; grep -q '(full)' /sys/kernel/debug/sched/preempt; test "$(awk '/^    livenessProbe:/{live=1;next} live && /^    [^ ]/{live=0} live && /failureThreshold:/{print $2}' /etc/kubernetes/manifests/kube-apiserver.yaml)" = 30; containerd --config /etc/containerd/config.toml config dump | grep -q "io.containerd.timeout.task.state.*30s"; response=$(curl --fail --silent --show-error --max-time 20 --cacert /etc/kubernetes/pki/ca.crt --cert "$S2KTUX_CKA_CERT" --key "$S2KTUX_CKA_KEY" https://127.0.0.1:6443/readyz); test "$response" = ok`,60000);
 if(result?.ok!==true)throw Error('La base del examen no conserva su preparación verificada');
 const worker=await run('worker1','Comprobar la red del examen recuperado','systemctl is-active --quiet kube-lab-netns.service && mountpoint -q /run/netns',60000);
 if(worker?.ok!==true)throw Error('La red del worker no está disponible');
}
export async function prepararCargaControladoresExamen(run,context){
 if(context?.scenario!=='cka-exam'||context.fresh!==true||context.studentSession!==false)throw Error('Los controladores solo se preparan antes de un intento nuevo');
 const command=`set -eu
dir=/var/lib/kube-lab/exam-controller-load-v1
if test ! -e "$dir/complete"; then
 test ! -e "$dir"; mkdir -m 700 "$dir"
 for component in kube-controller-manager kube-scheduler; do
  path=/etc/kubernetes/manifests/$component.yaml
  test "$(grep -Fc -- '    - --kube-api-qps=10' "$path")" = 1
  test "$(grep -Fc -- '    - --kube-api-burst=15' "$path")" = 1
  cp "$path" "$dir/$component.before.yaml"
  sed -e 's/--kube-api-qps=10$/--kube-api-qps=5/' -e 's/--kube-api-burst=15$/--kube-api-burst=10/' "$path" | sed '/^    livenessProbe:/,/^    [a-zA-Z]/s/^      failureThreshold: 8$/      failureThreshold: 30/' > "$dir/$component.yaml"
  grep -Fq -- '--kube-api-qps=5' "$dir/$component.yaml"
  test "$(awk '/^    livenessProbe:/{live=1;next} live && /^    [^ ]/{live=0} live && /failureThreshold:/{print $2}' "$dir/$component.yaml")" = 30
 done
 for component in kube-controller-manager kube-scheduler; do
  cp "$dir/$component.yaml" /etc/kubernetes/.$component.exam.yaml
  mv /etc/kubernetes/.$component.exam.yaml /etc/kubernetes/manifests/$component.yaml
 done
fi
deadline=$(($(date +%s)+180))
while test "$(date +%s)" -lt "$deadline"; do
 found=0
 for file in /proc/[0-9]*/comm; do
  test -r "$file" || continue; read -r name < "$file" || continue
  case "$name" in kube-controller|kube-scheduler)
   proc=\${file%/comm}; grep -q kubepods "$proc/cgroup" || continue
   if tr '\\0' '\\n' < "$proc/cmdline" | grep -Fxq -- '--kube-api-qps=5'; then found=$((found+1)); fi
  esac
 done
 if test "$found" = 2 && response=$(curl --fail --silent --show-error --max-time 15 --cacert /etc/kubernetes/pki/ca.crt --cert "$S2KTUX_CKA_CERT" --key "$S2KTUX_CKA_KEY" https://127.0.0.1:6443/readyz) && test "$response" = ok; then echo prepared > "$dir/complete"; exit 0; fi
 sleep 3
done
exit 1`;
 const result=await run('controlplane','Preparar la carga de los controladores antes del simulacro',command,240000);
 if(result?.ok!==true)throw Error('No se ha confirmado la configuración de los controladores del examen');
}
export async function prepararRuntimeExamen(run,context){
 if(context?.scenario!=='cka-exam'||context.fresh!==true||context.studentSession!==false)throw Error('Los plazos del examen solo se preparan en una copia nueva');
 const execute=async(label,command,timeout=120000)=>{const result=await run('controlplane',label,command,timeout);if(result?.ok!==true)throw Error(label);};
 await execute('Preparar la preempción del control plane de examen','set -eu; test -w /sys/kernel/debug/sched/preempt; echo full > /sys/kernel/debug/sched/preempt; grep -q "(full)" /sys/kernel/debug/sched/preempt');
 const dir='/var/lib/kube-lab/exam-runtime-v1',api='/etc/kubernetes/manifests/kube-apiserver.yaml';
 const threshold=path=>`awk '/^    livenessProbe:/{live=1;next} live && /^    [^ ]/{live=0} live && /failureThreshold:/{print $2}' ${path}`;
 await execute('Preparar los plazos nativos de la copia del examen',`set -eu; test ! -e ${dir}; mkdir -p /var/lib/kube-lab; mkdir -m 700 ${dir}; test "$(head -1 /etc/containerd/config.toml)" = 'version = 3'; test -z "$(grep '^\\[timeouts\\]' /etc/containerd/config.toml || true)"; test "$(${threshold(api)})" = 8; cp /etc/containerd/config.toml ${dir}/containerd.before.toml; cp ${api} ${dir}/api.before.yaml; cp /etc/containerd/config.toml /etc/containerd/.exam-runtime.toml; cat >>/etc/containerd/.exam-runtime.toml <<'EOF'

[timeouts]
  'io.containerd.timeout.shim.cleanup' = '30s'
  'io.containerd.timeout.shim.load' = '30s'
  'io.containerd.timeout.shim.shutdown' = '30s'
  'io.containerd.timeout.task.state' = '30s'
EOF
containerd --config /etc/containerd/.exam-runtime.toml config dump > ${dir}/checked.toml; sed '/^    livenessProbe:/,/^    [a-zA-Z]/s/^      failureThreshold: 8$/      failureThreshold: 30/' ${api} > /etc/kubernetes/.exam-api.yaml; test "$(${threshold('/etc/kubernetes/.exam-api.yaml')})" = 30; timeout 20s crictl ps --name kube-apiserver -q > ${dir}/api.before.id; test -s ${dir}/api.before.id`);
 try{
  await execute('Aplicar los plazos antes de iniciar las tareas','set -eu; systemctl stop kubelet; mv /etc/containerd/.exam-runtime.toml /etc/containerd/config.toml; mv /etc/kubernetes/.exam-api.yaml '+api+'; systemctl restart containerd; systemctl is-active --quiet containerd',180000);
 }finally{
  await execute('Mantener kubelet activo en la copia del examen','systemctl start kubelet && systemctl is-active --quiet kubelet',60000);
 }
 let healthy=false;
 for(let attempt=1;attempt<=2;attempt++){
  const result=await run('controlplane','Esperar la API real después de preparar el runtime · '+attempt+'/2',`set -eu; old=$(cat ${dir}/api.before.id); deadline=$(($(date +%s)+240)); while test "$(date +%s)" -lt "$deadline"; do if response=$(curl --fail --silent --show-error --max-time 10 --cacert /etc/kubernetes/pki/ca.crt --cert "$S2KTUX_CKA_CERT" --key "$S2KTUX_CKA_KEY" https://127.0.0.1:6443/readyz) && test "$response" = ok; then new=$(timeout 20s crictl ps --name kube-apiserver -q); if test -n "$new" && test "$(echo "$new" | wc -l)" = 1 && test "$new" != "$old"; then exit 0; fi; fi; sleep 3; done; exit 1`,300000);
  if(result?.ok===true){healthy=true;break;}if(result?.ok!==false)throw Error('No se recibió la salud real de la API del examen');
 }
 if(!healthy)throw Error('La API del examen no está disponible después de preparar el runtime');
 await execute('Confirmar la preparación del runtime del examen',`echo prepared > ${dir}/complete`);
}
