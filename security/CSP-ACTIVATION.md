# CSP preparada (todavía no activa)

La política candidata está en `content-security-policy.txt`. No está enlazada desde HTML ni configurada como cabecera, por lo que este cambio no activa CSP.

## Antes de activarla

1. Servirla como cabecera HTTP desde una capa que permita cabeceras personalizadas. GitHub Pages no ofrece esta configuración; hace falta poner delante Cloudflare u otro proxy, o migrar el despliegue.
2. Externalizar o autorizar por hashes los scripts en línea que aún existen (incluidos JSON-LD y el registro del service worker). No se ha usado `unsafe-inline`.
3. Validarla primero como `Content-Security-Policy-Report-Only` en todas las páginas, el Worker de la terminal, Plausible y la reproducción bajo demanda desde `youtube-nocookie.com`.
4. Corregir cualquier informe, congelar la política resultante y pasarla de Report-Only a enforcement.

La activación deliberadamente queda fuera de este despliegue.
