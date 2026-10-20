const tasks=[];
const add=(id,title,goal,solution,checks)=>tasks.push({id:'repaso-'+id,title,goal,solution,checks,classes:[],practiceExam:true,group:'EXAMEN',order:tasks.length});
add('usuarios','Cuentas de un equipo','Crea operaciones y la cuenta luna con Bash, directorio personal y operaciones como grupo secundario. Su contraseña tendrá una validez máxima de 60 días y aviso de 5 días.',
 'groupadd operaciones\nuseradd -m -s /bin/bash -G operaciones luna\nchage -M 60 -W 5 luna\nid luna\nchage -l luna',
 [['Cuenta y pertenencia','getent passwd luna | grep -q ":/home/luna:/bin/bash$" && test -d /home/luna && id -nG luna | tr " " "\\n" | grep -Fxq operaciones && test "$(id -gn luna)" != operaciones'],['Política de contraseña','test "$(getent shadow luna | cut -d: -f5)" = 60 && test "$(getent shadow luna | cut -d: -f6)" = 5']]);
add('directorio','Un directorio de trabajo','Usa operaciones del ejercicio anterior. Crea /datos/turno para root y operaciones: ambos tendrán acceso completo, los demás ninguno. Los archivos nuevos deben heredar operaciones.',
 'mkdir -p /datos/turno\nchown root:operaciones /datos/turno\nchmod 2770 /datos/turno\nls -ld /datos/turno',
 [['Propiedad y permisos','test -d /datos/turno && test "$(stat -c %U:%G /datos/turno)" = root:operaciones && test "$(stat -c %a /datos/turno)" = 2770']]);
add('cron','Una tarea de mantenimiento','Programa para root, de lunes a viernes a las 18:20, logger "Revision del laboratorio". Conserva las tareas existentes.',
 'crontab -e\n# Añade: 20 18 * * 1-5 logger "Revision del laboratorio"\ncrontab -l',
 [['Horario y comando','crontab -l | python3 -c \'import sys,shlex; rows=[shlex.split(x) for x in sys.stdin if x.strip() and not x.lstrip().startswith("#")]; assert any(a[:5]==["20","18","*","*","1-5"] and a[5] in ["logger","/usr/bin/logger"] and " ".join(a[6:])=="Revision del laboratorio" for a in rows if len(a)>6)\'']]);
add('texto','Filtrar un registro','Crea /root/registro-repaso.txt con aviso 10, ERROR 20, error 30 y INFO 40 en ese orden y en líneas separadas. Guarda en /root/incidencias.txt las líneas que comiencen por ERROR, sin distinguir mayúsculas de minúsculas y conservando el orden.',
 "printf 'aviso 10\\nERROR 20\\nerror 30\\nINFO 40\\n' > /root/registro-repaso.txt\ngrep -i '^ERROR' /root/registro-repaso.txt > /root/incidencias.txt\ncat /root/incidencias.txt",
 [['Líneas correctas','test "$(cat /root/incidencias.txt)" = "$(printf \'ERROR 20\\nerror 30\')" && test "$(cat /root/registro-repaso.txt)" = "$(printf \'aviso 10\\nERROR 20\\nerror 30\\nINFO 40\')"']]);
add('umask','Permisos iniciales de trabajo','Como root, crea /root/privado-repaso y dentro informe.txt con Revision. Mediante una máscara apropiada, los permisos iniciales serán 750 para el directorio y 640 para el archivo.',
 'umask 027\nmkdir /root/privado-repaso\necho Revision > /root/privado-repaso/informe.txt\nls -ld /root/privado-repaso\nls -l /root/privado-repaso/informe.txt\numask 022',
 [['Contenido y permisos','test "$(cat /root/privado-repaso/informe.txt)" = Revision && test "$(stat -c %a /root/privado-repaso)" = 750 && test "$(stat -c %a /root/privado-repaso/informe.txt)" = 640']]);
