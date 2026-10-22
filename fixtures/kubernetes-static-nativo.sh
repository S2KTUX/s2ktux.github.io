#!/bin/sh
set -eu
echo PRUEBA_STATIC_PODS_REAL
case "${1:-all}" in all|c24-a|c24-b) ;; *) exit 2;; esac
if test "${1:-all}" = all || test "${1:-all}" = c24-a; then
echo INICIO_c24-a
kubectl get --raw=/readyz --request-timeout=20s
grep -Eq '^staticPodPath: */etc/kubernetes/manifests *$' /var/lib/kubelet/config.yaml
test ! -e /etc/kubernetes/manifests/curso-static-a.yaml && test -z "$(kubectl get namespace p24a --ignore-not-found -o name)"
kubectl create namespace p24a
if (set -eu; test -f /etc/kubernetes/manifests/curso-static-a.yaml && definition=$(kubectl create --dry-run=client -f /etc/kubernetes/manifests/curso-static-a.yaml -o json) && test -n "$definition" && printf '%s\n' "$definition" | jq -e '.apiVersion=="v1" and .kind=="Pod" and .metadata.name=="curso-static-a" and .metadata.namespace=="p24a" and (.spec.containers|length)==1 and .spec.containers[0].image=="busybox:1.37.0-musl"' && object=$(kubectl -n p24a get pod curso-static-a-cka-cp1 -o json) && test -n "$object" && printf '%s\n' "$object" | jq --argjson definition "$definition" -e '.metadata.annotations["kubernetes.io/config.source"]=="file" and (.metadata.annotations["kubernetes.io/config.mirror"]|type=="string" and length>0) and .spec.nodeName=="cka-cp1" and .status.phase=="Running" and any(.status.conditions[]?; .type=="Ready" and .status=="True") and (.spec.containers|map({name,image,command:(.command//[]),args:(.args//[])}))==($definition.spec.containers|map({name,image,command:(.command//[]),args:(.args//[])}))'); then echo ERROR_ACEPTO_SIN_RESOLVER; exit 1; fi
cat > /etc/kubernetes/manifests/curso-static-a.yaml <<'EOF'
apiVersion: "v1"
kind: "Pod"
metadata:
  name: "curso-static-a"
  namespace: "p24a"
spec:
  terminationGracePeriodSeconds: 1
  containers:
    - name: "app"
      image: "busybox:1.37.0-musl"
      imagePullPolicy: "Never"
      command:
        - "sleep"
        - "3600"
EOF
kubectl -n p24a wait --for=create pod/curso-static-a-cka-cp1 --timeout=120s
kubectl -n p24a wait --for=condition=Ready pod/curso-static-a-cka-cp1 --timeout=180s
kubectl -n p24a get pods -o wide
crictl ps
deadline=$(($(date +%s)+180)); until (set -eu; test -f /etc/kubernetes/manifests/curso-static-a.yaml && definition=$(kubectl create --dry-run=client -f /etc/kubernetes/manifests/curso-static-a.yaml -o json) && test -n "$definition" && printf '%s\n' "$definition" | jq -e '.apiVersion=="v1" and .kind=="Pod" and .metadata.name=="curso-static-a" and .metadata.namespace=="p24a" and (.spec.containers|length)==1 and .spec.containers[0].image=="busybox:1.37.0-musl"' && object=$(kubectl -n p24a get pod curso-static-a-cka-cp1 -o json) && test -n "$object" && printf '%s\n' "$object" | jq --argjson definition "$definition" -e '.metadata.annotations["kubernetes.io/config.source"]=="file" and (.metadata.annotations["kubernetes.io/config.mirror"]|type=="string" and length>0) and .spec.nodeName=="cka-cp1" and .status.phase=="Running" and any(.status.conditions[]?; .type=="Ready" and .status=="True") and (.spec.containers|map({name,image,command:(.command//[]),args:(.args//[])}))==($definition.spec.containers|map({name,image,command:(.command//[]),args:(.args//[])}))'); do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 2; done
echo POSITIVO_c24-a
cat > /etc/kubernetes/manifests/curso-static-a.yaml <<'EOF'
apiVersion: "v1"
kind: "Pod"
metadata:
  name: "curso-static-a"
  namespace: "p24a"
  labels:
    practica: "estatica"
