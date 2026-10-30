// Plazos del entorno emulado; no cambia permisos, datos ni las respuestas.
// Se aplica únicamente a una copia nueva del examen, nunca al estudio guardado.
export async function comprobarRuntimeExamen(run){
 const dir='/var/lib/kube-lab/exam-runtime-v1';
 const result=await run('controlplane','Comprobar la preparación del examen recuperado',`set -eu; test "$(cat ${dir}/complete)" = prepared; test -s ${dir}/openapi-v2.pb; grep -q '(full)' /sys/kernel/debug/sched/preempt; test "$(awk '/^    livenessProbe:/{live=1;next} live && /^    [^ ]/{live=0} live && /failureThreshold:/{print $2}' /etc/kubernetes/manifests/kube-apiserver.yaml)" = 30; containerd --config /etc/containerd/config.toml config dump | grep -q "io.containerd.timeout.task.state.*30s"; response=$(curl --fail --silent --show-error --max-time 20 --cacert /etc/kubernetes/pki/ca.crt --cert "$S2KTUX_CKA_CERT" --key "$S2KTUX_CKA_KEY" https://127.0.0.1:6443/readyz); test "$response" = ok`,60000);
 if(result?.ok!==true)throw Error('La base del examen no conserva su preparación verificada');
 const worker=await run('worker1','Comprobar la red del examen recuperado','systemctl is-active --quiet kube-lab-netns.service && mountpoint -q /run/netns',60000);
 if(worker?.ok!==true)throw Error('La red del worker no está disponible');
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
