set -eu
export GODEBUG=tlsmlkem=0
export KUBECONFIG=/etc/kubernetes/admin.conf
kubectl --request-timeout=60s create configmap qa-ha-validacion --from-literal=estado=antes
test "$(kubectl --request-timeout=60s get configmap qa-ha-validacion -o jsonpath='{.data.estado}')" = antes
echo QA_HA_DATOS_PREVIOS_OK
