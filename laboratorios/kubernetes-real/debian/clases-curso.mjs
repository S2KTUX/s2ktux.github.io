// El orden pertenece al curso del usuario. No incluye la clase 35.
const titles=[
 'Fundamentos de Kubernetes','Preparación del laboratorio','Pods','ReplicaSet','Deployment','Services','Namespaces',
 'Requests y limits','LimitRange y ResourceQuota','Probes y Health Checks (Sondas)','Variables de entorno y ConfigMap','Secrets','Volúmenes',
 'RBAC: usuarios y grupos','ServiceAccount','Ingress','DaemonSets','StatefulSets','Jobs y CronJobs',
 'Scheduling I: nodeSelector y Node Affinity','Scheduling II: Taints y Tolerations','NetworkPolicies','CoreDNS y descubrimiento de servicios','Gateway API',
 'Static Pods, control plane y HA esencial','kubeadm init y CNI','kubeadm join: nodos, tokens y certificados','Mantenimiento y actualización del clúster',
 'Backup y restauración de etcd','Autoscaling: Metrics Server y HPA','Helm y Kustomize','CRD y Operators',
 'Troubleshooting de Pods','Troubleshooting de nodos y control plane','Troubleshooting de red y almacenamiento'
];
export function nivelClase(number){if(!Number.isInteger(number)||number<0||number>34)throw Error('Clase fuera del curso');return number<=6?'inicial':number<=23?'intermedio':'avanzado';}
export const CLASES=Object.freeze(titles.map((title,number)=>Object.freeze({number,id:String(number).padStart(2,'0'),title,level:nivelClase(number)})));
export function clasesNivel(level){if(!['inicial','intermedio','avanzado'].includes(level))throw Error('Etapa desconocida');return CLASES.filter(item=>item.level===level);}
export function claseDesdeURL(params,level){const value=params.get('clase');const number=value===null?clasesNivel(level)[0].number:Number(value);if(value!==null&&!/^\d{1,2}$/.test(value)||nivelClase(number)!==level)throw Error('La clase no pertenece a esta etapa');return number;}
