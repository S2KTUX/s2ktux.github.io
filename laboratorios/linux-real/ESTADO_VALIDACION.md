# Estado del laboratorio · 8 de octubre de 2026

La página publicada no se ha modificado. El prototipo sigue siendo Debian con herramientas auténticas para practicar RHCSA; no es RHEL y no se presenta como un sustituto idéntico del examen.

## Candidata actual · 95d428c6

La nueva fábrica se reconstruyó desde la base limpia en `v86-diagnostico-gsbcbdgt`, sin cuentas ni prácticas de los ensayos. SHA-256: `95d428c63c01967ef44e573955c3f05d25fb6fa7db363584551b3754851f7c97`. El estado preparado está ligado a esta identidad. Root mantiene su perfil administrativo normal y SELinux permanece Enforcing.

La revisión encontró un fallo real al regenerar GRUB: su dominio no podía leer `/etc/tuned/bootcmdline`. Se añadió únicamente lectura/búsqueda de la configuración de tuned para `bootloader_t`, dentro de la VM. Se conserva el hook original, no se cambian sus etiquetas ni se desactiva SELinux. `update-grub`, `grub-script-check` y el cambio de un argumento inocuo del kernel tras reiniciar pasan en navegador (`Resultado_v86_prepublicacion_v2.json`).

La primera entrada en un navegador vacío tarda **26,132 s** con 50 Mbps compartidos y 40 ms de latencia. El arranque completo en frío tarda **151,062 s**. Son medidas locales, no garantías para cualquier equipo ni pruebas del dominio público. El guardado/recuperación de la sesión medido en esta candidata es **20,573 s / 8,439 s**.

La matriz ampliada pasa 22 bloques reales de administración, edición con vi y persistencia: shell/compresión/scripts, usuarios/permisos, cron/at/timers, tuned, etiquetas/puertos/booleanos SELinux, DNF/RPM, Flatpak, GPT/LVM/ext4/XFS/VFAT/swap, IPv4/IPv6 y firewalld (`Resultado_v86_cobertura_final_v2.json`). También pasan DNF history undo/download/rpm2cpio y reglas avanzadas de firewalld. No se instalan parches durante los ensayos.

El catálogo v9, aplicaciones v6, sintaxis v4, identidad v3, modos v4, sesiones v5, Flatpak de usuario v5 y almacenamiento v6 ya pasan sobre esta fábrica. Almacenamiento conserva datos y montajes tras un reinicio real de **278,662 s**. El mayor tiempo respecto a ensayos antiguos se registra; no se sustituye por una cifra anterior.

Red v7 pasa con dos máquinas: IP/MAC/hostname persistentes, NFS con datos transmitidos y modificados en el servidor, autofs, chrony y firewall. Los reinicios reales tardan **94,826 s en el cliente y 104,896 s en el servidor**, ambos dentro del objetivo de 180 s; los servicios arrancan solos y las comprobaciones vuelven a aprobar (`Resultado_v86_red_curso_final_v7.json`). El ensayo v6 anterior agotó 300 s al reiniciar el servidor y se conserva como fallo; la repetición no oculta esa variación de rendimiento ni garantiza tiempos universales.

Complementarias v7 pasa procesos y prioridades, scripts con distintas entradas, SSH/SCP, reducción de ext4, ampliación de XFS y el contenedor de hermes con dos volúmenes. Después del reinicio real de **228,306 s**, su unidad de usuario arranca sola, conserva los datos y vuelve a aprobar; no se inicia manualmente para hacer pasar la prueba (`Resultado_v86_complementarias_final_v7.json`).

La interfaz agrupa bytes de salida respetando UTF-8 y limita su historial auxiliar a 4.194.304 caracteres. El guardado utiliza solo el historial visible, no los comandos internos de comprobación. El lector de comprobaciones evita limpiar toda su salida por cada carácter. Pasan los 13 tests de protocolo/salida; los 44 probes pasan también sintaxis en el Linux real de esta fábrica. La colección final incluye además su prueba en navegador y la prueba del paquete estático sin acceso a los experimentos privados.

Las guías y la chuleta se ofrecen como HTML legible, no solo como descarga de Markdown. Las cuatro páginas pasan en 1.280 y 390 px, sin desbordamiento (`Resultado_guias_web.json`). Se conserva la separación de práctica libre/examen y sus 21 preguntas originales.

