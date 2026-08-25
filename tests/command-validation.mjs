import assert from 'node:assert/strict';
import { commandValidationCoverage, validateCommandInvocation } from '../terminal-command-schema.js';

const accepted = [
  ['ls', ['-la', '/etc'], 'linux'],
  ['find', ['/var', '-name', '*.log', '-mtime', '-1'], 'linux'],
  ['find', ['/tmp', '-exec', 'rm', '{}', ';'], 'linux'],
  ['firewall-cmd', ['--add-service=http', '--permanent'], 'linux'],
  ['docker', ['ps', '--all', '--filter', 'status=exited'], 'docker'],
  ['docker', ['run', '-d', '--name', 'web', '-p', '8080:80', '-p', '8443:443', 'nginx'], 'docker'],
  ['kubectl', ['get', 'pods', '-A', '-o', 'wide'], 'kubernetes'],
  ['kubectl', ['run', 'web', '--image=nginx'], 'kubernetes'],
  ['kubectl', ['apply', '-f', 'app.yaml', '--server-side'], 'kubernetes'],
  ['kubectl', ['scale', 'deployment/web', '--replicas=3'], 'kubernetes'],
  ['kubectl', ['rollout', 'status', 'deployment/web', '--timeout=30s'], 'kubernetes'],
];

const rejected = [
  ['ls', ['--inventada'], 'linux', /opción no reconocida/],
  ['find', ['/var', '-inventado', 'x'], 'linux', /predicado desconocido/],
  ['find', ['/tmp', '-name'], 'linux', /requiere un argumento/],
  ['find', ['/tmp', '-exec', 'rm', '{}'], 'linux', /cierre/],
  ['firewall-cmd', ['--add-service'], 'linux', /requiere un argumento/],
  ['firewall-cmd', ['--inventada'], 'linux', /opción no reconocida/],
  ['docker', ['ps', '--inventada'], 'docker', /opción no reconocida/],
  ['docker', ['run', '--name'], 'docker', /flag needs an argument/],
  ['docker', ['run', '--inventada', 'nginx'], 'docker', /unknown flag/],
  ['docker', ['run', '-d'], 'docker', /requiere al menos 1 argumento/],
  ['kubectl', ['get', 'pods', '--inventada'], 'kubernetes', /unknown flag/],
  ['kubectl', ['get', 'pods', '-o'], 'kubernetes', /needs an argument/],
  ['kubectl', ['run', 'web'], 'kubernetes', /image/],
  ['kubectl', ['scale', 'deployment/web'], 'kubernetes', /replicas/],
  ['kubectl', ['apply', '-f'], 'kubernetes', /needs an argument/],
];

for (const [command, args, mode] of accepted) {
  const result = validateCommandInvocation(command, args, { mode });
  assert.equal(result.ok, true, `${command} ${args.join(' ')} debería aceptarse: ${result.message || ''}`);
}

for (const [command, args, mode, message] of rejected) {
  const result = validateCommandInvocation(command, args, { mode });
  assert.equal(result.ok, false, `${command} ${args.join(' ')} debería rechazarse`);
  assert.equal(result.status, 2, 'Los errores de uso deben devolver estado 2');
  assert.match(result.message, message);
}

assert.deepEqual(commandValidationCoverage.common, ['ls','id','hostname','date','ln','find']);
assert.ok(commandValidationCoverage.docker.includes('docker run'));
assert.ok(commandValidationCoverage.kubernetes.includes('kubectl rollout'));
console.log(`command validation: ${accepted.length} casos válidos y ${rejected.length} negativos superados`);
