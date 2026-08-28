export default {
  mode: 'linux',
  system: {
    distribution: 'Rocky Linux',
    release: '9.4',
    codename: 'Blue Onyx',
    id: 'rocky',
    kernel: '5.14.0-427.el9.x86_64',
    architecture: 'x86_64',
    certification: 'RHCSA 9',
    dnf: '4.14.0'
  },
  environment: {
    eyebrow: 'SANDBOX · LINUX / RHCSA 9',
    heading: 'Terminal Linux · RHCSA 9',
    machine: 'MÁQUINA · RHCSA9-LAB',
    os: 'Rocky Linux 9.4 · RHCSA 9',
    cheat: 'CHEATSHEET · LINUX / RHCSA 9',
    practice: 'PRÁCTICAS GUIADAS · RHCSA 9',
    host: 's2ktux',
    description: 'Una máquina Rocky Linux 9.4 para practicar RHCSA 9: recuperación mediante GRUB, usuarios, permisos, SELinux, systemd, red y almacenamiento.'
  },
  commandSet: 'linux-rhcsa',
  commands: ['getfacl','setfacl','getenforce','setenforce','sestatus','getsebool','setsebool','semanage','restorecon','chcon','chage','crontab','timedatectl','tuned-adm','pvcreate','vgcreate','vgextend','lvcreate','lvextend','lvresize','lvremove','vgremove','pvremove','xfs_growfs','resize2fs','mkswap','swapon','getent','visudo','useradd','userdel','usermod','groupadd','passwd','su','yum','apt','blkid','fdisk','parted','mkfs.xfs','mkfs.ext4','mount','umount','pvs','vgs','lvs','ifup','ifdown','firewall-cmd','chroot','systemd-run','systemd-analyze','ausearch','sealert','ssh-keygen','ssh-copy-id','nice','renice','chronyc','labhosts','lvreduce','at','atq','atrm','loginctl','nmtui','bzip2','bunzip2','logger'],
  map: { zone: 'linux', title: 'SALA RHCSA 9', accent: '#c2650a' }
};