Se prepararon los avisos de los 417 paquetes y sus 261 versiones exactas de fuentes: 845 archivos con hashes verificados. El archivo independiente `publicacion/fuentes-laboratorio-v3.tar.gz` ocupa 811.556.382 bytes, SHA-256 `a3d493ab84e278f8318a85b42c5bc588f778770206844f102db8470940eb1017`. Las fuentes deben subirse aparte y enlazarse antes de publicar. La interfaz actual se distribuye también como código legible en el paquete web.

Recuperación v8 pasa funcionalmente: GRUB, `rd.break`, cambio interactivo de contraseña, relabel completo, etiquetas de shadow, datos conservados, PID 1 en init_t y retorno a Enforcing. El comprobador público del simulacro 01 rechaza antes y aprueba después. La reanudación después de salir de `rd.break` tarda **613,334 s (10 min 13 s)**; el ensayo completo tarda 744,053 s. **No cumple el objetivo de 180 s** (`Resultado_v86_rdbreak_final_v8.json`). Esta cifra, peor que la medición antigua de 31fd, se conserva y no se sustituye por ella.

La variante experimental de relabel anticipado se descartó: pasó funcionalmente en 31fd, pero tardó 454,538 s y no mejoró el tiempo de aquella fábrica. No forma parte de 95d. La entrega actual mantiene el procedimiento normal; no promete una optimización del relabel que no se haya conseguido.

La salida v4 pasa escritura y lectura Unicode, guardado/restauración sin consultas internas, 4,5 MB de salida real en **8,461 s**, límite del historial auxiliar y Reset posterior (`Resultado_v86_salida_final_v4.json`). El intento v3 falló por un detector de texto que no contemplaba la secuencia ANSI de Bash; la salida real con «español» ya estaba presente. Se corrigió el detector y se conserva el informe fallido.

La auditoría de entrega pasa: los 17 informes de evidencia corresponden a 95d y acreditan positivos de las **44 prácticas públicas**, incluidos los negativos exigidos. `Resultado_entrega_v86_final_v3.json` lo relaciona por identificador y conserva `recoveryPerformancePassed=false`. La auditoría del paquete servido por separado se recoge en `Resultado_paquete_v86_final_v3.json`. Un informe inexistente o incompleto no se considera aprobado. El objetivo es una prueba independiente para la página personal; no una equivalencia completa con RHEL.

## Historial anterior · fábrica 31fd y variantes previas

Los apartados siguientes son históricos. La palabra «actual» en ellos se refiere a su fecha de ensayo. Los informes comunes de construcción/base/descarga y la fábrica 31fd se conservan en `tools/v86-test/base-validada-20261008-07/`; no se confunden con los resultados actuales de 95d.

La candidata actual procede de `v86-diagnostico-9kbuuzfj`, reconstruida desde la fábrica original sin prácticas ni cuentas de prueba. SHA-256: `31fd747dcd46d9789c2e526aca3f3877f619bbc94824249127c74c7d28b033d4`. Pasan sus 53 casos nativos, un reinicio real de 45,351 s y el apagado normal. Los fragmentos suman 620.662.463 bytes comprimidos. Ya están completadas las pruebas funcionales en navegador de sus 44 prácticas públicas sobre esta misma fábrica. Sigue fallando el objetivo de rendimiento de recuperación; no se trasladan éxitos de otra imagen.

Root usa el perfil administrativo autorizado `unconfined_u:unconfined_r:unconfined_t`. SELinux permanece Enforcing: Apache continúa en httpd_t y los contenedores en container_t. Root selecciona `/usr/sbin/podman`, una copia idéntica del binario real con modo 0700 y transición confinada a podman_t/system_r; los usuarios normales conservan `/usr/bin/podman` y podman_user_t. No se usan alias ni se conceden permisos del almacén de root al motor rootless. La base RPM real se copia a `/var/lib/rpm`, conserva registros y firma y usa las etiquetas de la política de esta distribución. No se amplían permisos RPM.

La anterior `v86-diagnostico-tf17tvw9`, SHA-256 `6662505f1809d530723283a3e19db81b902f9f5ae22a19fdbc0befcf67159a0c`, se conserva en `tools/v86-test/base-validada-20261008-06`: 20 artefactos movidos de forma recuperable, ninguno eliminado. Sus resultados siguientes son históricos. La configuración inicial de eth0 sin IPv4/IPv6 y el helper podman-restart deshabilitado se mantienen en la candidata actual; NetworkManager sigue habilitado.

