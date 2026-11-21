import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
import {abrirEspacioK8s} from './k8s-abrir-espacio.mjs';
import {esperarEquipoLibre} from './k8s-cpu-guard.mjs';
const root=path.resolve('_site'),output=process.env.QA_OUTPUT||'qa/evidencia/k8s-medicion-real-20261121.json';
fs.mkdirSync(path.dirname(output),{recursive:true});
const prior=execFileSync('git',['show','933a2d818db9caed68f79d962d79fa780594402d:laboratorios/kubernetes-real/disco-kubernetes.mjs'],{encoding:'utf8'});
const rows=fs.existsSync(output)?JSON.parse(fs.readFileSync(output)).rows:[];
const save=()=>fs.writeFileSync(output,JSON.stringify({limitation:'Medido bajo carga ajena autorizada. No atribuir pequeñas diferencias de tiempo al cambio. La variante anterior solo sustituye el lector de disco por el publicado; el resto del sitio y los recursos son iguales.',hostBytes:os.totalmem(),rows},null,2));
const server=http.createServer((req,res)=>{
 try{const url=new URL(req.url,'http://localhost');let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(!file.startsWith(root+path.sep))throw Error('Ruta');if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');const ext=path.extname(file),mime={'.html':'text/html','.mjs':'text/javascript','.js':'text/javascript','.css':'text/css','.json':'application/json','.wasm':'application/wasm'};res.writeHead(200,{'content-type':mime[ext]||'application/octet-stream'});fs.createReadStream(file).pipe(res);}catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
async function measure(profile,variant,rep){
 if(rows.some(row=>row.profile===profile&&row.variant===variant&&row.rep===rep&&row.finished))return;
 const cpuBefore=await esperarEquipoLibre(profile+' '+variant+' '+rep);
 const browser=await chromium.launch(),context=await browser.newContext(),p=await context.newPage();
 const row={profile,variant,rep,cpuBefore,browser:browser.version(),phases:[],errors:[],networkBytes:0,slowRequests:[],started:new Date().toISOString()};rows.push(row);save();
 let monitor;
 try{
  if(variant==='anterior')await context.route('**/disco-kubernetes.mjs*',route=>route.fulfill({contentType:'text/javascript',body:prior}));
  p.on('pageerror',error=>row.errors.push(error.message));
  const cdp=await context.newCDPSession(p),requests=new Map();await cdp.send('Network.enable');
  cdp.on('Network.requestWillBeSent',e=>requests.set(e.requestId,{url:e.request.url,timestamp:e.timestamp}));
  cdp.on('Network.loadingFinished',e=>{row.networkBytes+=e.encodedDataLength;const req=requests.get(e.requestId);if(req&&e.timestamp-req.timestamp>10)row.slowRequests.push({...req,seconds:e.timestamp-req.timestamp});});
  cdp.on('Network.loadingFailed',e=>row.errors.push('HTTP '+(requests.get(e.requestId)?.url||'')+' '+e.errorText));
  const url=new URL('/laboratorios/kubernetes-real/debian/multinodo.html',origin);
  for(const [k,v]of Object.entries({mode:'course',level:profile==='ha'?'avanzado':'inicial',factory:profile==='ha'?'v14':'v6',clase:profile==='ha'?'24':'1',tls:'classical','persistent-network':'1',enter:'1',...(profile==='ha'?{escenario:'ha-cluster'}:{})}))url.searchParams.set(k,v);
  row.url=url.href;await p.goto(url.href);await abrirEspacioK8s(p);
  monitor=setInterval(async()=>{try{row.phases.push({at:new Date().toISOString(),...await p.evaluate(()=>({status:document.querySelector('#cluster-status')?.textContent,nodes:globalThis.kubeDebianClusterNodes?.size,ready:globalThis.kubeDebianClusterReady,errors:globalThis.kubeDebianClusterErrors}))});save();console.log(profile,variant,rep,row.phases.at(-1).status);}catch{}},30000);
  const start=performance.now();await p.locator('#start-cluster').click();
  await p.waitForFunction(()=>globalThis.kubeDebianClusterReady===true||globalThis.kubeDebianClusterErrors?.length,null,{timeout:profile==='ha'?2400000:600000});
  const errors=await p.evaluate(()=>globalThis.kubeDebianClusterErrors||[]);if(errors.length)throw Error(errors.join('; '));
  await p.waitForFunction(()=>[...globalThis.kubeDebianClusterNodes.values()].every(n=>n.window.kubeDebianSnapshot?.terminalOpened&&n.window.kubeDebianSnapshot.idle),null,{timeout:180000});
  const count=profile==='ha'?3:1;
  const command=`set -eu; response=$(kubectl get --raw=/readyz --request-timeout=30s); test "$response" = ok; object=$(kubectl get nodes -o json --request-timeout=30s); test -n "$object"; printf '%s\\n' "$object" | jq -e '(.items|length)==${count} and all(.items[];any(.status.conditions[];.type=="Ready" and .status=="True"))'`;
  const result=await p.evaluate(cmd=>kubeDebianClusterCheck('controlplane','Verificar clúster de la medición',cmd,180000),command);row.healthResult=result;if(result?.ok!==true)throw Error('API o nodos no Ready');
  row.readyMs=Math.round(performance.now()-start);row.bytesAtReady=row.networkBytes;row.nodeCount=count;save();
  await p.waitForTimeout(60000);
  const browserCDP=await browser.newBrowserCDPSession(),info=await browserCDP.send('SystemInfo.getProcessInfo');
  const ids=info.processInfo.map(x=>x.id).join(',');
  row.privateBytes=Number(execFileSync('powershell.exe',['-NoProfile','-Command','(Get-Process -Id '+ids+' -ErrorAction SilentlyContinue | Measure-Object PrivateMemorySize64 -Sum).Sum'],{encoding:'utf8'}).trim());
  row.nodes=await p.evaluate(()=>[...kubeDebianClusterNodes.values()].map(n=>({id:n.id,disk:n.window.kubeDebianDisk?.stats,components:n.window.kubeDebianComponentDisk?.stats})));
  row.stillReady=await p.evaluate(()=>globalThis.kubeDebianClusterReady===true);row.ok=row.stillReady&&row.errors.length===0;
 }catch(error){row.error=error.message;row.ok=false;row.diagnostics=await p.evaluate(()=>({status:document.querySelector('#cluster-status')?.textContent,stages:globalThis.kubeDebianClusterStages,nodes:[...(globalThis.kubeDebianClusterNodes?.values()||[])].map(n=>({id:n.id,serial:n.window.kubeDebianTranscript?.slice(-24000)}))})).catch(()=>null);await p.screenshot({path:output.replace('.json','-'+profile+'-'+variant+'-'+rep+'.png')}).catch(()=>{});}
 finally{clearInterval(monitor);row.finished=true;save();await browser.close();console.log('RESULTADO',profile,variant,rep,row.ok,row.readyMs,row.privateBytes,row.error||'');}
}
try{
 const profiles=(process.env.QA_PROFILES||'inicial,ha').split(',');
 if(profiles.includes('inicial'))for(let rep=1;rep<=Number(process.env.QA_REPS||5);rep++)for(const variant of rep%2?['anterior','candidata']:['candidata','anterior'])await measure('inicial',variant,rep);
 if(profiles.includes('ha'))await measure('ha','candidata',1);
}finally{await new Promise(resolve=>server.close(resolve));}
if(rows.some(row=>!row.ok))process.exitCode=1;
