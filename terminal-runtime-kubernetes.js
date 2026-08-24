const basePackages = [
  'bash','coreutils','glibc','systemd','dnf','rpm','util-linux','findutils',
  'procps-ng','iproute','iputils','NetworkManager','openssh-server',
  'openssh-clients','curl','tar','gzip','bzip2','vim-minimal','nano',
  'kubectl','kubelet','kubeadm','etcd','cri-tools','jq'
];

export default {
  mode: 'kubernetes',
  profile: {
    initialUser: 'root',
    cwd: ['root'],
    packages: basePackages,
    motd: 'CKA practice cluster — control-plane',
    network: { up:true, ip:'10.10.0.10', prefix:24, gw:'10.10.0.1', dns:'10.96.0.10', method:'auto', autoconnect:true }
  },
  manuals: {
    kubectl:{name:'kubectl - controla un clúster de Kubernetes',sec:'1',s:'kubectl [OPCIONES] SUBCOMANDO',d:'Consulta y modifica recursos de Kubernetes mediante el API server del contexto activo.',o:[['-n, --namespace NOMBRE','selecciona el namespace'],['get','lista recursos'],['describe','muestra estado y eventos detallados'],['apply -f FICHERO','aplica recursos declarativos'],['logs','consulta registros de un contenedor'],['exec -- ORDEN','ejecuta una orden en un contenedor']],e:'kubectl -n kube-system get pods'},
    kubeadm:{name:'kubeadm - crea y actualiza clústeres Kubernetes',sec:'8',s:'kubeadm SUBCOMANDO',d:'Inicializa nodos del control plane, une workers y planifica actualizaciones del clúster.',o:[['upgrade plan','muestra actualizaciones disponibles'],['upgrade apply VERSIÓN','actualiza el control plane']],e:'kubeadm upgrade plan'},
    kubelet:{name:'kubelet - agente de nodo Kubernetes',sec:'8',s:'kubelet [--version]',d:'Agente que registra el nodo y garantiza que los Pods asignados mantienen el estado solicitado. Normalmente se administra con systemd.',o:[['--version','muestra la versión']],e:'systemctl status kubelet'},
    crictl:{name:'crictl - cliente de runtimes CRI',sec:'1',s:'crictl SUBCOMANDO',d:'Inspecciona Pods, contenedores, imágenes y registros a través de la Container Runtime Interface.',o:[['ps [-a]','lista contenedores'],['pods','lista sandboxes de Pods'],['images','lista imágenes'],['logs ID','consulta registros'],['inspect ID','muestra detalles']],e:'crictl ps -a'},
    etcdctl:{name:'etcdctl - cliente de etcd',sec:'1',s:'etcdctl SUBCOMANDO',d:'Consulta la salud de etcd y crea o valida snapshots de su base de datos.',o:[['endpoint health','comprueba la salud'],['snapshot save RUTA','guarda un snapshot'],['snapshot status RUTA','valida un snapshot']],e:'etcdctl endpoint health'}
  },
  manualBriefs: {
    kubectl:['controla un clúster de Kubernetes','kubectl get|apply|describe ...','Cliente de Kubernetes.'],
    kubeadm:['administra el ciclo de vida del clúster','kubeadm upgrade plan|apply','Inicializa y actualiza clústeres.'],
    kubelet:['agente de un nodo Kubernetes','kubelet --version','Mantiene en ejecución los Pods asignados al nodo.'],
    crictl:['inspecciona el runtime CRI','crictl ps|pods|images|logs','Cliente de diagnóstico de contenedores CRI.'],
    etcdctl:['administra etcd','etcdctl endpoint health|snapshot ...','Comprueba y respalda el almacén del clúster.']
  },
  completions: {
    kubectl:['get','run','create','apply','expose','scale','autoscale','edit','describe','delete','logs','exec','events','version','config','cluster-info','rollout','cordon','drain','uncordon','label','taint','top','auth','-n','--namespace'],
    kubeadm:['version','upgrade','token','join','init','reset'],
    crictl:['ps','pods','images','logs','inspect','exec','stats','version'],
    etcdctl:['endpoint','snapshot']
  },
  createCommands(ctx) {
    const s=ctx.state, {out,outMany,err}=ctx.io;
    const {K8S_FULL,K8S_MAJOR,K8S_MINOR,K8S_UPGRADE,ARCH}=ctx.system;
    const cid=p=>('sha256:'+String(p.name).split('').reduce((a,c)=>((a*33+c.charCodeAt(0))>>>0),5381).toString(16).padStart(12,'0')).slice(0,19);
    const findPod=ref=>s.k8s.pods.find(p=>p.name===ref||cid(p).includes(ref||'~'));
    return {
      kubelet({args}) {
        if(args.includes('--version')||args.includes('version'))out('Kubernetes '+K8S_FULL);
        else if(args.includes('--help'))out('The kubelet is the primary "node agent" that runs on each node.\nUsage: kubelet [flags]');
        else err('E: kubelet debe administrarse como servicio; usa systemctl status kubelet');
      },
      crictl({args}) {
        const sub=args[0]||'';
        if(sub==='--version')out('crictl version '+K8S_FULL);
        else if(sub==='version')out('Version:  0.1.0\nRuntimeName:  containerd\nRuntimeVersion:  1.7.22\nRuntimeApiVersion:  v1');
        else if(sub==='info')out(JSON.stringify({config:{containerd:{snapshotter:'overlayfs'}},runtimeType:'io.containerd.runc.v2',status:{conditions:[{type:'RuntimeReady',status:true},{type:'NetworkReady',status:true}]}},null,2));
        else if(sub==='pods'){out('POD ID'.padEnd(21)+'CREATED'.padEnd(15)+'STATE'.padEnd(12)+'NAME'.padEnd(32)+'NAMESPACE');s.k8s.pods.forEach(p=>out(cid(p).slice(7).padEnd(21)+'12 minutes ago'.padEnd(15)+(p.status==='Running'?'Ready':'NotReady').padEnd(12)+p.name.padEnd(32)+p.namespace));}
        else if(sub==='ps'){out('CONTAINER'.padEnd(18)+'IMAGE'.padEnd(18)+'CREATED'.padEnd(15)+'STATE'.padEnd(12)+'NAME'.padEnd(28)+'POD ID');s.k8s.pods.filter(p=>args.includes('-a')||p.status==='Running').forEach(p=>out(cid(p).slice(7,19).padEnd(18)+p.image.slice(0,16).padEnd(18)+'12 minutes ago'.padEnd(15)+(p.status==='Running'?'Running':'Exited').padEnd(12)+p.name.slice(0,26).padEnd(28)+cid(p).slice(7,19)));}
        else if(sub==='images'){out('IMAGE'.padEnd(48)+'TAG'.padEnd(12)+'IMAGE ID'.padEnd(18)+'SIZE');[...new Set(s.k8s.pods.map(p=>p.image))].forEach(image=>{const [repo,tag='latest']=image.split(':');out(repo.padEnd(48)+tag.padEnd(12)+Math.random().toString(16).slice(2,14).padEnd(18)+'48.2MB');});}
        else if(sub==='logs'){const p=findPod(args.filter(a=>!a.startsWith('-'))[1]);if(!p){err('E'+new Date().toISOString()+' log.go:32] container not found',1);return;}if(p.status==='CrashLoopBackOff')out('FATAL: required environment variable DATABASE_URL is not set','#ef8a7a');else out(new Date().toISOString()+' INFO container '+p.name+' ready');}
        else if(sub==='inspect'||sub==='inspectp'){const p=findPod(args[1]);if(!p){err('FATA[0000] container or pod not found');return;}out(JSON.stringify({status:{id:cid(p),metadata:{name:p.name,namespace:p.namespace},state:p.status,image:{image:p.image},labels:p.labels||{}}},null,2));}
        else if(sub==='stats'){out('CONTAINER'.padEnd(18)+'CPU %'.padEnd(10)+'MEM'.padEnd(14)+'DISK'.padEnd(14)+'INODES');s.k8s.pods.filter(p=>p.status==='Running').forEach((p,i)=>out(cid(p).slice(7,19).padEnd(18)+(0.15+i*0.07).toFixed(2).padEnd(10)+((24+i*7)+'MB').padEnd(14)+((3+i)+'MB').padEnd(14)+String(120+i*17)));}
        else if(sub==='exec'){const ref=args[1],p=findPod(ref);if(!p){err('FATA[0000] container not found');return;}if(p.status!=='Running'){err('FATA[0000] container is not running');return;}const inside=args.slice(2);if(!inside.length){err('FATA[0000] command is required');return;}if(inside[0]==='whoami')out('root');else if(inside[0]==='hostname')out(p.name);else if(inside[0]==='cat'&&inside[1]==='/etc/hostname')out(p.name);else out('command executed in '+p.name+': '+inside.join(' '));}
        else out('NAME:\n   crictl - client for CRI-compatible container runtimes\n\nCOMMANDS:\n   ps, pods, images, logs, inspect, inspectp, stats, exec, info, version');
      },
      kubeadm({args}) {
        if(args[0]==='version'||args[0]==='--version')out('kubeadm version: &version.Info{Major:"'+K8S_MAJOR+'", Minor:"'+K8S_MINOR+'", GitVersion:"'+K8S_FULL+'", GitCommit:"rocky-lab", GitTreeState:"clean", BuildDate:"2026-08-01T00:00:00Z", GoVersion:"go1.25", Compiler:"gc", Platform:"linux/'+(ARCH==='x86_64'?'amd64':ARCH)+'"}');
        else if(args[0]==='upgrade'&&args[1]==='plan'){outMany(['[upgrade/config] Making sure the configuration is correct:','[preflight] Running pre-flight checks.','[upgrade] Fetching available versions to upgrade to','Components that must be upgraded manually after you have upgraded the control plane with kubeadm upgrade apply:','COMPONENT   CURRENT       TARGET','kubelet     3 x '+K8S_FULL+'  '+K8S_UPGRADE,'','You can now apply the upgrade by executing:','  kubeadm upgrade apply '+K8S_UPGRADE]);if(!s.k8s.actions.includes('upgrade-plan'))s.k8s.actions.push('upgrade-plan');}
        else if(args[0]==='upgrade'&&args[1]==='apply'){const v=args[2]||K8S_UPGRADE;out('[upgrade/successful] SUCCESS! Your cluster was upgraded to "'+v+'". Enjoy!','#8fa876');s.k8s.nodes[0].version=v;s.k8s.upgraded=true;if(!s.k8s.actions.includes('upgrade'))s.k8s.actions.push('upgrade');}
        else if(args[0]==='token'&&args[1]==='create'){out('abcdef.0123456789abcdef');if(args.includes('--print-join-command'))out('kubeadm join 10.10.0.10:6443 --token abcdef.0123456789abcdef --discovery-token-ca-cert-hash sha256:3f6a9c0d...');}
        else if(args[0]==='init'){outMany(['[init] Using Kubernetes version: '+K8S_FULL,'[preflight] Running pre-flight checks','[certs] Using certificateDir folder "/etc/kubernetes/pki"','[kubeconfig] Writing "admin.conf" kubeconfig file','[control-plane] Creating static Pod manifests','[kubelet-start] Starting the kubelet','[addons] Applied essential addon: CoreDNS','','Your Kubernetes control-plane has initialized successfully!']);if(!s.k8s.nodes.some(n=>n.name==='control-plane'))s.k8s.nodes.unshift({name:'control-plane',status:'Ready',role:'control-plane',version:K8S_FULL,schedulable:true,labels:{'node-role.kubernetes.io/control-plane':''},taints:['node-role.kubernetes.io/control-plane:NoSchedule']});}
        else if(args[0]==='join'){const host='worker-'+(s.k8s.nodes.filter(n=>n.role==='<none>').length+1);outMany(['[preflight] Running pre-flight checks','[kubelet-start] Starting the kubelet','This node has joined the cluster:','* Certificate signing request was sent to apiserver and a response was received.']);if(!s.k8s.nodes.some(n=>n.name===host))s.k8s.nodes.push({name:host,status:'Ready',role:'<none>',version:K8S_FULL,schedulable:true,labels:{'kubernetes.io/hostname':host},taints:[]});}
        else if(args[0]==='reset'){outMany(['[preflight] Running pre-flight checks','[reset] Deleted contents of the etcd data directory','[reset] Stopping the kubelet service','[reset] Deleting contents of directories: /etc/kubernetes/manifests /etc/kubernetes/pki']);s.k8s.pods=s.k8s.pods.filter(p=>p.namespace!=='kube-system');}
        else out('kubeadm: usa init | join | reset | upgrade plan | upgrade apply '+K8S_UPGRADE+' | token create');
      },
      etcdctl({args}) {
        if(args[0]==='snapshot'&&args[1]==='save'){
          const p=args[2]||'/root/etcd-snapshot.db', seg=ctx.fs.norm(p), par=ctx.fs.getParent(seg);
          if(!par||par.type!=='dir'){err('Error: cannot write snapshot to '+p);return;}
          par.children[seg[seg.length-1]]=ctx.fs.file('ETCD_SNAPSHOT:v3.5.13:'+new Date().toISOString(),{owner:'root',group:'root'});
          s.k8s.etcdSnapshot=true;if(!s.k8s.actions.includes('etcd-snapshot'))s.k8s.actions.push('etcd-snapshot');
          out('{"level":"info","msg":"saved","path":"'+p+'"}');out('Snapshot saved at '+p,'#8fa876');
        } else if(args[0]==='snapshot'&&args[1]==='status')out('b9e2a29f, 584291, 25 MB, 25 MB');
        else if(args[0]==='endpoint'&&args[1]==='health')out('https://127.0.0.1:2379 is healthy: successfully committed proposal: took = 4.8ms','#8fa876');
        else if(args[0]==='endpoint'&&args[1]==='status'){out('https://127.0.0.1:2379, 8e9e05c52164694d, 3.5.13, 25 MB, true, false, 584291, 584291, 584291');out('ENDPOINT                 ID                 VERSION  DB SIZE  IS LEADER  RAFT TERM');out('https://127.0.0.1:2379  8e9e05c52164694d  3.5.13   25 MB    true       8');}
        else out('etcdctl: usa snapshot save RUTA | snapshot status RUTA | endpoint health | endpoint status');
      }
    };
  },
  createChallenges(ctx) {
    const s=ctx.state;
    return [
      {badge:'CKA · CONTEXTO',title:'Orienta tu sesión de examen',goal:'Identifica el contexto activo, los contextos disponibles, los datos básicos del clúster y el estado de todos sus nodos, sin modificar ningún recurso.',check:()=>s.history.some(h=>h==='kubectl config current-context')&&s.history.some(h=>h==='kubectl config get-contexts')&&s.k8s.actions.includes('cluster-info')&&s.k8s.actions.includes('get-nodes')?{ok:true,msg:'Contexto y clúster identificados.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'CKA · NAMESPACES',title:'Trabaja en un namespace aislado',goal:'Crea el namespace <b>cka-lab</b> y ejecuta dentro un Pod <b>shell</b> con nginx.',check:()=>s.k8s.namespaces.includes('cka-lab')&&s.k8s.pods.some(p=>p.name==='shell'&&p.namespace==='cka-lab')?{ok:true,msg:'Namespace y Pod aislados correctamente.'}:{ok:false,msg:'Falta cka-lab o el Pod shell dentro de él.'}},
      {badge:'CKA · WORKLOADS',title:'Despliega una aplicación altamente disponible',goal:'Crea <b>frontend</b> con nginx, escálalo a <b>3 réplicas</b> y expónlo mediante un Service en el namespace default.',check:()=>s.k8s.deployments.some(d=>d.name==='frontend'&&d.replicas===3)&&s.k8s.services.some(x=>x.name==='frontend')?{ok:true,msg:'Frontend desplegado, escalado y expuesto.'}:{ok:false,msg:'Falta Deployment, réplicas o Service frontend.'}},
      {badge:'CKA · ROLLOUT',title:'Actualiza y revierte una versión',goal:'Cambia la imagen del Deployment <b>frontend</b>, verifica el despliegue, revisa su historial y devuelve finalmente la carga a la revisión anterior.',check:()=>s.k8s.actions.includes('rollout')&&s.history.some(h=>/^kubectl rollout status .*frontend/.test(h))&&s.history.some(h=>/^kubectl rollout history .*frontend/.test(h))&&s.history.some(h=>/^kubectl rollout undo .*frontend/.test(h))?{ok:true,msg:'Rollout inspeccionado y revertido.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'CKA · CONFIGURACIÓN',title:'Configura una aplicación sin reconstruirla',goal:'Crea <b>app-config</b> y <b>app-secret</b> a partir de valores literales. Después deja funcionando el recurso definido en <b>/root/manifests/pod-config.yaml</b>.',check:()=>s.k8s.configmaps.some(x=>x.name==='app-config')&&s.k8s.secrets.some(x=>x.name==='app-secret')&&s.k8s.pods.some(x=>x.name==='app-configurada')?{ok:true,msg:'ConfigMap, Secret y Pod configurado creados.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'CKA · DECLARATIVO',title:'Corrige un manifiesto antes de aplicarlo',goal:'Examina y edita el Pod de ejemplo para usar una imagen válida; aplícalo y verifica que queda Running.',check:()=>{const p=s.k8s.pods.find(x=>x.name==='app-configurada');return p&&p.status==='Running'&&s.k8s.actions.includes('apply-pod')?{ok:true,msg:'Manifiesto válido aplicado.'}:{ok:false,msg:'El Pod todavía no está aplicado y Running.'};}},
      {badge:'CKA · SCHEDULING',title:'Etiqueta y tainta un nodo',goal:'Marca <b>worker-1</b> con la etiqueta <b>entorno=produccion</b>, aplica un taint a <b>worker-2</b> y verifica el estado resultante de ambos nodos.',check:()=>{const w=s.k8s.nodes.find(n=>n.name==='worker-1');return w&&w.labels.entorno==='produccion'&&s.k8s.actions.includes('taint-node')&&s.k8s.actions.includes('describe-node')?{ok:true,msg:'Labels, taint y comprobación completados.'}:{ok:false,msg:'El objetivo todavía no está completo.'};}},
      {badge:'CKA · MANTENIMIENTO',title:'Drena y devuelve un nodo al servicio',goal:'Retira <b>worker-1</b> de la planificación, evacúa sus cargas con seguridad y reincorpóralo. Al terminar debe aceptar nuevas cargas.',check:()=>{const n=s.k8s.nodes.find(x=>x.name==='worker-1');return n&&n.schedulable&&['cordon','drain','uncordon'].every(a=>s.k8s.actions.includes(a))?{ok:true,msg:'Mantenimiento del nodo completado.'}:{ok:false,msg:'El objetivo todavía no está completo.'};}},
      {badge:'CKA · STORAGE',title:'Aprovisiona almacenamiento persistente',goal:'Pon en servicio los recursos definidos en <b>/root/manifests/storage.yaml</b>. El claim <b>datos-app</b> debe quedar enlazado y debes revisar el volumen, el claim y la clase de almacenamiento.',check:()=>s.k8s.pvcs.some(x=>x.name==='datos-app'&&x.status==='Bound')&&s.k8s.storageclasses.some(x=>x.name==='cka-local')&&s.history.some(h=>/^kubectl get pv/.test(h))&&s.history.some(h=>/^kubectl describe pvc datos-app/.test(h))?{ok:true,msg:'Almacenamiento creado y comprobado.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'CKA · SERVICIOS',title:'Diagnostica el acceso a frontend',goal:'Inspecciona el Service <b>frontend</b>, lista sus recursos y confirma que selecciona el Deployment correcto.',check:()=>s.k8s.services.some(x=>x.name==='frontend')&&s.history.some(h=>/^kubectl get (svc|service|services)/.test(h))&&s.history.some(h=>/^kubectl describe (svc|service) frontend/.test(h))?{ok:true,msg:'Service frontend inspeccionado.'}:{ok:false,msg:'Falta get o describe del Service frontend.'}},
      {badge:'CKA · INGRESS Y POLICIES',title:'Publica y restringe la aplicación',goal:'Pon en servicio los recursos de <b>/root/manifests/network.yaml</b> y verifica que tanto el Ingress como la NetworkPolicy existen con la configuración esperada.',check:()=>s.k8s.ingresses.some(x=>x.name==='app-ingress')&&s.k8s.networkpolicies.some(x=>x.name==='solo-lab')&&s.history.some(h=>/^kubectl get (ing|ingress)/.test(h))&&s.history.some(h=>/^kubectl get (netpol|networkpolicy)/.test(h))?{ok:true,msg:'Ingress y política de red aplicados y comprobados.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'CKA · RBAC',title:'Concede solo lectura sobre Pods',goal:'Crea la ServiceAccount <b>auditor</b> y concédele únicamente lectura de Pods mediante la Role <b>pod-reader</b> y el RoleBinding <b>auditor-read</b>. Verifica sus permisos efectivos.',check:()=>s.k8s.serviceaccounts.some(x=>x.name==='auditor')&&s.k8s.roles.some(x=>x.name==='pod-reader'&&x.resources.includes('pods'))&&s.k8s.rolebindings.some(x=>x.name==='auditor-read')&&s.k8s.actions.includes('auth')?{ok:true,msg:'RBAC mínimo creado y validado.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'CKA · TROUBLESHOOTING POD',title:'Recupera api-broken',goal:'Determina la causa del fallo de <b>api-broken</b> utilizando el estado, los eventos y los registros disponibles. Corrige el recurso hasta dejarlo Running.',check:()=>{const p=s.k8s.pods.find(x=>x.name==='api-broken');return p&&p.status==='Running'&&['describe-pod','logs','events'].every(a=>s.k8s.actions.includes(a))?{ok:true,msg:'Pod diagnosticado y recuperado.'}:{ok:false,msg:'El objetivo todavía no está completo.'};}},
      {badge:'CKA · TROUBLESHOOTING NODO',title:'Recupera worker-2',goal:'Diagnostica por qué <b>worker-2</b> está NotReady y recupéralo. Puedes acceder al nodo como root con la contraseña <b>cka</b>. Al terminar debe figurar Ready.',check:()=>{const n=s.k8s.nodes.find(x=>x.name==='worker-2');return n&&n.status==='Ready'&&s.k8s.actions.includes('describe-node')&&s.k8s.actions.includes('restart-kubelet')?{ok:true,msg:'worker-2 recuperado.'}:{ok:false,msg:'El objetivo todavía no está completo.'};}},
      {badge:'CKA · ETCD',title:'Respalda el estado del clúster',goal:'Verifica la salud de etcd, guarda una copia válida en <b>/root/etcd-cka.db</b> y comprueba después la integridad del snapshot.',check:()=>s.k8s.etcdSnapshot&&s.history.some(h=>/^etcdctl endpoint health/.test(h))&&s.history.some(h=>/^etcdctl snapshot status/.test(h))?{ok:true,msg:'etcd comprobado y respaldado.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'CKA · UPGRADE',title:'Planifica y aplica un upgrade',goal:'Revisa las versiones de actualización admitidas, aplica la propuesta al clúster y confirma al finalizar la versión informada por todos los nodos.',check:()=>s.k8s.upgraded&&s.k8s.actions.includes('upgrade-plan')&&s.k8s.actions.includes('get-nodes')?{ok:true,msg:'Upgrade planificado, aplicado y comprobado.'}:{ok:false,msg:'El objetivo todavía no está completo.'}},
      {badge:'CKA · EXAMEN FINAL',title:'Audita el clúster completo',goal:'Realiza una auditoría final de cargas, servicios, eventos y consumo de nodos y Pods. No puede quedar averiado ni <b>api-broken</b> ni <b>worker-2</b>.',check:()=>{const p=s.k8s.pods.find(x=>x.name==='api-broken'),n=s.k8s.nodes.find(x=>x.name==='worker-2');return p&&p.status==='Running'&&n&&n.status==='Ready'&&s.k8s.actions.includes('get-pods')&&s.k8s.actions.includes('events')&&s.history.some(h=>/^kubectl get all/.test(h))&&s.history.some(h=>/^kubectl top nodes/.test(h))&&s.history.some(h=>/^kubectl top pods/.test(h))?{ok:true,msg:'Auditoría final superada.'}:{ok:false,msg:'El objetivo todavía no está completo.'};}}
    ];
  }
};
