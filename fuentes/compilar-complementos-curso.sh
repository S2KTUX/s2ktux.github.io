#!/bin/bash
# Solo constructor privado. No instala servicios en WSL ni publica artefactos.
set -Eeuo pipefail
base=/home/s2ktux/kubernetes-browser-build-20261012
stage="$base/curso-v1"
mkdir -p "$stage/downloads" "$stage/sources" "$stage/bin" "$stage/logs"
export PATH="$base/go/bin:$PATH"
export GOCACHE="$base/cache" GOMODCACHE="$base/modules" GOTOOLCHAIN=local
export GOOS=linux GOARCH=386 CGO_ENABLED=0 GOMAXPROCS=2
name=${1:?Indica helm, local-path, metrics-server, traefik o crictl}
variant=${2:-original}
case "$variant" in original) suffix=;; metadata-v2|metadata-v3) suffix=-$variant;; *) exit 2;; esac
case "$name" in
 helm) repository=helm/helm; version=3.20.0; path=./cmd/helm; flags='-s -w -X helm.sh/helm/v3/internal/version.version=v3.20.0';;
 local-path) repository=rancher/local-path-provisioner; version=0.0.34; path=.; flags='-s -w';;
 metrics-server) repository=kubernetes-sigs/metrics-server; version=0.8.0; path=./cmd/metrics-server; flags='-s -w';;
 traefik) repository=traefik/traefik; version=3.5.2; path=./cmd/traefik; flags='-s -w -X github.com/traefik/traefik/v3/pkg/version.Version=3.5.2';;
 crictl) repository=kubernetes-sigs/cri-tools; version=1.35.0; path=./cmd/crictl; flags='-s -w -X sigs.k8s.io/cri-tools/pkg/version.Version=v1.35.0';;
 *) exit 2;;
esac
if [ "$variant" != original ]; then
 case "$name" in
  local-path) test "$variant" = metadata-v2; flags='-s -w -X main.VERSION=v0.0.34';;
  metrics-server)
   if [ "$variant" = metadata-v3 ]; then
    flags='-s -w -X k8s.io/client-go/pkg/version.gitVersion=v0.8.0'
   else
    flags='-s -w -X k8s.io/component-base/version.gitVersion=v0.8.0 -X k8s.io/component-base/version.gitMajor=0 -X k8s.io/component-base/version.gitMinor=8 -X k8s.io/component-base/version.gitTreeState=clean'
   fi;;
  *) exit 2;;
 esac
fi
archive="$stage/downloads/$name-v$version.tar.gz"
source="$stage/sources/$name-v$version"
if [ ! -f "$archive" ]; then
 curl --fail --location --retry 3 --max-time 180 "https://codeload.github.com/$repository/tar.gz/refs/tags/v$version" -o "$archive.partial"
 mv -n "$archive.partial" "$archive"
fi
if [ ! -f "$archive.sha256" ]; then sha256sum "$archive" >"$archive.sha256"; fi
sha256sum --check "$archive.sha256"
if [ ! -d "$source" ]; then
 mkdir "$source"
 tar -xzf "$archive" --strip-components=1 -C "$source"
fi
cd "$source"
test -f go.mod
test ! -e "$stage/bin/$name-v$version$suffix"
go build -p 2 -mod=readonly -trimpath -ldflags "$flags" -o "$stage/bin/$name-v$version$suffix" "$path" 2>&1 | tee "$stage/logs/$name-v$version$suffix.log"
file "$stage/bin/$name-v$version$suffix"
sha256sum "$stage/bin/$name-v$version$suffix"
