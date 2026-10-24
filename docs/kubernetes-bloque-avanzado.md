# Cierre conjunto de las clases 24–34

Consulta del curso de AFFiNE: 23/10/2026, en modo solo lectura. No se cambian
los guiones ni la clase 35. Este documento es de mantenimiento: no acredita
por sí mismo que el laboratorio esté terminado.

La aceptación se hace por bloques compartidos, no publicando una clase en
cada ronda. Los complementos se preparan cuando hacen falta, y las pruebas
destructivas se separan de las sesiones de estudio.

| Clase | Ejercicios y comprobaciones | Cierre necesario |
| --- | --- | --- |
| 24 | Crear y reparar Static Pods, comparar manifiesto y mirror, borrar el mirror y comprobar su recreación. | Static Pods aprobados. HA v10 supera 88 comprobaciones: tres CP, LB redundante, tráfico, pérdida de un nodo, pérdida de mayoría y recuperación con datos/TLS/RBAC. Falta integrar ese escenario para el alumno. |
| 25 | Init con configuración real, kubeconfig, CNI, Static Pods, Ready, DNS y tráfico. | Reutilizar el recorrido privado de init; falta integrarlo como escenario frío y reproducible sin destruir el laboratorio de aplicaciones. |
| 26 | Join de worker, token nuevo, hash de CA, CSR/certificado de nodo, rechazo de permisos admin y tráfico entre nodos. | Recorrido manual aprobado en copia privada v11: token inválido rechazado, join válido, CSR, certificado y DNS/HTTP entre workers. Falta ofrecer este escenario limpio al alumno. |
| 27 | Cordon, drain con PDB y desplazamiento al segundo worker. Upgrade APT/kubeadm de control plane y workers, versiones de procesos, objetos conservados y salud final. | Cordon/drain/PDB, CP y ambos workers APT comprobados. El intento v4 aprueba además guardar/recuperar 1.36, datos, DNS y RBAC. La recuperación del CP procede de una ejecución reanudada: falta estabilizar el recorrido sin interrupciones e integrarlo para el alumno. |
| 28 | Snapshot TLS, integridad, restore en directorio nuevo, hostPath, montaje real de etcd y un testigo que debe volver a su valor anterior. | Snapshot/restore aprobados en v11. En administración tras el upgrade, el API no recupera su salud: corregirlo y repetir la aceptación estricta. Siempre sobre una copia desechable, nunca sobre una sesión de estudio. |
| 29 | Metrics Server y HPA con requests, objetivos y métricas reales. | Banco y ensayo ampliado aprobados en v11: métricas de tres nodos, carga, subida de una a tres réplicas disponibles y bajada a una. |
| 30 | Instalar Helm con values, aplicación real; Kustomize con base intacta, overlay, prefijo, namespace, etiquetas y réplicas. | Banco y ensayo ampliado aprobados: repositorio HTTP, upgrade/history/rollback/uninstall; generator/hash, referencia, rollout y base intacta. |
| 31 | CRD y esquema; Operator entregado, Custom Resource, ownerReference, status, reconciliación y respuesta de la aplicación. | CRD y Operator aprobados en la batería nativa v11, incluidos negativos y reconciliación. Falta integrar el banco en la entrega definitiva. |
| 32 | Reinicios, ConfigMap ausente, imagen incorrecta, selector sin nodo, initContainer y readiness. | Seis averías aprobadas en v11, con negativos y limpieza. Conservar OOM/recursos ya ensayados y repetir en el perfil definitivo; Error 137 no basta para afirmar OOMKilled. |
| 33 | Kubelet detenido y kubeconfig incorrecto, sin renovar la CA ni editar manualmente Conditions. API caída por un manifiesto incorrecto, solo en copia desechable y con diagnóstico por consola. | Kubelet/kubeconfig aprobados en la batería conjunta. API caída aprobada en v13: rechazo, reparación, todos los nodos Ready, nuevo rechazo, limpieza y aplicación nueva con DNS. Pendiente de integración pública. |
| 34 | Selector y targetPort del Service, PVC Pending, montaje y escritura; comprobar tráfico, no solo manifiestos. | Tres averías Service/PVC aprobadas en v11. DNS, políticas e Ingress/Gateway ya tienen recorridos de redes. Falta la integración definitiva; Local Path no acredita un driver CSI. |

