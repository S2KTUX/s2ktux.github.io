// Prácticas de la candidata Debian: no equivalencia automática con RHEL.
// Los checks consultan resultados; nunca ejecutan la solución ni preparan datos.
import { courseExercises } from './v86-course-exercises.mjs';
import { extraExercises } from './v86-extra-exercises.mjs';
export const introExercises = [
  {
    id: 'archivo', title: 'Archivo y permisos',
    goal: 'Crea /root/practica.txt con el texto «Linux real». Debe pertenecer a root:root y tener permisos 640.',
    explanation: '640 permite leer y escribir a root, leer al grupo y no da acceso a los demás.',
    solution: "printf 'Linux real\\n' > /root/practica.txt\nchown root:root /root/practica.txt\nchmod 640 /root/practica.txt\n\ncat /root/practica.txt\nstat -c '%U:%G %a' /root/practica.txt",
    checks: [
      ['Archivo y contenido', 'test -f /root/practica.txt && test "$(cat /root/practica.txt)" = "Linux real"'],
      ['Propietario root:root', 'test "$(stat -c %u:%g /root/practica.txt)" = 0:0'],
      ['Permisos 640', 'test "$(stat -c %a /root/practica.txt)" = 640'],
    ],
  },
  {
    id: 'usuarios', title: 'Usuario y grupo',
    goal: 'Crea el grupo equipo y la cuenta ana, con home propio, shell /bin/bash y pertenencia adicional al grupo equipo.',
    explanation: 'El grupo adicional permite compartir recursos sin cambiar el grupo principal de ana.',
    solution: 'groupadd equipo\nuseradd -m -s /bin/bash -G equipo ana\n\nid ana\ngetent passwd ana\nls -ld /home/ana',
    note: 'Parte de una máquina limpia. Si el usuario ya existe, puedes corregirlo con usermod; no hace falta borrarlo.',
    checks: [
      ['Cuenta y shell', 'getent passwd ana | awk -F: \'$1=="ana" && $7=="/bin/bash" {ok=1} END {exit !ok}\''],
      ['Grupo adicional equipo', 'id -nG ana | tr " " "\\n" | grep -Fxq equipo'],
      ['Home propio', 'test -d /home/ana && test "$(stat -c %u /home/ana)" = "$(id -u ana)" && getent passwd ana | awk -F: \'$6=="/home/ana" {ok=1} END {exit !ok}\''],
    ],
  },
  {
    id: 'sgid', title: 'Directorio compartido',
    goal: 'Crea /datos/equipo, propiedad de root:equipo, con permisos 2770. El bit SGID debe hacer que los nuevos archivos hereden el grupo equipo.',
    explanation: 'El 2 activa SGID en el directorio. Root y equipo tienen acceso completo; los demás no tienen acceso.',
    solution: 'getent group equipo >/dev/null || groupadd equipo\nmkdir -p /datos/equipo\nchown root:equipo /datos/equipo\nchmod 2770 /datos/equipo\n\nstat -c \'%U:%G %a\' /datos/equipo',
    checks: [
      ['Directorio', 'test -d /datos/equipo'],
      ['Propietario root:equipo', 'test "$(stat -c %u /datos/equipo)" = 0 && test "$(stat -c %G /datos/equipo)" = equipo'],
      ['Permisos y SGID', 'test "$(stat -c %a /datos/equipo)" = 2770'],
    ],
  },
  {
    id: 'archivo-tar', title: 'Copia comprimida',
    goal: 'Después de la práctica «Archivo y permisos», guarda practica.txt en /root/practica.tar.gz. El archivo debe usar gzip y conservar el contenido del fichero.',
    explanation: 'tar agrupa los archivos y -z comprime con gzip. La comprobación lee el contenido sin extraerlo al disco.',
    solution: 'tar -czf /root/practica.tar.gz -C /root practica.txt\n\ntar -tzf /root/practica.tar.gz\ntar -xOzf /root/practica.tar.gz practica.txt',
    checks: [
      ['Archivo gzip válido', 'test -f /root/practica.tar.gz && test "$(od -An -tx1 -N2 /root/practica.tar.gz | tr -d " \\n")" = 1f8b && gzip -t /root/practica.tar.gz'],
      ['Fichero incluido', 'tar -tzf /root/practica.tar.gz | grep -Fxq practica.txt'],
      ['Contenido conservado', 'test "$(tar -xOzf /root/practica.tar.gz practica.txt)" = "Linux real"'],
    ],
  },
  {
    id: 'dnf', title: 'Instalar y actualizar un RPM',
    goal: 'Instala lab-notas desde el repositorio local y actualízalo a la versión 2.0 usando lab-updates. Debe quedar instalada también su dependencia lab-base.',
    explanation: 'DNF resuelve dependencias reales. En esta candidata administra los RPM del laboratorio, no los paquetes base de Debian.',
    solution: 'dnf -y install lab-notas\ndnf -y --enablerepo=lab-updates upgrade lab-notas\n\nrpm -q lab-notas lab-base\ncat /usr/share/s2ktux-lab/lab-notas/version.txt',
    checks: [
      ['Versión RPM 2.0', 'test "$(rpm -q --qf \'%{VERSION}\' lab-notas)" = 2.0'],
      ['Dependencia instalada', 'rpm -q lab-base >/dev/null'],
      ['Contenido actualizado', 'test "$(cat /usr/share/s2ktux-lab/lab-notas/version.txt)" = "lab-notas 2.0"'],
    ],
  },
  {
    id: 'lvm', title: 'LVM y montaje persistente',
    goal: 'En el disco de prácticas /dev/sdb, crea el PV /dev/sdb1, el VG practicas y el LV datos de 256 MiB. Usa ext4, móntalo en /mnt/datos y configura su montaje en /etc/fstab.',
    note: 'Necesita /dev/sdb vacío. Compruébalo antes con lsblk. No uses /dev/sda: contiene el sistema. La solución particiona el disco de prácticas y no debe aplicarse si quieres conservar sus datos.',
    explanation: 'La comprobación revisa el PV, el tamaño del LV, el sistema de archivos, el montaje actual y una entrada válida de fstab. Para verificar un arranque real, reinicia y vuelve a comprobar.',
    solution: 'lsblk -f /dev/sdb\n# Continúa solo si el disco de prácticas está vacío.\nparted -s /dev/sdb mklabel gpt mkpart LVM 1MiB 100% set 1 lvm on\npartprobe /dev/sdb\nudevadm settle\npvcreate /dev/sdb1\nvgcreate practicas /dev/sdb1\nlvcreate -L 256M -n datos practicas\nmkfs.ext4 /dev/practicas/datos\nmkdir -p /mnt/datos\nmount /dev/practicas/datos /mnt/datos\nrestorecon -RF /mnt/datos\nprintf \'UUID=%s /mnt/datos ext4 defaults 0 2\\n\' "$(blkid -s UUID -o value /dev/practicas/datos)" >> /etc/fstab\nsystemctl daemon-reload\n\nlvs practicas\nfindmnt /mnt/datos\nfindmnt --verify\n# Reinicia y vuelve a comprobar el ejercicio.',
    checks: [
      ['PV en el disco de prácticas', 'test "$(pvs --noheadings -o vg_name /dev/sdb1 | tr -d " \\n")" = practicas'],
      ['LV de 256 MiB y ext4', 'test -b /dev/practicas/datos && test "$(blockdev --getsize64 /dev/practicas/datos)" = 268435456 && test "$(blkid -s TYPE -o value /dev/practicas/datos)" = ext4'],
      ['LV montado en /mnt/datos', 'mountpoint -q /mnt/datos && test "$(findmnt -rn -M /mnt/datos -o FSTYPE)" = ext4 && test "$(readlink -f "$(findmnt -rn -M /mnt/datos -o SOURCE)")" = "$(readlink -f /dev/practicas/datos)"'],
      ['Montaje configurado en fstab', 'uuid=$(blkid -s UUID -o value /dev/practicas/datos) && test -n "$uuid" && awk -v u="UUID=$uuid" \'$0 !~ /^[[:space:]]*#/ && ($1==u || $1=="/dev/practicas/datos" || $1=="/dev/mapper/practicas-datos") && $2=="/mnt/datos" && $3=="ext4" && $4 !~ /(^|,)noauto(,|$)/ {n++} END {exit n!=1}\' /etc/fstab'],
    ],
  },
  {
    id: 'selinux', title: 'Etiqueta SELinux persistente',
    goal: 'Crea /srv/practica-web/index.html con el texto «Practica web». Configura httpd_sys_content_t de forma persistente para ese directorio y su contenido. SELinux debe seguir Enforcing.',
    explanation: 'semanage guarda la regla y restorecon aplica la etiqueta. chcon por sí solo no establece una regla persistente.',
    solution: 'mkdir -p /srv/practica-web\nprintf \'Practica web\\n\' > /srv/practica-web/index.html\nsemanage fcontext -a -t httpd_sys_content_t \'/srv/practica-web(/.*)?\'\nrestorecon -RF /srv/practica-web\n\ngetenforce\nls -Zd /srv/practica-web /srv/practica-web/index.html\nmatchpathcon /srv/practica-web/index.html',
    note: 'Si esa regla ya existe y necesitas corregirla, usa semanage fcontext -m en lugar de -a.',
    checks: [
      ['SELinux Enforcing', 'test "$(getenforce)" = Enforcing'],
      ['Fichero y contenido', 'test -f /srv/practica-web/index.html && test "$(cat /srv/practica-web/index.html)" = "Practica web"'],
      ['Etiquetas aplicadas', 'test "$(stat -c %C /srv/practica-web | cut -d: -f3)" = httpd_sys_content_t && test "$(stat -c %C /srv/practica-web/index.html | cut -d: -f3)" = httpd_sys_content_t'],
      ['Regla persistente', 'test "$(matchpathcon -n /srv/practica-web/index.html | cut -d: -f3)" = httpd_sys_content_t'],
    ],
  },
  {
    id: 'tuned', title: 'Aplicar un perfil tuned',
    goal: 'Activa el perfil virtual-guest. Debe quedar aplicado y tuned-adm verify debe confirmar los ajustes.',
    explanation: 'No basta con que aparezca el nombre del perfil: comprobamos también la verificación y el valor efectivo de vm.swappiness.',
    solution: 'tuned-adm profile virtual-guest\n\ntuned-adm active\ntuned-adm verify\nsysctl vm.swappiness',
    checks: [
      ['Servicio y perfil virtual-guest', 'systemctl is-active --quiet tuned && test "$(cat /etc/tuned/active_profile)" = virtual-guest'],
      ['Ajustes verificados', 'tuned-adm verify >/dev/null 2>&1'],
      ['vm.swappiness aplicado', 'test "$(sysctl -n vm.swappiness)" = 30'],
    ],
  },
];

