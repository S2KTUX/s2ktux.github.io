# Revisión de Linux en la máquina del navegador

Estos recorridos abren una copia privada de la web. Resuelven los ejercicios con el teclado, el portapapeles y los botones visibles; no ejecutan soluciones por una API del emulador. Nunca deben apuntar a un perfil personal con sesiones de alumnos.

Construir con `npm run build` y servir `_site` en el puerto 4185 con `node tests/e2e/server.mjs _site`. Los guiones crean sus propios navegadores y aceptan `S2KTUX_QA_OUT` para separar informes, capturas y perfiles. Las pruebas nativas son manuales: no forman parte de la batería rápida de CI.

- `linux-long-input.mjs`: escritura larga, pegado, edición, historial, vi, interrupciones y guardado. `S2KTUX_BROWSER_PATH` permite repetirlo con un navegador instalado.
- `linux-course-journey.mjs`: soluciones y comprobadores del banco de aprendizaje. `S2KTUX_LINUX_CASES` selecciona identificadores separados por comas; las recuperaciones de root se comprueban aparte. `S2KTUX_LINUX_RECOVER=1` y `S2KTUX_LINUX_REBOOT=1` añaden recuperación y reinicio cuando corresponda; consultar los nombres de las opciones en el guion antes de ejecutarlo.
- `linux-exam-journey.mjs`: por defecto finaliza un intento vacío y otro parcial, con un editor abierto. Con `S2KTUX_EXAM_MODE=full`, prepara las dos máquinas, recupera root en la segunda, resuelve las tareas y evalúa el resultado real. No modifica la puntuación.
- `linux-ui-session.mjs`: consola de revisión por acciones de teclado y botones, útil para observar GRUB, los editores, la red y Reset. Recibe una acción JSON por línea en la entrada estándar; consultar el guion para sus opciones.

No ejecutar una batería paralela de navegadores mientras se mide el arranque de las VMs. Un error del controlador de pruebas (por ejemplo, pegar sin foco o no salir de un editor) invalida ese recorrido: hay que corregirlo y repetirlo, sin atribuir el fallo a Linux ni contarlo como aprobado. Conservar por separado los informes fallidos y las repeticiones.

Las pruebas cubren operaciones concretas en el equipo utilizado, no la ausencia de cualquier fallo ni una equivalencia de esta imagen Debian con RHEL.
