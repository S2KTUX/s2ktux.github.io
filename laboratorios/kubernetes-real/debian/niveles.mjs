export const NIVELES=Object.freeze({
 inicial:Object.freeze({name:'Inicial',title:'Un nodo',number:'01',verb:'Explorar',classes:'00–06',nodes:1,intro:'El control plane también ejecuta las aplicaciones de las primeras clases.',topology:['cka-cp1'],note:''}),
 intermedio:Object.freeze({name:'Intermedio',title:'Control plane + un worker',number:'02',verb:'Construir',classes:'07–23',nodes:2,intro:'Las aplicaciones se ejecutan en el worker. Puedes añadir un segundo cuando lo necesites.',topology:['cka-cp1','cka-w1'],note:''}),
 avanzado:Object.freeze({name:'Avanzado',title:'Control plane + dos workers',number:'03',verb:'Administrar',classes:'24–34',nodes:3,intro:'Tres nodos para practicar administración y diagnóstico del clúster.',topology:['cka-cp1','cka-w1','cka-w2'],note:''})
});
export function comprobarNivel(level){if(!Object.hasOwn(NIVELES,level))throw Error('Nivel de laboratorio desconocido');return level;}
export function nivelDesdeURL(params){return comprobarNivel(params.get('level')||'inicial');}
export function urlNivel(href,level){const url=new URL(href);url.searchParams.set('mode','course');url.searchParams.set('level',comprobarNivel(level));url.searchParams.delete('policies');url.searchParams.delete('netpol');return url.href;}
// Guardar debe acabar antes de destruir: un fallo nunca descarta la sesión.
export async function cambiarNivel({choice,save,stop,navigate}){
 if(choice==='cancel'||!choice)return false;
 if(!['save','discard'].includes(choice))throw Error('Cambio de modo inválido');
 if(choice==='save')await save();
 await stop();await navigate();return true;
}
