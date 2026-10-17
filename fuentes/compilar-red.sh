#!/bin/bash
# Plugins CNI auténticos para la primera prueba de ejecución. Esta configuración
# bridge no implementa NetworkPolicy y no constituye todavía la red CKA final.
set -Eeuo pipefail
build=/home/s2ktux/kubernetes-browser-build-20261012
test -x "$build/go/bin/go"
export PATH="$build/go/bin:$PATH"
export GOCACHE="$build/cache" GOMODCACHE="$build/modules" GOTOOLCHAIN=local
export GOOS=linux GOARCH=386 CGO_ENABLED=0
if [ ! -f "$build/plugins-1.8.0/go.mod" ]; then
 curl --fail --location --retry 3 https://codeload.github.com/containernetworking/plugins/tar.gz/refs/tags/v1.8.0 -o "$build/downloads/cni-plugins-v1.8.0.tar.gz"
 sha256sum "$build/downloads/cni-plugins-v1.8.0.tar.gz" | tee "$build/downloads/cni-plugins.sha256"
 tar -xzf "$build/downloads/cni-plugins-v1.8.0.tar.gz" -C "$build"
fi
mkdir -p "$build/cni"
cd "$build/plugins-1.8.0"
for entry in main/bridge main/loopback ipam/host-local meta/portmap meta/firewall meta/bandwidth; do
 name="${entry##*/}"
 go build -p 2 -mod=vendor -trimpath -ldflags '-s -w' -o "$build/cni/$name" "./plugins/$entry"
 file "$build/cni/$name"
 sha256sum "$build/cni/$name"
done
