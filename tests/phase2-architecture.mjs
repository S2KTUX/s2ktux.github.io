import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createTerminalSimulationClient } from '../terminal-worker-client.js';
import { createDefaultProcesses } from '../terminal-process-state.js';
import { defaultDockerImageCommand, dockerRegistryMetadata, DOCKER_REGISTRY_CATALOG, parseDockerImageReference } from '../terminal-docker-state.js';
import { createDefaultKubernetesState } from '../terminal-kubernetes-state.js';
import { formatPublishedPorts, isIPv4Address, parsePublishedPort, publishedPortEntries, sharesIpv4Subnet } from '../terminal-network-state.js';
import { createDirectory, createFile, displayVirtualPath, ensureVirtualDirectory, hasVirtualPermission, normalizeVirtualPath, resolveVirtualNode } from '../terminal-virtual-fs.js';
import { TERMINAL_WORKER_PROTOCOL, WORKER_OPERATIONS, createWorkerRequest, isWorkerEnvelope } from '../terminal-worker-protocol.js';

const read=path=>readFile(new URL('../'+path,import.meta.url),'utf8');
const root=createDirectory({etc:createDirectory({hostname:createFile('lab')})});
ensureVirtualDirectory(root,'/var/lib/containers',{owner:'root'});
root.children.etc.children.host=createFile('',{owner:'root'});
root.children.etc.children.alias={type:'symlink',target:'host',mode:'rwxrwxrwx',owner:'root',group:'root'};

assert.deepEqual(normalizeVirtualPath('../tmp',['home','ana'],['home','ana']),['home','tmp']);
assert.equal(displayVirtualPath(['home','ana','docs'],['home','ana']),'~/docs');
assert.equal(resolveVirtualNode(root,['etc','alias']).content,'');
assert.equal(resolveVirtualNode(root,['var','lib','containers']).type,'dir');
assert.equal(hasVirtualPermission(root.children.etc.children.hostname,'r','ana',{ana:{groups:['users']}}),true);
assert.ok(createDefaultProcesses().some(process=>process.pid===1&&process.cmd.includes('systemd')));
assert.equal(defaultDockerImageCommand('nginx').includes('nginx'),true);
assert.deepEqual(parseDockerImageReference('docker.io/library/nginx:1.27'),{repo:'nginx',tag:'1.27'});
assert.equal(dockerRegistryMetadata('debian').official,true);
assert.ok(DOCKER_REGISTRY_CATALOG.length>=20);
const initialCluster=createDefaultKubernetesState('v1.35.0');
assert.equal(initialCluster.nodes[0].version,'v1.35.0');
assert.equal(initialCluster.pods.find(pod=>pod.name==='api-broken').status,'CrashLoopBackOff');
assert.equal(isIPv4Address('192.168.1.20'),true);
assert.equal(isIPv4Address('999.168.1.20'),false);
assert.equal(sharesIpv4Subnet('192.168.1.20','192.168.1.99',24),true);
assert.equal(sharesIpv4Subnet('192.168.2.20','192.168.1.99',24),false);
assert.deepEqual(parsePublishedPort('127.0.0.1:8080:80/udp'),{hostIp:'127.0.0.1',hostPort:8080,containerPort:80,protocol:'udp',explicitIp:true});
assert.equal(publishedPortEntries('8080:80, 8443:443').length,2);
assert.match(formatPublishedPorts('8080:80, 8443:443'),/0\.0\.0\.0:8080->80\/tcp.*0\.0\.0\.0:8443->443\/tcp/);

const request=createWorkerRequest(7,WORKER_OPERATIONS.SHELL_ANALYZE,{source:'echo ok'});
assert.equal(request.protocol,TERMINAL_WORKER_PROTOCOL);
assert.equal(TERMINAL_WORKER_PROTOCOL,2);
assert.equal(WORKER_OPERATIONS.KUBERNETES_EXECUTE,'kubernetes.execute');
assert.equal(WORKER_OPERATIONS.KUBERNETES_REBOOT,'kubernetes.reboot');
assert.equal(isWorkerEnvelope(request),true);
assert.equal(isWorkerEnvelope({id:7,protocol:99}),false);

const fallback=await createTerminalSimulationClient('linux');
assert.equal(fallback.kind,'fallback','Node debe usar el fallback sin una API Worker global');
assert.equal((await fallback.analyzeShellInput("echo 'sin cerrar")).complete,false);

const bootstrap=await read('terminal-bootstrap.js');
const worker=await read('terminal-simulation-worker.js');
const core=await read('terminal-core.js');
assert.match(bootstrap,/Promise\.all\([\s\S]*terminal-worker-client/,'El Worker debe arrancar en paralelo con los motores');
assert.doesNotMatch(worker,/\bdocument\b|\bwindow\b|localStorage|sessionStorage/,'El Worker no debe acceder a la interfaz ni al almacenamiento web');
assert.match(worker,/KUBERNETES_EXECUTE[\s\S]*executeKubernetes/,'El Worker debe ejecutar el runtime Kubernetes, no solo el parser');
assert.match(worker,/repairKubernetesState[\s\S]*rebootKubernetes/,'La reconciliación y el reinicio Kubernetes deben vivir en el Worker');
assert.match(core,/simulation\.executeKubernetes/,'El hilo principal debe delegar los comandos Kubernetes al Worker');
assert.match(core,/s2ktux-kubernetes-state/,'El hilo principal debe publicar el estado visual recibido');

for(const page of ['index.html','cursos.html','proyectos.html','proyecto-proxmox.html','proyecto-kubernetes.html','sobre.html']){
  const html=await read(page);
  assert.doesNotMatch(html,/support\.js|<\/?x-dc>/,page+' ya es HTML estático y no debe cargar el runtime casero');
}

console.log('phase 2 architecture: VFS modular, protocol stable and static pages independent');
