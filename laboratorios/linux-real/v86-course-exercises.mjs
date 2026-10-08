// Adaptación del simulacro publicado: recursos locales, nunca repos ficticios.
// Las diferencias Debian/RHEL se explican; no se sustituyen comandos por alias.
// Autenticación real mediante el auxiliar de PAM: comprobar la contraseña,
// no leer/comparar hashes de shadow (tampoco con el nuevo root normal).
const passwordCheck = (user, password) => `printf '%s\\0' '${password}' | /usr/sbin/unix_chkpwd ${user} nonull`;
const mounted = (path, device, type) => `mountpoint -q ${path} && test "$(findmnt -rn -M ${path} -o FSTYPE)" = ${type} && test "$(readlink -f "$(findmnt -rn -M ${path} -o SOURCE)")" = "$(readlink -f ${device})"`;
const fstab = (device, path, type) => `uuid=$(blkid -s UUID -o value ${device}) && test -n "$uuid" && awk -v u="UUID=$uuid" -v d="${device}" '$0 !~ /^[[:space:]]*#/ && ($1==u || $1==d) && $2=="${path}" && $3=="${type}" && $4 !~ /(^|,)noauto(,|$)/ {n++} END {exit n!=1}' /etc/fstab`;
const active = unit => `systemctl is-active --quiet ${unit} && systemctl is-enabled --quiet ${unit}`;
const dependency = 'Las prácticas son acumulativas. Haz antes usuarios/grupos para las que usan zeus, hera o ares. Reset borra también los ejercicios resueltos.';

