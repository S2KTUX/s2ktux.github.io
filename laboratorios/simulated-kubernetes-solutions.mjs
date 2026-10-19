// Ayuda bajo demanda: conserva las preguntas y sus correctores originales.
export const solutions=[
 'kubectl config current-context\nkubectl config get-contexts\nkubectl cluster-info\nkubectl get nodes',
 'kubectl create namespace cka-lab\nkubectl -n cka-lab run shell --image=nginx\nkubectl -n cka-lab get pods',
 'kubectl create deployment frontend --image=nginx\nkubectl scale deployment frontend --replicas=3\nkubectl expose deployment frontend --port=80\nkubectl get deployments,services',
 'kubectl set image deployment/frontend nginx=nginx:1.27\nkubectl rollout status deployment/frontend\nkubectl rollout history deployment/frontend\nkubectl rollout undo deployment/frontend',
 'kubectl create configmap app-config --from-literal=MODO=curso\nkubectl create secret generic app-secret --from-literal=CLAVE=practica\nkubectl apply -f /root/manifests/pod-config.yaml\nkubectl get pods',
 'vi /root/manifests/pod-config.yaml\n# Comprueba que image: nginx:1.27 es la imagen del contenedor.\nkubectl apply -f /root/manifests/pod-config.yaml\nkubectl get pods',
 'kubectl label node worker-1 entorno=produccion\nkubectl taint nodes worker-2 reservado=curso:NoSchedule\nkubectl describe node worker-1\nkubectl describe node worker-2',
 'kubectl cordon worker-1\nkubectl drain worker-1 --ignore-daemonsets --delete-emptydir-data\nkubectl uncordon worker-1\nkubectl get nodes',
 `kubectl apply -f - <<'EOF'
apiVersion: v1
kind: PersistentVolume
metadata:
  name: datos-locales
spec:
  capacity:
    storage: 1Gi
  accessModes: [ReadWriteOnce]
  storageClassName: cka-local
  hostPath:
    path: /mnt/datos
EOF
kubectl apply -f /root/manifests/storage.yaml
kubectl get pv,pvc,storageclass
kubectl describe pvc datos-app`,
 'kubectl get services\nkubectl describe service frontend\nkubectl get deployments --show-labels\nkubectl get pods --show-labels',
 'kubectl apply -f /root/manifests/network.yaml\nkubectl get ingress\nkubectl get networkpolicy',
 'kubectl create serviceaccount auditor\nkubectl create role pod-reader --verb=get,list,watch --resource=pods\nkubectl create rolebinding auditor-read --role=pod-reader --serviceaccount=default:auditor\nkubectl auth can-i list pods --as=system:serviceaccount:default:auditor\nkubectl auth can-i delete pods --as=system:serviceaccount:default:auditor',
 'kubectl describe pod api-broken\nkubectl logs api-broken\nkubectl get events\nkubectl set image pod/api-broken api=nginx:1.27\nkubectl get pods',
 'kubectl describe node worker-2\nssh root@worker-2\n# Contraseña: cka\nsystemctl status kubelet\njournalctl -u kubelet\nsystemctl restart kubelet\nexit\nkubectl get nodes',
 'etcdctl endpoint health\netcdctl snapshot save /root/etcd-cka.db\netcdctl snapshot status /root/etcd-cka.db',
 'kubeadm upgrade plan\n# Usa la versión que propone el comando anterior.\nkubeadm upgrade apply VERSION_PROPUESTA\nkubectl get nodes',
 '# Primero resuelve los ejercicios de api-broken y worker-2.\nkubectl get all\nkubectl get pods\nkubectl get events\nkubectl top nodes\nkubectl top pods',
];
