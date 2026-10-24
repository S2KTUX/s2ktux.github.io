import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {studentSolution} from '../laboratorios/student-solutions.mjs';
import {solutionsFor} from '../laboratorios/solution-options.mjs';
import {exercises} from '../laboratorios/linux-real/v86-exercises.mjs';
import {examQuestions} from '../laboratorios/linux-real/v86-exam-data.mjs';
import {practiceAccountsCommand} from '../laboratorios/linux-real/v86-guest-console.mjs';
import {practiceFeedback} from '../laboratorios/practice-feedback.mjs';
import {validarHistorialProyecto} from '../scripts/project-versions.mjs';
const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const project=JSON.parse(read('contenido/proyecto.json')),about=read('sobre.html');
assert.match(project.version,/^\d+\.\d+$/);assert.equal(project.versiones[0].version,project.version);
assert.equal(validarHistorialProyecto(project),project);
assert.equal(new Set(project.versiones.map(item=>item.fecha)).size,project.versiones.length);
for(const [fecha,version]of [['2026-10-24','2.3'],['2026-10-22','2.2'],['2026-10-21','2.1'],['2026-10-20','2.0'],['2026-10-19','1.0']])assert.equal(project.versiones.find(item=>item.fecha===fecha)?.version,version);
// Old numeric URLs keep their original date even where the number was reused.
assert.equal(project.versionesAgrupadas['2.3'],'2026-10-21');
assert.ok(read('versiones/2026-10-24.html').includes('<h1>Versión 2.3</h1>'));
const duplicate={...project.versiones[0],version:'9.9'};
assert.throws(()=>validarHistorialProyecto({...project,version:'9.9',versiones:[duplicate,...project.versiones]}),/una versión por día/);
assert.throws(()=>validarHistorialProyecto({...project,versionesAgrupadas:{'1.0':'9.9'}}),/Destino/);
for(const [previous,target]of Object.entries(project.versionesAgrupadas||{})){
 const redirect=read(`versiones/${previous}.html`);
 assert.ok(redirect.includes(`http-equiv="refresh" content="0; url=${target}.html"`));
 assert.ok(redirect.includes(`href="../versiones/${target}.html"`));
}
assert.equal(new Set(project.pendientes.map(item=>item.id)).size,project.pendientes.length);
for(const item of project.versiones){
 assert.ok(item.resumen?.trim());
 const notes=read(`versiones/${item.fecha}.html`);
 assert.ok(about.includes(`href="versiones/${item.fecha}.html"`));
 assert.ok(notes.includes(`href="../sobre.html#version-${item.version}"`));
 assert.ok(notes.includes(`https://s2ktux.github.io/versiones/${item.fecha}.html`));
 assert.ok(notes.includes('href="#main-content"'));
 assert.ok(notes.includes('href="../proyectos.html"'));
 for(const change of item.cambios)assert.ok(notes.includes(change.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')));
}
for(const item of project.pendientes){assert.ok(about.includes(item.texto.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;')));assert.ok(read('contenido/pendientes.md').includes(item.texto));}
for(const anchor of ['pendientes','versiones','licencias','privacidad'])assert.ok(about.includes('id="'+anchor+'"'));
assert.doesNotMatch(about,/Quiénes somos|Te leo aquí|Tu progreso en cursos/);
assert.ok(read('AGENTS.md').includes('contenido/proyecto.json'));
assert.ok(read('AGENTS.md').includes('Solo habrá una versión por día'));
const echo=studentSolution({code:"printf 'Primera\\nSegunda\\n' > /root/lineas"});assert.equal(echo.code,"echo 'Primera' > /root/lineas\necho 'Segunda' >> /root/lineas");
const repo=exercises.find(task=>task.sourceId==='sim-03'&&!task.legacyOnly),options=solutionsFor('linux',repo);
assert.equal(options.length,1);assert.equal(options[0].blocks.filter(block=>block.kind==='file').length,1);assert.match(options[0].blocks.find(block=>block.kind==='file').text,/^\[curso-base\]\nname=Curso RPM local\nbaseurl=file:\/\/\/srv\/repos\/lab-base\nenabled=1/m);
for(const task of exercises.filter(task=>!task.legacyOnly)){
 if(task.prepare)assert.match(task.sourceId||task.id,/^(?:nfs|autofs)-(?:i|ii)$/);
 const rendered=solutionsFor('linux',task).flatMap(option=>option.blocks?option.blocks.map(block=>block.text):[option.code]).join('\n');
 assert.doesNotMatch(rendered,/\bprintf\b|\brunuser\b/,'Solución visible demasiado compleja: '+task.id);
}
assert.match(exercises.find(task=>task.id==='fstab-i').solution,/^mkfs.ext4/);assert.doesNotMatch(exercises.find(task=>task.id==='fstab-i').note,/pulsa Preparar/);
assert.match(practiceAccountsCommand(),/s2ktux-practice-v1/);assert.match(practiceAccountsCommand(),/ssh-estudio:practica/);
assert.equal(examQuestions.length,22);
for(const task of examQuestions){const rendered=solutionsFor('linux',task).flatMap(option=>option.blocks?option.blocks.map(block=>block.text):[option.code]).join('\n');assert.doesNotMatch(rendered,/\bprintf\b|\brunuser\b/,'Solución de examen demasiado compleja: '+task.id);}
const state={k8s:{pods:[],deployments:[],configmaps:[],secrets:[]}};
assert.equal(practiceFeedback('kubernetes',{goal:'Crea el Pod herramientas.',solution:'kubectl run herramientas --image=nginx'},state,()=>null),'No existe Pod herramientas en default.');
assert.equal(practiceFeedback('linux',{goal:'Crea /root/dato.txt.'},{},()=>null),'Falta /root/dato.txt.');
for(const path of ['README.md','AGENTS.md','docs/arquitectura.md','_rhcsa/1/1.inc','fixtures/rocky9-reference.json'])assert.equal(existsSync(new URL('../_site/'+path,import.meta.url)),false,'No publicar mantenimiento interno: '+path);
assert.ok(existsSync(new URL('../_site/LICENSE',import.meta.url)));
console.log('Sobre, versiones, pendientes, soluciones sencillas, preparación limitada y limpieza sin perder licencias comprobados.');
