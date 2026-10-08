# Prueba nueva: Linux real en el navegador

Abre `v86-test.html` desde la vista previa y pulsa **Iniciar laboratorio**. La entrada normal selecciona la fábrica preparada. Es Debian 12 con herramientas reales y root administrativo normal, no Red Hat. La recuperación de contraseña es más lenta que las prácticas normales; consulta el estado de validación para sus tiempos reales. No se ha sustituido la web publicada.

La entrada preparada recupera una máquina ya arrancada. Guardar sesión conserva tu RAM y los cambios de ambos discos en este navegador. Guarda antes de cerrar: no hay guardado automático. Reset elimina únicamente el guardado de ese perfil y recupera su base limpia. No borra archivos del portátil.

## Dos formas de practicar

**Practicar Linux** deja la terminal para tus propias pruebas. Si necesitas una propuesta, abre las prácticas guiadas; no son obligatorias.

**Practicar modo examen** contiene las 21 preguntas del simulacro, sin sumar las prácticas complementarias. Las soluciones, la chuleta y las comprobaciones aparecen al terminar el intento. Es un modo de estudio, no una evaluación vigilada.

Ambos usan la misma máquina. Cambiar de modo no borra nada ni ejecuta comandos. Para empezar realmente desde cero, usa Reset; también eliminará el guardado de esa máquina.

## Software: practicar DNF sin inventar respuestas

El repositorio local contiene RPM propios y firmados. Puedes instalar, actualizar y borrar estos paquetes con DNF de verdad. Los componentes Debian siguen gestionados por dpkg/APT: no puedes dar por hecho que `dnf install vim` o un upgrade de todo el sistema equivalgan a RHEL.

```bash
dnf repolist
dnf install lab-notas
rpm -q lab-notas lab-base
cat /usr/share/s2ktux-lab/lab-notas/version.txt
dnf --enablerepo=lab-updates upgrade lab-notas
cat /usr/share/s2ktux-lab/lab-notas/version.txt
dnf remove lab-notas lab-base
```

La versión inicial es 1.0 y la actualización ofrece 2.0. `lab-dependencia-rota` debe fallar porque su dependencia no existe. Ese fallo es un resultado real previsto, no un comando sin implementar.

## Dos máquinas para NFS y autofs

Usa **Abrir la otra máquina**, en el mismo navegador. Cada máquina tiene su propio guardado y una MAC distinta. El enlace entre ellas es Ethernet privado; no hay DHCP ni acceso general a Internet. Configura direcciones IP distintas. Los comandos siguientes fijan también dos MAC diferentes para esta práctica.

En la máquina 1:

```bash
nmcli con add type ethernet ifname eth0 con-name lab-nfs ipv4.method manual ipv4.addresses 10.42.0.10/24 ipv6.method disabled ethernet.cloned-mac-address 02:00:00:42:00:10
nmcli con up lab-nfs
useradd -m -u 1500 alumno-nfs
```

En la máquina 2:

```bash
nmcli con add type ethernet ifname eth0 con-name lab-nfs ipv4.method manual ipv4.addresses 10.42.0.11/24 ipv6.method disabled ethernet.cloned-mac-address 02:00:00:42:00:11
nmcli con up lab-nfs
useradd -m -u 1500 alumno-nfs
mkdir -p /srv/compartido
chown alumno-nfs:alumno-nfs /srv/compartido
chmod 2775 /srv/compartido
echo NFS_ENTRE_MAQUINAS > /srv/compartido/dato
chmod 644 /srv/compartido/dato
printf '/srv/compartido 10.42.0.0/24(rw,sync,no_subtree_check,fsid=0)\n' > /etc/exports
setsebool nfs_export_all_rw on
systemctl start nfs-server
exportfs -rav
firewall-cmd --add-service=nfs
```

La cuenta comparte UID 1500 entre ambos equipos. Se conserva root_squash: root remoto no se convierte en root del servidor. Escribe con alumno-nfs, que sí es propietario de la carpeta. El booleano SELinux y la regla de firewall de este ejercicio son temporales; esta prueba no acredita todavía su persistencia tras reiniciar.

En la máquina 1, comprueba lectura y escritura:

```bash
ping -c 2 10.42.0.11
mkdir -p /mnt/nfs
mount -t nfs -o vers=4.2 10.42.0.11:/ /mnt/nfs
cat /mnt/nfs/dato
su - alumno-nfs -c 'echo ESCRITO_DESDE_CLIENTE > /mnt/nfs/cliente'
```

