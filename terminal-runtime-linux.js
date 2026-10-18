import {linuxPracticeChecks} from './terminal-practice-checkers.js';
import {commonPractice} from './practice-common.mjs';
const packages = [
  'bash','coreutils','glibc','systemd','dnf','rpm','util-linux','findutils',
  'procps-ng','iproute','iputils','NetworkManager','openssh-server',
  'openssh-clients','chrony','rsyslog','firewalld','cronie','at','audit','lvm2',
  'xfsprogs','e2fsprogs','parted','acl','policycoreutils',
  'policycoreutils-python-utils','setroubleshoot-server','vim-minimal','nano',
  'podman','curl','tar','gzip','bzip2','tuned'
];

export default {
  mode: 'linux',
  workerCommands: ['labhosts','getfacl','setfacl','getenforce','setenforce','sestatus','getsebool','setsebool','semanage','restorecon','chcon','chage','timedatectl','tuned-adm','pvcreate','vgcreate','vgextend','lvcreate','lvextend','lvresize','lvreduce','lvremove','vgremove','pvremove','xfs_growfs','resize2fs','mkswap','swapon','getent','useradd','userdel','usermod','groupadd','blkid','mkfs.xfs','mkfs.ext4','mount','umount','pvs','vgs','lvs','ifup','ifdown','firewall-cmd','chronyc','logger','loginctl','atq','atrm','bzip2','bunzip2','podman'],
  profile: {
    initialUser: 'visitor',
    cwd: ['home','visitor'],
    packages,
    motd: 'Bienvenido a s2ktux — Sistema de prácticas RHCSA 9'
  },
  manuals: {
    pvcreate:{name:'pvcreate - inicializa un volumen físico (LVM)',sec:'8',s:'pvcreate DISPOSITIVO',d:'Prepara una partición o disco para usarse con LVM. Compruébalo con pvs.',o:[]},
    vgcreate:{name:'vgcreate - crea un grupo de volúmenes (LVM)',sec:'8',s:'vgcreate VG DISPOSITIVO...',d:'Agrupa uno o más volúmenes físicos en un grupo de volúmenes. Amplíalo con vgextend.',o:[]},
    vgextend:{name:'vgextend - amplía un grupo de volúmenes',sec:'8',s:'vgextend VG DISPOSITIVO...',d:'Añade volúmenes físicos a un VG existente para ganar espacio.',o:[]},
    lvcreate:{name:'lvcreate - crea un volumen lógico (LVM)',sec:'8',s:'lvcreate -n NOMBRE -L TAMAÑO VG',d:'Crea un volumen lógico dentro de un grupo. Luego formatéalo y móntalo.',o:[['-n NOMBRE','nombre del volumen'],['-L 5G','tamaño fijo'],['-l 60','número exacto de extents'],['-l 100%FREE','usa todo el espacio libre']]},
    lvextend:{name:'lvextend - amplía un volumen lógico',sec:'8',s:'lvextend -r -L +2G /dev/VG/LV',d:'Aumenta el tamaño de un LV. Con -r amplía también el sistema de archivos.',o:[['-L +2G','añade tamaño'],['-r','redimensiona también el FS']]},
    lvreduce:{name:'lvreduce - reduce un volumen lógico',sec:'8',s:'lvreduce -r -L 4G /dev/VG/LV',d:'Reduce el tamaño de un LV. Solo ext4 admite reducción del sistema de archivos; XFS no se puede reducir.',o:[['-L 4G','tamaño final'],['-r','reduce también el FS (ext4)']]},
    mkswap:{name:'mkswap - crea un área de intercambio',sec:'8',s:'mkswap DISPOSITIVO',d:'Da formato de swap a una partición o volumen. Actívalo después con swapon.',o:[]},
    swapon:{name:'swapon - activa el intercambio',sec:'8',s:'swapon [DISPOSITIVO] | --show',d:'Activa un área de swap o muestra las activas con --show.',o:[['--show','lista las áreas de swap activas']]},
    chronyc:{name:'chronyc - cliente de chrony (NTP)',sec:'1',s:'chronyc [sources|tracking]',d:'Consulta el estado del servicio de tiempo chronyd.',o:[['sources','muestra las fuentes de tiempo'],['tracking','estado de sincronización']]},
    'tuned-adm':{name:'tuned-adm - gestiona perfiles de rendimiento',sec:'8',s:'tuned-adm [active|list|profile NOMBRE]',d:'Consulta y activa perfiles de tuned.',o:[['active','perfil activo'],['list','perfiles disponibles'],['profile NOMBRE','activa un perfil']]},
    autofs:{name:'autofs - montaje automático de sistemas de archivos',sec:'8',s:'systemctl enable --now autofs',d:'Servicio que monta y desmonta sistemas de archivos bajo demanda según /etc/auto.master.',o:[]},
    at:{name:'at - programa una tarea puntual',sec:'1',s:'at CUÁNDO',d:'Ejecuta comandos una sola vez en el momento indicado. Consulta la cola con atq y elimina con atrm.',o:[]},
    reboot:{name:'reboot - reinicia el sistema',sec:'8',s:'reboot',d:'Reinicia la máquina. En este entorno abre el menú de GRUB, útil para practicar la recuperación de root.',o:[]},
    loginctl:{name:'loginctl - controla sesiones de usuario',sec:'1',s:'loginctl enable-linger USUARIO',d:'Con enable-linger permite que los servicios de un usuario sigan activos tras cerrar la sesión.',o:[['enable-linger USUARIO','mantiene servicios del usuario']]}
  },
  manualBriefs: {
    podman:['gestiona contenedores sin demonio','podman run|ps|build ...','Motor de contenedores rootless de Red Hat.']
  },
  completions: {
    podman:['run','ps','images','pull','build','exec','logs','inspect','start','stop','restart','rm','rmi','tag','push','commit','save','load','history','search','network','volume','system','compose','stats','top','port','rename','prune','create','attach','update','login','logout','version','info','--help'],
    'firewall-cmd':['--state','--reload','--permanent','--get-default-zone','--get-zones','--get-active-zones','--list-all','--list-services','--list-ports','--add-service=','--remove-service=','--query-service=','--add-port=','--remove-port=','--runtime-to-permanent','--help'],
    parted:['mklabel','mkpart','print','rm','unit','resizepart'],
    semanage:['port','fcontext','user','login','boolean'],
    'tuned-adm':['active','list','profile'],
    crontab:['-l','-e','-r'], chage:['-l','-M','-m','-E','-W'],
    setenforce:['0','1','Enforcing','Permissive'], getsebool:['-a'],
    lvcreate:['-n','-L','-l']
  },
  createChallenges(ctx) {
    const checks=linuxPracticeChecks(ctx);
    const s=ctx.state, getNode=ctx.getNode, sudoersRuleFor=ctx.helpers?.sudoersRuleFor||(()=>null);
    return [
      {check:checks[0]},
      {title:'Configura TCP/IP y el hostname',goal:'Configura <code>eth0</code>: IP <b>192.168.1.20</b>, máscara <b>255.255.255.0</b>, gateway <b>192.168.1.1</b>, DNS <b>192.168.1.254</b>. Hostname del sistema: <b>nodo1.lab.local</b>.',check:checks[1]},
      {title:'Configura los repositorios YUM',goal:'Configura los repos de la distribución: BaseOS en <code>http://mirror.lab.local/rocky9/x86_64/BaseOS</code> y AppStream en <code>http://mirror.lab.local/rocky9/x86_64/AppStream</code>, ambos habilitados y sin comprobación de firma.',check:checks[2]},
      {check:checks[3]},
      {check:checks[4]},
      {check:checks[5]},
      {title:'Tarea de cron para un usuario',goal:'Programa una tarea de cron del usuario <b>hera</b> que se ejecute <b>cada minuto</b> y lance <code>logger "Backup diario"</code>.',check:checks[6]},
      {check:checks[7]},
      {check:checks[8]},
      {title:'Sincroniza la hora con un servidor',goal:'Configura el sistema para sincronizar la hora desde <b>ntp.lab.local</b> y deja el servicio activo.',check:checks[9]},
      {title:'Copia los ficheros de un usuario',goal:'Busca todos los ficheros y directorios cuyo propietario sea <b>hera</b> y cópialos dentro de <code>/root/herafiles</code>.',check:checks[10]},
      {check:checks[11]},
      {check:checks[12]},
      {check:checks[13]},
      {title:'Crea un LV con nº de extents',goal:'Crea un volumen lógico <b>appvol</b> en el VG <b>datavg</b>: tamaño <b>60 extents</b>, formatea en <b>ext4</b> y móntalo de forma persistente en <code>/mnt/appvol</code>.',check:checks[14]},
      {title:'Crea una swap persistente',goal:'Crea una partición <b>swap de 512M</b> en <code>/dev/sdb</code>, actívala y hazla <b>permanente</b>.',check:checks[15]},
      {title:'Redimensiona un volumen lógico',goal:'Ajusta un volumen lógico para que quede en <b>~250 MB</b> (se acepta entre 230 y 260 MB reales).',check:checks[16]},
      {title:'Aplica el perfil de tuned recomendado',goal:'Aplica el perfil de <code>tuned</code> <b>recomendado</b> para este sistema.',check:checks[17]},
      {check:checks[18]},
      {title:'Publica una web en un DocumentRoot propio',goal:'Haz que Apache sirva desde <code>/sitio/web</code> (esa ruta no existe: créala). Ajusta el <b>DocumentRoot</b> en la configuración, los permisos, el contexto de <b>SELinux</b> y el <b>firewall</b>, y consíguela con <code>curl localhost</code>.',check:checks[19]},
      {title:'Contenedor como servicio de un usuario',goal:'Como el usuario <b>hermes</b> (créalo y accede por SSH): descarga <code>httpd</code>, crea el contenedor <b>webapp</b> mapeando <code>/opt/entrada</code>→<code>/data/in</code> y <code>/opt/salida</code>→<code>/data/out</code>, genera su servicio systemd de usuario, habilita <b>linger</b> y déjalo activo con <code>systemctl --user enable --now</code> para que arranque solo tras reiniciar.',check:checks[20]}
    ].map((exercise,index)=>commonPractice('linux',{...exercise,loadSolution:()=>import('./laboratorios/simulated-linux-solutions.mjs').then(module=>module.simulatedLinuxSolutions[index])},index));
  },
  loadLearningChallenges:async ctx=>(await import('./laboratorios/learning-linux.mjs')).simulatedLearningLinux(ctx),
};
