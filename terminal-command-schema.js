// Esquemas declarativos de sintaxis. Se mantienen fuera del motor para poder
// probar opciones y argumentos sin arrancar la interfaz de la terminal.
const failure = (message, status = 2) => ({ ok: false, message, status });
const success = (args) => ({ ok: true, args });

const missingValue = (command, flag) => failure(`${command}: la opción «${flag}» requiere un argumento`);
const unknownOption = (command, flag) => failure(`${command}: opción no reconocida «${flag}»`);

function validateSimpleFlags(command, args, { short = '', long = new Set(), values = new Set() } = {}) {
  const normalized = [];
  for (let index = 0; index < args.length; index += 1) {
    const value = args[index];
    if (value === '--') { normalized.push(...args.slice(index)); break; }
    if (!value.startsWith('-') || value === '-') { normalized.push(value); continue; }
    const equal = value.indexOf('=');
    const flag = equal === -1 ? value : value.slice(0, equal);
    if (flag.startsWith('--')) {
      if (!long.has(flag) && !values.has(flag)) return unknownOption(command, flag);
      normalized.push(value);
      if (values.has(flag) && equal === -1) {
        if (index + 1 >= args.length || args[index + 1].startsWith('-')) return missingValue(command, flag);
        normalized.push(args[++index]);
      }
      continue;
    }
    if (values.has(flag)) {
      normalized.push(flag);
      if (index + 1 >= args.length) return missingValue(command, flag);
      normalized.push(args[++index]);
      continue;
    }
    const invalid = [...value.slice(1)].find(letter => !short.includes(letter));
    if (invalid) return unknownOption(command, `-${invalid}`);
    normalized.push(value);
  }
  return success(normalized);
}

function validateFind(args) {
  const withValue = new Set(['-name', '-user', '-type', '-perm', '-mmin', '-mtime']);
  const standalone = new Set(['-print', '-print0']);
  for (let index = args[0] && !args[0].startsWith('-') ? 1 : 0; index < args.length; index += 1) {
    const token = args[index];
    if (token === '-exec') {
      const end = args.slice(index + 1).findIndex(value => value === ';' || value === '\\;' || value === '+');
      if (end === -1) return failure('find: falta el argumento de cierre «;» o «+» para «-exec»');
      if (end === 0) return missingValue('find', '-exec');
      index += end + 1;
      continue;
    }
    if (standalone.has(token)) continue;
    if (withValue.has(token)) {
      if (index + 1 >= args.length) return missingValue('find', token);
      index += 1;
      continue;
    }
    if (token.startsWith('-')) return failure(`find: predicado desconocido «${token}»`);
    return failure(`find: las rutas deben preceder a la expresión: «${token}»`);
  }
  return success(args);
}

function validateFirewall(args) {
  const standalone = new Set(['--state','--get-default-zone','--get-zones','--get-active-zones','--list-all','--list-services','--list-ports','--reload','--runtime-to-permanent','--permanent','--help']);
  const withValue = new Set(['--add-service','--remove-service','--query-service','--add-port','--remove-port','--set-default-zone']);
  for (let index = 0; index < args.length; index += 1) {
    const token = args[index];
    const equal = token.indexOf('=');
    const flag = equal === -1 ? token : token.slice(0, equal);
    if (standalone.has(flag)) continue;
    if (withValue.has(flag)) {
      if (equal !== -1 && token.slice(equal + 1)) continue;
      if (index + 1 >= args.length || args[index + 1].startsWith('-')) return missingValue('firewall-cmd', flag);
      index += 1;
      continue;
    }
    if (token.startsWith('-')) return failure(`firewall-cmd: error: opción no reconocida: ${token}`);
    return failure(`firewall-cmd: error: argumentos adicionales inesperados: ${token}`);
  }
  return success(args);
}

