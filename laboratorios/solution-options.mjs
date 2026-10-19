// Variantes para los mismos enunciados y recursos. No son ejercicios nuevos.
const option=(title,code,explanation)=>({title,code,explanation});
// Solo GET locales: el contenedor puede estar creado antes de escuchar por HTTP.
export const withHTTPWait=code=>code.replace(/^curl (http:\/\/localhost:\d+(?:\/\S*)?)$/gm,(_,url)=>'# Espera unos segundos si el servidor todavía está arrancando.\ncurl --fail --retry 5 --retry-all-errors \\\n  --retry-delay 1 --max-time 5 '+url);
function replace(code,from,to){if(!code.includes(from))throw Error('La solución de partida ha cambiado: '+from);return code.replace(from,to);}
function replacements(code,pairs){for(const [from,to] of pairs)code=replace(code,from,to);return code;}
const linux={
 archivo:()=>option('Permisos simbólicos',"printf 'Linux real\\n' > /root/practica.txt\nchown root:root /root/practica.txt\nchmod u=rw,g=r,o= /root/practica.txt\nstat -c '%U:%G %a' /root/practica.txt"),
 usuarios:()=>option('Añadir el grupo después',"groupadd equipo\nuseradd -m -s /bin/bash ana\nusermod -aG equipo ana\nid ana"),
 sgid:e=>option('Permisos simbólicos',replace(e.solution,'chmod 2770 /datos/equipo','chmod ug=rwx,o= /datos/equipo\nchmod g+s /datos/equipo')),
 'archivo-tar':e=>option('Compresión por la extensión',replace(e.solution,'tar -czf','tar -caf')),
 dnf:e=>option('Usar update',replace(e.solution,'upgrade lab-notas','update lab-notas')),
 'sim-03':()=>option('Crear el archivo con un editor',"vi /etc/yum.repos.d/curso.repo\n# Guarda este contenido en el editor:\n# [curso-base]\n# name=Curso RPM local\n# baseurl=file:///srv/repos/lab-base\n# enabled=1\n# gpgcheck=1\n# gpgkey=file:///srv/repos/RPM-GPG-KEY-lab\nrpm --import /srv/repos/RPM-GPG-KEY-lab\ndnf --disablerepo='*' --enablerepo=curso-base repolist"),
 'sim-05':()=>option('Añadir las pertenencias con usermod',"groupadd olimpo\nuseradd -m zeus\nuseradd -m hera\nusermod -aG olimpo zeus\nusermod -aG olimpo hera\nuseradd -m -s /usr/sbin/nologin ares\nprintf 'zeus:cambiame1\\nhera:cambiame1\\nares:cambiame1\\n' | chpasswd\nid zeus\nid hera\ngetent passwd ares"),
 'sim-06':e=>option('Permisos simbólicos',replace(e.solution,'chmod 2770 /datos/olimpo','chmod ug=rwx,o= /datos/olimpo\nchmod g+s /datos/olimpo')),
 'sim-07':()=>option('Editar el crontab',"crontab -u hera -e\n# Añade esta línea, sin el signo #:\n# * * * * * /usr/bin/logger \"Backup diario\"\nsystemctl enable --now cron\ncrontab -u hera -l\n# Espera al siguiente minuto.\njournalctl --no-pager -t hera --since '-3 minutes'"),
 'sim-08':e=>option('Compresión por la extensión',replace(e.solution,'tar -cjf','tar -caf')),
 'sim-09':e=>option('Aplicar las ACL por separado',replace(e.solution,'setfacl -m u:zeus:rw-,u:ares:--- /var/tmp/hosts','setfacl -m u:zeus:rw- /var/tmp/hosts\nsetfacl -m u:ares:--- /var/tmp/hosts')),
 'sim-12':()=>option('Con sed',"sed -n '/rich/p' /usr/share/dict/words > /root/coincidencias\ncat /root/coincidencias"),
 'sim-13':()=>option('Contraseña interactiva',"useradd -m -u 4120 apolo\npasswd apolo\n# Escribe orquidea3 dos veces.\nid apolo"),
 'sim-14':()=>option('Editar con visudo',"visudo -f /etc/sudoers.d/zeus\n# Añade esta línea, sin el signo #:\n# zeus ALL=(ALL:ALL) NOPASSWD: ALL\nchmod 440 /etc/sudoers.d/zeus\nvisudo -cf /etc/sudoers\nrunuser -u zeus -- sudo -n id -u"),
 'sim-15':e=>option('Indicar el tamaño equivalente',replace(e.solution,'lvcreate -l 60 -n appvol datavg','lvcreate -L 240M -n appvol datavg'),'Con extents de 4 MiB, 60 extents son 240 MiB. El resto de la preparación no cambia.'),
 'sim-17':e=>option('Reducir ext4 y después el LV',replace(e.solution,'lvreduce -r -L 248M /dev/datavg/reducible','e2fsck -f /dev/datavg/reducible\nresize2fs /dev/datavg/reducible 248M\nlvreduce -L 248M /dev/datavg/reducible'),'Con el sistema de archivos desmontado, reduce primero ext4 y después el volumen. No inviertas ese orden.'),
 'sim-19':()=>option('Escribir el script con heredoc',"cat > /usr/local/bin/saludo <<'EOF'\n#!/bin/bash\nprintf '%s\\n' 'Hola equipo olimpo'\nEOF\nchmod 755 /usr/local/bin/saludo\n/usr/local/bin/saludo"),
};
const docker={
 primer:()=>option('Crear y después iniciar',"docker create --name primer-alpine alpine:3.23 sleep 3600\ndocker start primer-alpine\ndocker ps"),
 ciclo:e=>option('Separar create y start',replace(e.solution,'docker run -d --name ciclo alpine:3.23 sleep 3600','docker create --name ciclo alpine:3.23 sleep 3600\ndocker start ciclo')),
 web:e=>option('Crear y después iniciar',replace(e.solution,'docker run -d --name web -p 8080:80 s2ktux/nginx-lab:2','docker create --name web -p 8080:80 s2ktux/nginx-lab:2\ndocker start web')),
 diagnostico:()=>option('Subcomandos container',"docker container inspect web\ndocker container logs web\ndocker container top web\ndocker container port web"),
 build:e=>option('Construir desde el directorio',replace(e.solution,'docker build -t miweb:v1 /root/miweb','cd /root/miweb\ndocker build -f Dockerfile -t miweb:v1 .')),
 'build-run':e=>option('Crear y después iniciar',replace(e.solution,'docker run -d --name miweb-app -p 8081:80 miweb:v1','docker create --name miweb-app -p 8081:80 miweb:v1\ndocker start miweb-app')),
 exportar:e=>option('Exportar mediante redirección',replace(e.solution,'docker save -o /root/miweb-1.0.tar alumno/miweb:1.0','docker save alumno/miweb:1.0 > /root/miweb-1.0.tar')),
 volumen:e=>option('Usar --mount',replace(e.solution,'-v datos:/var/lib/app','--mount type=volume,source=datos,target=/var/lib/app')),
 bind:e=>option('Usar --mount',replace(e.solution,'-v /root/site:/usr/share/nginx/html','--mount type=bind,source=/root/site,target=/usr/share/nginx/html')),
 red:()=>option('Conectar después de crear',"docker network create labnet\ndocker run -d --name backend s2ktux/nginx-lab:2\ndocker run -d --name frontend alpine:3.23 sleep 3600\ndocker network connect labnet backend\ndocker network connect labnet frontend\ndocker exec frontend wget -qO- http://backend/\ndocker network inspect labnet"),
 limites:()=>option('Aplicar los límites con update',"docker run -d --name limitado s2ktux/nginx-lab:2\ndocker update --memory 256m --memory-swap 512m --cpus 0.5 --restart unless-stopped limitado\ndocker stats --no-stream limitado"),
 compose:e=>option('Crear servicios y después iniciarlos',replace(e.solution,'docker compose -p tienda up -d','docker compose -p tienda create\ndocker compose -p tienda start')),
 'tarea-logs':e=>option('Crear y arrancar con salida adjunta',replace(e.solution,"docker run --name tarea-logs alpine:3.23 sh -c 'echo Inicio; echo Finalizada; exit 7'","docker create --name tarea-logs alpine:3.23 sh -c 'echo Inicio; echo Finalizada; exit 7'\ndocker start -a tarea-logs")),
 load:e=>option('Usar entrada y salida estándar',replacements(e.solution,[['docker save -o /root/alpine-copia.tar archivo/alpine:1','docker save archivo/alpine:1 > /root/alpine-copia.tar'],['docker load -i /root/alpine-copia.tar','docker load < /root/alpine-copia.tar']])),
 recrear:e=>option('Montajes explícitos',e.solution.replaceAll('-v datos-recuperados:/datos','--mount type=volume,source=datos-recuperados,target=/datos')),
 sololectura:e=>option('Montaje explícito de solo lectura',replace(e.solution,'-v /root/sololectura:/usr/share/nginx/html:ro','--mount type=bind,source=/root/sololectura,target=/usr/share/nginx/html,readonly')),
 registro:e=>option('Volumen con --mount',replace(e.solution,'-v registro-datos:/var/lib/registry','--mount type=volume,source=registro-datos,target=/var/lib/registry')),
 'compose-build':e=>option('Construir antes de desplegar',replace(e.solution,'docker compose -p repaso up -d --build','docker compose -p repaso build\ndocker compose -p repaso up -d')),
};
const image='busybox:1.37.0-musl';
const pod=(name,command,policy='Always')=>`kubectl apply -f - <<'EOF'\napiVersion: v1\nkind: Pod\nmetadata:\n  name: ${name}\n  namespace: default\nspec:\n  restartPolicy: ${policy}\n  containers:\n    - name: app\n      image: ${image}\n      imagePullPolicy: Never\n      command: ${JSON.stringify(command)}\nEOF`;
const service=(name,nodePort)=>`kubectl apply -f - <<'EOF'\napiVersion: v1\nkind: Service\nmetadata:\n  name: ${name}\n  namespace: default\nspec:\n  type: ${nodePort?'NodePort':'ClusterIP'}\n  selector:\n    app: ${name}\n  ports:\n    - port: 80\n      targetPort: 8080${nodePort?'\n      nodePort: '+nodePort:''}\nEOF`;
function kubernetes(e){
 const code=e.solutionDisplay||e.solution;
 const basic={
  'c00-a':()=>option('Ver también las direcciones',"kubectl get nodes -o wide > /root/nodos-curso.txt\ncat /root/nodos-curso.txt"),
  'c00-b':()=>option('Listado ampliado',"kubectl get pods -n kube-system -o wide > /root/control-plane.txt\ncat /root/control-plane.txt"),
  'c01-a':()=>option('Listado ampliado',"kubectl get nodes -o wide > /root/laboratorio-nodos.txt\nkubectl get --raw=/readyz > /root/laboratorio-api.txt"),
  'c01-b':()=>option('Consultar uno cada vez',"systemctl is-active kubelet > /root/servicios-laboratorio.txt\nsystemctl is-active containerd >> /root/servicios-laboratorio.txt\ncat /root/servicios-laboratorio.txt"),
  'c02-a':()=>option('Con un manifiesto',pod('saludo',['sh','-c','echo Hola Kubernetes'],'Never')+"\nkubectl -n default wait --for=jsonpath='{.status.phase}'=Succeeded pod/saludo --timeout=120s"),
  'c02-b':()=>option('Con un manifiesto',pod('utilidades',['sleep','3600'])+"\nkubectl -n default wait --for=condition=Ready pod/utilidades --timeout=120s\nkubectl -n default exec utilidades -- sh -c 'echo PRACTICA_PODS >/tmp/mensaje.txt'"),
  'c03-a':()=>option('Crear una réplica y escalar',replace(code,'replicas: 2','replicas: 1').replace("kubectl -n default wait",'kubectl -n default scale rs replicas --replicas=2\nkubectl -n default wait')),
  'c03-b':()=>option('Modificar el número con patch',replace(code,'kubectl -n default scale rs taller --replicas=3',`kubectl -n default patch rs taller --type=merge -p '{"spec":{"replicas":3}}'`)),
  'c05-a':()=>option('Con un manifiesto',service('web-servicio')+'\nkubectl -n default exec deployment/web-servicio -- wget -T 5 -qO- http://web-servicio.default.svc.cluster.local/'),
  'c05-b':()=>option('Crear y editar el Service','kubectl -n default expose deployment externa --type=NodePort --port=80 --target-port=8080\nkubectl -n default edit service externa\n# Cambia nodePort a 30081, guarda y sal.\ncurl --max-time 10 http://10.77.0.10:30081/'),
 };
 if(basic[e.id])return [basic[e.id]()];
 if(e.id==='c07-a')return [option('Cantidades equivalentes',code.replaceAll('"50m"','"0.05"').replaceAll('"16Mi"','"16777216"').replaceAll('"200m"','"0.2"').replaceAll('"64Mi"','"67108864"'))];
 if(['c09-a','c09-b'].includes(e.id)&&e.alternative)return [option('Puertos con nombre',e.alternativeDisplay||e.alternative)];
 if(['c10-a','c10-b','c11-a','c11-b'].includes(e.id)&&e.alternative){
  const alternate=(e.alternativeDisplay||e.alternative).split('\n').slice(1).join('\n');
  const creation=e.id==='c11-b'?'':code.split('\n')[0]+'\n';
  return [option(e.id.endsWith('a')?'Usar envFrom':'Volumen projected',creation+alternate)];
 }
 return [];
}
export function solutionsFor(mode,exercise){
 if(exercise.sourceId&&exercise.sourceId!==exercise.id)return solutionsFor(mode,{...exercise,id:exercise.sourceId,sourceId:undefined});
 if(mode==='linux'&&exercise.id==='sim-01'){
  const [first,rest]=exercise.solution.split('# ALTERNATIVA (no hagas ambos métodos):');
  if(rest){const marker='# Tras cualquiera de los dos métodos',index=rest.indexOf(marker),tail=index<0?'':rest.slice(index);return [option('rd.break',first.trim()+'\n\n'+tail),option('init=/bin/bash',(index<0?rest:rest.slice(0,index)).trim()+'\n\n'+tail)];}
 }
 const first=option('',exercise.solutionDisplay||exercise.solution,exercise.explanation);
 const extras=mode==='kubernetes'?kubernetes(exercise):((mode==='linux'?linux:docker)[exercise.id]?[ (mode==='linux'?linux:docker)[exercise.id](exercise) ]:[]);
 return [first,...extras];
}
