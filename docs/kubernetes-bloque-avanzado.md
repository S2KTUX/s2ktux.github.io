# Cierre conjunto de las clases 24–34

Consulta del curso de AFFiNE: 23/10/2026, en modo solo lectura. No se cambian
los guiones ni la clase 35. Este documento es de mantenimiento: no acredita
por sí mismo que el laboratorio esté terminado.

La aceptación se hace por bloques compartidos, no publicando una clase en
cada ronda. Los complementos se preparan cuando hacen falta, y las pruebas
destructivas se separan de las sesiones de estudio.

| Clase | Ejercicios y comprobaciones | Cierre necesario |
| --- | --- | --- |
| 24 | Crear y reparar Static Pods, comparar manifiesto y mirror, borrar el mirror y comprobar su recreación. | Dos casos nativos aprobados el 22/10. Falta HA: tres control planes, LB, quorum y caída/recuperación. |
| 25 | Init con configuración real, kubeconfig, CNI, Static Pods, Ready, DNS y tráfico. | Reutilizar el recorrido privado de init; falta integrarlo como escenario frío y reproducible sin destruir el laboratorio de aplicaciones. |
| 26 | Join de worker, token nuevo, hash de CA, CSR/certificado de nodo, rechazo de permisos admin y tráfico entre nodos. | Recorrido manual aprobado en copia privada v11: token inválido rechazado, join válido, CSR, certificado y DNS/HTTP entre workers. Falta ofrecer este escenario limpio al alumno. |
| 27 | Cordon, drain con PDB y desplazamiento al segundo worker. Upgrade APT/kubeadm de control plane y workers, versiones de procesos, objetos conservados y salud final. | Cordon/drain/PDB y actualización real del control plane aprobados. Faltan workers APT y aceptación multinodo del upgrade; no basta editar la versión declarada. |
| 28 | Snapshot TLS, integridad, restore en directorio nuevo, hostPath, montaje real de etcd y un testigo que debe volver a su valor anterior. | Candidatos preparados. El restore solo puede prepararse en una copia desechable explícita, nunca sobre una sesión de estudio. Repetir en la base actual. |
| 29 | Metrics Server y HPA con requests, objetivos y métricas reales. | Banco y ensayo ampliado aprobados en v11: métricas de tres nodos, carga, subida de una a tres réplicas disponibles y bajada a una. |
| 30 | Instalar Helm con values, aplicación real; Kustomize con base intacta, overlay, prefijo, namespace, etiquetas y réplicas. | Banco y ensayo ampliado aprobados: repositorio HTTP, upgrade/history/rollback/uninstall; generator/hash, referencia, rollout y base intacta. |
| 31 | CRD y esquema; Operator entregado, Custom Resource, ownerReference, status, reconciliación y respuesta de la aplicación. | Banco conjunto en prueba. Una instancia CRD aislada no acredita el Operator. |
| 32 | Reinicios, ConfigMap ausente, imagen incorrecta, selector sin nodo, initContainer y readiness. | Banco conjunto en prueba. Conservar los casos de OOM/recursos ya ensayados; no confundir Error 137 con OOMKilled. |
| 33 | Kubelet detenido y kubeconfig incorrecto, sin renovar la CA ni editar manualmente Conditions. API caída por un manifiesto incorrecto, solo en copia desechable y con diagnóstico por consola. | Kubelet/kubeconfig aprobados en la batería conjunta. API caída aprobada en v13: rechazo, reparación, todos los nodos Ready, nuevo rechazo, limpieza y aplicación nueva con DNS. Pendiente de integración pública. |
| 34 | Selector y targetPort del Service, PVC Pending, montaje y escritura; comprobar tráfico, no solo manifiestos. | Banco conjunto en prueba. Los recorridos de DNS, políticas e Ingress/Gateway se reutilizan del bloque de redes. Local Path no acredita un driver CSI. |

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

La variante privada de kernel HIGHMEM con ajuste de watchdog de red está
compilada. Se comprobó el símbolo del parámetro en el ejecutable: la primera
compilación había reutilizado un objeto antiguo y se conserva como fallida.
La variante corregida necesita todavía arranque y tráfico nativos; no
acredita HA por el mero hecho de compilar.

Estos resultados no abren todavía el avanzado: faltan integrar los escenarios
manuales, el upgrade, HA y la integración pública del perfil nuevo. La
sesión QA reutilizable de tres nodos no es una fábrica pública: se conserva
aparte, sin reemplazar guardados de alumnos ni reutilizar sus identidades.
