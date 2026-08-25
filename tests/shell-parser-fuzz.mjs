import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { analyzeShellInput, parseRedirections } from '../terminal-shell-parser.js';

const hostileInputs = [
  '', '"', "'", '\\', '$(', '${', '(', '{', '|', '&&', '||',
  'echo >', 'echo 2>', 'echo &>', 'echo >>> archivo',
  'echo "$(printf \">\")" > salida',
  '$('.repeat(256) + ')'.repeat(255),
  '${'.repeat(256) + '}'.repeat(255),
  'echo ' + 'x'.repeat(10_000),
  'echo ' + '>'.repeat(10_000),
  'printf "' + 'a'.repeat(10_000),
  'echo\u0000hola\u001b[31m > fichero',
];

// Generador determinista: si aparece una regresión, el caso siempre se puede
// reproducir con exactamente la misma entrada.
let seed = 0x52_4b_39;
const alphabet = "abcXYZ09 \\|'\"$(){}<>;&\t\n";
const next = () => {
  seed = (Math.imul(seed, 1_664_525) + 1_013_904_223) >>> 0;
  return seed;
};
for (let caseIndex = 0; caseIndex < 750; caseIndex += 1) {
  const length = next() % 512;
  let value = '';
  for (let index = 0; index < length; index += 1) value += alphabet[next() % alphabet.length];
  hostileInputs.push(value);
}

const started = performance.now();
for (const source of hostileInputs) {
  const before = source;
  const analysis = analyzeShellInput(source);
  const parsed = parseRedirections(source);
  assert.equal(source, before, 'El parser no debe modificar la entrada');
  assert.equal(typeof analysis.complete, 'boolean');
  assert.equal(typeof analysis.reason, 'string');
  assert.equal(typeof parsed.command, 'string');
  assert.ok(Array.isArray(parsed.redirections));
  assert.ok(parsed.error === null || typeof parsed.error === 'string');
}
const elapsed = performance.now() - started;

assert.ok(elapsed < 1_500, `El parser tardó ${elapsed.toFixed(1)} ms con entradas hostiles`);
assert.equal(analyzeShellInput('$(('.repeat(2_000)).complete, false);
assert.match(parseRedirections('echo hola >').error, /falta el destino/);

console.log(`shell parser fuzz: ${hostileInputs.length} entradas hostiles en ${elapsed.toFixed(1)} ms`);