En la máquina 2, `cat /srv/compartido/cliente` debe mostrar el dato escrito desde la otra máquina.

Para probar autofs en la máquina 1:

```bash
umount /mnt/nfs
mkdir -p /mnt/auto
printf '/mnt/auto /etc/auto.lab --timeout=2\n' > /etc/auto.master.d/lab.autofs
printf 'datos -fstype=nfs4,rw,vers=4.2 10.42.0.11:/\n' > /etc/auto.lab
restorecon /etc/auto.lab /etc/auto.master.d/lab.autofs
systemctl restart autofs
cat /mnt/auto/datos/dato
findmnt /mnt/auto/datos
su - alumno-nfs -c 'echo ESCRITO_AUTOMOUNT > /mnt/auto/datos/auto-cliente'
```

Reiniciar autofs hace que lea el mapa nuevo. Acceder a la carpeta provoca un montaje real; no se genera una salida simulada. Comprueba el segundo dato desde la máquina 2.

## Discos de prácticas

`/dev/sda` contiene el sistema y GRUB: no lo particiones. `/dev/sdb` es el disco vacío de prácticas: 2 GiB en los perfiles curso/RHCSA/ampliado y 1 GiB en la base anterior. Confirma siempre sus nombres y tamaño con `lsblk -f` y `lsblk` antes de modificar nada. Los dos son discos virtuales dentro del navegador, no discos del portátil.

## Comprobar ejercicio y ver solución

El prototipo incluye un panel fuera de la terminal con 44 prácticas: ocho iniciales, las 21 preguntas del simulacro adaptadas y 15 prácticas adicionales del curso. Se abre con `v86-test.html?boot=grub&disk=rhcsa&estado=grub-rhcsa`. El catálogo ampliado sigue en validación y no sustituye la terminal publicada. Consulta `COBERTURA_RHCSA.md` para los resultados, no deduzcas que una práctica está aprobada solo por aparecer en el selector.

«Comprobar ejercicio» consulta el estado real de Linux y muestra qué condiciones se cumplen y cuáles faltan. No ejecuta la solución ni corrige el ejercicio. Necesita la máquina arrancada, el prompt de root y una línea vacía; no se envían consultas a un editor o a un comando en marcha. Una consulta incompleta o sin respuesta no se considera aprobada.

«Ver solución» despliega los comandos y una explicación breve en la página. No envía nada a Linux, no da el ejercicio por aprobado y funciona incluso antes de abrir la máquina. Es una forma de resolver la práctica, no una secuencia obligatoria: la evaluación mira el resultado.

Los scripts son una excepción deliberada: el panel lee su sintaxis y estructura simple; no ejecuta código del alumno como root. Prueba tú la salida y los códigos de retorno. En rescate se verifica contraseña/Enforcing finales, no que hayas seguido necesariamente rd.break.

La [chuleta del laboratorio real](CHULETA_LINUX_REAL.md) explica comandos y diferencias de rutas/servicios respecto a RHEL. Los repositorios e imágenes de prácticas existen en el disco local; no se finge descargar recursos de Internet. Para NFS/chrony/autofs se prepara la segunda pestaña con el ejercicio de servidor.

La práctica de timer fija `AccuracySec=1s`: el [valor predeterminado de systemd](https://github.com/systemd/systemd/blob/main/man/systemd.timer.xml) permite agrupar disparos dentro de un minuto. No se sustituye la ejecución por un archivo creado desde el comprobador.

Cambiar de práctica conserva la máquina. Root, Guardar sesión y Reset siguen disponibles. La solución de LVM exige que el disco de prácticas esté vacío; no debe aplicarse sobre datos que quieras conservar. Comprobar fstab no demuestra por sí solo que el montaje sobreviva a un reinicio: reinicia y comprueba de nuevo.

La consulta de tuned comprueba servicio activo, el perfil persistido, `tuned-adm verify` y el valor efectivo de swappiness. Lee el archivo de perfil definido por el [proyecto oficial tuned](https://github.com/redhat-performance/tuned/blob/master/tuned/consts.py), sin cambiar permisos SELinux para redirigir la salida de la herramienta.

## Lo que todavía no está cerrado

La cobertura completa está documentada en `AVANCES_2026-10-06.md`. No se considera validado el laboratorio RHCSA entero por tener instalados Flatpak, tuned o las demás herramientas. La recuperación Debian tampoco sustituye automáticamente el procedimiento rd.break de RHEL.
