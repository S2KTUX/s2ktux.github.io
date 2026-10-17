import {hashBytes} from '/laboratorios/docker-real/v86-sessions.mjs';
import {comandosArchivoGzipWeb} from './archivos-gzip-web.mjs';
const manifestHash='878c04da0d1080c0156dcb3e5c59e69a60c434e623ccd4e3b6e4eb8f7b5a4c50';
export async function prepararRedPoliticasDebian(id,run){
 if(!['worker1','worker2'].includes(id))throw Error('Las políticas se preparan en workers conocidos');
 await run(id,'Preparar filtrado nativo de red','test -S /var/run/nri/nri.sock && mkdir -p /run/netns && { mountpoint -q /run/netns || mount --bind /run/netns /run/netns; } && mount --make-rshared /run/netns');
}
export async function instalarPoliticasDebian(run){
 const response=await fetch(new URL('../componentes/root/network-policies.yaml',import.meta.url));if(!response.ok)throw Error('Controlador de políticas no disponible');
 const bytes=await response.arrayBuffer();if(await hashBytes(bytes)!==manifestHash)throw Error('El controlador de políticas ha cambiado');
 for(const command of await comandosArchivoGzipWeb('/tmp/network-policies.yaml',new TextDecoder('utf-8',{fatal:true}).decode(bytes)))await run('controlplane','Preparar controlador de NetworkPolicies',command);
 await run('controlplane','Instalar NetworkPolicies reales','kubectl apply --validate=strict --request-timeout=120s -f /tmp/network-policies.yaml && kubectl -n kube-system rollout status daemonset/kube-network-policies --timeout=180s',240000);
}
