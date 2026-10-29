# Fuentes del motor y del kernel

`fuentes-infraestructura.tar.gz` contiene las fuentes usadas por el motor
v86 solo-PIC, sus licencias y sus recetas. Incluye las tablas generadas y
el cambio del controlador PIC; no incluye perfiles de navegador ni discos.
El ejecutable correspondiente es `v86-pic-only-v1.wasm`, SHA-256
`b31b2045a1ac53ce90e2ead888455b993a24a8c3433a5985ed21e95da47eddef`.

La carpeta `kernel/` conserva la configuración HIGHMEM, sus avisos y las
recetas. Es Linux 6.19.3, sin el parche de red del otro candidato privado.
Su SHA-256 es `356959ed6da96e90c2e446a7d3c74b6cfcb55a3785d5056e6f2ea22a0caaca25`.
El archivo original `linux-6.19.3.tar.xz` ya está incluido en
[las fuentes públicas de Docker](https://github.com/S2KTUX/s2ktux.github.io/releases/download/docker-real-2026-10-11/fuentes-docker-real-2026-10-11.tar.gz).
Su SHA-256 es `0e474968adfcbee32916fd01a89d8ccfd1168d8d32569e76a5c664c793198ebe`.
Para compilar se aplica `kernel.config` a esas fuentes y se ejecutan
`make ARCH=x86 olddefconfig` y `make ARCH=x86 bzImage` con GCC y sus
dependencias habituales. Las recetas conservan las rutas de construcción
originales, que hay que adaptar al entorno local.

La carpeta `construccion/` añade las recetas de la base Debian de
administración y de sus paquetes APT. Las fuentes y avisos de la base
Debian compartida siguen disponibles en
[la entrega de Linux](https://github.com/S2KTUX/s2ktux.github.io/releases/download/linux-real-beta-2026-10-08/fuentes-laboratorio-v3.tar.gz).
Las fuentes y licencias de los ejecutables Kubernetes van en el otro
archivo de fuentes de esta entrega.

Preparar estos archivos no equivale a publicar ni aceptar el laboratorio.
