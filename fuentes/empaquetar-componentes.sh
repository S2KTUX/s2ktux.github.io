#!/bin/bash
set -Eeuo pipefail
build=/home/s2ktux/kubernetes-browser-build-20261012
project=/mnt/d/RIVALIA/prototipo-contenedores-web/kubernetes-real
out="$project/componentes"
version="${1:-v1}"
case "$version" in v1) image="$out/componentes.ext4";; v2|v3) image="$out/componentes-$version.ext4";; *) exit 2;; esac
mkdir -p "$out/root/bin"
test ! -e "$image"
for name in kubeadm kube-apiserver kubelet kube-controller-manager kube-scheduler kube-proxy etcd etcdctl etcdutl; do
 install -m 755 "$build/bin/$name" "$out/root/bin/$name"
done
install -m 755 "$project/fixture/root/bin/kubectl" "$out/root/bin/kubectl"
if [ "$version" != v1 ]; then
 mkdir -p "$out/root/cni" "$out/root/images"
 install -m 755 "$build/cni/"* "$out/root/cni/"
 bundle=pods-v1.tar.gz
 if [ "$version" = v3 ]; then bundle=pods-v2.tar.gz; fi
 install -m 644 "$project/imagenes/$bundle" "$out/root/images/pods.tar.gz"
fi
test ! -e "$image"
truncate -s 768M "$image"
mkfs.ext4 -q -F -m 0 -L KUBE_COMPONENTS -d "$out/root" "$image"
sha256sum "$image"
du -h "$out/root/bin/"*
