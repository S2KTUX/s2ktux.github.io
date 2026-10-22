#!/bin/sh
set -eu
echo INICIO_COMPLEMENTOS_BAJO_DEMANDA
echo "Comprobar la API antes de preparar Ingress"
set -eu; kubectl get --raw=/readyz --request-timeout=20s
echo "Consultar el controlador existente"
test -n "$(kubectl get namespace traefik --ignore-not-found -o name)"
echo "Comprobar Traefik sin modificarlo"
set -eu; image=$(kubectl -n traefik get deployment traefik -o jsonpath='{.spec.template.spec.containers[0].image}'); case "$image" in s2ktux/traefik-lab:3.5.2|docker.io/s2ktux/traefik-lab:3.5.2) ;; *) exit 1;; esac; kubectl -n traefik rollout status deployment/traefik --timeout=180s
echo "Consultar el proveedor Gateway existente"
kubectl -n traefik get deployment traefik -o json | jq -e 'any(.spec.template.spec.containers[0].args[]; .=="--providers.kubernetesgateway" or .=="--providers.kubernetesgateway=true")'
echo "Consultar los CRDs del complemento"
if (set -eu; crds=$(kubectl get crds -o json --request-timeout=20s) && test -n "$crds" && printf '%s\n' "$crds" | jq -e --argjson expected '["gatewayclasses.gateway.networking.k8s.io","gateways.gateway.networking.k8s.io","grpcroutes.gateway.networking.k8s.io","httproutes.gateway.networking.k8s.io","referencegrants.gateway.networking.k8s.io"]' '[.items[] | select(.metadata.name as $name | $expected | index($name))] | length==0'); then echo ERROR_ESTADO_PREVIO; exit 1; fi
echo "Comprobar los CRDs sin modificarlos"
set -eu; deadline=$(($(date +%s)+120)); until (crds=$(kubectl get crds -o json --request-timeout=20s) && test -n "$crds" && printf '%s\n' "$crds" | jq -e --argjson expected '["gatewayclasses.gateway.networking.k8s.io","gateways.gateway.networking.k8s.io","grpcroutes.gateway.networking.k8s.io","httproutes.gateway.networking.k8s.io","referencegrants.gateway.networking.k8s.io"]' '[.items[] | select(.metadata.name as $name | $expected | index($name))] | length==5 and all(.[]; any(.status.conditions[]?; .type=="Established" and .status=="True"))'); do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 1; done
echo "Consultar la GatewayClass"
test -n "$(kubectl get gatewayclass traefik --ignore-not-found -o name)"
echo "Comprobar la GatewayClass existente"
set -eu; kubectl get gatewayclass traefik -o json | jq -e '.spec.controllerName=="traefik.io/gateway-controller"'; kubectl wait --for=condition=Accepted --timeout=120s gatewayclass/traefik
echo "Comprobar el proveedor Gateway"
set -eu; image=$(kubectl -n traefik get deployment traefik -o jsonpath='{.spec.template.spec.containers[0].image}'); case "$image" in s2ktux/traefik-lab:3.5.2|docker.io/s2ktux/traefik-lab:3.5.2) ;; *) exit 1;; esac; kubectl -n traefik rollout status deployment/traefik --timeout=180s; kubectl -n traefik get deployment traefik -o json | jq -e 'any(.spec.template.spec.containers[0].args[]; .=="--providers.kubernetesgateway" or .=="--providers.kubernetesgateway=true")'
echo GATEWAY_EXISTENTE_SIN_REINSTALAR_OK
echo "Comprobar la API antes de preparar Ingress"
set -eu; kubectl get --raw=/readyz --request-timeout=20s
echo "Consultar el controlador existente"
test -n "$(kubectl get namespace traefik --ignore-not-found -o name)"
echo "Comprobar Traefik sin modificarlo"
set -eu; image=$(kubectl -n traefik get deployment traefik -o jsonpath='{.spec.template.spec.containers[0].image}'); case "$image" in s2ktux/traefik-lab:3.5.2|docker.io/s2ktux/traefik-lab:3.5.2) ;; *) exit 1;; esac; kubectl -n traefik rollout status deployment/traefik --timeout=180s
echo "Consultar el proveedor CRD existente"
if (set -eu; kubectl -n traefik get deployment traefik -o json | jq -e 'any(.spec.template.spec.containers[0].args[]; .=="--providers.kubernetescrd" or .=="--providers.kubernetescrd=true")'); then echo ERROR_ESTADO_PREVIO; exit 1; fi
echo "Consultar los CRDs del complemento"
set -eu; crds=$(kubectl get crds -o json --request-timeout=20s) && test -n "$crds" && printf '%s\n' "$crds" | jq -e --argjson expected '["ingressroutes.traefik.io","ingressroutetcps.traefik.io","ingressrouteudps.traefik.io","middlewares.traefik.io","middlewaretcps.traefik.io","serverstransports.traefik.io","serverstransporttcps.traefik.io","tlsoptions.traefik.io","tlsstores.traefik.io","traefikservices.traefik.io"]' '[.items[] | select(.metadata.name as $name | $expected | index($name))] | length==0'
echo "Instalar los CRDs originales del complemento"
set -eu; kubectl create --validate=strict --request-timeout=120s -f /opt/curso/15-23/crds/06.yaml -f /opt/curso/15-23/crds/07.yaml -f /opt/curso/15-23/crds/08.yaml -f /opt/curso/15-23/crds/09.yaml -f /opt/curso/15-23/crds/10.yaml -f /opt/curso/15-23/crds/11.yaml -f /opt/curso/15-23/crds/12.yaml -f /opt/curso/15-23/crds/13.yaml -f /opt/curso/15-23/crds/14.yaml -f /opt/curso/15-23/crds/15.yaml
echo "Comprobar los CRDs sin modificarlos"
set -eu; deadline=$(($(date +%s)+120)); until (crds=$(kubectl get crds -o json --request-timeout=20s) && test -n "$crds" && printf '%s\n' "$crds" | jq -e --argjson expected '["ingressroutes.traefik.io","ingressroutetcps.traefik.io","ingressrouteudps.traefik.io","middlewares.traefik.io","middlewaretcps.traefik.io","serverstransports.traefik.io","serverstransporttcps.traefik.io","tlsoptions.traefik.io","tlsstores.traefik.io","traefikservices.traefik.io"]' '[.items[] | select(.metadata.name as $name | $expected | index($name))] | length==10 and all(.[]; any(.status.conditions[]?; .type=="Established" and .status=="True"))'); do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 1; done
echo "Activar las extensiones de Traefik solo para rewrite"
set -eu; helm upgrade traefik /opt/curso/15-23/traefik-37.1.1-lab1.tgz -n traefik --reuse-values --skip-crds --set providers.kubernetesCRD.enabled=true && kubectl -n traefik rollout status deployment/traefik --timeout=240s
echo "Comprobar el controlador de rewrite"
set -eu; image=$(kubectl -n traefik get deployment traefik -o jsonpath='{.spec.template.spec.containers[0].image}'); case "$image" in s2ktux/traefik-lab:3.5.2|docker.io/s2ktux/traefik-lab:3.5.2) ;; *) exit 1;; esac; kubectl -n traefik rollout status deployment/traefik --timeout=180s; kubectl -n traefik get deployment traefik -o json | jq -e 'any(.spec.template.spec.containers[0].args[]; .=="--providers.kubernetescrd" or .=="--providers.kubernetescrd=true")'
echo REWRITE_ACTIVADO_OK
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
if (set -eu; object=$(kubectl -n p15d get middleware quitar-prefijo -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '(.spec.stripPrefix.prefixes|index("/rewrite"))!=null' && object=$(kubectl -n p15d get ingress entrada -o json) && test -n "$object" && printf '%s\n' "$object" | jq -e '.metadata.annotations["traefik.ingress.kubernetes.io/router.middlewares"]=="p15d-quitar-prefijo@kubernetescrd"' && test "$(curl --fail --silent --show-error --max-time 15 -H 'Host: rewrite.curso.test' http://10.77.0.11:30080/rewrite/)" = REWRITE_OK); then echo ERROR_ACEPTO_INCOMPLETO; exit 1; fi
echo NEGATIVO_c15-d
kubectl delete namespace p15d --ignore-not-found --wait=true --timeout=120s
echo "Comprobar la API antes de preparar Ingress"
set -eu; kubectl get --raw=/readyz --request-timeout=20s
echo "Consultar el controlador existente"
test -n "$(kubectl get namespace traefik --ignore-not-found -o name)"
echo "Comprobar Traefik sin modificarlo"
set -eu; image=$(kubectl -n traefik get deployment traefik -o jsonpath='{.spec.template.spec.containers[0].image}'); case "$image" in s2ktux/traefik-lab:3.5.2|docker.io/s2ktux/traefik-lab:3.5.2) ;; *) exit 1;; esac; kubectl -n traefik rollout status deployment/traefik --timeout=180s
echo "Consultar el proveedor Gateway existente"
kubectl -n traefik get deployment traefik -o json | jq -e 'any(.spec.template.spec.containers[0].args[]; .=="--providers.kubernetesgateway" or .=="--providers.kubernetesgateway=true")'
echo "Consultar los CRDs del complemento"
if (set -eu; crds=$(kubectl get crds -o json --request-timeout=20s) && test -n "$crds" && printf '%s\n' "$crds" | jq -e --argjson expected '["gatewayclasses.gateway.networking.k8s.io","gateways.gateway.networking.k8s.io","grpcroutes.gateway.networking.k8s.io","httproutes.gateway.networking.k8s.io","referencegrants.gateway.networking.k8s.io"]' '[.items[] | select(.metadata.name as $name | $expected | index($name))] | length==0'); then echo ERROR_ESTADO_PREVIO; exit 1; fi
echo "Comprobar los CRDs sin modificarlos"
set -eu; deadline=$(($(date +%s)+120)); until (crds=$(kubectl get crds -o json --request-timeout=20s) && test -n "$crds" && printf '%s\n' "$crds" | jq -e --argjson expected '["gatewayclasses.gateway.networking.k8s.io","gateways.gateway.networking.k8s.io","grpcroutes.gateway.networking.k8s.io","httproutes.gateway.networking.k8s.io","referencegrants.gateway.networking.k8s.io"]' '[.items[] | select(.metadata.name as $name | $expected | index($name))] | length==5 and all(.[]; any(.status.conditions[]?; .type=="Established" and .status=="True"))'); do test "$(date +%s)" -lt "$deadline" || exit 1; sleep 1; done
echo "Consultar la GatewayClass"
test -n "$(kubectl get gatewayclass traefik --ignore-not-found -o name)"
echo "Comprobar la GatewayClass existente"
set -eu; kubectl get gatewayclass traefik -o json | jq -e '.spec.controllerName=="traefik.io/gateway-controller"'; kubectl wait --for=condition=Accepted --timeout=120s gatewayclass/traefik
echo "Comprobar el proveedor Gateway"
set -eu; image=$(kubectl -n traefik get deployment traefik -o jsonpath='{.spec.template.spec.containers[0].image}'); case "$image" in s2ktux/traefik-lab:3.5.2|docker.io/s2ktux/traefik-lab:3.5.2) ;; *) exit 1;; esac; kubectl -n traefik rollout status deployment/traefik --timeout=180s; kubectl -n traefik get deployment traefik -o json | jq -e 'any(.spec.template.spec.containers[0].args[]; .=="--providers.kubernetesgateway" or .=="--providers.kubernetesgateway=true")'
test ! -e /tmp/qa-ecdsa-perf.key && test ! -e /tmp/qa-ecdsa-perf.crt
started=$(date +%s)
openssl req -x509 -nodes -days 30 -newkey ec -pkeyopt ec_paramgen_curve:prime256v1 -keyout /tmp/qa-ecdsa-perf.key -out /tmp/qa-ecdsa-perf.crt -subj /CN=seguro.curso.test -addext subjectAltName=DNS:seguro.curso.test
echo CERTIFICADO_EC_SEGUNDOS=$(($(date +%s)-started))
rm /tmp/qa-ecdsa-perf.key /tmp/qa-ecdsa-perf.crt
kubectl get --raw=/readyz --request-timeout=20s
kubectl get nodes -o json | jq -e '(.items|length)==2 and all(.items[]; any(.status.conditions[]; .type=="Ready" and .status=="True") and any(.status.conditions[]; .type=="MemoryPressure" and .status=="False"))'
echo REWRITE_GATEWAY_CERTIFICADO_OK
