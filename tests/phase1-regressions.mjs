import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const core = await readFile(new URL('../terminal-core.js', import.meta.url), 'utf8');
const renderer = await readFile(new URL('../terminal-xterm-renderer.js', import.meta.url), 'utf8');

assert.match(core, /validateCommandInvocation/, 'El despachador debe usar el esquema estricto');
assert.match(core, /const scoreChallenge=\(c,r\)=>r&&r\.ok\?100:0/, 'Las prácticas solo puntúan por estado real');
assert.match(core, /t:d\.textContent/, 'El scrollback debe guardarse como texto');
assert.match(core, /d\.textContent=typeof it\.t/, 'El scrollback debe restaurarse como texto');
assert.doesNotMatch(core, /d\.innerHTML=it\.h/, 'No se puede reinyectar HTML del scrollback');
assert.match(core, /permanentServices/, 'firewalld debe separar estado activo y permanente');
assert.match(core, /runtime-to-permanent/, 'firewalld debe convertir estado activo a permanente');
assert.match(core, /type:'symlink'/, 'Los enlaces simbólicos deben tener un nodo propio');
assert.match(core, /typeP==='l'/, 'find debe reconocer enlaces simbólicos');
assert.match(renderer, /screenReaderMode:true/);
assert.match(renderer, /body\.setAttribute\('aria-hidden', 'true'\)/);
assert.match(renderer, /body\.hidden = true/);

console.log('phase 1 regressions: seguridad, causalidad y accesibilidad protegidas');