La candidata anterior, procedente de `v86-diagnostico-pyqnwvt6`, tenía SHA-256 `f838c6a14f08ffe99a3b4e24eb4c163b30b030f18b12a27c487fbd8c8fbc45d9`. Su disco, fragmentos, estado preparado, construcción, base y medición de descarga se conservan en `tools/v86-test/base-validada-20261008-05`: 21 artefactos movidos de forma recuperable, ninguno eliminado.

## Base de la candidata actual 31fd

Pasan las siete comprobaciones de navegador sobre esta misma imagen, sin parches: servicios, manuales/init_t, tuned, administrador normal, entrada real de Podman, tmpfiles/etiquetas y configuración de red/metadatos. El arranque frío tarda 86,020 s. El estado rápido verificado ocupa 137.639.210 bytes y se empaqueta en 17 fragmentos, ligado al hash de esta fábrica. Informe: `Resultado_v86_base_final_consolidada.json`. Esto acredita la base, no todo el catálogo ni el rendimiento de recuperación.

La primera entrada rápida tarda **25,309 s** desde un navegador nuevo, con 50 Mbps compartidos y 40 ms de latencia, sin cabeceras de aislamiento especiales. Es una medición local controlada, no una garantía universal ni una prueba del despliegue en GitHub Pages. `Resultado_v86_descarga_50Mbps_final.json` identifica la misma fábrica 31fd.

El catálogo v8 pasa sin parches: 74 ejecuciones, 47 comprobaciones y cero discrepancias. Cubre los 23 objetivos seleccionados, cron con ejecución auténtica de hera y el negativo de ACL sin reparación automática. Informe: `Resultado_v86_catalogo_final_v8.json`. No incluye rescate, chrony entre máquinas, rootless/servicio de hermes ni Flatpak, que tienen ensayos separados. Los controles de identidad rechazan estado sin hash y de otra fábrica antes de crear la VM (`Resultado_v86_estado_identidad_final_v2.json`). Los diez tests del protocolo también pasan con /bin/sh de WSL; los 44 probes pasan además sintaxis en el invitado nuevo, como se registra abajo.

Aplicaciones v5 pasa sobre 31fd sin parches: Apache con negativo real de etiquetas, Podman rootless desde SSH/PAM, puerto/volumen/exec/stop/start, unidad de usuario, unidad de root y datos/HTTP después de reiniciar. SELinux conserva el confinamiento. Reinicio: 204,104 s; verificación posterior: 23,038 s. Sigue habiendo una espera de parada de user@1000.service: se registra, no se reduce el plazo para esconderla. Informe: `Resultado_v86_aplicaciones_final_v5.json`.

Reset/guardado v4 pasa sobre la nueva fábrica, incluidos ambos discos, recuperación de arranque roto, corrupción rechazada, fallo de cuota atómico y cancelación de un guardado tardío. Guardar tarda 6,972 s y recuperar 1,712 s (`Resultado_v86_sesiones_final_ensayo4.json`). Modos v3 pasa: examen con 21 ejercicios, sin ayudas durante el intento, comprobación manual al terminar y sin reparar ni resetear al cambiar de modo (`Resultado_v86_modos_final_v3.json`). Los 44 probes pasan `/bin/sh -n` en el Linux real del navegador (`Resultado_v86_sintaxis_final_v3.json`).

Flatpak de usuario v4 pasa sin cambios de política: sesión SSH/PAM, instalación de runtime y aplicación, sandbox auténtico y desinstalación. Su comprobador público rechaza antes de instalar, aprueba con la aplicación y vuelve a rechazar después de retirarla (`Resultado_v86_flatpak_usuario_final_v4.json`).

Almacenamiento ensayo5 pasa sin parches: GPT, PV/VG/LV, extents, XFS/ext4/VFAT, swap, ampliar/reducir ext4, añadir/retirar PV y persistencia de datos/montajes tras reiniciar. Reinicio 104,727 s; verificación posterior 3,785 s. Informe: `Resultado_v86_almacenamiento_final_ensayo5.json`, hash 31fd. Los AVC diagnósticos se conservan; no se añaden permisos para ocultarlos.

