const orderedIds=['controlplane','worker1','worker2'];

// El orden de carga de los iframes no debe cambiar el formato del guardado.
export function ordenarNodosDebian(nodes,{progressive=false}={}){
 if(typeof progressive!=='boolean'||!(nodes instanceof Map)||nodes.size<(progressive?1:2)||nodes.size>3||!nodes.has('controlplane')||(nodes.size>1&&!nodes.has('worker1'))||[...nodes.keys()].some(id=>!orderedIds.includes(id)))throw Error('Nodos del clúster inválidos');
 return orderedIds.filter(id=>nodes.has(id)).map(id=>[id,nodes.get(id)]);
}

export function comandoNatDebian({preserveExisting=false}={}){
 if(typeof preserveExisting!=='boolean')throw Error('Modo NAT inválido');
 const rules=['iptables -t nat -N KUBE-LAB-MASQ'];
 // Primero devolver los paquetes marcados por kube-proxy (masqueradeBit=14)
 // a POSTROUTING: el hairpin hacia el propio Service necesita su SNAT.
 // ACCEPT conserva el origen del resto del tráfico interno frente al NAT
 // antiguo de CNI, sin saltarse las NetworkPolicies (tabla filter).
 if(preserveExisting){rules.push('iptables -t nat -A KUBE-LAB-MASQ -m mark --mark 0x4000/0x4000 -j RETURN');rules.push('iptables -t nat -A KUBE-LAB-MASQ -s 10.244.0.0/16 -d 10.244.0.0/16 -j ACCEPT');}
 rules.push('iptables -t nat -A KUBE-LAB-MASQ -s 10.244.0.0/16 ! -d 10.244.0.0/16 -j MASQUERADE');
 rules.push(`iptables -t nat -${preserveExisting?'I':'A'} POSTROUTING${preserveExisting?' 1':''} -j KUBE-LAB-MASQ`);
 return rules.join(' && ');
}
