import {shellQuote} from './v86-exercises.mjs?v=20261009-intuitive';
import {extraExercises} from './v86-extra-exercises.mjs?v=20261008-console';
import {examContainerfile,examDnsPython,examGatewayScript} from './v86-exam-fixtures.mjs?v=20261010-exam';

const write=(path,content)=>`printf '%s' ${shellQuote(content)} > ${path}`;
const service=(description,command,extra='')=>`[Unit]\nDescription=${description}\nAfter=network.target\n[Service]\n${extra}ExecStart=${command}\nRestart=on-failure\n[Install]\nWantedBy=multi-user.target\n`;
const confined='/usr/bin/runcon unconfined_u:unconfined_r:unconfined_t:s0-s0:c0.c1023';

// Solo sobre las nuevas VM de examen, nunca sobre la sesión de práctica.
export function examSetupCommand(attempt,node){
  if(!/^[a-f0-9]{32}$/.test(attempt)||!['1','2'].includes(node))throw Error('Sesión de examen inválida');
  const lines=['set -e','test "$(id -u)" = 0',`test ! -e /var/lib/s2ktux-exam-${attempt} || exit 0`,
    'test "$(blockdev --getsize64 /dev/sdb)" = 2147483648',
    `hostnamectl set-hostname nodo${node}`,
    // Nombres iniciales, distintos del hostname solicitado en la pregunta 1.
    `sed -i 's/\\<debian-motor-test\\>/nodo${node}/g' /etc/hosts`,
    'restorecon /etc/hostname /etc/hosts',
    'mkdir -p /var/lib/s2ktux-exam',
    'test ! -f /etc/yum.repos.d/lab.repo || mv /etc/yum.repos.d/lab.repo /var/lib/s2ktux-exam/lab.repo.original',
    'cat /proc/sys/kernel/random/boot_id > /var/lib/s2ktux-exam/initial-boot-id',
  ];
  if(node==='1')lines.push(
    'systemctl disable --now cron autofs chrony',
    // Un fallo real de bind de Apache bajo SELinux; no se modifica el HTML.
    'find /var/www/html -type f -exec sha256sum {} + > /var/lib/s2ktux-exam/web-files.sha256',
    "sed -i 's/^Listen 80$/Listen 82/' /etc/apache2/ports.conf",
    "sed -i 's/<VirtualHost \*:80>/<VirtualHost *:82>/' /etc/apache2/sites-available/000-default.conf",
    'restorecon /etc/apache2/ports.conf /etc/apache2/sites-available/000-default.conf',
    'firewall-cmd --permanent --add-port=82/tcp','firewall-cmd --reload',
    'systemctl disable apache2','systemctl restart apache2 || true',
    // No IP inicial: el alumno debe configurar NetworkManager.
    'nmcli -t -f UUID,TYPE con show | while IFS=: read -r uuid type; do test "$type" != 802-3-ethernet || nmcli con delete "$uuid"; done',
    'ip addr flush dev eth0',
    "printf 'root:curso123\n' | chpasswd",
  );
  else lines.push(
    'tuned-adm profile balanced',
    extraExercises.find(e=>e.id==='curso-servidor').solution.replace('chmod 755 /srv/curso-nfs','chmod 777 /srv/curso-nfs').replace('(ro,sync,','(rw,sync,').replace('nfs_export_all_ro on','nfs_export_all_rw on'),
    'chmod 777 /srv/curso-nfs',
    write('/etc/exports','/srv/curso-nfs 10.42.0.0/24(rw,sync,no_subtree_check,fsid=0,root_squash)\n'),
    'exportfs -rav',
    'mkdir -p /usr/local/lib/s2ktux-exam /srv/s2ktux-exam/public',
    write('/usr/local/lib/s2ktux-exam/dns.py',examDnsPython),
    write('/usr/local/lib/s2ktux-exam/gateway.sh',examGatewayScript),
    write('/srv/s2ktux-exam/public/Containerfile',examContainerfile),
    write('/srv/s2ktux-exam/public/gateway.txt','GATEWAY_EXAMEN\n'),
    write('/etc/systemd/system/s2ktux-exam-dns.service',service('DNS privado del examen',`${confined} /usr/bin/python3 /usr/local/lib/s2ktux-exam/dns.py`)),
    write('/etc/systemd/system/s2ktux-exam-http.service',service('Recursos HTTP del examen',`${confined} /usr/bin/python3 -m http.server 8080 --directory /srv/s2ktux-exam/public`)),
    write('/etc/systemd/system/s2ktux-exam-gateway.service','[Unit]\nDescription=Router privado del examen\nAfter=network.target\n[Service]\nType=oneshot\nRemainAfterExit=yes\nExecStart='+confined+' /bin/sh /usr/local/lib/s2ktux-exam/gateway.sh\n[Install]\nWantedBy=multi-user.target\n'),
    write('/etc/systemd/system/s2ktux-exam-destination.service',service('Destino detrás del router privado',`${confined} /usr/bin/python3 -m http.server 8080 --bind 10.43.0.2 --directory /srv/s2ktux-exam/public`,'NetworkNamespacePath=/run/netns/exam-servicios\n').replace('After=network.target','After=network.target s2ktux-exam-gateway.service\nRequires=s2ktux-exam-gateway.service')),
    'restorecon -RF /usr/local/lib/s2ktux-exam /srv/s2ktux-exam /etc/systemd/system/s2ktux-exam-*.service',
    // Enrutamiento real exclusivamente entre interfaces de la LAN del examen.
    'firewall-cmd --permanent --zone=internal --add-interface=eth0',
    'firewall-cmd --permanent --zone=internal --add-interface=exam-gw',
    'firewall-cmd --permanent --zone=internal --add-forward',
    'for svc in dns nfs ntp; do firewall-cmd --permanent --zone=internal --add-service="$svc"; done',
    'firewall-cmd --permanent --zone=internal --add-port=8080/tcp',
    'firewall-cmd --reload','systemctl daemon-reload',
    'systemctl enable --now s2ktux-exam-dns s2ktux-exam-http s2ktux-exam-gateway s2ktux-exam-destination',
    'for unit in s2ktux-exam-dns s2ktux-exam-http s2ktux-exam-gateway s2ktux-exam-destination; do systemctl is-active --quiet "$unit"; done',
    // La base local se prepara en el almacenamiento del alumno, no en root.
    'useradd -m -U -s /bin/bash hermes',"printf 'hermes:cambiame1\\n' | chpasswd",
    'restorecon -RF /home/hermes','systemctl enable --now ssh',
    'uid=$(id -u hermes)','systemctl start "user@$uid.service"',
    'runuser -u hermes -- env HOME=/home/hermes XDG_RUNTIME_DIR=/run/user/$uid DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/$uid/bus /bin/sh -c "cd /home/hermes && podman import /srv/curso-contenedor/imagen.tar localhost/curso-busybox:1"',
    'loginctl disable-linger hermes',
    // El LV a reducir ya tiene datos antes de que empiece el ejercicio.
    'parted -s /dev/sdb mklabel gpt mkpart LVM 1MiB 769MiB set 1 lvm on',
    'partprobe /dev/sdb','udevadm settle','pvcreate /dev/sdb1','vgcreate seedvg /dev/sdb1',
    'lvcreate -L 512M -n reducible seedvg','mkfs.ext4 /dev/seedvg/reducible',
    'mkdir -p /mnt/reducible','mount /dev/seedvg/reducible /mnt/reducible',
    "printf 'CONSERVAR\n' > /mnt/reducible/dato",
    `printf 'UUID=%s /mnt/reducible ext4 defaults 0 2\\n' "$(blkid -s UUID -o value /dev/seedvg/reducible)" >> /etc/fstab`,
    'restorecon -RF /mnt/reducible','systemctl daemon-reload',
  );
  lines.push(`touch /var/lib/s2ktux-exam-${attempt}`,'sync');
  return '/bin/sh -c '+shellQuote(lines.join('\n'));
}
