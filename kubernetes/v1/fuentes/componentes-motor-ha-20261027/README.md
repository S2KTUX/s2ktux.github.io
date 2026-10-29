# Motor del laboratorio HA

Variante v86 jit8192-pic-v1: correcciones del reloj TSC y del vector espurio del controlador PIC. El binario comprobado tiene SHA-256 2b81820d3c4f0c4928cdc13ed18312e4bb30ba674a6e2c04e5c2601d2ed705c9.

fuentes-v86-pic-reloj-licencias.tar.gz contiene el directorio exacto empleado para construirlo: Rust, JavaScript, componentes C, archivos generados, licencia y objetos de enlace. No incluye discos, memoria de las máquinas, perfiles de navegador ni claves del laboratorio.

Compilador original: Rust1.90.0, objetivo wasm32-unknown-unknown. El guion compilar-pic-motor.sh conserva la receta original y sus rutas de trabajo, que deben adaptarse al equipo. Los objetos SoftFloat/Zstandard incluidos corresponden a esa construcción; también se incluyen sus fuentes C. La regresión de reloj valida el contador, no por sí sola HA o la recuperación completa de Linux.

Licencias: v86 BSD-2-Clause; SoftFloat3e BSD-3-Clause, aviso completo en LICENSE-softfloat.txt y en su fuente; Zstandard1.4.5 con la opción BSD de su licencia dual. Se conserva su LICENSE por separado y los avisos del código amalgamado. Deben acompañar la distribución del binario.

Este paquete se ha preparado localmente; aún no se ha publicado ni acredita la aceptación del laboratorio.