spec:
  terminationGracePeriodSeconds: 1
  containers:
    - name: "app"
      image: "busybox:1.37.0-musl"
      imagePullPolicy: "Never"
      command:
        - "sh"
        - "-c"
        - "exec sleep 3600"
EOF
kubectl -n p24a wait --for=create pod/curso-static-a-cka-cp1 --timeout=120s
kubectl -n p24a wait --for=condition=Ready pod/curso-static-a-cka-cp1 --timeout=180s
deadline=$(($(date +%s)+180)); until (set -eu; test -f /etc/kubernetes/manifests/curso-static-a.yaml && definition=$(kubectl create --dry-run=client -f /etc/kubernetes/manifests/curso-static-a.yaml -o json) && test -n "$definition" && printf '%s\n' "$definition" | jq -e '.apiVersion=="v1" and .kind=="Pod" and .metadata.name=="curso-static-a" and .metadata.namespace=="p24a" and (.spec.containers|length)==1 and .spec.containers[0].image=="busybox:1.37.0-musl"' && object=$(kubectl -n p24a get pod curso-static-a-cka-cp1 -o json) && test -n "$object" && printf '%s\n' "$object" | jq --argjson definition "$definition" -e '.metadata.annotations["kubernetes.io/config.source"]=="file" and (.metadata.annotations["kubernetes.io/config.mirror"]|type=="string" and length>0) and .spec.nodeName=="cka-cp1" and .status.phase=="Running" and any(.status.conditions[]?; .type=="Ready" and .status=="True") and (.spec.containers|map({name,image,command:(.command//[]),args:(.args//[])}))==($definition.spec.containers|map({name,image,command:(.command//[]),args:(.args//[])}))'); do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 2; done
echo EQUIVALENTE_c24-a
rm /etc/kubernetes/manifests/curso-static-a.yaml
if (set -eu; test -f /etc/kubernetes/manifests/curso-static-a.yaml && definition=$(kubectl create --dry-run=client -f /etc/kubernetes/manifests/curso-static-a.yaml -o json) && test -n "$definition" && printf '%s\n' "$definition" | jq -e '.apiVersion=="v1" and .kind=="Pod" and .metadata.name=="curso-static-a" and .metadata.namespace=="p24a" and (.spec.containers|length)==1 and .spec.containers[0].image=="busybox:1.37.0-musl"' && object=$(kubectl -n p24a get pod curso-static-a-cka-cp1 -o json) && test -n "$object" && printf '%s\n' "$object" | jq --argjson definition "$definition" -e '.metadata.annotations["kubernetes.io/config.source"]=="file" and (.metadata.annotations["kubernetes.io/config.mirror"]|type=="string" and length>0) and .spec.nodeName=="cka-cp1" and .status.phase=="Running" and any(.status.conditions[]?; .type=="Ready" and .status=="True") and (.spec.containers|map({name,image,command:(.command//[]),args:(.args//[])}))==($definition.spec.containers|map({name,image,command:(.command//[]),args:(.args//[])}))'); then echo ERROR_ACEPTO_SIN_MANIFIESTO; exit 1; fi
echo NEGATIVO_c24-a
rm -f /etc/kubernetes/manifests/curso-static-a.yaml
kubectl -n p24a wait --for=delete pod/curso-static-a-cka-cp1 --timeout=120s
kubectl delete namespace p24a --wait=true --timeout=120s
fi
if test "${1:-all}" = all || test "${1:-all}" = c24-b; then
echo INICIO_c24-b
kubectl get --raw=/readyz --request-timeout=20s
grep -Eq '^staticPodPath: */etc/kubernetes/manifests *$' /var/lib/kubelet/config.yaml
test ! -e /etc/kubernetes/manifests/curso-static-b.yaml && test -z "$(kubectl get namespace p24b --ignore-not-found -o name)"
kubectl create namespace p24b
cat > /etc/kubernetes/manifests/curso-static-b.yaml <<'EOF'
apiVersion: "v1"
kind: "Pod"
metadata:
  name: "curso-static-b"
  namespace: "p24b"