Cada candidato debe rechazar un estado incompleto y aceptar el resultado
correcto, aunque se haya usado otra solución equivalente. Los tests de
sintaxis, transporte o interfaz no sustituyen la prueba dentro de Linux.

El nivel avanzado permanece cerrado hasta completar su aceptación. Mantener
los fallos de cada intento: no reescribir un informe anterior como aprobado.

## Base compartida: resultados del 23/10

La regresión de interfaz pasa (58 pruebas unitarias y 181 de navegador), pero
no equivale a aceptación del clúster. La batería remota original y el ensayo
de cambiar solamente el motor sobre las capturas multinodo antiguas fallan
con pérdida de interrupciones IDE y errores reales de lectura. Se retira ese
ensayo de la ejecución automática; no se publica como solución del arranque.

En la copia privada se ha capturado una fábrica nueva v11 con el motor PIC
aislado, sin cambios de TSC, y una identidad propia. Su recuperación independiente
y el guardado/recuperación de una sesión QA han superado API, los cuatro Static
Pods, un Pod nuevo, logs, exec, DNS y conservación del UID. Es una prueba de
un control plane, no una aceptación multinodo ni un dato de velocidad pública.

La batería conjunta de tres nodos y 24 casos candidatos se ejecuta sobre esa
nueva fábrica. Sigue separada de los guardados de alumnos y no abre el nivel
avanzado por el mero hecho de existir el banco de preguntas. El arranque de QA
detecta errores de hardware durante la espera para detenerse sin consumir todo
el plazo ni intentar corregir prácticas encima de un clúster averiado.

La batería nativa `qa-bloque-v11-XQI0VG` ha terminado con 20/20 casos
aprobados: drain/PDB, snapshot y restore, métricas/HPA, Helm/Kustomize,
CRD/Operator, seis fallos de Pods, kubelet/kubeconfig y tres averías de
Service/PVC. Se comprobaron preparación, rechazo inicial, solución, variantes
incluidas, rechazo de un resultado incompleto y limpieza. El restore verificó
el testigo recuperado y el montaje real del nuevo directorio de etcd.

Los dos Static Pods también pasan en esta base, en una ejecución anterior.
Cordon, incluidos sus resultados y limpieza, ha pasado la repetición nativa
`qa-bloque-v11-twYix2`. El instrumento privado consulta el estado real de la
consola: no confunde mensajes asíncronos del kernel con una consola ocupada
ni envía comandos para forzar un prompt u ocultar un timeout.

En esa misma copia se ha reinicializado únicamente worker2 y repetido el join
a mano. El token inexistente se rechaza sin crear credenciales; el válido
genera un CSR aprobado y un certificado verificado contra la CA. El worker
no tiene admin.conf. Pods nuevos en ambos workers verifican DNS y HTTP entre
nodos. Retirar el token de bootstrap no expulsa el nodo. Salud final: tres Ready.

El init de administración v29 supera creación, CNI, DNS y permisos, pero su
upgrade falla por MemoryPressure: el Job de salud no puede programarse. La
captura v12 no se considera sana ni publicable y se conserva su informe fallido.

El ensayo frío v32 utiliza un kernel HIGHMEM privado y 1536 MiB reales. Pasa
184 comprobaciones: init/CNI/DNS, captura limpia sin presión de memoria,
repositorio firmado, APT, plan con su Job de salud, upgrade apply, drain,
paquetes kubelet/kubectl, uncordon y salud final. API 1.36 conserva ConfigMap,
UID y namespace previos. Los tres ejecutables del control plane se verifican
contra el hash del binario 1.36, no solo contra etiquetas de imagen. Un Pod
nuevo arranca y resuelve DNS después. Esto no acredita todavía los workers.

La captura genuina v13 se toma ANTES del upgrade y de abrir la consola,
con configuración 1.35, kernel/RAM/motor propios. Su prueba independiente
`qa-admin-highmem-TrhXSq` pasa: cuatro Static Pods, Node Ready sin presión,
Pod nuevo sin tolerar presión de memoria, logs/DNS y guardar/recuperar el
mismo archivo y UID. No se transforman capturas ni guardados anteriores.
Las mediciones son locales de QA, no una promesa de velocidad pública.

