# Hoja de ruta técnica de S2KTUX

Este documento fija las cinco fases acordadas. No se inicia una fase hasta que los criterios de salida de la anterior estén comprobados.

## Fase 1 · Veracidad e integración continua

**Estado: completada y validada.** La batería local y el flujo principal de CI ejecutan los contratos, escenarios negativos y regresiones acordados.

- Ejecutar todas las pruebas desde un único comando y en cada propuesta de cambio.
- Exigir el control de CI antes de integrar en `main`.
- Validar opciones desconocidas, argumentos ausentes y estados causales.
- Proteger el parser con casos negativos, entradas hostiles y límites de tiempo.
- Corregir y cubrir con regresiones `firewalld`, `find`, enlaces, Docker y evaluación CKA.
- Restaurar el scrollback únicamente como texto, nunca mediante HTML guardado.
- Aplicar en paralelo las mejoras SEO de bajo riesgo: canonical, sitemap, JSON-LD y noindex.

**Salida:** batería local completa en verde, workflow publicado y control obligatorio activo en GitHub.

## Fase 2 · Arquitectura y aislamiento del motor

**Estado: completada y validada.** El mapa de módulos y sus límites se documenta en [ARCHITECTURE.md](ARCHITECTURE.md).

- Extraer sistema de archivos, procesos, shell, red y motores Linux/Docker/Kubernetes de `terminal-core.js`.
- Definir un protocolo de mensajes estable entre la interfaz y la simulación.
- Trasladar al Web Worker la lógica pura y costosa; mantener DOM, xterm, foco y renderizado en el hilo principal.
- Evitar cascadas secuenciales de imports y medir el tiempo hasta terminal interactiva antes y después.
- Mantener límites de tamaño y rendimiento en CI.
- Migrar las páginas restantes que dependen de `support.js` a HTML estático y retirar el runtime cuando ya no tenga consumidores.

**Salida:** módulos aislados, Worker sin acceso al DOM, equivalencia funcional y rendimiento no peor que la línea base.

## Fase 3 · Sistema visual y mantenibilidad

**Estado: completada y validada.** Componentes comunes, tipografía de lectura, cursos estáticos y terminal verificados en escritorio y móvil.

- Reducir estilos en línea y centralizar componentes visuales reutilizables.
- Usar Space Mono para cuerpo, código y textos largos.
- Reservar Press Start 2P para títulos y controles breves; evitar VT323 en párrafos largos.
- Verificar escritorio y móvil sin perder el estilo pixel art de S2KTUX.

**Salida:** páginas visualmente equivalentes o mejores, legibles y sin duplicación estructural relevante.

## Fase 4 · SEO, rutas y entrega

**Estado: completada y validada.** Canonicals, sitemap, datos estructurados, rutas históricas y páginas noindex quedan cubiertos por CI.

- Completar metadatos y datos estructurados que no se hayan adelantado en la fase 1.
- Mantener las 25 rutas históricas como páginas puente estáticas con `noindex,follow,noarchive`, canonical hacia la URL nueva y `meta refresh` con retraso cero.
- Esta es la solución definitiva mientras S2KTUX viva exclusivamente en `s2ktux.github.io`: GitHub Pages no permite configurar respuestas HTTP 301 por ruta y `_redirects` no se aplica en este hosting. No se considera trabajo pendiente; solo se reconsiderará si una decisión futura cambia el dominio o la capa de entrega.
- Auditar indexación, enlaces internos, sitemap y páginas noindex.

**Salida:** una URL canónica por contenido, rutas antiguas verificadas y cero páginas duplicadas indexables.

## Fase 5 · Robustez y accesibilidad

**Estado: completada y validada.** Cuotas, límites de recursos y recorrido accesible automatizado quedan cubiertos por la batería del proyecto; las comprobaciones manuales que requieran tecnología asistiva se documentan por separado.

- Añadir cuotas de disco virtual, límites de archivos, imágenes y scrollback.
- Evitar crecimiento ilimitado, recursiones abusivas y bloqueos de pestaña.
- Auditar xterm con lector de pantalla, foco, teclado físico y teclado móvil.
- Mantener un único árbol accesible y evitar apertura agresiva del teclado virtual.

**Salida:** límites verificables, degradación segura y recorrido accesible probado en escritorio y móvil.
