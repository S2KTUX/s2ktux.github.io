export const NIVELES=Object.freeze({
 inicial:Object.freeze({name:'Inicial',stage:'inicial',title:'Primeros pasos',number:'01',verb:'Explorar',classes:'01–06',nodes:1,intro:'Pods, réplicas, aplicaciones y servicios. Un nodo para empezar sin complicaciones.',topology:['cka-cp1'],note:''}),
 intermedio:Object.freeze({name:'Intermedio',stage:'intermedia',title:'Aplicaciones y redes',number:'02',verb:'Construir',classes:'07–23',nodes:2,intro:'Recursos, configuración, almacenamiento, permisos, workloads y redes.',topology:['cka-cp1','cka-w1'],note:''}),
 avanzado:Object.freeze({name:'Avanzado',stage:'avanzada',title:'Administración y diagnóstico',number:'03',verb:'Administrar',classes:'24–34',nodes:3,intro:'Control plane, kubeadm, mantenimiento, recuperación y troubleshooting.',topology:['cka-cp1','cka-w1','cka-w2'],note:''})
});
export function comprobarNivel(level){if(!Object.hasOwn(NIVELES,level))throw Error('Nivel de laboratorio desconocido');return level;}
export function nivelDesdeURL(params){return comprobarNivel(params.get('level')||'inicial');}
export function urlNivel(href,level){const url=new URL(href);url.searchParams.set('mode','course');url.searchParams.set('level',comprobarNivel(level));url.searchParams.delete('clase');url.searchParams.delete('policies');url.searchParams.delete('netpol');return url.href;}
// Guardar debe acabar antes de destruir: un fallo nunca descarta la sesión.
export async function cambiarNivel({choice,save,stop,navigate}){
 if(choice==='cancel'||!choice)return false;
 if(!['save','discard'].includes(choice))throw Error('Cambio de modo inválido');
 if(choice==='save')await save();
 await stop();await navigate();return true;
}
