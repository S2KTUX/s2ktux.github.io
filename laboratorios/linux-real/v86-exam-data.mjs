import {courseExercises} from './v86-course-exercises.mjs?v=20261008-console';
import {shellQuote} from './v86-exercises.mjs?v=20261009-intuitive';

// Enunciados equivalentes aprobados; no son preguntas ni baremo oficiales.
const course=id=>structuredClone(courseExercises.find(e=>e.id===`sim-${String(id).padStart(2,'0')}`));
const py=code=>'python3 -c '+shellQuote(code);
const password=(user,value)=>`getent passwd ${user} >/dev/null && printf '%s\\0' ${shellQuote(value)} | /usr/sbin/unix_chkpwd ${user} nonull`;
const active=unit=>`systemctl is-active --quiet ${unit} && systemctl is-enabled --quiet ${unit}`;
const q=(number,node,points,title,goal,solution,checks,observations,extra={})=>({id:`exam-${number}`,number,node,points,title,goal,solution,checks,observations,note:'',...extra});
const asHermes=command=>`uid=$(id -u hermes) && runuser -u hermes -- env HOME=/home/hermes XDG_RUNTIME_DIR=/run/user/$uid DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$uid/bus /bin/sh -c ${shellQuote(`cd /home/hermes && ${command}`)}`;
const examDisk=`exam_pv=$(pvs --noheadings -o pv_name -S vg_name=seedvg | xargs) && test -b "$exam_pv" && exam_disk="/dev/$(lsblk -dno PKNAME "$exam_pv")" && test -b "$exam_disk" && test "$(blockdev --getsize64 "$exam_disk")" = 2147483648`;
const diskIdentification=examDisk+' || { echo "No se ha identificado el disco adicional de 2 GiB"; exit 1; }\nlsblk "$exam_disk"\n';
const mounted=(device,path)=>`test "$(findmnt -rn -M ${path} -o FSTYPE)" = ext4 && test "$(readlink -f "$(findmnt -rn -M ${path} -o SOURCE)")" = "$(readlink -f ${device})"`;
const persistent=(device,path)=>py(`import os,subprocess
d=os.path.realpath('${device}');p='${path}'
def run(args): return subprocess.run(args,capture_output=True,text=True)
r=run(['findmnt','--fstab','--evaluate','-rn','-M',p,'-o','SOURCE,FSTYPE,OPTIONS'])
ok=any(len(x.split())==3 and os.path.realpath(x.split()[0])==d and x.split()[1]=='ext4' and 'noauto' not in x.split()[2].split(',') for x in r.stdout.splitlines())
if not ok:
 unit=run(['systemd-escape','--path','--suffix=mount',p]).stdout.strip()
 props=dict(x.split('=',1) for x in run(['systemctl','show',unit,'-p','What,Where,Type']).stdout.splitlines() if '=' in x)
 what=props.get('What','')
 if what.startswith(('UUID=','LABEL=')): what=run(['findfs',what]).stdout.strip()
 ok=run(['systemctl','is-enabled','--quiet',unit]).returncode==0 and os.path.realpath(what)==d and props.get('Where')==p and props.get('Type')=='ext4'
assert ok`);
const repositories=py(`import configparser,glob,subprocess
c=configparser.ConfigParser(interpolation=None);c.read(glob.glob('/etc/yum.repos.d/*.repo'))
for name,path in [('base','lab-base'),('updates','lab-updates')]:
 assert name in c and c[name].getboolean('enabled',fallback=True) and c[name]['baseurl'].rstrip('/')=='file:///srv/repos/'+path
r=subprocess.run(['dnf','--disablerepo=*','--enablerepo=base,updates','repolist','--enabled'],capture_output=True,text=True,timeout=45)
assert r.returncode==0 and all(any(line.split() and line.split()[0]==name for line in r.stdout.splitlines()) for name in ['base','updates'])`);
const repoSolution="printf '[base]\\nname=Base\\nbaseurl=file:///srv/repos/lab-base\\nenabled=1\\ngpgcheck=1\\ngpgkey=file:///srv/repos/RPM-GPG-KEY-lab\\n\\n[updates]\\nname=Updates\\nbaseurl=file:///srv/repos/lab-updates\\nenabled=1\\ngpgcheck=1\\ngpgkey=file:///srv/repos/RPM-GPG-KEY-lab\\n' > /etc/yum.repos.d/examen.repo\nrpm --import /srv/repos/RPM-GPG-KEY-lab\ndnf repolist";
const repoChecks=[['Dos repositorios habilitados y disponibles',repositories,60]];
const repoObservation=[['Repositorios configurados','cat /etc/yum.repos.d/*.repo; dnf repolist']];
const cronTask=py(`import glob,os,subprocess,shlex
def entries(text,system=False):
 for line in text.splitlines():
  if not line.strip() or line.lstrip().startswith('#'): continue
  try: p=shlex.split(line)
  except ValueError: continue
  if len(p)>5 and p[:5] in [['*']*5,['*/1']+['*']*4] and (not system or len(p)>6 and p[5]=='natasha'): return True
 return False
r=subprocess.run(['crontab','-u','natasha','-l'],capture_output=True,text=True)
assert entries(r.stdout) or any(entries(open(p).read(),True) for p in ['/etc/crontab']+glob.glob('/etc/cron.d/*') if os.path.isfile(p))`);
const unitForContainer=`pid=$(podman inspect -f '{{.State.ConmonPid}}' mycontainer) && test "$pid" -gt 0 && unit=$(sed -n 's|.*/\\([^/]*\\.service\\)\\(/.*\\)\\?$|\\1|p' /proc/$pid/cgroup | tail -n 1) && test -n "$unit"`;

