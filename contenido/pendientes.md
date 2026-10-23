# Mejoras pendientes de S2KTUX

Esta lista cambia con el proyecto. Las mejoras comprobadas salen de aquí y pasan al historial de Sobre.

- **LPIC-1:** Ampliar el banco, sin sustituir las preguntas autorizadas, para practicar los contenidos poco representados: GPG, scripts, filtros, paquetes, NTP, impresión y túneles SSH. No presentar las 240 preguntas como cobertura exhaustiva del examen.
- **Kubernetes:** Cerrar las clases 24–34 como un bloque conjunto: integrar init/join manuales, HA y actualización, y estabilizar la recuperación tras restaurar etcd. Ya hay pruebas privadas aprobadas de HA, workers y guardado, pero falta ofrecerlas y comprobarlas en la versión del alumno. El avanzado sigue cerrado. Las clases 01–23 tienen prácticas verificadas; Local Path no acredita un driver CSI.
- **Kubernetes:** Terminar el simulacro CKA real: dos horas, corrección por resultados y nota por dominio. Incluir el alias k, la variable $do y tareas de Helm y Gateway API; esas tareas todavía no están disponibles en el simulacro.
- **Kubernetes:** Revisar hasta tres ejercicios por clase: uno para empezar, otro para aplicar lo aprendido y otro orientado al examen. Ampliar las variantes de afinidad y reparto, y practicar NoExecute en un worker aislado sin afectar al resto del laboratorio. Sin ejercicios para la clase 00.
- **Laboratorios:** Comprobar la persistencia tras reiniciar antes de puntuar el simulacro, con respaldo y tratamiento de máquinas que no consiguen arrancar.
- **Laboratorios:** Guardar de forma conjunta las máquinas, el intento y el cronómetro para poder continuar un examen tras recargar.
- **Laboratorios:** Ampliar los ejercicios de diagnóstico con fallos controlados de fstab, SELinux, servicios y red; en Kubernetes, Pods, nodos, selectores y PVC.
- **Más adelante:** Variar nombres, usuarios y tamaños entre intentos, adaptando también la preparación, las soluciones y los correctores.
- **Rendimiento:** Seguir reduciendo los tiempos de arranque y preparación de complementos, y el pico de memoria al guardar varios nodos. Comprobar también las sesiones tras largos periodos en segundo plano. Integrar y comprobar la entrega local de materiales descargados y verificados por el navegador, para evitar transferencias lentas dentro de las máquinas. El intermedio puede descargar una base de dos nodos ya preparada (549 MiB), separada de los guardados del alumno. No se descargan máquinas desde otras páginas.
- **Rendimiento:** Estudiar qué se puede quitar de las imágenes sin perder herramientas, páginas de man, licencias ni ejercicios del curso. Importar solo las imágenes necesarias al preparar un complemento, sin cargar el paquete completo si se puede evitar.
- **Más adelante:** Revisar si la validación con OpenAPI mejora el simulador de Kubernetes, aprovechando sus objetos y controladores actuales sin reconstruirlo innecesariamente.
- **Más adelante:** Cuando exista un curso de AWS, plantear un banco de preguntas con explicaciones como el de LPIC-1.
- **Laboratorios:** Ampliar las pistas de Comprobar a los requisitos que todavía dan un resultado genérico. Ya se indican recursos o archivos que faltan en varias prácticas; falta desglosar más condiciones sin revelar soluciones.
