import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ALL_DISPATCH_COMMANDS, RUNTIME_COMMANDS, SAFE_COMMANDS, INTERACTIVE_COMMANDS, SESSION_COMMANDS } from './e2e/command-matrix.mjs';

const core = await readFile(new URL('../terminal-core.js', import.meta.url), 'utf8');
const docker = await readFile(new URL('../terminal-runtime-docker.js', import.meta.url), 'utf8');
const kubernetes = await readFile(new URL('../terminal-runtime-kubernetes.js', import.meta.url), 'utf8');
const start = core.indexOf('switch(name){', 190000);
const end = core.indexOf('\n        default:', start);
assert.ok(start > 0 && end > start, 'No se pudo localizar el despachador principal');
const discovered = [...new Set([...core.slice(start,end).matchAll(/case\s+'([^']+)'/g)].map(match=>match[1]))].sort();
assert.deepEqual(discovered, [...ALL_DISPATCH_COMMANDS].sort(), 'Hay comandos del motor sin inventariar o comandos retirados que siguen en la matriz');

const covered = new Set([...SAFE_COMMANDS, ...INTERACTIVE_COMMANDS, ...SESSION_COMMANDS]);
assert.deepEqual([...ALL_DISPATCH_COMMANDS].filter(name=>!covered.has(name)), [], 'Hay comandos principales sin estrategia de prueba');

for (const name of RUNTIME_COMMANDS) {
  assert.ok(new RegExp('\\b'+name+'\\\\?\\(\\{args\\}\\)').test(kubernetes) || kubernetes.includes(name+'({args})'), 'Falta el runtime de '+name);
}
assert.ok(!/dockerd\(\{args\}\)/.test(docker), 'Docker no debe volver a depender de un comando dockerd simulado');
console.log('terminal command coverage: '+(ALL_DISPATCH_COMMANDS.length+RUNTIME_COMMANDS.length)+' comandos inventariados');
