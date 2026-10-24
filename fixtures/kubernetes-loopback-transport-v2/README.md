# Transporte interno del API, todavía en integración

Conserva el cambio que supera la prueba nativa v14: 76 comprobaciones,
restore corto de etcd, permisos, tres nodos Ready y aplicación nueva con
logs y DNS. No abre el avanzado ni equivale a probar el paquete final de
actualización. No incluye ejecutables, claves ni sesiones.

client-go 1.36 envuelve su transporte en `trackedTransport`. El candidato
anterior esperaba `*http.Transport` directamente y dejaba el plazo TLS en
10 segundos. `regresion-v1/` contiene la prueba con `rest.TransportFor`
real que descubre ese fallo; falla intencionadamente sobre el candidato
anterior y no forma parte de los tests del nuevo transporte.

`aplicar.mjs` acepta únicamente la fuente upstream de SHA conocido y añade
una llamada antes del envoltorio. `browser_loopback_transport.go` ajusta
solo el SNI interno con CA y verificación TLS activas: 60 segundos de plazo
y hasta cuatro conexiones por host. Conserva la caché, sus propietarios,
rotación, autenticación y HTTP/2. No cambia los clientes normales.

Para el constructor 1.36, se añade el cache.go generado y los dos archivos
Go de transporte al overlay, en lugar del helper WrapTransport anterior.
La adaptación ECDSA del constructor existente se mantiene por separado;
estos archivos no son por sí solos la receta completa del ejecutable.
Las pruebas Go del transporte usan HTTPS real: 40 peticiones, HTTP/2,
reutilización del pool, token incorrecto, CA incorrecta y hostname incorrecto.

`manifest.json` separa el ejecutable probado mediante montaje de lectura
del paquete OCI reconstruido, todavía sin aceptación nativa. Sus sumas
permiten comprobar ambos sin reutilizar capturas ni datos de alumnos.
El paquete OCI no está publicado. Esta carpeta queda fuera de `_site`.

Fuente base: [Kubernetes 1.36.5](https://github.com/kubernetes/kubernetes/tree/v1.36.5).
Se conserva la licencia Apache-2.0 en LICENSE. Los ajustes propios de esta
carpeta se ofrecen también bajo Apache-2.0. Los avisos de Go, Kubernetes y
sus dependencias deben acompañar al ejecutable cuando se distribuya;
esta carpeta de fuentes no sustituye esos avisos.
