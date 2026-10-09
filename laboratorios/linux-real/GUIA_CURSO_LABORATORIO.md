# Practicar el curso con este laboratorio

Este es un Linux real que funciona dentro del navegador. Entra como root, prueba los comandos y usa **Reset** si quieres volver a empezar. La máquina es Debian 12 con las herramientas de las prácticas; no es Red Hat. Los comandos no se sustituyen por respuestas inventadas ni por alias.

## Antes de empezar

Pulsa **Iniciar laboratorio**. La primera entrada descarga una máquina preparada; después, el navegador reutiliza los archivos descargados. Para conservar tu trabajo, pulsa **Guardar sesión** antes de cerrar. El guardado pertenece a ese navegador y no se sincroniza con otros equipos.

**Practicar Linux** ofrece 44 ejercicios con comprobación y solución. **Modo examen** abre dos máquinas nuevas: 21 preguntas y una tarea de recuperación de root, 3 horas y nota sobre 300 (aprobado desde 210). No muestra ayudas durante el intento ni modifica el guardado de la práctica libre. Al finalizar comprueba resultados reales; no resuelve ni repara ejercicios. Es una rúbrica educativa propia, no el baremo oficial de Red Hat.

Una máquina nueva empieza sin IP. Configura la red desde Linux: el acceso TCP a Internet utiliza el puente público Wisp y DNS de Cloudflare, sin selector externo. Después configura IP, gateway y DNS con NetworkManager: 10.42.0.20/24 (máquina 2: 10.42.0.11/24), gateway y DNS 10.42.0.1. No admite ping/UDP externos ni conexiones entrantes. No envíes credenciales o datos privados; la disponibilidad depende del servicio externo. APT gestiona Debian; DNF conserva sus RPM locales.

Hay un disco del sistema y otro para particionar y practicar LVM. Comprueba siempre sus nombres con `lsblk`: no borres el disco que contiene `/`. Si rompes el arranque o los discos virtuales, Reset recupera la fábrica limpia de esa máquina. No tiene acceso a los discos de tu portátil.

## Qué cambia respecto a las clases

| Clase | Práctica y diferencias de esta máquina |
| --- | --- |
| 1 · Herramientas básicas | Shell, archivos, permisos, enlaces, redirecciones, compresión, manuales y edición se practican con programas reales. Las prácticas SSH y SCP utilizan las máquinas del laboratorio, sin necesitar servidores externos. |
| 2 · Paquetes | `dnf` y `rpm` son reales, pero trabajan con los RPM firmados del laboratorio. Usa `lab-notas` para instalar, actualizar, borrar, consultar el historial y descargar un paquete. Flatpak tiene un repositorio local; no depende de Flathub. |
| 3 · Scripts | Bash, condiciones, bucles, argumentos y códigos de salida funcionan sobre los archivos y procesos reales de la VM. |
| 4 · Sistema y procesos | systemd, journal, procesos, prioridades y tuned son reales. Los nombres de servicios pueden diferir de los de Red Hat; consúltalos con `systemctl list-unit-files`. |
| 5 · Almacenamiento | GPT, particiones, PV, VG, LV, UUID, LABEL y swap se practican en discos virtuales reales. Los cambios sobreviven a un reinicio y se eliminan con Reset. |
| 6 · Sistemas de archivos | ext4, XFS, VFAT, ampliación, reducción de ext4, permisos y ACL funcionan de verdad. Para NFS y autofs abre la otra máquina y configura la red privada. |
| 7 · Administración | Cron, at, timers, servicios, targets y chrony funcionan. Para regenerar GRUB se usa `update-grub`; no hay `grubby` ni sus rutas de RHEL. No se practica el registro de suscripciones de Red Hat. |
| 8 · Red | NetworkManager, hostname, IPv4, IPv6 y firewalld trabajan en la red privada. No hay DHCP. El acceso externo está integrado, limitado a TCP/IPv4 y DNS: configura las direcciones y las rutas que necesite cada práctica. |
| 9 · Usuarios | Usuarios, grupos, contraseñas, caducidad y sudo son reales. No des por hecho que existe `wheel` ni que tiene permisos: consulta los grupos y configura sudoers con `visudo`. |
| 10 · Seguridad | SELinux está Enforcing. Se pueden practicar etiquetas, puertos, booleanos y diagnóstico de denegaciones, además de SSH y firewalld. Apache se llama `apache2`, no `httpd`. |
| 11 · Contenedores y repaso | Podman funciona con root y sin root, con volúmenes y unidades systemd generadas. Importa la imagen local de prácticas; no se descargan imágenes de Docker Hub. La recuperación de contraseña utiliza GRUB, `rd.break`, `passwd` y el relabel real. |

