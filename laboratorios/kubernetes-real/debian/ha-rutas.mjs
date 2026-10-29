import {HA} from './ha-configuracion.mjs?v=8d3e35d945d5f5a8';
// La CNI bridge del laboratorio necesita rutas reales entre los PodCIDR.
// Persistirlas como unidad nativa sin reconfigurar eth0 ni retirar el VIP.
export function unidadRutasHA(index,cidrs){
 if(!Number.isInteger(index)||index<1||index>3||!Array.isArray(cidrs)||cidrs.length!==3||new Set(cidrs).size!==3||!cidrs.every(cidr=>/^10\.244\.(?:0|[1-9][0-9]{0,2})\.0\/24$/.test(cidr)&&Number(cidr.split('.')[2])<256))throw Error('PodCIDR HA inválidos');
 const routes=HA.members.flatMap((node,peer)=>peer+1===index?[]:[`ExecStart=/sbin/ip route replace ${cidrs[peer]} via ${node.ip} dev eth0`]);
 return '[Unit]\nDescription=Rutas PodCIDR del laboratorio HA\nWants=network-online.target\nAfter=network-online.target\n[Service]\nType=oneshot\nRemainAfterExit=yes\n'+routes.join('\n')+'\n[Install]\nWantedBy=multi-user.target\n';
}