Red v5 pasa sobre 31fd: dos VM con MAC distintas, tráfico IPv4, servidor NFS/NTP, datos propagados, autofs y fuente chrony seleccionada. Los negativos comprueban por separado NTP permanente, NFS actual y cambios del dato remoto. Después de los reinicios reales (cliente 93,208 s; servidor 94,362 s), la IP del cliente aparece por activación automática, sin levantar/reparar el perfil. Los servicios y NTP persisten; el montaje manual NFS se vuelve a hacer de forma explícita, pues esa práctica no promete fstab. No se habilita SSH root remoto (`Resultado_v86_red_curso_final_v5.json`).

Complementarias v6 pasa sobre 31fd: procesos/nice y negativo después de kill, scripts con varias entradas, SSH/scp, reducción ext4, ampliación XFS y el ejercicio público de hermes con dos volúmenes y unidad de usuario. Tras el reinicio real de 206,002 s, su unidad arranca sola y el comprobador vuelve a aprobar; no se inicia el servicio manualmente. El LV sin fstab se monta explícitamente para verificar sus datos (`Resultado_v86_complementarias_final_v6.json`).

Las ocho prácticas iniciales pasan mediante clics reales en «Comprobar», con negativos antes de resolver, positivos después y permisos rotos rechazados sin reparación. «Ver solución» no ejecuta comandos, el botón no interrumpe vi y vi escribe/guarda un archivo auténtico. La vista de 390 px no presenta desbordamiento de página (`Resultado_v86_ejercicios_final.json`). El test vuelve a abrir las prácticas tras su propia recarga, sin cambiar la interfaz del alumno.

Recuperación v6 pasa funcionalmente en 31fd: GRUB, rd.break, passwd interactivo con titanio7, relabel completo, shadow_t, desaparición de /.autorelabel, PID 1 init_t, autenticación real, datos conservados y retorno a Enforcing. El comprobador público del simulacro 01 rechaza antes y aprueba después. La reanudación tarda **336,946 s (5 min 37 s)**: mejora respecto de las candidatas anteriores, pero **no cumple el objetivo de 180 s**. Informe: `Resultado_v86_rdbreak_final_v6.json`. No se omite el relabel ni se convierte ese fallo de rendimiento en aprobado.

Los 44 objetivos públicos tienen ensayos funcionales positivos en esta fábrica: ocho iniciales, 21 del simulacro y 15 complementarios. Eso no acredita todos los comandos posibles de Linux, equivalencia con RHEL ni despliegue en el dominio público. Puede considerarse candidata funcional de prueba; no versión final con todos los requisitos de rendimiento cumplidos. La investigación de la demora del relabel se realiza en otra copia, conservando 31fd.

`Comprobar_entrega_v86_final.mjs` cruza los identificadores de las 44 prácticas con sus ensayos positivos y exige la misma fábrica en los 13 informes, además de las condiciones de cada colección. Pasa (`Resultado_entrega_v86_final.json`). No transforma el fallo de rendimiento en un aprobado ni afirma equivalencia íntegra con RHEL.

La entrega independiente `publicacion/v86-rhcsa-beta-31fd747d-v2/` contiene 1.487 archivos, 717.567.758 bytes más su inventario y un máximo de 8 MiB por archivo. Todos sus hashes pasan la auditoría. La interfaz y las ocho prácticas iniciales se prueban otra vez sirviendo solo esa carpeta, sin cabeceras especiales: comprobación real, negativos sin reparación, vi y móvil pasan (`Resultado_v86_ejercicios_final_v2.json`, `Resultado_paquete_v86_final.json`). El intento anterior incompleto se conserva identificado; no se borra ni publica. El paquete cabe por sí solo bajo 1 GB, pero falta sumar el tamaño del sitio existente y revisar la redistribución de binarios/fuentes antes de publicarlo. La vista local en el puerto 4220 no constituye una publicación.

El diagnóstico `_l0xkfh2` es fallido por un pager de systemctl y una ruta de script incorrecta; no demuestra un fallo nuevo de la máquina. La repetición de solo lectura `mo1iyzpu` pasa todos los casos: identifica el procedimiento estándar de Debian con fixfiles, generación de contextos de home, relabel completo y reinicio. No modifica ni promueve esa copia y no acredita una nueva optimización. Se conserva el tiempo medido de 336,946 s.

## Pruebas de la candidata anterior 6662

Pasan las seis comprobaciones reales de base en navegador: servicios, manuales, tuned, políticas/etiquetas, limpieza y nueva configuración inicial de red/metadatos. Arranque en frío: 104,795 s. El estado de entrada rápida ocupa 103.747.462 bytes comprimidos. Informe conservado en `tools/v86-test/base-validada-20261008-06/Resultado_v86_base_final_consolidada.json`.

