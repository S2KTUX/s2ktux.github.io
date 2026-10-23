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
| 26 | Join de worker, token nuevo, hash de CA, CSR/certificado de nodo, rechazo de permisos admin y tráfico entre nodos. | El join real forma parte de las bases multinodo. Falta ofrecer el nodo limpio al alumno y verificar el recorrido manual completo, incluido token inválido. |
| 27 | Cordon, drain con PDB y desplazamiento al segundo worker. Upgrade APT/kubeadm de control plane y workers, versiones de procesos, objetos conservados y salud final. | Banco de mantenimiento preparado. La actualización real sigue sin aceptación global; no sustituirla por editar la versión declarada. |
| 28 | Snapshot TLS, integridad, restore en directorio nuevo, hostPath, montaje real de etcd y un testigo que debe volver a su valor anterior. | Candidatos preparados. El restore solo puede prepararse en una copia desechable explícita, nunca sobre una sesión de estudio. Repetir en la base actual. |
| 29 | Metrics Server y HPA con requests, objetivos y métricas reales. | Banco conjunto en prueba. Conservar además el ensayo de carga, subida y bajada real de réplicas; no confundirlo con leer el YAML del HPA. |
| 30 | Instalar Helm con values, aplicación real; Kustomize con base intacta, overlay, prefijo, namespace, etiquetas y réplicas. | Banco conjunto en prueba. Los recorridos previos de upgrade/history/rollback/uninstall y generator/hash siguen siendo parte de la aceptación del bloque. |
| 31 | CRD y esquema; Operator entregado, Custom Resource, ownerReference, status, reconciliación y respuesta de la aplicación. | Banco conjunto en prueba. Una instancia CRD aislada no acredita el Operator. |
| 32 | Reinicios, ConfigMap ausente, imagen incorrecta, selector sin nodo, initContainer y readiness. | Banco conjunto en prueba. Conservar los casos de OOM/recursos ya ensayados; no confundir Error 137 con OOMKilled. |
| 33 | Kubelet detenido y kubeconfig incorrecto, sin renovar la CA ni editar manualmente Conditions. | Banco conjunto en prueba. Falta repetir también una avería del control plane con API caída y su recuperación por consola. |
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