CI general 39934116385 sobre 6b1455d: 58 pruebas unitarias y 181 de navegador
aprobadas. La página publicada sigue sin cambiar; las pruebas privadas de
máquinas y la integración del nuevo perfil son comprobaciones separadas.

La regresión 39966094886 sobre 5ca5604 también termina SUCCESS: 58 pruebas
unitarias y 181 de navegador. No despliega el avanzado.

El ensayo ampliado `qa-bloque-v11-reC5No` aprueba HPA, Helm y Kustomize,
pero su resultado global es FALLIDO: el reinicio del API tras reparar c33-c
no completa la salud en la base pequeña. Responden algunos endpoints, pero
fallan hooks de arranque/RBAC y se pierde de nuevo la conexión. No se
atribuye aún una causa definitiva a ese fallo. c28-b no llega a prepararse
sobre ese clúster y no aporta una nueva aceptación de restore.

El intento multinodo v2 sobre administración v13 falla al esperar la
reparación del API; sí recupera su salud durante la limpieza. El intento v3
repite ese escenario en una copia del guardado QA, sin modificar el original.
Con sondeo HTTP ligero, certificados reales y Ready completo, c33-c supera
reparación (134 s locales), rechazo del estado incompleto y limpieza. Una
aplicación nueva comprueba Deployment, ReplicaSet, Pod, logs y DNS. No se
atribuye toda la mejora al sondeo: los intentos no son un contraste aislado.

En esa misma ejecución el plan y upgrade apply reales terminan, y kubelet
publica 1.36 con Node Ready. El ensayo global v3 sigue FALLIDO: los cuatro
Static Pods no alcanzan todos Ready en su plazo. No se acreditan por ello
los workers ni el guardado del clúster actualizado. La continuación v4 usa
otra copia QA, conserva registros individuales de los componentes y exige
salud y hashes antes de continuar; no repite init ni oculta el fallo v3.

La continuación v4 supera esa salud, los tres ejecutables nuevos, permisos y
una aplicación nueva con DNS. Actualiza cada worker con APT y kubeadm upgrade
node, verifica el hash del proceso kubelet, respeta PDB y recupera las dos
réplicas. Guarda y recupera los tres nodos: versiones 1.36, ConfigMap/UID,
datos de la aplicación, DNS y rechazo RBAC conservados.

v4 NO es un aprobado global: el restore de etcd empieza a comprobar mientras
todavía responde el API anterior, antes de recrearse etcd, y luego falla la
recuperación. El intento v5 espera explícitamente el dato ANTES restaurado;
también falla. Los logs muestran que el API termina por su hook inicial de
reparación de IP/puertos. Por tanto no basta corregir la carrera del test ni
aumentar su plazo; falta resolver la recuperación efectiva del API.

Se prepara una variante privada de su conexión interna: mantiene la CA,
identidad, verificación TLS y hooks, reutiliza el pool y amplía el plazo de
handshake interno. Sus pruebas Go pasan; no acredita aún recuperación nativa.
No se sustituyen los binarios de las bases publicadas.

La variante privada de kernel HIGHMEM con ajuste de watchdog de red está
compilada. Se comprobó el símbolo del parámetro en el ejecutable: la primera
compilación había reutilizado un objeto antiguo y se conserva como fallida.
La variante corregida arranca los tres nodos del ensayo HA v9: parámetro
real de NIC y journal indican 5000 ms. Init sirve el API a través del VIP
con certificados verificados. Ambos joins terminan y los cuatro Static
Pods de cada CP alcanzan Ready. El ensayo global v9 falla antes de las
caídas: el instrumento intenta transferir una unidad directamente a una
ruta que su transporte no admite. Se corrige enviándola a /tmp e instalándola
con systemd; ahora se valida esa ruta antes de arrancar.

