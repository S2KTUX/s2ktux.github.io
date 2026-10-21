# Laboratorio Kubernetes · versión preliminar

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
- Aprovisionador local Rancher v0.0.34 (Apache-2.0): https://github.com/rancher/local-path-provisioner/tree/v0.0.34. Se conserva su manifiesto original en `recursos/almacenamiento-v1/`; la adaptación solo fija la imagen linux/386, el nodo del controlador y las tolerancias del laboratorio. No es un driver CSI.

La rama de recursos incluye los scripts, overlays y configuración empleados
para construir los componentes propios. Los informes internos de pruebas y
perfiles de navegador no forman parte de la entrega pública.