export const examQuestions=[
 q(1,1,20,'Red y hostname',
 'Configura eth0 con la dirección 10.42.0.20/24, puerta de enlace 10.42.0.11 y DNS 10.42.0.11. Cambia el hostname a serverA.example.com. La configuración debe conservarse al reiniciar.',
 'nmcli con add type ethernet ifname eth0 con-name examen ipv4.method manual ipv4.addresses 10.42.0.20/24 ipv4.gateway 10.42.0.11 ipv4.dns 10.42.0.11 connection.autoconnect yes\nnmcli con up examen\nhostnamectl set-hostname serverA.example.com\nip -4 addr show eth0\nip route',
 [['Dirección aplicada','ip -4 -o addr show eth0 | grep -Fq "10.42.0.20/24"'],
 ['Perfil persistente, gateway y DNS',`uuid=$(nmcli -g GENERAL.CON-UUID dev show eth0) && test -n "$uuid" && test "$(nmcli -g ipv4.addresses con show "$uuid")" = 10.42.0.20/24 && test "$(nmcli -g ipv4.gateway con show "$uuid")" = 10.42.0.11 && test "$(nmcli -g ipv4.dns con show "$uuid")" = 10.42.0.11 && test "$(nmcli -g connection.autoconnect con show "$uuid")" = yes`],
 ['Ruta aplicada','ip -4 route show default | grep -Eq "^default via 10\\.42\\.0\\.11 dev eth0( |$)"'],
 ['Hostname',`test "$(hostname | tr 'A-Z' 'a-z')" = servera.example.com && test "$(cat /etc/hostname | tr 'A-Z' 'a-z')" = servera.example.com`]],
 [['Red y perfiles','ip -4 addr show eth0; ip route; nmcli -f NAME,UUID,TYPE,DEVICE con show; hostnamectl']]),
 q(2,1,10,'Repositorios','Configura dos repositorios DNF habilitados, llamados base y updates. Sus direcciones son file:///srv/repos/lab-base y file:///srv/repos/lab-updates, respectivamente. La clave de firma está en file:///srv/repos/RPM-GPG-KEY-lab.',repoSolution,repoChecks,repoObservation,{requireFirst:true}),
 q(3,1,15,'Servicio web','Apache está configurado para escuchar en el puerto 82, pero el servicio no funciona. Corrige el problema para que sirva el contenido existente de /var/www/html y arranque automáticamente. No modifiques esos archivos ni desactives SELinux.',
 'systemctl status apache2\nsemanage port -a -t http_port_t -p tcp 82\nsystemctl enable apache2\nsystemctl restart apache2\ncurl http://127.0.0.1:82/',
 [['Apache activo y habilitado',active('apache2')],['Servicio web y contenido intacto','curl --max-time 5 -fsS http://127.0.0.1:82/ >/var/tmp/s2ktux-web-check && cmp -s /var/tmp/s2ktux-web-check /var/www/html/index.html && sha256sum -c /var/lib/s2ktux-exam/web-files.sha256 >/dev/null'],['SELinux Enforcing','test "$(getenforce)" = Enforcing']],
 [['Servicio y puerto','systemctl is-active apache2; ss -ltn; getenforce; curl --max-time 5 -sS http://127.0.0.1:82/']]),
 q(4,1,20,'Usuarios, grupos y sudo',
 'Crea el grupo sysadmin y los usuarios harry, natasha y sara. Harry y natasha deben tener un directorio personal y pertenecer a sysadmin como grupo secundario. Sara no debe tener una shell interactiva ni pertenecer a sysadmin. La contraseña de los tres será password.\n\nLos miembros de sysadmin deben poder crear usuarios mediante sudo. Harry debe poder cambiar contraseñas de usuarios mediante sudo sin que se le solicite su propia contraseña.',
 "groupadd sysadmin\nuseradd -m -G sysadmin harry\nuseradd -m -G sysadmin natasha\nuseradd -s /usr/sbin/nologin sara\nprintf 'harry:password\\nnatasha:password\\nsara:password\\n' | chpasswd\nprintf '%%sysadmin ALL=(ALL) /usr/sbin/useradd\\nharry ALL=(ALL) NOPASSWD: /usr/bin/passwd\\n' > /etc/sudoers.d/examen\nchmod 440 /etc/sudoers.d/examen\nvisudo -cf /etc/sudoers",
 [['Grupos secundarios y directorios personales',`for u in harry natasha; do id -nG "$u" | tr ' ' '\n' | grep -Fxq sysadmin || exit 1; test "$(id -gn "$u")" != sysadmin || exit 1; home=$(getent passwd "$u" | cut -d: -f6); test -d "$home" && test "$(stat -c %U "$home")" = "$u" || exit 1; done`],
 ['Sara sin shell interactiva ni sysadmin',`getent passwd sara | grep -Eq ':(/(usr/)?sbin/nologin|/bin/false)$' && ! id -nG sara | tr ' ' '\n' | grep -Fxq sysadmin`],
 ['Contraseñas',[password('harry','password'),password('natasha','password'),password('sara','password')].join(' && ')],
 ['Permisos efectivos de sudo',`visudo -cf /etc/sudoers && sudo -l -U harry /usr/sbin/useradd && sudo -l -U natasha /usr/sbin/useradd && runuser -u harry -- sudo -k -n /usr/bin/passwd --help >/dev/null`]],
 [['Cuentas y sudo','id harry; id natasha; getent passwd sara; RES_OPTIONS="attempts:1 timeout:1" sudo -l -U harry; sudo -l -U natasha']]),
 q(5,1,10,'Caducidad de contraseñas','Configura la contraseña de natasha con una duración máxima de 90 días, mínima de 1 día y un aviso de caducidad de 7 días.',
 'chage -M 90 -m 1 -W 7 natasha\nchage -l natasha',
 [['Caducidad',`chage -l natasha | awk -F ': *' '/^Minimum number of days/ {min=$2} /^Maximum number of days/ {max=$2} /^Number of days of warning/ {warn=$2} END {exit !(min==1 && max==90 && warn==7)}'`]],
 [['Caducidad','chage -l natasha']]),
 q(6,1,10,'Tarea programada','Programa una tarea de natasha que registre el mensaje EX200 testing en el journal cada minuto. Debe seguir ejecutándose después de reiniciar.',
 "printf '* * * * * /usr/bin/logger \"EX200 testing\"\\n' | crontab -u natasha -\nsystemctl enable --now cron\ncrontab -u natasha -l",
 [['Tarea cada minuto',cronTask],['Servicio persistente',active('cron')],['Mensaje ejecutado por natasha','uid=$(id -u natasha) && journalctl --no-pager _UID=$uid -o cat | grep -Fxq "EX200 testing"']],
 [['Cron y journal','crontab -u natasha -l; grep -h natasha /etc/crontab /etc/cron.d/*; systemctl is-active cron; uid=$(id -u natasha) && journalctl --no-pager _UID=$uid -o cat -n 10']]),
 q(7,1,20,'Automontaje','Configura el automontaje del recurso NFS 10.42.0.11:/ en /netdir/datos. El recurso debe estar disponible para lectura y escritura al acceder a esa ruta, también después de reiniciar.',
 "mkdir -p /netdir\nprintf '/netdir /etc/auto.examen --timeout=30\\n' > /etc/auto.master.d/examen.autofs\nprintf 'datos -fstype=nfs4,rw,vers=4.2 10.42.0.11:/\\n' > /etc/auto.examen\nrestorecon /etc/auto.examen /etc/auto.master.d/examen.autofs\nsystemctl enable autofs\nsystemctl restart autofs\ncat /netdir/datos/dato",
 [['Servicio persistente',active('autofs')],['Mapa y montaje automático',`timeout -k 2 12 cat /netdir/datos/dato >/dev/null || exit 1; findmnt -rn -t autofs -o TARGET | grep -Eq '^/netdir(/datos)?$' && test "$(findmnt -rn -M /netdir/datos -o SOURCE)" = 10.42.0.11:/ && findmnt -rn -M /netdir/datos -o FSTYPE | grep -Eq '^nfs4?$' && automount -m | grep -Fq '10.42.0.11:/'`],
 ['Lectura y escritura reales',`timeout -k 2 12 /bin/sh -c 'test "$(cat /netdir/datos/dato)" = DATOS_NFS && f=$(mktemp /netdir/datos/.s2ktux-check.XXXXXX) && printf "NFS_RW\\n" > "$f" && test "$(cat "$f")" = NFS_RW && rm "$f"' || exit 1`]],
 [['Mapas y montaje','automount -m; findmnt -M /netdir/datos']]),
 q(8,1,10,'Archivo comprimido','Crea /root/backup.tar.bz2 con todo el contenido de /usr/local, utilizando tar y compresión bzip2.',
 'tar -cjf /root/backup.tar.bz2 -C / usr/local\nbzip2 -t /root/backup.tar.bz2\ntar -tjf /root/backup.tar.bz2',
 [['Bzip2 válido','test -f /root/backup.tar.bz2 && bzip2 -t /root/backup.tar.bz2'],['Contenido completo',py(`import os,tarfile,posixpath
with tarfile.open('/root/backup.tar.bz2','r:bz2') as t:
 members={posixpath.normpath(m.name).lstrip('/'):m for m in t.getmembers()};pref='usr/local' if 'usr/local' in members else '.';count=0
 for root,dirs,files in os.walk('/usr/local',followlinks=False):
  for name in dirs+files:
   p=os.path.join(root,name);rel=os.path.relpath(p,'/usr/local');key=posixpath.normpath(pref+'/'+rel);assert key in members,p;m=members[key]
   if os.path.islink(p): assert m.issym() and m.linkname==os.readlink(p)
   elif os.path.isdir(p): assert m.isdir()
   elif os.path.isfile(p): assert (m.isfile() or m.islnk()) and t.extractfile(m).read()==open(p,'rb').read(),p
   count+=1
 assert count>0`)]],
 [['Archivo comprimido','ls -l /root/backup.tar.bz2; tar -tjf /root/backup.tar.bz2 | head -n 20']]),
 q(9,1,15,'Permisos','Copia /etc/hosts a /var/tmp/hosts. El propietario y grupo deben ser root:root. Harry debe poder leer y escribir el archivo; sara no debe poder leerlo ni escribirlo; el resto de usuarios podrá leerlo. Nadie debe tener permiso de ejecución.',
 'cp /etc/hosts /var/tmp/hosts\nchown root:root /var/tmp/hosts\nchmod 644 /var/tmp/hosts\nsetfacl -m u:harry:rw-,u:sara:--- /var/tmp/hosts\ngetfacl /var/tmp/hosts',
 [['Copia y propietario',`test "$(stat -c %U:%G /var/tmp/hosts)" = root:root && `+py(`def clean(p):
 return [x for x in open(p).readlines() if x.strip() and not {'ntp.lab.local','serverA.example.com','servera.example.com','nodo1','nodo1.lab.local'}.intersection(x.split())]
assert clean('/etc/hosts')==clean('/var/tmp/hosts')`)],
 ['Sin ejecución y lectura para el resto','test $((0$(stat -c %a /var/tmp/hosts) & 0111)) = 0 && runuser -u nobody -- test -r /var/tmp/hosts'],
 ['Permisos efectivos','runuser -u harry -- test -r /var/tmp/hosts && runuser -u harry -- test -w /var/tmp/hosts && ! runuser -u sara -- test -r /var/tmp/hosts && ! runuser -u sara -- test -w /var/tmp/hosts']],
 [['Permisos efectivos','stat -c "%U:%G %a" /var/tmp/hosts; getfacl -cp /var/tmp/hosts']]),
 q(10,1,15,'Sincronización horaria','Configura la sincronización horaria con el servidor 10.42.0.11. Debe quedar seleccionado como fuente de tiempo y seguir utilizándose después de reiniciar.',
 "printf 'server 10.42.0.11 iburst minpoll 0 maxpoll 2\\nmakestep 1 -1\\n' > /etc/chrony/chrony.conf\nrestorecon /etc/chrony/chrony.conf\nsystemctl enable chrony\nsystemctl restart chrony\nchronyc -n sources",
 [['Servicio persistente',active('chrony')],['Fuente configurada',`grep -REq '^server[[:space:]]+(10\\.42\\.0\\.11|ntp\\.lab\\.local)[[:space:]]' /etc/chrony`],['Fuente realmente seleccionada',`chronyc -n sources | grep -Eq '^\\^\\*[[:space:]]+10\\.42\\.0\\.11[[:space:]]'`]],
 [['Chrony','cat /etc/chrony/chrony.conf; chronyc -n sources']]),
 q(11,1,10,'Búsqueda de archivos','Busca los archivos y directorios de natasha en el sistema de archivos raíz y cópialos a /root/natashafiles, conservando sus rutas relativas y el contenido.',
 'mkdir -p /root/natashafiles\ncd /\nfind . -xdev -path ./root/natashafiles -prune -o -user natasha \\( -type f -o -type d \\) -exec cp -a --parents -t /root/natashafiles {} +\nfind /root/natashafiles -type f',
 [['Archivos y directorios copiados',py(`import os,pwd,stat
u=pwd.getpwnam('natasha').pw_uid;dev=os.stat('/').st_dev;n=0
for root,dirs,files in os.walk('/',followlinks=False):
 dirs[:]=[d for d in dirs if os.path.join(root,d)!='/root/natashafiles' and not os.path.islink(os.path.join(root,d)) and os.stat(os.path.join(root,d)).st_dev==dev]
 for name in dirs+files:
  p=os.path.join(root,name);s=os.lstat(p)
  if s.st_uid!=u or s.st_dev!=dev or not (stat.S_ISDIR(s.st_mode) or stat.S_ISREG(s.st_mode)): continue
  dest='/root/natashafiles'+p;assert os.path.exists(dest),p
  if stat.S_ISDIR(s.st_mode): assert os.path.isdir(dest)
  else: assert os.path.isfile(dest) and open(p,'rb').read()==open(dest,'rb').read()
  n+=1
assert n>0`)]],
 [['Copias','find /root/natashafiles -type f | head -n 30']]),
 q(12,1,10,'Filtrado de texto','Guarda en /root/lines.txt todas las líneas de /usr/share/dict/words que contengan seismic, respetando el orden y las mayúsculas.',
 'grep seismic /usr/share/dict/words > /root/lines.txt\ncat /root/lines.txt',
 [['Todas las líneas coincidentes',py(`a=open('/usr/share/dict/words').readlines();assert open('/root/lines.txt').read()==''.join(x for x in a if 'seismic' in x)`)]],
 [['Resultado','wc -l /root/lines.txt; cat /root/lines.txt']]),
 {...course(13),id:'exam-13',number:13,node:1,points:10,title:'Usuario con UID concreto',note:'',observations:[['Cuenta','getent passwd apolo; id apolo']]},
 {...course(1),id:'exam-root',number:'root',node:2,points:20,title:'Recuperar la contraseña de root',goal:'La contraseña inicial de root no se proporciona. Recupera el acceso y establece titanio7 como nueva contraseña. Deja la máquina arrancada normalmente, con SELinux Enforcing.',note:'',requireFirst:true,observations:[['Estado tras recuperar root','cat /proc/1/comm; getenforce; test -e /.autorelabel && echo "Reetiquetado pendiente"; systemctl show serial-getty@ttyS0.service -p ExecStart --value']],solution:course(1).solution.replace('# Abre la máquina de recuperación y pulsa Iniciar laboratorio.\n# Si ya pasó GRUB, pulsa Reiniciar máquina (GRUB).','# Trabaja en la máquina 2.\n# Si ya pasó GRUB, pulsa Reiniciar máquina.')},
 q(14,2,10,'Repositorios','Configura en esta máquina los repositorios DNF base y updates, habilitados y con las direcciones file:///srv/repos/lab-base y file:///srv/repos/lab-updates. La clave de firma está en file:///srv/repos/RPM-GPG-KEY-lab.',repoSolution,repoChecks,repoObservation,{requireFirst:true}),
 q(15,2,20,'Volumen lógico','En el espacio libre del disco adicional, crea el grupo de volúmenes Wgroup con extents de 8 MiB y el volumen lógico WCR de 50 extents. Utiliza ext4 y móntalo en /mnt/WCA de forma persistente. Conserva las particiones existentes y deja espacio para la swap de la pregunta 16.',
 diskIdentification+'parted -s "$exam_disk" mkpart LVM 769MiB 1535MiB set 2 lvm on\npartprobe "$exam_disk"\nudevadm settle\npvcreate "${exam_disk}2"\nvgcreate -s 8M Wgroup "${exam_disk}2"\nlvcreate -l 50 -n WCR Wgroup\nmkfs.ext4 /dev/Wgroup/WCR\nmkdir -p /mnt/WCA\nmount /dev/Wgroup/WCR /mnt/WCA\nrestorecon -RF /mnt/WCA\nprintf \'UUID=%s /mnt/WCA ext4 defaults 0 2\\n\' "$(blkid -s UUID -o value /dev/Wgroup/WCR)" >> /etc/fstab\nsystemctl daemon-reload',
 [['VG y extents',examDisk+' && test "$(vgs --noheadings --units b --nosuffix -o vg_extent_size Wgroup | xargs)" = 8388608 && for pv in $(pvs --noheadings -o pv_name -S vg_name=Wgroup); do test "$(lsblk -dno PKNAME "$pv")" = "${exam_disk#/dev/}" || exit 1; done',60],['LV de 50 extents y ext4',`test "$(blockdev --getsize64 /dev/Wgroup/WCR)" = 419430400 && `+mounted('/dev/Wgroup/WCR','/mnt/WCA')],['Montaje persistente',persistent('/dev/Wgroup/WCR','/mnt/WCA')]],
 [['Volúmenes y montaje','pvs; vgs; lvs; findmnt -M /mnt/WCA; cat /etc/fstab']]),
 q(16,2,10,'Swap','Crea una partición swap de 512 MiB en el espacio libre del disco adicional. Debe quedar activa y utilizarse después de reiniciar, sin borrar las particiones existentes.',
 diskIdentification+'parted -s "$exam_disk" mkpart swap linux-swap 1535MiB 2047MiB\npartprobe "$exam_disk"\nudevadm settle\nmkswap "${exam_disk}3"\nswapon "${exam_disk}3"\nprintf \'UUID=%s none swap defaults 0 0\\n\' "$(blkid -s UUID -o value "${exam_disk}3")" >> /etc/fstab\nsystemctl daemon-reload\nswapon --show',
 [['Partición swap activa y persistente',examDisk+' && '+py(`import os,subprocess
pv=subprocess.check_output(['pvs','--noheadings','-o','pv_name','-S','vg_name=seedvg'],text=True).strip();parent=subprocess.check_output(['lsblk','-dno','PKNAME',pv],text=True).strip()
entries=subprocess.run(['findmnt','--fstab','--evaluate','-rn','-t','swap','-o','SOURCE,OPTIONS'],capture_output=True,text=True).stdout.splitlines()
active=subprocess.check_output(['swapon','--noheadings','--show=NAME'],text=True).split();ok=False
for dev in active:
 dev=os.path.realpath(dev)
 if subprocess.check_output(['lsblk','-dno','TYPE',dev],text=True).strip()!='part': continue
 if subprocess.check_output(['lsblk','-dno','PKNAME',dev],text=True).strip()!=parent: continue
 if subprocess.check_output(['blockdev','--getsize64',dev],text=True).strip()!='536870912': continue
 ok=any(len(x.split())==2 and os.path.realpath(x.split()[0])==dev and 'noauto' not in x.split()[1].split(',') for x in entries)
 if not ok:
  unit=subprocess.check_output(['systemd-escape','--path','--suffix=swap',dev],text=True).strip()
  ok=subprocess.run(['systemctl','is-enabled','--quiet',unit]).returncode==0
 if ok: break
assert ok
assert open('/mnt/reducible/dato').read().strip()=='CONSERVAR'`),60]],
 [['Swap','lsblk -f; swapon --show; cat /etc/fstab']]),
 q(17,2,20,'Reducción de volumen','Reduce el volumen lógico existente seedvg/reducible y su sistema de archivos ext4 de 512 a 300 MiB. Conserva el archivo /mnt/reducible/dato y su contenido CONSERVAR. El volumen debe quedar montado en /mnt/reducible y mantener su montaje persistente.',
 'umount /mnt/reducible\ne2fsck -f /dev/seedvg/reducible\nlvreduce -r -L 300M /dev/seedvg/reducible\nmount /mnt/reducible\ncat /mnt/reducible/dato',
 [['LV y ext4 reducidos',`test "$(blockdev --getsize64 /dev/seedvg/reducible)" = 314572800 && `+py(`import subprocess
r=subprocess.check_output(['dumpe2fs','-h','/dev/seedvg/reducible'],text=True,stderr=subprocess.DEVNULL);d=dict(x.split(':',1) for x in r.splitlines() if ':' in x);assert int(d['Block count'])*int(d['Block size'])==314572800`)],['Montaje y dato conservados',mounted('/dev/seedvg/reducible','/mnt/reducible')+' && test "$(cat /mnt/reducible/dato)" = CONSERVAR'],['Montaje persistente',persistent('/dev/seedvg/reducible','/mnt/reducible')]],
 [['Tamaño, montaje y dato','lvs seedvg; dumpe2fs -h /dev/seedvg/reducible 2>/dev/null; findmnt -M /mnt/reducible; cat /mnt/reducible/dato']]),
 {...course(18),id:'exam-18',number:18,node:2,points:10,title:'Perfil de rendimiento',goal:'Activa el perfil virtual-guest. Sus ajustes deben quedar aplicados y conservarse después de reiniciar.',note:'',observations:[['Perfil y ajustes','cat /etc/tuned/active_profile; systemctl is-active tuned; sysctl vm.swappiness']]},
 q(19,2,10,'Mensaje al iniciar sesión','Configura la cuenta hermes para que, al iniciar una sesión de login, muestre el mensaje Bienvenido a S2KTUX, hermes.',
 "printf '\\necho \"Bienvenido a S2KTUX, hermes\"\\n' >> /home/hermes/.profile\nchown hermes:hermes /home/hermes/.profile\nrunuser -l hermes -c true",
 [['Mensaje en una sesión real',`timeout -k 2 8 runuser -l hermes -c true | grep -Fxq 'Bienvenido a S2KTUX, hermes'`]],
 [['Inicialización de login','for f in /home/hermes/.profile /home/hermes/.bash_profile /home/hermes/.bash_login; do test ! -f "$f" || { echo "$f"; cat "$f"; }; done']]),
 q(20,2,10,'Construir una imagen','Como hermes, descarga el Containerfile disponible en http://10.42.0.11:8080/Containerfile y construye la imagen localhost/curso-examen:1. No modifiques el archivo descargado.',
 'ssh hermes@localhost\nmkdir -p ~/imagen-examen\ncd ~/imagen-examen\ncurl -f -o Containerfile http://10.42.0.11:8080/Containerfile\npodman build -t localhost/curso-examen:1 .\nexit',
 [['Archivo descargado sin modificar',py(`import os,pwd
uid=pwd.getpwnam('hermes').pw_uid;expected=open('/srv/s2ktux-exam/public/Containerfile','rb').read();ok=False
for root,dirs,files in os.walk('/home/hermes',followlinks=False):
 dirs[:]=[d for d in dirs if not os.path.islink(os.path.join(root,d)) and os.path.join(root,d) not in ['/home/hermes/.local','/home/hermes/.cache']]
 for f in files:
  p=os.path.join(root,f)
  if not os.path.islink(p) and os.stat(p).st_uid==uid and os.stat(p).st_size==len(expected) and open(p,'rb').read()==expected: ok=True
assert ok`)],['Imagen construida por hermes',asHermes(`podman image inspect localhost/curso-examen:1 | python3 -c 'import json,sys;c=json.load(sys.stdin)[0];assert c["Labels"].get("curso")=="examen" and c["Config"]["Cmd"]==["/bin/busybox","sleep","86400"]'`)]],
 [['Imagen de hermes',asHermes('podman images; podman image inspect localhost/curso-examen:1')]]),
 q(21,2,15,'Contenedor persistente','Como hermes, crea el contenedor mycontainer usando localhost/curso-examen:1. Monta /opt/file en /opt/incoming y /opt/process en /opt/output. El contenedor debe poder leer y escribir en ambas rutas y arrancar automáticamente después de reiniciar, sin que hermes tenga que iniciar sesión. No debe ejecutarse como un contenedor de root.',
 "# Como root:\nmkdir -p /opt/file /opt/process\nchown hermes:hermes /opt/file /opt/process\nsemanage fcontext -a -t container_file_t '/opt/(file|process)(/.*)?'\nrestorecon -RF /opt/file /opt/process\nloginctl enable-linger hermes\nssh hermes@localhost\n# Como hermes:\npodman run -d --name mycontainer -v /opt/file:/opt/incoming:Z -v /opt/process:/opt/output:Z localhost/curso-examen:1\npodman generate systemd --name mycontainer --files --new\npodman rm -f mycontainer\nmkdir -p ~/.config/systemd/user\nmv container-mycontainer.service ~/.config/systemd/user/\nrestorecon -RF ~/.config/systemd\nsystemctl --user daemon-reload\nsystemctl --user enable --now container-mycontainer.service\nexit\n# Como root, comprueba el arranque sin iniciar sesión como hermes:\nreboot",
 [['Contenedor rootless e imagen',asHermes(`podman inspect mycontainer | python3 -c 'import json,sys,os,pwd;c=json.load(sys.stdin)[0];assert c["State"]["Running"] and c["ImageName"]=="localhost/curso-examen:1";assert os.stat("/proc/"+str(c["State"]["ConmonPid"])).st_uid==pwd.getpwnam("hermes").pw_uid'`)],
 ['Montajes y escritura reales',asHermes(`podman inspect mycontainer | python3 -c 'import json,sys;c=json.load(sys.stdin)[0];m={(x["Source"],x["Destination"]) for x in c["Mounts"] if x["RW"]};assert {("/opt/file","/opt/incoming"),("/opt/process","/opt/output")}<=m' && podman exec mycontainer /bin/busybox sh -c 'for d in /opt/incoming /opt/output; do f="$d/.s2ktux-check-$$"; printf "RW\\n" > "$f" && test "$(cat "$f")" = RW && rm "$f" || exit 1; done'`)],
 ['Arranque automático sin login',asHermes(unitForContainer+` && if systemctl --user is-active --quiet "$unit"; then systemctl --user is-enabled --quiet "$unit" && test "$(loginctl show-user hermes -p Linger --value)" = yes; else test "$(systemctl show "$unit" -p User --value)" = hermes && systemctl is-active --quiet "$unit" && systemctl is-enabled --quiet "$unit"; fi`)]],
 [['Servicio y contenedor',asHermes('systemctl --user list-units --type=service --no-pager; podman ps; podman inspect mycontainer')]]),
];

export const EXAM_SECONDS=3*60*60;
export const EXAM_TOTAL=300;
export const EXAM_PASS=210;
export function scoreQuestion(question,result){
 if(!result||result.results?.length!==question.checks.length)throw Error('Resultado de corrección incompleto');
 if(result.results.some((r,i)=>r.label!==question.checks[i][0]||typeof r.ok!=='boolean'))throw Error('Criterios de corrección inválidos');
 const base=Math.floor(question.points/question.checks.length),remainder=question.points%question.checks.length;
 const criteria=result.results.map((r,i)=>({...r,points:base+(i<remainder?1:0)}));
 const points=question.requireFirst&&!criteria[0].ok?0:criteria.reduce((n,r)=>n+(r.ok?r.points:0),0);
 return {id:question.id,points,max:question.points,criteria,observations:result.observations||[]};
}
