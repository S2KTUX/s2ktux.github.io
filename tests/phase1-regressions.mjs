import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { scoreChallengeResult } from '../terminal-core-behavior.js';

const core = await readFile(new URL('../terminal-core.js', import.meta.url), 'utf8');
const renderer = await readFile(new URL('../terminal-xterm-renderer.js', import.meta.url), 'utf8');

assert.match(core, /validateCommandInvocation/, 'El despachador debe usar el esquema estricto');
assert.equal(scoreChallengeResult({ok:true}),100,'Una práctica validada debe puntuar 100');
assert.equal(scoreChallengeResult({ok:false}),0,'Una práctica fallida no debe puntuar');
assert.equal(scoreChallengeResult(null),0,'La ausencia de resultado no debe puntuar');
assert.match(core, /t:\s*d\.textContent/, 'El scrollback debe guardarse como texto');
assert.match(core, /d\.textContent\s*=\s*typeof it\.t/, 'El scrollback debe restaurarse como texto');
assert.doesNotMatch(core, /d\.innerHTML\s*=\s*it\.h/, 'No se puede reinyectar HTML del scrollback');
assert.match(core, /permanentServices/, 'firewalld debe separar estado activo y permanente');
assert.match(core, /runtime-to-permanent/, 'firewalld debe convertir estado activo a permanente');
assert.match(core, /type:\s*["']symlink["']/, 'Los enlaces simbólicos deben tener un nodo propio');
assert.match(core, /typeP\s*===\s*["']l["']/, 'find debe reconocer enlaces simbólicos');
assert.match(renderer, /screenReaderMode:true/);
assert.match(renderer, /body\.setAttribute\('aria-hidden', 'true'\)/);
assert.match(renderer, /body\.hidden = true/);

console.log('phase 1 regressions: seguridad, causalidad y accesibilidad protegidas');
