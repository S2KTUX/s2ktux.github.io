const scenes=Object.freeze({
 'c28-b':Object.freeze({id:'c28-b',classNumber:28,title:'Restaurar etcd'}),
 'c33-c':Object.freeze({id:'c33-c',classNumber:33,title:'Recuperar el API Server'}),
 'montaje-cluster':Object.freeze({id:'montaje-cluster',classNumber:25,classNumbers:Object.freeze([25,26]),title:'Montar el clúster',manual:true}),
 'ha-cluster':Object.freeze({id:'ha-cluster',classNumber:24,title:'Alta disponibilidad',ha:true})
});
export function escenarioCurso(id,{factoryVersion,level}={}){
 if(id===null||id===undefined||id==='study')return null;
 if(!Object.hasOwn(scenes,id)||!['v13','v14','v15'].includes(factoryVersion)||level!=='avanzado'||(['montaje-cluster','ha-cluster'].includes(id)&&factoryVersion!=='v14'))throw Error('Escenario independiente no admitido para este laboratorio');
 return scenes[id];
}
export function urlEscenarioCurso(href,id){
 const url=new URL(href);if(url.protocol!=='http:'&&url.protocol!=='https:')throw Error('Dirección del laboratorio no válida');
 if(id!==null){const scene=escenarioCurso(id,{factoryVersion:['montaje-cluster','ha-cluster'].includes(id)?'v14':'v13',level:'avanzado'});url.searchParams.set('escenario',scene.id);if(scene.manual||scene.ha)url.searchParams.set('factory','v14');const requested=Number(url.searchParams.get('clase'));url.searchParams.set('clase',String(scene.classNumbers?.includes(requested)?requested:scene.classNumber));}
 else url.searchParams.delete('escenario');
 url.searchParams.set('enter','1');return url.href;
}
export function entornoEjercicio(task,state){
 if(task.environment==='ha-cluster')return state.factoryVersion==='v14'&&state.level==='avanzado'&&state.scenarioIndependent===true&&state.scenarioId==='ha-cluster'&&task.classNumber===24?'ha-cluster':'course';
 if(task.environment==='manual-cluster')return state.factoryVersion==='v14'&&state.level==='avanzado'&&state.scenarioIndependent===true&&state.scenarioId==='montaje-cluster'&&[25,26].includes(task.classNumber)?'manual-cluster':'course';
 if(task.environment==='disposable-cluster')return Object.hasOwn(scenes,task.id)&&['v13','v14','v15'].includes(state.factoryVersion)&&state.level==='avanzado'&&state.scenarioIndependent===true&&state.scenarioId===task.id?'disposable-cluster':'course';
 return task.environment==='three-nodes'&&state.nodeCount===3?'three-nodes':'course';
}
export function clasePermitidaEscenario(number,id){return id==='montaje-cluster'?[25,26].includes(number):!id||scenes[id]?.classNumber===number;}
