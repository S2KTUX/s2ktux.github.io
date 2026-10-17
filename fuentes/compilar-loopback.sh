#!/bin/bash
set -Eeuo pipefail
build=/home/s2ktux/kubernetes-browser-build-20261012
project=/mnt/d/RIVALIA/prototipo-contenedores-web/kubernetes-real
source="$build/kubernetes-1.35.9"
test ! -e "$build/bin/kube-browser-ecdsa-v3"
export PATH="$build/go/bin:$PATH"
export GOCACHE="$build/cache" GOMODCACHE="$build/modules" GOTOOLCHAIN=local
export GOOS=linux GOARCH=386 CGO_ENABLED=0
printf '{"Replace":{"%s":"%s","%s":"%s"}}\n' \
 "$source/staging/src/k8s.io/apiserver/pkg/server/options/serving_with_loopback.go" \
 "$project/lanzador/serving_with_loopback.go" \
 "$source/staging/src/k8s.io/apiserver/pkg/server/options/serving_with_loopback_browser_test.go" \
 "$project/lanzador/serving_with_loopback_browser_test.go" > "$build/loopback-overlay-v3.json"
cd "$source"
version_pkg=k8s.io/component-base/version
client_pkg=k8s.io/client-go/pkg/version
ldflags="-s -w -X $version_pkg.gitVersion=v1.35.9 -X $version_pkg.gitMajor=1 -X $version_pkg.gitMinor=35 -X $version_pkg.gitTreeState=dirty -X $client_pkg.gitVersion=v1.35.9 -X $client_pkg.gitMajor=1 -X $client_pkg.gitMinor=35"
/usr/bin/time -v go build -p 4 -mod=vendor -overlay "$build/loopback-overlay-v3.json" -trimpath -ldflags "$ldflags" -o "$build/bin/kube-browser-ecdsa-v3" ./cmd/s2ktux-browser-v2 2>&1 | tee "$build/logs/loopback-v3.log"
file "$build/bin/kube-browser-ecdsa-v3"
sha256sum "$build/bin/kube-browser-ecdsa-v3"
go test -p 4 -mod=vendor -overlay "$build/loopback-overlay-v3.json" -run '^TestBrowserLoopbackCertificate$' k8s.io/apiserver/pkg/server/options