El ensayo HA v10 termina PASS: 88 comprobaciones, sin errores de página ni
de los tres clientes. Tres control planes y miembros etcd, cuatro Static
Pods sanos por nodo, rutas persistentes y tráfico TCP con integridad en los
seis sentidos. Al detener toda la primera VM, el VIP migra y se conserva el
testigo; el clúster puede crear otro objeto. Reintegrar ese miembro recupera
los tres endpoints. Al detener los otros dos miembros, etcd rechaza escribir
sin mayoría. Tras recuperarlos conserva ambos testigos, todos los nodos
Ready y el rechazo RBAC. Esto acredita el escenario nativo, no su entrega
pública ni un tiempo de arranque garantizado.

Estos resultados no abren todavía el avanzado: faltan integrar los escenarios
manuales, el upgrade y HA, estabilizar el restore y aceptar la entrega del perfil nuevo. La
sesión QA reutilizable de tres nodos no es una fábrica pública: se conserva
aparte, sin reemplazar guardados de alumnos ni reutilizar sus identidades.

## Guardado de varias máquinas

`guardado-consumible-resultado-20261023-v2.json` pasa dos ciclos nativos de
guardar y recuperar tres nodos actualizados: alrededor de 4,27 GB de estado
sin comprimir y 1,41 GB comprimidos. Conserva archivo, UID, versiones,
aplicación disponible y todos los nodos Ready. Los tiempos locales de
guardado fueron 58,101 y 56,645 s; no son una promesa para otros equipos.

El mismo módulo de compresión, comprobado por SHA, se incorpora al código
web: Blob conserva los bytes y se libera solo la copia temporal cedida.
El formato y la identidad de las sesiones no cambian. Se declara compatible
la base anterior porque no cambian Linux, el kernel ni la preparación; no
se obliga a descargar otra vez los 549 MiB. Sin ArrayBuffer.transfer se
conserva el recorrido anterior. Las pruebas incluyen el paso entre iframes,
datos alterados, fallos de cuota y recuperación de bases compatibles.

La regresión completa del commit 44032b8 pasa localmente (59 pruebas
unitarias y 182 de navegador) y en GitHub Actions 39976527550. PR 77
continúa en borrador; estas comprobaciones no despliegan el nivel avanzado.

## Candidato de recuperación del API

Con autorización expresa del responsable se publica únicamente el paquete
de pruebas en la rama `assets/kubernetes-loopback-136-20261023`, commit
`8a7b94d173df6a8df78bcc2fc6fff9364e67d6a1`. Incluye ejecutable, fuentes,
sumas y licencias de terceros; no claves de clúster ni sesiones. No cambia
la web publicada. El archivo se identifica por SHA-256
`853a207e4aed4ca2e2bbf4e0789b5e4cce14e6d52bf33480178e462bc03acc99`.

El intento v6 falla antes de instalar: el relay entrega unos 4,3 MB de los
34,4 MB en 120 segundos. v7 entrega el archivo mediante un servidor HTTP
local de la red virtual, respaldado por la descarga HTTPS del navegador.
El SHA se verifica antes de servir y de nuevo en Debian; no se simulan
órdenes ni se sustituye el archivo por un resultado prefijado. curl recibe
los 32,8 MiB en 22 segundos locales; descarga, descompresión y comprobación
completan en 93,356 segundos. Esto no acredita la velocidad de todo Internet.

v7 comprueba el hash del nuevo proceso, pero el API no recupera su salud
en 247,282 segundos. No llega a preparar c28-b. El candidato se conserva
como ensayo fallido y no se incorpora a las imágenes ni a la web.

