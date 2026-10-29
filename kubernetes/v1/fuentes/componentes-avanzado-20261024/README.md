# Componentes del laboratorio avanzado

Construcciones propias de Kubernetes para Linux de 32 bits. No son binarios
oficiales para esta arquitectura. Este directorio prepara la entrega; no
autoriza publicarla ni acredita por sí solo que las máquinas funcionen.

`runtime-1.35.tar.gz` contiene el ejecutable inicial y su suma de integridad.
`upgrade-1.36.5.tar.gz` contiene imágenes OCI reales para la actualización.
Las pruebas comprueban los ejecutables de los procesos, no solo el número
de versión que devuelve el cliente.

`fuentes-y-licencias.tar.gz` conserva el lanzador de cada versión, los
archivos completos usados por los overlays de Go, sus pruebas, los scripts
de construcción y las licencias de Kubernetes, sus dependencias y Go.
Los scripts conservan las rutas del entorno de construcción original;
para reproducirlos hay que ajustar esas rutas a la copia local.

Fuentes originales:

- Kubernetes 1.35.9: https://github.com/kubernetes/kubernetes/tree/v1.35.9
- Kubernetes 1.36.5: https://github.com/kubernetes/kubernetes/tree/v1.36.5
- Go 1.26.9: https://go.dev/dl/

El ajuste conserva TLS con verificación de CA, autenticación y RBAC.
Limita las conexiones simultáneas del cliente interno del API y amplía
su espera de negociación; no elimina comprobaciones de salud ni inventa
respuestas. Los certificados de servicio usan el overlay ECDSA del laboratorio.

Estos archivos no contienen sesiones de alumnos, perfiles de navegador ni
claves del portátil. La base limpia del clúster se distribuye por separado,
con sus propias comprobaciones y el aviso sobre sus credenciales de prácticas.

Las licencias de Debian, Linux, BusyBox, containerd, CNI y los demás
componentes de la base deben conservarse también en la entrega del laboratorio.
