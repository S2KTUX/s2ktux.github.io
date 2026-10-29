// Prototipo de infraestructura HA independiente: no convierte los workers actuales.
export const HA=Object.freeze({vip:'10.77.0.100',port:8443,members:Object.freeze([10,11,12].map((last,index)=>Object.freeze({name:'cka-cp'+(index+1),ip:'10.77.0.'+last,priority:150-index*10})))});
export function configuracionHA(index,{readyMembers=3}={}){
 if(!Number.isInteger(index)||index<1||index>3||!Number.isInteger(readyMembers)||readyMembers<1||readyMembers>3)throw Error('Control plane HA desconocido');
 const node=HA.members[index-1],peers=HA.members.filter(member=>member!==node);
 return {node,haproxy:`global
  maxconn 128
  nbthread 1
  user haproxy
  group haproxy
defaults
  mode tcp
  timeout connect 5s
  timeout client 10m
  timeout server 10m
frontend kubernetes-api
  bind 0.0.0.0:${HA.port}
  default_backend control-planes
backend control-planes
  balance roundrobin
  option tcp-check
${HA.members.map((member,memberIndex)=>`  server ${member.name} ${member.ip}:6443 check inter 5s fall 2 rise 1${memberIndex>=readyMembers?' disabled':''}`).join('\n')}
`,keepalived:`global_defs {
  router_id ${node.name.replaceAll('-','_')}
}
vrrp_instance API_VIP {
  state BACKUP
  interface eth0
  virtual_router_id 77
  priority ${node.priority}
  advert_int 2
  unicast_src_ip ${node.ip}
  unicast_peer {
${peers.map(peer=>'    '+peer.ip).join('\n')}
  }
  virtual_ipaddress {
    ${HA.vip}/24 dev eth0
  }
}
`,daemonArgs:'DAEMON_ARGS="--vrrp"\n',keepalivedUnit:'[Unit]\nBindsTo=haproxy.service\nAfter=haproxy.service\nPartOf=haproxy.service\n[Install]\nWantedBy=haproxy.service\n'};
}
