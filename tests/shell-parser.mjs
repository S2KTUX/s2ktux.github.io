import assert from 'node:assert/strict';
import { analyzeShellInput, describeDescriptorFlow, joinShellLines, parseRedirections } from '../terminal-shell-parser.js';

const first = parseRedirections('orden > salida.log 2>&1');
assert.equal(first.command, 'orden');
assert.deepEqual(first.redirections.map(r => [r.fd, r.kind, r.target || r.targetFd]), [
  [1, 'file', 'salida.log'],
  [2, 'duplicate', 1],
]);
assert.deepEqual(describeDescriptorFlow(first.redirections), {
  0: 'terminal:stdin',
  1: 'file:salida.log:truncate',
  2: 'file:salida.log:truncate',
});

const second = parseRedirections('orden 2>&1 > salida.log');
assert.deepEqual(describeDescriptorFlow(second.redirections), {
  0: 'terminal:stdin',
  1: 'file:salida.log:truncate',
  2: 'terminal:stdout',
});

const quoted = parseRedirections('printf "a > b" >> "mi salida.log"');
assert.equal(quoted.command, 'printf "a > b"');
assert.equal(quoted.redirections[0].target, 'mi salida.log');
assert.equal(quoted.redirections[0].append, true);

const substitution = parseRedirections('echo $(printf ">") >resultado');
assert.equal(substitution.command, 'echo $(printf ">")');
assert.equal(substitution.redirections[0].target, 'resultado');

const both = parseRedirections('orden &>> todo.log');
assert.deepEqual(describeDescriptorFlow(both.redirections), {
  0: 'terminal:stdin',
  1: 'file:todo.log:append',
  2: 'file:todo.log:append',
});

assert.match(parseRedirections('echo hola >').error, /falta el destino/);

assert.equal(analyzeShellInput('echo "hola').complete, false);
assert.equal(analyzeShellInput("printf '%s\\n' 'hola'").complete, true);
assert.equal(analyzeShellInput('printf hola |').reason, 'operator');
assert.equal(analyzeShellInput('echo uno \\').reason, 'backslash');
assert.equal(analyzeShellInput('echo $(date').reason, 'command-substitution');
assert.equal(analyzeShellInput('echo ${USER').reason, 'parameter-expansion');
assert.equal(analyzeShellInput('sleep 1 &').complete, true);
assert.equal(analyzeShellInput('echo \\|').complete, true);
assert.equal(joinShellLines(['printf "%s\\n" \\', 'hola']), 'printf "%s\\n" hola');
console.log('shell parser: descriptor order and Bash PS2 continuation contracts pass');

