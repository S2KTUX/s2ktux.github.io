export default {
  mode: 'linux',
  environment: {
    eyebrow: 'SANDBOX · LINUX / RHCSA',
    heading: 'Terminal Linux · RHCSA',
    machine: 'MÁQUINA · RHCSA-LAB',
    os: 'Rocky Linux 9 · RHCSA lab',
    cheat: 'CHEATSHEET · LINUX / RHCSA',
    practice: 'PRÁCTICAS GUIADAS · RHCSA',
    host: 's2ktux',
    description: 'Una máquina Linux completa para practicar el RHCSA: recuperación mediante GRUB, usuarios, permisos, SELinux, systemd, red y almacenamiento.'
  },
  commandSet: 'linux-rhcsa',
  commands: ['getfacl','setfacl','getenforce','setenforce','sestatus','getsebool','setsebool','semanage','restorecon','chcon','chage','crontab','timedatectl','tuned-adm','pvcreate','vgcreate','vgextend','lvcreate','lvextend','lvresize','lvremove','vgremove','pvremove','xfs_growfs','resize2fs','mkswap','swapon','getent','visudo','useradd','userdel','usermod','groupadd','passwd','su','yum','apt','blkid','fdisk','parted','mkfs.xfs','mkfs.ext4','mount','umount','pvs','vgs','lvs','ifup','ifdown','firewall-cmd','chroot','systemd-run','systemd-analyze','ausearch','sealert','ssh-keygen','ssh-copy-id','nice','renice','chronyc','labhosts','lvreduce','at','atq','atrm','loginctl','nmtui','bzip2','bunzip2','logger'],
  map: { zone: 'linux', title: 'SALA RHCSA', accent: '#c2650a' }
};
