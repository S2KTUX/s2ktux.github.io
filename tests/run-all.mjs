import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const directory = dirname(fileURLToPath(import.meta.url));
const tests = readdirSync(directory)
  .filter(name => name.endsWith('.mjs') && name !== 'run-all.mjs')
  .sort();

const failures = [];
for (const name of tests) {
  console.log(`\n▶ ${name}`);
  const result = spawnSync(process.execPath, [join(directory, name)], { stdio: 'inherit' });
  if (result.status !== 0) failures.push(name);
}

if (failures.length) {
  console.error(`\nFallaron ${failures.length} pruebas: ${failures.join(', ')}`);
  process.exit(1);
}

console.log(`\n✓ Batería completa: ${tests.length}/${tests.length} pruebas superadas`);
