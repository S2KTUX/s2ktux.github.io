export default {
  mode: 'kubernetes',
  environment: {
    eyebrow: 'SANDBOX · KUBERNETES / CKA',
    heading: 'Terminal Kubernetes · CKA',
    machine: 'CLÚSTER · CKA-LAB',
    os: 'Kubernetes v1.30 · 3 nodos',
    cheat: 'CHEATSHEET · KUBERNETES / CKA',
    practice: 'PRÁCTICAS GUIADAS · CKA',
    host: 'control-plane',
    description: 'Un clúster Kubernetes simulado para practicar workloads, configuración, scheduling, almacenamiento, red, RBAC, administración y troubleshooting.'
  },
  commandSet: 'linux-kubernetes',
  commands: ['kubectl','kubeadm','kubelet','etcdctl','crictl','jq'],
  map: { zone: 'kubernetes', title: 'CENTRO DE CONTROL', accent: '#6b5a8e' }
};
