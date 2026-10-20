# LPIC-1: procedencia y correcciones

## Procedencia

- [LPIC 101-500](https://www.daypo.com/lpic-101-500.html), de **Deza92**: 120 preguntas.
- [LPIC 102-500](https://www.daypo.com/lpic-102-500.html), de **Deza92**: 120 preguntas.

Reutilización autorizada según confirmación del responsable de S2KTUX el 20/10/2026. No se presentan como preguntas oficiales de LPI ni se incluyen en la licencia general de los apuntes.

Se conservan los 120 enunciados de cada banco, con los ajustes que se indican abajo. Las explicaciones breves y la clasificación por objetivos son de S2KTUX. La numeración siguiente es la del banco de origen, no la posición aleatoria de la práctica.

## Normalización de presentación

Se cambian guiones y comillas tipográficos por sus equivalentes ASCII para que los comandos se puedan copiar. Se conservan los saltos de línea. Las dos imágenes del banco 102 se guardan localmente con su atribución; no se carga código, publicidad ni seguimiento de Daypo.

## Correcciones y aclaraciones

### 101 · pregunta 8

Se restaura ln en las dos opciones que el original traducía como «en».

[Documentación de referencia](https://man7.org/linux/man-pages/man1/ln.1.html).

### 101 · pregunta 9

Se unifican el directorio y el grupo ventas: el original mostraba otro grupo y mezclaba ventas con sales.

[Documentación de referencia](https://man7.org/linux/man-pages/man1/chmod.1.html).

### 101 · pregunta 20

Se acota blacklist a la autocarga mediante alias; no bloquea por sí solo toda carga explícita o por dependencia.

[Documentación de referencia](https://man7.org/linux/man-pages/man5/modprobe.d.5.html).

### 101 · pregunta 24

Se elimina «de la primera etapa», una descripción imprecisa del cargador UEFI.

[Documentación de referencia](https://www.gnu.org/software/grub/manual/grub/html_node/Installing-GRUB-using-grub_002dinstall.html).

### 101 · pregunta 26

Se especifica una instalación GRUB para BIOS: i386-pc no es la plataforma de un GRUB UEFI.

[Documentación de referencia](https://www.gnu.org/software/grub/manual/grub/html_node/Installing-GRUB-using-grub_002dinstall.html).

### 101 · pregunta 28

Se traducen las opciones que permanecían en inglés, sin cambiar sus respuestas.

### 101 · pregunta 29

Se especifica el arranque BIOS y la nomenclatura sd* para identificar sin ambigüedad el MBR del tercer disco.

[Documentación de referencia](https://www.gnu.org/software/grub/manual/grub/html_node/Installing-GRUB-using-grub_002dinstall.html).

### 101 · pregunta 30

Se acota el código 82 a una tabla MBR; no es el identificador de swap de GPT.

[Documentación de referencia](https://man7.org/linux/man-pages/man8/fdisk.8.html).

### 101 · pregunta 32

Las versiones actuales de apt-get reconocen también full-upgrade como alias de dist-upgrade. Se aceptan las dos opciones.

[Documentación de referencia](https://github.com/Debian/apt/blob/main/cmdline/apt-get.cc).

### 101 · pregunta 48

Se restaura $USER en el comando: el original traducía el nombre de variable, pero conservaba $USER en las opciones.

[Documentación de referencia](https://manpages.debian.org/bookworm/bash/bash.1.en.html).

### 101 · pregunta 52

Se aclara que archivos es el nombre del fichero de destino, no una referencia a varios archivos.

[Documentación de referencia](https://manpages.debian.org/bookworm/bash/bash.1.en.html).

### 101 · pregunta 64

Se corrige «primera partición» por MBR del disco: la respuesta /dev/sda instala en el disco, no en /dev/sda1.

[Documentación de referencia](https://www.gnu.org/software/grub/manual/grub/html_node/Installing-GRUB-using-grub_002dinstall.html).

### 101 · pregunta 74

Se explicita el supuesto de sectores de 512 bytes usado en los tamaños indicados; 128 es una cantidad habitual de entradas GPT, no un máximo universal.

[Documentación de referencia](https://man7.org/linux/man-pages/man8/fdisk.8.html).

### 101 · pregunta 76

Se acepta también /proc/mounts, enlace habitual a /proc/self/mounts.

[Documentación de referencia](https://man7.org/linux/man-pages/man5/proc_pid_mounts.5.html).

### 101 · pregunta 77

Se pregunta por la entrada completa de seis campos: algunas implementaciones aceptan omitir dump y pass.

[Documentación de referencia](https://man7.org/linux/man-pages/man5/fstab.5.html).

### 101 · pregunta 78

Se aclara que chmod sigue el enlace simbólico y cambia su destino, no el modo propio que muestra ls -l para el enlace.

[Documentación de referencia](https://man7.org/linux/man-pages/man1/chmod.1.html).

### 101 · pregunta 88

Hay dos sintaxis válidas de man entre las opciones. Se aceptan ambas y se convierte la pregunta en selección múltiple.

[Documentación de referencia](https://man7.org/linux/man-pages/man1/man.1.html).

### 101 · pregunta 89

En Bash, tanto > como >& archivo crean o sobrescriben el destino. Se aceptan ambas, indicando que la segunda también redirige errores.

[Documentación de referencia](https://manpages.debian.org/bookworm/bash/bash.1.en.html).

### 101 · pregunta 95

Ctrl+Z envía SIGTSTP, no SIGSTOP. Se corrige la opción marcada por la fuente.

[Documentación de referencia](https://manpages.debian.org/bookworm/bash/bash.1.en.html).

### 101 · pregunta 96

Se retira el espacio accidental entre [ABC] y [abc]; con el espacio original no había coincidencia en ABCabc.

[Documentación de referencia](https://www.gnu.org/software/sed/manual/sed.html).

### 101 · pregunta 98

Se conservan los saltos de línea necesarios del documento here y se aclara que el texto se entrega a cat.

[Documentación de referencia](https://manpages.debian.org/bookworm/bash/bash.1.en.html).

### 101 · pregunta 99

Se especifica nice heredado 0: el incremento predeterminado es 10, no un valor absoluto universal.

[Documentación de referencia](https://man7.org/linux/man-pages/man1/nice.1.html).

### 101 · pregunta 100

Se corrige la clave: la opción con dos barras inversas transmite una barra literal; la opción marcada por Daypo no lo hacía.

[Documentación de referencia](https://manpages.debian.org/bookworm/bash/bash.1.en.html).

### 101 · pregunta 105

Se traducen las cinco opciones que permanecían en inglés, conservando el resultado de descomprimir sin extraer el tar.

[Documentación de referencia](https://www.gnu.org/software/gzip/manual/gzip.html).

### 101 · pregunta 106

Se corrige 41 por 4l en el ejemplo y la traducción errónea de Shift por Mayús.

[Documentación de referencia](https://vimhelp.org/motion.txt.html).

### 101 · pregunta 113

Se identifica /var/log como directorio y se pide revisar los registros persistentes del disco, no el kernel del rescate.

### 102 · pregunta 1

Se admite también hostnamectl como herramienta para establecer el nombre en sistemas systemd.

[Documentación de referencia](https://www.freedesktop.org/software/systemd/man/latest/hostnamectl.html).

### 102 · pregunta 16

Se corrige «contraseña cifrada» por hash o marcador de bloqueo: shadow no almacena una contraseña reversible.

[Documentación de referencia](https://man7.org/linux/man-pages/man5/shadow.5.html).

### 102 · pregunta 22

Un timer no está obligado a activar siempre un servicio: Unit= puede seleccionar otra unidad.

[Documentación de referencia](https://www.freedesktop.org/software/systemd/man/latest/systemd.timer.html).

### 102 · pregunta 24

Se pregunta específicamente por la categoría de locale de mensajes; LANGUAGE también influye en GNU gettext.

[Documentación de referencia](https://man7.org/linux/man-pages/man7/locale.7.html).

### 102 · pregunta 36

Se traduce el enunciado y se corrige la regla: todos los eventos críticos usan *.crit y el servidor indicado es logger.example.com.

[Documentación de referencia](https://www.rsyslog.com/doc/configuration/filters.html).

### 102 · pregunta 39

La respuesta correcta para todas las variables de shell y entorno es set, no env. Se restaura set como opción.

[Documentación de referencia](https://manpages.debian.org/bookworm/bash/bash.1.en.html).

### 102 · pregunta 43

Se restaura el signo : tras result en echo para que el comando coincida con las opciones de salida.

[Documentación de referencia](https://manpages.debian.org/bookworm/bash/bash.1.en.html).

### 102 · pregunta 50

Se sustituye el host ANY no definido por ALL, sin cambiar los comandos ni las etiquetas PASSWD y NOPASSWD.

[Documentación de referencia](https://www.sudo.ws/docs/man/sudoers.man/).

### 102 · pregunta 56

Se aclara la función del agente: ssh-agent mantiene las identidades y ssh-add añade las claves.

[Documentación de referencia](https://man.openbsd.org/ssh-agent).

### 102 · pregunta 57

Se restaura el nombre de display :1, que había quedado mal separado en la traducción.

[Documentación de referencia](https://www.x.org/releases/current/doc/man/man7/X.7.xhtml).

### 102 · pregunta 59

Se conserva el token literal Section de la sintaxis X.Org, sin traducirlo.

[Documentación de referencia](https://www.x.org/releases/current/doc/man/man5/xorg.conf.5.xhtml).

### 102 · pregunta 60

Se corrige la clave SPICE: las funciones son acceso gráfico y redirección USB, no instalar aplicaciones locales.

[Documentación de referencia](https://www.spice-space.org/features.html).

### 102 · pregunta 61

Se corrige «qué» por «dónde»: las opciones son rutas donde se guarda el journal.

[Documentación de referencia](https://www.freedesktop.org/software/systemd/man/latest/journald.conf.html).

### 102 · pregunta 63

Se retira una copia de la opción incorrecta printcap.conf, que aparecía duplicada.

### 102 · pregunta 64

Se admiten las dos rutas habituales de aliases, que dependen del MTA y la distribución.

[Documentación de referencia](https://www.postfix.org/aliases.5.html).

### 102 · pregunta 85

Se sustituye la obligación absoluta de generar personalmente la clave por la recomendación precisa de generación y custodia sin exponer la privada.

[Documentación de referencia](https://man.openbsd.org/ssh-keygen).

### 102 · pregunta 90

La pregunta pide solo la opción: se acepta -i, no la orden ssh -i completa.

[Documentación de referencia](https://man.openbsd.org/ssh).

### 102 · pregunta 92

Se explicitan las condiciones necesarias para conectar: SSID disponible y credenciales válidas, si hacen falta.

[Documentación de referencia](https://networkmanager.dev/docs/api/latest/nmcli.html).

### 102 · pregunta 97

Se corrige la ruta /etc/resolv/conf por /etc/resolv.conf.

[Documentación de referencia](https://man7.org/linux/man-pages/man5/resolv.conf.5.html).

### 102 · pregunta 103

Se acota la pregunta al plugin ifupdown con managed=false y se corrige la clave: la gestión no exige habilitar individualmente todas las interfaces.

[Documentación de referencia](https://networkmanager.dev/docs/api/latest/NetworkManager.conf.html).

### 102 · pregunta 105

locale.conf no admite LC_ALL. Se incorpora LANG y se corrige la pareja válida a LANG y LC_TIME.

[Documentación de referencia](https://www.freedesktop.org/software/systemd/man/latest/locale.conf.html).

### 102 · pregunta 107

Se admite la forma larga --create-home además de -m.

[Documentación de referencia](https://man7.org/linux/man-pages/man8/useradd.8.html).

### 102 · pregunta 108

Se explicita que no existe at.allow, porque esa lista tiene prioridad sobre at.deny.

[Documentación de referencia](https://man7.org/linux/man-pages/man1/at.1p.html).

### 102 · pregunta 114

Se identifica Cronie: el comportamiento sin cron.allow ni cron.deny depende de la implementación de cron.

[Documentación de referencia](https://man7.org/linux/man-pages/man1/crontab.1.html).

### 102 · pregunta 119

Se corrige KMD por KDM.

## Identificación de las copias revisadas

- 101: SHA-256 `776a4ef1efa0ff34142960bca2cf40523533418ff2d76d3609951b3c4e30018b` de los elementos XML de preguntas, en orden de origen.
- 102: SHA-256 `13758ad703713fff5b7b429b17afe18f894c37eb319154699a032a48802613a4` de los elementos XML de preguntas, en orden de origen.
