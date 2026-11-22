set -eu
export GODEBUG=tlsmlkem=0
export KUBECONFIG=/etc/kubernetes/admin.conf
deadline=$(($(date +%s)+120))
recovered=0
while test "$(date +%s)" -lt "$deadline"; do
  healthy=1
  for ip in 10.77.0.10 10.77.0.11 10.77.0.12; do
    if response=$(curl --fail --silent --show-error --max-time 10 --cacert /etc/kubernetes/pki/ca.crt --cert /etc/kubernetes/pki/apiserver-kubelet-client.crt --key /etc/kubernetes/pki/apiserver-kubelet-client.key "https://$ip:6443/readyz") && test "$response" = ok; then :; else healthy=0; break; fi
  done
  if test "$healthy" = 1; then recovered=1; break; fi
  sleep 5
done
test "$recovered" = 1
for ip in 10.77.0.10 10.77.0.11 10.77.0.12; do
  test "$(kubectl --server="https://$ip:6443" --request-timeout=30s get --raw=/readyz)" = ok
  test "$(kubectl --server="https://$ip:6443" --request-timeout=30s get configmap qa-ha-validacion -o jsonpath='{.data.estado}')" = durante
done
etcdctl --endpoints=https://10.77.0.10:2379,https://10.77.0.11:2379,https://10.77.0.12:2379 --dial-timeout=30s --command-timeout=60s --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/healthcheck-client.crt --key=/etc/kubernetes/pki/etcd/healthcheck-client.key endpoint health
kubectl --request-timeout=60s get nodes -o wide
kubectl --request-timeout=60s delete configmap qa-ha-validacion
echo QA_HA_TRES_APIS_DATOS_Y_ETCD_RECUPERADOS_OK