spec:
  terminationGracePeriodSeconds: 1
  containers:
    - name: "app"
      image: "busybox:1.37.0-musl"
      imagePullPolicy: "Never"
      command:
        - "sh"
        - "-c"
        - "exit 1"
EOF
kubectl -n p24b wait --for=create pod/curso-static-b-cka-cp1 --timeout=120s
kubectl -n p24b wait --for=jsonpath='{.status.containerStatuses[0].lastState.terminated.exitCode}'=1 pod/curso-static-b-cka-cp1 --timeout=180s
if (set -eu; test -f /etc/kubernetes/manifests/curso-static-b.yaml && definition=$(kubectl create --dry-run=client -f /etc/kubernetes/manifests/curso-static-b.yaml -o json) && test -n "$definition" && printf '%s\n' "$definition" | jq -e '.apiVersion=="v1" and .kind=="Pod" and .metadata.name=="curso-static-b" and .metadata.namespace=="p24b" and (.spec.containers|length)==1 and .spec.containers[0].image=="busybox:1.37.0-musl"' && object=$(kubectl -n p24b get pod curso-static-b-cka-cp1 -o json) && test -n "$object" && printf '%s\n' "$object" | jq --argjson definition "$definition" -e '.metadata.annotations["kubernetes.io/config.source"]=="file" and (.metadata.annotations["kubernetes.io/config.mirror"]|type=="string" and length>0) and .spec.nodeName=="cka-cp1" and .status.phase=="Running" and any(.status.conditions[]?; .type=="Ready" and .status=="True") and (.spec.containers|map({name,image,command:(.command//[]),args:(.args//[])}))==($definition.spec.containers|map({name,image,command:(.command//[]),args:(.args//[])}))'); then echo ERROR_ACEPTO_SIN_RESOLVER; exit 1; fi
kubectl -n p24b logs curso-static-b-cka-cp1 --previous
journalctl -u kubelet -n 20 --no-pager
cat > /etc/kubernetes/manifests/curso-static-b.yaml <<'EOF'
apiVersion: "v1"
kind: "Pod"
metadata:
  name: "curso-static-b"
  namespace: "p24b"
spec:
  terminationGracePeriodSeconds: 1
  containers:
    - name: "app"
      image: "busybox:1.37.0-musl"
      imagePullPolicy: "Never"
      command:
        - "sleep"
        - "3600"
