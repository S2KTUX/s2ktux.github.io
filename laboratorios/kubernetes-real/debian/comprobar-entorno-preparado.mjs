// Consultas sin reinicios ni reparaciones. CRI puede tardar durante la
// recuperación; no confundir su timeout con un entorno TLS ausente.
export function comandosEntornoPreparado(){
 return [
  `set -eu; deadline=$(($(date +%s)+120)); while test "$(date +%s)" -lt "$deadline"; do id=$(crictl --timeout=20s ps --name kube-apiserver -q | head -1); if test -n "$id"; then if crictl --timeout=20s inspect "$id" >/tmp/s2ktux-api-inspect.json; then jq -e 'any(.info.runtimeSpec.process.env[]; .=="GODEBUG=tlsmlkem=0")' /tmp/s2ktux-api-inspect.json; exit $?; fi; fi; sleep 2; done; exit 1`,
  `set -eu; pid=$(systemctl show kubelet -p MainPID --value); test "$pid" -gt 0; tr '\\0' '\\n' </proc/$pid/environ | grep -Fxq 'GODEBUG=tlsmlkem=0'`
 ];
}