Los nombres exactos de las clases están en la web. Esta tabla resume su adaptación al laboratorio; no cambia los apuntes del curso ni afirma que todas las capturas de RHEL se puedan copiar literalmente.

## Nombres que te encontrarás

SSH se administra con `ssh.service`, Apache con `apache2.service`, cron con `cron.service` y NTP con `chrony.service`. Apache utiliza `/etc/apache2/`, y sus puertos se configuran en `/etc/apache2/ports.conf`. Puedes comprobarlos sin memorizar nada:

```bash
systemctl list-unit-files --no-pager
systemctl status ssh apache2 cron chrony --no-pager
```

La configuración de GRUB está en `/etc/default/grub`. Tras cambiarla, regenera el fichero de arranque con el programa real:

```bash
update-grub
grub-script-check /boot/grub/grub.cfg
```

No copies comandos con `grubby`, `subscription-manager` o `rhc`: corresponden a Red Hat y no están disponibles aquí. El objetivo es practicar la administración, no fingir que Debian es RHEL.

## Recursos locales para paquetes y contenedores

Los repositorios DNF están en `/etc/yum.repos.d/`. `lab-base` viene habilitado; `lab-updates` permite practicar una actualización real del paquete de ejemplo. Ambos comprueban firmas. No sustituyen al gestor de paquetes de Debian ni sirven para actualizar todo el sistema.

```bash
dnf repolist --all
dnf install lab-notas
rpm -q lab-notas
dnf --enablerepo=lab-updates upgrade lab-notas
dnf history
```

Las soluciones de las prácticas indican cómo añadir el repositorio Flatpak local de `/srv/flatpak` y cómo importar la imagen de Podman. Esta última está disponible para ambos modos:

```bash
podman import /srv/curso-contenedor/imagen.tar localhost/curso-busybox:1
podman images
```

Este archivo es el sistema de archivos del contenedor, por eso usamos `import`, no `load`. La imagen no es `httpd` de Docker Hub: usa BusyBox, tiene `/bin/sh` en lugar de `/bin/bash` y su servidor de prácticas escucha en 8080 con los archivos en `/var/www`. Los comandos de ejecución están en las soluciones.

Para rootless, inicia una sesión de usuario normal; no basta con cambiar variables de entorno en la sesión de root. Ese usuario debe importar la imagen en su propio almacén: no comparte automáticamente las imágenes de root.

## Red y tiempos

**Abrir la otra máquina** crea una segunda VM en otra pestaña del mismo navegador. Ambas parten del mismo estado preparado: configura una IP y una MAC distintas antes de practicar SSH, NFS o NTP. No se conecta a Windows ni a una máquina compartida de otros alumnos.

En una Máquina 1 nueva:

```bash
nmcli con add type ethernet ifname eth0 con-name curso ipv4.method manual ipv4.addresses 10.42.0.20/24 ipv4.gateway 10.42.0.1 ipv4.dns 10.42.0.1 ethernet.cloned-mac-address 02:00:00:42:00:20 connection.autoconnect yes
nmcli con up curso
```

En una Máquina 2 nueva:

```bash
nmcli con add type ethernet ifname eth0 con-name curso ipv4.method manual ipv4.addresses 10.42.0.11/24 ipv4.gateway 10.42.0.1 ipv4.dns 10.42.0.1 ethernet.cloned-mac-address 02:00:00:42:00:11 connection.autoconnect yes
nmcli con up curso
```

Comprueba desde Máquina 1 con `ping -c 2 10.42.0.11`. Son perfiles reales de NetworkManager; puedes cambiarlos para cada práctica. Si recuperas una sesión que ya tiene el perfil, usa `nmcli con modify curso` en lugar de crearlo otra vez.

Mantén una sola pestaña por máquina. Abrir dos copias de «Máquina 1» repite su identidad de red y comparte su guardado, no crea una tercera máquina independiente.

La primera entrada rápida se ha medido localmente en unos 26 segundos con una conexión controlada de 50 Mbps. Los reinicios completos y la recuperación de contraseña son más lentos: arrancan Linux de verdad, no recargan una terminal simulada. Consulta **Estado de validación** para los tiempos y límites de la candidata que estés probando.

Si quieres preparar RHCSA en la distribución exacta del examen, complementa estas prácticas con una VM de RHEL. Este laboratorio sirve para practicar en la web sin instalar nada; no promete equivalencia absoluta con Red Hat.
