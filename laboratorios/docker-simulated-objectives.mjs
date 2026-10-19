import {exercises} from './docker-real/docker-exercises.mjs';
import {simulatedLearningDocker} from './learning-docker.mjs';
const value=text=>String(text||'').trim();
export function simulatedDockerObjectives(ctx,legacy){
 const s=ctx.state,node=path=>ctx.getNode(path.split('/').filter(Boolean)),container=name=>s.containers.find(item=>item.name===name),image=(repo,tag)=>s.images.find(item=>item.repo===repo&&item.tag===tag);
 const running=name=>container(name)?.running&&!container(name).paused;
 const known=new Map([...legacy,...simulatedLearningDocker(ctx)].map(task=>[task.id,task]));
 const conditions={
  'imagen-etiqueta':()=>{const a=image('alpine','3.23'),b=image('practica/alpine','1');return a&&b&&a.id===b.id;},
  'tag-i':()=>{const a=image('alpine','3.23'),b=image('alumno/alpine','1');return a&&b&&a.id===b.id;},
  'image-details-i':()=>{try{const data=JSON.parse(node('/root/imagen-alpine.json')?.content||'[]'),original=image('alpine','3.23');return original&&data.length===1&&data[0].Id==='sha256:'+original.id&&data[0].RepoTags?.includes('alpine:3.23');}catch{return false;}},
  'dos-contenedores':()=>running('primero')&&running('segundo')&&container('primero').image===container('segundo').image,
  'ciclo-limpieza':()=>/^[a-f0-9]{12,64}$/.test(value(node('/root/temporal-id.txt')?.content))&&!container('temporal')&&s.history.some(line=>/^(?:sudo\s+)?docker\s+(?:container\s+)?(?:run|create)\b.*--name[=\s]+["']?temporal["']?(?:\s|$)/.test(line)),
  'inspect-i':()=>{const c=container('web'),text=node('/root/web-contenedores.txt')?.content||'';return c?.running&&text.includes('CONTAINER ID')&&text.split('\n').some(line=>line.startsWith(c.id.slice(0,12))&&/\sweb\s*$/.test(line));},
  'logs-i':()=>{const c=container('saludo-log');return c&&!c.running&&c.exitCode===0&&value(Array.isArray(c.logs)?c.logs.join('\n'):c.logs)==='Hola Docker';},
  'env-i':()=>running('variable')&&container('variable').env?.MENSAJE==='Hola',
  'cpu-i':()=>running('cpu-simple')&&Number(container('cpu-simple').cpus)===0.25,
  'usuario-i':()=>running('sin-root')&&String(container('sin-root').user)==='1000',
  'red-i':()=>running('red-simple')&&!!container('red-simple').networks?.['primera-red']&&s.dockerNetworks.some(network=>network.name==='primera-red'),
  'compose-i':()=>s.containers.some(item=>item.composeProject==='inicio'&&item.composeService==='web'&&item.running),
  'save-i':()=>{try{const archive=JSON.parse(node('/root/alpine.tar')?.content||'');return archive.format==='s2ktux-docker-image'&&archive.image?.repo==='alpine'&&archive.image?.tag==='3.23'&&image('alpine','3.23')?.id===archive.image.id;}catch{return false;}},
  'actualizar-limites':()=>running('ajustable')&&['128m','128M','134217728'].includes(String(container('ajustable').mem))&&Number(container('ajustable').cpus)===0.75&&container('ajustable').restart==='unless-stopped',
 };
 const result=[];
 for(const source of exercises){
  const old=known.get(source.sourceId),condition=conditions[source.sourceId];
  if(!old&&!condition)continue;
  const task={...source,...(old?{goal:old.goal,solution:old.solution}:{}),id:'practica-'+source.id,legacyOnly:false,check:old?.check||(()=>({ok:Boolean(condition()),msg:'Comprueba el resultado indicado en el enunciado.'}))};
  task.goal=task.goal.replaceAll('s2ktux/nginx-lab:2','nginx').replaceAll('s2ktux/registry-lab:2','registry:2');task.solution=task.solution.replaceAll('s2ktux/nginx-lab:2','nginx').replaceAll('s2ktux/registry-lab:2','registry:2');
  delete task.checks;result.push(task);
 }
 return result;
}
