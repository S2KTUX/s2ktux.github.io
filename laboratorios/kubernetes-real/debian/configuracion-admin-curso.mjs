// Adaptación explícita de la configuración privada ya probada; no reescribe
// guiones ni utiliza opciones que omitan TLS, RBAC o comprobaciones de salud.
import {HA} from './ha-configuracion.mjs?v=5750fd1d5858b97c';
import {configurarTiemposEtcd} from './tiempos-etcd.mjs?v=3d68df3331a80341';
export function configuracionInitHA(original){
 for(const expected of ['name: controlplane','cgroupDriver: cgroupfs','controlPlaneEndpoint: 10.77.0.20:6443','podSubnet: 192.168.0.0/16'])if(!original.includes(expected))throw Error('Plantilla de kubeadm inesperada: '+expected);
 let text=original.replaceAll('\r\n','\n').replace('name: controlplane','name: cka-cp1').replace('cgroupDriver: cgroupfs','cgroupDriver: systemd')
 .replace('controlPlaneEndpoint: 10.77.0.20:6443',`controlPlaneEndpoint: ${HA.vip}:${HA.port}`).replaceAll('10.77.0.20','10.77.0.10').replace('192.168.0.0/16','10.244.0.0/16')
 .replace('      value: 10.77.0.10','      value: 10.77.0.10\n    - name: housekeeping-interval\n      value: 30s');
 for(const name of ['apiServer','controllerManager','scheduler']){
  const key=name+':\n';if(text.split(key).length!==2)throw Error('Configuración ambigua: '+name);
  text=text.replace(key,key+'  extraEnvs:\n    - name: GODEBUG\n      value: tlsmlkem=0\n');
 }
 const etcd='    extraEnvs:\n      - name: ETCD_UNSUPPORTED_ARCH';if(text.split(etcd).length!==2)throw Error('Entorno etcd ambiguo');
 // Tiempos nativos uniformes para tres CPUs emuladas, no quorum simulado.
 text=configurarTiemposEtcd(text);
 return text.replace(etcd,'    extraEnvs:\n      - name: GODEBUG\n        value: tlsmlkem=0\n      - name: ETCD_UNSUPPORTED_ARCH');
}
export function configuracionJoinHA(index,{token,hash,certificateKey}){
 if(![2,3].includes(index)||!/^[a-z0-9]{6}\.[a-z0-9]{16}$/.test(token)||!/^[a-f0-9]{64}$/.test(hash)||!/^[a-f0-9]{64}$/.test(certificateKey))throw Error('Datos de incorporación HA inválidos');
 const node=HA.members[index-1];
 return `apiVersion: kubeadm.k8s.io/v1beta4
kind: JoinConfiguration
nodeRegistration:
  name: ${node.name}
  criSocket: unix:///run/containerd/containerd.sock
  kubeletExtraArgs:
    - name: node-ip
      value: ${node.ip}
    - name: housekeeping-interval
      value: 30s
discovery:
  bootstrapToken:
    apiServerEndpoint: ${HA.vip}:${HA.port}
    token: "${token}"
    caCertHashes:
      - sha256:${hash}
controlPlane:
  certificateKey: "${certificateKey}"
  localAPIEndpoint:
    advertiseAddress: ${node.ip}
    bindPort: 6443
patches:
  directory: /etc/kubernetes/patches
timeouts:
  controlPlaneComponentHealthCheck: 10m
  discovery: 5m
  etcdAPICall: 5m
  kubernetesAPICall: 5m
`;
}
