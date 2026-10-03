// Estructura de cursos S2KTUX — módulos y temas (extraídos del contenido original)
window.S2KTUX_COURSES = {
  rhcsa: {
    id: "rhcsa",
    badge: "RED HAT",
    badgeColor: "#d97757",
    title: "RHCSA 9 · EX200",
    subtitle: "Preparación práctica para Red Hat Certified System Administrator sobre la generación RHEL 9.",
    note: "Este curso y su laboratorio están identificados expresamente como RHCSA 9.",
    modules: [
      { n: "01", title: "Herramientas Esenciales", desc: "Herramientas esenciales de la shell para la administración del sistema.", video: "https://youtu.be/enwp35IHCic",
        topics: ["Acceder a un prompt de shell", "Redirección de entrada/salida", "Grep y expresiones regulares", "Acceso remoto con SSH", "Inicio y cambio de usuario (su)", "Tar y compresión (gzip/bzip2)", "Edición de texto con VI", "Gestión de archivos y directorios", "Enlaces físicos y simbólicos", "Permisos estándar ugo/rwx", "Documentación del sistema (man/info)"] },
      { n: "02", title: "Administración del Software", desc: "Gestión de paquetes, módulos y repositorios con RPM y DNF.", video: "https://youtu.be/GM_9D8zNOag",
        topics: ["Configurar el acceso a repositorios RPM", "Instalar, actualizar y eliminar paquetes con DNF", "Consultar y verificar paquetes con RPM", "Administrar módulos y grupos de paquetes"] },
      { n: "03", title: "Crear scripts de shell simples", desc: "Automatización básica y lógica de programación con Bash.", video: "https://youtu.be/CRaP1XjdS4A",
        topics: ["Ejecutar código condicional (if/test/[])", "Uso de bucles (for/while/until)", "Procesar entradas de scripts", "Procesar la salida de comandos"] },
      { n: "04", title: "Operar sistemas en funcionamiento", desc: "Arranque, procesos, servicios y diagnóstico del sistema.", video: "https://youtu.be/TyjaQtZcA9Y",
        topics: ["Arrancar, reiniciar y apagar", "Arrancar en distintos targets", "Interrumpir el arranque (recuperar root)", "Identificar y eliminar procesos", "Prioridades (nice / real-time)", "Perfiles de sintonización (tuned)", "Localizar e interpretar logs/journals", "Preservar journals del sistema", "Servicios de red", "Transferencia segura (scp/sftp)"] },
      { n: "05", title: "Configuración del almacenamiento local", desc: "Particiones, LVM y montaje persistente.", video: "https://youtu.be/RMWPYC6xllw",
        topics: ["Listar, crear y eliminar particiones GPT", "Crear y eliminar volúmenes físicos (PV)", "Crear y gestionar grupos de volúmenes (VG)", "Crear y administrar volúmenes lógicos (LV)", "Montar con UUID o LABEL", "Cambios no destructivos y SWAP"] },
      { n: "06", title: "Crear y configurar sistemas de archivos", desc: "Formateo, montaje, NFS, autofs y permisos.", video: "https://youtu.be/gaYlseO7kus",
        topics: ["Crear, montar y desmontar FS locales", "Montar FS de red con NFS", "Configurar autofs", "Ampliar volúmenes lógicos existentes", "Diagnosticar permisos (SUID/SGID/Sticky/ACL)"] },
      { n: "07", title: "Implementar, configurar y mantener sistemas", desc: "Tareas programadas, servicios, paquetes y arranque.", video: "https://youtu.be/TRauHLhYB4c",
        topics: ["Programar tareas (cron y timers systemd)", "Iniciar, detener y habilitar servicios", "Configurar el target de arranque", "Configurar cliente de tiempo (chrony)", "Instalar y actualizar paquetes", "Modificar el gestor de arranque (GRUB2)"] },
      { n: "08", title: "Administrar redes básicas", desc: "Configuración de IP, hostname y firewall.", video: "https://youtu.be/cjx4DZ7tJI0",
        topics: ["Configurar direcciones IPv4 e IPv6 (nmcli)", "Resolución del nombre de host", "Servicios de red al inicio", "Restringir acceso con firewalld"] },
      { n: "09", title: "Administrar usuarios y grupos", desc: "Cuentas locales, políticas de contraseña y sudo.", video: "https://youtu.be/3N-B_vGKTYQ",
        topics: ["Crear, eliminar y modificar cuentas", "Contraseñas y envejecimiento (chage)", "Crear, eliminar y modificar grupos", "Configurar el acceso privilegiado (sudo)"] },
      { n: "10", title: "Administrar la seguridad", desc: "Firewall, permisos, SSH y hardening con SELinux.", video: "https://youtu.be/mDqQq9ZGehA",
        topics: ["Configurar el firewall (firewalld / rich rules / NAT)", "Permisos predeterminados (umask)", "Autenticación SSH mediante claves", "Modos de SELinux", "Contextos SELinux", "Restaurar contextos predeterminados", "Etiquetas de puerto SELinux", "Booleanos SELinux"] },
      { n: "11", title: "Clase Extra", desc: "Podman, contenedores como servicio, find avanzado, reset de root, SSH y entorno del examen.", video: "https://youtu.be/T7jPRmBA9_g",
        topics: ["Podman: buscar, descargar y gestionar imágenes", "Crear contenedores con puertos y volúmenes", "Contenedor como servicio systemd (root y rootless)", "loginctl enable-linger y systemctl --user", "find avanzado (-perm, -mmin, -exec)", "Reset de contraseña de root paso a paso", "Usuario SSH con sudo para el examen", "Metodología y entorno de la certificación"] }
    ]
  },
  lpic1: {
    id: "lpic1",
    badge: "LPI",
    badgeColor: "#8fa876",
    title: "LPIC-1",
    subtitle: "Linux Professional Institute Certification — exámenes 101 y 102, 10 temas.",
    note: "Fundamentos esenciales de Linux para cualquier distro.",
    modules: [
      { n: "101", title: "Arquitectura del Sistema", desc: "Hardware, arranque del sistema y niveles de ejecución.", video: "https://youtu.be/enwp35IHCic",
        topics: ["101.1 Determinar y configurar hardware", "101.2 Arranque del sistema (BIOS/UEFI, GRUB)", "101.3 Niveles de ejecución / targets y apagado"] },
      { n: "102", title: "Instalación de Linux y gestión de paquetes", desc: "Particionado, GRUB, librerías y paquetería.", video: "",
        topics: ["102.1 Diseño del esquema de particionado", "102.2 Instalar un gestor de arranque", "102.3 Gestión de librerías compartidas", "102.4 Gestión de paquetes Debian (dpkg/apt)", "102.5 Gestión de paquetes RPM y YUM/DNF", "102.6 Linux como sistema virtualizado"] },
      { n: "103", title: "Comandos GNU y Unix", desc: "Línea de comandos, filtros, archivos y procesos.", video: "https://youtu.be/enwp35IHCic",
        topics: ["103.1 Trabajar desde la línea de comandos", "103.2 Procesar texto con filtros", "103.3 Administración básica de archivos", "103.4 Tuberías y redirecciones", "103.5 Crear, supervisar y matar procesos", "103.6 Modificar la prioridad de procesos", "103.7 Búsquedas con expresiones regulares", "103.8 Edición básica de archivos (vi)"] },
      { n: "104", title: "Dispositivos, Sistemas de Archivos y FHS", desc: "Discos, particiones, permisos, enlaces y jerarquía.", video: "",
        topics: ["104.1 Crear particiones y sistemas de archivos", "104.2 Mantener la integridad de los FS", "104.3 Controlar el montaje y desmontaje", "104.5 Administrar permisos y propietarios", "104.6 Crear y cambiar enlaces", "104.7 Encontrar archivos de sistema (FHS)"] },
      { n: "105", title: "Shells y Scripts", desc: "Entorno de shell y escritura de scripts.", video: "",
        topics: ["105.1 Personalizar y usar el entorno de shell", "105.2 Personalizar y escribir scripts sencillos"] },
      { n: "106", title: "Interfaces gráficas y accesibilidad", desc: "X11, escritorios gráficos y accesibilidad.", video: "",
        topics: ["106.1 Instalar y configurar X11", "106.2 Escritorios gráficos (Gnome/KDE/Xfce)", "106.3 Accesibilidad"] },
      { n: "107", title: "Tareas administrativas", desc: "Usuarios, automatización y localización.", video: "",
        topics: ["107.1 Administrar cuentas de usuario y grupo", "107.2 Automatizar tareas (cron/at/timers)", "107.3 Localización e internacionalización"] },
      { n: "108", title: "Servicios esenciales del sistema", desc: "Hora, registros, correo e impresión.", video: "",
        topics: ["108.1 Mantener la hora del sistema (NTP/chrony)", "108.2 Registros del sistema (rsyslog/journald)", "108.3 Agente de Transferencia de Correo (MTA)", "108.4 Gestión de la impresión (CUPS)"] },
      { n: "109", title: "Fundamentos de redes", desc: "TCP/IP, configuración, DNS y diagnóstico.", video: "",
        topics: ["109.1 Fundamentos de los protocolos de Internet", "109.2 Configuración de red persistente", "109.3 Resolución de problemas de red", "109.4 Configuración DNS del cliente"] },
      { n: "110", title: "Seguridad del Sistema", desc: "Administración de seguridad, host y cifrado.", video: "",
        topics: ["110.1 Tareas de administración de seguridad", "110.2 Configuración de la seguridad del sistema", "110.3 Protección de datos mediante cifrado (SSH/GPG)"] }
    ]
  },
  docker: {
    id: "docker",
    badge: "DOCKER",
    badgeColor: "#6b8e9e",
    title: "Docker",
    subtitle: "Contenedores desde cero: de los fundamentos al uso profesional, en 3 clases.",
    note: "Contenedores desde cero: imágenes, volúmenes y redes para empaquetar y desplegar apps.",
    modules: [
      { n: "01", title: "Clase 1 — Fundamentos de Docker", desc: "Qué es un contenedor, instalación y primeros pasos.", video: "https://www.youtube.com/watch?v=BML40ZpS6zc",
        topics: ["Qué es Docker", "Máquina virtual vs contenedor", "Contenedor, imagen, Dockerfile y DockerHub", "Instalar Docker en Linux", "Primeros pasos: run, ps, stop, rm, logs", "Ciclo de vida de un contenedor", "Imágenes y capas", "Primer Dockerfile (CMD vs ENTRYPOINT)"] },
      { n: "02", title: "Clase 2 — Docker para el día a día", desc: "Gestionar y compartir imágenes, volúmenes, redes y Docker Compose.", video: "https://www.youtube.com/watch?v=15_TPrR1cSA",
        topics: ["Gestionar imágenes: commit, save y load", "Etiquetas (docker tag)", "Compartir imágenes: push, pull y registros", "Volúmenes y bind mounts", "Persistencia y docker cp", "Redes y resolución por nombre", "Docker Compose: up, ps, logs, down", "Build desde Compose y ejemplo completo"] },
      { n: "03", title: "Clase 3 — Docker profesional", desc: "Recursos, imágenes ligeras y paso a producción.", video: "https://www.youtube.com/watch?v=OxdRl8Yiy5I",
        topics: ["Controlar los recursos de un contenedor (CPU, memoria)", "Reducir el tamaño de las imágenes con multi-stage", "Distroless: qué es y cuándo usarlo", "Preparar un contenedor para producción"] }
    ]
  },
  kubernetes: {
    id: "kubernetes",
    badge: "CKA",
    badgeColor: "#5b7fa6",
    title: "Kubernetes",
    subtitle: "Preparación para CKA con Kubernetes 1.35. Clases 00–34; contenido pendiente de publicación.",
    note: "Del contenedor al clúster: pods, despliegues, red, almacenamiento y administración.",
    modules: [
      { n: "00", title: "Fundamentos de Kubernetes", desc: "", video: "", topics: [] },
      { n: "01", title: "Preparación del laboratorio", desc: "", video: "", topics: [] },
      { n: "02", title: "Pods", desc: "", video: "", topics: [] },
      { n: "03", title: "ReplicaSet", desc: "", video: "", topics: [] },
      { n: "04", title: "Deployment", desc: "", video: "", topics: [] },
      { n: "05", title: "Services", desc: "", video: "", topics: [] },
      { n: "06", title: "NameSpaces", desc: "", video: "", topics: [] },
      { n: "07", title: "Requests y limits", desc: "", video: "", topics: [] },
      { n: "08", title: "LimitRange y ResourceQuota", desc: "", video: "", topics: [] },
      { n: "09", title: "Probes y Health Checks (Sondas)", desc: "", video: "", topics: [] },
      { n: "10", title: "Environment variables y ConfigMap", desc: "", video: "", topics: [] },
      { n: "11", title: "Secrets", desc: "", video: "", topics: [] },
      { n: "12", title: "Volumenes", desc: "", video: "", topics: [] },
      { n: "13", title: "RBAC : Usuarios y grupos", desc: "", video: "", topics: [] },
      { n: "14", title: "ServiceAccount", desc: "", video: "", topics: [] },
      { n: "15", title: "Ingress", desc: "", video: "", topics: [] },
      { n: "16", title: "DaemonSets", desc: "", video: "", topics: [] },
      { n: "17", title: "StatefulSets", desc: "", video: "", topics: [] },
      { n: "18", title: "Jobs y CronJobs", desc: "", video: "", topics: [] },
      { n: "19", title: "Scheduling I: nodeSelector y Node Affinity", desc: "", video: "", topics: [] },
      { n: "20", title: "Scheduling II: Taints y Tolerations", desc: "", video: "", topics: [] },
      { n: "21", title: "NetworkPolicies", desc: "", video: "", topics: [] },
      { n: "22", title: "CoreDNS y descubrimiento de servicios", desc: "", video: "", topics: [] },
      { n: "23", title: "Gateway API", desc: "", video: "", topics: [] },
      { n: "24", title: "Static Pods, control plane y HA esencial", desc: "", video: "", topics: [] },
      { n: "25", title: "kubeadm init y CNI", desc: "", video: "", topics: [] },
      { n: "26", title: "kubeadm join: nodos, tokens y certificados", desc: "", video: "", topics: [] },
      { n: "27", title: "Mantenimiento y actualización del clúster", desc: "", video: "", topics: [] },
      { n: "28", title: "Backup y restauración de etcd", desc: "", video: "", topics: [] },
      { n: "29", title: "Autoscaling: Metrics Server y HPA", desc: "", video: "", topics: [] },
      { n: "30", title: "Helm y Kustomize", desc: "", video: "", topics: [] },
      { n: "31", title: "CRD y Operators", desc: "", video: "", topics: [] },
      { n: "32", title: "Troubleshooting de Pods", desc: "", video: "", topics: [] },
      { n: "33", title: "Troubleshooting de nodos y control plane", desc: "", video: "", topics: [] },
      { n: "34", title: "Troubleshooting de red y almacenamiento", desc: "", video: "", topics: [] }
    ]
  }
};

window.S2KTUX_COURSES.aws = {
  id: "aws", badge: "AWS", badgeColor: "#e0a458",
  title: "AWS Cloud Practitioner",
  subtitle: "El presente y futuro: la nube (sus bases).",
  note: "Próximamente.",
  modules: []
};

window.S2KTUX_COURSES.rhce = {
  id: "rhce", badge: "RED HAT", badgeColor: "#d97757",
  title: "RHCE",
  subtitle: "Automatización con Ansible. Certificado superior.",
  note: "Próximamente.",
  modules: []
};
