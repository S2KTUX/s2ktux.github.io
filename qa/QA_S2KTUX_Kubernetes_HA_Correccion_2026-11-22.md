# Kubernetes HA: corrección y validación local

HA completó su preparación con tres control planes Ready y quorum real. La prueba de detener la primera VM permitió seguir escribiendo por el VIP; tras reanudarla, los tres API leyeron el dato escrito durante el fallo y los tres miembros de etcd volvieron a estar sanos. No se publicó la corrección.

## Qué se corrigió

Las fuentes originales usadas para compilar kubeadm v1.35.9 contienen `const etcdTimeout = 2 * time.Second`. Ese plazo se usa también en conexiones y consultas internas, independientemente del `etcdAPICall` de la configuración YAML. En la VM de diagnóstico, una consulta de estado de etcd con plazo de 2 s falló; con 60 s devolvió un estado válido.

Se compiló kubeadm linux/386 con un único cambio de comportamiento: ese plazo pasa a 60 s. La versión identifica la modificación como `v1.35.9+s2ktux.ha.etcd60s`, con árbol marcado dirty. Se conservan TLS, certificados, comprobaciones de salud y quorum. No se aprobaron CSR manualmente. Los certificados de kubelet se aprobaron y emitieron mediante el flujo nativo.

El instalador se ejecuta solo al preparar miembros HA nuevos, no al recuperar sesiones. Las bases, sus URL/SHA y los perfiles e identidades de guardado permanecen iguales. El instalador comprueba el archivo comprimido y el binario. Solo se usó un paquete local interceptado por el arnés: su futura URL de Cloudflare **todavía no se ha publicado**.

## Resultados nativos

Chromium 151.0.7922.34; CPU ajena al comienzo: 33,4 %. Existe carga externa, por lo que no es una comparación de rendimiento aislada con el ensayo anterior.

| Prueba | Resultado |
|---|---|
| Preparación nueva | Tres control planes Ready, tres miembros etcd, salud y quorum comprobados |
| Hasta Ready | 1.786.258 ms: 29 min 46 s |
| Memoria privada del navegador a Ready + 60 s | 14.758.600.704 B, aproximadamente 13,7 GiB / 14,8 GB |
| Dato anterior al fallo | ConfigMap creado y leído |
| Detener la VM del primer control plane | RPC stop completado; no se detuvieron solo los procesos del API |
| Servicio con el primer control plane detenido | Lectura y modificación por https://10.77.0.100:8443; propuestas confirmadas por etcd en los otros dos miembros |
| Reanudar el primer control plane | La comprobación inmediata no pasó: TLS/readiness de etcd todavía no disponibles |
| Recuperación con espera de calentamiento | Tres API responden y leen el valor escrito durante el fallo; tres endpoints etcd sanos; tres nodos Ready; dato de prueba eliminado |

La espera de recuperación no reinicia ni reconfigura servicios: reintenta consultas TLS verificadas. La prueba demuestra la caída de la primera VM y su recuperación, no todos los patrones posibles de partición de red ni apagones de varias máquinas. El arranque en frío sigue siendo muy lento: no se considera resuelta la entrada rápida de HA.

Cierre local: **91/91 pruebas unitarias y 213/213 Playwright**, auditoría de **125 referencias sin fallos**. La comprobación de identidades confirma que las URL/SHA de las bases y los perfiles de sesión siguen iguales a producción. Linux y Docker no tienen cambios de producto.

## Paquete reproducible, aún local

- Construcción: `qa/compilar-kubeadm-ha.sh`, overlay de Go sobre las fuentes existentes; no se modifican las fuentes originales.
- Empaquetado: `qa/empaquetar-kubeadm-ha.py`.
- Carpeta: `qa/evidencia/kubeadm-ha-etcd60s/`, con LICENSE, NOTICE si existe, licencias de vendor, fuente original/modificada identificada por SHA y fuente modificada.
- El texto íntegro de la licencia del runtime de Go está incluido en las licencias de vendor; se comprobó su igualdad con el LICENSE de la herramienta de compilación.
- Archivo: `kubeadm-ha.tar.gz`, 17.703.336 bytes.
- SHA-256 del archivo: `ad5abc53be9fc1232cc59486ab8a4b0e4b063df1faf296e02126d76181ef3dfe`.
- SHA-256 del binario: `9485f9f0eeefa6ef2297ac1d45364678ebd00bd4687623e6a8770a9984f9e02c`.
- Respaldo local del archivo y metadatos: `D:/RIVALIA/respaldos/kubeadm-ha-etcd60s-20261122`; hashes comprobados contra los originales.
- Fuentes upstream: https://github.com/kubernetes/kubernetes/tree/v1.35.9, archivo `cmd/kubeadm/app/util/etcd/etcd.go`.

## Evidencia

- `qa/evidencia/ha-plazos-etcd-extracto-20261122.txt`: extracto transcrito de la salida de la herramienta; el snapshot temporal completo del diagnóstico inicial no se conservó por separado.
- `qa/evidencia/k8s-ha-candidata-etcd60s-20261122.json`: preparación completa, tiempos, tráfico y memoria.
- `qa/evidencia/ha-fallo-antes-20261122.json`, `ha-fallo-detener-cp1-20261122.json`, `ha-fallo-durante-20261122.json`: creación, parada y escritura bajo fallo.
- `qa/evidencia/ha-fallo-snapshot-cp1-detenido-20261122.json`: salida nativa con los dos miembros sanos y escritura confirmada.
- `qa/evidencia/ha-fallo-despues-20261122.json`: primer intento inmediato fallido, conservado.
- `qa/evidencia/ha-fallo-despues-reintento-20261122.json`, `ha-fallo-snapshot-recuperado-20261122.json`: recuperación y consistencia de datos.
- `qa/evidencia/ha-cierre-npm-test-20261122.log`: cierre de pruebas de código y navegador.

## Pendiente de entrega

No hay push ni despliegue en esta sesión. Para publicar, falta agregar el paquete al árbol COMPLETO de s2ktux-recursos, verificar SHA/CORS/caché, respaldarlo con sus hashes y entregar la web por PR. No desplegar una carpeta de recursos aislada que retire Linux o Docker. Una base HA limpia de entrada rápida requerirá una preparación nueva y captura antes de abrir su consola: no se reutilizó como base limpia ninguna de las VMs de esta prueba.
