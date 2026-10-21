// Solo diagnóstico de práctica. No ejecuta comandos ni decide si se aprueba.
export function practiceFeedback(mode,task,state,getNode){
 const goal=task?.goal||'',code=task?.solution||'';
 if(mode==='linux'){
  const expected=task?.fileExpectation;
  if(expected){const node=getNode(expected.path.split('/').filter(Boolean));if(!node)return 'No existe el archivo '+expected.path+'.';if(node.type!=='file')return expected.path+' debe ser un archivo de texto.';if(String(node.content||'').replace(/\n+$/,'')!==expected.value)return 'El contenido de '+expected.path+' no coincide. Debe contener «'+expected.value+'».';}
  const paths=goal.match(/\/(?:root|home|var|srv|opt|datos)\/[a-zA-Z0-9_./-]+/g)||[];
  for(const raw of paths){const path=raw.replace(/[.,;:]+$/,'');if(!getNode(path.split('/').filter(Boolean)))return 'Falta '+path+'.';}
 }
 if(mode==='docker'){
  const name=/--name\s+([a-zA-Z0-9_-]+)/.exec(code)?.[1];
  if(name&&goal.includes(name)&&!state.containers.some(item=>item.name===name))return 'No existe el contenedor '+name+'.';
  for(const [type,items]of [['volume',state.dockerVolumes],['network',state.dockerNetworks]]){
   const name=new RegExp('docker '+type+' create ([a-zA-Z0-9_-]+)').exec(code)?.[1];
   if(name&&goal.includes(name)&&!(items||[]).some(item=>item.name===name))return 'Falta '+(type==='volume'?'el volumen ':'la red ')+name+'.';
  }
 }
 if(mode==='kubernetes'){
  const k=state.k8s;
  for(const [command,key,label]of [['run','pods','Pod'],['create deployment','deployments','Deployment'],['create configmap','configmaps','ConfigMap'],['create secret generic','secrets','Secret']]){
   const match=new RegExp('kubectl(?: -n ([a-zA-Z0-9_-]+))? '+command+' ([a-zA-Z0-9_-]+)').exec(code);
   if(!match||!goal.includes(match[2]))continue;
   const namespace=match[1]||'default',item=k[key].find(item=>item.name===match[2]&&item.namespace===namespace);
   if(!item)return 'No existe '+label+' '+match[2]+' en '+namespace+'.';
   if(key==='pods'&&item.status!=='Running')return 'El Pod '+item.name+' está en '+item.status+'.';
   if(key==='pods'){const path=goal.match(/\/tmp\/[a-zA-Z0-9_.-]+/)?.[0];if(path&&!Object.hasOwn(item.fs||{},path))return 'El Pod existe, pero falta '+path+' dentro del contenedor.';}
  }
 }
 return '';
}

// Presentación del resultado; no ejecuta comandos ni cambia los criterios.
export function renderPracticeResult(root,result,task={}){
 if(typeof result?.ok!=='boolean')throw Error('La comprobación no ha devuelto un resultado válido.');
 const doc=root.ownerDocument,title=doc.createElement('strong');
 title.className='lab-check-title';title.textContent=result.ok?'Ejercicio resuelto.':'Ejercicio incompleto.';
 root.replaceChildren(title);root.setAttribute('role','status');root.setAttribute('aria-live','polite');
 if(!result.ok){
  const list=doc.createElement('ul');list.className='lab-check-list';
  for(const [index,condition]of (result.results||[]).entries()){
   if(condition.ok)continue;
   const detail=task.checkFeedback?.[index];
   if(detail?.dependsOn!==undefined&&result.results[detail.dependsOn]?.ok===false)continue;
   const item=doc.createElement('li'),label=condition.label?.trim();
   item.textContent=detail?.failed||(!label||label==='Resultado solicitado'?task.goal:'Revisa: '+label);
   if(item.textContent)list.append(item);
  }
  if(!list.children.length){const item=doc.createElement('li');item.textContent=result.msg||task.goal||'No se ha recibido el detalle de la comprobación.';list.append(item);}
  root.append(list);
 }
 root.dataset.result=result.ok?'passed':'failed';
}
