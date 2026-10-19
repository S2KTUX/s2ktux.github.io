# S2KTUX

Apuntes, vídeos y laboratorios para aprender Linux, RHCSA, LPIC-1, Docker y Kubernetes. Web estática, gratuita y sin registro: https://s2ktux.github.io/.

## Dónde está cada cosa

- `index.html`, `cursos.html`, `terminal.html` y `sobre.html`: páginas principales.
- `_rhcsa/`, `_lpic/`, `_docker/`, `_kubernetes/`: fuentes editables de las clases. `cursos/` contiene sus páginas generadas; no son copias sobrantes.
- `laboratorios/`: interfaz, máquinas y discos fragmentados de Linux, Docker y Kubernetes. Sus recursos y licencias son necesarios aunque muchos se carguen mediante rutas dinámicas.
- `contenido/proyecto.json`: única lista de mejoras pendientes e historial de versiones. `npm run sync:project` actualiza Sobre y la descarga Markdown. Quitar una mejora de pendientes solo cuando esté implementada y comprobada.
- `images/`, `assets/`, `vendor/`: imágenes, fuentes y dependencias distribuidas, con sus licencias.
- `scripts/`, `tests/`, `docs/`: construcción, pruebas y mantenimiento. No se publican como páginas del sitio.
- Las carpetas `rhcsa/`, `lpic/`, `docker/` y `kubernetes/` conservan enlaces antiguos hacia las rutas actuales. No borrarlas sin mantener esas redirecciones.

Las licencias y fuentes de terceros están enlazadas en [Sobre](https://s2ktux.github.io/sobre.html#licencias). El [mapa técnico](docs/arquitectura.md) explica los motores. `node scripts/audit-repository.mjs` permite buscar imágenes sin referencias literales, sin borrarlas automáticamente.

## Build y publicación

Los archivos editables siguen siendo los módulos fuente: terminal-core.js, terminal-runtime-*.js y terminal-*-command.js. El comando npm run build usa esbuild, sin plugins, para generar en _site/ paquetes ESM minificados y compartidos por Linux, Docker y Kubernetes. _site/ es temporal, está ignorado por Git y no se revisa ni se commitea.

El comando npm test construye primero _site/, ejecuta las pruebas internas y después prueba en navegador ese mismo artefacto. El workflow de GitHub Actions solo entrega _site/ a GitHub Pages si toda la validación termina correctamente; si falla el build o cualquier prueba, el despliegue no se ejecuta y la versión pública anterior permanece activa.

Al activar este pipeline por primera vez hay que cambiar una sola vez la fuente de GitHub Pages de **Deploy from a branch** a **GitHub Actions**. Mientras Pages siga en modo legacy, GitHub puede publicar main directamente al margen del trabajo de despliegue.
