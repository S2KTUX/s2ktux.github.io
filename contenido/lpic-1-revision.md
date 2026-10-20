# Revisión de LPIC-1: preguntas, curso y examen

Revisión inicial: 20/10/2026. Integración de las correcciones: 2026-10-21. Se contrasta el texto de las clases, no contenido hablado de vídeos que no esté transcrito.

## Estado actual

Se han integrado los 82 detalles que faltaban o estaban explicados parcialmente y se han corregido las 13 erratas del inventario inicial. Se mantienen los títulos, el orden y el diseño: las aclaraciones están dentro de las explicaciones, tablas y ejemplos existentes.

Los conceptos necesarios para las 240 preguntas revisadas tienen ahora explicación en el curso. Esto no convierte el banco en cobertura exhaustiva del examen: los 42 objetivos con peso tienen alguna pregunta, pero siguen faltando variantes de práctica. Tampoco se garantiza un aprobado.

Fuente del alcance: [objetivos oficiales](https://www.lpi.org/our-certifications/exam-101-102-objectives/). Las preguntas proceden de los dos bancos autorizados de Deza92 en Daypo; ver [procedencia y correcciones](lpic-1-correcciones.md). No se han cambiado las preguntas en esta integración.

## Inventario inicial, conservado para comparar

Explicado: el texto enseñaba el concepto necesario. Parcial: faltaba una opción, regla o explicación. Falta: no se enseñaba el detalle. Son categorías editoriales de la revisión del 20/10, no una nota ni un porcentaje de preparación. Las lagunas de esta tabla ya están integradas.

| Tema del curso | Explicado antes | Parcial antes | Faltaba antes |
| --- | ---: | ---: | ---: |
| [Tema 101](/cursos/lpic-1/tema-101-arquitectura-del-sistema/) | 14 | 1 | 0 |
| [Tema 102](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/) | 14 | 4 | 7 |
| [Tema 103](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/) | 27 | 11 | 14 |
| [Tema 104](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/) | 22 | 2 | 4 |
| [Tema 105](/cursos/lpic-1/tema-105-shells-y-scripts/) | 14 | 2 | 0 |
| [Tema 106](/cursos/lpic-1/tema-106-interfaces-graficas-y-accesibilidad/) | 8 | 0 | 0 |
| [Tema 107](/cursos/lpic-1/tema-107-tareas-administrativas/) | 19 | 4 | 3 |
| [Tema 108](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/) | 18 | 3 | 3 |
| [Tema 109](/cursos/lpic-1/tema-109-fundamentos-de-redes/) | 14 | 6 | 8 |
| [Tema 110](/cursos/lpic-1/tema-110-seguridad-del-sistema/) | 8 | 6 | 4 |

## Erratas corregidas

- [101.1](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.1): modprobe -p no es la consulta de parámetros mostrada: corresponde modinfo -p. **Corregido.**
- [101.2](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.2): system.unit debe ser systemd.unit. **Corregido.**
- [101.2](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.2): El arranque anterior se consulta con journalctl -b -1, no -b 1. **Corregido.**
- [101.2](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.2): El kernel no monta las entradas de /etc/fstab: lo hace el espacio de usuario. **Corregido.**
- [101.3](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.3): Systemd sí usa /etc/fstab mediante su generador de unidades. **Corregido.**
- [103.4](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.4): Los operadores << y <<< necesitan escaparse en HTML y el here-document debe mostrarse en varias líneas. **Corregido.**
- [103.6](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.6): nice -n indica un incremento sobre el nice heredado, no siempre un valor absoluto. **Corregido.**
- [104.1](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.1): fdisk moderno también soporta GPT; no es exclusivamente MBR. **Corregido.**
- [104.5](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.5): umask elimina bits mediante una máscara; no es una resta aritmética general. **Corregido.**
- [105.1](/cursos/lpic-1/tema-105-shells-y-scripts/#105.1): Los nombres de variables admiten guion bajo, no guion medio; exportar no depende de las mayúsculas. **Corregido.**
- [107.1](/cursos/lpic-1/tema-107-tareas-administrativas/#107.1): Shadow guarda un hash o marcador, no una contraseña cifrada reversible. **Corregido.**
- [109.1](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.1): 255.255.0.0 equivale a /16, no /24. **Corregido.**
- [110.1](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.1): /etc/shadow tiene nueve campos, incluido el reservado; aquí se afirman ocho. **Corregido.**

## Lo que el banco no cubre suficientemente

- Paquetería: bibliotecas con ldconfig/LD_LIBRARY_PATH, verificaciones e información adicional de paquetes.
- Filtros y archivos: uniq, paste, nl, od, checksums, cpio y dd; hay muchas preguntas de redirecciones pero no de todas estas herramientas.
- Escritura de scripts con if/for/while, funciones y exec: no basta con preguntas sobre variables y seq.
- Accesibilidad y escritorios: el banco se concentra en DISPLAY, SPICE y lectores de pantalla.
- NTP: comprobar el estado y las fuentes con chronyc/ntpq; impresión: enviar y cancelar trabajos, no solo listar.
- Seguridad: GPG no tiene preguntas en este banco; faltan también túneles SSH y varias tareas de auditoría.

Estas ampliaciones del banco siguen pendientes; no se presentan como disponibles. Las tecnologías antiguas no se eliminan solo por antigüedad si permanecen en los objetivos. «Open relay» es terminología de correo, no una tarea de montar un servidor SMTP en LPIC-1.

## Revisión pregunta a pregunta

La numeración es la original de Daypo, no el orden aleatorio de práctica. Se conserva lo detectado antes y se enlaza la explicación integrada; no se incluyen las respuestas del test.

### Examen 101

| Pregunta de origen | Objetivo | Antes | Estado actual y observación |
| --- | --- | --- | --- |
| 1 | [104.1](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 2 | [104.5](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.5) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 3 | [104.2](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 4 | [104.2](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 5 | [104.3](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.3) | Falta | [Integrado en 104.3](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.3). Antes: Falta el seguimiento por systemd de montajes hechos manualmente. |
| 6 | [104.7](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.7) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 7 | [104.3](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.3) | Falta | [Integrado en 104.3](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.3). Antes: Falta mount --bind. |
| 8 | [104.6](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.6) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 9 | [104.5](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.5) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 10 | [104.3](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.3) | Parcial | [Integrado en 104.3](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.3). Antes: mount está explicado; falta /proc/self/mounts. |
| 11 | [104.2](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 12 | [104.5](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.5) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 13 | [104.6](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.6) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 14 | [104.7](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.7) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 15 | [101.2](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 16 | [101.2](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 17 | [101.3](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 18 | [101.2](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 19 | [101.2](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 20 | [101.1](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 21 | [101.2](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 22 | [101.2](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 23 | [102.4](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.4) | Falta | [Integrado en 102.4](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.4). Antes: Falta dpkg -S. |
| 24 | [102.1](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 25 | [102.3](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.3) | Parcial | [Integrado en 102.3](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.3). Antes: Falta mencionar /usr/lib64 entre las rutas habituales. |
| 26 | [102.2](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 27 | [102.5](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.5) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 28 | [102.6](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.6) | Parcial | [Integrado en 102.6](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.6). Antes: Se explica machine-id al clonar, pero no regenerar las claves de host SSH. |
| 29 | [102.2](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 30 | [104.1](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 31 | [102.5](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.5) | Falta | [Integrado en 102.5](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.5). Antes: Faltan variables $basearch/$releasever de YUM. |
| 32 | [102.4](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.4) | Falta | [Integrado en 102.4](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.4). Antes: Falta apt-get dist-upgrade/full-upgrade. |
| 33 | [102.4](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.4) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 34 | [102.5](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.5) | Falta | [Integrado en 102.5](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.5). Antes: Falta rpm -qpR. |
| 35 | [103.6](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.6) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 36 | [103.3](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 37 | [103.4](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.4) | Parcial | [Integrado en 103.4](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.4). Antes: Faltan los duplicados de descriptores, como 2>&1. |
| 38 | [103.8](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.8) | Parcial | [Integrado en 103.8](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.8). Antes: Faltan dd y los prefijos numéricos de vi. |
| 39 | [103.5](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.5) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 40 | [103.1](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 41 | [103.5](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.5) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 42 | [103.8](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.8) | Parcial | [Integrado en 103.8](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.8). Antes: Falta explicar el búfer de borrado de vi. |
| 43 | [103.2](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.2) | Parcial | [Integrado en 103.2](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.2). Antes: tr se menciona sin -d ni el tratamiento CR-LF. |
| 44 | [103.7](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.7) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 45 | [103.8](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.8) | Parcial | [Integrado en 103.8](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.8). Antes: Falta :w con otro nombre de archivo. |
| 46 | [103.5](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.5) | Falta | [Integrado en 103.5](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.5). Antes: Falta relacionar Ctrl+C con SIGINT. |
| 47 | [103.4](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.4) | Falta | [Integrado en 103.4](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.4). Antes: Falta tee. |
| 48 | [103.1](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 49 | [104.7](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.7) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 50 | [103.3](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 51 | [103.5](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.5) | Parcial | [Integrado en 103.5](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.5). Antes: top sí aparece; uptime no. |
| 52 | [103.4](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.4) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 53 | [103.1](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.1) | Falta | [Integrado en 103.1](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.1). Antes: Falta .bash_history. |
| 54 | [103.1](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 55 | [103.3](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 56 | [103.4](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.4) | Falta | [Integrado en 103.4](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.4). Antes: Falta >&2. |
| 57 | [103.2](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 58 | [103.7](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.7) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 59 | [103.6](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.6) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 60 | [103.7](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.7) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 61 | [104.3](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 62 | [102.5](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.5) | Falta | [Integrado en 102.5](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.5). Antes: Falta yum groupinstall. |
| 63 | [102.5](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.5) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 64 | [102.2](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 65 | [102.1](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 66 | [102.4](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.4) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 67 | [102.4](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.4) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 68 | [102.6](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.6) | Parcial | [Integrado en 102.6](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.6). Antes: Falta explicar el aislamiento de contenedores frente al hardware virtualizado. |
| 69 | [102.4](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.4) | Falta | [Integrado en 102.4](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.4). Antes: Falta apt-get install -f. |
| 70 | [102.5](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.5) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 71 | [102.2](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.2) | Falta | [Integrado en 102.2](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.2). Antes: Faltan menuentry e insmod de GRUB. |
| 72 | [102.3](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 73 | [102.1](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.1) | Parcial | [Integrado en 102.1](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.1). Antes: LVM se presenta sin snapshots ni ejemplos de redimensionado. |
| 74 | [102.1](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 75 | [104.6](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.6) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 76 | [104.3](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.3) | Falta | [Integrado en 104.3](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.3). Antes: Faltan /proc/mounts y /proc/self/mounts. |
| 77 | [104.3](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 78 | [104.5](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.5) | Parcial | [Integrado en 104.5](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.5). Antes: Falta explicar chmod sobre un enlace simbólico. |
| 79 | [104.2](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.2) | Falta | [Integrado en 104.1](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.1). Antes: Falta el reparto de inodos de ext2/ext3. |
| 80 | [104.5](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.5) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 81 | [104.6](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.6) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 82 | [104.5](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.5) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 83 | [104.2](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 84 | [104.6](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.6) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 85 | [104.7](/cursos/lpic-1/tema-104-dispositivos-sistemas-de-archivos-y-fhs/#104.7) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 86 | [103.1](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 87 | [103.8](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.8) | Falta | [Integrado en 103.8](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.8). Antes: Falta la búsqueda inversa ? de vi. |
| 88 | [103.1](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.1) | Falta | [Integrado en 103.1](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.1). Antes: Falta seleccionar la sección del manual. |
| 89 | [103.4](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.4) | Parcial | [Integrado en 103.4](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.4). Antes: Se explica >, pero no >& archivo en Bash. |
| 90 | [103.1](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.1) | Falta | [Integrado en 105.1](/cursos/lpic-1/tema-105-shells-y-scripts/#105.1). Antes: Falta set para opciones y parámetros posicionales. |
| 91 | [103.5](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.5) | Falta | [Integrado en 103.5](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.5). Antes: Faltan pgrep -u y -U. |
| 92 | [103.8](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.8) | Parcial | [Integrado en 103.8](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.8). Antes: Se explica :wq, pero no ZZ. |
| 93 | [103.7](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.7) | Falta | [Integrado en 103.2](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.2). Antes: Falta grep -v. |
| 94 | [103.1](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 95 | [103.5](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.5) | Falta | [Integrado en 103.5](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.5). Antes: Falta relacionar Ctrl+Z con SIGTSTP. |
| 96 | [103.7](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.7) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 97 | [103.1](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.1) | Parcial | [Integrado en 103.1](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.1). Antes: pwd está explicado; falta la variable PWD. |
| 98 | [103.4](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.4) | Parcial | [Integrado en 103.4](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.4). Antes: El ejemplo de here-document no conserva una sintaxis útil y usa < sin escapar en HTML. |
| 99 | [103.6](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.6) | Falta | [Integrado en 103.6](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.6). Antes: Falta el incremento por defecto de nice y su diferencia respecto al valor heredado. |
| 100 | [103.3](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 101 | [103.7](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.7) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 102 | [103.3](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 103 | [103.3](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 104 | [103.2](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 105 | [103.3](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.3) | Parcial | [Integrado en 103.2](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.2). Antes: Se explica descompresión, no el cambio .tgz a .tar. |
| 106 | [103.8](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.8) | Falta | [Integrado en 103.8](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.8). Antes: Faltan los prefijos numéricos para movimientos y operadores de vi. |
| 107 | [103.5](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.5) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 108 | [103.2](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.2) | Falta | [Integrado en 103.2](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.2). Antes: Falta split. |
| 109 | [103.4](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.4) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 110 | [103.5](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.5) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 111 | [103.6](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.6) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 112 | [103.4](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.4) | Falta | [Integrado en 103.4](/cursos/lpic-1/tema-103-comandos-gnu-y-unix/#103.4). Antes: Falta 1>&2. |
| 113 | [101.2](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 114 | [102.2](/cursos/lpic-1/tema-102-instalacion-de-linux-y-gestion-de-paquetes/#102.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 115 | [101.3](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 116 | [101.2](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 117 | [101.1](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.1) | Parcial | [Integrado en 101.1](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.1). Antes: modprobe se menciona, pero su ejemplo de consulta es incorrecto y no se muestra la carga básica. |
| 118 | [101.1](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 119 | [101.3](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 120 | [101.3](/cursos/lpic-1/tema-101-arquitectura-del-sistema/#101.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |

### Examen 102

| Pregunta de origen | Objetivo | Antes | Estado actual y observación |
| --- | --- | --- | --- |
| 1 | [109.2](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 2 | [109.1](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 3 | [109.3](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.3) | Parcial | [Integrado en 109.3](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.3). Antes: netstat se presenta sin sus opciones de rutas y estadísticas. |
| 4 | [109.2](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 5 | [109.4](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.4) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 6 | [109.4](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.4) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 7 | [109.2](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.2) | Parcial | [Integrado en 109.2](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.2). Antes: Faltan los tipos de conexión de NetworkManager. |
| 8 | [109.3](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.3) | Falta | [Integrado en 109.3](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.3). Antes: Faltan route y los retrasos de resolución de nombres. |
| 9 | [109.1](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.1) | Parcial | [Integrado en 109.1](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.1). Antes: Falta explicar cómo disminuye Hop Limit. |
| 10 | [109.2](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.2) | Parcial | [Integrado en 109.2](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.2). Antes: Se muestra connection, no device. |
| 11 | [109.3](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 12 | [109.1](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.1) | Falta | [Integrado en 109.1](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.1). Antes: Falta calcular hosts útiles a partir de CIDR. |
| 13 | [109.1](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 14 | [109.2](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 15 | [107.1](/cursos/lpic-1/tema-107-tareas-administrativas/#107.1) | Parcial | [Integrado en 107.1](/cursos/lpic-1/tema-107-tareas-administrativas/#107.1). Antes: Falta aclarar que UID y GID son espacios independientes. |
| 16 | [107.1](/cursos/lpic-1/tema-107-tareas-administrativas/#107.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 17 | [107.2](/cursos/lpic-1/tema-107-tareas-administrativas/#107.2) | Falta | [Integrado en 107.2](/cursos/lpic-1/tema-107-tareas-administrativas/#107.2). Antes: Falta systemctl list-timers. |
| 18 | [108.1](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 19 | [107.2](/cursos/lpic-1/tema-107-tareas-administrativas/#107.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 20 | [107.1](/cursos/lpic-1/tema-107-tareas-administrativas/#107.1) | Parcial | [Integrado en 107.1](/cursos/lpic-1/tema-107-tareas-administrativas/#107.1). Antes: Se explica useradd -d, pero no -u. |
| 21 | [107.3](/cursos/lpic-1/tema-107-tareas-administrativas/#107.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 22 | [107.2](/cursos/lpic-1/tema-107-tareas-administrativas/#107.2) | Parcial | [Integrado en 107.2](/cursos/lpic-1/tema-107-tareas-administrativas/#107.2). Antes: Falta Unit= y el destino de activación de un timer. |
| 23 | [107.2](/cursos/lpic-1/tema-107-tareas-administrativas/#107.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 24 | [107.3](/cursos/lpic-1/tema-107-tareas-administrativas/#107.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 25 | [107.1](/cursos/lpic-1/tema-107-tareas-administrativas/#107.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 26 | [107.1](/cursos/lpic-1/tema-107-tareas-administrativas/#107.1) | Falta | [Integrado en 107.1](/cursos/lpic-1/tema-107-tareas-administrativas/#107.1). Antes: Faltan chsh y el uso de /bin/false como shell. |
| 27 | [108.2](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 28 | [108.2](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.2) | Falta | [Integrado en 108.2](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.2). Antes: Faltan los metadatos y el reenvío de journald. |
| 29 | [108.3](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 30 | [108.1](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 31 | [108.2](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 32 | [107.3](/cursos/lpic-1/tema-107-tareas-administrativas/#107.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 33 | [108.3](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 34 | [108.4](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.4) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 35 | [108.4](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.4) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 36 | [108.2](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.2) | Falta | [Integrado en 108.2](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.2). Antes: Falta una regla concreta de syslog con prioridades y destino remoto. |
| 37 | [108.1](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.1) | Parcial | [Integrado en 108.1](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.1). Antes: Falta un ejemplo server en ntp.conf. |
| 38 | [108.3](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.3) | Falta | [Integrado en 108.3](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.3). Antes: Falta el concepto de open relay de correo. |
| 39 | [105.1](/cursos/lpic-1/tema-105-shells-y-scripts/#105.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 40 | [105.2](/cursos/lpic-1/tema-105-shells-y-scripts/#105.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 41 | [105.1](/cursos/lpic-1/tema-105-shells-y-scripts/#105.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 42 | [105.1](/cursos/lpic-1/tema-105-shells-y-scripts/#105.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 43 | [105.2](/cursos/lpic-1/tema-105-shells-y-scripts/#105.2) | Parcial | [Integrado en 105.2](/cursos/lpic-1/tema-105-shells-y-scripts/#105.2). Antes: Falta cómo read reparte los campos entre varias variables. |
| 44 | [105.1](/cursos/lpic-1/tema-105-shells-y-scripts/#105.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 45 | [105.2](/cursos/lpic-1/tema-105-shells-y-scripts/#105.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 46 | [105.1](/cursos/lpic-1/tema-105-shells-y-scripts/#105.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 47 | [110.1](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 48 | [110.3](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.3) | Parcial | [Integrado en 110.3](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.3). Antes: Falta explicar expresamente la identidad que acredita la clave de host. |
| 49 | [110.2](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 50 | [110.1](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.1) | Parcial | [Integrado en 110.1](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.1). Antes: Faltan PASSWD y la herencia de etiquetas en listas sudoers. |
| 51 | [110.3](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.3) | Falta | [Integrado en 110.3](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.3). Antes: Falta /etc/ssh/ssh_config. |
| 52 | [110.2](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 53 | [110.1](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.1) | Parcial | [Integrado en 110.2](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.2). Antes: lsof aparece para archivos abiertos, no para sockets TCP. |
| 54 | [110.3](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.3) | Parcial | [Integrado en 110.3](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.3). Antes: Falta explicar que ssh -X configura DISPLAY en la sesión remota. |
| 55 | [110.2](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 56 | [110.3](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 57 | [106.1](/cursos/lpic-1/tema-106-interfaces-graficas-y-accesibilidad/#106.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 58 | [106.3](/cursos/lpic-1/tema-106-interfaces-graficas-y-accesibilidad/#106.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 59 | [106.1](/cursos/lpic-1/tema-106-interfaces-graficas-y-accesibilidad/#106.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 60 | [106.2](/cursos/lpic-1/tema-106-interfaces-graficas-y-accesibilidad/#106.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 61 | [108.2](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 62 | [108.3](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 63 | [108.4](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.4) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 64 | [108.3](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 65 | [108.2](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 66 | [108.2](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.2) | Parcial | [Integrado en 108.2](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.2). Antes: Se explica --since, pero no --until. |
| 67 | [108.3](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 68 | [108.4](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.4) | Parcial | [Integrado en 108.4](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.4). Antes: lpstat se menciona sin explicar su listado de trabajos. |
| 69 | [108.2](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 70 | [108.1](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 71 | [108.1](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 72 | [108.1](/cursos/lpic-1/tema-108-servicios-esenciales-del-sistema/#108.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 73 | [105.1](/cursos/lpic-1/tema-105-shells-y-scripts/#105.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 74 | [105.1](/cursos/lpic-1/tema-105-shells-y-scripts/#105.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 75 | [105.1](/cursos/lpic-1/tema-105-shells-y-scripts/#105.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 76 | [105.1](/cursos/lpic-1/tema-105-shells-y-scripts/#105.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 77 | [105.1](/cursos/lpic-1/tema-105-shells-y-scripts/#105.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 78 | [105.2](/cursos/lpic-1/tema-105-shells-y-scripts/#105.2) | Parcial | [Integrado en 105.2](/cursos/lpic-1/tema-105-shells-y-scripts/#105.2). Antes: Falta diferenciar el tratamiento de #! por el kernel y por el intérprete. |
| 79 | [105.2](/cursos/lpic-1/tema-105-shells-y-scripts/#105.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 80 | [105.1](/cursos/lpic-1/tema-105-shells-y-scripts/#105.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 81 | [107.1](/cursos/lpic-1/tema-107-tareas-administrativas/#107.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 82 | [110.1](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.1) | Parcial | [Integrado en 110.1](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.1). Antes: Falta el límite de archivos core con ulimit. |
| 83 | [107.1](/cursos/lpic-1/tema-107-tareas-administrativas/#107.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 84 | [110.2](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.2) | Falta | [Integrado en 110.2](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.2). Antes: Falta cuándo se aplican cambios de TCP Wrappers. |
| 85 | [110.3](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.3) | Parcial | [Integrado en 110.3](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.3). Antes: Falta una explicación clara de custodia de claves públicas y privadas. |
| 86 | [110.1](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 87 | [110.3](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 88 | [110.2](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 89 | [110.3](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.3) | Falta | [Integrado en 110.3](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.3). Antes: Falta SSH_AUTH_SOCK. |
| 90 | [110.3](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.3) | Falta | [Integrado en 110.3](/cursos/lpic-1/tema-110-seguridad-del-sistema/#110.3). Antes: Falta ssh -i. |
| 91 | [109.1](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 92 | [109.2](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.2) | Falta | [Integrado en 109.2](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.2). Antes: Falta nmcli device wifi connect. |
| 93 | [109.4](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.4) | Falta | [Integrado en 109.4](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.4). Antes: Falta dig -t ns y la lectura del tipo consultado. |
| 94 | [109.3](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 95 | [109.2](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.2) | Falta | [Integrado en 109.2](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.2). Antes: Faltan los estados de conectividad portal/full. |
| 96 | [109.1](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.1) | Falta | [Integrado en 109.1](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.1). Antes: Falta calcular el rango de hosts de una subred. |
| 97 | [109.4](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.4) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 98 | [109.3](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 99 | [109.3](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.3) | Falta | [Integrado en 109.3](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.3). Antes: Faltan ifconfig e ip -s link para estadísticas. |
| 100 | [109.3](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.3) | Parcial | [Integrado en 109.3](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.3). Antes: Falta una regla explícita de selección por prefijo más específico. |
| 101 | [109.3](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.3) | Parcial | [Integrado en 109.3](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.3). Antes: Falta eliminar la ruta por defecto. |
| 102 | [109.2](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 103 | [109.2](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.2) | Falta | [Integrado en 109.2](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.2). Antes: Falta la interacción ifupdown/NetworkManager managed=false. |
| 104 | [109.1](/cursos/lpic-1/tema-109-fundamentos-de-redes/#109.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 105 | [107.3](/cursos/lpic-1/tema-107-tareas-administrativas/#107.3) | Parcial | [Integrado en 107.3](/cursos/lpic-1/tema-107-tareas-administrativas/#107.3). Antes: Se presenta locale.conf sin advertir que no admite LC_ALL. |
| 106 | [107.3](/cursos/lpic-1/tema-107-tareas-administrativas/#107.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 107 | [107.1](/cursos/lpic-1/tema-107-tareas-administrativas/#107.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 108 | [107.2](/cursos/lpic-1/tema-107-tareas-administrativas/#107.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 109 | [107.1](/cursos/lpic-1/tema-107-tareas-administrativas/#107.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 110 | [107.1](/cursos/lpic-1/tema-107-tareas-administrativas/#107.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 111 | [107.2](/cursos/lpic-1/tema-107-tareas-administrativas/#107.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 112 | [107.1](/cursos/lpic-1/tema-107-tareas-administrativas/#107.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 113 | [107.2](/cursos/lpic-1/tema-107-tareas-administrativas/#107.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 114 | [107.2](/cursos/lpic-1/tema-107-tareas-administrativas/#107.2) | Falta | [Integrado en 107.2](/cursos/lpic-1/tema-107-tareas-administrativas/#107.2). Antes: Falta el comportamiento de Cronie si no existen allow/deny. |
| 115 | [107.3](/cursos/lpic-1/tema-107-tareas-administrativas/#107.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 116 | [107.1](/cursos/lpic-1/tema-107-tareas-administrativas/#107.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 117 | [106.3](/cursos/lpic-1/tema-106-interfaces-graficas-y-accesibilidad/#106.3) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 118 | [106.1](/cursos/lpic-1/tema-106-interfaces-graficas-y-accesibilidad/#106.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 119 | [106.1](/cursos/lpic-1/tema-106-interfaces-graficas-y-accesibilidad/#106.1) | Explicado | Explicado. Concepto recogido en el texto del curso. |
| 120 | [106.2](/cursos/lpic-1/tema-106-interfaces-graficas-y-accesibilidad/#106.2) | Explicado | Explicado. Concepto recogido en el texto del curso. |

## Documentación de contraste

- [systemd: unidades de montaje](https://www.freedesktop.org/software/systemd/man/latest/systemd.mount.html)
- [systemd: temporizadores](https://www.freedesktop.org/software/systemd/man/latest/systemd.timer.html)
- [systemd: localización](https://www.freedesktop.org/software/systemd/man/latest/locale.conf.html)
- [NetworkManager: configuración](https://networkmanager.dev/docs/api/latest/NetworkManager.conf.html)
- [OpenSSH: cliente](https://man.openbsd.org/ssh)
- [Bash: redirecciones](https://www.gnu.org/software/bash/manual/html_node/Redirections.html)
- [APT: subcomandos de apt-get](https://salsa.debian.org/apt-team/apt/-/blob/main/cmdline/apt-get.cc)

## Límite de esta comprobación

Se revisa el material disponible, no preguntas confidenciales ni la totalidad de posibles variantes del examen. No se promete aprobado ni se considera equivalente el 70 % del simulacro a la escala oficial de LPI.
