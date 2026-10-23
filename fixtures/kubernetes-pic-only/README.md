# Candidato PIC, solo para QA

Deriva del motor jit8192 que utiliza el laboratorio. Cambia únicamente
`src/rust/cpu/pic.rs`: si desaparece la petición del controlador esclavo
después de reconocer su cascada, se entrega el vector espurio IRQ15. Linux
puede entonces reconocer IRQ2 y no quedan bloqueadas todas las IRQ esclavas.

No contiene el cambio de reloj del candidato anterior. `cpu.rs` se conserva
como evidencia de esa comparación; los hashes están en manifest.json.
El motor y las capturas publicados no se sustituyen con este archivo.

El experimento de compatibilidad restaura solo una fábrica v6 inmutable en
un perfil de pruebas nuevo, sin cargar sesiones del alumno ni guardar una
captura nueva con la identidad anterior. Que el experimento funcione no
autoriza a migrar guardados ni a declarar HA o upgrade terminados.

Fuentes base: [v86](https://github.com/copy/v86). Redistribución BSD-2-Clause,
con el aviso completo en LICENSE. El parche está en pic.patch.
`pic-original.rs` permite comprobar que no hay otros cambios en ese módulo.
El caso se contrasta con el [manejador i8259 de Linux](https://github.com/torvalds/linux/blob/master/arch/x86/kernel/i8259.c).

La compilación usa las mismas bibliotecas softfloat/zstd y flags del motor
base, sin modificar TSC: cargo rustc --offline --release --target
wasm32-unknown-unknown, linker tools/rust-lld-wrapper, --import-table,
--global-base=4096, --v86-strip-debug, build/softfloat.o, build/zstddeclib.o,
bulk-memory, multivalue y simd128.
