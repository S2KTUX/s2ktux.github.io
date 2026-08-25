export const createDefaultKubernetesState = (version) => ({
  namespace: 'default',
  nextIp: 10,
  nodes: [
    {name:'control-plane',status:'Ready',role:'control-plane',version,schedulable:true,labels:{'node-role.kubernetes.io/control-plane':'','kubernetes.io/hostname':'control-plane'},taints:['node-role.kubernetes.io/control-plane:NoSchedule']},
    {name:'worker-1',status:'Ready',role:'<none>',version,schedulable:true,labels:{'kubernetes.io/hostname':'worker-1','disk':'ssd'}},
    {name:'worker-2',status:'NotReady',role:'<none>',version,schedulable:true,labels:{'kubernetes.io/hostname':'worker-2','disk':'hdd'},taints:[]},
  ],
  namespaces: ['default','kube-system','kube-public','kube-node-lease'],
  pods: [
    {name:'api-broken',namespace:'default',image:'demo/api:broken',status:'CrashLoopBackOff',ready:'0/1',restarts:5,node:'worker-1',ip:'10.244.1.21'},
    {name:'coredns-7db6d8ff4d-2wz9p',namespace:'kube-system',image:'registry.k8s.io/coredns:v1.11.1',status:'Running',ready:'1/1',restarts:0,node:'control-plane',ip:'10.244.0.3'},
  ],
  deployments: [], replicasets: [], daemonsets: [], statefulsets: [], jobs: [], cronjobs: [], hpas: [],
  services: [{name:'kubernetes',namespace:'default',type:'ClusterIP',clusterIp:'10.96.0.1',port:'443/TCP',selector:{}}],
  configmaps: [], secrets: [], serviceaccounts: [{name:'default',namespace:'default'}], roles: [], rolebindings: [],
  pvcs: [], pvs: [], storageclasses: [{name:'local-path',provisioner:'rancher.io/local-path',default:true}],
  ingresses: [], networkpolicies: [],
  events: [
    {reason:'BackOff',object:'pod/api-broken',message:'Back-off restarting failed container api'},
    {reason:'NodeNotReady',object:'node/worker-2',message:'Node worker-2 status is now: NodeNotReady'},
  ],
  actions: [], etcdSnapshot: false, upgraded: false,
});
