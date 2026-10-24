import {EJERCICIOS_INICIALES} from './ejercicios-iniciales.mjs?v=20261020-aprendizaje';
import {EJERCICIOS_INTERMEDIOS} from './ejercicios-intermedios.mjs?v=20261020-aprendizaje';
import {EJERCICIOS_ACCESO} from './ejercicios-acceso.mjs?v=d5f8b79c9654a632';
import {EJERCICIOS_ALMACENAMIENTO} from './ejercicios-almacenamiento.mjs?v=4f9ebf1eaf2f80be';
import {EJERCICIOS_CONTROLADORES} from './ejercicios-controladores.mjs?v=61dc17ffde6c1b3c';
import {EJERCICIOS_INGRESS} from './ejercicios-ingress.mjs?v=c59792058a3610b1';
import {EJERCICIOS_SCHEDULING} from './ejercicios-scheduling.mjs?v=9949a7fb81edc087';
import {EJERCICIOS_RED} from './ejercicios-red.mjs?v=ff23ed3a419127b5';
import {EJERCICIOS_DNS} from './ejercicios-dns.mjs?v=e4f7dacc1a978183';
import {EJERCICIOS_GATEWAY} from './ejercicios-gateway.mjs?v=89c47e64947ff7a4';
import {EJERCICIOS_ADMINISTRACION} from './ejercicios-administracion.mjs?v=1ad7c4fe10eb6232';
import {EJERCICIOS_CICLO_CLUSTER} from './ejercicios-ciclo-cluster.mjs?v=62884d43e9210e4b';
import {EJERCICIOS_AVANZADOS} from './ejercicios-avanzados.mjs?v=59a2bd662748e29e';
import {exigirJSON} from './comprobaciones-json.mjs';
import {API} from './herramientas-practicas.mjs';
import {claseDisponible} from './disponibilidad-curso.mjs?v=282d3b448ddaff9a';
import {EJERCICIOS_APRENDER} from './ejercicios-aprender.mjs';
import {EJERCICIOS_PROGRESIVOS,CKA_EXAM_PRACTICE} from './ejercicios-progresivos.mjs';
export const EJERCICIOS=Object.freeze({
 inicial:EJERCICIOS_INICIALES,
 intermedio:[
  ...EJERCICIOS_INTERMEDIOS,
  ...EJERCICIOS_ACCESO,
  ...EJERCICIOS_ALMACENAMIENTO,
  ...EJERCICIOS_CONTROLADORES,
  ...EJERCICIOS_INGRESS,
  ...EJERCICIOS_SCHEDULING,
  ...EJERCICIOS_RED,
  ...EJERCICIOS_DNS,
  ...EJERCICIOS_GATEWAY
 ],
 avanzado:Object.freeze([...EJERCICIOS_ADMINISTRACION,...EJERCICIOS_CICLO_CLUSTER,...EJERCICIOS_AVANZADOS])
});
const classForLegacy={seleccion:19};
export function ejerciciosNivel(level){
 if(!Object.hasOwn(EJERCICIOS,level))throw Error('Prácticas de nivel desconocido');
 // Los candidatos avanzados ya incluyen su corrector y su preflight. No
 // envolverlos de nuevo ni convertir el diagnóstico de API en una consulta API.
 return level==='inicial'?EJERCICIOS_INICIALES:level==='avanzado'?EJERCICIOS.avanzado:EJERCICIOS[level].map(task=>({...task,preflight:task.preflight||API,check:exigirJSON(task.check),classNumber:task.classNumber??classForLegacy[task.id]}));
}
const topicById={'c01-a':'Laboratorio · I','c01-b':'Laboratorio · II','c02-a':'Pods · I','c02-b':'Pods · II','c03-a':'ReplicaSet · I','c03-b':'ReplicaSet · II','c04-inicio':'Deployment · I','c04-a':'Deployment · II','c04-b':'Actualizar un Deployment · II','c05-a':'Services · I','c05-b':'Services · II','c06-inicio':'Namespaces · I','c06-a':'Namespaces · II','c06-b':'Aislamiento por namespace · II','c07-inicio':'Requests y limits · I','c07-a':'Requests y limits · II','c07-b':'Corregir recursos · II','c08-inicio':'ResourceQuota · I','c08-a':'LimitRange · II','c08-b':'ResourceQuota · II','c09-inicio':'Readiness · I','c09-a':'Readiness · II','c09-b':'Liveness · II','c10-inicio':'ConfigMap · I','c10-a':'ConfigMap · II','c10-b':'ConfigMap como archivo · II','c11-inicio':'Secret · I','c11-a':'Secret · II','c11-b':'Secret como archivo · II'};
export function ejerciciosClase(number){return number!==0&&claseDisponible(number)?[...EJERCICIOS_APRENDER,...EJERCICIOS_PROGRESIVOS,...['inicial','intermedio','avanzado'].flatMap(ejerciciosNivel)].filter(task=>task.classNumber===number).map(task=>({...task,title:topicById[task.id]||task.title})):[];}
export function ejerciciosExamen(level){return CKA_EXAM_PRACTICE.filter(task=>task.level===level).map(task=>({...task,practiceExam:true,check:exigirJSON(task.check)}));}