export const courseExercises = [
  {
    id:'sim-01', title:'Simulacro 01 · Recuperar root', classes:[4,11],
    goal:'Practica rd.break desde GRUB y cambia la contraseña de root a titanio7. Al volver al sistema, SELinux debe seguir Enforcing.',
    note:'La consola del navegador da root para estudiar. La comprobación verifica contraseña y estado final, no demuestra por sí sola que hayas seguido el rescate. Requiere reiniciar; la recuperación puede tardar varios minutos.',
    explanation:'Edita la entrada de GRUB con e, añade rd.break a la línea linux y arranca con Ctrl+X. El initramfs de esta candidata es dracut; la distribución sigue siendo Debian.',
    solution:'reboot\n# En GRUB: e, añade rd.break al final de linux y Ctrl+X.\n# En la shell de rescate:\nmount -o remount,rw /sysroot\nchroot /sysroot\npasswd root\n# Escribe titanio7 dos veces.\ntouch /.autorelabel\nsync\nexit\nexit\n# Cuando el sistema vuelva a arrancar:\ngetenforce',
    interactive:true,
    checks:[['Contraseña de root',passwordCheck('root','titanio7')],['Sistema arrancado y Enforcing','test "$(cat /proc/1/comm)" = systemd && test "$(getenforce)" = Enforcing && test ! -e /.autorelabel']],
  },
  {
    id:'sim-02', title:'Simulacro 02 · Red y hostname', classes:[8],
    goal:'Configura eth0 con 10.42.0.20/24, DNS 10.42.0.11, MAC 02:00:00:42:00:20 y hostname nodo1.lab.local. Guarda el perfil con autoconexión.',
    note:'Red privada entre pestañas; no hay router ni Internet. Guardar una IP de DNS no convierte la otra máquina en servidor DNS. El tráfico con la segunda VM se practica aparte.',
    explanation:'La MAC debe ser distinta en cada máquina. NetworkManager guarda la configuración; comprueba de nuevo después de reiniciar.',
    solution:'nmcli con add type ethernet ifname eth0 con-name examen ipv4.method manual ipv4.addresses 10.42.0.20/24 ipv4.dns 10.42.0.11 ethernet.cloned-mac-address 02:00:00:42:00:20 connection.autoconnect yes\nnmcli con up examen\nhostnamectl set-hostname nodo1.lab.local\nprintf "\\n127.0.1.1 nodo1.lab.local nodo1\\n" >> /etc/hosts\n\nip -4 addr show eth0\nnmcli con show examen\nhostnamectl',
    checks:[['Dirección aplicada','ip -4 -o addr show eth0 | grep -Fq "10.42.0.20/24"'],['Perfil persistente y DNS','test "$(nmcli -g ipv4.addresses con show examen)" = 10.42.0.20/24 && test "$(nmcli -g ipv4.dns con show examen)" = 10.42.0.11 && test "$(nmcli -g connection.autoconnect con show examen)" = yes'],['MAC única','test "$(cat /sys/class/net/eth0/address)" = 02:00:00:42:00:20'],['Hostname','test "$(cat /etc/hostname)" = nodo1.lab.local && test "$(hostname)" = nodo1.lab.local']],
  },
  {
    id:'sim-03', title:'Simulacro 03 · Repositorios RPM', classes:[2],
    goal:'Crea curso-base en /etc/yum.repos.d/curso.repo, usando file:///srv/repos/lab-base. Déjalo habilitado con comprobación de firmas y la clave local del laboratorio.',
    note:'No son BaseOS/AppStream de RHEL: DNF administra RPM reales de prácticas, no el sistema Debian. No se usan mirror.lab.local ni direcciones que no existan.',
    explanation:'El repositorio y su clave ya están en el disco. Se practica la configuración real del repositorio y las firmas, sin necesitar Internet.',
    solution:"printf '[curso-base]\\nname=Curso RPM local\\nbaseurl=file:///srv/repos/lab-base\\nenabled=1\\ngpgcheck=1\\ngpgkey=file:///srv/repos/RPM-GPG-KEY-lab\\n' > /etc/yum.repos.d/curso.repo\nrpm --import /srv/repos/RPM-GPG-KEY-lab\ndnf --disablerepo='*' --enablerepo=curso-base repolist",
    checks:[['Repositorio y firma configurados',`python3 -c 'import configparser; c=configparser.ConfigParser(); c.read("/etc/yum.repos.d/curso.repo"); r=c["curso-base"]; assert r["baseurl"]=="file:///srv/repos/lab-base" and r.getboolean("enabled") and r.getboolean("gpgcheck") and r["gpgkey"]=="file:///srv/repos/RPM-GPG-KEY-lab"'`],['Paquetes y clave disponibles','test -s /srv/repos/lab-base/repodata/repomd.xml && test -s /srv/repos/RPM-GPG-KEY-lab && rpm -q gpg-pubkey >/dev/null']],
  },
  {
    id:'sim-04', title:'Simulacro 04 · Puerto Apache y SELinux', classes:[10],
    goal:'Haz que Apache escuche en 8090, permita ese puerto en SELinux y responda con curl. Conserva SELinux Enforcing.',
    note:'En esta candidata el servicio se llama apache2 y la configuración está en /etc/apache2. En RHEL son httpd y /etc/httpd; no se crean alias que oculten esa diferencia.',
    explanation:'El puerto debe estar declarado tanto en Apache como en la política SELinux. Configurar una etiqueta de puerto no abre automáticamente el firewall.',
    solution:"printf 'Listen 8090\\n' > /etc/apache2/conf-available/curso-puerto.conf\na2enconf curso-puerto\nsemanage port -a -t http_port_t -p tcp 8090\nsystemctl enable apache2\nsystemctl restart apache2\n\nss -ltn\ncurl http://127.0.0.1:8090/",
    checks:[['Apache activo y habilitado',active('apache2')],['Puerto 8090 en escucha','ss -ltn | grep -Eq ":8090[[:space:]]" && curl --max-time 5 -fsS http://127.0.0.1:8090/ >/dev/null'],['SELinux y puerto permitido','test "$(getenforce)" = Enforcing && semanage port -l -C | grep "^http_port_t" | grep -Eq "(^|[ ,])8090([ ,]|$)"',60]],
  },
  {
    id:'sim-05',title:'Simulacro 05 · Usuarios y grupos',classes:[9],
    goal:'Crea olimpo. zeus y hera deben ser miembros secundarios; ares tendrá shell nologin y no pertenecerá a olimpo. Contraseña de los tres: cambiame1.',
    explanation:'La comprobación distingue el grupo principal de los grupos adicionales y verifica las contraseñas reales sin mostrarlas.',
    solution:"groupadd olimpo\nuseradd -m -G olimpo zeus\nuseradd -m -G olimpo hera\nuseradd -m -s /usr/sbin/nologin ares\nprintf 'zeus:cambiame1\\nhera:cambiame1\\nares:cambiame1\\n' | chpasswd\n\nid zeus\nid hera\ngetent passwd ares",
    checks:[['Grupos adicionales','for u in zeus hera; do id -nG "$u" | tr " " "\\n" | grep -Fxq olimpo || exit 1; test "$(id -gn "$u")" != olimpo || exit 1; done'],['ares sin shell ni olimpo','getent passwd ares | grep -Eq ":(/usr)?/sbin/nologin$" && ! id -nG ares | tr " " "\\n" | grep -Fxq olimpo'],['Contraseñas',[passwordCheck('zeus','cambiame1'),passwordCheck('hera','cambiame1'),passwordCheck('ares','cambiame1')].join(' && ')]],
  },
  {
    id:'sim-06',title:'Simulacro 06 · Directorio colaborativo',classes:[6,9,10],
    goal:'Crea /datos/olimpo con propietario root:olimpo y permisos 2770. Los nuevos archivos deben heredar el grupo olimpo.',note:dependency,
    explanation:'SGID conserva el grupo del directorio. No hace falta activar permisos para todos.',
    solution:'mkdir -p /datos/olimpo\nchown root:olimpo /datos/olimpo\nchmod 2770 /datos/olimpo\n\nstat -c "%U:%G %a" /datos/olimpo',
    checks:[['Directorio y propietario','test -d /datos/olimpo && test "$(stat -c %U:%G /datos/olimpo)" = root:olimpo'],['Permisos y SGID','test "$(stat -c %a /datos/olimpo)" = 2770']],
  },
  {
    id:'sim-07',title:'Simulacro 07 · Cron de hera',classes:[7],
    goal:'Programa para hera, cada minuto, logger "Backup diario". Deja cron activo y habilitado; espera al menos un minuto para ver el mensaje en el journal.',note:dependency,
    explanation:'En Debian el servicio se llama cron; en RHEL, crond. La comprobación exige configuración y un mensaje ejecutado realmente.',
    solution:"printf '* * * * * /usr/bin/logger \"Backup diario\"\\n' | crontab -u hera -\nsystemctl enable --now cron\n\ncrontab -u hera -l\n# Espera al siguiente minuto.\njournalctl --no-pager -t hera --since '-3 minutes'",
    checks:[['Tarea cada minuto',`crontab -u hera -l | python3 -c 'import sys,shlex; p=[shlex.split(x) for x in sys.stdin if x.strip() and not x.lstrip().startswith("#")]; assert any(len(x)==7 and x[:5]==["*"]*5 and x[5] in ["logger","/usr/bin/logger"] and x[6]=="Backup diario" for x in p)'`],['Servicio cron',active('cron')],['Mensaje real reciente','journalctl --no-pager --since "-3 minutes" -t hera -o cat | grep -Fxq "Backup diario"']],
  },
  {
    id:'sim-08',title:'Simulacro 08 · Tar y bzip2',classes:[1],
    goal:'Guarda /var/log en /root/varlog-backup.tar.bz2 con tar y compresión bzip2.',
    explanation:'La comprobación valida la compresión y que se hayan archivado archivos de var/log, sin extraerlos sobre el sistema.',
    solution:'tar -cjf /root/varlog-backup.tar.bz2 -C / var/log\n\nbzip2 -t /root/varlog-backup.tar.bz2\ntar -tjf /root/varlog-backup.tar.bz2',
    checks:[['Bzip2 válido','test -f /root/varlog-backup.tar.bz2 && bzip2 -t /root/varlog-backup.tar.bz2'],['Contenido de var/log','tar -tjf /root/varlog-backup.tar.bz2 | grep -Eq "^(\\./)?var/log/.+"']],
  },
  {
    id:'sim-09',title:'Simulacro 09 · Permisos con ACL',classes:[6,10],
    goal:'Copia /etc/hosts a /var/tmp/hosts, root:root y sin ejecución. zeus podrá leer/escribir, ares no podrá leer/escribir y el resto podrá leer.',note:dependency,
    explanation:'ACL permite dar permisos a usuarios concretos sin conceder escritura a todos.',
    solution:'cp /etc/hosts /var/tmp/hosts\nchown root:root /var/tmp/hosts\nchmod 644 /var/tmp/hosts\nsetfacl -m u:zeus:rw-,u:ares:--- /var/tmp/hosts\n\ngetfacl /var/tmp/hosts',
    checks:[['Copia y propietario','cmp -s /etc/hosts /var/tmp/hosts && test "$(stat -c %U:%G /var/tmp/hosts)" = root:root'],['Sin ejecución y lectura para el resto','test $((0$(stat -c %a /var/tmp/hosts) & 0111)) = 0 && getfacl -cp /var/tmp/hosts | grep -Fxq "other::r--"'],['Permisos efectivos de zeus y ares','runuser -u zeus -- test -r /var/tmp/hosts && runuser -u zeus -- test -w /var/tmp/hosts && ! runuser -u ares -- test -r /var/tmp/hosts && ! runuser -u ares -- test -w /var/tmp/hosts']],
  },
  {
    id:'sim-10',title:'Simulacro 10 · Cliente chrony',classes:[7],
    goal:'Sincroniza esta máquina con 10.42.0.11 (ntp.lab.local), servidor chrony de la segunda pestaña. El servicio chrony debe estar activo, habilitado y seleccionar esa fuente.',
    note:'Necesitas la segunda máquina preparada con la práctica «Servidor NFS/NTP». No basta con escribir un nombre de servidor inexistente.',
    explanation:'La comprobación busca la fuente seleccionada ^* en chronyc, no solo una línea en el fichero.',
    solution:"printf '\\n10.42.0.11 ntp.lab.local\\n' >> /etc/hosts\nprintf 'server ntp.lab.local iburst minpoll 0 maxpoll 2\\nmakestep 1 -1\\n' > /etc/chrony/chrony.conf\nrestorecon /etc/chrony/chrony.conf\nsystemctl enable chrony\nsystemctl restart chrony\n\nchronyc -n sources",
    checks:[['Servicio chrony',active('chrony')],['Nombre y configuración','getent ahostsv4 ntp.lab.local | grep -Fq 10.42.0.11 && grep -Eq "^server[[:space:]]+ntp\\.lab\\.local[[:space:]]" /etc/chrony/chrony.conf'],['Fuente realmente seleccionada','chronyc -n sources | grep -Eq "^\\^\\*[[:space:]]+10\\.42\\.0\\.11[[:space:]]"']],
  },
  {
    id:'sim-11',title:'Simulacro 11 · Buscar archivos de hera',classes:[11],
    goal:'Busca los archivos y directorios de hera en el sistema de archivos raíz y cópialos a /root/herafiles conservando sus rutas relativas.',note:dependency+' No se recorren /proc, /sys ni otros sistemas montados.',
    explanation:'--parents evita perder archivos que tienen el mismo nombre en carpetas distintas. Se comprueba que existan copias y que el contenido coincida.',
    solution:"mkdir -p /root/herafiles\ncd /\nfind . -xdev -path ./root/herafiles -prune -o -user hera \\( -type f -o -type d \\) -exec cp -a --parents -t /root/herafiles {} +\n\nfind /root/herafiles -type f",
    checks:[['Copias de los archivos de hera',`test -d /root/herafiles && python3 -c 'import os,pwd; u=pwd.getpwnam("hera").pw_uid; dev=os.stat("/").st_dev; n=0
for root,dirs,files in os.walk("/",followlinks=False):
 dirs[:]=[d for d in dirs if os.path.join(root,d)!="/root/herafiles" and not os.path.islink(os.path.join(root,d)) and os.stat(os.path.join(root,d)).st_dev==dev]
 for name in files:
  p=os.path.join(root,name)
  if not os.path.islink(p) and os.stat(p).st_uid==u:
   q="/root/herafiles"+p; assert os.path.isfile(q) and open(p,"rb").read()==open(q,"rb").read(); n+=1
assert n>0'`]],
  },
  {
    id:'sim-12',title:'Simulacro 12 · Filtrar con grep',classes:[1,11],
    goal:'Guarda en /root/coincidencias todas las líneas de /usr/share/dict/words que contengan rich, respetando el orden y las mayúsculas.',
    explanation:'El diccionario de esta candidata es real. La comparación detecta líneas añadidas, omitidas o reordenadas.',
    solution:'grep rich /usr/share/dict/words > /root/coincidencias\n\nwc -l /root/coincidencias\ncat /root/coincidencias',
    checks:[['Todas las coincidencias',`python3 -c 'a=open("/usr/share/dict/words").readlines(); assert open("/root/coincidencias").read()=="".join(x for x in a if "rich" in x)'`]],
  },
  {
    id:'sim-13',title:'Simulacro 13 · UID concreto',classes:[9],
    goal:'Crea apolo con UID 4120 y contraseña orquidea3.',
    explanation:'El UID debe estar libre. No se aprueba solo por existir una cuenta con ese nombre.',
    solution:"useradd -m -u 4120 apolo\nprintf 'apolo:orquidea3\\n' | chpasswd\n\nid apolo",
    checks:[['UID 4120','test "$(id -u apolo)" = 4120'],['Contraseña',passwordCheck('apolo','orquidea3')]],
  },
  {
    id:'sim-14',title:'Simulacro 14 · Sudo sin contraseña',classes:[9],
    goal:'Permite a zeus administrar con sudo sin contraseña. La configuración debe tener sintaxis válida.',note:dependency,
    explanation:'El fichero de sudoers se verifica antes de usarlo. La comprobación consulta los permisos y ejecuta únicamente id, sin cambiar el sistema.',
    solution:"printf 'zeus ALL=(ALL:ALL) NOPASSWD: ALL\\n' > /etc/sudoers.d/zeus\nchmod 440 /etc/sudoers.d/zeus\nvisudo -cf /etc/sudoers\n\nrunuser -u zeus -- sudo -n id -u",
    checks:[['Sintaxis válida','visudo -cf /etc/sudoers'],['Permiso de administración completo','sudo -l -U zeus | grep -Eq "\\(ALL[ :A-Z]*\\)[[:space:]]+NOPASSWD:[[:space:]]+ALL"'],['Acceso sin contraseña','test "$(runuser -u zeus -- sudo -n id -u)" = 0']],
  },
  {
    id:'sim-15',title:'Simulacro 15 · LV por extents',classes:[5,6],
    goal:'En /dev/sdb1, crea datavg con extents de 4 MiB y appvol de 60 extents (240 MiB). Usa ext4 y montaje persistente en /mnt/appvol.',
    note:'Empieza con /dev/sdb vacío. Esta solución reserva la primera mitad para LVM y deja espacio para las prácticas de swap/XFS. No uses /dev/sda. La comprobación de fstab debe repetirse tras reiniciar.',
    explanation:'60 extents de 4 MiB equivalen a 240 MiB. No confundas extents con megabytes.',
    solution:"lsblk /dev/sdb\n# Solo si el disco de prácticas está vacío:\nparted -s /dev/sdb mklabel gpt mkpart LVM 1MiB 1024MiB set 1 lvm on\npartprobe /dev/sdb\nudevadm settle\npvcreate /dev/sdb1\nvgcreate -s 4M datavg /dev/sdb1\nlvcreate -l 60 -n appvol datavg\nmkfs.ext4 /dev/datavg/appvol\nmkdir -p /mnt/appvol\nmount /dev/datavg/appvol /mnt/appvol\nrestorecon -RF /mnt/appvol\nprintf 'UUID=%s /mnt/appvol ext4 defaults 0 2\\n' \"$(blkid -s UUID -o value /dev/datavg/appvol)\" >> /etc/fstab\nsystemctl daemon-reload\n\nlvs datavg\nfindmnt --verify",
    checks:[['VG y 60 extents','test "$(pvs --noheadings -o vg_name /dev/sdb1 | tr -d " \\n")" = datavg && test "$(vgs --noheadings --units b --nosuffix -o vg_extent_size datavg | tr -d " \\n")" = 4194304 && test "$(blockdev --getsize64 /dev/datavg/appvol)" = 251658240'],['Ext4 montado',mounted('/mnt/appvol','/dev/datavg/appvol','ext4')],['Montaje persistente',fstab('/dev/datavg/appvol','/mnt/appvol','ext4')]],
  },
  {
    id:'sim-16',title:'Simulacro 16 · Swap persistente',classes:[5],
    goal:'Después de la práctica 15, crea /dev/sdb2 como swap de 512 MiB, actívala y añádela a fstab.',
    note:'Requiere espacio libre de 1024 a 1536 MiB en /dev/sdb. Consulta parted print free antes. No vuelvas a crear la tabla GPT.',
    explanation:'mkswap prepara el área y swapon la activa. fstab conserva la configuración; reinicia para comprobar la persistencia real.',
    solution:"parted /dev/sdb unit MiB print free\nparted -s /dev/sdb mkpart SWAP linux-swap 1024MiB 1536MiB\npartprobe /dev/sdb\nudevadm settle\nmkswap /dev/sdb2\nswapon /dev/sdb2\nprintf 'UUID=%s none swap defaults 0 0\\n' \"$(blkid -s UUID -o value /dev/sdb2)\" >> /etc/fstab\nsystemctl daemon-reload\n\nswapon --show",
    checks:[['Tamaño y formato','test "$(blockdev --getsize64 /dev/sdb2)" = 536870912 && test "$(blkid -s TYPE -o value /dev/sdb2)" = swap'],['Swap activa','swapon --show=NAME --noheadings --raw | grep -Fxq /dev/sdb2'],['Configuración persistente',fstab('/dev/sdb2','none','swap')]],
  },
  {
    id:'sim-17',title:'Simulacro 17 · Reducir ext4 sin perder datos',classes:[5,6],
    goal:'En datavg, crea reducible de 512 MiB con ext4 y un archivo dato con CONSERVAR. Desmóntalo y redúcelo a 248 MiB; vuelve a montarlo en /mnt/reducible conservando el archivo.',
    note:'Requiere la práctica 15. No reduzcas XFS. La comprobación verifica tamaño y dato final; no acredita por sí sola cada paso intermedio.',
    explanation:'Para reducir ext4 debe estar desmontado. -r reduce también el sistema de archivos, no únicamente el dispositivo.',
    solution:"lvcreate -L 512M -n reducible datavg\nmkfs.ext4 /dev/datavg/reducible\nmkdir -p /mnt/reducible\nmount /dev/datavg/reducible /mnt/reducible\nrestorecon -RF /mnt/reducible\necho CONSERVAR > /mnt/reducible/dato\numount /mnt/reducible\nlvreduce -r -L 248M /dev/datavg/reducible\nmount /dev/datavg/reducible /mnt/reducible\n\ncat /mnt/reducible/dato\nlvs datavg",
    interactive:true,
    checks:[['Tamaño 248 MiB','test "$(blockdev --getsize64 /dev/datavg/reducible)" = 260046848'],['Ext4 montado',mounted('/mnt/reducible','/dev/datavg/reducible','ext4')],['Dato conservado','test "$(cat /mnt/reducible/dato)" = CONSERVAR']],
  },
  {
    id:'sim-18',title:'Simulacro 18 · Perfil tuned',classes:[4],
    goal:'Activa virtual-guest y verifica que sus ajustes se aplican realmente.',
    note:'No se copia virtual-host del simulador anterior: esta máquina es un invitado. Se pide un perfil concreto para que el objetivo no dependa de una autodetección distinta.',
    explanation:'Además del perfil guardado se verifica el servicio, tuned-adm verify y swappiness efectivo.',
    solution:'tuned-adm profile virtual-guest\n\ntuned-adm active\ntuned-adm verify\nsysctl vm.swappiness',
    checks:[['Perfil y servicio','systemctl is-active --quiet tuned && test "$(cat /etc/tuned/active_profile)" = virtual-guest'],['Ajustes aplicados','tuned-adm verify && test "$(sysctl -n vm.swappiness)" = 30']],
  },
  {
    id:'sim-19',title:'Simulacro 19 · Script de saludo',classes:[3],
    goal:'Crea /usr/local/bin/saludo, ejecutable por todos, que imprima Hola equipo olimpo. Debe ser un script Bash simple y válido.',
    explanation:'La comprobación lee el script y valida sintaxis y permisos, sin ejecutar código escrito por el alumno como root. Prueba tú su salida desde la terminal.',
    solution:"printf '#!/bin/bash\\necho \"Hola equipo olimpo\"\\n' > /usr/local/bin/saludo\nchmod 755 /usr/local/bin/saludo\n\n/usr/local/bin/saludo",
    checks:[['Script válido y ejecutable','test -f /usr/local/bin/saludo && bash -n /usr/local/bin/saludo && test $((0$(stat -c %a /usr/local/bin/saludo) & 0111)) = 73'],['Saludo simple',`python3 -c 'p=open("/usr/local/bin/saludo").read().splitlines(); p=[x.strip() for x in p if x.strip() and not x.lstrip().startswith("#")]; assert p in [["echo \\\"Hola equipo olimpo\\\""],["printf \\\"Hola equipo olimpo\\\\n\\\""]]'`]],
  },
  {
    id:'sim-20',title:'Simulacro 20 · Web, SELinux y firewall',classes:[8,10],
    goal:'Sirve el texto WEB_OLIMPO desde /sitio/web/index.html en http://127.0.0.1/. Configura permisos, etiqueta SELinux persistente y firewall HTTP permanente.',
    explanation:'Se usa un VirtualHost de Apache real. La comprobación exige contenido HTTP, contexto actual/persistente y reglas de firewall; no basta con un servicio activo.',
    solution:"mkdir -p /sitio/web\necho WEB_OLIMPO > /sitio/web/index.html\nchmod 755 /sitio /sitio/web\nchmod 644 /sitio/web/index.html\nsemanage fcontext -a -t httpd_sys_content_t '/sitio/web(/.*)?'\nrestorecon -RF /sitio/web\nprintf '<VirtualHost *:80>\\nDocumentRoot /sitio/web\\n<Directory /sitio/web>\\nRequire all granted\\n</Directory>\\n</VirtualHost>\\n' > /etc/apache2/sites-available/olimpo.conf\na2dissite 000-default\na2ensite olimpo\nsystemctl enable apache2\nsystemctl restart apache2\nfirewall-cmd --permanent --add-service=http\nfirewall-cmd --reload\n\ncurl http://127.0.0.1/",
    checks:[['Respuesta real','test "$(curl --max-time 5 -fsS http://127.0.0.1/)" = WEB_OLIMPO'],['Servicio y firewall',active('apache2')+' && firewall-cmd --query-service=http && firewall-cmd --permanent --query-service=http'],['Etiquetas y Enforcing','test "$(getenforce)" = Enforcing && test "$(stat -c %C /sitio/web/index.html | cut -d: -f3)" = httpd_sys_content_t && test "$(matchpathcon -n /sitio/web/index.html | cut -d: -f3)" = httpd_sys_content_t']],
  },
  {
    id:'sim-21',title:'Simulacro 21 · Podman como servicio de usuario',classes:[11],
    goal:'Como hermes, importa la imagen local, crea webapp con /opt/entrada → /data/in y /opt/salida → /data/out, genera su unidad de usuario y activa linger. El contenedor debe arrancar automáticamente tras reiniciar.',
    note:'No hay registro externo: importa /srv/curso-contenedor/imagen.tar como localhost/curso-busybox:1. Tras reiniciar, entra por SSH como hermes y escribe export PS1="V86USER$ " para usar el botón de comprobación desde su sesión real. No lo compruebes desde root.',
    explanation:'Root prepara y etiqueta solo estos dos directorios de /opt. Después hermes ejecuta Podman/systemctl --user por SSH. :Z asigna las etiquetas privadas del contenedor; no hace falta desactivar SELinux.',
    solution:"useradd -m -U -s /bin/bash hermes\npasswd hermes\nmkdir -p /opt/entrada /opt/salida\nchown hermes:hermes /opt/entrada /opt/salida\nsemanage fcontext -a -t container_file_t '/opt/(entrada|salida)(/.*)?'\nrestorecon -RF /opt/entrada /opt/salida\nloginctl enable-linger hermes\nsystemctl start ssh\nssh hermes@localhost\n# Ahora dentro de la sesión de hermes:\npodman import /srv/curso-contenedor/imagen.tar localhost/curso-busybox:1\npodman run -d --name webapp -v /opt/entrada:/data/in:Z -v /opt/salida:/data/out:Z localhost/curso-busybox:1 /bin/busybox sleep 86400\npodman generate systemd --name webapp --files --new\npodman rm -f webapp\nmkdir -p ~/.config/systemd/user\nmv container-webapp.service ~/.config/systemd/user/\n/usr/sbin/restorecon -RF ~/.config/systemd\nsystemctl --user daemon-reload\nsystemctl --user enable --now container-webapp.service\nexit\n# De nuevo como root:\nreboot\n# Tras arrancar, vuelve a la sesión de hermes:\nssh hermes@localhost\nexport PS1='V86USER$ '\n# Ahora pulsa Comprobar ejercicio.",
    interactive:true,checkUser:'hermes',
    checks:[['Cuenta y linger','test "$(loginctl show-user hermes -p Linger --value)" = yes'],['Servicio del usuario','test -f "$HOME/.config/systemd/user/container-webapp.service" && systemctl --user is-active --quiet container-webapp.service && systemctl --user is-enabled --quiet container-webapp.service'],['Contenedor y volúmenes','test -d "$HOME/.local/share/containers/storage/libpod" && podman inspect webapp | python3 -c \'import json,sys; c=json.load(sys.stdin)[0]; assert c["State"]["Running"]; m={(x["Source"],x["Destination"]) for x in c["Mounts"]}; assert {("/opt/entrada","/data/in"),("/opt/salida","/data/out")} <= m\'']],
  },
];
