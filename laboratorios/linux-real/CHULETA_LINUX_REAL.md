# Chuleta del laboratorio Linux real

Los comandos se ejecutan en la VM del navegador. Root no es el administrador de Windows. Reset vuelve a la base limpia y borra tus prácticas; Guardar sesión conserva el último estado en este navegador.

La candidata usa Debian con herramientas reales. En RHEL cambian algunas rutas y servicios: `apache2` → `httpd`, `cron` → `crond`, `chrony` → `chronyd`, `ssh` → `sshd`. No se ocultan esas diferencias con alias. DNF sirve para los RPM locales del laboratorio; no actualiza Debian.

La nueva fábrica empieza con eth0 sin IP: configura la red con nmcli en la práctica 02. NetworkManager sigue activo. El helper podman-restart está instalado pero deshabilitado; si practicas contenedores con `--restart=always`, habilítalo con `systemctl enable podman-restart.service`. Las unidades de contenedor creadas con systemd se habilitan por separado, como en sus ejercicios.

## Shell y archivos

```bash
pwd
ls -lah
cd /root
mkdir -p practica
cp archivo copia
mv copia otro-nombre
ln archivo enlace-fisico
ln -s archivo enlace-simbolico
grep -E '^ERROR [0-9]+$' archivo > errores
find /home -type f -user hera
tar -czf copia.tar.gz carpeta
tar -cjf copia.tar.bz2 carpeta
tar -tf copia.tar.gz
tar -xzf copia.tar.gz -C /ruta/de/destino
vi archivo
man chmod
```

En vi: `i` para escribir, Esc para volver al modo normal, `:wq` para guardar y salir, `:q!` para salir sin guardar. Si estás en un editor, termínalo antes de pulsar Comprobar ejercicio.

## Usuarios y permisos

```bash
groupadd equipo
useradd -m -s /bin/bash -G equipo ana
passwd ana
id ana
usermod -aG otro-grupo ana
chage -M 90 -m 1 -W 7 ana
chage -l ana
chmod 640 archivo
chown root:equipo archivo
chmod 2770 directorio
setfacl -m u:ana:rw- archivo
getfacl archivo
umask 027
visudo -cf /etc/sudoers
```

## Servicios, procesos y tareas

```bash
systemctl status servicio --no-pager
systemctl start servicio
systemctl stop servicio
systemctl enable --now servicio
systemctl is-active servicio
systemctl is-enabled servicio
systemctl daemon-reload
systemctl get-default
systemctl set-default multi-user.target
systemctl list-timers --all
journalctl -b --no-pager
journalctl -b -1 --no-pager
logger MARCA
ps -ef
nice -n 10 sleep 600 &
renice 15 -p PID
kill PID
crontab -u hera -e
crontab -u hera -l
echo 'logger TAREA_AT' | at now + 1 minute
atq
atrm NUMERO
tuned-adm list
tuned-adm profile virtual-guest
tuned-adm active
tuned-adm verify
```

## Red, SSH y firewall

La red entre las dos pestañas es privada: por ejemplo 10.42.0.20/24 y 10.42.0.11/24. Usa una MAC distinta en cada VM. No hay un router ni acceso general a Internet.

```bash
ip -br addr
ip route
nmcli con show
nmcli con add type ethernet ifname eth0 con-name curso ipv4.method manual ipv4.addresses 10.42.0.20/24 ethernet.cloned-mac-address 02:00:00:42:00:20
nmcli con up curso
hostnamectl set-hostname nodo1.lab.local
getent ahostsv4 nombre
ping -c 2 10.42.0.11
ss -lntup
ssh usuario@localhost
ssh-keygen -t ed25519
ssh -i /ruta/clave usuario@destino
scp -i /ruta/clave archivo usuario@destino:/ruta/
rsync -a -e 'ssh -i /ruta/clave' carpeta/ usuario@destino:/ruta/
firewall-cmd --list-all
firewall-cmd --permanent --add-service=http
firewall-cmd --reload
firewall-cmd --query-service=http
```

## SELinux

```bash
getenforce
ls -lZ archivo
matchpathcon archivo
semanage fcontext -a -t httpd_sys_content_t '/sitio/web(/.*)?'
restorecon -RF /sitio/web
semanage port -a -t http_port_t -p tcp 8090
semanage port -l
getsebool httpd_can_network_connect
setsebool -P httpd_can_network_connect on
ausearch -m AVC -ts recent
```

