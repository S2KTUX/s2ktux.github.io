import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { dnfVersionLines } from '../terminal-core-behavior.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const reference = JSON.parse(fs.readFileSync(path.join(root, 'fixtures/rocky9-reference.json'), 'utf8'));
const engine = (await import('../terminal-engine-linux.js')).default;
const core = fs.readFileSync(path.join(root, 'terminal-core.js'), 'utf8');

assert.equal(engine.system.distribution, reference.facts.name);
assert.equal(engine.system.id, reference.facts.id);
assert.equal(engine.system.codename, reference.facts.codename);
assert.equal(engine.system.architecture, reference.facts.architecture);
assert.match(engine.system.release, /^9\./, 'La máquina de RHCSA debe permanecer en la familia Rocky 9');
assert.match(core, /uid=0\(root\) gid=0\(root\)/, 'La identidad de root debe conservar el formato real de id(1)');
assert.match(core, /No existe el fichero o el directorio/, 'Los errores de ficheros deben conservar errno ENOENT localizado');
assert.match(core, /orden no encontrada/, 'Bash debe devolver un error localizado de comando ausente');
assert.equal(engine.system.dnf,reference.facts.dnfVersion,'El motor debe declarar la versión DNF de referencia');
assert.equal(dnfVersionLines(engine.system.dnf,0)[0],reference.facts.dnfVersion,'dnf --version debe emitir la versión EL9 capturada');
assert.match(core, /failed to decode configuration JSON/, 'Un daemon.json inválido debe producir una causa concreta');
assert.match(core, /Failed with result ["']exit-code["']/, 'La misma causa debe propagarse al estado de systemd');
assert.match(core, /journalAdd\(["']systemd["']/, 'La causa también debe quedar registrada en el journal');

console.log('Rocky 9 reference contracts: OK');
