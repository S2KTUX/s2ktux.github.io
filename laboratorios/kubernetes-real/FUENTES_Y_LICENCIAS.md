# Laboratorio Kubernetes · fuentes y licencias

La interfaz y las máquinas se ejecutan en el navegador. Los discos, el kernel
y el motor se descargan de una revisión inmutable de este mismo repositorio;
los cambios y guardados del alumno permanecen en su navegador.

El paquete conserva los avisos del motor v86 y xterm en el laboratorio Docker.
v86 es BSD-2-Clause; xterm.js es MIT. Kubernetes, containerd, CNI, CoreDNS y los
controladores conservan sus licencias Apache-2.0/BSD correspondientes. BusyBox
y el kernel Linux conservan GPL-2.0. Las compilaciones linux/386 del servidor
son propias del laboratorio, no binarios oficiales distribuidos por Kubernetes.

Fuentes y materiales de construcción:

- Base Debian, herramientas y firmware compartidos con los laboratorios anteriores:
  https://github.com/S2KTUX/s2ktux.github.io/releases/tag/docker-real-2026-10-11
  y https://github.com/S2KTUX/s2ktux.github.io/releases/tag/linux-real-beta-2026-10-08
- Kubernetes: https://github.com/kubernetes/kubernetes/tree/v1.35.9
- Linux: https://www.kernel.org/ y configuración `debian/kernel/v1/kernel.config`.
- BusyBox: https://busybox.net/downloads/busybox-1.37.0.tar.bz2
- Motor v86: https://github.com/copy/v86 (fuentes y ajustes incluidos en la rama de recursos).
- Aprovisionador local Rancher v0.0.34 (Apache-2.0): https://github.com/rancher/local-path-provisioner/tree/v0.0.34. Se conserva su manifiesto original en `recursos/almacenamiento-v1/`; la adaptación fija la imagen linux/386, el worker del controlador, sus recursos y las tolerancias del laboratorio. No es un driver CSI.
- Traefik v3.5.2 (MIT): https://github.com/traefik/traefik/tree/v3.5.2. El chart 37.1.1 procede de https://github.com/traefik/traefik-helm-chart/tree/v37.1.1. Los materiales conservan el paquete original y la variante lab1, con las mismas plantillas y valores y los CRDs gestionados aparte. La imagen `s2ktux/traefik-lab:3.5.2` es una compilación propia para linux/386, no una imagen oficial de Traefik para esa arquitectura.
- NetworkPolicies (Apache-2.0): implementación de referencia https://github.com/kubernetes-sigs/kube-network-policies/tree/v1.1.2, revisión a145b01caf668ce509766b0a48ff4e153a5e50f8. El kit conserva una compilación propia linux/386. Aplica filtrado real mediante NRI y netfilter junto al CNI bridge del navegador; no es una instalación de Calico ni una simulación de las conexiones.

La rama de recursos incluye los scripts, overlays y configuración empleados
para construir los componentes propios. Los informes internos de pruebas y
perfiles de navegador no forman parte de la entrega pública.

## Base del nivel avanzado

Kubernetes 1.35 y la actualización a 1.36 utilizan compilaciones propias linux/386. Se conservan los avisos, cambios y recetas de construcción:

- [Fuentes, cambios y licencias de los componentes](https://raw.githubusercontent.com/S2KTUX/s2ktux.github.io/599f0e06c2301510bd498a2a9d1fd484c60aaf1c/kubernetes/v1/fuentes/componentes-avanzado-20261024/fuentes-y-licencias.tar.gz).
- [Fuentes de la infraestructura del laboratorio](https://raw.githubusercontent.com/S2KTUX/s2ktux.github.io/599f0e06c2301510bd498a2a9d1fd484c60aaf1c/kubernetes/v1/fuentes/componentes-avanzado-20261024/fuentes-infraestructura.tar.gz).
- [Fuentes y configuración de la base Debian](https://raw.githubusercontent.com/S2KTUX/s2ktux.github.io/599f0e06c2301510bd498a2a9d1fd484c60aaf1c/kubernetes/v1/fuentes/componentes-ha-20261026/fuentes-debian-admin.tar.gz).
- [Configuración y modificaciones del kernel](https://raw.githubusercontent.com/S2KTUX/s2ktux.github.io/599f0e06c2301510bd498a2a9d1fd484c60aaf1c/kubernetes/v1/fuentes/componentes-ha-20261026/fuentes-kernel-ha.tar.gz). Las fuentes completas de Linux 6.19.3 se conservan en el [paquete de fuentes de Docker](https://github.com/S2KTUX/s2ktux.github.io/releases/download/docker-real-2026-10-11/fuentes-docker-real-2026-10-11.tar.gz).
- [Fuentes exactas y licencias del motor v86 utilizado](https://raw.githubusercontent.com/S2KTUX/s2ktux.github.io/599f0e06c2301510bd498a2a9d1fd484c60aaf1c/kubernetes/v1/fuentes/componentes-motor-ha-20261027/fuentes-v86-pic-reloj-licencias.tar.gz).

Estos archivos contienen componentes y materiales de construcción; no incluyen sesiones de alumnos ni perfiles de navegador.
