# Kubernetes: medidas reales del 21/11/2026

La candidata no demuestra una mejora del arranque ni de la memoria total del nivel inicial. HA no terminó en el plazo de 40 minutos bajo carga. No se publicó ningún cambio.

## Comparación del inicial

Cinco pares secuenciales, alternando el orden. Chromium 151.0.7922.34, perfiles limpios, entrada en frío, mismos recursos y sitio local. La variante anterior sustituye únicamente el lector de disco por el de producción del commit `933a2d818db9caed68f79d962d79fa780594402d`. La candidata elimina su hash comprimido duplicado. Memoria: suma PrivateMemorySize64 de los procesos de Chromium a Ready + 60 s.

**Limitación autorizada:** CPU ajena antes de cada pasada entre 50,8 % y 71,2 %. Los resultados no permiten atribuir pequeñas diferencias al cambio. Todas las diez entradas alcanzaron Ready sin errores registrados.

| Medida | Lector publicado | Candidata |
|---|---:|---:|
| Tiempo mediano hasta Ready | 32,163 s | 32,946 s |
| Rango | 31,292–33,243 s | 31,107–35,563 s |
| Memoria privada mediana | 4.203.343.872 B (~3,91 GiB) | 4.201.603.072 B (~3,91 GiB) |
| Tráfico mediano hasta Ready | 342.449.603 B | 342.450.961 B |
| Pasadas completadas | 5/5 | 5/5 |

**Decisión:** no recomendar este cambio como aceleración apreciable. Reduce una operación redundante, pero no reduce los datos descargados ni demuestra ahorro de memoria de la VM. La reducción aislada de buffers del cargador HA es real en su prueba sintética, pero ese cargador aún no está integrado en el arranque publicado y no explica estas cifras.

## HA real

Una preparación nueva de tres control planes, sin limitación artificial de CPU. CPU ajena antes de iniciar: 53,4 %. Se alcanzaron tres máquinas creadas, pero no el clúster Ready en **2.400 s**. No hay medida de memoria estable a Ready + 60 s.

| Medida | Resultado |
|---|---|
| Arranque usable | No terminó en 40 min |
| Pico observado del navegador durante preparación | 13.470.265.344 B (~12,5 GiB) |
| Fase final | Incorporación del tercer control plane; kubeadm continúa consultando su progreso |
| Diagnóstico observado | Reintentos de etcd Maintenance/Status contra 10.77.0.11:2379 con DeadlineExceeded; espera de TLS Bootstrap |

El pico se tomó sobre los procesos headless de Chromium descendientes del runner, mediante PrivateMemorySize64. Las muestras iniciales con cero procesos se descartan: el primer observador solo reconocía chrome.exe. No se presenta este pico como consumo estable ni como requisito mínimo definitivo.

**Clasificación:** timeout de preparación bajo carga, HA no validado. Los mensajes de etcd son evidencia de la espera, no una causa raíz demostrada. No se probó un fallo deliberado de control plane ni recuperación de HA: el clúster no llegó al estado previo necesario.

## Evidencia y repetición

- `qa/evidencia/k8s-medicion-real-20261121.json`: once casos, tráfico, tiempos, CPU, errores y diagnóstico.
- `qa/evidencia/k8s-ha-memoria-en-preparacion-20261121.jsonl`: serie de memoria durante la preparación; usar solo muestras con procesos > 0.
- `qa/evidencia/k8s-medicion-real-20261121-ha-candidata-1.png`: captura al agotar el plazo.
- `qa/evidencia/k8s-ha-memoria-chromium-20261121.json`: ensayo aislado del cargador futuro, no VM completa.

Runner reanudable: `node qa/k8s-medir-mejoras-reales.mjs`. Omite casos terminados, incluidos los fallidos: conservar este archivo de resultados y establecer `QA_OUTPUT` con otro destino antes de una nueva batería. Para permitir la carga ajena autorizada, establecer `QA_ALLOW_BUSY=1`. No se ejecutó otra VM en paralelo. El observador solo leyó procesos del navegador de la prueba.

Al cerrar se reforzó el probe del arnés para exigir JSON no vacío antes de jq y guardar su respuesta. Las muestras anteriores se conservan sin reescribir: su tiempo corresponde al indicador Ready de la aplicación más el probe de esa ejecución; no son una nueva batería de regresión funcional.

Pendiente: resolver y medir la incorporación de HA, comprobarlo con el equipo libre cuando sea posible y repetir antes de publicar cualquier afirmación de aceleración. No se cambiaron bases ni sesiones de alumnos.
