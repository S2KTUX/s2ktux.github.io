#!/bin/sh
set -eu
echo PRUEBA_CONTROLADORES_REAL
case "${1:-all}" in all|c15-a|c15-b|c15-c|c15-d|c16-a|c16-b|c17-a|c17-b|c18-a|c18-b) ;; *) exit 2;; esac
case "${1:-all}" in all|c15-*) image=$(kubectl -n traefik get deployment traefik -o jsonpath='{.spec.template.spec.containers[0].image}'); case "$image" in s2ktux/traefik-lab:3.5.2|docker.io/s2ktux/traefik-lab:3.5.2) ;; *) exit 1;; esac; kubectl -n traefik rollout status deployment/traefik --timeout=180s ;; esac
if test "${1:-all}" = all || test "${1:-all}" = c15-a; then
echo INICIO_c15-a
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p15a --ignore-not-found -o name)"
kubectl create namespace p15a
kubectl -n p15a wait --for=create serviceaccount/default --timeout=90s
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"name":"web","namespace":"p15a","labels":{"app":"web"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sh","-c","mkdir -p /www; printf '\''%s\\n'\'' '\''INGRESS_OK'\'' >/www/index.html; exec httpd -f -p 8080 -h /www"]}]}}' | kubectl apply -f -
printf '%s\n' '{"apiVersion":"v1","kind":"Service","metadata":{"namespace":"p15a","name":"web"},"spec":{"selector":{"app":"web"},"ports":[{"port":80,"targetPort":8080}]}}' | kubectl apply -f -
kubectl -n p15a wait --for=condition=Ready pod/web --timeout=180s
kubectl -n p15a create ingress entrada --class=traefik --rule='web.curso.test/*=web:80'
deadline=$(($(date +%s)+90)); until test "$(curl --fail --silent --show-error --max-time 20 -H 'Host: web.curso.test' http://10.77.0.11:30080/)" = INGRESS_OK; do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 2; done
curl -H 'Host: web.curso.test' http://10.77.0.11:30080/
object=$(kubectl -n p15a get ingress entrada -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.ingressClassName=="traefik" and any(.spec.rules[]; .host=="web.curso.test" and any(.http.paths[]; .path=="/" and .pathType=="Prefix" and .backend.service.name=="web" and (.backend.service.port.number==80 or .backend.service.port.name=="http")))' && test "$(curl --fail --silent --show-error --max-time 20 -H 'Host: web.curso.test' http://10.77.0.11:30080/)" = INGRESS_OK
echo POSITIVO_c15-a
kubectl -n p15a delete ingress entrada
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p15a get ingress entrada -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.ingressClassName=="traefik" and any(.spec.rules[]; .host=="web.curso.test" and any(.http.paths[]; .path=="/" and .pathType=="Prefix" and .backend.service.name=="web" and (.backend.service.port.number==80 or .backend.service.port.name=="http")))' && test "$(curl --fail --silent --show-error --max-time 20 -H 'Host: web.curso.test' http://10.77.0.11:30080/)" = INGRESS_OK); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c15-a
kubectl delete namespace p15a --ignore-not-found --wait=true --timeout=120s
fi
if test "${1:-all}" = all || test "${1:-all}" = c15-b; then
echo INICIO_c15-b
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p15b --ignore-not-found -o name)"
kubectl create namespace p15b
kubectl -n p15b wait --for=create serviceaccount/default --timeout=90s
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"name":"web","namespace":"p15b","labels":{"app":"web"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sh","-c","mkdir -p /www; printf '\''%s\\n'\'' '\''TIENDA_OK'\'' >/www/index.html; exec httpd -f -p 8080 -h /www"]}]}}' | kubectl apply -f -
printf '%s\n' '{"apiVersion":"v1","kind":"Service","metadata":{"namespace":"p15b","name":"web"},"spec":{"selector":{"app":"web"},"ports":[{"port":80,"targetPort":8080}]}}' | kubectl apply -f -
kubectl -n p15b wait --for=condition=Ready pod/web --timeout=180s
printf '%s\n' '{"apiVersion":"networking.k8s.io/v1","kind":"Ingress","metadata":{"namespace":"p15b","name":"entrada"},"spec":{"ingressClassName":"traefik","rules":[{"host":"tienda.curso.test","http":{"paths":[{"path":"/","pathType":"Prefix","backend":{"service":{"name":"web","port":{"number":8081}}}}]}}]}}' | kubectl apply -f -
kubectl -n p15b get ingress entrada -o jsonpath='{.metadata.uid}' > /tmp/c15-b.uid
kubectl -n p15b patch ingress entrada --type=json -p '[{"op":"replace","path":"/spec/rules/0/http/paths/0/backend/service/port/number","value":80}]'
deadline=$(($(date +%s)+90)); until test "$(curl --fail --silent --show-error --max-time 20 -H 'Host: tienda.curso.test' http://10.77.0.11:30080/)" = TIENDA_OK; do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 2; done
object=$(kubectl -n p15b get ingress entrada -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e --arg uid "$(cat /tmp/c15-b.uid)" '.spec.ingressClassName=="traefik" and any(.spec.rules[]; .host=="tienda.curso.test" and any(.http.paths[]; .path=="/" and .pathType=="Prefix" and .backend.service.name=="web" and (.backend.service.port.number==80 or .backend.service.port.name=="http"))) and .metadata.uid==$uid' && test "$(curl --fail --silent --show-error --max-time 20 -H 'Host: tienda.curso.test' http://10.77.0.11:30080/)" = TIENDA_OK
echo POSITIVO_c15-b
kubectl -n p15b delete ingress entrada
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p15b get ingress entrada -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e --arg uid "$(cat /tmp/c15-b.uid)" '.spec.ingressClassName=="traefik" and any(.spec.rules[]; .host=="tienda.curso.test" and any(.http.paths[]; .path=="/" and .pathType=="Prefix" and .backend.service.name=="web" and (.backend.service.port.number==80 or .backend.service.port.name=="http"))) and .metadata.uid==$uid' && test "$(curl --fail --silent --show-error --max-time 20 -H 'Host: tienda.curso.test' http://10.77.0.11:30080/)" = TIENDA_OK); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c15-b
kubectl delete namespace p15b --ignore-not-found --wait=true --timeout=120s
rm -f /tmp/c15-b.uid
fi
if test "${1:-all}" = all || test "${1:-all}" = c15-c; then
echo INICIO_c15-c
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p15c --ignore-not-found -o name)"
kubectl create namespace p15c
kubectl -n p15c wait --for=create serviceaccount/default --timeout=90s
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"name":"web","namespace":"p15c","labels":{"app":"web"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sh","-c","mkdir -p /www; printf '\''%s\\n'\'' '\''TLS_OK'\'' >/www/index.html; exec httpd -f -p 8080 -h /www"]}]}}' | kubectl apply -f -
printf '%s\n' '{"apiVersion":"v1","kind":"Service","metadata":{"namespace":"p15c","name":"web"},"spec":{"selector":{"app":"web"},"ports":[{"port":80,"targetPort":8080}]}}' | kubectl apply -f -
kubectl -n p15c wait --for=condition=Ready pod/web --timeout=180s
test ! -e /root/p15c.crt && test ! -e /root/p15c.key
openssl req -x509 -nodes -days 30 -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -keyout /root/p15c.key -out /root/p15c.crt -subj /CN=seguro.curso.test -addext subjectAltName=DNS:seguro.curso.test
kubectl -n p15c create secret tls web-tls --cert=/root/p15c.crt --key=/root/p15c.key
printf '%s\n' '{"apiVersion":"networking.k8s.io/v1","kind":"Ingress","metadata":{"namespace":"p15c","name":"entrada"},"spec":{"ingressClassName":"traefik","rules":[{"host":"seguro.curso.test","http":{"paths":[{"path":"/","pathType":"Prefix","backend":{"service":{"name":"web","port":{"number":80}}}}]}}],"tls":[{"hosts":["seguro.curso.test"],"secretName":"web-tls"}]}}' | kubectl apply -f -
# Espera unos segundos a que Traefik cargue el certificado.
deadline=$(($(date +%s)+90)); until test "$(curl --fail --silent --show-error --max-time 20 --cacert /root/p15c.crt --resolve seguro.curso.test:30443:10.77.0.11 https://seguro.curso.test:30443/)" = TLS_OK; do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 2; done
curl --cacert /root/p15c.crt --resolve seguro.curso.test:30443:10.77.0.11 https://seguro.curso.test:30443/
object=$(kubectl -n p15c get ingress entrada -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.ingressClassName=="traefik" and any(.spec.rules[]; .host=="seguro.curso.test" and any(.http.paths[]; .path=="/" and .pathType=="Prefix" and .backend.service.name=="web" and (.backend.service.port.number==80 or .backend.service.port.name=="http"))) and any(.spec.tls[]; .secretName=="web-tls" and (.hosts|index("seguro.curso.test"))!=null)' && test "$(curl --fail --silent --show-error --max-time 20 --cacert /root/p15c.crt --resolve seguro.curso.test:30443:10.77.0.11 https://seguro.curso.test:30443/)" = TLS_OK
echo POSITIVO_c15-c
kubectl -n p15c delete secret web-tls
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p15c get ingress entrada -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.ingressClassName=="traefik" and any(.spec.rules[]; .host=="seguro.curso.test" and any(.http.paths[]; .path=="/" and .pathType=="Prefix" and .backend.service.name=="web" and (.backend.service.port.number==80 or .backend.service.port.name=="http"))) and any(.spec.tls[]; .secretName=="web-tls" and (.hosts|index("seguro.curso.test"))!=null)' && test "$(curl --fail --silent --show-error --max-time 20 --cacert /root/p15c.crt --resolve seguro.curso.test:30443:10.77.0.11 https://seguro.curso.test:30443/)" = TLS_OK); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c15-c
kubectl delete namespace p15c --ignore-not-found --wait=true --timeout=120s
rm -f /root/p15c.crt /root/p15c.key
fi
if test "${1:-all}" = all || test "${1:-all}" = c15-d; then
echo INICIO_c15-d
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p15d --ignore-not-found -o name)"
kubectl create namespace p15d
kubectl -n p15d wait --for=create serviceaccount/default --timeout=90s
printf '%s\n' '{"apiVersion":"v1","kind":"Pod","metadata":{"name":"web","namespace":"p15d","labels":{"app":"web"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sh","-c","mkdir -p /www; printf '\''%s\\n'\'' '\''REWRITE_OK'\'' >/www/index.html; exec httpd -f -p 8080 -h /www"]}]}}' | kubectl apply -f -
printf '%s\n' '{"apiVersion":"v1","kind":"Service","metadata":{"namespace":"p15d","name":"web"},"spec":{"selector":{"app":"web"},"ports":[{"port":80,"targetPort":8080}]}}' | kubectl apply -f -
kubectl -n p15d wait --for=condition=Ready pod/web --timeout=180s
printf '%s\n' '{"apiVersion":"networking.k8s.io/v1","kind":"Ingress","metadata":{"namespace":"p15d","name":"entrada","annotations":{"traefik.ingress.kubernetes.io/router.entrypoints":"web"}},"spec":{"ingressClassName":"traefik","rules":[{"host":"rewrite.curso.test","http":{"paths":[{"path":"/rewrite","pathType":"Prefix","backend":{"service":{"name":"web","port":{"number":80}}}}]}}]}}' | kubectl apply -f -
printf '%s\n' '{"apiVersion":"traefik.io/v1alpha1","kind":"Middleware","metadata":{"name":"quitar-prefijo","namespace":"p15d"},"spec":{"stripPrefix":{"prefixes":["/rewrite"]}}}' | kubectl apply -f -
kubectl -n p15d annotate ingress entrada traefik.ingress.kubernetes.io/router.middlewares=p15d-quitar-prefijo@kubernetescrd --overwrite
deadline=$(($(date +%s)+90)); until (kubectl -n p15d get middleware quitar-prefijo -o json | jq -e '(.spec.stripPrefix.prefixes|index("/rewrite"))!=null' && kubectl -n p15d get ingress entrada -o json | jq -e '.metadata.annotations["traefik.ingress.kubernetes.io/router.middlewares"]=="p15d-quitar-prefijo@kubernetescrd"' && test "$(curl --fail --silent --show-error --max-time 15 -H 'Host: rewrite.curso.test' http://10.77.0.11:30080/rewrite/)" = REWRITE_OK); do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 2; done
curl -H 'Host: rewrite.curso.test' http://10.77.0.11:30080/rewrite/
object=$(kubectl -n p15d get middleware quitar-prefijo -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.spec.stripPrefix.prefixes|index("/rewrite"))!=null' && object=$(kubectl -n p15d get ingress entrada -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.metadata.annotations["traefik.ingress.kubernetes.io/router.middlewares"]=="p15d-quitar-prefijo@kubernetescrd"' && test "$(curl --fail --silent --show-error --max-time 15 -H 'Host: rewrite.curso.test' http://10.77.0.11:30080/rewrite/)" = REWRITE_OK
echo POSITIVO_c15-d
kubectl -n p15d delete middleware quitar-prefijo
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p15d get middleware quitar-prefijo -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.spec.stripPrefix.prefixes|index("/rewrite"))!=null' && object=$(kubectl -n p15d get ingress entrada -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.metadata.annotations["traefik.ingress.kubernetes.io/router.middlewares"]=="p15d-quitar-prefijo@kubernetescrd"' && test "$(curl --fail --silent --show-error --max-time 15 -H 'Host: rewrite.curso.test' http://10.77.0.11:30080/rewrite/)" = REWRITE_OK); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c15-d
kubectl delete namespace p15d --ignore-not-found --wait=true --timeout=120s
fi
if test "${1:-all}" = all || test "${1:-all}" = c16-a; then
echo INICIO_c16-a
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p16a --ignore-not-found -o name)"
kubectl create namespace p16a
kubectl -n p16a wait --for=create serviceaccount/default --timeout=90s
printf '%s\n' '{"apiVersion":"apps/v1","kind":"DaemonSet","metadata":{"namespace":"p16a","name":"agente"},"spec":{"selector":{"matchLabels":{"app":"agente"}},"template":{"metadata":{"labels":{"app":"agente"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sleep","3600"]}]}}}}' | kubectl apply -f -
kubectl -n p16a rollout status ds/agente --timeout=240s
kubectl -n p16a get pods -o wide
object=$(kubectl -n p16a get ds agente -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.status.observedGeneration==.metadata.generation and .status.desiredNumberScheduled==1 and .status.numberReady==1 and .spec.template.spec.containers[0].image=="busybox:1.37.0-musl"' && object=$(kubectl -n p16a get pods -l app=agente -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==1 and (.items[0]|.spec.nodeName=="cka-w1" and any(.status.conditions[]?; .type=="Ready" and .status=="True"))'
echo POSITIVO_c16-a
kubectl -n p16a delete ds agente
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p16a get ds agente -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.status.observedGeneration==.metadata.generation and .status.desiredNumberScheduled==1 and .status.numberReady==1 and .spec.template.spec.containers[0].image=="busybox:1.37.0-musl"' && object=$(kubectl -n p16a get pods -l app=agente -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==1 and (.items[0]|.spec.nodeName=="cka-w1" and any(.status.conditions[]?; .type=="Ready" and .status=="True"))'); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c16-a
kubectl delete namespace p16a --ignore-not-found --wait=true --timeout=120s
fi
if test "${1:-all}" = all || test "${1:-all}" = c16-b; then
echo INICIO_c16-b
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p16b --ignore-not-found -o name)"
kubectl create namespace p16b
kubectl -n p16b wait --for=create serviceaccount/default --timeout=90s
printf '%s\n' '{"apiVersion":"apps/v1","kind":"DaemonSet","metadata":{"namespace":"p16b","name":"agente"},"spec":{"selector":{"matchLabels":{"app":"agente"}},"template":{"metadata":{"labels":{"app":"agente"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sleep","3600"]}],"tolerations":[{"key":"node-role.kubernetes.io/control-plane","operator":"Exists","effect":"NoSchedule"}]}}}}' | kubectl apply -f -
kubectl -n p16b rollout status ds/agente --timeout=240s
kubectl -n p16b get pods -o wide
object=$(kubectl -n p16b get ds agente -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.status.observedGeneration==.metadata.generation and .status.desiredNumberScheduled==2 and .status.numberReady==2 and (.spec.template.spec.tolerations|length)>0' && object=$(kubectl -n p16b get pods -l app=agente -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==2 and ([.items[].spec.nodeName]|sort)==["cka-cp1","cka-w1"] and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True"))' && object=$(kubectl -n default get node cka-cp1 -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.spec.taints[]?; .key=="node-role.kubernetes.io/control-plane" and .effect=="NoSchedule")'
echo POSITIVO_c16-b
kubectl -n p16b delete ds agente
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p16b get ds agente -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.status.observedGeneration==.metadata.generation and .status.desiredNumberScheduled==2 and .status.numberReady==2 and (.spec.template.spec.tolerations|length)>0' && object=$(kubectl -n p16b get pods -l app=agente -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.items|length)==2 and ([.items[].spec.nodeName]|sort)==["cka-cp1","cka-w1"] and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True"))' && object=$(kubectl -n default get node cka-cp1 -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'any(.spec.taints[]?; .key=="node-role.kubernetes.io/control-plane" and .effect=="NoSchedule")'); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c16-b
kubectl delete namespace p16b --ignore-not-found --wait=true --timeout=120s
fi
if test "${1:-all}" = all || test "${1:-all}" = c17-a; then
echo INICIO_c17-a
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p17a --ignore-not-found -o name)"
kubectl create namespace p17a
kubectl -n p17a wait --for=create serviceaccount/default --timeout=90s
printf '%s\n' '{"apiVersion":"v1","kind":"Service","metadata":{"namespace":"p17a","name":"identidad"},"spec":{"clusterIP":"None","selector":{"app":"web"},"ports":[{"name":"http","port":8080,"targetPort":8080}]}}' | kubectl apply -f -
printf '%s\n' '{"apiVersion":"apps/v1","kind":"StatefulSet","metadata":{"namespace":"p17a","name":"web"},"spec":{"selector":{"matchLabels":{"app":"web"}},"template":{"metadata":{"labels":{"app":"web"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sh","-c","mkdir -p /www; hostname > /www/index.html; exec httpd -f -p 8080 -h /www"]}]}},"serviceName":"identidad","replicas":2}}' | kubectl apply -f -
kubectl -n p17a rollout status sts/web --timeout=240s
kubectl -n p17a get pods
kubectl -n p17a exec web-0 -- wget -qO- http://web-1.identidad.p17a.svc.cluster.local:8080/
object=$(kubectl -n p17a get sts web -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.serviceName=="identidad" and .spec.replicas==2 and .status.readyReplicas==2 and .status.observedGeneration==.metadata.generation' && object=$(kubectl -n p17a get svc identidad -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.clusterIP=="None" and .spec.selector.app=="web"' && object=$(kubectl -n p17a get pods -l app=web -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '([.items[].metadata.name]|sort)==["web-0","web-1"] and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True"))' && test "$(kubectl -n p17a exec web-0 -- wget -T 10 -qO- http://web-1.identidad.p17a.svc.cluster.local:8080/)" = web-1
echo POSITIVO_c17-a
kubectl -n p17a scale sts web --replicas=1
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p17a get sts web -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.serviceName=="identidad" and .spec.replicas==2 and .status.readyReplicas==2 and .status.observedGeneration==.metadata.generation' && object=$(kubectl -n p17a get svc identidad -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.clusterIP=="None" and .spec.selector.app=="web"' && object=$(kubectl -n p17a get pods -l app=web -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '([.items[].metadata.name]|sort)==["web-0","web-1"] and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True"))' && test "$(kubectl -n p17a exec web-0 -- wget -T 10 -qO- http://web-1.identidad.p17a.svc.cluster.local:8080/)" = web-1); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c17-a
kubectl delete namespace p17a --ignore-not-found --wait=true --timeout=120s
fi
if test "${1:-all}" = all || test "${1:-all}" = c17-b; then
echo INICIO_c17-b
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p17b --ignore-not-found -o name)"
kubectl create namespace p17b
kubectl -n p17b wait --for=create serviceaccount/default --timeout=90s
printf '%s\n' '{"apiVersion":"v1","kind":"Service","metadata":{"namespace":"p17b","name":"identidad"},"spec":{"clusterIP":"None","selector":{"app":"web"},"ports":[{"name":"http","port":8080,"targetPort":8080}]}}' | kubectl apply -f -
printf '%s\n' '{"apiVersion":"apps/v1","kind":"StatefulSet","metadata":{"namespace":"p17b","name":"web"},"spec":{"selector":{"matchLabels":{"app":"web"}},"template":{"metadata":{"labels":{"app":"web"}},"spec":{"terminationGracePeriodSeconds":1,"containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["sh","-c","mkdir -p /www; hostname > /www/index.html; exec httpd -f -p 8080 -h /www"],"volumeMounts":[{"name":"datos","mountPath":"/datos"}]}]}},"serviceName":"identidad","replicas":2,"volumeClaimTemplates":[{"metadata":{"name":"datos"},"spec":{"storageClassName":"local-path","accessModes":["ReadWriteOnce"],"resources":{"requests":{"storage":"16Mi"}}}}]}}' | kubectl apply -f -
kubectl -n p17b rollout status sts/web --timeout=240s
kubectl -n p17b exec web-0 -- sh -c 'echo PRIMERO > /datos/estado'
kubectl -n p17b exec web-1 -- sh -c 'echo SEGUNDO > /datos/estado'
kubectl -n p17b delete pod web-0
kubectl -n p17b wait --for=create pod/web-0 --timeout=180s
kubectl -n p17b wait --for=condition=Ready pod/web-0 --timeout=180s
kubectl -n p17b exec web-0 -- cat /datos/estado
kubectl -n p17b get pvc
object=$(kubectl -n p17b get sts web -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.serviceName=="identidad" and .spec.replicas==2 and .status.readyReplicas==2 and .status.observedGeneration==.metadata.generation' && object=$(kubectl -n p17b get svc identidad -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.clusterIP=="None" and .spec.selector.app=="web"' && object=$(kubectl -n p17b get pods -l app=web -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '([.items[].metadata.name]|sort)==["web-0","web-1"] and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True"))' && object=$(kubectl -n p17b get pvc  -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'def cantidad: ((tostring|capture("^(?<n>[-+]?(?:[0-9]+(?:[.][0-9]*)?|[.][0-9]+)(?:[eE][-+]?[0-9]+)?)(?<u>Ki|Mi|Gi|Ti|Pi|Ei|[numkKMGTPE]?)$"))//{n:"-1",u:""}) as $q | ($q.n|sub("^[+]";"")|sub("^[.]";"0.")|sub("^-[.]";"-0.")|tonumber)*({"":1,n:1e-9,u:1e-6,m:0.001,k:1000,K:1000,M:1e6,G:1e9,T:1e12,P:1e15,E:1e18,Ki:1024,Mi:1048576,Gi:1073741824,Ti:1099511627776,Pi:1125899906842624,Ei:1152921504606846976}[$q.u]); def equivale($n): ((cantidad-$n)|fabs)<=((($n|fabs)+1)*1e-12); (.items|length)==2 and all(.items[]; .status.phase=="Bound" and .spec.storageClassName=="local-path" and (.spec.accessModes|index("ReadWriteOnce"))!=null and (.spec.resources.requests.storage|equivale(16777216))) and ([.items[].spec.volumeName]|unique|length)==2' && test "$(kubectl -n p17b exec web-0 -- cat /datos/estado)" = PRIMERO && test "$(kubectl -n p17b exec web-1 -- cat /datos/estado)" = SEGUNDO
echo POSITIVO_c17-b
kubectl -n p17b exec web-1 -- sh -c 'echo INCORRECTO > /datos/estado'
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p17b get sts web -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.serviceName=="identidad" and .spec.replicas==2 and .status.readyReplicas==2 and .status.observedGeneration==.metadata.generation' && object=$(kubectl -n p17b get svc identidad -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.clusterIP=="None" and .spec.selector.app=="web"' && object=$(kubectl -n p17b get pods -l app=web -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '([.items[].metadata.name]|sort)==["web-0","web-1"] and all(.items[]; any(.status.conditions[]?; .type=="Ready" and .status=="True"))' && object=$(kubectl -n p17b get pvc  -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e 'def cantidad: ((tostring|capture("^(?<n>[-+]?(?:[0-9]+(?:[.][0-9]*)?|[.][0-9]+)(?:[eE][-+]?[0-9]+)?)(?<u>Ki|Mi|Gi|Ti|Pi|Ei|[numkKMGTPE]?)$"))//{n:"-1",u:""}) as $q | ($q.n|sub("^[+]";"")|sub("^[.]";"0.")|sub("^-[.]";"-0.")|tonumber)*({"":1,n:1e-9,u:1e-6,m:0.001,k:1000,K:1000,M:1e6,G:1e9,T:1e12,P:1e15,E:1e18,Ki:1024,Mi:1048576,Gi:1073741824,Ti:1099511627776,Pi:1125899906842624,Ei:1152921504606846976}[$q.u]); def equivale($n): ((cantidad-$n)|fabs)<=((($n|fabs)+1)*1e-12); (.items|length)==2 and all(.items[]; .status.phase=="Bound" and .spec.storageClassName=="local-path" and (.spec.accessModes|index("ReadWriteOnce"))!=null and (.spec.resources.requests.storage|equivale(16777216))) and ([.items[].spec.volumeName]|unique|length)==2' && test "$(kubectl -n p17b exec web-0 -- cat /datos/estado)" = PRIMERO && test "$(kubectl -n p17b exec web-1 -- cat /datos/estado)" = SEGUNDO); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c17-b
kubectl delete namespace p17b --ignore-not-found --wait=true --timeout=120s
fi
if test "${1:-all}" = all || test "${1:-all}" = c18-a; then
echo INICIO_c18-a
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p18a --ignore-not-found -o name)"
kubectl create namespace p18a
kubectl -n p18a wait --for=create serviceaccount/default --timeout=90s
printf '%s\n' '{"apiVersion":"batch/v1","kind":"Job","metadata":{"namespace":"p18a","name":"saludo"},"spec":{"backoffLimit":2,"template":{"spec":{"restartPolicy":"Never","containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["echo","JOB_OK"]}]}}}}' | kubectl apply -f -
kubectl -n p18a wait --for=condition=Complete job/saludo --timeout=180s
kubectl -n p18a logs job/saludo
object=$(kubectl -n p18a get job saludo -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.status.succeeded==1 and any(.status.conditions[]?; .type=="Complete" and .status=="True") and .spec.template.spec.containers[0].image=="busybox:1.37.0-musl"' && test "$(kubectl -n p18a logs job/saludo)" = JOB_OK
echo POSITIVO_c18-a
kubectl -n p18a delete job saludo
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p18a get job saludo -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.status.succeeded==1 and any(.status.conditions[]?; .type=="Complete" and .status=="True") and .spec.template.spec.containers[0].image=="busybox:1.37.0-musl"' && test "$(kubectl -n p18a logs job/saludo)" = JOB_OK); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c18-a
kubectl delete namespace p18a --ignore-not-found --wait=true --timeout=120s
fi
if test "${1:-all}" = all || test "${1:-all}" = c18-b; then
echo INICIO_c18-b
kubectl get --raw=/readyz --request-timeout=20s
kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s
test -z "$(kubectl get namespace p18b --ignore-not-found -o name)"
kubectl create namespace p18b
kubectl -n p18b wait --for=create serviceaccount/default --timeout=90s
printf '%s\n' '{"apiVersion":"batch/v1","kind":"CronJob","metadata":{"namespace":"p18b","name":"programado"},"spec":{"schedule":"*/5 * * * *","concurrencyPolicy":"Forbid","suspend":false,"jobTemplate":{"spec":{"backoffLimit":2,"template":{"spec":{"restartPolicy":"Never","containers":[{"name":"app","image":"busybox:1.37.0-musl","imagePullPolicy":"Never","command":["echo","JOB_OK"]}]}}}}}}' | kubectl apply -f -
kubectl -n p18b create job prueba --from=cronjob/programado
kubectl -n p18b wait --for=condition=Complete job/prueba --timeout=180s
kubectl -n p18b logs job/prueba
kubectl -n p18b patch cronjob programado --type=merge -p '{"spec":{"suspend":true}}'
object=$(kubectl -n p18b get cronjob programado -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.schedule=="*/5 * * * *" and .spec.concurrencyPolicy=="Forbid" and .spec.suspend==true and .spec.jobTemplate.spec.template.spec.containers[0].image=="busybox:1.37.0-musl"' && object=$(kubectl -n p18b get job prueba -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.status.succeeded==1 and .metadata.annotations["cronjob.kubernetes.io/instantiate"]=="manual" and .spec.template.spec.containers[0].command==["echo","JOB_OK"]' && test "$(kubectl -n p18b logs job/prueba)" = JOB_OK
echo POSITIVO_c18-b
kubectl -n p18b patch cronjob programado --type=merge -p '{"spec":{"suspend":false}}'
kubectl get --raw=/readyz --request-timeout=20s
if (set -eu; object=$(kubectl -n p18b get cronjob programado -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.spec.schedule=="*/5 * * * *" and .spec.concurrencyPolicy=="Forbid" and .spec.suspend==true and .spec.jobTemplate.spec.template.spec.containers[0].image=="busybox:1.37.0-musl"' && object=$(kubectl -n p18b get job prueba -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.status.succeeded==1 and .metadata.annotations["cronjob.kubernetes.io/instantiate"]=="manual" and .spec.template.spec.containers[0].command==["echo","JOB_OK"]' && test "$(kubectl -n p18b logs job/prueba)" = JOB_OK); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c18-b
kubectl delete namespace p18b --ignore-not-found --wait=true --timeout=120s
fi
echo SUITE_CONTROLADORES_OK
