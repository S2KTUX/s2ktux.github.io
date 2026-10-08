# El laboratorio en GitHub Pages

WSL solo se utiliza en el equipo de preparación para construir la imagen de Linux. No forma parte del laboratorio que descarga el alumno y no necesita mantenerse encendido.

La publicación contiene la página, el motor de la máquina virtual y los fragmentos comprimidos de su disco. GitHub Pages sirve esos archivos estáticos. El navegador del alumno ejecuta el motor y el Linux real; el disco de prácticas y los cambios pertenecen a esa sesión local del navegador.

El estado preparado permite entrar en una máquina ya arrancada. Reiniciar sigue pasando por BIOS, GRUB y el kernel reales. Guardar conserva la memoria y los cambios de ambos discos en el navegador; Reset recupera la base limpia de esa versión. Estas funciones deben volver a validarse en cada candidata antes de sustituir la versión aprobada.

No hay un servidor Linux remoto compartido ni se publica WSL, QEMU de construcción o los discos raw completos. Se publica únicamente la versión seleccionada y sus recursos necesarios, no todas las copias de diagnóstico.

DNF trabaja con repositorios RPM locales auténticos. No se afirma que Debian sea RHEL ni que los invitados tengan acceso general a Internet. Podman utiliza imágenes locales reales: no se finge haber descargado una imagen de un registro externo.

El alumno administra como root el Linux de su propia VM, no Windows ni un servidor compartido. El perfil SELinux administrativo normal permite particionar el disco virtual, cambiar contraseñas y gestionar servicios. SELinux sigue Enforcing para Apache y contenedores confinados. Este perfil no incorpora acceso a carpetas del portátil; los mecanismos de descarga/guardado del navegador siguen fuera del Linux invitado.

La candidata seleccionada es `95d428c6`. La primera entrada rápida medida es de 26,132 s con 50 Mbps/40 ms. Los reinicios y el relabel completo son más lentos; [ESTADO_VALIDACION.md](ESTADO_VALIDACION.md) conserva los tiempos y los informes funcionales de esta fábrica.

Se prepara como prueba independiente para la página personal. No se ha publicado ni modificado la web principal y no se migra todavía la terminal existente. La prueba local no garantiza el mismo rendimiento en cualquier ordenador o conexión.

## Carpeta que se copiará a la web

Copia únicamente el contenido de `publicacion/v86-rhcsa-beta-95d428c6-v3/` a `laboratorios/linux-real/` dentro del repositorio de la página. Mantén sus subcarpetas y nombres. La entrada será `/laboratorios/linux-real/`; `index.html` abre el laboratorio.

No copies toda la carpeta del prototipo. Los discos `.raw`, copias privadas de diagnóstico, perfiles del navegador, fuentes descargadas y paquetes anteriores no pertenecen al sitio. El estado preparado y los fragmentos deben conservar su identidad; el navegador rechaza mezclarlos con otra versión.

`publicacion.json` contiene el inventario, los tamaños y los hashes. `Resultado_paquete_v86_final_v3.json` recoge la comprobación del paquete servido por separado. La estimación también suma el sitio existente y queda bajo el límite de 1 GB de [GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits).

## Fuentes del software, fuera de Pages

El archivo `publicacion/fuentes-laboratorio-v3.tar.gz` reúne las fuentes de las versiones utilizadas, los avisos y las recetas de construcción. Está identificado por su hash en `publicacion/Fuentes_v3.json`. Se ha preparado aparte porque no debe añadirse al sitio ni como archivo grande al repositorio Git.

Antes de publicar el laboratorio, adjunta ese archivo a una Release del mismo repositorio y añade su enlace definitivo en la página `licencias/LEEME.html` y en su fuente `.md`. La interfaz propia se distribuye también como HTML y JavaScript legibles dentro del paquete. No anuncies que las fuentes ya están disponibles mientras no se haya subido el archivo.

## Comprobación después de subirlo

Abre la dirección publicada desde un navegador sin datos previos. Comprueba la primera entrada, un comando real, una práctica, Guardar, recuperar y Reset. Abre también la segunda máquina y verifica que se comunica con la primera tras configurar sus IP. Finalmente, comprueba los enlaces a las guías y a las fuentes.

Con esas pruebas hechas se puede enlazar el laboratorio desde el curso. No hace falta instalar WSL, VMware, Node ni un servidor Linux para usarlo. La preparación actual no incluye ese envío al repositorio ni una migración de las terminales existentes.
