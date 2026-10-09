import {courseExercises} from './v86-course-exercises.mjs?v=20261008-console';
import {extraExercises} from './v86-extra-exercises.mjs?v=20261008-console';
import {introExercises, shellQuote} from './v86-exercises.mjs?v=20261009-exam';

const course = id => structuredClone(courseExercises.find(e => e.id === `sim-${String(id).padStart(2,'0')}`));
const extra = id => structuredClone(extraExercises.find(e => e.id === `curso-${id}`));
const question = (number, node, points, exercise, observations, changes={}) => ({
  ...exercise, ...changes, id:`exam-${number}`, number, node, points,
  title: changes.title||exercise.title.replace(/^(Simulacro \d+|Curso) · /,''),
  note:'', observations, checkUser:undefined,
});
const users = course(5), sudo = course(14);
const lv = course(15), swap = course(16), reduce = course(17);
const examDisk=`exam_pv=$(pvs --noheadings -o pv_name -S vg_name=seedvg | xargs) && test -b "$exam_pv" && exam_disk="/dev/$(lsblk -no PKNAME "$exam_pv")" && test -b "$exam_disk" && test "$(blockdev --getsize64 "$exam_disk")" = 2147483648`;
const diskIdentification=examDisk+' || { echo "No se ha identificado el disco de prácticas de 2 GiB"; exit 1; }\nlsblk "$exam_disk"\n';
const podman = course(21);
const asHermes = command => `uid=$(id -u hermes) && test -S /run/user/$uid/bus && runuser -u hermes -- env HOME=/home/hermes XDG_RUNTIME_DIR=/run/user/$uid DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$uid/bus /bin/sh -c ${shellQuote(`cd /home/hermes && ${command}`)}`;

