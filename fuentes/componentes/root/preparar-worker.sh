#!/bin/sh
set -eu
mkdir -p /etc/containerd /etc/cni/net.d /opt/cni/bin /etc/kubernetes/manifests /var/lib/kubelet
printf 'net.ipv4.ip_forward = 1\n' >/etc/sysctl.d/99-kubernetes.conf
sysctl -p /etc/sysctl.d/99-kubernetes.conf
for plugin in /mnt/kube-client/cni/*; do ln -sf "$plugin" "/opt/cni/bin/${plugin##*/}"; done
cp /tmp/containerd-prototype.toml /etc/containerd/config.toml
cp /tmp/kubelet-openrc /etc/init.d/kubelet
cp /tmp/containerd-openrc /etc/init.d/containerd
cp /tmp/kube-proxy-openrc /etc/init.d/kube-proxy
cp /tmp/worker-interfaces /etc/network/interfaces
chmod 755 /etc/init.d/kubelet /etc/init.d/containerd /etc/init.d/kube-proxy
rc-update del docker default >/dev/null 2>&1 || true
rc-update add containerd default
rc-service containerd start
for i in $(seq 1 30); do
 if ctr plugins ls | awk '$1=="io.containerd.grpc.v1" && $2=="cri" && $NF=="ok" {found=1} END {exit !found}'; then break; fi
 sleep 1
done
ctr plugins ls | awk '$1=="io.containerd.grpc.v1" && $2=="cri" && $NF=="ok" {found=1} END {exit !found}'
gzip -dc /mnt/kube-client/images/pods.tar.gz | ctr -n k8s.io images import --platform=linux/386 -
rc-update add kubelet default
