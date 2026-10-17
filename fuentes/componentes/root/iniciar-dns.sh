#!/bin/sh
# Recursos de CoreDNS generados por kubeadm real, no un DNS simulado.
set -eu
kubeadm init phase addon coredns --config=/tmp/kubeadm-prototype.yaml --print-manifest >/tmp/coredns-upstream.yaml
grep -q 'image: registry.k8s.io/coredns/coredns:v1.13.1' /tmp/coredns-upstream.yaml
# La versión oficial de servidor no distribuye linux/386. Esta imagen contiene
# CoreDNS sin cambios, compilado para el motor del navegador y etiquetado propio.
# Una réplica reduce la carga inicial; el alumno puede escalarla normalmente.
sed -e 's|image: registry.k8s.io/coredns/coredns:v1.13.1|image: s2ktux/coredns-lab:1.13.1|' -e 's/replicas: 2/replicas: 1/' /tmp/coredns-upstream.yaml >/tmp/coredns-browser.yaml
grep -q 'image: s2ktux/coredns-lab:1.13.1' /tmp/coredns-browser.yaml
kubectl apply -f /tmp/coredns-browser.yaml
kubectl -n kube-system rollout status deployment/coredns --timeout=180s
test "$(kubectl -n kube-system get service kube-dns -o jsonpath='{.spec.clusterIP}')" = 10.96.0.10