La primera entrada con navegador vacío, 50 Mbps compartidos y 40 ms de latencia tarda **28,417 s**. Es una medición local controlada, no una garantía para cualquier equipo ni una prueba de GitHub Pages. Informe conservado en `tools/v86-test/base-validada-20261008-06/Resultado_v86_descarga_50Mbps_final.json`.

Los metadatos del estado preparado ahora incluyen el hash de su fábrica. El empaquetador verifica el informe de origen y el navegador rechaza estados preparados de otro disco: pasan los dos controles negativos de identidad. Los 44 probes pasan sintaxis con el /bin/sh real del invitado (`Resultado_v86_sintaxis_final_v2.json`). Los predicados costosos de semanage/firewall tienen plazos explícitos, acotados a 60 s; un timeout sigue siendo un error, nunca un aprobado.

Pasan Reset/guardado (`Resultado_v86_sesiones_final_ensayo3.json`: guardar 8,49 s, recuperar 3,093 s) y la separación práctica libre/examen (`Resultado_v86_modos_final_v2.json`), sin soluciones durante el intento ni reparaciones al comprobar.

Las complementarias v5 pasan procesos, scripting, SSH/scp, ampliación/reducción y el contenedor de hermes con unidad de usuario y datos después de un reinicio real. El reinicio tarda 286,232 s y la unidad requiere otros 94,42 s: funcionalidad comprobada, rendimiento todavía lento. Informe: `Resultado_v86_complementarias_final_v5.json`.

Flatpak funciona desde una sesión normal SSH/PAM: instala el runtime y la aplicación locales, ejecuta un sandbox real y desinstala. El check público rechaza antes de instalar, aprueba después de ejecutar y vuelve a rechazar después de desinstalar. No se añaden permisos SELinux (`Resultado_v86_flatpak_usuario_final_v3.json`).

El catálogo seleccionado todavía no pasa completo: v6/v7 comprueban caducidad real correctamente, pero cron rechaza la tarea de hera con ENTRYPOINT FAILED y no ejecuta el mensaje. No se simula el logger para aprobar. El usuario autoriza cambiar exclusivamente el mapeo de root a unconfined_u/unconfined_t, como administrador habitual de RHEL, manteniendo servicios y contenedores confinados y Enforcing. Se prueba primero en una copia privada de tf17, no se aplica aún a esta candidata. Referencia: [usuarios confinados y no confinados en RHEL 9](https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/using_selinux/managing-confined-and-unconfined-users_using-selinux).

La copia privada `ttp28npx` confirma el mapeo de root en una sesión nueva tras un reinicio nativo de 51,835 s. Cron ejecuta realmente el mensaje de hera; Flatpak instala/ejecuta/desinstala con sandbox, ext4 se amplía y reduce conservando datos, Apache sigue en httpd_t y tuned aplica/verifica el perfil. SELinux permanece Enforcing. No pasa toda la colección: Podman devuelve 125 al abrir su almacén, y no se promueve esta copia con ejercicios.

`qdmnnez7` identifica el motivo, sin nuevos permisos: la transición previa de unconfined_t entra en podman_user_t también con UID 0; el almacén root tiene su etiqueta correcta container_var_lib_t y es denegado por el motor rootless. Se prueba una entrada administrativa separada: copia binaria idéntica de Podman en /usr/sbin/podman, root:root 0700, que transiciona al podman_t existente. /usr/bin/podman y el motor de usuarios no se cambian. No se concede acceso del motor rootless al almacén root ni derechos a container_t. Es una adaptación explícita de esta distribución, no una afirmación de que Debian sea RHEL.

Los diez tests del protocolo pasan después de los ajustes de plazos/caducidad (8 de octubre); no sustituyen las pruebas de la VM.

La entrada administrativa está aún en diagnóstico. `13i7a5a4` falla al ejecutar el nuevo entrypoint. `ax650zdq` añade las interfaces estándar de aplicación/servicio; la importación funciona, pero los auxiliares de red heredan un rol de usuario no válido. `iy0m7urx` limita la transición de rol a la entrada root exclusiva y conserva el rol de la shell: pasa rootless y su rechazo del binario root; falla el montaje por falta de etiquetado del volumen, que ese fixture omitía respecto a la práctica existente. En `fu3ifmda` se aplica el mismo etiquetado persistente de la práctica: pasan contenedor root, volumen, HTTP, unidad generada y funcionamiento real tras reiniciar (59,806 s más 9,784 s de espera de unidad), además de rootless y separación DAC. **podman info sigue superando el límite**, por tanto no pasa toda la colección ni se integra aún una fábrica nueva.

