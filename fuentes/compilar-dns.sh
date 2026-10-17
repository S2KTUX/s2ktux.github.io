#!/bin/bash
# Constructor privado. CoreDNS real y sin cambios en su código ni plugins.
set -Eeuo pipefail
build=/home/s2ktux/kubernetes-browser-build-20261012
version=1.13.1
mkdir -p "$build/downloads" "$build/logs" "$build/bin"
test -x "$build/go/bin/go"
if [ ! -f "$build/coredns-$version/go.mod" ]; then
 curl --fail --location --retry 3 "https://codeload.github.com/coredns/coredns/tar.gz/refs/tags/v$version" -o "$build/downloads/coredns-v$version.tar.gz"
 sha256sum "$build/downloads/coredns-v$version.tar.gz" | tee "$build/downloads/coredns.sha256"
 tar -xzf "$build/downloads/coredns-v$version.tar.gz" -C "$build"
fi
export PATH="$build/go/bin:$PATH"
export GOCACHE="$build/cache" GOMODCACHE="$build/modules" GOTOOLCHAIN=local
export GOOS=linux GOARCH=386 CGO_ENABLED=0
cd "$build/coredns-$version"
go version
go mod verify
/usr/bin/time -v go build -p 4 -trimpath -ldflags='-s -w' -o "$build/bin/coredns" . 2>&1 | tee "$build/logs/coredns.log"
file "$build/bin/coredns"
sha256sum "$build/bin/coredns"
