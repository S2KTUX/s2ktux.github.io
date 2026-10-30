import {exigirJSON} from './comprobaciones-json.mjs';
export const IMAGEN='busybox:1.37.0-musl';
export const API='kubectl get --raw=/readyz --request-timeout=20s';
export const q=value=>"'"+value.replaceAll("'","'\\''")+"'";
const readable=new Map();
export function solucionLegible(command){
 for(const [native,display]of readable)command=command.split(native).join(display);
 return command;
}
export function yaml(value,indent=0){
 const pad=' '.repeat(indent);
 if(Array.isArray(value))return value.map(item=>{
  if(item&&typeof item==='object'){if(!Object.keys(item).length)return pad+'- '+(Array.isArray(item)?'[]':'{}');const lines=yaml(item,indent+2).split('\n');lines[0]=pad+'- '+lines[0].trimStart();return lines.join('\n');}
  return pad+'- '+JSON.stringify(item);
 }).join('\n');
 return Object.entries(value).map(([key,item])=>item&&typeof item==='object'?pad+key+':'+(Object.keys(item).length?'\n'+yaml(item,indent+2):Array.isArray(item)?' []':' {}'):pad+key+': '+JSON.stringify(item)).join('\n');
}
export function aplicar(object){
 const command="printf '%s\\n' "+q(JSON.stringify(object))+" | kubectl apply -f -";
 readable.set(command,"kubectl apply -f - <<'EOF'\n"+yaml(object)+'\nEOF');return command;
}
export const contenedor=(command=['sleep','3600'],extra={})=>({name:'app',image:IMAGEN,imagePullPolicy:'Never',command,...extra});
export const http=text=>['sh','-c',"mkdir -p /www; printf '%s\\n' "+q(text)+" >/www/index.html; exec httpd -f -p 8080 -h /www"];
export const pod=(ns,name,extra={})=>({apiVersion:'v1',kind:'Pod',metadata:{name,namespace:ns,labels:{app:name}},spec:{terminationGracePeriodSeconds:1,containers:[contenedor()],...extra}});
export const deployment=(ns,name,container,replicas=1)=>({apiVersion:'apps/v1',kind:'Deployment',metadata:{name,namespace:ns},spec:{replicas,selector:{matchLabels:{app:name}},template:{metadata:{labels:{app:name}},spec:{terminationGracePeriodSeconds:1,containers:[container]}}}});
export const esperarPod=(ns,name)=>'kubectl -n '+ns+' wait --for=condition=Ready pod/'+name+' --timeout=180s';
export const esperarDeployment=(ns,name)=>'kubectl -n '+ns+' rollout status deployment/'+name+' --timeout=180s';
export const obtener=(ns,kind,name,predicate)=>'kubectl -n '+ns+' get '+kind+' '+name+' -o json | jq -e '+q(predicate);
export const listo='any(.status.conditions[]?; .type=="Ready" and .status=="True")';
export const workerReady='kubectl wait --for=condition=Ready node/cka-w1 --timeout=120s';
export function crearPractica(number,letter,title,prompt,solution,check,options={}){
 const id='c'+String(number).padStart(2,'0')+'-'+letter,ns='p'+String(number).padStart(2,'0')+letter;
 let solutionDisplay=solution;for(const [command,display]of readable)solutionDisplay=solutionDisplay.split(command).join(display);
 let alternativeDisplay=options.alternative;for(const [command,display]of readable)if(alternativeDisplay)alternativeDisplay=alternativeDisplay.split(command).join(display);
 return Object.freeze({id,classNumber:number,title,prompt,solution,solutionDisplay,alternativeDisplay,check:exigirJSON(check),preflight:API,validation:'external-report',...options,
  prepare:Object.freeze([API,workerReady,...options.scope==='cluster'?[]:['test -z "$(kubectl get namespace '+ns+' --ignore-not-found -o name)"','kubectl create namespace '+ns,'kubectl -n '+ns+' wait --for=create serviceaccount/default --timeout=90s'],...options.prepare||[]]),
  cleanup:[options.cleanupBefore,options.scope==='cluster'?'':'kubectl delete namespace '+ns+' --ignore-not-found --wait=true --timeout=120s',options.cleanup].filter(Boolean).join('\n')});
}
