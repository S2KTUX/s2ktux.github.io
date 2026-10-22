#!/bin/sh
set -eu
echo PRUEBA_SCHEDULING_RED_REAL
case "${1:-all}" in all|equivalencias|c19-a|c19-b|c19-c|c20-a|c20-b|c21-a|c21-b|c21-c|c22-a|c22-b) ;; *) exit 2;; esac
if test "${1:-all}" = all || test "${1:-all}" = c19-a; then
echo INICIO_c19-a
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p19a --ignore-not-found -o name)"
kubectl create namespace p19a
kubectl -n p19a wait --for=create serviceaccount/default --timeout=90s
test -z "$(kubectl get node cka-w1 -o json | jq -r '.metadata.labels["p19a.s2ktux.local/disco"] // ""')"
kubectl label node cka-w1 p19a.s2ktux.local/disco=ssd
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"name":"seleccionado","namespace":"p19a","labels":{"app":"seleccionado"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sleep","3600"]}],"nodeSelector":{"p19a.s2ktux.local/disco":"ssd"}}}' | kubectl apply -f -
kubectl -n p19a wait --for=condition=Ready pod/seleccionado --timeout=180s
kubectl -n p19a get pods -o wide
true
object=$(kubectl -n default get node cka-w1 -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.metadata.labels["p19a.s2ktux.local/disco"]=="ssd"' && object=$(kubectl -n p19a get pod seleccionado -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.nodeName=="cka-w1" and .spec.containers[0].image=="busybox:1.37.0-musl" and (.spec.nodeSelector["p19a.s2ktux.local/disco"]=="ssd")'
echo POSITIVO_c19-a
kubectl -n p19a delete pod seleccionado
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n default get node cka-w1 -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.metadata.labels["p19a.s2ktux.local/disco"]=="ssd"' && object=$(kubectl -n p19a get pod seleccionado -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.nodeName=="cka-w1" and .spec.containers[0].image=="busybox:1.37.0-musl" and (.spec.nodeSelector["p19a.s2ktux.local/disco"]=="ssd")'); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c19-a
kubectl delete namespace p19a --ignore-not-found --wait=true --timeout=120s
kubectl label node cka-w1 p19a.s2ktux.local/disco-
fi
if test "${1:-all}" = all || test "${1:-all}" = c19-b; then
echo INICIO_c19-b
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p19b --ignore-not-found -o name)"
kubectl create namespace p19b
kubectl -n p19b wait --for=create serviceaccount/default --timeout=90s
test -z "$(kubectl get node cka-w1 -o json | jq -r '.metadata.labels["p19b.s2ktux.local/disco"] // ""')"
kubectl label node cka-w1 p19b.s2ktux.local/disco=ssd
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"name":"flexible","namespace":"p19b","labels":{"app":"flexible"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sleep","3600"]}],"affinity":{"nodeAffinity":{"requiredDuringSchedulingIgnoredDuringExecution":{"nodeSelectorTerms":[{"matchExpressions":[{"key":"p19b.s2ktux.local/disco","operator":"In","values":["ssd","nvme"]}]}]}}}}}' | kubectl apply -f -
kubectl -n p19b wait --for=condition=Ready pod/flexible --timeout=180s
kubectl -n p19b get pods -o wide
true
object=$(kubectl -n p19b get pod flexible -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.nodeName=="cka-w1" and .spec.containers[0].image=="busybox:1.37.0-musl" and ((.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms // []) as $terms | ($terms|length)>0 and all($terms[]; (.matchFields // []|length)==0 and (.matchExpressions|length)==1 and .matchExpressions[0].key=="p19b.s2ktux.local/disco" and .matchExpressions[0].operator=="In" and (.matchExpressions[0].values|length)>0) and ([$terms[].matchExpressions[0].values[]]|unique)==["nvme","ssd"])'
echo POSITIVO_c19-b
kubectl -n p19b delete pod flexible
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p19b get pod flexible -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.nodeName=="cka-w1" and .spec.containers[0].image=="busybox:1.37.0-musl" and ((.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms // []) as $terms | ($terms|length)>0 and all($terms[]; (.matchFields // []|length)==0 and (.matchExpressions|length)==1 and .matchExpressions[0].key=="p19b.s2ktux.local/disco" and .matchExpressions[0].operator=="In" and (.matchExpressions[0].values|length)>0) and ([$terms[].matchExpressions[0].values[]]|unique)==["nvme","ssd"])'); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c19-b
kubectl delete namespace p19b --ignore-not-found --wait=true --timeout=120s
kubectl label node cka-w1 p19b.s2ktux.local/disco-
fi
if test "${1:-all}" = all || test "${1:-all}" = c19-c; then
echo INICIO_c19-c
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p19c --ignore-not-found -o name)"
kubectl create namespace p19c
kubectl -n p19c wait --for=create serviceaccount/default --timeout=90s
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"name":"manual","namespace":"p19c","labels":{"app":"manual"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sleep","3600"]}],"nodeName":"cka-w1"}}' | kubectl apply -f -
kubectl -n p19c wait --for=condition=Ready pod/manual --timeout=180s
kubectl -n p19c get pods -o wide
true
object=$(kubectl -n p19c get pod manual -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.nodeName=="cka-w1" and .spec.containers[0].image=="busybox:1.37.0-musl" and ((.spec.nodeSelector // {}|length)==0 and (.spec.affinity // {}|length)==0 and (.spec.schedulerName // "default-scheduler")=="default-scheduler")'
echo POSITIVO_c19-c
kubectl -n p19c delete pod manual
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p19c get pod manual -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.nodeName=="cka-w1" and .spec.containers[0].image=="busybox:1.37.0-musl" and ((.spec.nodeSelector // {}|length)==0 and (.spec.affinity // {}|length)==0 and (.spec.schedulerName // "default-scheduler")=="default-scheduler")'); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c19-c
kubectl delete namespace p19c --ignore-not-found --wait=true --timeout=120s
fi
if test "${1:-all}" = all || test "${1:-all}" = c20-a; then
echo INICIO_c20-a
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p20a --ignore-not-found -o name)"
kubectl create namespace p20a
kubectl -n p20a wait --for=create serviceaccount/default --timeout=90s
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"name":"permitido","namespace":"p20a","labels":{"app":"permitido"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sleep","3600"]}],"nodeSelector":{"kubernetes.io/hostname":"cka-cp1"},"tolerations":[{"key":"node-role.kubernetes.io/control-plane","operator":"Exists","effect":"NoSchedule"}]}}' | kubectl apply -f -
kubectl -n p20a wait --for=condition=Ready pod/permitido --timeout=180s
kubectl -n p20a get pods -o wide
true
object=$(kubectl -n default get node cka-cp1 -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.spec.taints[]?; .key=="node-role.kubernetes.io/control-plane" and .effect=="NoSchedule")' && object=$(kubectl -n p20a get pod permitido -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.nodeName=="cka-cp1" and .spec.nodeSelector["kubernetes.io/hostname"]=="cka-cp1" and any(.spec.tolerations[]?; (.key=="node-role.kubernetes.io/control-plane" or ((.key // "")=="" and .operator=="Exists")) and ((.effect // "")=="" or .effect=="NoSchedule") and (.operator=="Exists" or ((.operator // "Equal")=="Equal" and (.value // "")=="")))'
echo POSITIVO_c20-a
kubectl -n p20a delete pod permitido
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n default get node cka-cp1 -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.spec.taints[]?; .key=="node-role.kubernetes.io/control-plane" and .effect=="NoSchedule")' && object=$(kubectl -n p20a get pod permitido -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.nodeName=="cka-cp1" and .spec.nodeSelector["kubernetes.io/hostname"]=="cka-cp1" and any(.spec.tolerations[]?; (.key=="node-role.kubernetes.io/control-plane" or ((.key // "")=="" and .operator=="Exists")) and ((.effect // "")=="" or .effect=="NoSchedule") and (.operator=="Exists" or ((.operator // "Equal")=="Equal" and (.value // "")=="")))'); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c20-a
kubectl delete namespace p20a --ignore-not-found --wait=true --timeout=120s
fi
if test "${1:-all}" = all || test "${1:-all}" = c20-b; then
echo INICIO_c20-b
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p20b --ignore-not-found -o name)"
kubectl create namespace p20b
kubectl -n p20b wait --for=create serviceaccount/default --timeout=90s
test -z "$(kubectl get node cka-w1 -o json | jq -r '.metadata.labels["p20b.s2ktux.local/equipo"] // ""')"
kubectl -n default get node cka-w1 -o json | jq -e 'all(.spec.taints[]?; .key!="p20b.s2ktux.local/equipo")'
kubectl label node cka-w1 p20b.s2ktux.local/equipo=curso
kubectl taint node cka-w1 p20b.s2ktux.local/equipo=curso:NoSchedule
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"name":"equipo","namespace":"p20b","labels":{"app":"equipo"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sleep","3600"]}],"nodeSelector":{"p20b.s2ktux.local/equipo":"curso"},"tolerations":[{"key":"p20b.s2ktux.local/equipo","operator":"Equal","value":"curso","effect":"NoSchedule"}]}}' | kubectl apply -f -
kubectl -n p20b wait --for=condition=Ready pod/equipo --timeout=180s
kubectl taint node cka-w1 p20b.s2ktux.local/equipo:NoSchedule-
true
object=$(kubectl -n default get node cka-w1 -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.metadata.labels["p20b.s2ktux.local/equipo"]=="curso" and all(.spec.taints[]?; .key!="p20b.s2ktux.local/equipo")' && object=$(kubectl -n p20b get pod equipo -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.nodeName=="cka-w1" and .spec.containers[0].image=="busybox:1.37.0-musl" and (.spec.nodeSelector["p20b.s2ktux.local/equipo"]=="curso" and any(.spec.tolerations[]?; (.key=="p20b.s2ktux.local/equipo" or ((.key // "")=="" and .operator=="Exists")) and ((.effect // "")=="" or .effect=="NoSchedule") and (.operator=="Exists" or ((.operator // "Equal")=="Equal" and .value=="curso"))))'
echo POSITIVO_c20-b
kubectl -n p20b delete pod equipo
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n default get node cka-w1 -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.metadata.labels["p20b.s2ktux.local/equipo"]=="curso" and all(.spec.taints[]?; .key!="p20b.s2ktux.local/equipo")' && object=$(kubectl -n p20b get pod equipo -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.nodeName=="cka-w1" and .spec.containers[0].image=="busybox:1.37.0-musl" and (.spec.nodeSelector["p20b.s2ktux.local/equipo"]=="curso" and any(.spec.tolerations[]?; (.key=="p20b.s2ktux.local/equipo" or ((.key // "")=="" and .operator=="Exists")) and ((.effect // "")=="" or .effect=="NoSchedule") and (.operator=="Exists" or ((.operator // "Equal")=="Equal" and .value=="curso"))))'); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c20-b
kubectl delete namespace p20b --ignore-not-found --wait=true --timeout=120s
kubectl label node cka-w1 p20b.s2ktux.local/equipo-
fi
if test "${1:-all}" = all || test "${1:-all}" = c21-a; then
echo INICIO_c21-a
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p21a --ignore-not-found -o name)"
kubectl create namespace p21a
kubectl -n p21a wait --for=create serviceaccount/default --timeout=90s
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"name":"api","namespace":"p21a","labels":{"app":"api"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sh","-c","mkdir -p /www; echo RED_OK > /www/index.html; httpd -p 80 -h /www; exec httpd -f -p 8080 -h /www"]}]}}' | kubectl apply -f -
printf '%s\n' '{"apiVersion":"v1","kind":"Service","metadata":{"namespace":"p21a","name":"api"},"spec":{"selector":{"app":"api"},"ports":[{"name":"http","port":8080,"targetPort":8080},{"name":"otro","port":80,"targetPort":80}]}}' | kubectl apply -f -
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"namespace":"p21a","name":"frontend","labels":{"app":"frontend"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sleep","3600"]}]}}' | kubectl apply -f -
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"namespace":"p21a","name":"intruso","labels":{"app":"intruso"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sleep","3600"]}]}}' | kubectl apply -f -
kubectl -n p21a wait --for=condition=Ready pods --all --timeout=180s
test "$(kubectl -n p21a exec frontend -- wget -T 3 -qO- http://api.p21a.svc.cluster.local:8080/)" = RED_OK
test "$(kubectl -n p21a exec intruso -- wget -T 3 -qO- http://api.p21a.svc.cluster.local:8080/)" = RED_OK
test "$(kubectl -n p21a exec frontend -- wget -T 3 -qO- http://api.p21a.svc.cluster.local:80/)" = RED_OK
printf '%s\n' '{"apiVersion":"networking.k8s.io/v1","kind":"NetworkPolicy","metadata":{"namespace":"p21a","name":"entrada-api"},"spec":{"podSelector":{"matchLabels":{"app":"api"}},"policyTypes":["Ingress"],"ingress":[{"from":[{"podSelector":{"matchLabels":{"app":"frontend"}}}],"ports":[{"protocol":"TCP","port":8080}]}]}}' | kubectl apply -f -
sleep 3
object=$(kubectl -n p21a get pods api frontend intruso -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==3 and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.containers[0].image=="busybox:1.37.0-musl" and .metadata.labels.app==({"api":"api","frontend":"frontend","intruso":"intruso"}[.metadata.name]))' && object=$(kubectl -n p21a get service api -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.selector.app=="api" and ([.spec.ports[]|[.port,.targetPort]]|sort)==[[80,80],[8080,8080]]' && kubectl -n p21a exec api -- sh -c 'test "$(wget -T 3 -qO- http://127.0.0.1:80/)" = RED_OK && test "$(wget -T 3 -qO- http://127.0.0.1:8080/)" = RED_OK' && object=$(kubectl -n p21a get networkpolicies  -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.items[]; (.spec.podSelector.matchLabels.app=="api" or any(.spec.podSelector.matchExpressions[]?; .key=="app" and .operator=="In" and (.values|unique)==["api"])) and (.spec.policyTypes|index("Ingress"))!=null)' && test "$(kubectl -n p21a exec frontend -- wget -T 3 -qO- http://api.p21a.svc.cluster.local:8080/)" = RED_OK && if kubectl -n p21a exec intruso -- wget -T 3 -qO- http://api.p21a.svc.cluster.local:8080/ >/dev/null 2>&1; then exit 1; fi && if kubectl -n p21a exec frontend -- wget -T 3 -qO- http://api.p21a.svc.cluster.local:80/ >/dev/null 2>&1; then exit 1; fi
echo POSITIVO_c21-a
printf '%s\n' '{"apiVersion":"networking.k8s.io/v1","kind":"NetworkPolicy","metadata":{"namespace":"p21a","name":"entrada-api"},"spec":{"podSelector":{"matchExpressions":[{"key":"app","operator":"In","values":["api"]}]},"policyTypes":["Ingress"],"ingress":[{"from":[{"podSelector":{"matchLabels":{"app":"frontend"}}}],"ports":[{"protocol":"TCP","port":8080}]}]}}' | kubectl apply -f -
object=$(kubectl -n p21a get pods api frontend intruso -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==3 and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.containers[0].image=="busybox:1.37.0-musl" and .metadata.labels.app==({"api":"api","frontend":"frontend","intruso":"intruso"}[.metadata.name]))' && object=$(kubectl -n p21a get service api -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.selector.app=="api" and ([.spec.ports[]|[.port,.targetPort]]|sort)==[[80,80],[8080,8080]]' && kubectl -n p21a exec api -- sh -c 'test "$(wget -T 3 -qO- http://127.0.0.1:80/)" = RED_OK && test "$(wget -T 3 -qO- http://127.0.0.1:8080/)" = RED_OK' && object=$(kubectl -n p21a get networkpolicies  -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.items[]; (.spec.podSelector.matchLabels.app=="api" or any(.spec.podSelector.matchExpressions[]?; .key=="app" and .operator=="In" and (.values|unique)==["api"])) and (.spec.policyTypes|index("Ingress"))!=null)' && test "$(kubectl -n p21a exec frontend -- wget -T 3 -qO- http://api.p21a.svc.cluster.local:8080/)" = RED_OK && if kubectl -n p21a exec intruso -- wget -T 3 -qO- http://api.p21a.svc.cluster.local:8080/ >/dev/null 2>&1; then exit 1; fi && if kubectl -n p21a exec frontend -- wget -T 3 -qO- http://api.p21a.svc.cluster.local:80/ >/dev/null 2>&1; then exit 1; fi
echo EQUIVALENCIA_SELECTOR_RED_OK
kubectl -n p21a delete networkpolicy entrada-api; sleep 3
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p21a get pods api frontend intruso -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==3 and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.containers[0].image=="busybox:1.37.0-musl" and .metadata.labels.app==({"api":"api","frontend":"frontend","intruso":"intruso"}[.metadata.name]))' && object=$(kubectl -n p21a get service api -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.selector.app=="api" and ([.spec.ports[]|[.port,.targetPort]]|sort)==[[80,80],[8080,8080]]' && kubectl -n p21a exec api -- sh -c 'test "$(wget -T 3 -qO- http://127.0.0.1:80/)" = RED_OK && test "$(wget -T 3 -qO- http://127.0.0.1:8080/)" = RED_OK' && object=$(kubectl -n p21a get networkpolicies  -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.items[]; (.spec.podSelector.matchLabels.app=="api" or any(.spec.podSelector.matchExpressions[]?; .key=="app" and .operator=="In" and (.values|unique)==["api"])) and (.spec.policyTypes|index("Ingress"))!=null)' && test "$(kubectl -n p21a exec frontend -- wget -T 3 -qO- http://api.p21a.svc.cluster.local:8080/)" = RED_OK && if kubectl -n p21a exec intruso -- wget -T 3 -qO- http://api.p21a.svc.cluster.local:8080/ >/dev/null 2>&1; then exit 1; fi && if kubectl -n p21a exec frontend -- wget -T 3 -qO- http://api.p21a.svc.cluster.local:80/ >/dev/null 2>&1; then exit 1; fi); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c21-a
object=$(kubectl -n p21a get pods api frontend intruso -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==3 and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.containers[0].image=="busybox:1.37.0-musl" and .metadata.labels.app==({"api":"api","frontend":"frontend","intruso":"intruso"}[.metadata.name]))' && object=$(kubectl -n p21a get service api -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.selector.app=="api" and ([.spec.ports[]|[.port,.targetPort]]|sort)==[[80,80],[8080,8080]]' && kubectl -n p21a exec api -- sh -c 'test "$(wget -T 3 -qO- http://127.0.0.1:80/)" = RED_OK && test "$(wget -T 3 -qO- http://127.0.0.1:8080/)" = RED_OK'
kubectl -n p21a delete pod intruso
if (set -eu; object=$(kubectl -n p21a get pods api frontend intruso -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==3 and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.containers[0].image=="busybox:1.37.0-musl" and .metadata.labels.app==({"api":"api","frontend":"frontend","intruso":"intruso"}[.metadata.name]))' && object=$(kubectl -n p21a get service api -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.selector.app=="api" and ([.spec.ports[]|[.port,.targetPort]]|sort)==[[80,80],[8080,8080]]' && kubectl -n p21a exec api -- sh -c 'test "$(wget -T 3 -qO- http://127.0.0.1:80/)" = RED_OK && test "$(wget -T 3 -qO- http://127.0.0.1:8080/)" = RED_OK'); then echo ERROR_ACEPTO_ESCENARIO_ROTO; exit 1; fi
echo GUARDA_ESCENARIO_c21-a
kubectl delete namespace p21a --ignore-not-found --wait=true --timeout=120s
fi
if test "${1:-all}" = all || test "${1:-all}" = c21-b; then
echo INICIO_c21-b
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p21b --ignore-not-found -o name)"
kubectl create namespace p21b
kubectl -n p21b wait --for=create serviceaccount/default --timeout=90s
test -z "$(kubectl get namespace p21b-clientes --ignore-not-found -o name)"
kubectl create namespace p21b-clientes
kubectl -n p21b-clientes wait --for=create serviceaccount/default --timeout=90s
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"name":"api","namespace":"p21b","labels":{"app":"api"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sh","-c","mkdir -p /www; echo RED_OK > /www/index.html; httpd -p 80 -h /www; exec httpd -f -p 8080 -h /www"]}]}}' | kubectl apply -f -
printf '%s\n' '{"apiVersion":"v1","kind":"Service","metadata":{"namespace":"p21b","name":"api"},"spec":{"selector":{"app":"api"},"ports":[{"name":"http","port":8080,"targetPort":8080},{"name":"otro","port":80,"targetPort":80}]}}' | kubectl apply -f -
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"namespace":"p21b","name":"fuera","labels":{"app":"frontend"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sleep","3600"]}]}}' | kubectl apply -f -
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"namespace":"p21b-clientes","name":"frontend","labels":{"app":"frontend"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sleep","3600"]}]}}' | kubectl apply -f -
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"namespace":"p21b-clientes","name":"intruso","labels":{"app":"intruso"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sleep","3600"]}]}}' | kubectl apply -f -
kubectl -n p21b wait --for=condition=Ready pods --all --timeout=180s
kubectl -n p21b-clientes wait --for=condition=Ready pods --all --timeout=180s
test "$(kubectl -n p21b-clientes exec frontend -- wget -T 3 -qO- http://api.p21b.svc.cluster.local:8080/)" = RED_OK
test "$(kubectl -n p21b-clientes exec intruso -- wget -T 3 -qO- http://api.p21b.svc.cluster.local:8080/)" = RED_OK
test "$(kubectl -n p21b exec fuera -- wget -T 3 -qO- http://api.p21b.svc.cluster.local:8080/)" = RED_OK
test "$(kubectl -n p21b-clientes exec frontend -- wget -T 3 -qO- http://api.p21b.svc.cluster.local:80/)" = RED_OK
printf '%s\n' '{"apiVersion":"networking.k8s.io/v1","kind":"NetworkPolicy","metadata":{"namespace":"p21b","name":"entrada-api"},"spec":{"podSelector":{"matchLabels":{"app":"api"}},"policyTypes":["Ingress"],"ingress":[{"from":[{"namespaceSelector":{"matchLabels":{"kubernetes.io/metadata.name":"p21b-clientes"}},"podSelector":{"matchLabels":{"app":"frontend"}}}],"ports":[{"protocol":"TCP","port":8080}]}]}}' | kubectl apply -f -
sleep 3
object=$(kubectl -n p21b get pods api fuera -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==2 and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.containers[0].image=="busybox:1.37.0-musl" and .metadata.labels.app==({"api":"api","fuera":"frontend"}[.metadata.name]))' && object=$(kubectl -n p21b-clientes get pods frontend intruso -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==2 and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.containers[0].image=="busybox:1.37.0-musl" and .metadata.labels.app==({"frontend":"frontend","intruso":"intruso"}[.metadata.name]))' && object=$(kubectl -n p21b get service api -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.selector.app=="api" and ([.spec.ports[]|[.port,.targetPort]]|sort)==[[80,80],[8080,8080]]' && kubectl -n p21b exec api -- sh -c 'test "$(wget -T 3 -qO- http://127.0.0.1:80/)" = RED_OK && test "$(wget -T 3 -qO- http://127.0.0.1:8080/)" = RED_OK' && object=$(kubectl -n p21b get networkpolicies  -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.items[]; (.spec.podSelector.matchLabels.app=="api" or any(.spec.podSelector.matchExpressions[]?; .key=="app" and .operator=="In" and (.values|unique)==["api"])) and (.spec.policyTypes|index("Ingress"))!=null)' && test "$(kubectl -n p21b-clientes exec frontend -- wget -T 3 -qO- http://api.p21b.svc.cluster.local:8080/)" = RED_OK && if kubectl -n p21b-clientes exec intruso -- wget -T 3 -qO- http://api.p21b.svc.cluster.local:8080/ >/dev/null 2>&1; then exit 1; fi && if kubectl -n p21b exec fuera -- wget -T 3 -qO- http://api.p21b.svc.cluster.local:8080/ >/dev/null 2>&1; then exit 1; fi && if kubectl -n p21b-clientes exec frontend -- wget -T 3 -qO- http://api.p21b.svc.cluster.local:80/ >/dev/null 2>&1; then exit 1; fi
echo POSITIVO_c21-b
kubectl -n p21b delete networkpolicy entrada-api; sleep 3
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p21b get pods api fuera -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==2 and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.containers[0].image=="busybox:1.37.0-musl" and .metadata.labels.app==({"api":"api","fuera":"frontend"}[.metadata.name]))' && object=$(kubectl -n p21b-clientes get pods frontend intruso -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==2 and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.containers[0].image=="busybox:1.37.0-musl" and .metadata.labels.app==({"frontend":"frontend","intruso":"intruso"}[.metadata.name]))' && object=$(kubectl -n p21b get service api -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.selector.app=="api" and ([.spec.ports[]|[.port,.targetPort]]|sort)==[[80,80],[8080,8080]]' && kubectl -n p21b exec api -- sh -c 'test "$(wget -T 3 -qO- http://127.0.0.1:80/)" = RED_OK && test "$(wget -T 3 -qO- http://127.0.0.1:8080/)" = RED_OK' && object=$(kubectl -n p21b get networkpolicies  -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.items[]; (.spec.podSelector.matchLabels.app=="api" or any(.spec.podSelector.matchExpressions[]?; .key=="app" and .operator=="In" and (.values|unique)==["api"])) and (.spec.policyTypes|index("Ingress"))!=null)' && test "$(kubectl -n p21b-clientes exec frontend -- wget -T 3 -qO- http://api.p21b.svc.cluster.local:8080/)" = RED_OK && if kubectl -n p21b-clientes exec intruso -- wget -T 3 -qO- http://api.p21b.svc.cluster.local:8080/ >/dev/null 2>&1; then exit 1; fi && if kubectl -n p21b exec fuera -- wget -T 3 -qO- http://api.p21b.svc.cluster.local:8080/ >/dev/null 2>&1; then exit 1; fi && if kubectl -n p21b-clientes exec frontend -- wget -T 3 -qO- http://api.p21b.svc.cluster.local:80/ >/dev/null 2>&1; then exit 1; fi); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c21-b
object=$(kubectl -n p21b get pods api fuera -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==2 and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.containers[0].image=="busybox:1.37.0-musl" and .metadata.labels.app==({"api":"api","fuera":"frontend"}[.metadata.name]))' && object=$(kubectl -n p21b-clientes get pods frontend intruso -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==2 and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.containers[0].image=="busybox:1.37.0-musl" and .metadata.labels.app==({"frontend":"frontend","intruso":"intruso"}[.metadata.name]))' && object=$(kubectl -n p21b get service api -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.selector.app=="api" and ([.spec.ports[]|[.port,.targetPort]]|sort)==[[80,80],[8080,8080]]' && kubectl -n p21b exec api -- sh -c 'test "$(wget -T 3 -qO- http://127.0.0.1:80/)" = RED_OK && test "$(wget -T 3 -qO- http://127.0.0.1:8080/)" = RED_OK'
kubectl -n p21b patch service api --type=json -p '[{"op":"remove","path":"/spec/ports/1"}]'
if (set -eu; object=$(kubectl -n p21b get pods api fuera -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==2 and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.containers[0].image=="busybox:1.37.0-musl" and .metadata.labels.app==({"api":"api","fuera":"frontend"}[.metadata.name]))' && object=$(kubectl -n p21b-clientes get pods frontend intruso -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==2 and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.containers[0].image=="busybox:1.37.0-musl" and .metadata.labels.app==({"frontend":"frontend","intruso":"intruso"}[.metadata.name]))' && object=$(kubectl -n p21b get service api -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.selector.app=="api" and ([.spec.ports[]|[.port,.targetPort]]|sort)==[[80,80],[8080,8080]]' && kubectl -n p21b exec api -- sh -c 'test "$(wget -T 3 -qO- http://127.0.0.1:80/)" = RED_OK && test "$(wget -T 3 -qO- http://127.0.0.1:8080/)" = RED_OK'); then echo ERROR_ACEPTO_ESCENARIO_ROTO; exit 1; fi
echo GUARDA_ESCENARIO_c21-b
kubectl delete namespace p21b --ignore-not-found --wait=true --timeout=120s
kubectl delete namespace p21b-clientes --ignore-not-found --wait=true --timeout=120s
fi
if test "${1:-all}" = all || test "${1:-all}" = c21-c; then
echo INICIO_c21-c
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p21c --ignore-not-found -o name)"
kubectl create namespace p21c
kubectl -n p21c wait --for=create serviceaccount/default --timeout=90s
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"name":"api","namespace":"p21c","labels":{"app":"api"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sh","-c","mkdir -p /www; echo RED_OK > /www/index.html; httpd -p 80 -h /www; exec httpd -f -p 8080 -h /www"]}]}}' | kubectl apply -f -
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"namespace":"p21c","name":"ajeno","labels":{"app":"ajeno"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sh","-c","mkdir -p /www; echo RED_OK > /www/index.html; httpd -p 80 -h /www; exec httpd -f -p 8080 -h /www"]}]}}' | kubectl apply -f -
printf '%s\n' '{"apiVersion":"v1","kind":"Service","metadata":{"namespace":"p21c","name":"api"},"spec":{"selector":{"app":"api"},"ports":[{"name":"http","port":8080,"targetPort":8080},{"name":"otro","port":80,"targetPort":80}]}}' | kubectl apply -f -
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"namespace":"p21c","name":"cliente","labels":{"app":"cliente"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sleep","3600"]}]}}' | kubectl apply -f -
kubectl -n p21c wait --for=condition=Ready pods --all --timeout=180s
test "$(kubectl -n p21c exec cliente -- wget -T 3 -qO- http://api.p21c.svc.cluster.local:8080/)" = RED_OK
test "$(kubectl -n p21c exec cliente -- wget -T 3 -qO- http://$(kubectl -n p21c get pod ajeno -o jsonpath='{.status.podIP}'):8080/)" = RED_OK
printf '%s\n' '{"apiVersion":"networking.k8s.io/v1","kind":"NetworkPolicy","metadata":{"namespace":"p21c","name":"bloqueo"},"spec":{"podSelector":{"matchLabels":{"app":"cliente"}},"policyTypes":["Egress"],"egress":[]}}' | kubectl apply -f -
printf '%s\n' '{"apiVersion":"networking.k8s.io/v1","kind":"NetworkPolicy","metadata":{"namespace":"p21c","name":"salida-cliente"},"spec":{"podSelector":{"matchLabels":{"app":"cliente"}},"policyTypes":["Egress"],"egress":[{"to":[{"namespaceSelector":{"matchLabels":{"kubernetes.io/metadata.name":"kube-system"}},"podSelector":{"matchLabels":{"k8s-app":"kube-dns"}}}],"ports":[{"protocol":"UDP","port":53},{"protocol":"TCP","port":53}]},{"to":[{"podSelector":{"matchLabels":{"app":"api"}}}],"ports":[{"protocol":"TCP","port":8080}]}]}}' | kubectl apply -f -
sleep 3
object=$(kubectl -n p21c get pods api ajeno cliente -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==3 and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.containers[0].image=="busybox:1.37.0-musl" and .metadata.labels.app==({"api":"api","ajeno":"ajeno","cliente":"cliente"}[.metadata.name]))' && object=$(kubectl -n p21c get service api -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.selector.app=="api" and ([.spec.ports[]|[.port,.targetPort]]|sort)==[[80,80],[8080,8080]]' && kubectl -n p21c exec api -- sh -c 'test "$(wget -T 3 -qO- http://127.0.0.1:80/)" = RED_OK && test "$(wget -T 3 -qO- http://127.0.0.1:8080/)" = RED_OK' && test "$(kubectl -n p21c exec ajeno -- wget -T 3 -qO- http://127.0.0.1:8080/)" = RED_OK && object=$(kubectl -n p21c get networkpolicy bloqueo -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.podSelector.matchLabels.app=="cliente" and (.spec.egress // []|length)==0 and (.spec.policyTypes|index("Egress"))!=null' && kubectl -n p21c exec cliente -- nslookup api.p21c.svc.cluster.local >/dev/null && test "$(kubectl -n p21c exec cliente -- wget -T 3 -qO- http://api.p21c.svc.cluster.local:8080/)" = RED_OK && if kubectl -n p21c exec cliente -- wget -T 3 -qO- http://$(kubectl -n p21c get pod ajeno -o jsonpath='{.status.podIP}'):8080/ >/dev/null 2>&1; then exit 1; fi && if kubectl -n p21c exec cliente -- wget -T 3 -qO- http://api.p21c.svc.cluster.local:80/ >/dev/null 2>&1; then exit 1; fi
echo POSITIVO_c21-c
kubectl -n p21c delete networkpolicy salida-cliente; sleep 3
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p21c get pods api ajeno cliente -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==3 and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.containers[0].image=="busybox:1.37.0-musl" and .metadata.labels.app==({"api":"api","ajeno":"ajeno","cliente":"cliente"}[.metadata.name]))' && object=$(kubectl -n p21c get service api -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.selector.app=="api" and ([.spec.ports[]|[.port,.targetPort]]|sort)==[[80,80],[8080,8080]]' && kubectl -n p21c exec api -- sh -c 'test "$(wget -T 3 -qO- http://127.0.0.1:80/)" = RED_OK && test "$(wget -T 3 -qO- http://127.0.0.1:8080/)" = RED_OK' && test "$(kubectl -n p21c exec ajeno -- wget -T 3 -qO- http://127.0.0.1:8080/)" = RED_OK && object=$(kubectl -n p21c get networkpolicy bloqueo -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.podSelector.matchLabels.app=="cliente" and (.spec.egress // []|length)==0 and (.spec.policyTypes|index("Egress"))!=null' && kubectl -n p21c exec cliente -- nslookup api.p21c.svc.cluster.local >/dev/null && test "$(kubectl -n p21c exec cliente -- wget -T 3 -qO- http://api.p21c.svc.cluster.local:8080/)" = RED_OK && if kubectl -n p21c exec cliente -- wget -T 3 -qO- http://$(kubectl -n p21c get pod ajeno -o jsonpath='{.status.podIP}'):8080/ >/dev/null 2>&1; then exit 1; fi && if kubectl -n p21c exec cliente -- wget -T 3 -qO- http://api.p21c.svc.cluster.local:80/ >/dev/null 2>&1; then exit 1; fi); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c21-c
object=$(kubectl -n p21c get pods api ajeno cliente -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==3 and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.containers[0].image=="busybox:1.37.0-musl" and .metadata.labels.app==({"api":"api","ajeno":"ajeno","cliente":"cliente"}[.metadata.name]))' && object=$(kubectl -n p21c get service api -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.selector.app=="api" and ([.spec.ports[]|[.port,.targetPort]]|sort)==[[80,80],[8080,8080]]' && kubectl -n p21c exec api -- sh -c 'test "$(wget -T 3 -qO- http://127.0.0.1:80/)" = RED_OK && test "$(wget -T 3 -qO- http://127.0.0.1:8080/)" = RED_OK' && test "$(kubectl -n p21c exec ajeno -- wget -T 3 -qO- http://127.0.0.1:8080/)" = RED_OK
kubectl -n p21c delete pod ajeno
if (set -eu; object=$(kubectl -n p21c get pods api ajeno cliente -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==3 and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.containers[0].image=="busybox:1.37.0-musl" and .metadata.labels.app==({"api":"api","ajeno":"ajeno","cliente":"cliente"}[.metadata.name]))' && object=$(kubectl -n p21c get service api -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.selector.app=="api" and ([.spec.ports[]|[.port,.targetPort]]|sort)==[[80,80],[8080,8080]]' && kubectl -n p21c exec api -- sh -c 'test "$(wget -T 3 -qO- http://127.0.0.1:80/)" = RED_OK && test "$(wget -T 3 -qO- http://127.0.0.1:8080/)" = RED_OK' && test "$(kubectl -n p21c exec ajeno -- wget -T 3 -qO- http://127.0.0.1:8080/)" = RED_OK); then echo ERROR_ACEPTO_ESCENARIO_ROTO; exit 1; fi
echo GUARDA_ESCENARIO_c21-c
kubectl delete namespace p21c --ignore-not-found --wait=true --timeout=120s
fi
if test "${1:-all}" = all || test "${1:-all}" = c22-a; then
echo INICIO_c22-a
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p22a --ignore-not-found -o name)"
kubectl create namespace p22a
kubectl -n p22a wait --for=create serviceaccount/default --timeout=90s
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"name":"cliente","namespace":"p22a","labels":{"app":"cliente"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sleep","3600"]}]}}' | kubectl apply -f -
kubectl -n p22a wait --for=condition=Ready pod/cliente --timeout=180s
kubectl -n p22a exec cliente -- nslookup kubernetes.default.svc.cluster.local
kubectl -n p22a exec cliente -- cat /etc/resolv.conf
kubectl -n kube-system get pods -l k8s-app=kube-dns
true
object=$(kubectl -n p22a get pod cliente -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.dnsPolicy=="ClusterFirst"' && kubectl -n p22a exec cliente -- nslookup kubernetes.default.svc.cluster.local >/dev/null
echo POSITIVO_c22-a
kubectl -n p22a delete pod cliente
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p22a get pod cliente -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.status.conditions[]?; .type=="Ready" and .status=="True") and .spec.dnsPolicy=="ClusterFirst"' && kubectl -n p22a exec cliente -- nslookup kubernetes.default.svc.cluster.local >/dev/null); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c22-a
kubectl delete namespace p22a --ignore-not-found --wait=true --timeout=120s
fi
if test "${1:-all}" = all || test "${1:-all}" = c22-b; then
echo INICIO_c22-b
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p22b --ignore-not-found -o name)"
kubectl create namespace p22b
kubectl -n p22b wait --for=create serviceaccount/default --timeout=90s
test -z "$(kubectl get namespace p22b-servidor --ignore-not-found -o name)"
kubectl create namespace p22b-servidor
kubectl -n p22b-servidor wait --for=create serviceaccount/default --timeout=90s
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"name":"web","namespace":"p22b-servidor","labels":{"app":"web"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sh","-c","mkdir -p /www; echo DNS_OK > /www/index.html; exec httpd -f -p 8080 -h /www"]}]}}' | kubectl apply -f -
kubectl -n p22b-servidor wait --for=condition=Ready pod/web --timeout=180s
printf '%s\n' '{"apiVersion":"v1","kind":"Service","metadata":{"namespace":"p22b-servidor","name":"web"},"spec":{"selector":{"app":"web"},"ports":[{"port":80,"targetPort":8080}]}}' | kubectl apply -f -
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"name":"cliente","namespace":"p22b","labels":{"app":"cliente"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sleep","3600"]}]}}' | kubectl apply -f -
kubectl -n p22b wait --for=condition=Ready pod/cliente --timeout=180s
kubectl -n p22b exec cliente -- nslookup web.p22b-servidor.svc.cluster.local
kubectl -n p22b exec cliente -- wget -qO- http://web.p22b-servidor.svc.cluster.local/
true
object=$(kubectl -n p22b-servidor get service web -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.selector.app=="web" and any(.spec.ports[]; .port==80 and .targetPort==8080)' && object=$(kubectl -n p22b get pod cliente -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.status.conditions[]?; .type=="Ready" and .status=="True")' && kubectl -n p22b exec cliente -- nslookup web.p22b-servidor.svc.cluster.local >/dev/null && test "$(kubectl -n p22b exec cliente -- wget -T 5 -qO- http://web.p22b-servidor.svc.cluster.local/)" = DNS_OK
echo POSITIVO_c22-b
kubectl -n p22b-servidor delete service web
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p22b-servidor get service web -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.selector.app=="web" and any(.spec.ports[]; .port==80 and .targetPort==8080)' && object=$(kubectl -n p22b get pod cliente -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.status.conditions[]?; .type=="Ready" and .status=="True")' && kubectl -n p22b exec cliente -- nslookup web.p22b-servidor.svc.cluster.local >/dev/null && test "$(kubectl -n p22b exec cliente -- wget -T 5 -qO- http://web.p22b-servidor.svc.cluster.local/)" = DNS_OK); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c22-b
kubectl delete namespace p22b --ignore-not-found --wait=true --timeout=120s
kubectl delete namespace p22b-servidor --ignore-not-found --wait=true --timeout=120s
fi
if test "${1:-all}" = all || test "${1:-all}" = equivalencias; then
echo '{"spec":{"affinity":{"nodeAffinity":{"requiredDuringSchedulingIgnoredDuringExecution":{"nodeSelectorTerms":[{"matchExpressions":[{"key":"p19b.s2ktux.local/disco","operator":"In","values":["ssd","nvme"]}]}]}}}}}' | jq -e '(.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms // []) as $terms | ($terms|length)>0 and all($terms[]; (.matchFields // []|length)==0 and (.matchExpressions|length)==1 and .matchExpressions[0].key=="p19b.s2ktux.local/disco" and .matchExpressions[0].operator=="In" and (.matchExpressions[0].values|length)>0) and ([$terms[].matchExpressions[0].values[]]|unique)==["nvme","ssd"]'
echo '{"spec":{"affinity":{"nodeAffinity":{"requiredDuringSchedulingIgnoredDuringExecution":{"nodeSelectorTerms":[{"matchExpressions":[{"key":"p19b.s2ktux.local/disco","operator":"In","values":["ssd"]}]},{"matchExpressions":[{"key":"p19b.s2ktux.local/disco","operator":"In","values":["nvme"]}]}]}}}}}' | jq -e '(.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms // []) as $terms | ($terms|length)>0 and all($terms[]; (.matchFields // []|length)==0 and (.matchExpressions|length)==1 and .matchExpressions[0].key=="p19b.s2ktux.local/disco" and .matchExpressions[0].operator=="In" and (.matchExpressions[0].values|length)>0) and ([$terms[].matchExpressions[0].values[]]|unique)==["nvme","ssd"]'
if echo '{"spec":{"affinity":{"nodeAffinity":{"requiredDuringSchedulingIgnoredDuringExecution":{"nodeSelectorTerms":[{"matchExpressions":[{"key":"p19b.s2ktux.local/disco","operator":"In","values":["ssd","nvme","hdd"]}]}]}}}}}' | jq -e '(.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms // []) as $terms | ($terms|length)>0 and all($terms[]; (.matchFields // []|length)==0 and (.matchExpressions|length)==1 and .matchExpressions[0].key=="p19b.s2ktux.local/disco" and .matchExpressions[0].operator=="In" and (.matchExpressions[0].values|length)>0) and ([$terms[].matchExpressions[0].values[]]|unique)==["nvme","ssd"]'; then echo ERROR_AFINIDAD_PERMISIVA; exit 1; fi
if echo '{"spec":{"affinity":{"nodeAffinity":{"requiredDuringSchedulingIgnoredDuringExecution":{"nodeSelectorTerms":[{"matchExpressions":[{"key":"p19b.s2ktux.local/disco","operator":"In","values":["ssd"]}]}]}}}}}' | jq -e '(.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms // []) as $terms | ($terms|length)>0 and all($terms[]; (.matchFields // []|length)==0 and (.matchExpressions|length)==1 and .matchExpressions[0].key=="p19b.s2ktux.local/disco" and .matchExpressions[0].operator=="In" and (.matchExpressions[0].values|length)>0) and ([$terms[].matchExpressions[0].values[]]|unique)==["nvme","ssd"]'; then echo ERROR_AFINIDAD_PERMISIVA; exit 1; fi
if echo '{"spec":{"affinity":{"nodeAffinity":{"requiredDuringSchedulingIgnoredDuringExecution":{"nodeSelectorTerms":[{"matchExpressions":[{"key":"p19b.s2ktux.local/disco","operator":"In","values":["ssd","nvme"]}]},{"matchExpressions":[{"key":"otra","operator":"Exists"}]}]}}}}}' | jq -e '(.spec.affinity.nodeAffinity.requiredDuringSchedulingIgnoredDuringExecution.nodeSelectorTerms // []) as $terms | ($terms|length)>0 and all($terms[]; (.matchFields // []|length)==0 and (.matchExpressions|length)==1 and .matchExpressions[0].key=="p19b.s2ktux.local/disco" and .matchExpressions[0].operator=="In" and (.matchExpressions[0].values|length)>0) and ([$terms[].matchExpressions[0].values[]]|unique)==["nvme","ssd"]'; then echo ERROR_AFINIDAD_PERMISIVA; exit 1; fi
echo EQUIVALENCIAS_AFINIDAD_OK
fi
echo SUITE_SCHEDULING_RED_OK