// Ejercicios originales de aprendizaje. Ni preguntas filtradas ni baremo oficial.
export const examQuestions = [
  question(1,1,20,course(2),[['Red y perfiles','ip -4 addr show eth0; nmcli con show examen; hostnamectl']],{note:'La red del examen es privada. El servidor 10.42.0.11 ya está preparado en la máquina 2.'}),
  question(2,1,10,course(3),[['Repositorio','cat /etc/yum.repos.d/curso.repo; rpm -q gpg-pubkey']]),
  question(3,1,15,course(4),[['Servicio y puerto','systemctl is-active apache2; ss -ltn; getenforce; curl --max-time 5 -sS http://127.0.0.1:8090/']]),
  question(4,1,20,users,[['Cuentas y sudo','id zeus; id hera; getent passwd ares; sudo -l -U zeus']],{goal:users.goal+' '+sudo.goal,checks:[...users.checks,...sudo.checks],solution:users.solution+'\n\n'+sudo.solution}),
  question(5,1,10,extra('caducidad'),[['Caducidad y archivo','chage -l hera; stat -c "%U:%G %a" /home/hera/umask-curso; cat /home/hera/umask-curso']]),
  question(6,1,10,course(7),[['Cron y journal','crontab -u hera -l; systemctl is-active cron; journalctl --no-pager -t hera -o cat -n 10']],{checks:course(7).checks.map((c,i)=>i===2?[c[0],`journalctl --no-pager -t hera -o cat | grep -Fxq "Backup diario"`]:c)}),
  question(7,1,20,extra('autofs'),[['Mapas y montaje','cat /etc/auto.master.d/curso.autofs /etc/auto.curso; findmnt -M /mnt/curso-auto/datos']],{note:'El servidor está en la máquina 2. Durante su recuperación/reinicio no está disponible; vuelve a comprobar cuando termine de arrancar.'}),
  question(8,1,10,course(8),[['Archivo comprimido','ls -l /root/varlog-backup.tar.bz2; tar -tjf /root/varlog-backup.tar.bz2 | head -n 20']]),
  question(9,1,15,course(9),[['Permisos efectivos','stat -c "%U:%G %a" /var/tmp/hosts; getfacl -cp /var/tmp/hosts']],{
    note:'Puedes copiar antes o después de añadir las entradas del hostname/NTP. La corrección ignora esas entradas y las líneas vacías; el resto de la copia se comprueba.',
    checks:course(9).checks.map((c,i)=>i===0?['Copia y propietario',`test "$(stat -c %U:%G /var/tmp/hosts)" = root:root && python3 -c 'def clean(p):\n return [x for x in open(p).readlines() if x.strip() and not {"ntp.lab.local","nodo1.lab.local"}.intersection(x.split())]\nassert clean("/etc/hosts")==clean("/var/tmp/hosts")'`]:c),
  }),
  question(10,1,15,course(10),[['Chrony','cat /etc/chrony/chrony.conf; chronyc -n sources']],{goal:course(10).goal.replace('de la segunda pestaña','de la máquina 2')}),
  question(11,1,10,course(11),[['Archivos copiados','find /root/herafiles -type f | head -n 30']]),
  question(12,1,10,course(12),[['Resultado de grep','wc -l /root/coincidencias; head -n 20 /root/coincidencias']]),
  question(13,1,10,course(13),[['Cuenta','getent passwd apolo; id apolo']]),
  question('root',2,20,course(1),[['Estado tras recuperar root','cat /proc/1/comm; getenforce; test -e /.autorelabel && echo "Reetiquetado pendiente"; systemctl show serial-getty@ttyS0.service -p ExecStart --value']],{title:'Recuperar la contraseña de root',note:'La contraseña inicial no se proporciona. La recuperación y el reetiquetado pueden tardar aproximadamente 5–10 minutos.',solution:course(1).solution.replace('# Abre la máquina de recuperación y pulsa Iniciar laboratorio.\n# Si ya pasó GRUB, pulsa Reiniciar máquina (GRUB).','# Trabaja en la máquina 2.\n# Si ya pasó GRUB, pulsa Reiniciar máquina.')}),
  question(14,2,10,introExercises.find(e=>e.id==='dnf'),[['RPM instalado','rpm -q lab-notas lab-base; cat /usr/share/s2ktux-lab/lab-notas/version.txt']]),
  question(15,2,20,lv,[['Volúmenes y montaje','pvs; vgs; lvs; findmnt -M /mnt/appvol; cat /etc/fstab']],{
    goal:'Identifica el disco de prácticas de 2 GiB con lsblk y pvs: su partición 1 contiene seedvg/reducible y no debe borrarse. Crea la partición 2 entre 769 y 1535 MiB y, sobre ella, datavg con extents de 4 MiB y appvol de 60 extents (240 MiB). Usa ext4 y montaje persistente en /mnt/appvol. Los nombres sda/sdb pueden cambiar al reiniciar.',
    solution:diskIdentification+lv.solution.replace('lsblk /dev/sdb\n# Solo si el disco de prácticas está vacío:\nparted -s /dev/sdb mklabel gpt mkpart LVM 1MiB 1024MiB set 1 lvm on','parted -s "$exam_disk" mkpart LVM 769MiB 1535MiB set 2 lvm on').replaceAll('/dev/sdb1','"${exam_disk}2"').replaceAll('/dev/sdb','"$exam_disk"'),
    checks:lv.checks.map((c,i)=>[c[0],i===0?examDisk+' && '+c[1].replaceAll('/dev/sdb1','"${exam_disk}2"'):c[1],c[2]]),
  }),
  question(16,2,10,swap,[['Swap','lsblk -f; swapon --show; cat /etc/fstab']],{
    goal:'En el mismo disco de prácticas de 2 GiB, crea la partición 3 entre 1535 y 2047 MiB como swap de 512 MiB. Actívala y configura su uso persistente en fstab. No borres las particiones existentes.',
    solution:diskIdentification+swap.solution.replaceAll('/dev/sdb2','${exam_disk}3').replaceAll('/dev/sdb','"$exam_disk"').replace('1024MiB 1536MiB','1535MiB 2047MiB'),
    checks:swap.checks.map(c=>[c[0],examDisk+' && '+c[1].replaceAll('/dev/sdb2','${exam_disk}3'),c[2]]),
  }),
  question(17,2,20,reduce,[['Tamaño, montaje y dato','lvs seedvg; findmnt -M /mnt/reducible; cat /mnt/reducible/dato']],{
    goal:'Reduce el LV existente seedvg/reducible de 512 a 248 MiB, también su ext4, sin perder el archivo dato con CONSERVAR. Déjalo montado en /mnt/reducible y conserva su entrada de fstab.',
    solution:'umount /mnt/reducible\ne2fsck -f /dev/seedvg/reducible\nlvreduce -r -L 248M /dev/seedvg/reducible\nmount /mnt/reducible\ncat /mnt/reducible/dato\nlvs seedvg',
    checks:[...reduce.checks.map(c=>[c[0],`test "$(blockdev --getsize64 /dev/seedvg/reducible)" = 260046848 && `+c[1].replaceAll('/dev/datavg/reducible','/dev/seedvg/reducible'),c[2]]),['Montaje persistente','test "$(blockdev --getsize64 /dev/seedvg/reducible)" = 260046848 && uuid=$(blkid -s UUID -o value /dev/seedvg/reducible) && awk -v u="UUID=$uuid" \'$0 !~ /^#/ && ($1==u || $1=="/dev/seedvg/reducible" || $1=="/dev/mapper/seedvg-reducible") && $2=="/mnt/reducible" && $3=="ext4" {n++} END {exit n!=1}\' /etc/fstab']],
  }),
  question(18,2,10,course(18),[['Perfil y ajustes','tuned-adm active; tuned-adm verify; sysctl vm.swappiness']]),
  question(19,2,10,course(19),[['Script','stat -c "%U:%G %a" /usr/local/bin/saludo; cat /usr/local/bin/saludo']],{checks:[course(19).checks[0],['Salida real sin privilegios','test "$(runuser -u nobody -- timeout -k 2 3 /usr/local/bin/saludo)" = "Hola equipo olimpo"']]}),
  question(20,2,10,{
    title:'Construir una imagen con Podman',
    goal:'Crea hermes con home, Bash y contraseña cambiame1. Como hermes, importa /srv/curso-contenedor/imagen.tar con el nombre localhost/curso-busybox:1 y construye localhost/curso-examen:1 con LABEL curso=examen, usando esa base local. No necesita Internet.',
    solution:"useradd -m -U -s /bin/bash hermes\nprintf 'hermes:cambiame1\\n' | chpasswd\nloginctl enable-linger hermes\nsystemctl start ssh\nssh hermes@localhost\npodman import /srv/curso-contenedor/imagen.tar localhost/curso-busybox:1\nmkdir -p ~/imagen-examen\nprintf 'FROM localhost/curso-busybox:1\\nLABEL curso=examen\\n' > ~/imagen-examen/Containerfile\npodman build -t localhost/curso-examen:1 ~/imagen-examen\nexit",
    checks:[['Cuenta y contraseña','getent passwd hermes | grep -Eq ":/home/hermes:/bin/bash$" && printf \'cambiame1\\0\' | /usr/sbin/unix_chkpwd hermes nonull'],['Imagen construida y etiqueta',asHermes(`podman image inspect localhost/curso-examen:1 | python3 -c 'import json,sys; c=json.load(sys.stdin)[0]; assert c["Labels"].get("curso")=="examen"'`)]],
  },[['Imagen de hermes',asHermes('podman images; podman image inspect localhost/curso-examen:1')]]),
  question(21,2,15,podman,[['Servicio y contenedor',asHermes('systemctl --user status container-webapp.service --no-pager; podman ps; podman inspect webapp')]],{
    goal:'Como hermes, usa localhost/curso-examen:1 para webapp, con /opt/entrada → /data/in y /opt/salida → /data/out. Configura su unidad systemd de usuario y linger. Reinicia la máquina 2 y comprueba que arranca sin iniciar sesión como hermes.',
    solution:podman.solution.replace('useradd -m -U -s /bin/bash hermes\npasswd hermes\n','').replace('podman import /srv/curso-contenedor/imagen.tar localhost/curso-busybox:1\n','').replaceAll('localhost/curso-busybox:1','localhost/curso-examen:1').replace('# Tras arrancar, vuelve a la sesión de hermes:\nssh hermes@localhost\n# Ahora pulsa Comprobar ejercicio.','# Tras arrancar, entra como root.\n# El servicio debe estar en marcha sin iniciar sesión como hermes.\n# Deja ambas terminales en un prompt de root vacío antes de Finalizar examen.'),
    checks:[...podman.checks.map(c=>[c[0],asHermes(c[1]),c[2]]),['Reinicio después de crear el servicio','test "$(stat -c %Y /home/hermes/.config/systemd/user/container-webapp.service)" -lt "$(awk \'/^btime / {print $2}\' /proc/stat)"']],
  }),
];

export const EXAM_SECONDS=3*60*60;
export const EXAM_TOTAL=300;
export const EXAM_PASS=210;
export function scoreQuestion(question,result){
  if(!result || result.results?.length!==question.checks.length)throw Error('Resultado de corrección incompleto');
  if(result.results.some((r,i)=>r.label!==question.checks[i][0]||typeof r.ok!=='boolean'))throw Error('Criterios de corrección inválidos');
  const base=Math.floor(question.points/question.checks.length),remainder=question.points%question.checks.length;
  const criteria=result.results.map((r,i)=>({...r,points:base+(i<remainder?1:0)}));
  return {id:question.id,points:criteria.reduce((n,r)=>n+(r.ok?r.points:0),0),max:question.points,criteria,observations:result.observations||[]};
}
