import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {questions,weights} from '../laboratorios/lpic-1/questions.mjs';
import {courseGaps,courseErrors} from '../scripts/data/lpic-course-audit.mjs';
import {courseIntegration,errorEvidence} from '../scripts/data/lpic-course-integration.mjs';
const report=readFileSync(new URL('../contenido/lpic-1-revision.md',import.meta.url),'utf8');
// El generador comprueba la explicación en su sección y rechaza erratas conocidas.
execFileSync(process.execPath,['scripts/build-lpic-audit.mjs'],{cwd:new URL('../',import.meta.url)});
assert.equal(readFileSync(new URL('../contenido/lpic-1-revision.md',import.meta.url),'utf8'),report,'El informe debe estar actualizado');
assert.equal((report.match(/^\| \d+ \| \[/gm)||[]).length,240);
for(const [exam,gaps]of Object.entries(courseGaps))for(const kind of ['missing','partial'])for(const [number,note]of Object.entries(gaps[kind])){
 assert.ok(questions.some(q=>q.exam===exam&&q.sourceIndex===Number(number)));
 assert.ok(report.includes(note));assert.equal(Boolean(gaps.missing[number]&&gaps.partial[number]),false);
 assert.ok(courseIntegration[exam][number]);
}
for(const objective of Object.keys(weights))assert.ok(questions.some(q=>q.objective===objective));
assert.ok(report.includes(Object.keys(weights).length+' objetivos'));
for(const [,,note]of courseErrors)assert.ok(report.includes(note));
assert.equal(Object.values(courseIntegration).reduce((n,rows)=>n+Object.keys(rows).length,0),82);
assert.equal(errorEvidence.length,courseErrors.length);
assert.equal((report.match(/\[Integrado en /g)||[]).length,82);
assert.match(report,/no convierte el banco en cobertura exhaustiva/);
console.log('LPIC-1: 82 detalles integrados con evidencia por sección, 13 erratas corregidas e historial conservado; sin promesa de cobertura exhaustiva.');
