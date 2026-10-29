// One calendar date, one published release. Later changes extend its notes.
export function validarHistorialProyecto(data){
 const versions=data?.versiones;
 if(!/^\d+\.\d+$/.test(data?.version)||!Array.isArray(versions)||versions[0]?.version!==data.version)throw Error('Versión de proyecto incoherente');
 const ids=new Set(),dates=new Set();
 for(const item of versions){
  if(!/^\d+\.\d+$/.test(item.version)||!/^\d{4}-\d{2}-\d{2}$/.test(item.fecha)||!item.resumen?.trim()||!item.cambios?.length||item.cambios.some(text=>typeof text!=='string'||!text.trim()))throw Error('Faltan el resumen o las notas de una versión');
  if(ids.has(item.version))throw Error('Hay versiones duplicadas');
  if(dates.has(item.fecha))throw Error('Solo se permite una versión por día. Añade los cambios a las notas de '+item.fecha+'.');
  ids.add(item.version);dates.add(item.fecha);
 }
 const aliases=data.versionesAgrupadas??{};
 if(!aliases||Array.isArray(aliases)||typeof aliases!=='object')throw Error('Enlaces antiguos de versiones no válidos');
 for(const [from,to]of Object.entries(aliases))if(!/^\d+\.\d+$/.test(from)||!dates.has(to))throw Error('Destino de notas agrupadas no válido');
 return data;
}