El constructor queda preparado para el mapeo normal y su entrada administrativa; elimina la ampliación innecesaria de roles de sysadm_u. El promotor exige ahora también la salida auténtica FABRICA_ROOT_NORMAL_PODMAN_OK, incluido podman info: ningún diagnóstico ejercitado ni una construcción con ese bloqueo puede convertirse en la imagen final. La candidata 6662 y sus snapshots siguen intactos.

`bwgbdt_h` registra la causa de podman info mediante strace: rpm -q -f solicita repetidamente un bloqueo SQLite denegado sobre /root/.rpmdb, de tipo user_home_t. No es lentitud genérica ni un bloqueo sin identificar. Se configura la base de prácticas en /var/lib/rpm con las etiquetas reales de esta política Debian, preservando la base original y comparando todos los registros/claves.

`uf7c1p5a` conserva los registros y prueba DNF/PODMAN después de migrar; queda globalmente fallido porque se esperaba por error rpm_var_lib_t y se intentó una interfaz del módulo RPM que esta política Debian no tiene cargado. La transacción de política falla: no se concede ningún permiso nuevo. Se elimina esa interfaz; los motores ya leen los metadatos generales de sistema. `pg9vcgc0` queda incompleto por un error de comillas en el plan JSON; el helper ahora valida todo el plan antes de copiar/arrancar para evitar esa clase de ejecución parcial.

**`c8991q0v` pasa la repetición completa sin nuevos permisos de RPM:** comparación de registros y clave, integridad de SQLite, etiquetas correspondientes a la política real, instalación/actualización DNF, podman info de root y usuario, rootless, prohibición de la entrada administrativa al usuario y datos/servicio después de reiniciar. Reinicio nativo 56,713 s; comprobación posterior 11,017 s. Los cambios se incorporan a la fábrica limpia 9kbuuzfj; ninguna copia ejercitada se promueve. Estos ensayos nativos no sustituyen las pruebas de la fábrica nueva en navegador.

La red pública v4 pasa antes del reinicio: tráfico auténtico entre dos VM, NFS con cambios propagados desde el servidor, autofs, fuente NTP seleccionada y negativos de firewall. El servidor pasa después de reiniciar (119,994 s más 12,072 s para sus servicios). El cliente muestra el perfil guardado y la MAC correcta, pero no la IP al primer prompt; el ensayo queda fallido, no acredita toda la persistencia (`Resultado_v86_red_curso_final_v4.json`). Se añade espera de observación, sin levantar ni modificar el perfil, para distinguir activación tardía de un fallo real.

## Pruebas de la candidata anterior f838

La base pasa sus cinco casos en navegador, incluido tuned, DNF con RPM firmados locales, SELinux Enforcing y las etiquetas de auxiliares. El estado preparado ocupa 115.713.072 bytes comprimidos. Informe: `Resultado_v86_base_final_consolidada.json`.

La primera entrada desde un navegador vacío tarda **41,392 segundos**, con 50 Mbps compartidos y 40 ms de latencia. Es una medición local controlada, no una garantía universal ni una prueba de GitHub Pages. Informe: `Resultado_v86_descarga_50Mbps_final.json`.

Apache y Podman pasan sin parches durante el ensayo: denegación/reparación de SELinux, cuenta nueva, importación, ejecución, volumen, HTTP, exec, parada/arranque, servicios de root y usuario y datos después de reiniciar. Reinicio: 298,949 s. Informe: `Resultado_v86_aplicaciones_final_v4.json`.

Almacenamiento pasa sin parches: GPT, PV/VG/LV, extents, XFS/ext4/VFAT, swap, ampliar y reducir, añadir/retirar PV y persistencia tras reiniciar. Reinicio: 211,642 s. `findmnt --verify` conserva avisos reales porque root confinado no lee dispositivos directamente; no se ocultan ni se conceden permisos generales sobre discos. Informe: `Resultado_v86_almacenamiento_final_ensayo4.json`.