El intento v8 contrasta una variante de laboratorio sobre otra copia del
guardado sano v4, con el ejecutable anterior: detener API/controller/scheduler,
restaurar con el comando corto de etcdutl, exigir el nuevo montaje de etcd
y reiniciar componentes. Sigue la [recomendación oficial de Kubernetes](https://kubernetes.io/docs/tasks/administer-cluster/configure-upgrade-etcd/#restoring-an-etcd-cluster).
No cambia AFFiNE ni la chuleta. La variante se registra por separado: no
acredita el procedimiento sin detener los componentes.

v8 recupera el montaje y la salud de etcd, pero falla la lectura del testigo.
Se detecta y corrige un error del instrumento: apiserver-kubelet-client ya
no es una identidad administrativa y no puede leer ConfigMaps. El sondeo
ahora usa admin.conf únicamente dentro de la copia QA, con archivos 600,
CA verificada y sin imprimir claves. Antes del incidente exige tanto la
denegación del usuario de kubelet como la lectura de DESPUES por el admin.
No se añaden permisos a ese certificado. El cambio de kubeadm se documenta
en las [notas de Cluster API](https://main.cluster-api.sigs.k8s.io/user/troubleshooting.html#kubeadm-join-fails-after-upgrading-to-kubernetes-patch-releases).

v9 recupera ANTES en 126,038 segundos locales con el sondeo corregido, pero
sigue FALLIDO: readyz no aprueba start-service-ip-repair-controllers ni
rbac/bootstrap-roles; los logs muestran timeouts TLS del cliente interno.
El dato recuperado no se presenta como salud completa del clúster.

v10 contrasta una escucha IPv4 explícita con el MISMO ejecutable anterior.
Comprueba proceso nuevo, argumento y socket, pero tampoco supera la salud
en su plazo. No llega a ejecutar el restore ni justifica un cambio de bind
en las imágenes. Se descarta IPv4 como solución suficiente; tampoco se
incorpora el binario candidato. Los informes fallidos se conservan.

La rama de recursos incorpora ACLARACION_FUENTES.md en el commit
4441ae36dcdda25f8876cdf47d3ed3e079894b39: el candidato corresponde a 1.36.5,
no a la referencia genérica 1.35.9 del laboratorio de origen. El archivo y
su SHA originales no cambian. Nada de esto despliega la web ni abre el avanzado.

### Diagnóstico del 24 de octubre

Un reinicio del API original, sin restaurar etcd ni cambiar su manifiesto,
reproduce la misma falta de salud. Antes del reinicio se comprueban
certificados ECDSA, el entorno TLS previsto, más de 1 GiB de memoria
disponible y ausencia de throttling en los cgroups observados. Esto acota
el fallo; no descarta saturación de CPU durante el arranque ni lo resuelve.

Se encuentra además un defecto concreto del candidato anterior: client-go
1.36 devuelve un `trackedTransport` y el ajuste que esperaba directamente
un `http.Transport` no se aplicaba. Una regresión con `rest.TransportFor`
real confirma que permanecía en 10 segundos. La prueba simplificada previa
no cubría ese envoltorio y no era suficiente para acreditar el cambio.

El nuevo ensayo aplica el ajuste antes del envoltorio, sin retirarlo ni
desactivar la caché: limita las conexiones internas simultáneas y conserva
TLS, autenticación y HTTP/2. Pasan pruebas con peticiones HTTPS reales,
token incorrecto, CA incorrecta, hostname incorrecto y reutilización del
pool.

El intento nativo v14 supera 76 comprobaciones, sin fallos ni errores del
navegador. Comprueba el hash del proceso nuevo, readyz completo, tres nodos
Ready, permisos y UID conservados. Después ejecuta el restore corto de
c28-b: recupera ANTES, verifica el montaje real, rechaza el estado incompleto
y ejecuta un Deployment nuevo con logs y DNS. No necesita añadir flags de
restore ni detener manualmente los componentes. Los informes fallidos
anteriores permanecen conservados; no se sustituyen por este resultado.

El ejecutable verificado tiene SHA-256
`6c0d826692bcf9c042f7d2de8e75ac063f15b7eb4f18925c7f03cf4e23fd9c7c`.
El ensayo sigue siendo privado: falta incorporarlo a las imágenes del
laboratorio y repetir la actualización con ese paquete final. Este PASS
no abre el nivel avanzado ni acredita por sí solo todas las clases 24–34.

El parche, la fuente upstream, sus pruebas Go y la licencia quedan en
`fixtures/kubernetes-loopback-transport-v2`, fuera de `_site`. Se conserva
la regresión que descubre el fallo anterior, sin confundir su FAIL esperado
con la aceptación del nuevo transporte. La prueba unitaria del repositorio
exige las mismas fuentes y sumas que el ejecutable comprobado.

Se reconstruye además un paquete OCI local de 58.910.437 bytes: sustituye
la capa del ejecutable compartido, recalcula los digests de capa/config/
manifiesto y conserva BusyBox, los enlaces y kube-proxy. No incluye la
capa antigua del ejecutable ni modifica el paquete anterior. Aún falta
su importación y actualización nativas; no se publica ni se marca aceptado.
