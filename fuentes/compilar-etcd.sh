#!/bin/bash
set -Eeuo pipefail
build=/home/s2ktux/kubernetes-browser-build-20261012
test -x "$build/go/bin/go"
export PATH="$build/go/bin:$PATH"
export GOCACHE="$build/cache" GOMODCACHE="$build/modules" GOTOOLCHAIN=local
export GOOS=linux GOARCH=386 CGO_ENABLED=0
if [ ! -f "$build/etcd-3.6.6/go.mod" ]; then
 curl --fail --location --retry 3 https://codeload.github.com/etcd-io/etcd/tar.gz/refs/tags/v3.6.6 -o "$build/downloads/etcd-v3.6.6.tar.gz"
 sha256sum "$build/downloads/etcd-v3.6.6.tar.gz" | tee "$build/downloads/etcd.sha256"
 tar -xzf "$build/downloads/etcd-v3.6.6.tar.gz" -C "$build"
fi
for component in server etcdctl etcdutl; do
 name="$component"; [ "$component" != server ] || name=etcd
 cd "$build/etcd-3.6.6/$component"
 echo "Compilando $name real para linux/386"
 /usr/bin/time -v go build -p 2 -trimpath -ldflags '-s -w' -o "$build/bin/$name" . 2>&1 | tee "$build/logs/$name.log"
 file "$build/bin/$name"
 sha256sum "$build/bin/$name"
done
