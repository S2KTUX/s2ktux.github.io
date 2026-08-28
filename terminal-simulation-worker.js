import { analyzeShellInput, parseRedirections } from './terminal-shell-parser.js';
import { validateCommandInvocation } from './terminal-command-schema.js';
import { WORKER_OPERATIONS, createWorkerEvent, createWorkerFailure, createWorkerResponse, isWorkerEnvelope } from './terminal-worker-protocol.js';

let kubernetesSession=null;
let kubernetesGeneration=0;
let kubernetesRuntime=null,virtualFs=null;
let dockerSession=null,dockerRuntime=null;
const loadDockerEngine=async()=>{if(!dockerRuntime)dockerRuntime=await import('./terminal-docker-command.js');};
const loadKubernetesEngine=async()=>{if(kubernetesRuntime)return;const [runtimeModule,fsModule]=await Promise.all([import('./terminal-runtime-kubernetes.js'),import('./terminal-virtual-fs.js')]);kubernetesRuntime=runtimeModule.default;virtualFs=fsModule;};

const clone=value=>structuredClone(value);
const repairKubernetesState=(state,version)=>{
  if(!Number.isFinite(state.nextIp))state.nextIp=10;
  if(!Array.isArray(state.events))state.events=[];
  if(!Array.isArray(state.replicasets))state.replicasets=[];
  for(const collection of ['daemonsets','statefulsets','jobs','cronjobs','hpas'])if(!Array.isArray(state[collection]))state[collection]=[];
  for(const node of state.nodes||[])if(/^v1\.(?:30|31)(?:\.|$)/.test(node.version||''))node.version=version;
  for(const pod of state.pods||[]){
    if(pod.status==='ErrImagePull'){pod.status='ImagePullBackOff';pod.ready='0/1';pod.lastState='Waiting: ImagePullBackOff';}
    else if(pod.status==='Pending'||pod.status==='ContainerCreating'){
      if(/missing|notfound|does-not-exist/i.test(pod.image||'')){pod.status='ImagePullBackOff';pod.ready='0/1';pod.lastState='Waiting: ImagePullBackOff';}
      else if(/broken|crash/i.test(pod.image||'')){pod.status='CrashLoopBackOff';pod.ready='0/1';pod.restarts=Math.max(1,pod.restarts||0);pod.lastState='Terminated: Error (exit code 1)';}
      else{pod.status='Running';pod.ready='1/1';if(!pod.ip||pod.ip==='<none>')pod.ip='10.244.1.'+(state.nextIp++);}
    }
  }
  for(const deployment of state.deployments||[]){
    const owned=(state.pods||[]).filter(pod=>pod.namespace===deployment.namespace&&(pod.owner===deployment.name||(!pod.owner&&pod.name.startsWith(deployment.name+'-'))));
    for(let index=owned.length;index<(deployment.replicas||1);index+=1){const name=deployment.name+'-'+Math.random().toString(36).slice(2,10);state.pods.push({name,namespace:deployment.namespace||'default',image:deployment.image||'nginx:latest',status:'Running',ready:'1/1',restarts:0,node:'worker-1',ip:'10.244.1.'+(state.nextIp++),owner:deployment.name,labels:deployment.selector||{app:deployment.name},createdAt:Date.now(),lastState:''});state.events.push({reason:'SuccessfulCreate',object:'replicaset/'+deployment.name,message:'Created pod '+name+' while recovering desired state'});}
  }
  return state;
};
const postKubernetesState=(generation,reason='reconcile')=>{
  if(!kubernetesSession||generation!==kubernetesGeneration)return;
  self.postMessage(createWorkerEvent('kubernetes.state',{reason,state:clone(kubernetesSession.k8s)}));
};
const containerBaseFs=host=>virtualFs.createDirectory({etc:virtualFs.createDirectory({hostname:virtualFs.createFile(host)}),tmp:virtualFs.createDirectory({}, {mode:'rwxrwxrwt'}),root:virtualFs.createDirectory({}),var:virtualFs.createDirectory({log:virtualFs.createDirectory({})})});

