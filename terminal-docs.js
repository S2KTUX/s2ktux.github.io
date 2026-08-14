(function(){
  const linux=[
    ['Navegación y rutas','pwd · cd · ls -la · find','Usa rutas absolutas desde / o relativas desde el directorio actual. find recorre el árbol; combina su salida con grep cuando necesites filtrar.'],
    ['Permisos clásicos','chmod 640 fichero · chown usuario:grupo fichero','Los tres bloques representan propietario, grupo y otros. En directorios, x permite atravesar; el bit SGID conserva el grupo en contenido nuevo.'],
    ['ACL','getfacl ruta · setfacl -m u:ana:rw ruta','Las ACL añaden permisos para usuarios o grupos concretos sin alterar el propietario. Comprueba siempre la máscara efectiva con getfacl.'],
    ['Usuarios y grupos','useradd · usermod -aG · passwd · chage','-aG añade grupos suplementarios sin reemplazar los existentes. Revisa UID, GID y grupos con id.'],
    ['Servicios systemd','systemctl enable --now servicio','enable afecta al próximo arranque; start al estado actual. --now hace ambas cosas. Usa status y journalctl -u para diagnosticar.'],
    ['Almacenamiento LVM','pvcreate → vgcreate → lvcreate → mkfs → mount','LVM separa el almacenamiento físico del lógico. Para persistir un montaje añade una entrada correcta a /etc/fstab y prueba mount -a.'],
    ['Red con NetworkManager','nmcli con mod · nmcli con up','Configura método, dirección/prefijo, gateway y DNS sobre el perfil; después actívalo y comprueba con ip a e ip route.'],
    ['SELinux','getenforce · semanage · restorecon','No desactives SELinux para resolver un acceso. Ajusta booleanos, puertos o contextos persistentes y restaura etiquetas.'],
    ['Logs y procesos','ps -ef · top · journalctl -u servicio','Aísla primero el proceso o la unidad. Los logs explican el motivo; reiniciar sin leerlos puede ocultar el síntoma.'],
    ['Recuperación RHCSA','GRUB → rd.break → chroot /sysroot','En recuperación, remonta /sysroot en lectura-escritura, entra con chroot, cambia la contraseña y fuerza el reetiquetado de SELinux.']
  ];
  const docker=[
    ['Instalación del motor','curl -fsSL https://get.docker.com | sh','Instala Engine, CLI, containerd, Buildx y Compose. Después habilita y arranca docker con systemctl enable --now docker.'],
    ['Comprobar el daemon','docker version · docker info','version distingue cliente y servidor. Si el daemon está detenido, el cliente responde con un error de conexión al socket.'],
    ['Imágenes','docker pull · images · inspect · history','Una imagen es inmutable y está formada por capas. Usa etiquetas explícitas; latest no significa necesariamente la versión más reciente.'],
    ['Construcción','docker build -t miapp:v1 .','El contexto de build se envía al daemon. Ordena el Dockerfile para reutilizar caché y usa .dockerignore para excluir contenido.'],
    ['Contenedores','docker run -d --name web -p 8080:80 nginx','run crea y arranca. ps muestra los activos; ps -a todos. logs, exec e inspect sirven para investigar el proceso aislado.'],
    ['Persistencia','docker volume create datos · docker run -v datos:/data','Los volúmenes sobreviven al contenedor. Un bind mount enlaza una ruta concreta del host y requiere una ruta absoluta.'],
    ['Redes','docker network create appnet','En una red bridge creada por el usuario, los contenedores se resuelven por nombre. Publicar un puerto conecta host:contenedor.'],
    ['Recursos y reinicio','--memory 256m --cpus 0.5 --restart unless-stopped','Los límites protegen el host. Comprueba el consumo con docker stats y el estado configurado con docker inspect.'],
    ['Compose','docker compose up -d · ps · logs · down','Compose describe una aplicación de varios servicios. up reconcilia el estado; down retira sus contenedores y red, no los volúmenes salvo -v.'],
    ['Mantenimiento seguro','docker system df · container prune · image prune','Mide antes de borrar. Las limpiezas selectivas reducen el riesgo de eliminar datos o imágenes todavía necesarias.']
  ];
  const kubernetes=[
    ['Contexto de examen','kubectl config current-context · get-contexts','Antes de modificar recursos, confirma clúster, usuario y namespace. En el CKA, trabajar en el contexto equivocado invalida una solución correcta.'],
    ['Consulta eficiente','kubectl get pods -A -o wide','-A cruza namespaces; -o wide añade nodo e IP. Usa jsonpath para extraer campos precisos sin leer todo el YAML.'],
    ['Trabajo declarativo','kubectl apply -f recurso.yaml','Describe el estado deseado en YAML. apiVersion, kind, metadata y spec forman la base; valida nombres, indentación y namespace.'],
    ['Deployments y rollout','kubectl set image · rollout status/history/undo','Un Deployment gestiona ReplicaSets. Observa el rollout antes de continuar y usa undo si la nueva revisión no queda disponible.'],
    ['Scheduling','label · taint · nodeSelector · tolerations','Las etiquetas atraen mediante selectores o afinidad. Los taints repelen Pods que no tengan una toleration compatible.'],
    ['Mantenimiento de nodos','cordon → drain → uncordon','cordon impide nuevos Pods; drain evacua cargas respetando controladores; uncordon devuelve el nodo al planificador.'],
    ['Storage','StorageClass · PV · PVC','El Pod consume un PVC; el claim enlaza un PV. Comprueba capacidad, modo de acceso, clase y estado Bound.'],
    ['Servicios y DNS','kubectl expose · get svc · describe svc','Un Service selecciona Pods por labels. Si no tiene endpoints, compara selector del Service y etiquetas reales de los Pods.'],
    ['RBAC mínimo','kubectl auth can-i · Role · RoleBinding','Concede solo verbos y recursos necesarios. Valida como el ServiceAccount objetivo con --as antes de dar la tarea por resuelta.'],
    ['Troubleshooting','describe · logs --previous · events','Empieza por estado y eventos, después logs. Pending suele apuntar a scheduling o storage; CrashLoopBackOff, al proceso o configuración.'],
    ['Salud del nodo','systemctl status kubelet · journalctl -u kubelet','Un nodo NotReady exige revisar kubelet, runtime, red y certificados desde el propio nodo, no solo desde kubectl.'],
    ['Administración','kubeadm upgrade plan · etcdctl snapshot save','Planifica upgrades por versiones soportadas y protege el estado del clúster con un snapshot de etcd verificado.']
  ];
  const convert=a=>a.map(x=>({title:x[0],command:x[1],text:x[2]}));
  window.S2K_TERMINAL_DOCS={linux:convert(linux),docker:convert(docker),kubernetes:convert(kubernetes)};
  window.dispatchEvent(new Event('s2k-docs-ready'));
})();
