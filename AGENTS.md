# Cómo mantener S2KTUX

- Mantener una web estática para GitHub Pages, sin backend obligatorio.
- Respetar el lenguaje sencillo del autor y el orden de las clases. Corregir solo lo necesario; no rehacerlas ni publicar clases nuevas sin aprobación. No modificar la clase 35 de Kubernetes.
- Registrar toda mejora nueva acordada en `contenido/proyecto.json`. Lo que requiera más trabajo o terminar Kubernetes queda pendiente, sin presentarlo como disponible.
- Al implementar y comprobar una mejora, quitarla de pendientes y describir el resultado brevemente en el historial del mismo archivo. Nunca borrar una tarea simplemente porque se haya empezado.
- Las versiones usan `mayor.menor`: aumentar la menor para cambios pequeños y la mayor para cambios grandes. Agrupar los cambios de una misma entrega; no inventar versiones históricas.
- En Sobre, cada versión se resume en una frase natural y breve, con un enlace debajo a sus notas completas. Mantener `resumen` y `cambios` en el mismo registro; las páginas de notas se generan con los estilos y la navegación del sitio.
- Ejecutar `npm run sync:project` para actualizar Sobre y la lista descargable desde ese único registro.
- Conservar licencias, avisos y fuentes exigidas de los componentes distribuidos. No borrar recursos por no encontrar una referencia literal: los discos y módulos usan rutas dinámicas.
- Las soluciones de prácticas usan comandos enseñados en el curso. Mostrar archivos largos con su contenido legible y no añadir alternativas rebuscadas.
- Probar los resultados de los correctores: casos correctos, incompletos y soluciones equivalentes. No afirmar equivalencia perfecta con Linux o cobertura total de CKA.
- Antes de publicar: construir, ejecutar pruebas, comprobar móvil y enlaces, y revisar los cambios. Conservar los datos guardados de las máquinas.
- LPIC-1 usa los bancos de Deza92 en Daypo con permiso de reutilización confirmado por el responsable del sitio. Conservar la atribución, los identificadores de origen y el registro de correcciones; no volver a presentarlos como preguntas originales de S2KTUX ni como preguntas oficiales de LPI. Los simulacros de 60 preguntas y 90 minutos mantienen el aprobado propio del 70 %, no una conversión de la nota oficial.
- Las marcas de prácticas son un historial de comprobaciones, no una comprobación automática del estado actual de la máquina. Borrar progreso no debe borrar las máquinas ni sus guardados.
- En modo práctica, «Resuelta» es una marca de actividad, no un aprobado: se muestra en verde al realizarla o marcarla manualmente, sin marcas de error en la lista. Conservar internamente el origen y el resultado real del corrector; no usar estas marcas para puntuar exámenes.
- El progreso de arranque debe reflejar descargas y operaciones reales. No inventar líneas del kernel, porcentajes de CPU o tiempos garantizados. La caché solo puede reutilizar recursos después de verificar sus sumas.
- La base de entrada rápida de Kubernetes se captura solo al terminar una preparación nueva y antes de abrir la consola. Usar una base de datos distinta de las sesiones del alumno; no capturar ejercicios ni sustituir sus guardados. Cambiar su revisión al cambiar la preparación.
