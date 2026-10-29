# Kernel del escenario HA

Linux 6.19.3 HIGHMEM, con el cambio del watchdog de ne2k-pci. El binario
verificado tiene SHA-256 709c16f5901b0474056926e79eae1f1822c1fb154104cd80872f7d049d269891.
Las tres máquinas usan el parámetro ne2k_pci.tx_watchdog_ms=5000.

Se incluyen configuración, parche, avisos GPL y recetas originales. Para
reconstruir: extraer Linux 6.19.3, aplicar kernel-ne2k-watchdog.patch, usar
kernel.config como .config y ejecutar make ARCH=x86 olddefconfig y
make ARCH=x86 bzImage con GCC y las dependencias de compilación de Linux.
Las recetas documentan también la construcción incremental y sus rutas,
que deben adaptarse al equipo. La recompilación final fuerza el driver
parcheado: no reutilizar el objeto ne2k-pci anterior al parche.

Las fuentes completas originales linux-6.19.3.tar.xz están dentro de:
https://github.com/S2KTUX/s2ktux.github.io/releases/download/docker-real-2026-10-11/fuentes-docker-real-2026-10-11.tar.gz
SHA-256 del tar.xz original:
0e474968adfcbee32916fd01a89d8ccfd1168d8d32569e76a5c664c793198ebe

Este paquete no contiene claves, discos, sesiones de alumnos ni perfiles
de navegador. Prepararlo no acredita la aceptación ni publica el laboratorio.