Si una regla local ya existe, usa `semanage fcontext -m` para modificarla. No desactives SELinux para dar por resuelto un problema de etiquetas.

## Almacenamiento

`/dev/sda` contiene el sistema. `/dev/sdb` es el disco de prácticas de 2 GiB en los perfiles curso/RHCSA/final. Comprueba nombres y espacio antes de particionar; `mkfs` destruye los datos del dispositivo elegido.

```bash
lsblk -f
parted /dev/sdb unit MiB print free
pvs
vgs
lvs
pvcreate /dev/sdb1
vgcreate datavg /dev/sdb1
lvcreate -L 320M -n datos datavg
mkfs.xfs /dev/datavg/datos
mkdir -p /mnt/datos
mount /dev/datavg/datos /mnt/datos
blkid /dev/datavg/datos
findmnt /mnt/datos
findmnt --verify
lvextend -L +64M /dev/datavg/datos
xfs_growfs /mnt/datos
umount /mnt/ext4
lvreduce -r -L 248M /dev/datavg/reducible
mkswap /dev/sdb2
swapon /dev/sdb2
swapon --show
```

Reducción: solo ext4, desmontado y con copia de seguridad; XFS no se reduce. Para persistir un montaje, añade a `/etc/fstab` una línea con el UUID real, punto de montaje, tipo y opciones; ejecuta `systemctl daemon-reload`, comprueba y reinicia. No copies un UUID de ejemplo.

## RPM, Flatpak y contenedores

```bash
dnf repolist
dnf -y install lab-notas
dnf -y --enablerepo=lab-updates upgrade lab-notas
rpm -q lab-notas lab-base
rpm -V lab-notas
dnf remove lab-notas lab-base
podman import /srv/curso-contenedor/imagen.tar localhost/curso-busybox:1
podman images
podman ps -a
podman inspect NOMBRE
podman logs NOMBRE
podman exec NOMBRE /bin/busybox echo HOLA
podman stop NOMBRE
podman start NOMBRE
```

Los RPM del laboratorio usan una base común en `/var/lib/rpm`; no gestionan los paquetes Debian. Root ejecuta Podman mediante una copia idéntica reservada a root en `/usr/sbin/podman`. Los usuarios normales mantienen `/usr/bin/podman` y su almacén rootless separado.

Flatpak se practica desde una sesión normal de alumno-flatpak, abierta por SSH local tras preparar su cuenta como root. Los comandos siguientes usan su instalación de usuario; no hace falta desactivar SELinux.

```bash
flatpak --user remote-add --no-gpg-verify curso-lab file:///srv/flatpak
flatpak --user install curso-lab org.s2ktux.Hola
flatpak --user run org.s2ktux.Hola
flatpak --user uninstall org.s2ktux.Hola
```

Para servicios de usuario, accede por SSH como el usuario y usa `systemctl --user`. Root activa `loginctl enable-linger USUARIO`. La práctica del panel explica generación e instalación de la unidad. Los ensayos nativos privados de Podman y persistencia pasan; su repetición en navegador sobre la fábrica nueva está en curso (véase ESTADO_VALIDACION.md). Para comprobar el simulacro 21, vuelve por SSH como hermes y escribe `export PS1='V86USER$ '` antes de pulsar el botón. La consulta no debe hacerse desde root con runuser.

## Discos nuevos con SELinux

Root usa el perfil administrativo normal unconfined_t. No necesita reetiquetar
un disco para poder escribir como root. Cuando los archivos vayan a ser usados
por servicios confinados, aplica las etiquetas de su ruta:

```bash
restorecon -RF /mnt/datos
```

Usa el punto de montaje real. Esto no formatea ni borra archivos y mantiene
SELinux activo. No lo apliques a VFAT, que no admite esos atributos.

## Recuperación

En GRUB: edita la entrada con `e`, añade `rd.break` a la línea `linux` y arranca con Ctrl+X. En el rescate de dracut:

```bash
mount -o remount,rw /sysroot
chroot /sysroot
passwd root
touch /.autorelabel
sync
exit
exit
```

Espera a que termine el relabel y el arranque; después comprueba `getenforce`. Reset está fuera de Linux y permite recuperar una máquina rota sin necesitar la contraseña.
