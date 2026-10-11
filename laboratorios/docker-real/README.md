# Laboratorio Docker real

Máquina estática para las tres clases de Docker de S2KTUX. Alpine 3.23.6 x86, Linux 6.19.3, Docker Engine 29.5.2, Compose 2.40.3, v86 y xterm. No se emulan respuestas de los comandos.

Entrada: `/laboratorios/docker-real/`. Las imágenes de prácticas están precargadas y tienen nombres propios, sin hacerlas pasar por las oficiales. Una CPU emulada, 1 GiB de RAM, arquitectura `linux/386`. Usar curl dentro de Linux para los puertos publicados; no son puertos de localhost del portátil.

Guardar conserva RAM, disco modificado, archivos, contenedores y volúmenes en IndexedDB, bajo `s2ktux-docker-v86-v1`. Se verifica identidad e integridad y no se sobrescribe un guardado cambiado por otra pestaña. Reset elimina exclusivamente esa clave y vuelve a la fábrica. No hay guardado automático.

La red Ethernet real del invitado usa NAT hacia el puente público `relay.widgetry.org`. Se permiten respuestas a conexiones iniciadas por la VM hacia direcciones IPv4 públicas, no tráfico entrante no solicitado ni conexiones a redes privadas. Utilizar únicamente datos de prácticas. Disponibilidad y velocidad de Internet dependen también del puente externo.

Fuentes correspondientes, recetas de las imágenes y configuración del kernel:
https://github.com/S2KTUX/s2ktux.github.io/releases/tag/docker-real-2026-10-11

Archivo `fuentes-docker-real-2026-10-11.tar.gz`: 649902072 bytes; SHA-256 `537175c21223a59b1e47cce9d3e4b50b24445ac0f5362b3e33111cf06bacc81b`.

Disco: 3 GiB virtuales, fragmentos gzip independientes verificados antes de utilizarlos. SHA-256 de la imagen completa: `7daa60058d6130f440c35dcf10d0206a0852e28c53490ff57b74a92945c80130`.

Verificaciones privadas del 11 de octubre de 2026: ciclo de vida, logs/exec/cp, volúmenes y bind mounts, bridge/DNS/HTTP y HTTPS desde contenedores, Dockerfile/ARG/ENV/USER/ENTRYPOINT/.dockerignore, commit/tag/save/load, cuotas CPU/memoria/update, healthchecks, Compose/config/volúmenes, Go multi-stage/target/scratch, registry push/pull y PostgreSQL SQL/persistencia. Guardar/restaurar/reset comprobados aparte, incluyendo hora antigua y separación de otros guardados. Comprobación de ejercicios basada en estado real, no en igualdad del historial de comandos.

El motor, los BIOS y sus avisos coinciden con los publicados para Linux real. Se conservan sus licencias en `motor/`, `vendor/` y `licencias/`; los avisos y fuentes complementarias están en `/laboratorios/linux-real/licencias/`. No se publican snapshots del alumno, fuentes grandes dentro de Pages ni artefactos antiguos del prototipo.

No es una máquina x64, ni una implementación de Kubernetes, ni una promesa de compatibilidad con todas las imágenes de Docker Hub. La terminal simulada anterior sigue accesible de forma explícita para compatibilidad.