EOF
kubectl -n p24b wait --for=create pod/curso-static-b-cka-cp1 --timeout=120s
kubectl -n p24b wait --for=condition=Ready pod/curso-static-b-cka-cp1 --timeout=180s
kubectl -n p24b delete pod curso-static-b-cka-cp1 --wait=false
kubectl -n p24b wait --for=create pod/curso-static-b-cka-cp1 --timeout=120s
kubectl -n p24b wait --for=condition=Ready pod/curso-static-b-cka-cp1 --timeout=180s
deadline=$(($(date +%s)+180)); until (set -eu; test -f /etc/kubernetes/manifests/curso-static-b.yaml && definition=$(kubectl create --dry-run=client -f /etc/kubernetes/manifests/curso-static-b.yaml -o json) && test -n "$definition" && printf '%s\n' "$definition" | jq -e '.apiVersion=="v1" and .kind=="Pod" and .metadata.name=="curso-static-b" and .metadata.namespace=="p24b" and (.spec.containers|length)==1 and .spec.containers[0].image=="busybox:1.37.0-musl"' && object=$(kubectl -n p24b get pod curso-static-b-cka-cp1 -o json) && test -n "$object" && printf '%s\n' "$object" | jq --argjson definition "$definition" -e '.metadata.annotations["kubernetes.io/config.source"]=="file" and (.metadata.annotations["kubernetes.io/config.mirror"]|type=="string" and length>0) and .spec.nodeName=="cka-cp1" and .status.phase=="Running" and any(.status.conditions[]?; .type=="Ready" and .status=="True") and (.spec.containers|map({name,image,command:(.command//[]),args:(.args//[])}))==($definition.spec.containers|map({name,image,command:(.command//[]),args:(.args//[])}))'); do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 2; done
echo POSITIVO_c24-b
old=$(kubectl -n p24b get pod curso-static-b-cka-cp1 -o jsonpath='{.metadata.uid}')
kubectl -n p24b delete pod curso-static-b-cka-cp1 --wait=false
deadline=$(($(date +%s)+120)); while :; do current=$(kubectl -n p24b get pod curso-static-b-cka-cp1 -o jsonpath='{.metadata.uid}' 2>/dev/null || true); if test -n "$current" && test "$current" != "$old"; then break; fi; test "$(date +%s)" -lt "$deadline" || exit 1; sleep 2; done
kubectl -n p24b wait --for=condition=Ready pod/curso-static-b-cka-cp1 --timeout=120s
test -f /etc/kubernetes/manifests/curso-static-b.yaml && definition=$(kubectl create --dry-run=client -f /etc/kubernetes/manifests/curso-static-b.yaml -o json) && test -n "$definition" && printf '%s\n' "$definition" | jq -e '.apiVersion=="v1" and .kind=="Pod" and .metadata.name=="curso-static-b" and .metadata.namespace=="p24b" and (.spec.containers|length)==1 and .spec.containers[0].image=="busybox:1.37.0-musl"' && object=$(kubectl -n p24b get pod curso-static-b-cka-cp1 -o json) && test -n "$object" && printf '%s\n' "$object" | jq --argjson definition "$definition" -e '.metadata.annotations["kubernetes.io/config.source"]=="file" and (.metadata.annotations["kubernetes.io/config.mirror"]|type=="string" and length>0) and .spec.nodeName=="cka-cp1" and .status.phase=="Running" and any(.status.conditions[]?; .type=="Ready" and .status=="True") and (.spec.containers|map({name,image,command:(.command//[]),args:(.args//[])}))==($definition.spec.containers|map({name,image,command:(.command//[]),args:(.args//[])}))'
echo MIRROR_RECREADO_c24-b
rm /etc/kubernetes/manifests/curso-static-b.yaml
if (set -eu; test -f /etc/kubernetes/manifests/curso-static-b.yaml && definition=$(kubectl create --dry-run=client -f /etc/kubernetes/manifests/curso-static-b.yaml -o json) && test -n "$definition" && printf '%s\n' "$definition" | jq -e '.apiVersion=="v1" and .kind=="Pod" and .metadata.name=="curso-static-b" and .metadata.namespace=="p24b" and (.spec.containers|length)==1 and .spec.containers[0].image=="busybox:1.37.0-musl"' && object=$(kubectl -n p24b get pod curso-static-b-cka-cp1 -o json) && test -n "$object" && printf '%s\n' "$object" | jq --argjson definition "$definition" -e '.metadata.annotations["kubernetes.io/config.source"]=="file" and (.metadata.annotations["kubernetes.io/config.mirror"]|type=="string" and length>0) and .spec.nodeName=="cka-cp1" and .status.phase=="Running" and any(.status.conditions[]?; .type=="Ready" and .status=="True") and (.spec.containers|map({name,image,command:(.command//[]),args:(.args//[])}))==($definition.spec.containers|map({name,image,command:(.command//[]),args:(.args//[])}))'); then echo ERROR_ACEPTO_SIN_MANIFIESTO; exit 1; fi
echo NEGATIVO_c24-b
rm -f /etc/kubernetes/manifests/curso-static-b.yaml
kubectl -n p24b wait --for=delete pod/curso-static-b-cka-cp1 --timeout=120s
kubectl delete namespace p24b --wait=true --timeout=120s
fi
kubectl get --raw=/readyz --request-timeout=20s
echo SUITE_STATIC_PODS_OK
