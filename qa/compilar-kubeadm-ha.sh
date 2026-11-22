#!/bin/sh
set -eu
build=/home/s2ktux/kubernetes-browser-build-20261012
source_dir="$build/kubernetes-1.35.9"
out=/mnt/d/RIVALIA/s2ktux-publicacion/qa/evidencia/kubeadm-ha-etcd60s
mkdir -p "$out"
test -x "$build/go/bin/go"
test -f "$source_dir/cmd/kubeadm/app/util/etcd/etcd.go"
python3 - "$source_dir" "$out" <<'PY'
import sys,pathlib,json,hashlib
source,out=map(pathlib.Path,sys.argv[1:])
original=source/'cmd/kubeadm/app/util/etcd/etcd.go'
data=original.read_text()
old='const etcdTimeout = 2 * time.Second'
assert data.count(old)==1,'La fuente no corresponde al parche revisado'
patched=data.replace(old,'// S2KTUX HA: conservar todas las comprobaciones, con plazo para CPU emulada.\nconst etcdTimeout = 60 * time.Second')
(out/'etcd.go').write_text(patched)
(out/'overlay.json').write_text(json.dumps({'Replace':{str(original):str(out/'etcd.go')}}))
(out/'LICENSE').write_bytes((source/'LICENSE').read_bytes())
if (source/'NOTICE').exists():(out/'NOTICE').write_bytes((source/'NOTICE').read_bytes())
(out/'fuente.json').write_text(json.dumps({'version':'v1.35.9','source':'https://github.com/kubernetes/kubernetes/tree/v1.35.9','originalSha256':hashlib.sha256(original.read_bytes()).hexdigest(),'patchedSha256':hashlib.sha256(patched.encode()).hexdigest(),'change':'etcdTimeout: 2s -> 60s; HA emulada, sin omitir TLS, salud o quorum'},indent=2))
PY
export GOCACHE="$build/cache" GOMODCACHE="$build/modules" GOTOOLCHAIN=local
export GOOS=linux GOARCH=386 CGO_ENABLED=0 GOMAXPROCS=2
cd "$source_dir"
nice -n 10 "$build/go/bin/go" build -p 1 -mod=vendor -overlay="$out/overlay.json" -trimpath -ldflags '-s -w -X k8s.io/component-base/version.gitVersion=v1.35.9+s2ktux.ha.etcd60s -X k8s.io/component-base/version.gitMajor=1 -X k8s.io/component-base/version.gitMinor=35 -X k8s.io/component-base/version.gitTreeState=dirty' -o "$out/kubeadm" ./cmd/kubeadm
file "$out/kubeadm"
sha256sum "$out/kubeadm" >"$out/SHA256SUMS"
gzip -n -c "$out/kubeadm" >"$out/kubeadm.gz"
sha256sum "$out/kubeadm.gz"
