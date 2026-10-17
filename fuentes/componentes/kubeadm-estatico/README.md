# Candidato de kubeadm con static Pods

Preparación privada sin publicar ni sustituir la configuración ya comprobada.
Se busca ejecutar kubeadm init completo para el control plane, con kubelet y
containerd auténticos, manifiestos locales y etcd con TLS. La prueba aislada
v9 pasa init, salud y rechazo TLS, autorización, Node Ready, los cuatro
static Pods, CoreDNS, kube-proxy como DaemonSet, join de un worker y HTTP/DNS
entre las dos VMs. Falta integrarla en el flujo persistente multinodo.

Al no existir imágenes oficiales de servidor linux/386, esta prueba reutiliza
la imagen BusyBox ya verificada y monta los binarios propios del componente en
lectura. Las etiquetas `s2ktux` no se presentan como imágenes oficiales. Se
conservan los certificados, la autorización y las comprobaciones de salud que
genera kubeadm. Los complementos DNS y kube-proxy se instalan por separado,
con recursos generados desde el ClusterConfiguration real. Proxy monta las
herramientas y bibliotecas de la VM en lectura, porque BusyBox no incluye
xtables; no se monta Windows ni /etc. No se da por probado el clúster por
terminar el comando: la suite comprueba también tráfico entre contenedores.

La configuración pertenece solo al prototipo del navegador. No es un cambio en
las clases de AFFiNE ni una instrucción para el laboratorio real del curso.
