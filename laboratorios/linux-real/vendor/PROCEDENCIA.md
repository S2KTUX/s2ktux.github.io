# Dependencias de la prueba

QEMU Wasm y el disco Alpine se descargan de la demostración de ktock. Los recursos binarios de esa web no están ligados aquí a un commit de compilación verificable; `assets/descargas.json` conserva la URL, longitud y hash de cada archivo exacto descargado. Los commits documentados en README identifican las fuentes consultadas, no garantizan por sí solos que sean el código fuente correspondiente a esos binarios. No publicar estos binarios sin completar esa revisión.

La página de demostración tiene licencia Apache-2.0. QEMU utiliza GPL-2.0 y distintas licencias para componentes; el kernel Linux tiene GPL-2.0 y Alpine contiene paquetes con sus propias licencias. La licencia de la página no relicencia todo el invitado. Se conserva COPYING de las fuentes QEMU consultadas, pero antes de redistribuir hay que identificar y ofrecer todas las fuentes correspondientes y avisos de los binarios.

xterm-pty 0.11.1 se descarga de su paquete npm sin modificar, con su licencia MIT. xterm 5.5.0, su CSS y la licencia MIT se copian de los recursos ya presentes en el sitio; esa copia ESM procede de la preparación del proveedor existente, no de una nueva implementación.

coi-serviceworker.js se copia sin modificar de la demostración. Su fuente es [coi-serviceworker](https://github.com/gzuidhof/coi-serviceworker), licencia MIT. Se utiliza únicamente para el aislamiento de origen requerido por SharedArrayBuffer al servir archivos estáticos; no ejecuta un servidor remoto.

Los archivos nuevos `index.html`, `prototipo.css`, `prototipo.mjs` y los scripts de preparación/vista/prueba son el adaptador local de esta prueba. No sustituyen ni se atribuyen la autoría de QEMU, Linux, Alpine ni xterm.

## Variante Rocky 9

La imagen GenericCloud Base 9.8 procede de `download.rockylinux.org`. `assets/rocky9/imagen.json` identifica su URL, tamaño y SHA256 comprobado con el checksum oficial. La firma GPG aún no se ha verificado. El kernel y el initramfs se extraen sin modificarlos de una copia de ese mismo disco, montada en modo de solo lectura; `assets/rocky9/kernel/procedencia.json` identifica sus hashes y versión.

El motor alternativo procede de [fzakaria/trynix](https://github.com/fzakaria/trynix), release `engine-20260913-2056`, que apunta al commit `65fc6be823e0b2045fee3fd0fb8e8eaba1b20b1a`. No se utiliza su aplicación, proxy, imagen Nix ni estado de máquina. `assets/motor-corregido/procedencia.json` conserva los hashes y la referencia anterior de `engine-pins.json` (`7e7e793594cb58efb48279b17b4e15bbc6fbe91b`) para trazabilidad; no se confunde con el commit de la etiqueta. Se conservan la receta y los parches consultados, incluido el arreglo de POPCNT. No se ha recompilado localmente ni se ha completado una auditoría de correspondencia de fuentes y licencias para redistribuirlo.

OVMF procede del paquete oficial Ubuntu `ovmf_2024.02-2ubuntu0.9_all.deb`, extraído sin instalarlo en el sistema. Sus avisos originales están en `tools/native/usr/share/doc/ovmf/copyright`. QEMU-utils y sus bibliotecas se han extraído también como herramientas de preparación locales. No se han instalado paquetes globales para preparar esta prueba.

pycdlib 1.14.0, con licencia LGPL-2.1, se conserva en `tools/python` para generar el CD NoCloud. No se carga en el navegador. La semilla configura únicamente la máquina desechable; no desactiva SELinux ni sustituye los programas del invitado por respuestas simuladas. Estos recursos siguen fuera del repositorio público: falta completar la revisión de distribución antes de publicarlos.

El esquema de configuración procede de `canonical/cloud-init`, tag `24.4`, archivo `cloudinit/config/schemas/schema-cloud-config-v1.json`. Para validarlo se añaden PyYAML 6.0.2 y jsonschema 4.23.0 con sus dependencias, únicamente en `tools/python`; sus avisos están en los directorios de distribución de los paquetes. Estas herramientas no se instalan globalmente ni se sirven como parte de la página del laboratorio.

## Estado preparado para inicio rápido

Se ha compilado **solo el preparador QEMU nativo**, a partir de `ktock/qemu-wasm` commit `0ef7b4e2814b231705d8371dd7997f5b72e70baf`, con el parche de reloj `0003-count-the-clock-the-resumer-will-count.patch` de la revisión trynix indicada arriba. Se define `QEMU_GENERIC_HOST_TICKS` para calibrar el invitado contra el contador que usa Wasm. El motor Wasm continúa siendo el binario externo identificado; no se afirma haberlo recompilado.

`Preparar_QEMU_nativo.sh` conserva las fuentes y genera el binario en `tools/qemu-native-build`. Las bibliotecas y herramientas de compilación descargadas de Ubuntu se extraen en `tools/native`, sin instalar paquetes globales. QEMU utiliza GPL y las dependencias mantienen sus propias licencias y avisos. Antes de redistribuir siguen siendo necesarias la revisión y entrega de fuentes correspondientes.

`Preparar_snapshot_Rocky.py` arranca una copia del disco oficial con la misma definición de dispositivos del navegador, valida el reloj y la consola nativos y genera un estado de migración. El disco comprimido se compara sector a sector con esa copia. Los hashes, argumentos, inventario y datos de origen están en cada `maquina.json`; no se importa el estado de máquina de trynix. El segundo estado `rapido-reloj` prueba `tsc=reliable`: no resolvió la lentitud de systemctl y no se utiliza por defecto.

La preparación nativa solo construye archivos de esta prueba. No ejecuta los comandos de los alumnos ni crea un servidor de terminal. Esos comandos siguen ejecutándose dentro de Rocky en WebAssembly.

## Imagen ampliada RHCSA y descarga por demanda

Los perfiles `rhcsa9-v1/v2/v3` son copias nuevas; no sobrescriben la imagen oficial. Los paquetes añadidos y el repo local proceden de RPM oficiales de Rocky y se instalaron con comprobación GPG en DNF. El kernel sigue sin cambios; el initramfs de `kernel-ligero` se reconstruyó con dracut para este hardware y su procedimiento/hashes constan en `procedencia.json`. No se confunde con el initramfs original sin modificar.

`Empaquetar_disco.mjs` genera fragmentos del QCOW2 comprimido y del estado, verificando el hash global. El navegador comprueba también cada fragmento antes de usarlo. Fragmentar y añadir avisos no completa por sí solo los requisitos de redistribución: la revisión de fuentes/licencias sigue pendiente antes de publicar. Los perfiles v1/v2 fallaron en navegador por su configuración de red y se conservan solo para diagnóstico.
