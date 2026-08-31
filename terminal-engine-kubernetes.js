export default {
  mode: 'kubernetes',
  system: {
    distribution: 'Rocky Linux',
    release: '9.4',
    codename: 'Blue Onyx',
    id: 'rocky',
    kernel: '5.14.0-427.el9.x86_64',
    architecture: 'x86_64',
    kubernetes: '1.35.0'
  },
  environment: {
    eyebrow: 'SANDBOX · KUBERNETES / CKA',
    heading: 'Terminal Kubernetes · CKA',
    machine: 'CLÚSTER · CKA-LAB',
    os: 'Kubernetes v1.35 · 3 nodos',
    cheat: 'CHEATSHEET · KUBERNETES / CKA',
    practice: 'PRÁCTICAS GUIADAS · CKA',
    host: 'control-plane',
    description: 'Un clúster Kubernetes simulado para practicar workloads, configuración, scheduling, almacenamiento, red, RBAC, administración y troubleshooting.'
  },
  commandSet: 'linux-kubernetes',
  commands: ['kubectl','kubeadm','kubelet','etcdctl','crictl','jq'],
  workerCommands: ['kubectl','kubeadm','kubelet','etcdctl','crictl'],
  map: { zone: 'kubernetes', title: 'CENTRO DE CONTROL', accent: '#6b5a8e' }
};
