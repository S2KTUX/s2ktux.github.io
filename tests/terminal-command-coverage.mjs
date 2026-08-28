import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ALL_DISPATCH_COMMANDS, RUNTIME_COMMANDS, SAFE_COMMANDS, INTERACTIVE_COMMANDS, SESSION_COMMANDS } from './e2e/command-matrix.mjs';

const docker = await readFile(new URL('../terminal-runtime-docker.js', import.meta.url), 'utf8');
const kubernetes = await readFile(new URL('../terminal-runtime-kubernetes.js', import.meta.url), 'utf8');
const kubernetesCommand = await readFile(new URL('../terminal-kubernetes-command.js', import.meta.url), 'utf8');
assert.equal(new Set(ALL_DISPATCH_COMMANDS).size,ALL_DISPATCH_COMMANDS.length,'El inventario de comandos no debe contener duplicados');

const covered = new Set([...SAFE_COMMANDS, ...INTERACTIVE_COMMANDS, ...SESSION_COMMANDS]);
assert.deepEqual([...ALL_DISPATCH_COMMANDS].filter(name=>!covered.has(name)), [], 'Hay comandos principales sin estrategia de prueba');

for (const name of RUNTIME_COMMANDS) {
  const present=name==='kubectl'?/createKubectlCommand/.test(kubernetesCommand):(new RegExp('\\b'+name+'\\\\?\\(\\{args\\}\\)').test(kubernetes)||kubernetes.includes(name+'({args})'));
  assert.ok(present, 'Falta el runtime de '+name);
}
assert.ok(!/dockerd\(\{args\}\)/.test(docker), 'Docker no debe volver a depender de un comando dockerd simulado');
console.log('terminal command coverage: '+(ALL_DISPATCH_COMMANDS.length+RUNTIME_COMMANDS.length)+' comandos inventariados');
