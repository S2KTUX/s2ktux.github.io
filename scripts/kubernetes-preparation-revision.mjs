import {createHash} from 'node:crypto';

// Los enunciados y la presentación no forman parte del estado de la VM.
// Todo módulo nuevo se incluye por defecto: excluirlo exige decidirlo aquí.
const presentationOnly=new Set([
 'debian/entrada-laboratorio.mjs','debian/interfaz-niveles.mjs','debian/bases-publicadas.mjs',
 'debian/clases-curso.mjs','debian/disponibilidad-curso.mjs',
 'debian/herramientas-practicas.mjs','debian/criterios-equivalentes.mjs',
 'debian/comprobaciones-json.mjs','debian/motor-practicas.mjs'
]);
export function revisionPreparacion(files,{policies,materials}){
 if(typeof policies!=='boolean'||typeof materials!=='boolean')throw Error('Preparación sin perfil de componentes');
 const records=files.filter(({path})=>path.endsWith('.mjs')&&!presentationOnly.has(path)&&!/^debian\/ejercicios-[a-z-]+\.mjs$/.test(path)).map(({path,source})=>{
  source=source.replaceAll('\r\n','\n').replace(/\?v=[a-zA-Z0-9-]+(?=['"])/g,'');
  if(path==='debian/multinodo.mjs')source=source.replace(/const cleanRevision='[a-f0-9]+'/g,"const cleanRevision='' ").replace(/const nodeUIRevision='[a-f0-9]+'/g,"const nodeUIRevision='' ");
  return path+'\0'+source;
 }).sort();
 return createHash('sha256').update(JSON.stringify({policies,materials})).update('\0'+records.join('\0')).digest('hex');
}
