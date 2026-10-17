#!/bin/bash
set -Eeuo pipefail
build=/home/s2ktux/kubernetes-browser-build-20261012
project=/mnt/d/RIVALIA/prototipo-contenedores-web/kubernetes-real
source="$build/kubernetes-1.35.9"
test ! -e "$build/bin/kube-browser-shared-v2"
test ! -e "$source/cmd/s2ktux-browser-v2"
mkdir "$source/cmd/s2ktux-browser-v2"
install -m 644 "$project/lanzador/main.go" "$source/cmd/s2ktux-browser-v2/main.go"
export PATH="$build/go/bin:$PATH"
export GOCACHE="$build/cache" GOMODCACHE="$build/modules" GOTOOLCHAIN=local
export GOOS=linux GOARCH=386 CGO_ENABLED=0
cd "$source"
version_pkg=k8s.io/component-base/version
client_pkg=k8s.io/client-go/pkg/version
ldflags="-s -w -X $version_pkg.gitVersion=v1.35.9 -X $version_pkg.gitMajor=1 -X $version_pkg.gitMinor=35 -X $version_pkg.gitTreeState=dirty -X $client_pkg.gitVersion=v1.35.9 -X $client_pkg.gitMajor=1 -X $client_pkg.gitMinor=35"
/usr/bin/time -v go build -p 4 -mod=vendor -trimpath -ldflags "$ldflags" -o "$build/bin/kube-browser-shared-v2" ./cmd/s2ktux-browser-v2 2>&1 | tee "$build/logs/lanzador-v2.log"
file "$build/bin/kube-browser-shared-v2"
sha256sum "$build/bin/kube-browser-shared-v2"
