// El Job de kubeadm 1.36 usa el repositorio configurado del clúster. El
// alias privado apunta al pause.c real del kit; no es una imagen oficial.
// Prepararlo en CADA worker evita intentar descargar un repositorio privado
// que solo existe offline dentro de este laboratorio.
export const ordenImagenSaludWorker=`set -eu; ctr -n k8s.io images ls >/tmp/qa-pause-images.txt; source=$(awk '$1=="docker.io/s2ktux/pause-lab:1" {print $3}' /tmp/qa-pause-images.txt); test -n "$source"; actual=$(awk '$1=="docker.io/s2ktux/pause:3.10.2" {print $3}' /tmp/qa-pause-images.txt); if test -n "$actual"; then test "$actual" = "$source"; else ctr -n k8s.io images tag docker.io/s2ktux/pause-lab:1 docker.io/s2ktux/pause:3.10.2; fi; ctr -n k8s.io images ls | awk -v digest="$source" '$1=="docker.io/s2ktux/pause:3.10.2" && $3==digest {found=1} END {exit !found}'`;
