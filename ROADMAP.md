# Hoja de ruta técnica de S2KTUX

Este documento fija las cinco fases acordadas. No se inicia una fase hasta que los criterios de salida de la anterior estén comprobados.

## Fase 1 · Veracidad e integración continua

- Ejecutar todas las pruebas desde un único comando y en cada propuesta de cambio.
- Exigir el control de CI antes de integrar en `main`.
- Validar opciones desconocidas, argumentos ausentes y estados causales.
- Proteger el parser con casos negativos, entradas hostiles y límites de tiempo.
- Corregir y cubrir con regresiones `firewalld`, `find`, enlaces, Docker y evaluación CKA.
- Restaurar el scrollback únicamente como texto, nunca mediante HTML guardado.
- Aplicar en paralelo las mejoras SEO de bajo riesgo: canonical, sitemap, JSON-LD y noindex.

**Salida:** batería local completa en verde, workflow publicado y control obligatorio activo en GitHub.

## Fase 2 · Arquitectura y aislamiento del motor

- Extraer sistema de archivos, procesos, shell, red y motores Linux/Docker/Kubernetes de `terminal-core.js`.
- Definir un protocolo de mensajes estable entre la interfaz y la simulación.
- Trasladar al Web Worker la lógica pura y costosa; mantener DOM, xterm, foco y renderizado en el hilo principal.
- Evitar cascadas secuenciales de imports y medir el tiempo hasta terminal interactiva antes y después.
- Mantener límites de tamaño y rendimiento en CI.
- Migrar las páginas restantes que dependen de `support.js` a HTML estático y retirar el runtime cuando ya no tenga consumidores.

**Salida:** módulos aislados, Worker sin acceso al DOM, equivalencia funcional y rendimiento no peor que la línea base.

## Fase 3 · Sistema visual y mantenibilidad

- Reducir estilos en línea y centralizar componentes visuales reutilizables.
- Usar Space Mono para cuerpo, código y textos largos.
- Reservar Press Start 2P para títulos y controles breves; evitar VT323 en párrafos largos.
- Verificar escritorio y móvil sin perder el estilo pixel art de S2KTUX.

**Salida:** páginas visualmente equivalentes o mejores, legibles y sin duplicación estructural relevante.

## Fase 4 · SEO, rutas y entrega

- Completar metadatos y datos estructurados que no se hayan adelantado en la fase 1.
- Sustituir rutas históricas dependientes de JavaScript por páginas estáticas de redirección cuando GitHub Pages lo permita.
- No asumir soporte para `_redirects`: si se requieren respuestas HTTP 301 reales por ruta, usar una capa de hosting/CDN que las admita.
- Auditar indexación, enlaces internos, sitemap y páginas noindex.

**Salida:** una URL canónica por contenido, rutas antiguas verificadas y cero páginas duplicadas indexables.

## Fase 5 · Robustez y accesibilidad

- Añadir cuotas de disco virtual, límites de archivos, imágenes y scrollback.
- Evitar crecimiento ilimitado, recursiones abusivas y bloqueos de pestaña.
- Auditar xterm con lector de pantalla, foco, teclado físico y teclado móvil.
- Mantener un único árbol accesible y evitar apertura agresiva del teclado virtual.

**Salida:** límites verificables, degradación segura y recorrido accesible probado en escritorio y móvil.
