# Laboratorio Linux real · entrega de prueba

La candidata actual es **95d428c6**. Pasan las **44 prácticas públicas**: ocho iniciales, las 21 del simulacro y 15 complementarias. La entrega está pensada para probar el curso en la página personal, en una ruta independiente y sin sustituir todavía la terminal actual. Los informes identifican la fábrica utilizada; no se mezclan éxitos de distintas versiones.

La distribución es Debian 12 de 32 bits, con systemd, SELinux, LVM, NetworkManager, firewalld, tuned, DNF, Podman y Flatpak auténticos. No es RHEL: algunas rutas y servicios cambian. DNF trabaja con RPM firmados de prácticas y los contenedores usan imágenes locales reales. [La guía del curso](GUIA_CURSO_LABORATORIO.html) explica esas diferencias sin cambiar los apuntes.

## Cómo se utiliza

La entrada es `index.html` o `v86-test.html`. Al pulsar «Iniciar laboratorio», el navegador recupera una máquina ya arrancada. Los programas se ejecutan dentro de un kernel Linux real. La primera entrada medida fue de **26,132 segundos**, con un navegador vacío, 50 Mbps y 40 ms de latencia. El tiempo depende del equipo y la conexión.

La carpeta seleccionada para esta entrega es `publicacion/v86-rhcsa-beta-95d428c6-v3/`. El paquete contiene únicamente la interfaz, el motor, los fragmentos de esta fábrica, las guías y sus informes; no los discos completos ni los experimentos antiguos. `publicacion.json` registra los tamaños y hashes; `Resultado_paquete_v86_final_v3.json` recoge su auditoría y la prueba servida por separado.

El alumno entra como root y puede cambiar contraseñas, particionar los discos virtuales y gestionar servicios. Ese root pertenece a su máquina del navegador: no se montan carpetas de Windows ni se administra un servidor compartido. SELinux sigue Enforcing y confina servicios y contenedores.

«Practicar Linux» permite usar la terminal libremente y abrir guías opcionales. «Practicar modo examen» mantiene las 21 preguntas originales adaptadas a la máquina; oculta las ayudas y comprobaciones hasta terminar el intento. «Ver solución» no envía comandos. «Comprobar ejercicio» consulta el estado real y no repara lo que está mal. Es una herramienta de estudio, no un examen vigilado.

«Guardar sesión» conserva la memoria y las modificaciones de ambos discos en este navegador. Hay que guardar antes de cerrar: no existe guardado automático ni sincronización entre dispositivos. La prueba actual midió unos 21 segundos al guardar y 8 al recuperar. El navegador puede eliminar sus datos, por lo que no sustituye una copia de seguridad.

«Reset» descarta los cambios y el guardado de esa máquina y vuelve a su fábrica limpia. Está probado incluso después de romper GRUB/fstab. La otra máquina no se borra. Para NFS/NTP/autofs, «Abrir la otra máquina» crea otra VM en una pestaña del mismo navegador; ambas se comunican por una red privada, sin DHCP ni acceso general a Internet.

## Mejoras de esta entrega

GRUB puede regenerarse con tuned activo, sin alterar las etiquetas ni desactivar SELinux. Se ha ampliado la prueba de DNF, RPM, reglas de firewalld, scripts, usuarios, tareas programadas, almacenamiento y persistencia tras reiniciar. La terminal agrupa la salida para reducir trabajo de la interfaz y limita el historial auxiliar. Al recuperar una sesión no debe mostrar las consultas internas del comprobador.

Las guías y la chuleta se abren como páginas legibles, también en pantalla estrecha. Los avisos del software y las fuentes de las versiones utilizadas están preparados. El archivo de fuentes se publicará aparte del laboratorio; no se incorpora al sitio de Pages.

## Límites que conviene conocer

Reiniciar y recuperar la contraseña arrancan Linux de verdad y son más lentos que la entrada preparada. Los reinicios medidos van de unos 95 a 279 segundos según el ensayo. La recuperación con relabel completo tardó **613,334 s: 10 minutos y 13 segundos** después de salir de `rd.break`; funciona, pero no cumple el objetivo de tres minutos. No se han omitido pasos para aparentar rapidez. Las pruebas locales en Chromium no garantizan el mismo rendimiento en todos los equipos.

La red comunica las dos máquinas de prácticas, no ofrece acceso general a Internet. DNF no actualiza Debian ni tiene el catálogo completo de Red Hat. Para practicar las rutas exactas del examen, conviene complementar con una VM de RHEL.

GitHub Pages solo entregaría los archivos de la página, motor, estado preparado y fragmentos del disco. El Linux se ejecutaría en el navegador del alumno: **no necesitaría WSL, VMware ni un backend**. WSL y QEMU se utilizan únicamente durante la construcción privada. El tamaño del laboratorio debe sumarse al resto de la web: el límite de sitio publicado es 1 GB, según la [documentación de GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

No se ha publicado ni sustituido ninguna terminal de la web principal. [COMO_SE_PUBLICA.md](COMO_SE_PUBLICA.md) explica qué copiar y cómo publicar también las fuentes. `Resultado_entrega_v86_final_v3.json` relaciona cada práctica con su ensayo positivo en la misma fábrica.

La vista previa local solo entrega archivos estáticos; no ejecuta los comandos del alumno ni constituye una publicación en Internet.
