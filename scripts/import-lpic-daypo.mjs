// Conversión mecánica de los dos bancos autorizados; no incorpora código de la plataforma Daypo.
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {reviews} from './data/lpic-daypo-review.mjs';
import {corrections} from './data/lpic-daypo-corrections.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const input=process.argv[2];
if(!input)throw Error('Indica el directorio con daypo-101.json y daypo-102.json. Solo bancos con autorización de reutilización.');
const clean=text=>String(text).replaceAll('\r\n','\n').replace(/[‘’]/g,"'").replace(/[“”]/g,'"').replace(/[–−]/g,'-').trim();
const sha=text=>createHash('sha256').update(text).digest('hex');
const banks=[],questions=[];
const images={
 'daypo-102-093':{src:'/images/lpic-daypo-102-093.jpg',alt:'Salida de dig: QUESTION SECTION contiene www.example.org., IN, NS; la sección de autoridad devuelve un registro SOA de example.org.'},
 'daypo-102-100':{src:'/images/lpic-daypo-102-100.jpg',alt:'Tabla de rutas: default vía 192.168.178.1 por wlan0; 192.168.1.0/24 directa por eth0; 192.168.2.0/24 vía 192.168.1.1 por eth0; 192.168.178.0/24 directa por wlan0.'}
};
for(const exam of ['101','102']){
 const bank=JSON.parse(readFileSync(resolve(input,'daypo-'+exam+'.json'),'utf8'));
 assert.equal(bank.questions.length,120);assert.equal(bank.author,'Deza92');assert.equal(reviews[exam].length,120);
 const classified=new Map(reviews[exam].map(([number,objective,explanation])=>[number,{objective,explanation}]));
 assert.equal(classified.size,120);
 banks.push({exam,url:bank.url,title:bank.title,author:bank.author,testId:bank.testId,count:120,sourceSha256:sha(bank.questions.map(q=>q.xml).join('\n')),permission:'El responsable de S2KTUX confirma disponer de permiso de reutilización; no es una licencia general de Daypo.'});
 for(const source of bank.questions){
  const annotation=classified.get(source.sourceIndex);assert.ok(annotation,source.id);
  assert.equal(Number(annotation.objective.split('.')[0])<105?'101':'102',exam,source.id+': objetivo de otro examen');
  const change=corrections[source.id];
  let type=({0:'single',1:'multiple',2:'written'})[source.type];assert.ok(type,source.id);
  let prompt=clean(source.prompt),choices=source.options.map(clean);
  let answers=type==='written'?[...choices]:[...source.key].flatMap((code,index)=>code==='2'?[index]:[]);
  if(change){
   if(change.prompt)prompt=change.prompt;
   for(const [from,to]of change.replacePrompt||[]){assert.ok(prompt.includes(from),source.id+': falta el texto a corregir');prompt=prompt.replaceAll(from,to);}
   for(const [from,to]of change.replaceChoices||[])choices=choices.map(text=>text.replaceAll(from,to));
   for(const [index,text]of Object.entries(change.choices||{})){assert.ok(Number(index)<choices.length);choices[Number(index)]=text;}
   type=change.type||type;answers=change.answers||answers;
   if(change.removeChoices){const removed=new Set(change.removeChoices);assert.ok(!answers.some(index=>removed.has(index)),source.id);choices=choices.filter((_,index)=>!removed.has(index));answers=answers.map(index=>index-change.removeChoices.filter(value=>value<index).length);}
  }
  // Las rutas de directorio con o sin barra final son equivalentes.
  if(type==='written')answers=[...new Set(answers.flatMap(text=>text.endsWith('/')?[text,text.slice(0,-1)]:[text]))];
  const row={id:source.id,exam,sourceIndex:source.sourceIndex,sourceUrl:bank.url,sourceSha256:sha(source.xml),type,prompt,answers,...annotation,topic:Number(annotation.objective.split('.')[0])};
  if(type!=='written')row.choices=choices;
  if(change)row.correction=change.note;
  if(images[source.id])row.image=images[source.id];
  assert.ok(row.answers.length,source.id);assert.ok(row.prompt.trim());
  if(type==='single')assert.equal(answers.length,1,source.id);
  if(type==='multiple')assert.ok(answers.length>1,source.id);
  if(type!=='written'){assert.equal(source.key.length,source.options.length,source.id);assert.equal(new Set(choices).size,choices.length,source.id);assert.ok(answers.every(i=>Number.isInteger(i)&&i>=0&&i<choices.length),source.id);}
  questions.push(row);
 }
}
assert.equal(questions.length,240);assert.equal(new Set(questions.map(q=>q.id)).size,240);
const header='// Preguntas de Deza92 en Daypo, reutilizadas con autorización confirmada por el responsable de S2KTUX.\n// Sus derechos no quedan sustituidos por la licencia del código o de los apuntes de S2KTUX.\n// Explicaciones y correcciones: S2KTUX. Registro: /contenido/lpic-1-correcciones.md\n';
writeFileSync(resolve(root,'laboratorios/lpic-1/daypo-bank.mjs'),header+'export const bankSources='+JSON.stringify(banks,null,2)+';\nexport const daypoQuestions='+JSON.stringify(questions,null,2)+';\n');
const lines=['# LPIC-1: procedencia y correcciones','','## Procedencia','',...banks.map(bank=>'- ['+bank.title+']('+bank.url+'), de **'+bank.author+'**: '+bank.count+' preguntas.'),'','Reutilización autorizada según confirmación del responsable de S2KTUX el 20/10/2026. No se presentan como preguntas oficiales de LPI ni se incluyen en la licencia general de los apuntes.','',
 'Se conservan los 120 enunciados de cada banco, con los ajustes que se indican abajo. Las explicaciones breves y la clasificación por objetivos son de S2KTUX. La numeración siguiente es la del banco de origen, no la posición aleatoria de la práctica.','',
 '## Normalización de presentación','','Se cambian guiones y comillas tipográficos por sus equivalentes ASCII para que los comandos se puedan copiar. Se conservan los saltos de línea. Las dos imágenes del banco 102 se guardan localmente con su atribución; no se carga código, publicidad ni seguimiento de Daypo.','',
 '## Correcciones y aclaraciones',''];
for(const q of questions.filter(q=>q.correction)){
 lines.push('### '+q.exam+' · pregunta '+q.sourceIndex,'',q.correction,'');
 const reference=corrections[q.id].reference;if(reference)lines.push('[Documentación de referencia]('+reference+').','');
}
lines.push('## Identificación de las copias revisadas','',...banks.map(bank=>'- '+bank.exam+': SHA-256 `'+bank.sourceSha256+'` de los elementos XML de preguntas, en orden de origen.'),'');
writeFileSync(resolve(root,'contenido/lpic-1-correcciones.md'),lines.join('\n'));
console.log('Importadas 120 + 120 preguntas de Deza92; '+questions.filter(q=>q.correction).length+' correcciones y aclaraciones documentadas.');