function validateDocker(args) {
  if (!args.length || ['help','--help','version','--version','info'].includes(args[0])) return success(args);
  const subcommand = args[0];
  if (subcommand === 'ps') {
    const checked = validateSimpleFlags('docker ps', args.slice(1), { short:'aqs', long:new Set(['--all','--quiet','--size','--no-trunc']), values:new Set(['--filter','-f','--format']) });
    return checked.ok ? success([subcommand, ...checked.args]) : checked;
  }
  if (subcommand === 'run') {
    const valueFlags = new Set(['--name','-p','--publish','-v','--volume','--mount','-e','--env','--env-file','--restart','-m','--memory','--memory-reservation','--cpus','--network','--net','-w','--workdir','-u','--user','--health-cmd','--health-interval','--health-timeout','--health-retries','--add-host','--device']);
    const booleanFlags = new Set(['--detach','--rm','--interactive','--tty','--privileged','--read-only','--init']);
    let imageFound = false;
    for (let index = 1; index < args.length; index += 1) {
      const token = args[index];
      if (imageFound) continue;
      if (!token.startsWith('-') || token === '-') { imageFound = true; continue; }
      if (/^-[dit]+$/.test(token)) continue;
      const equal = token.indexOf('=');
      const flag = equal === -1 ? token : token.slice(0, equal);
      if (booleanFlags.has(flag)) continue;
      if (valueFlags.has(flag)) {
        if (equal !== -1 && token.slice(equal + 1)) continue;
        if (index + 1 >= args.length || args[index + 1].startsWith('-')) return failure(`flag needs an argument: ${flag}`);
        index += 1;
        continue;
      }
      return failure(`unknown flag: ${flag}`);
    }
    if (!imageFound) return failure('docker: "docker run" requiere al menos 1 argumento');
  }
  return success(args);
}

function validateKubectl(args) {
  if (!args.length || ['help','--help','version','cluster-info','api-resources'].includes(args[0])) return success(args);
  if (!new Set(['get','run','apply','scale','rollout']).has(args[0])) return success(args);
  const valueFlags = new Set(['-n','--namespace','-o','--output','-l','--selector','--field-selector','--sort-by','--image','--restart','--port','--env','--labels','--dry-run','--overrides','-f','--filename','-k','--kustomize','--replicas','--current-replicas','--resource-version','--timeout','--revision','--to-revision']);
  const booleanFlags = new Set(['-A','--all-namespaces','--show-labels','--no-headers','-w','--watch','--command','--rm','-i','--stdin','-t','--tty','--server-side','--force-conflicts','--prune']);
  for (let index = 1; index < args.length; index += 1) {
    const token = args[index];
    if (token === '--') break;
    if (!token.startsWith('-') || token === '-') continue;
    const equal = token.indexOf('=');
    const flag = equal === -1 ? token : token.slice(0, equal);
    if (booleanFlags.has(flag)) continue;
    if (!valueFlags.has(flag)) return failure(`error: unknown flag: ${flag}`);
    if (equal !== -1 && token.slice(equal + 1)) continue;
    if (index + 1 >= args.length || args[index + 1].startsWith('-')) return failure(`error: flag needs an argument: ${flag}`);
    index += 1;
  }
  if (args[0] === 'run' && !args.some(value => value === '--image' || value.startsWith('--image='))) return failure('error: required flag(s) "image" not set');
  if (args[0] === 'scale' && !args.some(value => value === '--replicas' || value.startsWith('--replicas='))) return failure('error: required flag(s) "replicas" not set');
  return success(args);
}
export function validateCommandInvocation(command, args, { mode = '' } = {}) {
  if (command === 'ls') return validateSimpleFlags('ls', args.map(value => value === '--all' ? '-a' : value), { short:'alZ' });
  if (command === 'id') return validateSimpleFlags('id', args, { short:'ugGnr', long:new Set(['--user','--group','--groups','--name','--real']) });
  if (command === 'hostname') return validateSimpleFlags('hostname', args, { short:'fisdy', long:new Set(['--fqdn','--ip-address','--short','--domain','--yp']) });
  if (command === 'date') return validateSimpleFlags('date', args, { short:'Ru', long:new Set(['--rfc-email','--utc','--universal']) });
  if (command === 'ln') return validateSimpleFlags('ln', args, { short:'sfnv', long:new Set(['--symbolic','--force','--no-dereference','--verbose']) });
  if (command === 'find') return validateFind(args);
  if (command === 'firewall-cmd') return validateFirewall(args);
  if ((command === 'docker' && mode === 'docker') || command === 'podman') return validateDocker(args);
  if (command === 'kubectl' && mode === 'kubernetes') return validateKubectl(args);
  return success(args);
}

export const commandValidationCoverage = Object.freeze({
  common:['ls','id','hostname','date','ln','find'], linux:['firewall-cmd'], docker:['docker ps','docker run'], kubernetes:['kubectl get','kubectl run','kubectl apply','kubectl scale','kubectl rollout']
});
