set -eu
export GODEBUG=tlsmlkem=0
export KUBECONFIG=/etc/kubernetes/admin.conf
deadline=$(($(date +%s)+180))
available=0
while test "$(date +%s)" -lt "$deadline"; do
  if response=$(kubectl --server=https://10.77.0.100:8443 --request-timeout=30s get --raw=/readyz) && test "$response" = ok; then available=1; break; fi
  sleep 5
done
test "$available" = 1
kubectl --server=https://10.77.0.100:8443 --request-timeout=60s patch configmap qa-ha-validacion --type=merge -p '{"data":{"estado":"durante"}}'
test "$(kubectl --server=https://10.77.0.100:8443 --request-timeout=60s get configmap qa-ha-validacion -o jsonpath='{.data.estado}')" = durante
etcdctl --endpoints=https://10.77.0.11:2379,https://10.77.0.12:2379 --dial-timeout=30s --command-timeout=60s --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/healthcheck-client.crt --key=/etc/kubernetes/pki/etcd/healthcheck-client.key endpoint health
ip -4 -o addr show eth0
echo QA_HA_ESCRITURA_CON_CP1_DETENIDO_OK