const createKubernetesContext=(payload={})=>{
  if(!kubernetesSession)throw new Error('Kubernetes no está inicializado en el Worker');
  if(payload.fs)kubernetesSession.fs=payload.fs;
  if(Array.isArray(payload.cwd))kubernetesSession.cwd=payload.cwd;
  if(payload.currentUser)kubernetesSession.currentUser=payload.currentUser;
  if(payload.system)kubernetesSession.system=payload.system;
  const generation=kubernetesGeneration,outputs=[],effects=[],pending=[];
  let status=0,commands;
  const output=(fd,text,color='')=>{outputs.push({fd,text:text==null?'':String(text),color});if(fd===2&&status===0)status=1;};
  const io={out:(text,color)=>output(1,text,color),outMany:(lines,color)=>(lines||[]).forEach(line=>output(1,line,color)),err:(text,code=1)=>{status=code;output(2,text,'#ef8a7a');},ok:text=>output(1,text,'#8fa876')};
  const norm=value=>virtualFs.normalizeVirtualPath(value,kubernetesSession.cwd,['root']);
  const dispatch=command=>{
    const parts=String(command).trim().match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g)||[];
    const name=(parts.shift()||'').replace(/^['"]|['"]$/g,'');
    const args=parts.map(part=>part.replace(/^(['"])(.*)\1$/,'$2'));
    if(commands&&typeof commands[name]==='function')commands[name]({name,args,cmd:command});
    else effects.push({type:'dispatch',command});
  };
  const save=()=>postKubernetesState(generation);
  const runCommandSeq=(lines,callback)=>{
    pending.push(new Promise(resolve=>{let index=0;const step=()=>{if(generation!==kubernetesGeneration){resolve();return;}if(index>=lines.length){callback?.();resolve();return;}output(1,lines[index++]);setTimeout(step,70);};step();}));
  };
  const context={state:{k8s:kubernetesSession.k8s},io,getNode:segments=>virtualFs.resolveVirtualNode(kubernetesSession.fs,segments),fs:{norm,getParent:segments=>virtualFs.resolveVirtualParent(kubernetesSession.fs,segments),file:virtualFs.createFile},system:kubernetesSession.system,helpers:{kubernetes:{containerBaseFs,eventAdd:(source,type,message,data)=>effects.push({type:'timeline',source,eventType:type,message,data:data||{}}),save,dispatch,runCommandSeq,editorEnter:(editor,path)=>effects.push({type:'editor',editor,path}),enterContainerShell:(name,image,kind)=>effects.push({type:'container-shell',name,image,kind}),executeContainerCommand:(pod,args)=>effects.push({type:'container-command',pod:pod.name,args}),getCurrentUser:()=>kubernetesSession.currentUser}}};
  commands=kubernetesRuntime.createCommands(context)||{};
  return {commands,outputs,effects,pending,get status(){return status;}};
};

const initializeKubernetes=async payload=>{
  await loadKubernetesEngine();
  kubernetesGeneration+=1;
  const system=clone(payload.system||{});
  kubernetesSession={k8s:repairKubernetesState(clone(payload.state),system.K8S_FULL),fs:clone(payload.fs),cwd:Array.isArray(payload.cwd)?payload.cwd.slice():['root'],currentUser:payload.currentUser||'root',system};
  return {state:clone(kubernetesSession.k8s),generation:kubernetesGeneration};
};

const executeKubernetes=async payload=>{
  const context=createKubernetesContext(payload),command=context.commands[payload.name];
  if(typeof command!=='function')throw new Error('Comando Kubernetes no soportado: '+payload.name);
  command({name:payload.name,args:payload.args||[],cmd:payload.cmd||''});
  if(context.pending.length)await Promise.all(context.pending);
  return {state:clone(kubernetesSession.k8s),fs:clone(kubernetesSession.fs),outputs:context.outputs,effects:context.effects,status:context.status};
};

const rebootKubernetes=()=>{
  if(!kubernetesSession)throw new Error('Kubernetes no está inicializado en el Worker');
  const generation=kubernetesGeneration;
  for(const pod of kubernetesSession.k8s.pods||[]){if(pod.status==='CrashLoopBackOff')continue;pod.status='Pending';pod.ready='0/1';setTimeout(()=>{if(!kubernetesSession||generation!==kubernetesGeneration)return;pod.status='Running';pod.ready='1/1';kubernetesSession.k8s.events.push({reason:'Started',object:'pod/'+pod.name,message:'Started container '+pod.name});postKubernetesState(generation,'reboot-reconcile');},900);}
  postKubernetesState(generation,'reboot');
  return {state:clone(kubernetesSession.k8s)};
};

const recoverKubernetesKubelet=nodeName=>{
  if(!kubernetesSession)throw new Error('Kubernetes no está inicializado en el Worker');
  const node=(kubernetesSession.k8s.nodes||[]).find(item=>item.name===nodeName);
  if(!node)throw new Error('Nodo Kubernetes no encontrado: '+nodeName);
  node.status='Ready';
  if(!kubernetesSession.k8s.actions.includes('restart-kubelet'))kubernetesSession.k8s.actions.push('restart-kubelet');
  kubernetesSession.k8s.events.push({reason:'NodeReady',object:'node/'+node.name,message:'Node '+node.name+' status is now: NodeReady'});
  postKubernetesState(kubernetesGeneration,'kubelet-recovered');
  return {state:clone(kubernetesSession.k8s)};
};

const initializeDocker=async payload=>{
  await loadDockerEngine();
  dockerSession=dockerRuntime.repairDockerState(clone(payload.state||{}));
  return {state:clone(dockerSession)};
};

const executeDocker=async payload=>{
  if(!dockerSession)throw new Error('Docker no está inicializado en el Worker');
  if(payload.fs)dockerSession.fs=clone(payload.fs);
  if(Array.isArray(payload.cwd))dockerSession.cwd=payload.cwd.slice();
  if(payload.currentUser)dockerSession.currentUser=payload.currentUser;
  if(payload.services)dockerSession.services=clone(payload.services);
  if(payload.env)dockerSession.env=clone(payload.env);
  const result=await dockerRuntime.executeDockerCommand(dockerSession,payload);
  dockerSession=result.state;
  return result;
};

self.addEventListener('message',async event=>{
  const request=event.data;if(!isWorkerEnvelope(request))return;
  try{
    let result;
    if(request.operation===WORKER_OPERATIONS.READY)result={ready:true};
    else if(request.operation===WORKER_OPERATIONS.SHELL_ANALYZE)result=analyzeShellInput(request.payload.source);
    else if(request.operation===WORKER_OPERATIONS.SHELL_REDIRECTIONS)result=parseRedirections(request.payload.source);
    else if(request.operation===WORKER_OPERATIONS.COMMAND_VALIDATE)result=validateCommandInvocation(request.payload.mode,request.payload.name,request.payload.args||[]);
    else if(request.operation===WORKER_OPERATIONS.DOCKER_INIT)result=await initializeDocker(request.payload);
    else if(request.operation===WORKER_OPERATIONS.DOCKER_EXECUTE)result=await executeDocker(request.payload);
    else if(request.operation===WORKER_OPERATIONS.KUBERNETES_INIT)result=await initializeKubernetes(request.payload);
    else if(request.operation===WORKER_OPERATIONS.KUBERNETES_EXECUTE)result=await executeKubernetes(request.payload);
    else if(request.operation===WORKER_OPERATIONS.KUBERNETES_REBOOT)result=rebootKubernetes();
    else if(request.operation===WORKER_OPERATIONS.KUBERNETES_KUBELET_RECOVER)result=recoverKubernetesKubelet(request.payload.node);
    else throw new Error('Operación del Worker no soportada: '+request.operation);
    self.postMessage(createWorkerResponse(request.id,result));
  }catch(error){self.postMessage(createWorkerFailure(request.id,error));}
});
