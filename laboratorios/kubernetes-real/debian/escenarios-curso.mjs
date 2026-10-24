const scenes=Object.freeze({
 'c28-b':Object.freeze({id:'c28-b',classNumber:28,title:'Restaurar etcd'}),
 'c33-c':Object.freeze({id:'c33-c',classNumber:33,title:'Recuperar el API Server'})
});
export function escenarioCurso(id,{factoryVersion,level}={}){
 if(id===null||id===undefined||id==='study')return null;
 if(!Object.hasOwn(scenes,id)||factoryVersion!=='v13'||level!=='avanzado')throw Error('Escenario independiente no admitido para este laboratorio');
 return scenes[id];
}
export function urlEscenarioCurso(href,id){
 const url=new URL(href);if(url.protocol!=='http:'&&url.protocol!=='https:')throw Error('Dirección del laboratorio no válida');
 if(id!==null){const scene=escenarioCurso(id,{factoryVersion:'v13',level:'avanzado'});url.searchParams.set('escenario',scene.id);url.searchParams.set('clase',String(scene.classNumber));}
 else url.searchParams.delete('escenario');
 url.searchParams.set('enter','1');return url.href;
}
export function entornoEjercicio(task,state){
 if(task.environment==='disposable-cluster')return Object.hasOwn(scenes,task.id)&&state.factoryVersion==='v13'&&state.level==='avanzado'&&state.scenarioIndependent===true&&state.scenarioId===task.id?'disposable-cluster':'course';
 return task.environment==='three-nodes'&&state.nodeCount===3?'three-nodes':'course';
}
