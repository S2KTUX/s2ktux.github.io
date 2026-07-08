# S2KTUX

Sitio web de S2KTUX — apuntes y laboratorios para aprender administración de sistemas Linux: **RHCSA (EX200)**, **LPIC-1** y Docker, con una terminal Linux simulada en el navegador.

🌐 En vivo: https://s2ktux.github.io/

## Estructura

| Ruta | Descripción |
|------|-------------|
| `index.html` | Página de inicio |
| `cursos.html` | Listado de cursos |
| `curso.html?c=rhcsa\|lpic1` | Índice de módulos de un curso |
| `leccion.html?c=…&m=N` | Visor de lección (carga el tema desde `rhcsa/` o `lpic/`) |
| `terminal.html` | Terminal Linux simulada |
| `proyectos.html` | Proyectos de homelab |
| `rhcsa/`, `lpic/` | Contenido HTML de cada tema |
| `courses-data.js` | Estructura de módulos y temas |
| `support.js` | Runtime de render (Claude Design) |
| `*.png` | Imágenes de las lecciones |

## Notas

Las páginas se renderizan en cliente (React/Babel se cargan desde CDN mediante `support.js`), por lo que requieren conexión a internet. `.nojekyll` desactiva el procesado de Jekyll en GitHub Pages para servir los archivos tal cual.
