import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createGunzip} from 'node:zlib';
import {Readable} from 'node:stream';
import {chromium} from 'playwright';
// Herramienta de construcción, nunca se ejecuta desde la web del alumno.
// Perfil desechable, base limpia verificada, sin consola ni ejercicios.
const dir=process.argv[2]||'qa/evidencia/k8s-base-inicial-supervisor-v2';
fs.mkdirSync(path.dirname(dir),{recursive:true});fs.mkdirSync(dir,{recursive:false});fs.mkdirSync(dir+'/fragmentos');
const originalBytes=Buffer.from(await (await fetch('https://raw.githubusercontent.com/S2KTUX/s2ktux.github.io/d0d77b16ba60a235b02554011e89f4781a23eef0/kubernetes/clean-v1/inicial/cluster.json')).arrayBuffer());
if(createHash('sha256').update(originalBytes).digest('hex')!=='4584e919897107bde2db42addfcdafa09dd2c4968d4562676435ae16a26aa2e7')throw Error('Manifiesto de origen alterado');
const browser=await chromium.launch({executablePath:'C:/Program Files/BraveSoftware/Brave-Browser/Application/brave.exe'});
try{
 const p=await browser.newPage();
 await p.route('**/debian/cliente.mjs*',async route=>{const response=await route.fetch();const original=await response.text();const body=original.replace('globalThis.kubeDebianOpenTerminal=options=>{','globalThis.kubeDebianOpenTerminal=options=>{return;');if(body===original)throw Error('No se pudo mantener cerrada la consola de construcción');await route.fulfill({response,body});});
 await p.exposeFunction('qaWritePart',async(index,base64)=>{const b=Buffer.from(base64,'base64'),sha256=createHash('sha256').update(b).digest('hex'),file=sha256+'.part';fs.writeFileSync(dir+'/fragmentos/'+file,b);return {offset:index*8*1048576,bytes:b.length,sha256,file};});
 await p.goto('https://s2ktux.github.io/laboratorios/kubernetes-real/debian/multinodo.html?mode=course&level=inicial&factory=v6&tls=classical&persistent-network=1&clase=1&enter=1');
 await p.locator('#start-cluster').click();await p.waitForFunction(()=>kubeDebianClusterReady===true,null,{timeout:600000});
 if(!await p.evaluate(()=>kubeDebianCleanBaseUsed&&!kubeDebianClusterRecovered&&[...kubeDebianClusterNodes.values()].every(n=>!n.window.kubeDebianSnapshot.terminalOpened)))throw Error('La construcción exige una preparación limpia antes de abrir la consola');
 const reset=await p.evaluate(()=>kubeDebianClusterCheck('controlplane','QA normalizar supervisor antes de capturar','set -eu; systemctl restart kubelet; sleep 5; systemctl is-active kubelet; crictl ps -a --name kube-apiserver',90000));
 if(!reset?.ok)throw Error('No se pudo normalizar kubelet');
 const samples=[];
 for(let i=0;i<4;i++){
  if(i)await p.waitForTimeout(60000);
  const sample=await p.evaluate(async()=>{const cp=kubeDebianClusterNodes.get('controlplane'),at=cp.window.kubeDebianTranscript.length;const result=await kubeDebianClusterCheck('controlplane','QA confirmar captura limpia',`set -eu; test "$(curl -fsS --max-time 15 --cacert /etc/kubernetes/pki/ca.crt --cert /etc/kubernetes/pki/apiserver-kubelet-client.crt --key /etc/kubernetes/pki/apiserver-kubelet-client.key https://127.0.0.1:6443/readyz)" = ok; crictl ps -a --name kube-apiserver -o json | jq -e '(.containers|length)==1 and all(.containers[];.metadata.attempt==0 and .state=="CONTAINER_RUNNING")'`,60000);return {result,serial:cp.window.kubeDebianTranscript.slice(at)};});
  samples.push(sample);fs.writeFileSync(dir+'/captura.json',JSON.stringify({samples},null,2));if(!sample.result?.ok)throw Error('El API se reinició o dejó de responder');console.log('Captura sana',i);
 }
 const node=await p.evaluate(async()=>{
  const cp=kubeDebianClusterNodes.get('controlplane');
  await kubeDebianClusterCheck('controlplane','QA sincronizar antes de capturar','sync',30000);
  const access=cp.window.kubeDebianSnapshot;access.lock();let state;try{await access.freeze();state=await access.state();}finally{await access.release();}
  const {SesionesClusterDebian}=await import('/laboratorios/kubernetes-real/debian/sesiones-cluster.mjs');
  const record=await new SesionesClusterDebian({workerComponents:'v7',factoryVersion:'v6',progressive:true,level:'inicial'}).packNode('controlplane',state,'',{consumir:true});
  const parts=[];
  for(let offset=0,index=0;offset<record.packed.size;offset+=8*1048576,index++){
   const blob=record.packed.slice(offset,offset+8*1048576);
   const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=()=>reject(reader.error);reader.readAsDataURL(blob);});
   parts.push(await qaWritePart(index,base64));
  }
  const {packed,terminalText,...metadata}=record;return {...metadata,parts};
 });
 await browser.close();
 const original=JSON.parse(originalBytes);
 if(node.identity!==original.nodes[0].identity||JSON.stringify(node.profile)!==JSON.stringify(original.nodes[0].profile))throw Error('La normalización no puede cambiar la identidad ni el perfil del nodo');
 const metadata={...original,nodes:[node]};
 metadata.sha256=createHash('sha256').update(JSON.stringify(metadata.nodes.map(({id,profile,identity,bytes,packedBytes,sha256})=>({id,profile,identity,bytes,packedBytes,sha256})))).digest('hex');
 fs.writeFileSync(dir+'/cluster.json',JSON.stringify(metadata,null,2)+'\n');
 const hash=createHash('sha256');let bytes=0;for(const part of node.parts){const b=fs.readFileSync(dir+'/fragmentos/'+part.file);bytes+=b.length;hash.update(b);}
 if(bytes!==node.packedBytes||hash.digest('hex')!==node.sha256)throw Error('Hash final incorrecto');
 let rawBytes=0;const parts=Readable.from((function*(){for(const part of node.parts)yield fs.readFileSync(dir+'/fragmentos/'+part.file);})());
 for await(const chunk of parts.pipe(createGunzip()))rawBytes+=chunk.length;
 if(rawBytes!==node.bytes)throw Error('Estado descomprimido incompleto');
 console.log(JSON.stringify({dir,packedBytes:bytes,parts:node.parts.length,manifestSha256:createHash('sha256').update(fs.readFileSync(dir+'/cluster.json')).digest('hex')}));
}finally{await browser.close();}
