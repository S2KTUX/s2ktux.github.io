import {readFileSync,readdirSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {questions,weights} from '../laboratorios/lpic-1/questions.mjs';
import {courseGaps,courseErrors,bankGaps} from './data/lpic-course-audit.mjs';
import {courseIntegration,errorEvidence,integrationDate,integrationSources} from './data/lpic-course-integration.mjs';

const root=new URL('../',import.meta.url);
const dirs=readdirSync(new URL('cursos/lpic-1/',root)).filter(s=>s.startsWith('tema-'));
const path=topic=>'/cursos/lpic-1/'+dirs.find(s=>s.startsWith('tema-'+topic+'-'))+'/';
const link=section=>path(section.split('.')[0])+'#'+section;
const normalize=s=>s.replace(/<[^>]*>/g,'').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
function sectionText(section){
 const html=readFileSync(new URL(path(section.split('.')[0]).slice(1)+'index.html',root),'utf8');
 const content=html.match(new RegExp('<section id="'+section.replace('.','\\.')+'"[^>]*>([\\s\\S]*?)</section>'));
 if(!content)throw Error('Sección no encontrada: '+section);
 return normalize(content[1]);
}
function verify([section,needle,obsolete]){
 const text=sectionText(section);
 if(!text.includes(normalize(needle)))throw Error('Falta evidencia en '+section+': '+needle);
 if(obsolete&&text.includes(obsolete))throw Error('Errata sin corregir en '+section+': '+obsolete);
}
let integrated=0;
for(const [exam,gaps]of Object.entries(courseGaps)){
 const numbers=Object.keys({...gaps.partial,...gaps.missing});
 if(numbers.length!==Object.keys(courseIntegration[exam]).length)throw Error('Inventario de integración incompleto');
 for(const n of numbers){
  if(!questions.some(q=>q.exam===exam&&q.sourceIndex===Number(n)))throw Error('Pregunta no encontrada');
  if(!courseIntegration[exam][n])throw Error('Laguna sin revisar: '+exam+'/'+n);
  verify(courseIntegration[exam][n]);integrated++;
 }
}
if(courseErrors.length!==errorEvidence.length)throw Error('Inventario de erratas incompleto');
errorEvidence.forEach(verify);

const lines=[
 '# Revisión de LPIC-1: preguntas, curso y examen','',
 'Revisión inicial: 20/10/2026. Integración de las correcciones: '+integrationDate+'. Se contrasta el texto de las clases, no contenido hablado de vídeos que no esté transcrito.','',
 '## Estado actual','',
 'Se han integrado los '+integrated+' detalles que faltaban o estaban explicados parcialmente y se han corregido las '+courseErrors.length+' erratas del inventario inicial. Se mantienen los títulos, el orden y el diseño: las aclaraciones están dentro de las explicaciones, tablas y ejemplos existentes.','',
 'Los conceptos necesarios para las 240 preguntas revisadas tienen ahora explicación en el curso. Esto no convierte el banco en cobertura exhaustiva del examen: los '+Object.keys(weights).length+' objetivos con peso tienen alguna pregunta, pero siguen faltando variantes de práctica. Tampoco se garantiza un aprobado.','',
 'Fuente del alcance: [objetivos oficiales](https://www.lpi.org/our-certifications/exam-101-102-objectives/). Las preguntas proceden de los dos bancos autorizados de Deza92 en Daypo; ver [procedencia y correcciones](lpic-1-correcciones.md). No se han cambiado las preguntas en esta integración.','',
 '## Inventario inicial, conservado para comparar','',
 'Explicado: el texto enseñaba el concepto necesario. Parcial: faltaba una opción, regla o explicación. Falta: no se enseñaba el detalle. Son categorías editoriales de la revisión del 20/10, no una nota ni un porcentaje de preparación. Las lagunas de esta tabla ya están integradas.','',
 '| Tema del curso | Explicado antes | Parcial antes | Faltaba antes |',
 '| --- | ---: | ---: | ---: |'
];
for(const topic of [...new Set(questions.map(q=>q.topic))].sort((a,b)=>a-b)){
 const counts={Explicado:0,Parcial:0,Falta:0};
 for(const q of questions.filter(q=>q.topic===topic))counts[courseGaps[q.exam].missing[q.sourceIndex]?'Falta':courseGaps[q.exam].partial[q.sourceIndex]?'Parcial':'Explicado']++;
 lines.push('| [Tema '+topic+']('+path(topic)+') | '+counts.Explicado+' | '+counts.Parcial+' | '+counts.Falta+' |');
}
lines.push('','## Erratas corregidas','',...courseErrors.map(([topic,section,note])=>'- ['+section+']('+link(section)+'): '+note+' **Corregido.**'),
 '','## Lo que el banco no cubre suficientemente','',...bankGaps.map(s=>'- '+s),
 '','Estas ampliaciones del banco siguen pendientes; no se presentan como disponibles. Las tecnologías antiguas no se eliminan solo por antigüedad si permanecen en los objetivos. «Open relay» es terminología de correo, no una tarea de montar un servidor SMTP en LPIC-1.',
 '','## Revisión pregunta a pregunta','',
 'La numeración es la original de Daypo, no el orden aleatorio de práctica. Se conserva lo detectado antes y se enlaza la explicación integrada; no se incluyen las respuestas del test.');
for(const exam of ['101','102']){
 lines.push('','### Examen '+exam,'','| Pregunta de origen | Objetivo | Antes | Estado actual y observación |','| --- | --- | --- | --- |');
 for(const q of questions.filter(q=>q.exam===exam)){
  const missing=courseGaps[exam].missing[q.sourceIndex],partial=courseGaps[exam].partial[q.sourceIndex],evidence=courseIntegration[exam][q.sourceIndex];
  const current=evidence?'[Integrado en '+evidence[0]+']('+link(evidence[0])+'). Antes: '+(missing||partial):'Explicado. Concepto recogido en el texto del curso.';
  lines.push('| '+q.sourceIndex+' | ['+q.objective+']('+link(q.objective)+') | '+(missing?'Falta':partial?'Parcial':'Explicado')+' | '+current+' |');
 }
}
lines.push('','## Documentación de contraste','',...integrationSources.map(([title,url])=>'- ['+title+']('+url+')'),
 '','## Límite de esta comprobación','',
 'Se revisa el material disponible, no preguntas confidenciales ni la totalidad de posibles variantes del examen. No se promete aprobado ni se considera equivalente el 70 % del simulacro a la escala oficial de LPI.','');
writeFileSync(new URL('contenido/lpic-1-revision.md',root),lines.join('\n'));
console.log('Integrados '+integrated+' detalles y '+courseErrors.length+' erratas: '+fileURLToPath(new URL('contenido/lpic-1-revision.md',root)));