export const exercises = [
  ...introExercises.map(e => ({...e, group:'Prácticas iniciales'})),
  ...courseExercises.map(e => ({...e, group:'Simulacro adaptado'})),
  ...extraExercises.map(e => ({...e, group:'Prácticas del curso'})),
];

export const shellQuote = value => "'" + String(value).replaceAll("'", "'\\''") + "'";

const conditionTimeout=check=>{
  const seconds=check[2]??20;
  if(!Number.isInteger(seconds)||seconds<1||seconds>60)throw Error('Plazo de comprobación inválido');
  return seconds;
};
export const probeTimeoutMs=exercise=>10000+exercise.checks.reduce((ms,check)=>ms+(conditionTimeout(check)+2)*1000,0);

export function buildProbe(exercise, nonce) {
  if (!/^[a-f0-9]{24}$/.test(nonce)) throw Error('Identificador de comprobación inválido');
  const prefix = '__LAB_' + nonce + '_';
  if (exercise.checkUser && !/^[a-z_][a-z0-9_-]{0,31}$/.test(exercise.checkUser)) throw Error('Usuario de comprobación inválido');
  const actor = exercise.checkUser ? `test "$(id -un)" = ${shellQuote(exercise.checkUser)} || exit 77` : 'test "$(id -u)" = 0 || exit 77';
  const lines = ['export LC_ALL=C PAGER=cat SYSTEMD_PAGER=cat', actor];
  exercise.checks.forEach((condition, index) => {
    const [,check]=condition;
    lines.push(`if /usr/bin/timeout -k 2 ${conditionTimeout(condition)} /bin/sh -c ${shellQuote(check)} >/dev/null 2>&1; then printf '${prefix}${index}=0\\n'; else result=$?; printf '${prefix}${index}=%s\\n' "$result"; fi`);
  });
  return `/bin/sh -c ${shellQuote(lines.join('; '))}; printf '\\n${prefix}END=%s\\n' "$?"`;
}

export function parseProbe(exercise, nonce, output) {
  const prefix = '__LAB_' + nonce + '_';
  const end = new RegExp('(?:^|\\n)' + prefix + 'END=(\\d+)\\n').exec(output);
  if (!end) return null;
  if (Number(end[1]) === 77) throw Error(`Entra como ${exercise.checkUser || 'root'} para comprobar esta práctica.`);
  if (Number(end[1]) !== 0) throw Error('Linux no pudo ejecutar la comprobación.');
  const results = exercise.checks.map(([label], index) => {
    const match = new RegExp('(?:^|\\n)' + prefix + index + '=(\\d+)\\n').exec(output);
    if (!match) throw Error('La comprobación quedó incompleta. No se considera aprobada.');
    const code = Number(match[1]);
    if (code === 124 || code === 137) throw Error('Una consulta tardó demasiado. No se considera aprobada.');
    return { label, ok: code === 0 };
  });
  return { ok: results.every(result => result.ok), results };
}