Guardado y Reset pasan: ambos discos recuperados, fallo atómico conserva el guardado anterior, corrupción rechazada, máquina rota restablecida y Reset cancela un guardado tardío. Guardar: 9,922 s; recuperar: 7,212 s. Informe: `Resultado_v86_sesiones_final_ensayo2.json`.

Práctica libre y modo examen pasan, sin enviar soluciones, reparar ejercicios al comprobar ni resetear al cambiar de modo. Informe: `Resultado_v86_modos_final.json`. Los ocho tests de protocolo pasan con Bash local POSIX; WSL no estaba disponible. Además se validó la sintaxis de los 44 probes con el `/bin/sh` auténtico del navegador: `Resultado_v86_sintaxis_final.json`.

El simulacro 21 se comprueba desde la sesión real de hermes, no con runuser heredando el dominio SELinux de root. El botón reconoce únicamente el prompt vacío adicional `V86USER$ ` y sigue rechazando editores/líneas escritas. No se añaden permisos, claves ni cambios PAM para comprobar al alumno. Su ensayo complementario v4 pasa los checks antes de reiniciar, pero termina por timeout durante el reinicio: no acredita la colección completa. El ensayo de interfaz inicial detecta que consultar Podman vacío puede inicializar su almacén y tardar demasiado; el probe ahora comprueba primero que existen la unidad y el almacén. **`Resultado_v86_podman_panel_final_v2.json` pasa el clic real: rechaza root y el ejercicio incompleto, aprueba la unidad/contenedor/volúmenes desde la sesión interactiva de hermes y conserva Enforcing.**

El catálogo v1 pasa los objetivos iniciales y falla en find al consultar metadatos del contador interno de at. Se añade al constructor solo `sysadm_t → lab_at_sequence_t:file getattr`, sin leer/escribir el contador. El ensayo privado v2 supera el plazo al instalar ese ajuste. La nueva construcción tf17 lo integra y pasa stat/find nativos; queda repetir el catálogo en navegador sin parches. No se cambia la búsqueda para ocultar errores.

La recuperación v3 con orden temprano falla por dependencias cíclicas; esa variante no está en la fábrica. La v4 con orden normal supera 480 s durante el relabel y queda fallida. Se admite un plazo diagnóstico mayor para observar la finalización, **sin rebajar el objetivo de recuperación de 180 s**. La caché de ensayo (192/384/512 MiB) no altera la imagen, no precarga el disco y conserva la validación de hashes; el valor por defecto sigue siendo 192 MiB. **El ensayo v5 con 512 MiB completa el procedimiento auténtico, el relabel, la autenticación con la contraseña nueva y Enforcing, pero tarda 685,502 s en reanudar. La funcionalidad pasa; el rendimiento no.** Informe: `Resultado_v86_rdbreak_final_v5.json`. No se aumenta la caché por defecto.

`Resultado_v86_inicio_diagnostico.json` identifica esperas de red y del helper podman-restart en la fábrica vacía. La revisión de seguridad bloqueó inicialmente los dos ajustes. Tras la autorización específica del usuario se incorporan a tf17, no a f838. La configuración manual y la persistencia de contenedores deben probarse en navegador antes de declararlos cualificados.

## Pruebas de la ronda anterior

Estos resultados pertenecen a `7tdt0l9_`, hash `255d0bfd703887a627c235fc15d4de49c041c67b462862c4565bf5f3bc694b81`. Su fábrica, fragmentos, estado preparado, informe de construcción, informe de base y medición de descarga están guardados en `tools/v86-test/base-validada-20261008-04` (22 artefactos, ninguno eliminado).

La base anterior pasa sus cinco pruebas en navegador: systemd, SELinux Enforcing, Apache, DNF con repositorio RPM local real, Flatpak, manuales, disco de prácticas y tuned. Su informe de base se conserva dentro de `tools/v86-test/base-validada-20261008-04`.

La primera entrada anterior medida en un navegador nuevo, con 50 Mbps compartidos y 40 ms de latencia, es de 22,453 segundos. Es una medición local controlada de la fábrica anterior. El informe está dentro de `tools/v86-test/base-validada-20261008-04`; no sustituye la medición actual de 41,392 s.

Podman pasa importación desde una cuenta vacía, ejecución real, volumen, puerto HTTP, exec, parada/arranque, unidades de root y usuario y persistencia tras un reinicio auténtico. Apache conserva su prueba negativa de SELinux y recuperación de acceso. Informe: `Resultado_v86_aplicaciones_final_v3.json`.

