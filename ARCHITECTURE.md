# Arquitectura de S2KTUX

## Terminal simulada

La terminal se divide en dos límites de ejecución:

1. El hilo principal conserva únicamente el DOM, el foco, el TTY, los editores y el renderizado.
2. `terminal-simulation-worker.js` ejecuta lógica pura mediante el protocolo versionado de `terminal-worker-protocol.js`. Si el navegador no admite Worker, `terminal-worker-client.js` aplica el mismo contrato localmente.

`terminal-bootstrap.js` carga en paralelo el motor, su runtime y el Worker. Ningún modo descarga los otros dos motores.

### Responsabilidad de cada módulo

- `terminal-core.js`: coordinación causal de la máquina y compatibilidad entre los subsistemas.
- `terminal-shell-parser.js`: continuación PS2, comillas, tuberías y redirecciones.
- `terminal-command-schema.js`: validación declarativa de opciones y argumentos.
- `terminal-virtual-fs.js`: rutas, nodos, enlaces y permisos del sistema de archivos virtual.
- `terminal-process-state.js`: tabla inicial de procesos.
- `terminal-network-state.js`: IPv4, subredes y puertos publicados.
- `terminal-docker-state.js`: catálogo y referencias de imágenes Docker.
- `terminal-kubernetes-state.js`: estado inicial del clúster Kubernetes.
- `terminal-engine-*.js`: identidad y perfil de cada máquina.
- `terminal-runtime-*.js`: comandos, manuales, autocompletado y prácticas propios de cada entorno.
- `terminal-xterm-renderer.js`: adaptación visual de la terminal; no contiene estado del laboratorio.

### Contrato del Worker

Cada mensaje contiene `protocol`, `id`, `operation` y `payload`. Las operaciones válidas están centralizadas y la respuesta conserva el mismo identificador. El Worker no accede a `document`, `window`, `localStorage` ni `sessionStorage`.

### Invariantes protegidas

- F5 destruye el laboratorio y vuelve al selector.
- Linux, Docker y Kubernetes tienen estados y recursos independientes.
- La interfaz sigue respondiendo mientras se analiza la entrada del shell.
- Las opciones inválidas y los argumentos ausentes se rechazan antes de mutar estado.
- Los módulos que llegan hasta la terminal interactiva tienen presupuestos de peso comprobados en CI.

## Páginas educativas

Las páginas públicas se entregan como HTML estático. `support.js` y el runtime reactivo casero se han retirado. `curso.html` y `leccion.html` solo conservan puentes `noindex` para enviar rutas históricas a sus páginas estáticas canónicas.

## Validación

`npm test` ejecuta contratos, fuzzing, presupuestos, grafo de carga y recorridos reales con navegador. El workflow obligatorio de GitHub impide integrar una propuesta si esta batería falla.
