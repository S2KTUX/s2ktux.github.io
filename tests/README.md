# Validación de S2KTUX

## Ejecución local

```powershell
npm ci
npx playwright install chromium
npm test
```

`npm test` ejecuta todas las pruebas `.mjs` de esta carpeta. La batería incluye contratos estáticos, recursos del sitio, presupuestos de rendimiento, aislamiento de los tres entornos y un recorrido real en Chromium por Linux, Docker y Kubernetes.

## Validación de comandos

`terminal-command-schema.js` es la fuente declarativa para comprobar opciones desconocidas, valores obligatorios y requisitos mínimos antes de ejecutar un comando. La primera cobertura estricta incluye:

- Comunes: `ls`, `id`, `hostname`, `date`, `ln` y `find`.
- Linux/RHCSA: `firewall-cmd`.
- Docker: `docker ps` y `docker run`.
- Kubernetes/CKA: `kubectl get`, `run`, `apply`, `scale` y `rollout`.

Cada ampliación del esquema debe incorporar al menos un caso válido y uno negativo en `command-validation.mjs`, además de una prueba de estado en `terminal-e2e.mjs` cuando el comando modifica la máquina simulada.

## Integración continua

`.github/workflows/validate.yml` repite la batería completa en cada subida y en cada propuesta de cambio. Un cambio no debe considerarse terminado si `npm test` falla.
