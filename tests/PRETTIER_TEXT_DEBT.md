# Deuda técnica: contratos textuales compatibles con Prettier

Estos contratos siguen inspeccionando código fuente como texto. Se adaptaron al
formato predeterminado de Prettier para desbloquear la extracción del motor
Linux, pero deben convertirse en pruebas de comportamiento.

## Patrones ajustados directamente

- `phase1-regressions.mjs`: persistencia/restauración segura del scrollback,
  nodos symlink y reconocimiento de enlaces por `find`.
- `rocky-reference-contracts.mjs`: propagación del error `exit-code` y registro
  de la causa en el journal.

## Tabla temporal `prettierTextContracts`

`terminal-contracts.mjs` contiene respaldos textuales para:

- programas de pantalla alternativa;
- eventos Docker;
- here-docs y recuperación asíncrona del prompt;
- propiedad del foreground y entrada móvil;
- paneles de aprendizaje colapsados;
- diagnósticos SELinux;
- persistencia y reparación de estado;
- autorización root y comandos respaldados por paquetes;
- builtins Bash, repositorios Docker y semántica cotidiana del filesystem;
- bases de identidad y unidades systemd desconocidas;
- identidad SSH y utilidades Kubernetes empaquetadas;
- identidad/versiones proporcionadas por los engines;
- `reset`, entrada inmediata y reconciliación tras reinicio;
- transiciones alternate-screen, PS2 y ciclo de trabajos;
- TTY, redes/volúmenes Docker y administración Linux con estado;
- mounts/Compose, Docker listo al entrar, transferencias de registro y tags
  `latest` implícitos.

La tabla está identificada en el código con el comentario
`Deuda técnica consciente` para facilitar su retirada progresiva.
