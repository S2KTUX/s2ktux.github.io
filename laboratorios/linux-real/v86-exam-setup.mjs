import {shellQuote} from './v86-exercises.mjs?v=20261009-exam';
import {extraExercises} from './v86-extra-exercises.mjs?v=20261008-console';

// Solo sobre las nuevas VM de examen, nunca sobre la sesión de práctica.
export function examSetupCommand(attempt,node){
  if(!/^[a-f0-9]{32}$/.test(attempt)||!['1','2'].includes(node))throw Error('Sesión de examen inválida');
  const lines=['set -e','test "$(id -u)" = 0',`test ! -e /var/lib/s2ktux-exam-${attempt} || exit 0`,
    'test "$(blockdev --getsize64 /dev/sdb)" = 2147483648',
    `hostnamectl set-hostname ${node==='1'?'pendiente1':'nodo2'}.lab.local`,
    'mkdir -p /var/lib/s2ktux-exam',
    'cat /proc/sys/kernel/random/boot_id > /var/lib/s2ktux-exam/initial-boot-id',
  ];
  if(node==='1')lines.push(
    'systemctl disable --now cron autofs chrony',
    // No IP inicial: el alumno debe configurar NetworkManager.
    'nmcli -t -f UUID,TYPE con show | while IFS=: read -r uuid type; do test "$type" != 802-3-ethernet || nmcli con delete "$uuid"; done',
    'ip addr flush dev eth0',
    "printf 'root:curso123\n' | chpasswd",
  );
  else lines.push(
    'tuned-adm profile balanced',
    extraExercises.find(e=>e.id==='curso-servidor').solution,
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
