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
| 27 | Cordon, drain con PDB y desplazamiento al segundo worker. Upgrade APT/kubeadm de control plane y workers, versiones de procesos, objetos conservados y salud final. | Banco de mantenimiento preparado. La actualización real sigue sin aceptación global; no sustituirla por editar la versión declarada. |
| 28 | Snapshot TLS, integridad, restore en directorio nuevo, hostPath, montaje real de etcd y un testigo que debe volver a su valor anterior. | Candidatos preparados. El restore solo puede prepararse en una copia desechable explícita, nunca sobre una sesión de estudio. Repetir en la base actual. |
| 29 | Metrics Server y HPA con requests, objetivos y métricas reales. | Banco conjunto en prueba. Conservar además el ensayo de carga, subida y bajada real de réplicas; no confundirlo con leer el YAML del HPA. |
| 30 | Instalar Helm con values, aplicación real; Kustomize con base intacta, overlay, prefijo, namespace, etiquetas y réplicas. | Banco conjunto en prueba. Los recorridos previos de upgrade/history/rollback/uninstall y generator/hash siguen siendo parte de la aceptación del bloque. |
| 31 | CRD y esquema; Operator entregado, Custom Resource, ownerReference, status, reconciliación y respuesta de la aplicación. | Banco conjunto en prueba. Una instancia CRD aislada no acredita el Operator. |
| 32 | Reinicios, ConfigMap ausente, imagen incorrecta, selector sin nodo, initContainer y readiness. | Banco conjunto en prueba. Conservar los casos de OOM/recursos ya ensayados; no confundir Error 137 con OOMKilled. |
| 33 | Kubelet detenido y kubeconfig incorrecto, sin renovar la CA ni editar manualmente Conditions. API caída por un manifiesto incorrecto, solo en copia desechable y con diagnóstico por consola. | Kubelet y kubeconfig aprobados en la batería conjunta. Nuevo caso de API caída pendiente de ejecución nativa; no basta con su test de sintaxis. |
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

La batería conjunta de tres nodos y 23 casos candidatos se ejecuta sobre esa
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
captura v12 no se considera sana ni publicable. Se prepara un kernel privado
HIGHMEM y más RAM para el control plane de administración, sin quitar
umbrales de kubelet ni tolerar artificialmente la presión de memoria.

Estos resultados no abren todavía el avanzado: faltan integrar los escenarios
manuales, el upgrade, HA y la integración pública del perfil nuevo. La
sesión QA reutilizable de tres nodos no es una fábrica pública: se conserva
aparte, sin reemplazar guardados de alumnos ni reutilizar sus identidades.
