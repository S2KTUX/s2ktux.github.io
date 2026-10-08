# Procedencia del laboratorio

El laboratorio no es una distribución de Red Hat. Su base es Debian bookworm i386, construida desde la imagen oficial `debian:bookworm-slim` y paquetes oficiales de Debian. Los programas conservan sus licencias originales. Los avisos del invitado también están disponibles en `/usr/share/doc/*/copyright` y `/usr/share/common-licenses`.

`avisos-licencias-debian.tar.gz` contiene los avisos extraídos de la fábrica. `paquetes-fabrica.tsv` identifica los 417 paquetes instalados, sus versiones, arquitectura y paquete fuente. `procedencia.json` relaciona las 261 versiones fuente —incluido el kernel Linux, además de su paquete firmado— con las direcciones oficiales y sumas SHA-256 de sus archivos. Las fuentes exactas se han descargado y verificado por separado; no se incluyen todas dentro de la web para no superar el límite de tamaño de GitHub Pages.

Las fuentes exactas, recetas y avisos se pueden descargar en [fuentes-laboratorio-v3.tar.gz](https://github.com/S2KTUX/s2ktux.github.io/releases/download/linux-real-beta-2026-10-08/fuentes-laboratorio-v3.tar.gz). Tamaño: 811.556.382 bytes. SHA-256: `a3d493ab84e278f8318a85b42c5bc588f778770206844f102db8470940eb1017`. El archivo se distribuye aparte para no ocupar el espacio de GitHub Pages; no se sustituye por un inventario de enlaces.

## Motor y BIOS

El motor es [v86](https://github.com/copy/v86), con licencia BSD de dos cláusulas. Los binarios Wasm y el cargador original se obtuvieron de `copy.sh`; sus hashes se conservan en los registros de descarga. No se afirma haber recompilado el Wasm original ni se atribuye a S2KTUX su autoría.

El adaptador JavaScript se compiló localmente desde la revisión `1e4f43c95` con los cambios de esta prueba. Se conservan las fuentes locales en `fuentes-motor-con-cambios-v4.tar.gz` y su receta en `compilar-reinicio.mjs`. Los archivos de SoftFloat y Zstandard incluyen sus avisos originales; para Zstandard se selecciona su licencia BSD. El componente de disquetera derivado de QEMU conserva su licencia MIT.

SeaBIOS y VGABIOS coinciden byte por byte con los archivos de BIOS de esa revisión de v86. Su receta utiliza SeaBIOS `rel-1.16.2`; se incluyen sus fuentes, configuración y receta originales junto con `COPYING.LESSER`. No se presenta esta comparación de archivos como una recompilación reproducible independiente.

xterm conserva su licencia MIT en `vendor/LICENSE-xterm.txt`. Esta entrega no utiliza los motores QEMU Wasm, Rocky, Alpine u OVMF de los experimentos anteriores, ni incluye sus binarios.

## Cambios del laboratorio

Las recetas de construcción y las políticas locales de SELinux se conservan con las fuentes de la entrega. SELinux sigue Enforcing; los ajustes son del invitado, no del ordenador del alumno. Los RPM `lab-*`, la aplicación Flatpak de prácticas y el contenedor local son material de laboratorio, no productos ni paquetes de Red Hat. Las recetas muestran cómo se construyen sin sustituir los programas por simulaciones.

Estos archivos documentan la procedencia y acompañan la preparación para publicación. No son una certificación legal ni una promesa de equivalencia con RHEL o el examen RHCSA.