add('selinux','Publicación con etiqueta persistente','Crea /srv/repaso-web/index.html con Repaso. Configura la etiqueta persistente httpd_sys_content_t para el directorio y sus archivos, sin desactivar SELinux.',
 "mkdir -p /srv/repaso-web\necho Repaso > /srv/repaso-web/index.html\nsemanage fcontext -a -t httpd_sys_content_t '/srv/repaso-web(/.*)?'\nrestorecon -RF /srv/repaso-web\nls -Zd /srv/repaso-web /srv/repaso-web/index.html",
 [['Contexto y contenido','test "$(getenforce)" = Enforcing && test "$(cat /srv/repaso-web/index.html)" = Repaso && test "$(stat -c %C /srv/repaso-web/index.html | cut -d: -f3)" = httpd_sys_content_t && test "$(stat -c %C /srv/repaso-web | cut -d: -f3)" = httpd_sys_content_t && test "$(matchpathcon -n /srv/repaso-web/index.html | cut -d: -f3)" = httpd_sys_content_t']]);
add('firewall','Acceso a un puerto de prácticas','Autoriza 8094/tcp en el firewall, tanto ahora como al arrancar. No elimines otras reglas ni desactives el servicio.',
 'systemctl enable --now firewalld\nfirewall-cmd --permanent --add-port=8094/tcp\nfirewall-cmd --reload\nfirewall-cmd --query-port=8094/tcp',
 [['Regla activa y persistente','systemctl is-active --quiet firewalld && systemctl is-enabled --quiet firewalld && firewall-cmd --query-port=8094/tcp && firewall-cmd --permanent --query-port=8094/tcp']]);
add('almacenamiento','Un volumen persistente','Con /dev/sdb vacío, crea el PV sobre ese disco y el VG repaso. Crea repaso/archivos de 128 MiB, formatéalo como ext4 y móntalo persistentemente en /mnt/repaso usando su UUID. No toques /dev/sda.',
 'lsblk /dev/sdb\n# Continúa solo con el disco de prácticas vacío.\npvcreate /dev/sdb\nvgcreate repaso /dev/sdb\nlvcreate -L 128M -n archivos repaso\nmkfs.ext4 /dev/repaso/archivos\nmkdir -p /mnt/repaso\nblkid /dev/repaso/archivos\nvi /etc/fstab\n# Añade: UUID=<UUID mostrado> /mnt/repaso ext4 defaults 0 2\nsystemctl daemon-reload\nmount -a\nfindmnt /mnt/repaso',
 [['Volumen y montaje','test "$(blockdev --getsize64 /dev/repaso/archivos)" = 134217728 && test "$(blkid -s TYPE -o value /dev/repaso/archivos)" = ext4 && mountpoint -q /mnt/repaso && test "$(readlink -f "$(findmnt -rn -M /mnt/repaso -o SOURCE)")" = "$(readlink -f /dev/repaso/archivos)"'],['Entrada persistente','uuid=$(blkid -s UUID -o value /dev/repaso/archivos) && test -n "$uuid" && awk -v u="UUID=$uuid" \'$1==u && $2=="/mnt/repaso" && $3=="ext4" && $4 !~ /noauto/ {ok=1} END {exit !ok}\' /etc/fstab']]);
add('enlaces','Un acceso al directorio de informes','Crea /srv/informes-repaso y un enlace simbólico /root/informes-repaso que apunte a ese directorio.',
 'mkdir -p /srv/informes-repaso\nln -s /srv/informes-repaso /root/informes-repaso',
 [['Directorio y enlace','test -d /srv/informes-repaso && test -L /root/informes-repaso && test "$(readlink -f /root/informes-repaso)" = /srv/informes-repaso']]);
add('tar','Una copia comprimida','Crea /srv/archivo-repaso/dato.txt con el texto Copia. Archiva el directorio archivo-repaso y su contenido en /root/copia-repaso.tar.gz, usando compresión gzip y nombres relativos a /srv.',
 'mkdir -p /srv/archivo-repaso\necho Copia > /srv/archivo-repaso/dato.txt\ntar -czf /root/copia-repaso.tar.gz -C /srv archivo-repaso',
 [['Contenido real del archivo comprimido','test "$(tar -xOzf /root/copia-repaso.tar.gz archivo-repaso/dato.txt)" = Copia']]);
