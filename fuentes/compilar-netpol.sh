#!/bin/bash
# Constructor privado: no instala el controlador en WSL ni en Windows.
set -Eeuo pipefail
build=/home/s2ktux/kubernetes-browser-build-20261012
project=/mnt/d/RIVALIA/prototipo-contenedores-web/kubernetes-real
source="$build/kube-network-policies-1.1.2"
archive="$build/downloads/kube-network-policies-v1.1.2.tar.gz"
expected=f1fc7e87cce0e0d52a4410b3c5fa655267e20ecef28cb055ae8fccbd992974ba
test ! -e "$build/bin/netpol-v1.1.2"
if [ ! -f "$archive" ]; then
 curl --fail --location --retry 3 https://codeload.github.com/kubernetes-sigs/kube-network-policies/tar.gz/refs/tags/v1.1.2 -o "$archive"
fi
printf '%s  %s\n' "$expected" "$archive" | sha256sum --check --status
if [ ! -d "$source" ]; then
 tar -xzf "$archive" -C "$build"
fi
export PATH="$build/go/bin:$PATH"
export GOCACHE="$build/cache" GOMODCACHE="$build/modules" GOTOOLCHAIN=local
export GOOS=linux GOARCH=386 CGO_ENABLED=0
cd "$source"
go build -p 3 -trimpath -ldflags '-s -w' -o "$build/bin/netpol-v1.1.2" ./cmd/kube-network-policies/standard 2>&1 | tee "$build/logs/netpol-v1.1.2.log"
file "$build/bin/netpol-v1.1.2"
sha256sum "$build/bin/netpol-v1.1.2"
