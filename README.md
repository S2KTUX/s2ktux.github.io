# S2KTUX

Sitio web de S2KTUX — apuntes y laboratorios para aprender administración de sistemas Linux: **RHCSA (EX200)**, **LPIC-1** y Docker, con una terminal Linux simulada en el navegador.

🌐 En vivo: https://s2ktux.github.io/

## Build y publicación

Los archivos editables siguen siendo los módulos fuente: terminal-core.js, terminal-runtime-*.js y terminal-*-command.js. El comando npm run build usa esbuild, sin plugins, para generar en _site/ paquetes ESM minificados y compartidos por Linux, Docker y Kubernetes. _site/ es temporal, está ignorado por Git y no se revisa ni se commitea.

El comando npm test construye primero _site/, ejecuta las pruebas internas y después prueba en navegador ese mismo artefacto. El workflow de GitHub Actions solo entrega _site/ a GitHub Pages si toda la validación termina correctamente; si falla el build o cualquier prueba, el despliegue no se ejecuta y la versión pública anterior permanece activa.

Al activar este pipeline por primera vez hay que cambiar una sola vez la fuente de GitHub Pages de **Deploy from a branch** a **GitHub Actions**. Mientras Pages siga en modo legacy, GitHub puede publicar main directamente al margen del trabajo de despliegue.
