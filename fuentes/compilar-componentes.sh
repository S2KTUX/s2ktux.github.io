#!/bin/bash
# Experimento privado: componentes auténticos, compilados para una arquitectura
# no distribuida oficialmente como servidor Kubernetes. No instala nada en WSL.
set -Eeuo pipefail
build=/home/s2ktux/kubernetes-browser-build-20261012
project=/mnt/d/RIVALIA/prototipo-contenedores-web/kubernetes-real
mkdir -p "$build/downloads" "$build/bin" "$build/cache" "$build/modules" "$build/logs"
export GOCACHE="$build/cache" GOMODCACHE="$build/modules" GOTOOLCHAIN=local
export GOOS=linux GOARCH=386 CGO_ENABLED=0
go_archive=go1.26.9.linux-amd64.tar.gz
go_sha=42d158b4d8f7b61ac0a830567c940a86098fb7aac52e467a5ebec03ef5cc2f8d
if [ ! -x "$build/go/bin/go" ]; then
 curl --fail --location --retry 3 "https://go.dev/dl/$go_archive" -o "$build/downloads/$go_archive"
 printf '%s  %s\n' "$go_sha" "$build/downloads/$go_archive" | sha256sum --check
 tar -xzf "$build/downloads/$go_archive" -C "$build"
fi
export PATH="$build/go/bin:$PATH"
if [ ! -f "$build/kubernetes-1.35.9/go.mod" ]; then
 curl --fail --location --retry 3 https://codeload.github.com/kubernetes/kubernetes/tar.gz/refs/tags/v1.35.9 -o "$build/downloads/kubernetes-v1.35.9.tar.gz"
 sha256sum "$build/downloads/kubernetes-v1.35.9.tar.gz" | tee "$build/downloads/kubernetes.sha256"
 tar -xzf "$build/downloads/kubernetes-v1.35.9.tar.gz" -C "$build"
fi
go version
cd "$build/kubernetes-1.35.9"
version_pkg=k8s.io/component-base/version
# Preserve the actual upstream version, and mark the unmodified source tree clean.
ldflags="-s -w -X $version_pkg.gitVersion=v1.35.9 -X $version_pkg.gitMajor=1 -X $version_pkg.gitMinor=35 -X $version_pkg.gitTreeState=clean"
for component in "${@:-kubeadm}"; do
 case "$component" in kubeadm|kubelet|kube-apiserver|kube-controller-manager|kube-scheduler|kube-proxy) ;; *) echo 'Componente inválido' >&2; exit 2;; esac
 echo "Compilando $component real para linux/386"
 /usr/bin/time -v go build -p 4 -mod=vendor -trimpath -ldflags "$ldflags" -o "$build/bin/$component" "./cmd/$component" 2>&1 | tee "$build/logs/$component.log"
 file "$build/bin/$component"
 sha256sum "$build/bin/$component"
done
