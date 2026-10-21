// Leer el proceso real evita lanzar dos clientes CRI pesados solo para
// consultar una variable. Exigir que pertenezca a kubepods, no solo el nombre.
// No se cambian TLS, certificados, procesos ni manifiestos.
export function comandosEntornoPreparado(){
 return [
  `set -eu; deadline=$(($(date +%s)+60)); while test "$(date +%s)" -lt "$deadline"; do for comm in /proc/[0-9]*/comm; do test -r "$comm" || continue; read -r name <"$comm" || continue; test "$name" = kube-apiserver || continue; proc=\${comm%/comm}; grep -q kubepods "$proc/cgroup" || continue; if tr '\\0' '\\n' <"$proc/environ" | grep -Fxq 'GODEBUG=tlsmlkem=0'; then exit 0; fi; done; sleep 2; done; exit 1`,
  `set -eu; pid=$(systemctl show kubelet -p MainPID --value); test "$pid" -gt 0; tr '\\0' '\\n' </proc/$pid/environ | grep -Fxq 'GODEBUG=tlsmlkem=0'`
 ];
}
