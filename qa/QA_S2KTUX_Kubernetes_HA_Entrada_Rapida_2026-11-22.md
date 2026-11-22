# Entrada rápida de HA con una base limpia

La reapertura local pasó de unos **32 min 27 s** de preparación a **2 min 9 s** desde una base limpia disponible en el navegador. Las tres API respondieron y los tres nodos llegaron a Ready. La copia restaurada mantuvo la escritura al detener la VM que tenía el VIP y recuperó sus tres API y miembros de etcd conservando los datos.

| Medida | Preparación en frío | Restauración local |
|---|---:|---:|
| CPU del equipo antes de iniciar | 13,5 % | 13,9 % |
| Tiempo hasta API y tres nodos Ready | ~32 min 27 s | 2 min 9 s |
| Memoria privada de Chromium a Ready + 60 s | 15,3 GiB | 13,6 GiB |

Se cerraron League of Legends y Overwolf. Se usó Chromium 151 y la misma candidata de HA con kubeadm para CPU emulada. La captura se hizo antes de abrir las consolas. Tardó 58,3 s y produjo un registro comprimido de 1.312.327.217 bytes, aproximadamente 1,31 GB. El tiempo en frío de la tabla resulta de restar la captura al total de 33 min 25 s. La memoria en frío sí incluye el efecto de haber capturado antes.

La restauración empleó el mismo perfil del navegador y su caché. Estas cifras corresponden a un par de mediciones y no incluyen descargar el paquete en una primera visita. En la restauración, el motor tardó unos 15 s en arrancar las tres VMs. Esperar a las tres API supuso 78 s y esperar a los nodos Ready otros 20 s. Los demás segundos corresponden a leer la base, abrir la interfaz y completar la comprobación final.

La prueba confirmó quién tenía el VIP antes de detener la VM. Las dos supervivientes aceptaron una escritura por el VIP y confirmaron propuestas de etcd. Tras reanudar la VM, las tres API devolvieron el valor escrito durante la caída y los tres miembros de etcd estaban sanos. El dato de QA se eliminó al final.

La base de esta pasada vivió en un perfil desechable de Chromium. Al cerrar la prueba se liberaron las VMs. La ruta de entrada rápida sigue siendo un prototipo local. Queda preparar una base distribuible más ligera y medir primera visita, restauración y caída desde el paquete servido.

- Medición y fases nativas en `qa/evidencia/k8s-ha-entrada-rapida-20261122.json`.
- Veredictos de caída en `qa/evidencia/ha-rapida-*-20261122.json`.
- Runner `qa/k8s-medir-mejoras-reales.mjs` con `QA_PROFILES=ha`, `QA_HA_FAST_BASE=1` y `QA_KUBEADM_ARCHIVE` apuntando al paquete local verificado. Usar `QA_OUTPUT` con otro nombre para repetir. `QA_KEEP_OPEN=1` permite repetir la caída después de las mediciones.
