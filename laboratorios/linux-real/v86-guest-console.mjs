const quote = text => "'" + text.replaceAll("'", "'\\''") + "'";
// Configuración ejecutada por Linux. No se dibuja ni se sustituye el prompt.
export function consoleSetupCommand(recovery, password, epochSeconds, initializeNetwork=false, labHostname) {
  if (recovery && !/^[a-f0-9]{48}$/.test(password)) throw Error('Contraseña de preparación inválida');
  if(epochSeconds!==undefined&&(!Number.isSafeInteger(epochSeconds)||epochSeconds<1577836800||epochSeconds>4102444800))throw Error('Reloj inicial inválido');
  if(labHostname!==undefined&&!['s2ktux-lab','s2ktux-lab-2'].includes(labHostname))throw Error('Nombre de laboratorio inválido');
  const script = [
    'set -e',
    'test "$(id -u)" = 0',
    ...(epochSeconds!==undefined?[`date -u -s '@${epochSeconds}'`]:[]),
    'if test ! -f /etc/profile.d/s2ktux-prompt.sh; then',
    "printf '%s\\n' " + quote("export PS1='[\\u@\\h \\W]\\$ '") + ' > /etc/profile.d/s2ktux-prompt.sh',
    // Debian lee .bashrc después de /etc/profile; corregir también el marcador del prototipo.
    'for file in /root/.bashrc /etc/skel/.bashrc /home/*/.bashrc; do',
    'test -f "$file" || continue',
    "printf '\\n%s\\n' " + quote('. /etc/profile.d/s2ktux-prompt.sh') + ' >> "$file"',
    'done',
    'restorecon /etc/profile.d/s2ktux-prompt.sh /root/.bashrc /etc/skel/.bashrc',
    'fi',
  ];
  // Migrar solo el nombre de fábrica. Conservar nombres elegidos en prácticas
  // y no intervenir en los hostnames que forman parte del examen.
  if(labHostname)script.push(
    'if test "$(hostname)" = debian-motor-test; then',
    'hostnamectl set-hostname '+labHostname,
    "sed -i 's/\\<debian-motor-test\\>/"+labHostname+"/g' /etc/hosts",
    'restorecon /etc/hostname /etc/hosts',
    'fi',
  );
  if(initializeNetwork)script.push(
    'mkdir -p /etc/NetworkManager/conf.d',
    "printf '[main]\\nno-auto-default=*\\n' > /etc/NetworkManager/conf.d/99-lab-no-auto.conf",
    'restorecon /etc/NetworkManager/conf.d/99-lab-no-auto.conf',
    'nmcli general reload',
    'nmcli -t -f UUID,TYPE con show | while IFS=: read -r uuid type; do test "$type" != 802-3-ethernet || nmcli con delete "$uuid"; done',
    'ip addr flush dev eth0',
  );
  if (recovery) script.push(
    'if test ! -f /var/lib/s2ktux-recovery-ready; then',
    "printf '%s\\n' " + quote('root:' + password) + ' | chpasswd',
    'mkdir -p /etc/systemd/system/serial-getty@ttyS0.service.d',
    "printf '%s\\n' '[Service]' 'ExecStart=' 'ExecStart=-/sbin/agetty --noclear -s %I 115200,38400,9600 vt102' > /etc/systemd/system/serial-getty@ttyS0.service.d/zz-recovery.conf",
    'restorecon -RF /etc/systemd/system/serial-getty@ttyS0.service.d',
    'systemctl daemon-reload',
    'touch /var/lib/s2ktux-recovery-ready',
    'sync',
    "printf 'RECOVERY_REBOOT_REQUIRED\\n'",
    'fi',
  );
  // Bash conserva \h desde el inicio de la shell del snapshot. Leer el nombre
  // real en su variable HOSTNAME evita mostrar el nombre anterior de fábrica.
  return '/bin/sh -c ' + quote(script.join('\n')) + ' && . /etc/profile.d/s2ktux-prompt.sh && export HOSTNAME="$(hostname)" && export PS1=' + quote('[\\u@${HOSTNAME%%.*} \\W]\\$ ');
}
