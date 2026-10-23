# Conexión interna del API: candidato de pruebas

Construcción propia linux/386 de Kubernetes 1.36.5. No es un binario oficial
para esa arquitectura ni sustituye el laboratorio publicado.

La variante conserva los certificados ECDSA, la verificación TLS, la
autenticación, RBAC y los hooks de salud upstream. Solo amplía a 60 segundos
el handshake del cliente interno y reutiliza su pool de conexiones.

Fuentes originales: https://github.com/kubernetes/kubernetes/tree/v1.36.5

El paquete contiene el lanzador, el archivo completo modificado, el ajuste
del transporte, sus tests y la licencia Apache-2.0. Las dependencias conservan
los avisos indicados en FUENTES_Y_LICENCIAS.md y en el árbol vendor del tag.
SHA256SUMS permite comprobar todos los archivos del paquete.

No contiene certificados privados de un clúster, sesiones ni datos de alumnos.
La prueba nativa debe comprobar el hash del proceso y la salud completa;
compilar o superar tests Go no acredita por sí solo recuperación ni HA.
