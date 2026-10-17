#!/bin/bash
set -Eeuo pipefail
build=/home/s2ktux/kubernetes-browser-build-20261012
project=/mnt/d/RIVALIA/prototipo-contenedores-web/kubernetes-real
version="${1:-v4}"
case "$version" in v4) binary=kube-browser-shared-v2;; v5|v6) binary=kube-browser-ecdsa-v3;; *) exit 2;; esac
stage="$build/shared-disk-$version"
raw="$build/componentes-$version.ext4"
destination="$project/componentes/componentes-$version.ext4"
test ! -e "$stage"
test ! -e "$raw"
test ! -e "$destination"
mkdir -p "$stage/bin" "$stage/cni" "$stage/images"
install -m 755 "$build/bin/$binary" "$stage/bin/kube-browser-shared"
for name in kube-apiserver kube-controller-manager kube-scheduler kubelet; do
 ln -s kube-browser-shared "$stage/bin/$name"
done
for name in kubeadm kube-proxy etcd etcdctl etcdutl; do
 install -m 755 "$build/bin/$name" "$stage/bin/$name"
done
install -m 755 "$project/fixture/root/bin/kubectl" "$stage/bin/kubectl"
install -m 755 "$build/cni/"* "$stage/cni/"
install -m 644 "$project/imagenes/pods-v2.tar.gz" "$stage/images/pods.tar.gz"
if [ "$version" = v5 ] || [ "$version" = v6 ]; then
 mkdir "$stage/serving"
 install -m 644 "$project/componentes/serving/"*.crt "$stage/serving/"
 install -m 600 "$project/componentes/serving/"*.key "$stage/serving/"
fi
if [ "$version" = v6 ]; then
 install -m 755 "$build/bin/netpol-v1.1.2" "$stage/bin/netpol"
 mkdir -p "$stage/licenses/netpol"
 install -m 644 "$build/kube-network-policies-1.1.2/LICENSE" "$stage/licenses/netpol/LICENSE"
fi
# Crear ext4 en el constructor evita miles de escrituras pequeñas sobre NTFS.
# Solo se copia el artefacto terminado; no se sustituye ninguna versión anterior.
truncate -s 768M "$raw"
mkfs.ext4 -q -F -m 0 -L KUBE_SHARED -d "$stage" "$raw"
sha256sum "$raw"
test ! -e "$destination"
cp -n "$raw" "$destination"
sha256sum "$destination"
