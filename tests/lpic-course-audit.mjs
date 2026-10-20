import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {questions,weights} from '../laboratorios/lpic-1/questions.mjs';
import {courseGaps,courseErrors} from '../scripts/data/lpic-course-audit.mjs';
const report=readFileSync(new URL('../contenido/lpic-1-revision.md',import.meta.url),'utf8');
assert.equal((report.match(/^\| \d+ \| \[/gm)||[]).length,240);
for(const [exam,gaps]of Object.entries(courseGaps))for(const kind of ['missing','partial'])for(const [number,note]of Object.entries(gaps[kind])){
 assert.ok(questions.some(q=>q.exam===exam&&q.sourceIndex===Number(number)));
 assert.ok(report.includes(note));assert.equal(Boolean(gaps.missing[number]&&gaps.partial[number]),false);
}
for(const objective of Object.keys(weights))assert.ok(questions.some(q=>q.objective===objective));
assert.ok(report.includes(Object.keys(weights).length+' objetivos'));
for(const [,,note]of courseErrors)assert.ok(report.includes(note));
assert.match(report,/no se puede afirmar que enseñe todo/);
console.log('LPIC-1: revisión editorial de las 240 preguntas, lagunas diferenciadas y sin promesa de cobertura exhaustiva.');