Almacenamiento pasa GPT, PV/VG/LV, ampliación XFS, ext4, VFAT, swap, reducción y ampliación de ext4, extents, etiquetas, incorporación y retirada de un PV y lectura de los datos después de reiniciar. Informe: `Resultado_v86_almacenamiento_final_ensayo3.json`.

**Los dos últimos ensayos aplican etiquetas concretas en sus copias privadas.** No dan nuevos permisos: auxiliares de Podman como ejecutables, metadatos propios de libpod y xfs_growfs como herramienta confinada de sistemas de archivos. Los cambios están incorporados al constructor, pero todavía hay que reconstruir y repetir las pruebas sin parches sobre esa nueva fábrica. Para escribir en un XFS/ext4 nuevo con root confinado se usa restorecon tras montarlo; ese paso figura en los comandos, las soluciones afectadas y la chuleta.

## Todavía no terminado

Se investigan los avisos de udevadm y sincronización de LVM. El kernel sí tiene SYSVIPC y una creación real de semáforo desde root pasa; por tanto, no se atribuye el aviso de LVM a la falta de esa opción del kernel. Las consultas seinfo/sesearch del diagnóstico v5 no están instaladas y no acreditan ninguna regla.

El diagnóstico v7 identifica los bloqueos en fsadm_t al ejecutar parted/partprobe: consulta IPC y ejecución de udevadm. `lab-fsadm-helpers.te` usa la transición oficial a udevadm_t y permite solo ipc_info, no gestión IPC ni acceso general a discos para root. `v86-diagnostico-bn7xbxcr` pasa particionado y PV/VG/LV sobre su disco virtual privado sin los avisos anteriores, con Enforcing. Quedan AVC no fatales sobre un descriptor de disco heredado y consulta de dmidecode; no se añaden permisos para ocultarlos. El primer ensayo de este módulo, `3c0mx9om`, falla en losetup sobre una imagen dentro de /root y se conserva; no se concede acceso a archivos personales para arreglar un fixture.

`Resultado_v86_rdbreak_final.json` registra un fallo auténtico: passwd cambia la contraseña, pero el generador no puede consultar /.autorelabel y no hace el relabel. Se integra el ajuste de metadatos ya probado en otra candidata y se repite el procedimiento completo por GRUB en un ensayo separado. No se da por aprobado hasta comprobar shadow_t, eliminación de la marca, contraseña y Enforcing.

La copia limpia `jjmczqkv` pasa construcción, etiquetas, reinicio y apagado normal, pero no se promueve porque falta el ajuste de recuperación y particionado. La siguiente construcción parte otra vez de la fábrica original e incorpora ambos ajustes; ninguna copia de ejercicios se convierte en fábrica.

El ensayo de recuperación v2 sí termina el relabel completo, elimina /.autorelabel y restaura shadow_t. Falla después porque el comprobador Python intenta leer ese archivo protegido desde sysadm_t; se conserva como fallido, no se cambia su informe. `Resultado_v86_autenticacion_final.json` prueba el auxiliar PAM real: contraseña correcta → 0, incorrecta → 7, con shadow_t y Enforcing. Se corrigen el comprobador de recuperación y las verificaciones de contraseñas del curso para usar ese auxiliar, sin conceder lectura general de shadow. Hace falta repetir la recuperación completa con este comprobador.

La reanudación de ese ensayo fue 397,531 s: supera el objetivo y no se declara rendimiento aceptable de recuperación. Se prepara un ensayo de orden de arranque para ejecutar el relabel completo antes de los servicios; no se aplica a la fábrica sin verificarlo primero.

Las pruebas funcionales de los 44 ejercicios, catálogo, aplicaciones, almacenamiento, red, persistencia, guardado y Reset ya se han repetido y pasan en 9kbuuzfj. Falta cumplir o aceptar expresamente la recuperación de contraseña de 336,946 s y verificar una publicación de prueba. `functionalBrowserValidationPassed` es `true`; `fullRhcsaValidated`, `readyForStudents` y `websiteModified` continúan en `false`. No se acredita equivalencia completa con RHEL ni todos los comandos posibles de Linux.

Las candidatas anteriores están guardadas de forma recuperable en `tools/v86-test/base-validada-20261008-03` y en los archivos anteriores de esa carpeta. No se ha eliminado la fábrica original ni contenido del usuario.