add('find','Localizar archivos de una cuenta','Crea la cuenta busqueda-repaso con directorio personal y /home/busqueda-repaso/dato.txt, propiedad de esa cuenta. Guarda en /root/rutas-repaso.txt las rutas de los archivos regulares de esa cuenta situados en su directorio personal, uno por línea.',
 'useradd -m busqueda-repaso\ntouch /home/busqueda-repaso/dato.txt\nchown busqueda-repaso:busqueda-repaso /home/busqueda-repaso/dato.txt\nfind /home/busqueda-repaso -type f -user busqueda-repaso > /root/rutas-repaso.txt',
 [['Lista completa de archivos','test -f /home/busqueda-repaso/dato.txt && test "$(stat -c %U /home/busqueda-repaso/dato.txt)" = busqueda-repaso && test "$(find /home/busqueda-repaso -type f -user busqueda-repaso | sort)" = "$(sort /root/rutas-repaso.txt)"']]);
add('servicio','Un servicio habilitado','Haz que cron esté en ejecución y arranque automáticamente en los siguientes inicios del sistema.',
 'systemctl enable --now cron\nsystemctl is-active cron\nsystemctl is-enabled cron',
 [['Servicio activo y habilitado','systemctl is-active --quiet cron && systemctl is-enabled --quiet cron']]);
add('journal','Guardar mensajes de arranque','Guarda en /root/arranque-repaso.txt los mensajes del journal correspondientes al arranque actual, sin paginador.',
 'journalctl -b --no-pager > /root/arranque-repaso.txt',
 [['Registro con mensajes del arranque','test -s /root/arranque-repaso.txt && first=$(journalctl -b --no-pager -o cat | sed -n "1p") && test -n "$first" && grep -Fq "$first" /root/arranque-repaso.txt']]);
add('tuned','Un perfil de rendimiento','Activa el perfil balanced de TuneD y deja su servicio habilitado para los próximos arranques.',
 'systemctl enable --now tuned\ntuned-adm profile balanced\ntuned-adm active',
 [['Perfil y servicio persistente','systemctl is-active --quiet tuned && systemctl is-enabled --quiet tuned && test "$(cat /etc/tuned/active_profile)" = balanced']]);
add('script','Un script con argumento','Crea /usr/local/bin/saluda-repaso. Recibirá un nombre como primer argumento y mostrará Hola seguido de ese nombre en una sola línea. Debe ser ejecutable.',
 'cat > /usr/local/bin/saluda-repaso <<\'EOF\'\n#!/bin/bash\necho "Hola $1"\nEOF\nchmod +x /usr/local/bin/saluda-repaso\nsaluda-repaso Ana',
 [['Script ejecutable y argumento variable','test -x /usr/local/bin/saluda-repaso && test "$(/usr/local/bin/saluda-repaso Ana)" = "Hola Ana" && test "$(/usr/local/bin/saluda-repaso Luis)" = "Hola Luis"']]);
add('acl','Acceso adicional sin abrir el archivo','Crea la cuenta auditor-repaso y /var/tmp/auditoria-repaso con el texto Informe. root seguirá siendo el propietario. Solo root y auditor-repaso podrán leerlo; auditor-repaso no podrá modificarlo.',
 'useradd -m auditor-repaso\necho Informe > /var/tmp/auditoria-repaso\nchmod 600 /var/tmp/auditoria-repaso\nsetfacl -m u:auditor-repaso:r-- /var/tmp/auditoria-repaso\ngetfacl /var/tmp/auditoria-repaso',
 [['Permisos efectivos y contenido','test "$(cat /var/tmp/auditoria-repaso)" = Informe && test "$(stat -c %U /var/tmp/auditoria-repaso)" = root && runuser -u auditor-repaso -- test -r /var/tmp/auditoria-repaso && ! runuser -u auditor-repaso -- test -w /var/tmp/auditoria-repaso && getfacl -cp /var/tmp/auditoria-repaso | grep -Fxq other::---']]);
