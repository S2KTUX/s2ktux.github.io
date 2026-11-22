import fs from 'node:fs';
const access=JSON.parse(fs.readFileSync('qa/evidencia/ha-control-20261122.json'));
const type=process.argv[2]||'snapshot';
const action=type==='run'?{type:'command',id:process.argv[3],command:fs.readFileSync(process.argv[4],'utf8'),timeout:Number(process.env.QA_COMMAND_TIMEOUT||180000)}:type==='stop-node'||type==='run-node'?{type,id:process.argv[3]}:{type};
const response=await fetch(access.origin+'/qa-control',{method:'POST',headers:{authorization:'Bearer '+access.token,'content-type':'application/json'},body:JSON.stringify(action),signal:AbortSignal.timeout(300000)});
const result=await response.json();if(!response.ok)throw Error(result.error||response.status);
if(type==='snapshot'){
 fs.writeFileSync('qa/evidencia/ha-live-20261122.json',JSON.stringify(result,null,2));
 console.log(JSON.stringify({status:result.status,ready:result.ready,errors:result.errors,nodes:result.nodes.map(({id,idle})=>({id,idle}))},null,2));
}else{fs.writeFileSync('qa/evidencia/ha-ultima-orden-20261122.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));if(result?.ok===false)process.exitCode=1;}
