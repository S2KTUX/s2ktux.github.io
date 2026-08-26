import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  TERMINAL_LIMITS,
  countKubernetesResources,
  measureVirtualFileSystem,
  trimCollection,
  utf8Bytes,
  validatePaste,
  validateVirtualWrite
} from '../terminal-resource-limits.js';

const fs = {
  type:'dir',
  children:{
    etc:{ type:'dir', children:{ hostname:{ type:'file', content:'nodo-1' } } },
    link:{ type:'symlink', target:'/etc/hostname' }
  }
};
const usage = measureVirtualFileSystem(fs);
assert.deepEqual(usage, { bytes:utf8Bytes('nodo-1')+utf8Bytes('/etc/hostname'), nodes:4, files:1, directories:2, links:1 });
assert.equal(utf8Bytes('á'), 2, 'La cuota debe medir bytes UTF-8, no unidades UTF-16');
assert.equal(validateVirtualWrite(fs, fs.children.etc.children.hostname, 'nuevo').ok, true);
assert.equal(validateVirtualWrite(fs, null, 'x'.repeat(TERMINAL_LIMITS.virtualFileBytes+1)).reason, 'file');

const tiny = { ...TERMINAL_LIMITS, virtualDiskBytes:8, virtualFileBytes:8, virtualFsNodes:4 };
assert.equal(validateVirtualWrite(fs, fs.children.etc.children.hostname, '12345678', 0, tiny).reason, 'disk');
assert.equal(validateVirtualWrite(fs, null, '', 1, tiny).reason, 'nodes');

const cyclic={type:'dir',children:{}};
cyclic.children.self=cyclic;
assert.equal(measureVirtualFileSystem(cyclic).nodes,1,'El medidor iterativo debe tolerar ciclos sin recursión infinita');

const entries=[1,2,3,4];
assert.deepEqual(trimCollection(entries,2),[3,4]);
assert.equal(validatePaste('uno\ndos').ok,true);
assert.equal(validatePaste('x'.repeat(TERMINAL_LIMITS.pasteBytes+1)).reason,'bytes');
assert.equal(validatePaste(Array.from({length:TERMINAL_LIMITS.pasteLines+1},()=> 'x').join('\n')).reason,'lines');

assert.equal(countKubernetesResources({pods:[1,2],deployments:[1],events:[1,2,3]}),3,'Los eventos no cuentan como recursos persistentes');
const core = await readFile(new URL('../terminal-core.js', import.meta.url), 'utf8');
const renderer = await readFile(new URL('../terminal-xterm-renderer.js', import.meta.url), 'utf8');
assert.match(core,/flatStorageMaps/, 'La cuota debe incluir imágenes, contenedores, volúmenes y Pods');
assert.match(core,/virtualWrite\(existing,nextContent/, 'Los editores deben respetar la cuota');
assert.match(core,/virtualWrite\(sink\.node,next/, 'Las redirecciones deben respetar la cuota');
assert.match(renderer,/validatePaste\(clean\)/, 'Los pegados deben validarse antes de entrar en cola');
assert.match(renderer,/xterm-helper-textarea/, 'La entrada real de xterm debe quedar etiquetada');

console.log('✓ Fase 5: cuotas, medidor iterativo, pegados y colecciones');
