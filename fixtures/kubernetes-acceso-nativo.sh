#!/bin/sh
set -eu
echo "S2KTUX: prueba nativa de permisos y ServiceAccounts"
echo "INICIO c13-a"
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p13a --ignore-not-found -o name)"
kubectl create namespace p13a
kubectl -n p13a wait --for=create serviceaccount/default --timeout=90s
kubectl -n p13a create role lector-pods --verb=get,list,watch --resource=pods
kubectl -n p13a create rolebinding ana-lector --role=lector-pods --user=ana
kubectl auth can-i list pods -n p13a --as=ana
kubectl auth can-i delete pods -n p13a --as=ana
echo "VALIDAR c13-a"
object=$(kubectl -n p13a get role lector-pods -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.rules|length)==1 and .rules[0].apiGroups==[""] and .rules[0].resources==["pods"] and (.rules[0].verbs|sort)==["get","list","watch"]' && object=$(kubectl -n p13a get rolebinding ana-lector -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.roleRef.kind=="Role" and .roleRef.name=="lector-pods" and any(.subjects[]; .kind=="User" and .name=="ana")' && test "$(kubectl auth can-i list pods -n p13a --as=ana)" = yes && test "$(kubectl auth can-i delete pods -n p13a --as=ana)" = no && test "$(kubectl auth can-i list pods -n default --as=ana)" = no
echo "POSITIVO c13-a"
kubectl -n p13a delete rolebinding ana-lector
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p13a get role lector-pods -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.rules|length)==1 and .rules[0].apiGroups==[""] and .rules[0].resources==["pods"] and (.rules[0].verbs|sort)==["get","list","watch"]' && object=$(kubectl -n p13a get rolebinding ana-lector -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.roleRef.kind=="Role" and .roleRef.name=="lector-pods" and any(.subjects[]; .kind=="User" and .name=="ana")' && test "$(kubectl auth can-i list pods -n p13a --as=ana)" = yes && test "$(kubectl auth can-i delete pods -n p13a --as=ana)" = no && test "$(kubectl auth can-i list pods -n default --as=ana)" = no); then echo "ERROR: aceptó el caso incompleto c13-a"; exit 1; fi
echo "NEGATIVO c13-a"
kubectl delete namespace p13a --ignore-not-found --wait=true --timeout=120s
echo "INICIO c13-b"
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p13b --ignore-not-found -o name)"
kubectl create namespace p13b
kubectl -n p13b wait --for=create serviceaccount/default --timeout=90s
test -z "$(kubectl get clusterrole lector-logs-p13b --ignore-not-found -o name)"
kubectl create clusterrole lector-logs-p13b --verb=get --resource=pods/log
kubectl -n p13b create rolebinding lectores-logs --clusterrole=lector-logs-p13b --group=lectores
kubectl auth can-i get pods/log -n p13b --as=ana-grupo --as-group=lectores
kubectl auth can-i get pods/log -n default --as=ana-grupo --as-group=lectores
echo "VALIDAR c13-b"
object=$(kubectl -n p13b get clusterrole lector-logs-p13b -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.rules|length)==1 and .rules[0].apiGroups==[""] and .rules[0].resources==["pods/log"] and .rules[0].verbs==["get"]' && object=$(kubectl -n p13b get rolebinding lectores-logs -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.roleRef.kind=="ClusterRole" and .roleRef.name=="lector-logs-p13b" and any(.subjects[]; .kind=="Group" and .name=="lectores")' && test "$(kubectl auth can-i get pods/log -n p13b --as=ana-grupo --as-group=lectores)" = yes && test "$(kubectl auth can-i get pods/log -n default --as=ana-grupo --as-group=lectores)" = no && test "$(kubectl auth can-i delete pods -n p13b --as=ana-grupo --as-group=lectores)" = no
echo "POSITIVO c13-b"
kubectl -n p13b delete rolebinding lectores-logs
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p13b get clusterrole lector-logs-p13b -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.rules|length)==1 and .rules[0].apiGroups==[""] and .rules[0].resources==["pods/log"] and .rules[0].verbs==["get"]' && object=$(kubectl -n p13b get rolebinding lectores-logs -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.roleRef.kind=="ClusterRole" and .roleRef.name=="lector-logs-p13b" and any(.subjects[]; .kind=="Group" and .name=="lectores")' && test "$(kubectl auth can-i get pods/log -n p13b --as=ana-grupo --as-group=lectores)" = yes && test "$(kubectl auth can-i get pods/log -n default --as=ana-grupo --as-group=lectores)" = no && test "$(kubectl auth can-i delete pods -n p13b --as=ana-grupo --as-group=lectores)" = no); then echo "ERROR: aceptó el caso incompleto c13-b"; exit 1; fi
echo "NEGATIVO c13-b"
kubectl delete namespace p13b --ignore-not-found --wait=true --timeout=120s
kubectl delete clusterrole lector-logs-p13b --ignore-not-found
echo "INICIO c14-a"
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p14a --ignore-not-found -o name)"
kubectl create namespace p14a
kubectl -n p14a wait --for=create serviceaccount/default --timeout=90s
kubectl -n p14a create serviceaccount aplicacion
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"name":"cliente","namespace":"p14a","labels":{"app":"cliente"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sleep","3600"]}],"serviceAccountName":"aplicacion"}}' | kubectl apply -f -
kubectl -n p14a wait --for=condition=Ready pod/cliente --timeout=180s
kubectl -n p14a exec cliente -- ls /var/run/secrets/kubernetes.io/serviceaccount
echo "VALIDAR c14-a"
object=$(kubectl -n p14a get serviceaccount aplicacion -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.metadata.name=="aplicacion"' && object=$(kubectl -n p14a get pod cliente -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.serviceAccountName=="aplicacion" and any(.spec.volumes[]?; any(.projected.sources[]?; .serviceAccountToken!=null))' && kubectl -n p14a exec cliente -- test -s /var/run/secrets/kubernetes.io/serviceaccount/token
echo "POSITIVO c14-a"
kubectl -n p14a delete pod cliente
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p14a get serviceaccount aplicacion -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.metadata.name=="aplicacion"' && object=$(kubectl -n p14a get pod cliente -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.serviceAccountName=="aplicacion" and any(.spec.volumes[]?; any(.projected.sources[]?; .serviceAccountToken!=null))' && kubectl -n p14a exec cliente -- test -s /var/run/secrets/kubernetes.io/serviceaccount/token); then echo "ERROR: aceptó el caso incompleto c14-a"; exit 1; fi
echo "NEGATIVO c14-a"
kubectl delete namespace p14a --ignore-not-found --wait=true --timeout=120s
echo "INICIO c14-b"
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p14b --ignore-not-found -o name)"
kubectl create namespace p14b
kubectl -n p14b wait --for=create serviceaccount/default --timeout=90s
kubectl -n p14b create serviceaccount lectora
kubectl -n p14b create role lector-pods --verb=get,list --resource=pods
kubectl -n p14b create rolebinding lectora-pods --role=lector-pods --serviceaccount=p14b:lectora
kubectl -n p14b create token lectora --duration=1h > /root/p14b-token.txt
curl --fail --cacert /etc/kubernetes/pki/ca.crt -H "Authorization: Bearer $(cat /root/p14b-token.txt)" https://10.77.0.10:6443/api/v1/namespaces/p14b/pods
echo "VALIDAR c14-b"
object=$(kubectl -n p14b get serviceaccount lectora -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.metadata.name=="lectora"' && object=$(kubectl -n p14b get rolebinding lectora-pods -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.roleRef.kind=="Role" and .roleRef.name=="lector-pods" and any(.subjects[]; .kind=="ServiceAccount" and .name=="lectora" and .namespace=="p14b")' && test "$(kubectl auth can-i list pods -n p14b --as=system:serviceaccount:p14b:lectora)" = yes && test "$(kubectl auth can-i delete pods -n p14b --as=system:serviceaccount:p14b:lectora)" = no && test "$(kubectl auth can-i list pods -n default --as=system:serviceaccount:p14b:lectora)" = no && test -s /root/p14b-token.txt && test "$(jq -Rr 'split(".")[1]|gsub("-";"+")|gsub("_";"/")|@base64d|fromjson|.sub' </root/p14b-token.txt)" = system:serviceaccount:p14b:lectora && response=$(curl -fsS --cacert /etc/kubernetes/pki/ca.crt -H "Authorization: Bearer $(cat /root/p14b-token.txt)" https://10.77.0.10:6443/api/v1/namespaces/p14b/pods) && test -n "$response" && echo "$response" | jq -e '.kind=="PodList"'
echo "POSITIVO c14-b"
kubectl -n p14b delete rolebinding lectora-pods
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p14b get serviceaccount lectora -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.metadata.name=="lectora"' && object=$(kubectl -n p14b get rolebinding lectora-pods -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.roleRef.kind=="Role" and .roleRef.name=="lector-pods" and any(.subjects[]; .kind=="ServiceAccount" and .name=="lectora" and .namespace=="p14b")' && test "$(kubectl auth can-i list pods -n p14b --as=system:serviceaccount:p14b:lectora)" = yes && test "$(kubectl auth can-i delete pods -n p14b --as=system:serviceaccount:p14b:lectora)" = no && test "$(kubectl auth can-i list pods -n default --as=system:serviceaccount:p14b:lectora)" = no && test -s /root/p14b-token.txt && test "$(jq -Rr 'split(".")[1]|gsub("-";"+")|gsub("_";"/")|@base64d|fromjson|.sub' </root/p14b-token.txt)" = system:serviceaccount:p14b:lectora && response=$(curl -fsS --cacert /etc/kubernetes/pki/ca.crt -H "Authorization: Bearer $(cat /root/p14b-token.txt)" https://10.77.0.10:6443/api/v1/namespaces/p14b/pods) && test -n "$response" && echo "$response" | jq -e '.kind=="PodList"'); then echo "ERROR: aceptó el caso incompleto c14-b"; exit 1; fi
echo "NEGATIVO c14-b"
kubectl delete namespace p14b --ignore-not-found --wait=true --timeout=120s
rm -f /root/p14b-token.txt
echo "SUITE_ACCESO_OK"
