#!/bin/sh
# Prueba de los componentes reales antes de conectarlos a kubelet/CRI.
# No registra nodos ficticios ni simula Pods o sus estados.
set -eu
managed_start() {
 component="$1"; shift
 if [ -r "/run/$component-prototype.pid" ]; then
  supervisor=$(cat "/run/$component-prototype.pid")
  case "$supervisor" in ''|*[!0-9]*) echo 'PID de supervisor inválido' >&2; return 1;; esac
  if kill -0 "$supervisor" 2>/dev/null; then
   grep -aq supervise-daemon "/proc/$supervisor/cmdline" || { echo 'El PID no pertenece al supervisor' >&2; return 1; }
   return 0
  fi
 fi
 level=0
 case "$component" in kube-controller-manager|kube-scheduler) level=5;; esac
 RC_SVCNAME="$component" supervise-daemon "$component" --start \
  --pidfile="/run/$component-prototype.pid" --nicelevel="$level" \
  --respawn-delay=3 --respawn-max=5 --respawn-period=60 \
  --stdout="/var/log/$component.log" --stderr="/var/log/$component.log" \
  -- "/usr/local/bin/$component" "$@"
}
case "${1:-}" in
 certificados)
  kubeadm init phase certs all --config=/tmp/kubeadm-prototype.yaml >/var/log/kube-certs.log 2>&1
  kubeadm init phase kubeconfig all --config=/tmp/kubeadm-prototype.yaml >>/var/log/kube-certs.log 2>&1
  mkdir -p /root/.kube
  cp /etc/kubernetes/super-admin.conf /root/.kube/config
  ;;
 etcd)
  mkdir -p /var/lib/etcd
  ETCD_UNSUPPORTED_ARCH=386 managed_start etcd --name=controlplane --data-dir=/var/lib/etcd --listen-client-urls=http://127.0.0.1:2379 --advertise-client-urls=http://127.0.0.1:2379 --listen-peer-urls=http://127.0.0.1:2380 --initial-advertise-peer-urls=http://127.0.0.1:2380 --initial-cluster=controlplane=http://127.0.0.1:2380 --quota-backend-bytes=134217728
  for i in $(seq 1 30); do
   if etcdctl --endpoints=http://127.0.0.1:2379 --command-timeout=2s endpoint health; then exit 0; fi
   kill -0 "$(cat /run/etcd-prototype.pid)" || { tail -60 /var/log/etcd.log; exit 1; }
   sleep 1
  done
  tail -60 /var/log/etcd.log; exit 1
  ;;
 api)
  managed_start kube-apiserver \
   --etcd-servers=http://127.0.0.1:2379 \
   --client-ca-file=/etc/kubernetes/pki/ca.crt \
   --tls-cert-file=/etc/kubernetes/pki/apiserver.crt \
   --tls-private-key-file=/etc/kubernetes/pki/apiserver.key \
   --requestheader-client-ca-file=/etc/kubernetes/pki/front-proxy-ca.crt \
   --requestheader-allowed-names=front-proxy-client \
   --requestheader-extra-headers-prefix=X-Remote-Extra- \
   --requestheader-group-headers=X-Remote-Group \
   --requestheader-username-headers=X-Remote-User \
   --proxy-client-cert-file=/etc/kubernetes/pki/front-proxy-client.crt \
   --proxy-client-key-file=/etc/kubernetes/pki/front-proxy-client.key \
   --enable-aggregator-routing=true \
   --kubelet-client-certificate=/etc/kubernetes/pki/apiserver-kubelet-client.crt \
   --kubelet-client-key=/etc/kubernetes/pki/apiserver-kubelet-client.key \
   --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname \
   --service-cluster-ip-range=10.96.0.0/12 \
   --authorization-mode=Node,RBAC --enable-admission-plugins=NodeRestriction \
   --service-account-key-file=/etc/kubernetes/pki/sa.pub \
   --service-account-signing-key-file=/etc/kubernetes/pki/sa.key \
   --service-account-issuer=https://kubernetes.default.svc.cluster.local \
   --bind-address=0.0.0.0 --advertise-address=10.77.0.20 \
   --secure-port=6443 --allow-privileged=true --v=2
  deadline=$(($(date +%s) + 150))
  while [ "$(date +%s)" -lt "$deadline" ]; do
   if kubectl get --raw=/readyz --request-timeout=5s; then
    kubectl create clusterrolebinding kubeadm:cluster-admins --clusterrole=cluster-admin --group=kubeadm:cluster-admins --dry-run=client -o yaml | kubectl apply -f -
    # Mismo enlace limitado que crea kubeadm 1.35; no dar cluster-admin al cliente de kubelet.
    kubectl create clusterrolebinding kubeadm:kubelet-api-admin --clusterrole=system:kubelet-api-admin --user=kube-apiserver-kubelet-client --dry-run=client -o yaml | kubectl apply -f -
    cp /etc/kubernetes/admin.conf /root/.kube/config
    kubectl get --raw=/readyz --request-timeout=3s
    exit 0
   fi
   kill -0 "$(cat /run/kube-apiserver-prototype.pid)" || { tail -80 /var/log/kube-apiserver.log; exit 1; }
   sleep 1
  done
  tail -80 /var/log/kube-apiserver.log; exit 1
  ;;
 controladores)
  # Evitar la avalancha inicial de peticiones sobre una CPU emulada.
  # Todos los controladores y la elección de líder siguen activos.
  prior=$(kubectl -n kube-system get lease kube-controller-manager -o jsonpath='{.spec.holderIdentity}' --request-timeout=5s 2>/dev/null) || prior=''
  managed_start kube-controller-manager \
   --controller-start-interval=250ms --kube-api-qps=10 --kube-api-burst=15 \
   --leader-elect-lease-duration=60s --leader-elect-renew-deadline=40s --leader-elect-retry-period=5s \
   --use-service-account-credentials=true \
   --kubeconfig=/etc/kubernetes/controller-manager.conf \
   --authentication-kubeconfig=/etc/kubernetes/controller-manager.conf \
   --authorization-kubeconfig=/etc/kubernetes/controller-manager.conf \
   --root-ca-file=/etc/kubernetes/pki/ca.crt \
   --service-account-private-key-file=/etc/kubernetes/pki/sa.key \
   --cluster-signing-cert-file=/etc/kubernetes/pki/ca.crt \
   --cluster-signing-key-file=/etc/kubernetes/pki/ca.key \
   --cluster-cidr=192.168.0.0/16 --service-cluster-ip-range=10.96.0.0/12 \
   --allocate-node-cidrs=true --bind-address=127.0.0.1 --v=2
  deadline=$(($(date +%s) + 210))
  while [ "$(date +%s)" -lt "$deadline" ]; do
   holder=$(kubectl -n kube-system get lease kube-controller-manager -o jsonpath='{.spec.holderIdentity}' --request-timeout=5s 2>/dev/null) || holder=''
   if [ -n "$holder" ] && [ "$holder" != "$prior" ] && kubectl get serviceaccount default --request-timeout=5s; then exit 0; fi
   kill -0 "$(cat /run/kube-controller-manager-prototype.pid)" || { tail -80 /var/log/kube-controller-manager.log; exit 1; }
   sleep 3
  done
  tail -80 /var/log/kube-controller-manager.log; exit 1
  ;;
 scheduler)
  prior=$(kubectl -n kube-system get lease kube-scheduler -o jsonpath='{.spec.holderIdentity}' --request-timeout=5s 2>/dev/null) || prior=''
  managed_start kube-scheduler \
   --leader-elect-lease-duration=60s --leader-elect-renew-deadline=40s --leader-elect-retry-period=5s \
   --kubeconfig=/etc/kubernetes/scheduler.conf \
   --authentication-kubeconfig=/etc/kubernetes/scheduler.conf \
   --authorization-kubeconfig=/etc/kubernetes/scheduler.conf \
   --bind-address=127.0.0.1 --v=2
  deadline=$(($(date +%s) + 120))
  while [ "$(date +%s)" -lt "$deadline" ]; do
   holder=$(kubectl -n kube-system get lease kube-scheduler -o jsonpath='{.spec.holderIdentity}' --request-timeout=5s 2>/dev/null) || holder=''
   if [ -n "$holder" ] && [ "$holder" != "$prior" ]; then exit 0; fi
   kill -0 "$(cat /run/kube-scheduler-prototype.pid)" || { tail -80 /var/log/kube-scheduler.log; exit 1; }
   sleep 3
  done
  tail -80 /var/log/kube-scheduler.log; exit 1
  ;;
 runtime)
  mkdir -p /opt/cni/bin /etc/cni/net.d /etc/containerd /etc/kubernetes/manifests
  for plugin in /mnt/kube-client/cni/*; do ln -sf "$plugin" "/opt/cni/bin/${plugin##*/}"; done
  cp /tmp/containerd-prototype.toml /etc/containerd/config.toml
  cp /tmp/cni-prototype.conflist /etc/cni/net.d/10-kubernetes.conflist
  ln -sf /usr/bin/containerd /usr/local/bin/containerd
  managed_start containerd --config=/etc/containerd/config.toml
  for i in $(seq 1 30); do
   if ctr plugins ls | awk '$1=="io.containerd.grpc.v1" && $2=="cri" && $NF=="ok" {found=1} END {exit !found}'; then break; fi
   sleep 1
  done
  ctr plugins ls | awk '$1=="io.containerd.grpc.v1" && $2=="cri" && $NF=="ok" {found=1} END {exit !found}'
  gzip -dc /mnt/kube-client/images/pods.tar.gz | ctr -n k8s.io images import --platform=linux/386 -
  managed_start kubelet --config=/tmp/kubelet-prototype.yaml --kubeconfig=/etc/kubernetes/kubelet.conf --hostname-override=controlplane --node-ip=10.77.0.20 --v=2
  deadline=$(($(date +%s) + 90))
  while ! kubectl get node controlplane --request-timeout=5s; do
   [ "$(date +%s)" -lt "$deadline" ] || { tail -80 /var/log/kubelet.log; exit 1; }
   sleep 2
  done
  kubectl wait --for=condition=Ready node/controlplane --timeout=150s
  ;;
 proxy)
  kubeadm kubeconfig user --client-name=system:kube-proxy --config=/tmp/kubeadm-prototype.yaml >/etc/kubernetes/kube-proxy.conf
  chmod 600 /etc/kubernetes/kube-proxy.conf
  managed_start kube-proxy --kubeconfig=/etc/kubernetes/kube-proxy.conf --proxy-mode=iptables --cluster-cidr=192.168.0.0/16 --hostname-override=controlplane --bind-address=10.77.0.20 --v=2
  ;;
 *) echo 'Fase inválida' >&2; exit 2 ;;
esac