add('hostname','Identidad del equipo','Configura equipo-repaso.example.com como nombre permanente del equipo.',
 'hostnamectl set-hostname equipo-repaso.example.com\nhostnamectl',
 [['Nombre actual y persistente','test "$(hostname)" = equipo-repaso.example.com && test "$(cat /etc/hostname)" = equipo-repaso.example.com']]);
add('red','Un perfil de conexión estática','Crea el perfil NetworkManager repaso-estatico para eth0, con IPv4 manual 10.42.0.20/24, puerta de enlace y DNS 10.42.0.1 y conexión automática habilitada. No es necesario interrumpir la conexión actual.',
 'nmcli connection add type ethernet ifname eth0 con-name repaso-estatico ipv4.method manual ipv4.addresses 10.42.0.20/24 ipv4.gateway 10.42.0.1 ipv4.dns 10.42.0.1 connection.autoconnect yes\nnmcli connection show repaso-estatico',
 [['Perfil guardado','test "$(nmcli -g ipv4.method connection show repaso-estatico)" = manual && test "$(nmcli -g ipv4.addresses connection show repaso-estatico)" = 10.42.0.20/24 && test "$(nmcli -g ipv4.gateway connection show repaso-estatico)" = 10.42.0.1 && test "$(nmcli -g ipv4.dns connection show repaso-estatico)" = 10.42.0.1 && test "$(nmcli -g connection.autoconnect connection show repaso-estatico)" = yes']]);
add('rpm','Consultar un paquete instalado','Instala lab-base desde los repositorios locales de prácticas y guarda su información en /root/paquete-repaso.txt.',
 'dnf install -y lab-base\nrpm -qi lab-base > /root/paquete-repaso.txt',
 [['Información de un paquete real','rpm -q lab-base && test -s /root/paquete-repaso.txt && grep -qw lab-base /root/paquete-repaso.txt']]);
add('caducidad','Una cuenta temporal','Crea temporal-repaso con directorio personal, sin shell interactiva y con fecha de caducidad de la cuenta 2030-12-31.',
 'useradd -m -s /usr/sbin/nologin -e 2030-12-31 temporal-repaso\nchage -l temporal-repaso',
 [['Cuenta y fecha de caducidad','getent passwd temporal-repaso | grep -Eq ":/home/temporal-repaso:/(usr/)?sbin/nologin$" && test -d /home/temporal-repaso && test "$(getent shadow temporal-repaso | cut -d: -f8)" = "$(($(date -u -d 2030-12-31 +%s)/86400))"']]);
add('swap','Un archivo swap persistente','Crea /swap-repaso de 128 MiB, con permisos 600, úsalo como swap y configura su activación persistente. No desactives las otras áreas swap.',
 'dd if=/dev/zero of=/swap-repaso bs=1M count=128\nchmod 600 /swap-repaso\nmkswap /swap-repaso\nswapon /swap-repaso\necho "/swap-repaso none swap defaults 0 0" >> /etc/fstab',
 [['Swap activa y persistente','test "$(stat -c %s /swap-repaso)" = 134217728 && test "$(stat -c %a /swap-repaso)" = 600 && swapon --show=NAME --noheadings | grep -Fxq /swap-repaso && awk \'$1=="/swap-repaso" && $3=="swap" && $4 !~ /noauto/ {ok=1} END {exit !ok}\' /etc/fstab']]);
add('proceso','Gestionar un proceso propio','Inicia sleep 3600 en segundo plano y guarda su PID en /root/proceso-repaso.pid. Asígnale una prioridad nice de 10, sin afectar a otros procesos.',
 'sleep 3600 &\necho $! > /root/proceso-repaso.pid\nrenice -n 10 -p $(cat /root/proceso-repaso.pid)',
 [['Proceso y prioridad','pid=$(cat /root/proceso-repaso.pid) && test "$(ps -p "$pid" -o comm= | xargs)" = sleep && test "$(ps -p "$pid" -o ni= | xargs)" = 10']]);
export const linuxExamPractice=Object.freeze(tasks);
