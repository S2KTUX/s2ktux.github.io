#!/bin/bash
# Otra versión inmutable: no se mezcla con las fábricas ni guardados v5/v6.
set -Eeuo pipefail
build=/home/s2ktux/kubernetes-browser-build-20261012
project=/mnt/d/RIVALIA/prototipo-contenedores-web/kubernetes-real
stage="$build/shared-disk-v7"
raw="$build/componentes-v7.ext4"
destination="$project/componentes/componentes-v7.ext4"
test ! -e "$stage"; test ! -e "$raw"; test ! -e "$destination"
test -d "$build/shared-disk-v6"
cp -a "$build/shared-disk-v6" "$stage"
helm="$build/curso-v1/bin/helm-v3.20.0"
printf '%s  %s\n' d59f7dcc29f7fb9fd054fc3326855715da14f22b6ece7aca4ddab85bdb9aaf8d "$helm" | sha256sum --check
printf '%s  %s\n' 7d8de2f9583e3559c094cb37a54d18c06d37c233997f79088d16c74c723f381d "$project/imagenes/curso-v3/imagenes.tar.gz" | sha256sum --check
install -m 755 "$helm" "$stage/bin/helm"
install -m 644 "$project/imagenes/curso-v3/imagenes.tar.gz" "$stage/images/curso.tar.gz"
mkdir -p "$stage/licenses/helm"
install -m 644 "$build/curso-v1/sources/helm-v3.20.0/LICENSE" "$stage/licenses/helm/LICENSE"
truncate -s 768M "$raw"
mkfs.ext4 -q -F -m 0 -L KUBE_CURSO -d "$stage" "$raw"
test ! -e "$destination"
cp -n "$raw" "$destination"
sha256sum "$destination"
du -h "$stage"
