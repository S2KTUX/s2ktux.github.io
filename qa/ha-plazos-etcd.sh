export GODEBUG=tlsmlkem=0
set +e
date -u
for limit in 2s 60s; do
  echo "QA_ETCD_COMMAND_TIMEOUT=$limit"
  begin=$(date +%s)
  etcdctl --endpoints=https://127.0.0.1:2379 --dial-timeout=30s --command-timeout="$limit" --cacert=/etc/kubernetes/pki/etcd/ca.crt --cert=/etc/kubernetes/pki/etcd/healthcheck-client.crt --key=/etc/kubernetes/pki/etcd/healthcheck-client.key endpoint status -w json
  rc=$?
  end=$(date +%s)
  echo "QA_ETCD_RC=$rc QA_ETCD_SECONDS=$((end-begin))"
done
