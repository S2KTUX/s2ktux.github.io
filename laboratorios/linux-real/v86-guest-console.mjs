const quote = text => "'" + text.replaceAll("'", "'\\''") + "'";
// Configuración ejecutada por Linux. No se dibuja ni se sustituye el prompt.
export function consoleSetupCommand(recovery, password) {
  if (recovery && !/^[a-f0-9]{48}$/.test(password)) throw Error('Contraseña de preparación inválida');
  const script = [
    'set -e',
    'test "$(id -u)" = 0',
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
  return '/bin/sh -c ' + quote(script.join('\n')) + ' && . /etc/profile.d/s2ktux-prompt.sh';
}
